import NProgress from "nprogress";
import ReactDOM from "react-dom/client";
import { App } from "@/App.tsx";
import "@/globals.css";
import "nprogress/nprogress.css";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

NProgress.configure({
  showSpinner: false,
});
