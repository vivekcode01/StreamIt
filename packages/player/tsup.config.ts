import svgr from "esbuild-plugin-svgr";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "./src/facade/index.ts",
    react: "./src/react/index.tsx",
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  format: "esm",
  esbuildPlugins: [svgr()],
});
