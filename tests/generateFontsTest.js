var fs = require('fs')
var path = require('path')
var assert = require('assert')
var _ = require('underscore')

var generateFonts = require('../src/generateFonts')

describe('generateFonts', function() {
	var DIR = path.join(__dirname, 'generateFontsTest')
	var SRC = path.join(DIR, 'src')
	var DEST = path.join(DIR, 'dest')

	var FILES = _.map(fs.readdirSync(SRC), function(file) {
		return path.join(SRC, file)
	})
	var NAMES = _.map(FILES, path.basename)
	var startCodepoint = 0xF101
	var CODEPOINTS = _.object(_.map(NAMES, function(name) {
		return [name, startCodepoint++]
	}))

	afterEach(function() {
		var files = _.map(fs.readdirSync(DEST), function(file) {
			return path.join(DEST, file)
		})
		for (var i in files) {
			fs.unlinkSync(files[i])
		}
	})

	var TYPES = ['svg', 'ttf', 'woff', 'eot']
	var FONT_NAME = 'fontName'

	it('generates font files', function(done) {
		var OPTIONS = {
			files: FILES,
			names: NAMES,
			codepoints: CODEPOINTS,
			dest: DEST,
			types: TYPES,
			fontName: FONT_NAME
		}

		generateFonts(OPTIONS, function(err) {
			if (err) {
				done(err)
			}

			//files of all types exists and are not empty
			var destFiles = fs.readdirSync(DEST)
			for (var i in TYPES) {
				var type = TYPES[i]
				var filename = FONT_NAME + '.' + type
				var filepath = path.join(DEST, filename)
				assert(destFiles.indexOf(filename) !== -1, type + ' file exists')
				assert(fs.statSync(filepath).size > 0, type + ' file is not empty')
			}
			done()
		})
	})

	xit('creates codepoints from options.startCodepoint', function() {
	})

	xit('uses options.codepoints', function() {
	})
})
