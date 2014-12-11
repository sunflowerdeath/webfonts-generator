var fs = require('fs')
var path = require('path')
var _ = require('underscore')
var mustache = require('mustache')
var mkdirp = require('mkdirp')

var generateFonts = require('generateFonts')

var DEFAULT_OPTIONS = {
	rename: path.basename,

	/**
	 * Unicode Private Use Area start.
	 * http://en.wikipedia.org/wiki/Private_Use_(Unicode)
	 */
	startCodepoint: 0xF101,
	codepoints: {},
	fontName: 'iconfont',
 	
	//TODO
	relativeFontPath: '../images', //template data?
	hashes: false
}

var iconfont = function(options, done) {
	options = _.default(DEFAULT_OPTIONS, options)

	//TODO ensure required options (files, dest, ...?)
	//TODO test that it throws if they are not specified

	options.names = _.map(options.files, options.rename)
	if (!options.destCss) options.destCss = path.join(options.dest, options.fontName + '.css')
	
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

	generateFonts(options, function() {
		generateStyles(options)
		if (options.html) generateHtml(options)
		done()
	})
}

var generateStyles = function(options) {
	var template = fs.readFileSync(options.cssTemplate)
	var ctx = {} //TODO
	var style = mustache.render(template, ctx)
	mkdirp.sync(options.destCss)
	fs.writeFileSync(options.destCss, style)
}

var generateHtml = function(options) {
	return options;
	//TODO
}

module.exports = iconfont
