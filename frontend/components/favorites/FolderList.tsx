"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { FolderItem } from "@/components/favorites/FolderItem";
import { Favorite, FavoritesGrouped } from "@/types/favorite";

interface Props {
  grouped: FavoritesGrouped;
  isLoading: boolean;
  canDelete: boolean;
  onAddToCalendar: (fav: Favorite) => void;
}

const ALL_KEY = "全部";
const BOTTOM_KEY = "其他";

function buildOrderedFolders(grouped: FavoritesGrouped): [string, Favorite[]][] {
  const all = Object.values(grouped).flat();

  const middle = Object.entries(grouped)
    .filter(([key]) => key !== BOTTOM_KEY)
    .sort((a, b) => b[1].length - a[1].length);

  const bottom = grouped[BOTTOM_KEY] ? [[BOTTOM_KEY, grouped[BOTTOM_KEY]] as [string, Favorite[]]] : [];

  const result: [string, Favorite[]][] = [
    [ALL_KEY, all],
    ...middle,
    ...bottom,
  ];
  return result.filter(([, favs]) => favs.length > 0);
}

export function FolderList({ grouped, isLoading, canDelete, onAddToCalendar }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
      </div>
    );
  }

  const folders = buildOrderedFolders(grouped);

  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
        <span className="text-4xl">💝</span>
        <p className="text-sm">還沒有收藏的餐廳</p>
        {canDelete && <p className="text-xs opacity-60">到地圖頁點 ❤️ 加入第一間</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {folders.map(([category, favs], idx) => (
        <FolderItem
          key={category}
          category={category}
          favorites={favs}
          canDelete={canDelete}
          defaultOpen={idx === 0}
          onAddToCalendar={onAddToCalendar}
        />
      ))}
    </div>
  );
}
