var path = require('path')
var _ = require('underscore')

var generateFonts = require('./generateFonts')
var generateCss = require('./generateCss')

var DEFAULT_OPTIONS = {
	fontName: 'iconfont',
	cssTemplate: path.join(__dirname, '../templates/css.hbs'),
	cssTemplateData: {
		baseClass: 'icon',
		classPrefix: 'icon-'
	},
	cssFontsPath: '',
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

	//TODO ensure required options (files, dest, ...?)
	//TODO test that it throws if they are not specified

	options.names = _.map(options.files, options.rename)
	if (options.destCss === undefined) {
		options.destCss = path.join(options.dest, options.fontName + '.css')
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

	//TODO output
	generateFonts(options)
		.then(function() { return generateCss(options) })
		.then(function() { return generateHtml(options) })
		.then(function() { done(null) })
		.fail(function(err) { done(err) })
}



var generateHtml = function(options) {
	return options
	//TODO
}

module.exports = webfont
