"use client";

import RoleGuard from "@/components/shared/RoleGuard";
import AppHeader from "@/components/shared/AppHeader";
import BottomNav from "@/components/shared/BottomNav";
import Decorations from "@/components/decorations/Decorations";

export default function HerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="her">
      <div data-role="her" className="relative flex flex-1 flex-col min-h-0 overflow-hidden">
        <div className="kawaii-bg-image" />
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
          <Decorations count={14} />
        </div>
        <AppHeader />
        <main className="flex flex-1 flex-col min-h-0 overflow-hidden">{children}</main>
        <BottomNav />
      </div>
    </RoleGuard>
  );
}
