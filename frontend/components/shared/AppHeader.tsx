"use client";

import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HeartIcon } from "lucide-react";

export default function AppHeader() {
  const { nickname, role } = useAuth();

  return (
    <header className="sticky top-0 flex items-center justify-between border-b bg-background px-4 py-2">
      <div className="flex items-center gap-2">
        <HeartIcon className="text-primary" />
        <span className="text-sm font-semibold">甜蜜食記</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          {role === "her" ? "👸 公主" : "🤴 王子"}
        </Badge>
        <Avatar className="size-7">
          <AvatarFallback className="text-xs">
            {nickname?.charAt(0) ?? "?"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
