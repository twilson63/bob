import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: './index.js',
  output: {
    format: 'esm',
    file: 'index.esm.js'
  },
  plugins: [resolve(), commonjs()]
}
