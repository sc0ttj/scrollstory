import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import { terser } from "rollup-plugin-terser"

export default [
  {
    input: "src/scrollstory.js",
    output: {
      file: "dist/scrollstory.min.js",
      name: "ScrollStory",
      format: "umd"
    },
    plugins: [resolve(), commonjs(), terser()]
  }
]
