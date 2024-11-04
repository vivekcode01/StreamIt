import { useAuth } from "@/hooks/useAuth";

export function useUser() {
  const { user } = useAuth();
  if (!user) {
    throw new Error("Not authenticated when calling useUser");
  }
  return user;
}
