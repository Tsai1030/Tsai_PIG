"use client";

import RoleGuard from "@/components/shared/RoleGuard";

export default function HimLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="him">
      <div className="flex flex-1 flex-col">
        {children}
      </div>
    </RoleGuard>
  );
}
