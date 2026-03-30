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
import type { AuthState, LoginRequest, LoginResponse, MeResponse } from "@/types/auth";

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    role: null,
    nickname: null,
    isLoggedIn: false,
    isLoading: true,
  });

  // 初始化：透過 /api/auth/me 確認登入狀態（Cookie 自動帶上）
  useEffect(() => {
    api
      .get<MeResponse>("/api/auth/me")
      .then((res) => {
        setState({
          role: res.data.role,
          nickname: res.data.nickname,
          isLoggedIn: true,
          isLoading: false,
        });
      })
      .catch(() => {
        setState({
          role: null,
          nickname: null,
          isLoggedIn: false,
          isLoading: false,
        });
      });
  }, []);

  const login = useCallback(
    async (data: LoginRequest) => {
      const res = await api.post<LoginResponse>("/api/auth/login", data);
      const { role, nickname } = res.data;

      setState({ role, nickname, isLoggedIn: true, isLoading: false });

      // 根據角色導向不同首頁
      router.push(role === "her" ? "/her/calendar" : "/him/calendar");
    },
    [router]
  );

  const logout = useCallback(async () => {
    await api.post("/api/auth/logout").catch(() => {});
    setState({ role: null, nickname: null, isLoggedIn: false, isLoading: false });
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
