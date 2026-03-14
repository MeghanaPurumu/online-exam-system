import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

interface User {
  id: number;
  username: string;
  is_admin: boolean;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "xam_mate_token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    const loadMe = async () => {
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const me = await api.getMe(token);
        if (!cancelled) setUser(me);
      } catch (e) {
        if (!cancelled) {
          setUser(null);
          setToken(null);
        }
      }
    };
    loadMe();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = { token, user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}




