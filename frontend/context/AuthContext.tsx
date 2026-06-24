"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { api, apiErrorMessage } from "@/lib/api";
import type { User, Role } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: Role) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function setSession(accessToken: string, refreshToken: string) {
  Cookies.set("accessToken", accessToken, { expires: 1 / 96, sameSite: "lax" });
  Cookies.set("refreshToken", refreshToken, { expires: 7, sameSite: "lax" });
}

function clearSession() {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const token = Cookies.get("accessToken");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.data.user);
    } catch {
      setUser(null);
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { data } = await api.post("/auth/login", { email, password });
        setSession(data.data.accessToken, data.data.refreshToken);
        setUser(data.data.user);
        const dest = data.data.user.role === "ADMIN" ? "/admin" : data.data.user.role === "MENTOR" ? "/mentors/dashboard" : "/dashboard";
        router.push(dest);
      } catch (err) {
        throw new Error(apiErrorMessage(err, "Invalid email or password."));
      }
    },
    [router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string, role: Role = "USER") => {
      try {
        const { data } = await api.post("/auth/register", { name, email, password, role });
        setSession(data.data.accessToken, data.data.refreshToken);
        setUser(data.data.user);
        router.push(role === "MENTOR" ? "/mentors/apply" : "/profile/setup");
      } catch (err) {
        throw new Error(apiErrorMessage(err, "Could not create your account."));
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    const refreshToken = Cookies.get("refreshToken");
    try {
      await api.post("/auth/logout", { refreshToken });
    } catch {
      // ignore - we clear the session client-side regardless
    }
    clearSession();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
