var fs = require('fs')
var path = require('path')
var _ = require('underscore')
var handlebars = require('handlebars')

var renderCss = require('./renderCss')

var renderHtml = function(options) {
	var source = fs.readFileSync(options.htmlTemplate, 'utf8')
	var template = handlebars.compile(source)

	var htmlFontsPath = path.relative(options.htmlDest, options.dest)
	// Styles embedded in the html file should use default CSS template and
	// have path to fonts that is relative to html file location.
	var styles = renderCss(_.extend({}, options, {
		cssFontPath: htmlFontsPath
	}))

	var ctx = _.extend({
		names: options.names,
		fontName: options.fontName,
		styles: styles
	}, options.templateOptions)
	return template(ctx)
}

module.exports = renderHtml
