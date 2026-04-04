"""
Favorite Repository — 愛心收藏資料存取
"""

from collections import defaultdict
from typing import Dict, List

from sqlalchemy.orm import Session

from models.favorite import Favorite
from repositories.base_repository import BaseRepository


class FavoriteRepository(BaseRepository[Favorite]):

    def __init__(self, db: Session):
        super().__init__(Favorite, db)

    def get_all(self) -> List[Favorite]:
        return (
            self.db.query(Favorite)
            .order_by(Favorite.created_at.desc())
            .all()
        )

    def get_grouped_by_category(self) -> Dict[str, List[Favorite]]:
        """回傳 {category: [Favorite]} 分組結構，依 created_at desc 排序。"""
        favorites = self.get_all()
        grouped: Dict[str, List[Favorite]] = defaultdict(list)
        for fav in favorites:
            grouped[fav.category].append(fav)
        return dict(grouped)

    def get_categories(self) -> List[str]:
        rows = self.db.query(Favorite.category).distinct().all()
        return [row[0] for row in rows]

    def get_by_user(self, user_id: str) -> List[Favorite]:
        return self.db.query(Favorite).filter(Favorite.user_id == user_id).all()

    def get_by_category(self, user_id: str, category: str) -> List[Favorite]:
        return (
            self.db.query(Favorite)
            .filter(Favorite.user_id == user_id, Favorite.category == category)
            .all()
        )

    def find_by_name(self, restaurant_name: str) -> Favorite | None:
        """依餐廳名稱查找，同名多筆取最近收藏者。"""
        return (
            self.db.query(Favorite)
            .filter(Favorite.restaurant_name == restaurant_name)
            .order_by(Favorite.created_at.desc())
            .first()
        )

    def update_category(self, favorite_id: str, new_category: str) -> Favorite | None:
        """更新收藏的分類資料夾。"""
        fav = self.get_by_id(favorite_id)
        if not fav:
            return None
        fav.category = new_category
        self.db.commit()
        self.db.refresh(fav)
        return fav

