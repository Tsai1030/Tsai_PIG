"""
Calendar Router — 三餐日曆 CRUD
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from middleware.auth_middleware import require_role
from repositories.meal_plan_repository import MealPlanRepository
from schemas.calendar import MealPlanCreate, MealPlanResponse
from services.calendar_service import CalendarService

router = APIRouter()


def get_calendar_service(db: Session = Depends(get_db)) -> CalendarService:
    return CalendarService(MealPlanRepository(db))


@router.get("", response_model=list[MealPlanResponse])
async def get_calendar(
    year: int,
    month: int,
    current_user: dict = Depends(get_current_user),
    service: CalendarService = Depends(get_calendar_service),
):
    """取得指定月份日曆（全部角色可讀）"""
    return service.get_month(year, month)


@router.put("", response_model=MealPlanResponse)
async def upsert_calendar(
    data: MealPlanCreate,
    current_user: dict = Depends(require_role("her")),
    service: CalendarService = Depends(get_calendar_service),
):
    """新增或更新餐點計畫（僅 her 可寫入）"""
    return service.upsert(current_user["user_id"], data)


@router.delete("/{plan_id}", status_code=204)
async def delete_calendar(
    plan_id: str,
    current_user: dict = Depends(require_role("her")),
    service: CalendarService = Depends(get_calendar_service),
):
    """刪除餐點計畫（僅 her 可刪除）"""
    service.delete(plan_id)
