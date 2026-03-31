"use client";

import { ExternalLinkIcon, Trash2Icon, CalendarPlusIcon } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useDeleteFavorite } from "@/hooks/useFavorites";
import { Favorite } from "@/types/favorite";

interface Props {
  fav: Favorite;
  canDelete: boolean;
  onAddToCalendar: (fav: Favorite) => void;
}

export function FavoriteCard({ fav, canDelete, onAddToCalendar }: Props) {
  const del = useDeleteFavorite();

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-2 rounded-xl border bg-card p-3.5",
        "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-border/80"
      )}
    >
      {/* 標題列 */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-sm leading-snug line-clamp-1 flex-1">
          {fav.restaurant_name}
        </span>
        <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={() => onAddToCalendar(fav)}
            className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-blue-500 hover:bg-blue-50 transition-colors"
            title="加入日曆"
          >
            <CalendarPlusIcon className="size-3.5" />
          </button>
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

      {/* 地址 */}
      <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
        {fav.address}
      </p>

      {/* 標籤 */}
      {fav.category_tags && fav.category_tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {fav.category_tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
