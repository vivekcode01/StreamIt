import svgr from "esbuild-plugin-svgr";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "./src/facade/index.ts",
    react: "./src/react/index.tsx",
    player: "./src/player/index.ts",
  },
  splitting: false,
  sourcemap: true,
  clean: false,
  dts: true,
  format: "esm",
  esbuildPlugins: [svgr()],
});
