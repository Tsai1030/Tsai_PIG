"use client";

import { useState } from "react";
import { ChevronRightIcon, FolderIcon, FolderOpenIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { FavoriteCard } from "@/components/favorites/FavoriteCard";
import { Favorite } from "@/types/favorite";

interface Props {
  category: string;
  favorites: Favorite[];
  canDelete: boolean;
  defaultOpen?: boolean;
  onAddToCalendar: (fav: Favorite) => void;
}

export function FolderItem({ category, favorites, canDelete, defaultOpen = false, onAddToCalendar }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border bg-card transition-shadow duration-200 hover:shadow-sm">
      {/* 資料夾標題列 */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-muted/50"
      >
        <span className="text-muted-foreground transition-colors duration-150">
          {isOpen ? (
            <FolderOpenIcon className="size-4 text-amber-500" />
          ) : (
            <FolderIcon className="size-4 text-amber-400" />
          )}
        </span>
        <span className="flex-1 text-sm font-medium">{category}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {favorites.length}
        </span>
        <ChevronRightIcon
          className={cn(
            "size-4 text-muted-foreground/60 transition-transform duration-300",
            isOpen && "rotate-90"
          )}
        />
      </button>

      {/* 可展開內容 — CSS grid trick for smooth height animation */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-2 px-4 pb-4 pt-1">
            {favorites.map((fav) => (
              <FavoriteCard
                key={fav.id}
                fav={fav}
                canDelete={canDelete}
                onAddToCalendar={onAddToCalendar}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
