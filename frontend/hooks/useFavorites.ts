import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";
import { Favorite, FavoriteCreate, FavoritesGrouped } from "@/types/favorite";

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const { data } = await api.get<Favorite[]>("/api/favorites");
      return data;
    },
  });
}

export function useFavoritesGrouped() {
  return useQuery({
    queryKey: ["favorites", "grouped"],
    queryFn: async () => {
      const { data } = await api.get<FavoritesGrouped>("/api/favorites/grouped");
      return data;
    },
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FavoriteCreate) =>
      api.post<Favorite>("/api/favorites", payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useDeleteFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/favorites/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
