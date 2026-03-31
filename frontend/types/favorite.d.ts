export interface Favorite {
  id: string;
  restaurant_name: string;
  address: string;
  maps_url: string | null;
  category: string;
  category_tags: string[] | null;
  created_at: string;
}

export interface FavoriteCreate {
  restaurant_name: string;
  address: string;
  maps_url?: string;
}

/** {category: Favorite[]} — GET /api/favorites/grouped */
export type FavoritesGrouped = Record<string, Favorite[]>;
