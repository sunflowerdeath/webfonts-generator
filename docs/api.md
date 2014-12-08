#API

##iconfont(options, done)

List of options:

###files

List of SVG files.

Type: `array.<string>`

###dest

Directory for generated font files.

Type: `string`

###destCss

Path for generated css file.

Type: `string`

###cssTemplate

Path of css template.

Type: `string`

###types

Font files types to generate.
Possible values: `svg, ttf, woff, eot`.

Type: `array<string>`

Default: `woff, eot`

###rename

Function that takes path of file and return name of icon.

Type: `function(string) -> string`

Default: `path.basename`

###startCodepoint

Starting codepoint. Defaults to beginning of unicode private area.

Type: `number`

Default: `0xF101`

###codepoints

Specific codepoints for certain icons.
Icons without codepoints will have codepoints incremented from `startCodepoint` skipping duplicates.

Type: `object`

###fontName, fixedWidth, centerHorizontally, normalize, fontHeight, round, descent

Options that are passed directly to
[svgicons2svgfont](https://github.com/nfroidure/svgicons2svgfont).
