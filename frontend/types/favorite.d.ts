export interface Favorite {
  id: string;
  restaurant_name: string;
  address: string;
  maps_url: string | null;
  category: string;
  created_at: string;
}

export interface FavoriteCreate {
  restaurant_name: string;
  address: string;
  maps_url?: string;
}
