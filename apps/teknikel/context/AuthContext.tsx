"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthUser {
  name: string;
  role: string;
  email: string;
  isLoggedIn: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (userData: any) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem("user_session");
    if (savedSession) {
      try {
        setUser(JSON.parse(savedSession));
      } catch (e) {
        localStorage.removeItem("user_session");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: any) => {
    const sessionData = { ...userData, isLoggedIn: true };
    localStorage.setItem("user_session", JSON.stringify(sessionData));
    setUser(sessionData);
  };

  const logout = () => {
    localStorage.removeItem("user_session");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
