import { atom, useAtom } from "jotai";
import { useUser } from "./useUser";

export const tokenAtom = atom<string | null>(
  localStorage.getItem("token") ?? null,
);

export function useAuth() {
  const [, setToken] = useAtom(tokenAtom);
  const { api } = useUser();

  const signIn = async (username: string, password: string) => {
    const result = await api.token.post({
      username,
      password,
    });
    if (result.data) {
      localStorage.setItem("token", result.data);
      setToken(result.data);
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return {
    signIn,
    signOut,
  };
}
