import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";

export default {
  input: "src/index.ts",
  external: ["react", "react-dom"],
  output: [
    { file: "dist/index.js", format: "cjs", sourcemap: true },
    { file: "dist/index.esm.js", format: "esm", sourcemap: true },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.json" }),
    copy({
      targets: [{ src: "Carousel.css", dest: "dist", rename: "index.css" }],
      copyOnce: true,
      verbose: true,
    }),
  ],
};
