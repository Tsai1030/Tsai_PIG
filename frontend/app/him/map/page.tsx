"use client";

import { useState } from "react";
import { ListIcon } from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { FavoritesSidebar } from "@/components/map/FavoritesSidebar";
import { MapEmbed } from "@/components/map/MapEmbed";
import { SearchBar } from "@/components/map/SearchBar";
import { useFavorites } from "@/hooks/useFavorites";

const DEFAULT_QUERY = "台北市餐廳";

export default function HimMapPage() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
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

          {/* 手機：開啟收藏 Drawer 的浮動按鈕 */}
          <div className="absolute bottom-5 left-5 md:hidden">
            <Drawer>
              <DrawerTrigger asChild>
                <button className="flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2.5 text-sm font-medium shadow-lg shadow-black/10 border border-border/50 transition-all duration-200 hover:bg-white hover:shadow-md active:scale-95">
                  <ListIcon className="size-4 text-foreground/70" />
                  <span>收藏 {favorites.length}</span>
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>收藏清單</DrawerTitle>
                </DrawerHeader>
                <div className="max-h-[60vh] overflow-y-auto pb-4">
                  <FavoritesSidebar
                    favorites={favorites}
                    isLoading={isLoading}
                    canDelete={false}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        {/* 桌機側邊欄（唯讀） */}
        <aside className="hidden md:flex w-72 flex-col border-l bg-card/80 backdrop-blur-sm">
          <FavoritesSidebar favorites={favorites} isLoading={isLoading} canDelete={false} />
        </aside>
      </div>
    </div>
  );
}
