"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarIcon,
  HeartIcon,
  HomeIcon,
  LogOutIcon,
  MapIcon,
  MessageCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth";

interface NavItem {
  href: string;
  label: string;
  Icon: typeof HomeIcon;
}

function getNavItems(role: UserRole): NavItem[] {
  const prefix = `/${role}`;
  const items: NavItem[] = [
    { href: prefix, label: "首頁", Icon: HomeIcon },
    { href: `${prefix}/calendar`, label: "日曆", Icon: CalendarIcon },
  ];
  if (role === "her") {
    items.push({ href: `${prefix}/map`, label: "地圖", Icon: MapIcon });
  }
  items.push({ href: `${prefix}/favorites`, label: "收藏", Icon: HeartIcon });
  items.push({ href: `${prefix}/chat`, label: "對話", Icon: MessageCircleIcon });
  return items;
}

function isItemActive(itemHref: string, pathname: string, prefix: string): boolean {
  if (itemHref === prefix) {
    return pathname === prefix || pathname === `${prefix}/`;
  }
  return pathname.startsWith(itemHref);
}

export default function BottomNav() {
  const pathname = usePathname();
  const { role, logout } = useAuth();

  if (!role) return null;

  const items = getNavItems(role);
  const accent = role === "her" ? "var(--kawaii-her)" : "var(--kawaii-him)";
  const prefix = `/${role}`;

  return (
    <nav
      className="sticky bottom-0 z-30 pb-[env(safe-area-inset-bottom)] px-3 sm:px-6 pt-2 pb-3"
      style={{
        background:
          "linear-gradient(0deg, oklch(0.24 0.07 295 / 0.92) 0%, oklch(0.24 0.07 295 / 0.5) 80%, transparent 100%)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        className="max-w-2xl mx-auto flex items-center gap-1 p-1.5 rounded-full glass-kawaii"
        style={{ border: `1px solid ${accent}40` }}
      >
        {items.map(({ href, label, Icon }) => {
          const isActive = isItemActive(href, pathname, prefix);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 rounded-full text-[11px] font-bold transition-all min-h-[44px]",
                isActive ? "text-white" : "text-white/60 hover:text-white"
              )}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${accent}, var(--kawaii-mid))`,
                      boxShadow: `0 4px 16px ${accent}80`,
                    }
                  : undefined
              }
            >
              <Icon className="size-5" />
              <span>{label}</span>
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-full text-[11px] font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all min-h-[44px]"
          aria-label="登出"
        >
          <LogOutIcon className="size-5" />
        </button>
      </div>
    </nav>
  );
}
