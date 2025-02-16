import { HeroUIProvider } from "@heroui/react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { ApiProvider, useApi } from "./api";
import { AuthProvider, useAuth } from "./auth";
import { routeTree } from "./routeTree.gen";

import "./globals.css";

const router = createRouter({
  routeTree,
  defaultPreload: false,
  context: {
    // This will be set after we wrap the app in an AuthProvider
    auth: undefined!,
    // This will be set after we wrap the app in an ApiProvider
    api: undefined!,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <HeroUIProvider>
    <AuthProvider>
      <ApiProvider>
        <App />
      </ApiProvider>
    </AuthProvider>
  </HeroUIProvider>,
);

function App() {
  const auth = useAuth();
  const api = useApi();
  return <RouterProvider router={router} context={{ auth, api }} />;
}
