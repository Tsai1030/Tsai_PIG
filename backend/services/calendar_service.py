"""
CalendarService — 三餐日曆業務邏輯
"""

from typing import List

from fastapi import HTTPException, status

from models.meal_plan import MealPlan
from repositories.meal_plan_repository import MealPlanRepository
from schemas.calendar import MealPlanCreate

VALID_MEAL_TYPES = {"breakfast", "lunch", "dinner"}


class CalendarService:

    def __init__(self, repo: MealPlanRepository):
        self.repo = repo

    def get_month(self, year: int, month: int) -> List[MealPlan]:
        return self.repo.get_by_month(year, month)

    def upsert(self, user_id: str, data: MealPlanCreate) -> MealPlan:
        if data.meal_type not in VALID_MEAL_TYPES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"meal_type 必須為 breakfast / lunch / dinner",
            )
        return self.repo.upsert(
            user_id=user_id,
            plan_date=data.plan_date,
            meal_type=data.meal_type,
            restaurant_name=data.restaurant_name,
            address=data.address,
            note=data.note,
        )

    def delete(self, plan_id: str) -> None:
        meal_plan = self.repo.get_by_id(plan_id)
        if not meal_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="找不到指定的餐點計畫",
            )
        self.repo.delete(meal_plan)
