'use strict'

const glob = require('glob')
const path = require('path')
const rollup = require('rollup')

glob.sync(path.resolve(__dirname, 'lib/*.js'))
.map(filePath => path.basename(filePath))
.forEach(filename => {
  rollup.rollup({
    entry: `lib/${filename}`,
    external: [
      'jquery',
      'lodash',
      'slickgrid2'
    ]
  }).then(bundle => {
    return bundle.write({
      format: 'iife',
      dest: `dist/${filename}`,
      globals: {
        jquery: 'jQuery',
        lodash: '_',
        slickgrid2: 'slickgrid2'
      }
    })
  }).then(() => {
    console.log(`${filename} done.`)
  })
})
