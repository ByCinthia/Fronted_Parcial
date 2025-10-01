// src/shared/auth.tsx
import { createContext, useContext, useState } from "react";
import { fetchJson } from "./api";

type Ctx = {
  user: null | { id: number; username: string };
  loading: boolean;
  signIn(u: string, p: string): Promise<void>;
  signOut(): void;
};

const AuthContext = createContext<Ctx>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Ctx["user"]>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(u: string, p: string) {
    setLoading(true);
    try {
      // 1) pedir tokens
      const tokens = await fetchJson<{ access: string; refresh: string }>("/api/v1/token/", {
        method: "POST",
        body: JSON.stringify({ username: u, password: p }),
      });

      // 2) guardar tokens
      localStorage.setItem("access", tokens.access);
      localStorage.setItem("refresh", tokens.refresh);

      // 3) pedir info del usuario actual
      const me = await fetchJson<{ id: number; username: string }>("/api/v1/me/");
      setUser(me);
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
