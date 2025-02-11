import { HeroUIProvider } from "@heroui/react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { AuthProvider, useAuth } from "./auth";
import { routeTree } from "./routeTree.gen";

import "./globals.css";

const router = createRouter({
  routeTree,
  defaultPreload: false,
  context: {
    // This will be set after we wrap the app in an AuthProvider
    auth: undefined!,
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
      <App />
    </AuthProvider>
  </HeroUIProvider>,
);

function App() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}
