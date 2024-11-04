import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { AppLoader } from "@/components/AppLoader";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { AutoRefreshProvider } from "@/context/AutoRefreshContext";
import { router } from "@/router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 4,
      staleTime: 4,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<AppLoader />}>
        <AuthProvider>
          <AutoRefreshProvider>
            <RouterProvider router={router} />
          </AutoRefreshProvider>
        </AuthProvider>
      </Suspense>
      <Toaster />
    </QueryClientProvider>
  );
}
