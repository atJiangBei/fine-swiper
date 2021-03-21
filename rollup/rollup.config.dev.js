import json from 'rollup-plugin-json'
import { terser } from 'rollup-plugin-terser'
import resolve from '@rollup/plugin-node-resolve'
import babel, { getBabelOutputPlugin } from '@rollup/plugin-babel'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import typescript from 'rollup-plugin-typescript2'
const path = require('path')
const resolveFile = function(filePath) {
  return path.join(__dirname, '..', filePath)
}

export default {
  input: 'src/main.ts',
  output: [
    {
      file: 'dist/fine-swiper.js',
      name: 'FineSwiper',
      format: 'esm'
    },
    {
      file: 'dist/fine-swiper.min.js',
      name: 'FineSwiper',
      format: 'umd',
      plugins: [terser()]
    }
  ],
  external: [],
  plugins: [
    json(),
    resolve(),
    babel({
      babelHelpers: 'bundled'
    }),
    serve({
      port: 8010,
      contentBase: [resolveFile('./'), resolveFile('dist')],
      // contentBase: [resolveFile('')],
      //open: true,
      verbose: true // 打印输出 serve路径
    }),
    livereload({
      watch: 'dist',
      verbose: false // Disable console output
    }),
    typescript()
  ]
}
