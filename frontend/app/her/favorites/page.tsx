"use client";

import { useState } from "react";
import { AddToCalendarModal } from "@/components/favorites/AddToCalendarModal";
import FavoriteStack from "@/components/favorites/FavoriteStack";
import { useFavoritesGrouped } from "@/hooks/useFavorites";
import type { Favorite } from "@/types/favorite";

export default function HerFavoritesPage() {
  const { data: grouped = {}, isLoading } = useFavoritesGrouped();
  const [calendarFav, setCalendarFav] = useState<Favorite | null>(null);

  return (
    <>
      <FavoriteStack
        grouped={grouped}
        isLoading={isLoading}
        canDelete={true}
        onAddToCalendar={setCalendarFav}
        role="her"
      />
      <AddToCalendarModal fav={calendarFav} onClose={() => setCalendarFav(null)} />
    </>
  );
}
