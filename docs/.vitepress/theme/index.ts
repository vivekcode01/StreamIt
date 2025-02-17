import DefaultTheme from "vitepress/theme";
import { theme } from "vitepress-openapi/client";
import "vitepress-openapi/dist/style.css";
import "./custom.css";
import type { Theme } from "vitepress";

export default {
  extends: DefaultTheme,
  async enhanceApp({ app }) {
    // @ts-ignore
    theme.enhanceApp({ app });
  },
} satisfies Theme;
