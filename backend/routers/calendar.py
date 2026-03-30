"""
Calendar Router — 三餐日曆 CRUD（S4 完整實作，S2 先建立骨架驗證角色權限）
"""

from fastapi import APIRouter, Depends

from core.security import get_current_user
from middleware.auth_middleware import require_role

router = APIRouter()


@router.get("")
async def get_calendar(current_user: dict = Depends(get_current_user)):
    """取得日曆（全部角色可讀）"""
    return {"message": "calendar data", "user": current_user}


@router.put("")
async def update_calendar(current_user: dict = Depends(require_role("her"))):
    """更新日曆（僅 her 可寫入）"""
    return {"message": "calendar updated", "user": current_user}


@router.delete("/{plan_id}")
async def delete_calendar(
    plan_id: str,
    current_user: dict = Depends(require_role("her")),
):
    """刪除日曆項目（僅 her 可刪除）"""
    return {"message": f"deleted {plan_id}", "user": current_user}
