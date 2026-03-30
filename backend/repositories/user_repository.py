"""
User Repository — 使用者資料存取
"""

from typing import Optional

from sqlalchemy.orm import Session

from models.user import User
from repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):

    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_nickname(self, nickname: str) -> Optional[User]:
        return self.db.query(User).filter(User.nickname == nickname).first()

    def get_by_role(self, role: str) -> Optional[User]:
        return self.db.query(User).filter(User.role == role).first()
