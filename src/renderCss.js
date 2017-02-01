var fs = require('fs')
var path = require('path')
var crypto = require('crypto')
var _ = require('underscore')
var handlebars = require('handlebars')
var urlJoin = require('url-join')

/** Caclulates hash based on options and source SVG files */
var calcHash = function(options) {
	var hash = crypto.createHash('md5')
	options.files.forEach(function(file) {
		hash.update(fs.readFileSync(file, 'utf8'))
	})
	hash.update(JSON.stringify(options))
	return hash.digest('hex')
}

var makeUrls = function(options) {
	var hash = calcHash(options)
	var baseUrl = options.cssFontsUrl && options.cssFontsUrl.replace(/\\/g, '/')
	var urls = _.map(options.types, function(type) {
		var fontName = options.fontName + '.' + type + '?' + hash
		return baseUrl ? urlJoin(baseUrl, fontName) : fontName
	})
	return _.object(options.types, urls)
}


var makeSrc = function(options, urls) {
	var templates = {
		eot: _.template('url("<%= url %>?#iefix") format("embedded-opentype")'),
		woff2: _.template('url("<%= url %>") format("woff2")'),
		woff: _.template('url("<%= url %>") format("woff")'),
		ttf: _.template('url("<%= url %>") format("truetype")'),
		svg: _.template('url("<%= url %>#<%= fontName %>") format("svg")')
	}

	// Order used types according to 'options.order'.
	var orderedTypes = _.filter(options.order, function(type) {
		return options.types.indexOf(type) !== -1
	})

	var src = _.map(orderedTypes, function(type) {
		return templates[type]({
			url: urls[type],
			fontName: options.fontName
		})
	}).join(',\n')

	return src
}

var makeCtx = function(options, urls) {
	// Transform codepoints to hex strings
	var codepoints = _.object(_.map(options.codepoints, function(codepoint, name) {
		return [name, codepoint.toString(16)]
	}))

	return _.extend({
		fontName: options.fontName,
		src: makeSrc(options, urls),
		codepoints: codepoints
	}, options.templateOptions)
}

var renderCss = function(options, urls) {
	if (typeof urls === 'undefined') urls = makeUrls(options)
	var ctx = makeCtx(options, urls)
	var source = fs.readFileSync(options.cssTemplate, 'utf8')
	var template = handlebars.compile(source)
	return template(ctx)
}

module.exports = renderCss
