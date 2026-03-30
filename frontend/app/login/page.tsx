"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

const ROLES: { role: UserRole; emoji: string; label: string; desc: string }[] = [
  { role: "her", emoji: "👸", label: "公主殿下", desc: "美食規劃者 — 日曆讀寫、地圖探索、收藏管理" },
  { role: "him", emoji: "🤴", label: "王子大人", desc: "美食執行者 — 日曆唯讀、收藏唯讀" },
];

const DEFAULT_CREDENTIALS: Record<UserRole, { nickname: string; password: string }> = {
  her: { nickname: "公主", password: "her123" },
  him: { nickname: "王子", password: "him123" },
};

export default function LoginPage() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setError("");
    try {
      const creds = DEFAULT_CREDENTIALS[selectedRole];
      await login({ nickname: creds.nickname, password: password || creds.password });
    } catch {
      setError("密碼錯誤，請再試一次");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-background px-4 py-12">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          甜蜜食記
        </h1>
        <p className="mt-2 text-muted-foreground">
          選擇你的角色，開始美食之旅
        </p>
      </div>

      {/* Role Cards */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {ROLES.map(({ role, emoji, label, desc }) => (
          <Card
            key={role}
            className={cn(
              "w-72 cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
              selectedRole === role && "ring-2 ring-primary shadow-lg"
            )}
            onClick={() => {
              setSelectedRole(role);
              setPassword("");
              setError("");
            }}
          >
            <CardHeader className="items-center text-center">
              <div className="text-5xl">{emoji}</div>
              <CardTitle className="text-lg">{label}</CardTitle>
              <CardDescription>{desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Password + Login */}
      {selectedRole && (
        <div className="flex w-72 flex-col gap-3">
          <Input
            type="password"
            placeholder="輸入密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button
            size="lg"
            className="w-full"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <Spinner /> : "登入"}
          </Button>
        </div>
      )}
    </div>
  );
}
