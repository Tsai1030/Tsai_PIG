"""
MealPlan ORM Model — 餐點規劃（日曆核心資料）
"""

from sqlalchemy import DATE, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, TimestampMixin, UUIDMixin


class MealPlan(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "meal_plans"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    plan_date: Mapped[str] = mapped_column(DATE, nullable=False)
    meal_type: Mapped[str] = mapped_column(String(10), nullable=False)  # breakfast | lunch | dinner
    restaurant_name: Mapped[str] = mapped_column(String(100), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint("plan_date", "meal_type", name="uq_meal_plans_date_type"),
    )
