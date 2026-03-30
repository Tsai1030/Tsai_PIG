"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function HimCalendarPage() {
  const { nickname, logout } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-bold text-primary">
        {nickname} 的美食日曆（唯讀）
      </h1>
      <p className="text-muted-foreground">日曆模組將在 S4 實作</p>
      <Button variant="outline" onClick={logout}>
        登出
      </Button>
    </div>
  );
}
