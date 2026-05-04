"use client";

import { useState } from "react";
import { HeartIcon, ListIcon, XIcon } from "lucide-react";
import { AddFavoriteModal } from "@/components/map/AddFavoriteModal";
import { FavoritesSidebar } from "@/components/map/FavoritesSidebar";
import { MapEmbed } from "@/components/map/MapEmbed";
import { SearchBar } from "@/components/map/SearchBar";
import { useFavorites } from "@/hooks/useFavorites";

const DEFAULT_QUERY = "台北市餐廳";

export default function HerMapPage() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [addOpen, setAddOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: favorites = [], isLoading } = useFavorites();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Search bar overlay (sticky on top) */}
      <div className="shrink-0 px-3 sm:px-6 pt-2 pb-3">
        <SearchBar onSearch={setQuery} defaultValue={DEFAULT_QUERY} />
      </div>

      {/* Map + sidebar */}
      <div className="relative flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          <MapEmbed query={query} />

          {/* Floating add favorite button */}
          <button
            onClick={() => setAddOpen(true)}
            className="absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] right-4 sm:right-6 z-10 flex items-center gap-2 btn-kawaii"
            style={{ padding: "10px 16px" }}
            aria-label="加入收藏"
          >
            <HeartIcon className="size-4 fill-current" />
            <span className="hidden sm:inline">加入收藏</span>
          </button>

          {/* Mobile favorites drawer trigger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] left-4 z-10 flex items-center gap-2 btn-kawaii-ghost"
          >
            <ListIcon className="size-4" />
            <span className="text-sm">收藏 {favorites.length}</span>
          </button>
        </div>

        {/* Desktop sidebar */}
        <aside
          className="hidden md:flex w-80 flex-col"
          style={{
            background: "linear-gradient(180deg, oklch(0.34 0.10 295 / 0.85), oklch(0.24 0.07 295 / 0.92))",
            backdropFilter: "blur(16px)",
            borderLeft: "1px solid oklch(1 0 0 / 0.12)",
          }}
        >
          <FavoritesSidebar favorites={favorites} isLoading={isLoading} canDelete={true} />
        </aside>
      </div>

      {/* Mobile drawer (custom kawaii) */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex items-end" onClick={() => setDrawerOpen(false)}>
          <div
            className="absolute inset-0"
            style={{ background: "oklch(0 0 0 / 0.5)", backdropFilter: "blur(4px)" }}
          />
          <div
            className="relative w-full rounded-t-3xl overflow-hidden flex flex-col"
            style={{
              background: "linear-gradient(180deg, oklch(0.34 0.10 295), oklch(0.24 0.07 295))",
              borderTop: "1px solid oklch(1 0 0 / 0.18)",
              maxHeight: "75vh",
              boxShadow: "var(--shadow-2xl)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 pt-3 pb-1 shrink-0">
              <div
                className="w-12 h-1.5 mx-auto rounded-full"
                style={{ background: "oklch(1 0 0 / 0.3)" }}
              />
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute top-3 right-4 size-8 rounded-full glass-kawaii flex items-center justify-center text-white"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            <FavoritesSidebar favorites={favorites} isLoading={isLoading} canDelete={true} />
          </div>
        </div>
      )}

      {/* Add favorite modal */}
      <AddFavoriteModal open={addOpen} onClose={() => setAddOpen(false)} initialQuery={query} />
    </div>
  );
}
