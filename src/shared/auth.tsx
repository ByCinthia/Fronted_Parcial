import { createContext, useContext, useState } from "react";

type Ctx = {
  user: null | { id: string };
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
      if (p.length >= 6) setUser({ id: u });
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
