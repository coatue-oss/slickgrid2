import resolve from 'rollup-plugin-node-resolve' // used for tslib

export default {
  entry: './lib/index.js',
  dest: './dist/slickgrid2.js',
  moduleName: 'slickgrid2',
  format: 'umd',
  external: [
    'jquery',
    'lodash'
  ],
  globals: {
    jquery: 'jQuery',
    lodash: '_'
  },
  plugins: [
    resolve()
  ],
  treeshake: true
}
