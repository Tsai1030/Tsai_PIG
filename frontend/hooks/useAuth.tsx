"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { AuthState, LoginRequest, TokenResponse, UserRole } from "@/types/auth";

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    token: null,
    role: null,
    nickname: null,
    isLoggedIn: false,
  });

  // 初始化：從 localStorage 讀取
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") as UserRole | null;
    const nickname = localStorage.getItem("nickname");
    if (token && role) {
      setState({ token, role, nickname, isLoggedIn: true });
    }
  }, []);

  const login = useCallback(
    async (data: LoginRequest) => {
      const res = await api.post<TokenResponse>("/api/auth/login", data);
      const { access_token, role, nickname } = res.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role);
      localStorage.setItem("nickname", nickname);

      setState({ token: access_token, role, nickname, isLoggedIn: true });

      // 根據角色導向不同首頁
      router.push(role === "her" ? "/her/calendar" : "/him/calendar");
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("nickname");
    setState({ token: null, role: null, nickname: null, isLoggedIn: false });
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({ ...state, login, logout }),
    [state, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
