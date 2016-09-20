import typescript from 'rollup-plugin-typescript'

export default {
  dest: './slick.grid.js',
  entry: './src/index.ts',
  exports: 'named',
  external: ['jquery'],
  format: 'umd',
  globals: {
    jquery: 'jQuery'
  },
  moduleName: 'SlickGrid',
  plugins: [
    typescript({
      typescript: require('typescript')
    })
  ],
  treeshake: false // otherwise, rollup shakes all our exports away
}