var fs = require('fs')
var path = require('path')
var _ = require('underscore')
var Q = require('q')
var mkdirp = require('mkdirp')

var svgicons2svgfont = require('svgicons2svgfont')
var svg2ttf = require('svg2ttf')
var ttf2woff = require('ttf2woff')
var ttf2eot = require('ttf2eot')

/**
 * Generators for files of different font types.
 *
 * Generators have following properties:
 * [deps] {array.<string>} Names of font types that will be generated before current
 *		and passed to generator function.
 * fn {function(options, ...depsFonts, done)} Generator function with following arguments:
 *	 options {object} Options passed to `generateFonts` function.
 *	 ...depsFonts Fonts listed in deps.
 *	 done {function(err, font)} Callback that takes error or null and generated font.
 */
var generators = {
	svg: {
		fn: function(options, done) {
			var font = new Buffer(0)
			var svgOptions = _.pick(options,
				'fontName', 'fontHeight', 'descent', 'normalize', 'round'
			)

			var icons = _.map(options.files, function(file, idx) {
				var name = options.names[idx]
				return {
					name: name,
					codepoint: options.codepoints[name],
					stream: fs.createReadStream(file)
				}
			})

			svgOptions.log = function(){}
			svgicons2svgfont(icons, svgOptions)
				.on('data', function(data) {
					font = Buffer.concat([font, data])
				})
				.on('end', function() {
					done(null, font.toString())
				})
		}
	},

	ttf: {
		deps: ['svg'],
		fn: function(options, svgFont, done) {
			var font = svg2ttf(svgFont)
			font = new Buffer(font.buffer)
			done(null, font)
		}
	},

	woff: {
		deps: ['ttf'],
		fn: function(options, ttfFont, done) {
			var font = ttf2woff(new Uint8Array(ttfFont))
			font = new Buffer(font.buffer)
			done(null, font)
		}
	},

	eot: {
		deps: ['ttf'],
		fn: function(options, ttfFont, done) {
			var font = ttf2eot(new Uint8Array(ttfFont))
			font = new Buffer(font.buffer)
			done(null, font)
		}
	}
}

/**
 * @returns Promise
 */
var generateFonts = function(options) {
	var genTasks = {}

	/**
	 * First, creates tasks for dependent font types.
	 * Then creates task for specified font type and chains it to dependencies promises.
	 * If some task already exists, it reuses it.
	 */
	var makeGenTask = function(type) {
		if (genTasks[type]) return genTasks[type]

		var gen = generators[type]
		var depsTasks = _.map(gen.deps, makeGenTask)
		var task = Q.all(depsTasks).then(function(depsFonts) {
			var args = [options].concat(depsFonts)
			return Q.nfapply(gen.fn, args)
		})
		genTasks[type] = task
		return task
	}

	var writeTasks = []

	/** Creates task that writes file to disk after it is generated. */
	var makeWriteTask = function(genTask, type) {
		var task = genTask.then(function(font) {
			var filepath = path.join(options.dest, options.fontName + '.' + type)
			return Q.nfcall(fs.writeFile, filepath, font)
		})
		writeTasks.push(task)
		return task
	}

	mkdirp.sync(options.dest)

	//Create all needed generate and write tasks.
	for (var i in options.types) {
		var type = options.types[i]
		var genTask = makeGenTask(type)
		makeWriteTask(genTask, type)
	}

	return Q.all(writeTasks)
}

module.exports = generateFonts
