"""
Calendar 相關 Pydantic Schemas
"""

import datetime
from typing import Optional

from pydantic import BaseModel


class MealPlanCreate(BaseModel):
    plan_date: datetime.date
    meal_type: str          # breakfast | lunch | dinner
    restaurant_name: str
    address: str
    note: Optional[str] = None


class MealPlanResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    plan_date: datetime.date
    meal_type: str
    restaurant_name: str
    address: str
    note: Optional[str]
    created_at: datetime.datetime
