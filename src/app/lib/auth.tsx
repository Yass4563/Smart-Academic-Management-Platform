import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { login as apiLogin } from "./api";
import type { User } from "../types";

interface AuthContextValue {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setToken(data.token);
    setUser(data.user);
    return data.user as User;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
