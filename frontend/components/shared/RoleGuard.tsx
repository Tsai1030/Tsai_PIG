"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth";

interface RoleGuardProps {
  allowedRole?: UserRole;
  children: React.ReactNode;
}

/**
 * 路由保護元件：
 * - 未登入 → 導向 /login
 * - allowedRole 不符 → 導向正確角色首頁
 */
export default function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const { isLoggedIn, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    if (allowedRole && role !== allowedRole) {
      router.replace(role === "her" ? "/her/calendar" : "/him/calendar");
    }
  }, [isLoggedIn, role, allowedRole, router]);

  // 未登入或角色不符時不渲染子元件
  if (!isLoggedIn) return null;
  if (allowedRole && role !== allowedRole) return null;

  return <>{children}</>;
}
