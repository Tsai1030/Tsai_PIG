"use client";

import RoleGuard from "@/components/shared/RoleGuard";

export default function HerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="her">
      <div className="flex flex-1 flex-col">
        {children}
      </div>
    </RoleGuard>
  );
}
