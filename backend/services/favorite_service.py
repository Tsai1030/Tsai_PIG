"""
FavoriteService — 收藏餐廳業務邏輯
"""

from typing import List

from fastapi import HTTPException, status

from models.favorite import Favorite
from repositories.favorite_repository import FavoriteRepository
from schemas.favorite import FavoriteCreate


class FavoriteService:

    def __init__(self, repo: FavoriteRepository):
        self.repo = repo

    def get_all(self) -> List[Favorite]:
        return self.repo.get_all()

    def create(self, user_id: str, data: FavoriteCreate) -> Favorite:
        fav = Favorite(
            user_id=user_id,
            restaurant_name=data.restaurant_name,
            address=data.address,
            maps_url=data.maps_url,
        )
        return self.repo.create(fav)

    def delete(self, favorite_id: str) -> None:
        fav = self.repo.get_by_id(favorite_id)
        if not fav:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="找不到指定的收藏")
        self.repo.delete(fav)
