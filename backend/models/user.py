"""
User ORM Model — 使用者帳號（her / him）
"""

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, UUIDMixin, TimestampMixin


class User(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "users"

    role: Mapped[str] = mapped_column(String(10), nullable=False)  # "her" | "him"
    nickname: Mapped[str] = mapped_column(String(50), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(128), nullable=False)
