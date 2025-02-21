import DefaultTheme from "vitepress/theme";
import ApiDocs from "./components/ApiDocs.vue";
import "./custom.css";
import type { Theme } from "vitepress";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("api-docs", ApiDocs);
  },
} satisfies Theme;
