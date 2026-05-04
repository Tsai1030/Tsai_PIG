"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth";

const ROLES: {
  role: UserRole;
  label: string;
  subtitle: string;
  desc: string;
  img: string;
  accent: string;
}[] = [
  {
    role: "her",
    label: "她",
    subtitle: "La Princesse",
    desc: "美食規劃者",
    img: "/her-pic.png",
    accent: "var(--paris-rose)",
  },
  {
    role: "him",
    label: "他",
    subtitle: "Le Prince",
    desc: "美食執行者",
    img: "/him-pic.png",
    accent: "oklch(0.74 0.10 260)",
  },
];

const DEFAULT_CREDENTIALS: Record<UserRole, { nickname: string; password: string }> = {
  her: { nickname: "公主", password: "her123" },
  him: { nickname: "王子", password: "him123" },
};

export default function LoginPage() {
  const { login } = useAuth();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!selected) return;
    if (!password) {
      setError("請輸入密碼");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const creds = DEFAULT_CREDENTIALS[selected];
      await login({ nickname: creds.nickname, password });
    } catch {
      setError("密碼錯誤，請再試一次");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full flex-1 overflow-hidden" style={{ minHeight: "100vh" }}>
      <div className="paris-bg" style={{ filter: "brightness(0.55) saturate(1.1) blur(2px)" }} />
      <div className="paris-grain" />

      {/* Header brand */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 py-4 md:px-8 md:py-8 flex justify-between items-center">
        <div className="font-display italic" style={{ color: "var(--paris-cream)", fontSize: "clamp(14px, 4vw, 24px)" }}>
          Sweet · Food · Diary
        </div>
        <div className="font-display tracking-[0.3em] text-xs" style={{ color: "var(--paris-gold)" }}>
          EST · 2026
        </div>
      </div>

      {/* Center content */}
      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full flex flex-col items-center justify-center px-4 py-20 md:px-6 md:py-8">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-6 md:mb-12">
            <p className="font-display italic mb-3" style={{ color: "var(--paris-gold)", fontSize: 20 }}>
              — Welcome back —
            </p>
            <h1
              className="font-serif font-bold text-shadow-soft"
              style={{ color: "var(--paris-cream)", fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1 }}
            >
              請選擇你的角色
            </h1>
          </div>

          {/* Role cards */}
          <div className="grid md:grid-cols-2 gap-3 md:gap-6 max-w-3xl mx-auto">
            {ROLES.map((r) => {
              const isSelected = selected === r.role;
              const isOther = selected !== null && selected !== r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => {
                    setSelected(r.role);
                    setPassword("");
                    setError("");
                  }}
                  className="relative overflow-hidden text-left transition-all duration-500 group cursor-pointer h-[200px] md:h-[380px]"
                  style={{
                    borderRadius: 8,
                    border: `1px solid ${isSelected ? r.accent : "oklch(0.74 0.10 70 / 0.3)"}`,
                    background: "oklch(0.16 0.02 30 / 0.5)",
                    transform: isSelected
                      ? "scale(1.03) translateY(-8px)"
                      : isOther
                        ? "scale(0.95) translateY(0)"
                        : "scale(1)",
                    opacity: isOther ? 0.4 : 1,
                    boxShadow: isSelected
                      ? `0 24px 60px ${r.accent}, 0 0 0 1px ${r.accent}`
                      : "0 12px 32px oklch(0 0 0 / 0.4)",
                  }}
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <Image
                      src={r.img}
                      alt={r.role}
                      width={500}
                      height={620}
                      priority
                      className="absolute object-contain transition-all duration-700 group-hover:scale-105"
                      style={{
                        right: -40,
                        bottom: -20,
                        height: "110%",
                        width: "auto",
                        filter: isSelected ? "none" : "grayscale(0.3) brightness(0.85)",
                      }}
                    />
                  </div>
                  <div className="relative z-10 p-5 md:p-8 flex flex-col h-full justify-between">
                    <div>
                      <p className="font-display italic tracking-wider" style={{ color: r.accent, fontSize: 18 }}>
                        {r.subtitle}
                      </p>
                      <h3
                        className="font-serif font-black mt-2"
                        style={{ color: "var(--paris-cream)", fontSize: "clamp(48px, 12vw, 80px)", lineHeight: 1 }}
                      >
                        {r.label}
                      </h3>
                    </div>
                    <div>
                      <p className="font-serif" style={{ color: "oklch(0.93 0.04 70 / 0.8)", fontSize: 16 }}>
                        {r.desc}
                      </p>
                      <p
                        className="font-display tracking-[0.3em] mt-2 text-xs"
                        style={{ color: r.accent }}
                      >
                        {isSelected ? "✓ SELECTED" : "CLICK TO ENTER"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Password panel */}
          <div
            className="max-w-md mx-auto overflow-hidden transition-all duration-500"
            style={{
              maxHeight: selected ? 260 : 0,
              opacity: selected ? 1 : 0,
              marginTop: selected ? 32 : 0,
            }}
          >
            <div className="glass-paris" style={{ borderRadius: 8, padding: 24 }}>
              <p className="font-serif mb-3" style={{ color: "var(--paris-ink)", fontSize: 14 }}>
                {selected === "her" ? "歡迎回來，公主" : "歡迎回來，王子"}
              </p>
              <div className={error ? "shake" : ""}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="輸入通關密語"
                  autoFocus
                  className="w-full px-4 py-3 outline-none font-serif bg-transparent"
                  style={{
                    borderBottom: "1px solid var(--paris-burgundy)",
                    color: "var(--paris-ink)",
                    fontSize: 16,
                  }}
                />
              </div>
              {error && (
                <p className="mt-2 text-sm font-serif" style={{ color: "var(--paris-burgundy)" }}>
                  {error}
                </p>
              )}
              <button
                onClick={submit}
                disabled={loading}
                className="btn-paris mt-4 w-full"
                style={{ padding: "12px 24px" }}
              >
                {loading ? "開門中..." : "推開那扇門"}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
