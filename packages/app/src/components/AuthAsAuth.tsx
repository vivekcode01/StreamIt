import { useContext } from "react";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthContext } from "@/context/AuthContext";

interface AuthAsAuthProps {
  children: ReactNode;
}

export function AuthAsAuth({ children }: AuthAsAuthProps) {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
}
