var fs = require('fs')
var path = require('path')
var _ = require('underscore')

var webfontsGenerator = require('../src/index')

var SRC = path.join(__dirname, 'src')
var FILES = _.map(fs.readdirSync(SRC), function(file) {
	return path.join(SRC, file)
})
var OPTIONS = {
	dest: path.join(__dirname, '..', 'temp'),
	files: FILES,
	fontName: 'fontName',
	types: ['svg', 'ttf', 'woff', 'woff2', 'eot'],
	html:  true
}

webfontsGenerator(OPTIONS, function(error) {
	if (error) console.log('Fail!', error)
	else console.log('Done!')
})
