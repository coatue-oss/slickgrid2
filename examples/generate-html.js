'use strict'

const fs = require('fs')
const path = require('path')
const glob = require('glob')

function template(text) {
return `<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="libs/slickgrid2.css">
  <link rel="stylesheet" href="slick-default-theme.css">
  <link rel="stylesheet" href="examples.css">
  <script src="libs/lodash.js" defer></script>
  <script src="libs/jquery.js" defer></script>
  <script src="libs/jquery.event.drag.js" defer></script>
  <script src="libs/slickgrid2.js" defer></script>
</head>
<body>
${text}
</body>
</html>
`
}

function openTemplateFile(filename) {
  return fs.readFileSync(path.resolve(__dirname, 'src', filename))
}

function saveTemplateFile(filename, text) {
  return fs.writeFileSync(path.resolve(__dirname, 'dist', filename), text)
}

glob.sync(path.resolve(__dirname, 'src/*.html'))
.map(filePath => path.basename(filePath))
.forEach(filename => {
  const text = openTemplateFile(filename)
  saveTemplateFile(filename, template(text))
  console.log(`${filename} done.`)
})
console.log('All done.')
