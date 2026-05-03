"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  CalendarPlusIcon,
  ExternalLinkIcon,
  HeartIcon,
  Trash2Icon,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteFavorite } from "@/hooks/useFavorites";
import type { UserRole } from "@/types/auth";
import type { Favorite, FavoritesGrouped } from "@/types/favorite";

interface Props {
  grouped: FavoritesGrouped;
  isLoading: boolean;
  canDelete: boolean;
  onAddToCalendar: (fav: Favorite) => void;
  role: UserRole;
}

const ALL_KEY = "全部";

const CARD_GRADIENTS = [
  "linear-gradient(135deg, oklch(0.74 0.13 350), oklch(0.40 0.08 295))",
  "linear-gradient(135deg, oklch(0.84 0.09 0), oklch(0.62 0.13 350))",
  "linear-gradient(135deg, oklch(0.78 0.07 295), oklch(0.34 0.10 295))",
  "linear-gradient(135deg, oklch(0.74 0.10 260), oklch(0.24 0.07 295))",
  "linear-gradient(135deg, oklch(0.55 0.10 295), oklch(0.62 0.13 350))",
  "linear-gradient(135deg, oklch(0.90 0.07 340), oklch(0.55 0.10 295))",
];

export default function FavoriteStack({
  grouped,
  isLoading,
  canDelete,
  onAddToCalendar,
  role,
}: Props) {
  const [filter, setFilter] = useState(ALL_KEY);
  const accent = role === "her" ? "var(--kawaii-her)" : "var(--kawaii-him)";
  const accentDark = role === "her" ? "var(--kawaii-her-dark)" : "var(--kawaii-him-dark)";
  const accentLight = role === "her" ? "var(--kawaii-glow)" : "oklch(0.85 0.07 260)";

  const categories = useMemo(
    () => [ALL_KEY, ...Object.keys(grouped).filter((k) => grouped[k]?.length)],
    [grouped]
  );
  const list = useMemo(
    () => (filter === ALL_KEY ? Object.values(grouped).flat() : grouped[filter] ?? []),
    [filter, grouped]
  );

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      {/* Sticky filter header */}
      <div
        className="sticky top-0 z-20 px-6 pt-6 pb-4"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.24 0.07 295 / 0.85) 0%, oklch(0.24 0.07 295 / 0.5) 70%, transparent 100%)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <p className="font-display italic mb-1" style={{ color: accent, fontSize: 14 }}>
            — My Pocket List —
          </p>
          <h1 className="font-serif font-black text-glow text-white mb-4" style={{ fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1 }}>
            收藏 <span style={{ color: accentLight, fontSize: "clamp(16px, 1.5vw, 22px)", fontWeight: 400 }}>· {list.length} 家</span>
          </h1>
          {categories.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className="px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap shrink-0"
                  style={{
                    background:
                      filter === c
                        ? `linear-gradient(135deg, ${accent}, ${accentDark})`
                        : "oklch(1 0 0 / 0.10)",
                    color: "white",
                    backdropFilter: "blur(10px)",
                    border:
                      filter === c
                        ? `1px solid ${accentLight}`
                        : "1px solid oklch(1 0 0 / 0.20)",
                    boxShadow: filter === c ? `0 8px 24px ${accent}80` : "none",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stack */}
      {list.length === 0 ? (
        <EmptyState canDelete={canDelete} accent={accent} />
      ) : (
        <div className="max-w-3xl mx-auto px-4 pt-8 pb-32">
          <div className="flex flex-col gap-6">
            {list.map((f, i) => (
              <StackCard
                key={f.id}
                fav={f}
                index={i}
                gradient={CARD_GRADIENTS[i % CARD_GRADIENTS.length]}
                canDelete={canDelete}
                onAddToCalendar={onAddToCalendar}
                accent={accentLight}
              />
            ))}
          </div>

          {/* End mascot */}
          <div className="text-center mt-24">
            <Image
              src="/cute-pic.png"
              alt="cute"
              width={200}
              height={200}
              className="float-y mx-auto"
              style={{ height: 160, width: "auto", filter: `drop-shadow(0 12px 32px ${accent})` }}
            />
            <p className="font-serif text-white mt-4">
              {canDelete ? "想到新店就馬上收藏吧" : "由公主在挑新店中..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StackCard({
  fav,
  index,
  gradient,
  canDelete,
  onAddToCalendar,
  accent,
}: {
  fav: Favorite;
  index: number;
  gradient: string;
  canDelete: boolean;
  onAddToCalendar: (fav: Favorite) => void;
  accent: string;
}) {
  const del = useDeleteFavorite();

  return (
    <div
      className="stack-card"
      style={{
        top: `${130 + index * 12}px`,
        height: 360,
        background: gradient,
        boxShadow: "0 -8px 0 0 oklch(0.24 0.07 295 / 0.4), 0 30px 80px oklch(0 0 0 / 0.45)",
      }}
    >
      <div className="absolute inset-0 p-8 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-display italic text-white/85" style={{ fontSize: 16 }}>
              No. {String(index + 1).padStart(2, "0")}
            </p>
            <h2
              className="font-serif font-black text-shadow-soft text-white mt-1 line-clamp-2"
              style={{ fontSize: 32, lineHeight: 1.15 }}
            >
              {fav.restaurant_name}
            </h2>
            <p className="font-serif text-white/85 text-shadow-soft mt-1.5" style={{ fontSize: 14 }}>
              {fav.address}
            </p>
          </div>
          <HeartIcon
            className="size-7 fill-current shrink-0"
            style={{ color: accent, filter: "drop-shadow(0 0 10px oklch(1 0 0 / 0.6))" }}
          />
        </div>

        <div>
          {fav.category_tags && fav.category_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {fav.category_tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 rounded-full text-xs font-bold glass-kawaii-strong"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="px-4 py-2 rounded-full text-sm font-bold glass-kawaii-strong">
              {fav.category}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onAddToCalendar(fav)}
                className="size-10 rounded-full glass-kawaii-strong flex items-center justify-center transition hover:scale-110"
                title="加入日曆"
              >
                <CalendarPlusIcon className="size-4" />
              </button>
              {fav.maps_url && (
                <a
                  href={fav.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 rounded-full glass-kawaii-strong flex items-center justify-center transition hover:scale-110"
                  title="打開地圖"
                >
                  <ExternalLinkIcon className="size-4" />
                </a>
              )}
              {canDelete && (
                <button
                  onClick={() => del.mutate(fav.id)}
                  disabled={del.isPending}
                  className="size-10 rounded-full glass-kawaii-strong flex items-center justify-center transition hover:scale-110 disabled:opacity-50"
                  title="刪除"
                  style={{ color: "var(--destructive)" }}
                >
                  {del.isPending ? <Spinner className="size-4" /> : <Trash2Icon className="size-4" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ canDelete, accent }: { canDelete: boolean; accent: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <Image
        src="/cute-pic.png"
        alt=""
        width={240}
        height={240}
        className="float-y"
        style={{ height: 200, width: "auto", filter: `drop-shadow(0 12px 32px ${accent})` }}
      />
      <h3 className="font-serif font-bold text-white mt-6" style={{ fontSize: 24 }}>
        還沒有收藏的餐廳
      </h3>
      <p className="font-serif text-white/60 mt-2">
        {canDelete ? "到地圖頁點 ❤️ 收藏第一間" : "由公主在挑新店中..."}
      </p>
    </div>
  );
}
