import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { parseEnv } from "shared/env";
import { defineConfig } from "vite";
import type { Plugin } from "vite";

// When we inject new PUBLIC_ variables, make sure to add them
// in src/globals.d.ts too. All of these are optional because we
// can inject them through SSI.
const env = parseEnv((z) => ({
  PUBLIC_API_ENDPOINT: z.string().optional(),
  PUBLIC_STITCHER_ENDPOINT: z.string().optional(),
}));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [TanStackRouterVite(), react(), ssiEnvPlugin(env, mode)],
    define: {
      __VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    clearScreen: false,
    server: {
      port: 52000,
      hmr: false,
    },
  };
});

function ssiEnvPlugin(values: Record<string, string>, mode: string) {
  return {
    name: "html-transform",
    transformIndexHtml(html) {
      if (mode === "production") {
        return html;
      }
      Object.entries(values).forEach(([key, value]) => {
        html = html.replace(
          `<!--#echo var="${key.replace("PUBLIC_", "SSI_")}"-->`,
          value,
        );
      });
      return html;
    },
  } satisfies Plugin;
}
