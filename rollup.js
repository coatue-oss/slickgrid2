import typescript from 'rollup-plugin-typescript'

export default {
  dest: './dist/slick.compat.js',
  entry: './src/compat.ts',
  external: ['jquery', 'lodash'],
  format: 'iife',
  globals: {
    jquery: 'jQuery',
    lodash: '_'
  },
  plugins: [
    typescript({
      typescript: require('typescript')
    })
  ],
  treeshake: false // otherwise, rollup shakes all our exports away
}
