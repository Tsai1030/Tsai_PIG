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
      <div className="shrink-0 px-3 sm:px-6 pt-2 pb-3">
        <SearchBar onSearch={setQuery} defaultValue={DEFAULT_QUERY} />
      </div>

      {/* 地圖 + 側邊欄（桌機） */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* 地圖區 */}
        <div className="relative flex-1">
          <MapEmbed query={query} />

          {/* 手機：開啟收藏 Drawer 的浮動按鈕 */}
          <div className="absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] left-4 md:hidden">
            <Drawer>
              <DrawerTrigger asChild>
                <button className="btn-kawaii-ghost flex items-center gap-2">
                  <ListIcon className="size-4" />
                  <span className="text-sm">收藏 {favorites.length}</span>
                </button>
              </DrawerTrigger>
              <DrawerContent
                style={{
                  background: "linear-gradient(180deg, oklch(0.34 0.10 295), oklch(0.24 0.07 295))",
                  border: "none",
                  borderTop: "1px solid oklch(1 0 0 / 0.18)",
                }}
              >
                <DrawerHeader>
                  <DrawerTitle className="text-white font-serif">收藏清單</DrawerTitle>
                </DrawerHeader>
                <div className="max-h-[60vh] overflow-y-auto pb-[env(safe-area-inset-bottom,16px)]">
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
