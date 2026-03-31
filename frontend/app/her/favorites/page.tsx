"use client";

import { useState } from "react";
import { HeartIcon } from "lucide-react";

import { AddToCalendarModal } from "@/components/favorites/AddToCalendarModal";
import { FolderList } from "@/components/favorites/FolderList";
import { useFavoritesGrouped } from "@/hooks/useFavorites";
import { Favorite } from "@/types/favorite";

export default function HerFavoritesPage() {
  const { data: grouped = {}, isLoading } = useFavoritesGrouped();
  const [calendarFav, setCalendarFav] = useState<Favorite | null>(null);

  const total = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* 頁首 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartIcon className="size-5 text-rose-500 fill-rose-500" />
          <div>
            <h1 className="text-base font-semibold">愛心收藏</h1>
            <p className="text-xs text-muted-foreground">共 {total} 間餐廳</p>
          </div>
        </div>
      </div>

      {/* 資料夾列表 */}
      <FolderList
        grouped={grouped}
        isLoading={isLoading}
        canDelete={true}
        onAddToCalendar={setCalendarFav}
      />

      {/* 一鍵加入日曆 Modal */}
      <AddToCalendarModal fav={calendarFav} onClose={() => setCalendarFav(null)} />
    </div>
  );
}
