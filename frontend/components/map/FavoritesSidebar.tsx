"use client";

import { ExternalLinkIcon, HeartIcon, Trash2Icon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteFavorite } from "@/hooks/useFavorites";
import type { Favorite } from "@/types/favorite";

interface Props {
  favorites: Favorite[];
  isLoading: boolean;
  canDelete: boolean;
}

function FavoriteRow({ fav, canDelete }: { fav: Favorite; canDelete: boolean }) {
  const del = useDeleteFavorite();
  return (
    <div className="group glass-kawaii rounded-2xl p-3.5 hover:scale-[1.02] hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between gap-2">
        <span className="font-serif font-bold text-white text-sm leading-snug line-clamp-1 flex-1">
          {fav.restaurant_name}
        </span>
        <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {fav.maps_url && (
            <a
              href={fav.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="size-7 rounded-full bg-white/15 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/25 transition"
              title="在 Google Maps 開啟"
            >
              <ExternalLinkIcon className="size-3" />
            </a>
          )}
          {canDelete && (
            <button
              onClick={() => del.mutate(fav.id)}
              disabled={del.isPending}
              className="size-7 rounded-full bg-white/15 flex items-center justify-center text-white/80 hover:text-[var(--destructive)] hover:bg-white/25 transition disabled:opacity-50"
              title="刪除收藏"
            >
              {del.isPending ? <Spinner className="size-3" /> : <Trash2Icon className="size-3" />}
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-white/60 line-clamp-1 mt-1">{fav.address}</p>
      {fav.category && fav.category !== "其他" && (
        <span
          className="inline-block mt-2 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ background: "var(--primary)", color: "white" }}
        >
          {fav.category}
        </span>
      )}
    </div>
  );
}

export function FavoritesSidebar({ favorites, isLoading, canDelete }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-4 shrink-0" style={{ borderBottom: "1px solid oklch(1 0 0 / 0.12)" }}>
        <HeartIcon className="size-4 fill-current text-[var(--kawaii-pink)]" />
        <span className="font-serif font-bold text-white text-sm">收藏清單</span>
        <span className="ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ background: "var(--primary)" }}>
          {favorites.length}
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center"><Spinner /></div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <HeartIcon className="size-10 text-white/20" />
          <p className="text-sm text-white/60 font-serif">還沒有收藏的餐廳</p>
          {canDelete && <p className="text-xs text-white/40 font-serif">點下方 ❤️ 按鈕加入收藏</p>}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
          {favorites.map((fav) => (
            <FavoriteRow key={fav.id} fav={fav} canDelete={canDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
