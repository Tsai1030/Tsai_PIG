"""
Favorite Repository — 愛心收藏資料存取
"""

from typing import List

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

    def get_by_user(self, user_id: str) -> List[Favorite]:
        return self.db.query(Favorite).filter(Favorite.user_id == user_id).all()

    def get_by_category(self, user_id: str, category: str) -> List[Favorite]:
        return (
            self.db.query(Favorite)
            .filter(Favorite.user_id == user_id, Favorite.category == category)
            .all()
        )

    def get_categories(self, user_id: str) -> List[str]:
        rows = (
            self.db.query(Favorite.category)
            .filter(Favorite.user_id == user_id)
            .distinct()
            .all()
        )
        return [row[0] for row in rows]
