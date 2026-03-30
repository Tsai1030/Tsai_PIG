"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";
import type { UserRole } from "@/types/auth";

interface RoleGuardProps {
  allowedRole?: UserRole;
  children: React.ReactNode;
}

/**
 * 路由保護元件：
 * - 載入中 → 顯示 Spinner
 * - 未登入 → 導向 /login
 * - allowedRole 不符 → 導向正確角色首頁
 */
export default function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const { isLoggedIn, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    if (allowedRole && role !== allowedRole) {
      router.replace(role === "her" ? "/her/calendar" : "/him/calendar");
    }
  }, [isLoggedIn, isLoading, role, allowedRole, router]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isLoggedIn) return null;
  if (allowedRole && role !== allowedRole) return null;

  return <>{children}</>;
}
