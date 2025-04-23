import { HeroUIProvider } from "@heroui/react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
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
    // biome-ignore lint/style/noNonNullAssertion: Null assert
    auth: undefined!,
    // This will be set after we wrap the app in an ApiProvider
    // biome-ignore lint/style/noNonNullAssertion: Null assert
    api: undefined!,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Missing container");
}
ReactDOM.createRoot(container).render(
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
