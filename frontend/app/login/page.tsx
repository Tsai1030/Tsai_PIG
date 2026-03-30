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
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { HeartIcon, CrownIcon, ShieldIcon } from "lucide-react";
import type { UserRole } from "@/types/auth";

const ROLES: {
  role: UserRole;
  icon: React.ComponentType;
  label: string;
  desc: string;
  subtitle: string;
}[] = [
  {
    role: "her",
    icon: CrownIcon,
    label: "公主殿下",
    subtitle: "美食規劃者",
    desc: "日曆讀寫 · 地圖探索 · 收藏管理 · AI 對話",
  },
  {
    role: "him",
    icon: ShieldIcon,
    label: "王子大人",
    subtitle: "美食執行者",
    desc: "日曆唯讀 · 收藏唯讀 · AI 對話",
  },
];

const DEFAULT_CREDENTIALS: Record<
  UserRole,
  { nickname: string; password: string }
> = {
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
      await login({
        nickname: creds.nickname,
        password: password || creds.password,
      });
    } catch {
      setError("密碼錯誤，請再試一次");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-12">
      <div className="flex w-full max-w-lg flex-col items-center gap-8">
        {/* Branding */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 text-primary">
            <HeartIcon />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            甜蜜食記
          </h1>
          <p className="text-sm text-muted-foreground">
            Sweet Food Diary — 她規劃 × 他執行
          </p>
        </div>

        <Separator />

        {/* Role Selection */}
        <div className="flex w-full flex-col gap-3">
          <p className="text-center text-sm font-medium text-muted-foreground">
            選擇你的角色
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {ROLES.map(({ role, icon: Icon, label, subtitle, desc }) => (
              <Card
                key={role}
                className={cn(
                  "flex-1 cursor-pointer transition-all hover:ring-2 hover:ring-primary/40",
                  selectedRole === role &&
                    "ring-2 ring-primary shadow-md"
                )}
                onClick={() => {
                  setSelectedRole(role);
                  setPassword("");
                  setError("");
                }}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-lg bg-muted p-2",
                        selectedRole === role && "bg-primary/10"
                      )}
                    >
                      <Icon />
                    </div>
                    <div>
                      <CardTitle>{label}</CardTitle>
                      <CardDescription>{subtitle}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Login Form */}
        {selectedRole && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>
                歡迎，{DEFAULT_CREDENTIALS[selectedRole].nickname}
              </CardTitle>
              <CardDescription>輸入密碼以登入</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Field data-invalid={error ? true : undefined}>
                  <FieldLabel htmlFor="password" className="sr-only">
                    密碼
                  </FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="輸入密碼"
                    value={password}
                    aria-invalid={error ? true : undefined}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  {error && (
                    <FieldDescription>{error}</FieldDescription>
                  )}
                </Field>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading && <Spinner data-icon="inline-start" />}
                  {loading ? "登入中..." : "登入"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
