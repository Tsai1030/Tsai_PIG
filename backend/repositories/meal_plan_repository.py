"""
MealPlan Repository — 三餐日曆資料存取
"""

from typing import List, Optional

from sqlalchemy.orm import Session

from models.meal_plan import MealPlan
from repositories.base_repository import BaseRepository


class MealPlanRepository(BaseRepository[MealPlan]):

    def __init__(self, db: Session):
        super().__init__(MealPlan, db)

    def get_by_date(self, plan_date: str) -> List[MealPlan]:
        return self.db.query(MealPlan).filter(MealPlan.plan_date == plan_date).all()

    def get_by_date_and_meal_type(self, plan_date: str, meal_type: str) -> Optional[MealPlan]:
        return (
            self.db.query(MealPlan)
            .filter(MealPlan.plan_date == plan_date, MealPlan.meal_type == meal_type)
            .first()
        )

    def get_by_month(self, year: int, month: int) -> List[MealPlan]:
        prefix = f"{year}-{month:02d}"
        return (
            self.db.query(MealPlan)
            .filter(MealPlan.plan_date.like(f"{prefix}%"))
            .order_by(MealPlan.plan_date, MealPlan.meal_type)
            .all()
        )
