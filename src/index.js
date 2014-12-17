var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var _ = require('underscore')

var generateFonts = require('./generateFonts')
var renderCss = require('./renderCss')
var renderHtml = require('./renderHtml')

var DEFAULT_OPTIONS = {
	fontName: 'iconfont',

	templateOptions: {
		baseClass: 'icon',
		classPrefix: 'icon-'
	},

	css: true,
	cssTemplate: path.join(__dirname, '../templates/css.hbs'),
	cssFontsPath: '',

	html: false,
	htmlTemplate: path.join(__dirname, '../templates/html.hbs'),

	types: ['eot', 'woff'],
	order: ['eot', 'woff', 'ttf', 'svg'],

	rename: function(file) {
		return path.basename(file, path.extname(file))
	},
	/**
	 * Unicode Private Use Area start.
	 * http://en.wikipedia.org/wiki/Private_Use_(Unicode)
	 */
	startCodepoint: 0xF101,
	codepoints: {},

	normalize: true
}

var webfont = function(options, done) {
	options = _.defaults(options, DEFAULT_OPTIONS)

	if (options.dest === undefined) return done(new Error('"options.dest" is undefined.'))
	if (options.files === undefined) return done(new Error('"options.files" is undefined.'))

	options.names = _.map(options.files, options.rename)
	if (options.cssDest === undefined) {
		options.cssDest = path.join(options.dest, options.fontName + '.css')
	}
	if (options.htmlDest === undefined) {
		options.htmlDest = path.join(options.dest, options.fontName + '.html')
	}

	//Generates codepoints starting from `options.startCodepoint`,
	//skipping codepoints explicitly specified in `options.codepoints`
	var currentCodepoint = options.startCodepoint
	function getNextCodepoint() {
		while (_.contains(options.codepoints, currentCodepoint)) {
			currentCodepoint++
		}
		return currentCodepoint
	}
	_.each(options.names, function(name) {
		if (!options.codepoints[name]) {
			options.codepoints[name] = getNextCodepoint()
		}
	})

	function writeFile(file, dest) {
		mkdirp.sync(path.dirname(dest))
		fs.writeFileSync(dest, file)
	}

	//TODO output
	generateFonts(options)
		.then(function() {
			if (options.css) {
				var css = renderCss(options)
				writeFile(css, options.cssDest)
			}
			if (options.html) {
				var html = renderHtml(options)
				writeFile(html, options.htmlDest)
			}
			done()
		})
		.fail(function(err) { done(err) })
}


module.exports = webfont
