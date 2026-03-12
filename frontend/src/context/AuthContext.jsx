import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

const STORAGE_KEY = "xam_mate_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null); // we could decode JWT later if needed

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

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = { token, user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

