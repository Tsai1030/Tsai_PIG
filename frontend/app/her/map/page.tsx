"use client";

import { useState } from "react";
import { HeartIcon, ListIcon } from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { AddFavoriteModal } from "@/components/map/AddFavoriteModal";
import { FavoritesSidebar } from "@/components/map/FavoritesSidebar";
import { MapEmbed } from "@/components/map/MapEmbed";
import { SearchBar } from "@/components/map/SearchBar";
import { useFavorites } from "@/hooks/useFavorites";
import type { Favorite } from "@/types/favorite";

const DEFAULT_QUERY = "台北市餐廳";

export default function HerMapPage() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [addOpen, setAddOpen] = useState(false);
  const { data: favorites = [], isLoading } = useFavorites();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* 搜尋列 */}
      <div className="shrink-0 px-4 pt-4 pb-3">
        <SearchBar onSearch={setQuery} defaultValue={DEFAULT_QUERY} />
      </div>

      {/* 地圖 + 側邊欄（桌機） */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* 地圖區 */}
        <div className="relative flex-1">
          <MapEmbed query={query} />

          {/* 浮動加入收藏按鈕（桌機右下，手機右下） */}
          <button
            onClick={() => setAddOpen(true)}
            className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-rose-500/40 transition-all duration-200 hover:bg-rose-600 hover:shadow-rose-600/50 hover:scale-105 active:scale-95"
            aria-label="加入收藏"
          >
            <HeartIcon className="size-4 fill-white" />
            <span className="hidden sm:inline">加入收藏</span>
          </button>

          {/* 手機：開啟收藏 Drawer 的浮動按鈕 */}
          <DrawerTriggerButton favorites={favorites} isLoading={isLoading} />
        </div>

        {/* 桌機側邊欄 */}
        <aside className="hidden md:flex w-72 flex-col border-l bg-card/80 backdrop-blur-sm">
          <FavoritesSidebar favorites={favorites} isLoading={isLoading} canDelete={true} />
        </aside>
      </div>

      {/* AddFavoriteModal */}
      <AddFavoriteModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        initialQuery={query}
      />
    </div>
  );
}

function DrawerTriggerButton({
  favorites,
  isLoading,
}: {
  favorites: Favorite[];
  isLoading: boolean;
}) {
  return (
    <div className="absolute bottom-5 left-5 md:hidden">
      <Drawer>
        <DrawerTrigger asChild>
          <button className="flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2.5 text-sm font-medium shadow-lg shadow-black/10 border border-border/50 transition-all duration-200 hover:bg-white hover:shadow-md active:scale-95">
            <ListIcon className="size-4 text-foreground/70" />
            <span>收藏 {favorites?.length ?? 0}</span>
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>收藏清單</DrawerTitle>
          </DrawerHeader>
          <div className="max-h-[60vh] overflow-y-auto pb-4">
            <FavoritesSidebar
              favorites={favorites ?? []}
              isLoading={isLoading}
              canDelete={true}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
