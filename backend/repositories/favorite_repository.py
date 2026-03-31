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

