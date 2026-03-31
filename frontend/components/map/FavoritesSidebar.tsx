"use client";

import { ExternalLinkIcon, HeartIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useDeleteFavorite } from "@/hooks/useFavorites";
import { Favorite } from "@/types/favorite";

interface Props {
  favorites: Favorite[];
  isLoading: boolean;
  canDelete: boolean;
}

function FavoriteCard({
  fav,
  canDelete,
}: {
  fav: Favorite;
  canDelete: boolean;
}) {
  const del = useDeleteFavorite();

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-1.5 rounded-xl border bg-card p-3",
        "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-sm leading-snug line-clamp-1 flex-1">
          {fav.restaurant_name}
        </span>
        <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {fav.maps_url && (
            <a
              href={fav.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="在 Google Maps 開啟"
            >
              <ExternalLinkIcon className="size-3.5" />
            </a>
          )}
          {canDelete && (
            <button
              onClick={() => del.mutate(fav.id)}
              disabled={del.isPending}
              className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              title="刪除收藏"
            >
              {del.isPending ? (
                <Spinner className="size-3" />
              ) : (
                <Trash2Icon className="size-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {fav.address}
      </p>
      {fav.category !== "其他" && (
        <span className="self-start rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-600">
          {fav.category}
        </span>
      )}
    </div>
  );
}

export function FavoritesSidebar({ favorites, isLoading, canDelete }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0">
        <HeartIcon className="size-4 text-rose-500 fill-rose-500" />
        <span className="font-medium text-sm">收藏清單</span>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {favorites.length}
        </span>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <HeartIcon className="size-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">還沒有收藏的餐廳</p>
          {canDelete && (
            <p className="text-xs text-muted-foreground/70">點下方 ❤️ 按鈕加入收藏</p>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {favorites.map((fav) => (
            <FavoriteCard key={fav.id} fav={fav} canDelete={canDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
