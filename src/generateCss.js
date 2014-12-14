var fs = require('fs')
var path = require('path')
var _ = require('underscore')
var handlebars = require('handlebars')
var mkdirp = require('mkdirp')

var makeSrc = function(options) {
	var templates = {
		eot: _.template('url("<%= path %>?#iefix") format("embedded-opentype")'),
		woff: _.template('url("<%= path %>") format("woff")'),
		ttf: _.template('url("<%= path %>") format("truetype")'),
		svg: _.template('url("<%= path %>#<%= fontName %>") format("svg")')
	}

	var orderedTypes = _.filter(options.order, function(type) {
		return options.types.indexOf(type) !== -1
	})

	var src = _.map(orderedTypes, function(type) {
		var fontPath = path.join(options.cssFontsPath, options.fontName + '.' + type)
		var src = templates[type]({
			path: fontPath,
			fontName: options.fontName
		})
		return src
	}).join(',\n')

	return src
}

var generateCss = function(options) {
	var source = fs.readFileSync(options.cssTemplate, 'utf8')
	var template = handlebars.compile(source)
	var codepoints = _.object(_.map(options.codepoints, function(codepoint, name) {
		return [name, codepoint.toString(16)]
	}))
	var ctx = _.extend({
		fontName: options.fontName,
		src: makeSrc(options),
		codepoints: codepoints
	}, options.cssTemplateData)
	var css = template(ctx)

	mkdirp.sync(path.dirname(options.destCss))
	fs.writeFileSync(options.destCss, css)
}

module.exports = generateCss
