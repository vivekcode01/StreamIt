import { useContext } from "react";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthContext } from "@/context/AuthContext";

interface AuthAsGuestProps {
  children: ReactNode;
}

export function AuthAsGuest({ children }: AuthAsGuestProps) {
  const { user } = useContext(AuthContext);
  if (user) {
    return <Navigate to="/" />;
  }
  return children;
}
