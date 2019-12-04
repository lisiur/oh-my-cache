import typescript from "rollup-plugin-typescript"
import sourceMaps from "rollup-plugin-sourcemaps"

export default {
  input: 'src/main.ts',
  plugins: [
    typescript({
      exclude: "node_modules/**",
      typescript: require("typescript"),
    }),
    sourceMaps()
  ],
  output: [
    {
      file: 'lib/oh-my-cache.cjs.js',
      format: 'cjs',
    },
    {
      file: 'lib/oh-my-cache.esm.js',
      format: 'es',
    },
    {
      file: 'lib/oh-my-cache.umd.js',
      format: 'umd',
      name: 'ohmycache',
    },
  ]
}