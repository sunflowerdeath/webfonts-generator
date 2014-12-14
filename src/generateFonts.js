var fs = require('fs')
var path = require('path')
var _ = require('underscore')
var Q = require('q')
var mkdirp = require('mkdirp')

var svgicons2svgfont = require('svgicons2svgfont')
var svg2ttf = require('svg2ttf')
var ttf2woff = require('ttf2woff')
var ttf2eot = require('ttf2eot')

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

	var makeWriteTask = function(genTask, type) {
		var task = genTask.then(function(font) {
			var filepath = path.join(options.dest, options.fontName + '.' + type)
			return Q.nfcall(fs.writeFile, filepath, font)
		})
		writeTasks.push(task)
		return task
	}

	mkdirp.sync(options.dest)
	for (var i in options.types) {
		var type = options.types[i]
		var genTask = makeGenTask(type)
		makeWriteTask(genTask, type)
	}

	return Q.all(writeTasks)
}

module.exports = generateFonts
