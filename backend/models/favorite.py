"""
Favorite ORM Model — 愛心收藏餐廳
"""

from typing import Optional

from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, TimestampMixin, UUIDMixin


class Favorite(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "favorites"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    restaurant_name: Mapped[str] = mapped_column(String(100), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    maps_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(30), nullable=False, default="其他")
    category_tags: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
