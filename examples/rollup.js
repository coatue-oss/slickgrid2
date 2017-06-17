export default {
  entry: './lib/example-simple.js',
  dest: './dist/example-simple.js',
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
  },
  treeshake: true
}
