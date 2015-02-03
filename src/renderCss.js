var fs = require('fs')
var path = require('path')
var crypto = require('crypto')
var _ = require('underscore')
var handlebars = require('handlebars')

/** Caclulates hash based on options and source SVG files */
var calcHash = function(options) {
	var hash = crypto.createHash('md5')
	options.files.forEach(function(file) {
		hash.update(fs.readFileSync(file, 'utf8'))
	})
	hash.update(JSON.stringify(options))
	return hash.digest('hex')
}

var makeSrc = function(options) {
	var templates = {
		eot: _.template('url("<%= path %>?#iefix") format("embedded-opentype")'),
		woff: _.template('url("<%= path %>") format("woff")'),
		ttf: _.template('url("<%= path %>") format("truetype")'),
		svg: _.template('url("<%= path %>#<%= fontName %>") format("svg")')
	}

	// Order used types according to 'options.order'.
	var orderedTypes = _.filter(options.order, function(type) {
		return options.types.indexOf(type) !== -1
	})

	var hash = calcHash(options)
	var src = _.map(orderedTypes, function(type) {
		var fontPath = path.join(options.cssFontsPath, options.fontName + '.' + type)
			.replace(/\\/g, '/')
		return templates[type]({
			path: fontPath + '?' + hash,
			fontName: options.fontName
		})
	}).join(',\n')

	return src
}

var makeCtx = function(options) {
	// Transform codepoints to hex strings
	var codepoints = _.object(_.map(options.codepoints, function(codepoint, name) {
		return [name, codepoint.toString(16)]
	}))

	return _.extend({
		fontName: options.fontName,
		src: makeSrc(options),
		codepoints: codepoints
	}, options.templateOptions)
}

var renderCss = function(options) {
	var ctx = makeCtx(options)
	var source = fs.readFileSync(options.cssTemplate, 'utf8')
	var template = handlebars.compile(source)
	return template(ctx)
}

module.exports = renderCss
