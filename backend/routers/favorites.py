"""
Favorites Router — 收藏餐廳 CRUD
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from middleware.auth_middleware import require_role
from repositories.favorite_repository import FavoriteRepository
from schemas.favorite import FavoriteCreate, FavoriteResponse
from services.favorite_service import FavoriteService

router = APIRouter()


def get_favorite_service(db: Session = Depends(get_db)) -> FavoriteService:
    return FavoriteService(FavoriteRepository(db))


@router.get("", response_model=list[FavoriteResponse])
async def get_favorites(
    current_user: dict = Depends(get_current_user),
    service: FavoriteService = Depends(get_favorite_service),
):
    """取得所有收藏（全部角色可讀）"""
    return service.get_all()


@router.post("", response_model=FavoriteResponse, status_code=201)
async def create_favorite(
    data: FavoriteCreate,
    current_user: dict = Depends(require_role("her")),
    service: FavoriteService = Depends(get_favorite_service),
):
    """新增收藏餐廳（僅 her 可寫入）"""
    return service.create(current_user["user_id"], data)


@router.delete("/{favorite_id}", status_code=204)
async def delete_favorite(
    favorite_id: str,
    current_user: dict = Depends(require_role("her")),
    service: FavoriteService = Depends(get_favorite_service),
):
    """刪除收藏餐廳（僅 her 可刪除）"""
    service.delete(favorite_id)
