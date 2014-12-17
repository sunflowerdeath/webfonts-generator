var fs = require('fs')
var path = require('path')
var _ = require('underscore')
var assert = require('assert')

var webfontsGenerator = require('../src/index')

describe('webfont', function() {
	var SRC = path.join(__dirname, 'src')
	var DEST = path.join(__dirname, 'dest')

	var FILES = _.map(fs.readdirSync(SRC), function(file) {
		return path.join(SRC, file)
	})

	var TYPES = ['svg', 'ttf', 'woff', 'eot']
	var FONT_NAME = 'fontName'

	var OPTIONS = {
		dest: DEST,
		files: FILES,
		fontName: FONT_NAME,
		types: TYPES
	}

	afterEach(function() {
		var files = _.map(fs.readdirSync(DEST), function(file) {
			return path.join(DEST, file)
		})
		for (var i in files) fs.unlinkSync(files[i])
	})

	it('generates all fonts and css files', function(done) {
		webfontsGenerator(OPTIONS, function(err) {
			if (err) return done(err)

			var destFiles = fs.readdirSync(DEST)
			for (var i in TYPES) {
				var type = TYPES[i]
				var filename = FONT_NAME + '.' + type
				var filepath = path.join(DEST, filename)
				assert(destFiles.indexOf(filename) !== -1, type + ' file exists')
				assert(fs.statSync(filepath).size > 0, type + ' file is not empty')
			}

			var cssFile = path.join(DEST, FONT_NAME + '.css')
			assert(fs.existsSync(cssFile), 'CSS file exists') 
			assert(fs.statSync(cssFile).size > 0, 'CSS file is not empty')

			var htmlFile = path.join(DEST, FONT_NAME + '.html')
			assert(!fs.existsSync(htmlFile), 'HTML file does not exists by default') 

			done(null)
		})
	})

	it('gives error when "dest" is undefined', function(done) {
		var options = _.extend({}, OPTIONS, {dest: undefined})
		webfontsGenerator(options, function(err) {
			assert(err !== undefined)
			done()
		})
	})

	it('gives error when "files" is undefined', function(done) {
		var options = _.extend({}, OPTIONS, {files: undefined})
		webfontsGenerator(options, function(err) {
			assert(err !== undefined)
			done()
		})
	})

	xit('uses codepoints and startCodepoint', function() {
	})

	it('generates html file when options.html is true', function(done) {
		var options = _.extend({}, OPTIONS, {html: true})
		webfontsGenerator(options, function(err) {
			if (err) return done(err)

			var htmlFile = path.join(DEST, FONT_NAME + '.html')
			assert(fs.existsSync(htmlFile), 'HTML file exists') 
			assert(fs.statSync(htmlFile).size > 0, 'HTML file is not empty')

			done(null)
		})
	})

	xit('uses custom css template', function() {
	})

	xit('uses custom html template', function() {
	})
})
