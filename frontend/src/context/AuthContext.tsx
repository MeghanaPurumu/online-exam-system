import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

interface User {
<<<<<<< HEAD
  id?: number;
  email?: string;
  is_admin?: boolean;
  [key: string]: unknown;
}

interface AuthContextValue {
  token: string | null;
  user: User | null;
  login: (newToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "xam_mate_token";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
=======
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
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
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
<<<<<<< HEAD
        const me = (await api.getMe(token)) as User;
=======
        const me = await api.getMe(token);
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
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

<<<<<<< HEAD
  const value: AuthContextValue = { token, user, login, logout };
=======
  const value = { token, user, login, logout };
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

<<<<<<< HEAD
export function useAuth(): AuthContextValue {
=======
export function useAuth(): AuthContextType {
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
<<<<<<< HEAD
=======




>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
