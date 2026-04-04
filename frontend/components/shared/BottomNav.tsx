"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  MapIcon,
  HeartIcon,
  MessageCircleIcon,
  LogOutIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType;
}

function getNavItems(role: UserRole): NavItem[] {
  const prefix = `/${role}`;
  const items: NavItem[] = [
    { href: `${prefix}/calendar`, label: "日曆", icon: CalendarIcon },
  ];
  if (role === "her") {
    items.push({ href: `${prefix}/map`, label: "地圖", icon: MapIcon });
  }
  items.push({ href: `${prefix}/favorites`, label: "收藏", icon: HeartIcon });
  items.push({ href: `${prefix}/chat`, label: "對話", icon: MessageCircleIcon });
  return items;
}

export default function BottomNav() {
  const pathname = usePathname();
  const { role, logout } = useAuth();

  if (!role) return null;

  const items = getNavItems(role);

  return (
    <nav className="sticky bottom-0 flex items-center border-t bg-background pb-[env(safe-area-inset-bottom)]">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-3 text-xs transition-colors select-none min-h-[44px]",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        );
      })}
      <button
        onClick={logout}
        className="flex flex-1 flex-col items-center gap-0.5 py-3 text-xs text-muted-foreground transition-colors hover:text-foreground select-none min-h-[44px]"
      >
        <LogOutIcon />
        <span>登出</span>
      </button>
    </nav>
  );
}
