"""
FavoriteService — 收藏餐廳業務邏輯
"""

from typing import Dict, List

from fastapi import HTTPException, status

from models.favorite import Favorite
from repositories.favorite_repository import FavoriteRepository
from schemas.favorite import FavoriteCreate
from services.agent.tools import classify_restaurant


class FavoriteService:

    def __init__(self, repo: FavoriteRepository):
        self.repo = repo

    def get_all(self) -> List[Favorite]:
        return self.repo.get_all()

    def get_grouped(self) -> Dict[str, List[Favorite]]:
        return self.repo.get_grouped_by_category()

    def create(self, user_id: str, data: FavoriteCreate) -> Favorite:
        available_folders = self.repo.get_categories()
        classification = classify_restaurant.invoke({
            "restaurant_name": data.restaurant_name,
            "address": data.address,
            "available_folders": available_folders,
        })
        fav = Favorite(
            user_id=user_id,
            restaurant_name=data.restaurant_name,
            address=data.address,
            maps_url=data.maps_url,
            category=classification["category"],
        )
        return self.repo.create(fav)

    def update_category(self, restaurant_name: str, new_category: str) -> Favorite:
        """reclassify：依餐廳名稱找到收藏並更新分類。"""
        fav = self.repo.find_by_name(restaurant_name)
        if not fav:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"找不到餐廳：{restaurant_name}",
            )
        updated = self.repo.update_category(fav.id, new_category)
        return updated

    def delete(self, favorite_id: str) -> None:
        fav = self.repo.get_by_id(favorite_id)
        if not fav:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="找不到指定的收藏")
        self.repo.delete(fav)
