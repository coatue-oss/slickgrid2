'use strict'

const glob = require('glob')
const path = require('path')

export default glob.sync(path.resolve(__dirname, 'lib/*.js'))
.map(filePath => path.basename(filePath))
.map(filename => ({
  entry: `lib/${filename}`,
  dest: `dist/${filename}`,
  format: 'iife',
  external: [
    'jquery',
    'lodash',
    'slickgrid2'
  ],
  globals: {
    jquery: 'jQuery',
    lodash: '_',
    slickgrid2: 'slickgrid2'
  }
}))
