import typescript from 'rollup-plugin-typescript'

export default {
  dest: './slick.grid.js',
  entry: './src/index.ts',
  format: 'iife',
  plugins: [
    typescript({
      typescript: require('typescript')
    })
  ]
}