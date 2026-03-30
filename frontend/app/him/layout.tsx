"use client";

import RoleGuard from "@/components/shared/RoleGuard";
import AppHeader from "@/components/shared/AppHeader";
import BottomNav from "@/components/shared/BottomNav";

export default function HimLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="him">
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <BottomNav />
      </div>
    </RoleGuard>
  );
}
