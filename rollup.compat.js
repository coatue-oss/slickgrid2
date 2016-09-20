import typescript from 'rollup-plugin-typescript'

export default {
  dest: './slick.compat.js',
  entry: './src/compat.ts',
  external: ['jquery'],
  format: 'iife',
  globals: {
    jquery: 'jQuery'
  },
  plugins: [
    typescript({
      typescript: require('typescript')
    })
  ],
  treeshake: false // otherwise, rollup shakes all our exports away
}