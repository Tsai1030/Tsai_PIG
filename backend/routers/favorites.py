"""
Favorites Router — 收藏餐廳 CRUD
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from middleware.auth_middleware import require_role
from repositories.favorite_repository import FavoriteRepository
from schemas.favorite import FavoriteCreate, FavoriteResponse, ReclassifyRequest
from services.favorite_service import FavoriteService

router = APIRouter()


def get_favorite_service(db: Session = Depends(get_db)) -> FavoriteService:
    return FavoriteService(FavoriteRepository(db))


@router.get("", response_model=list[FavoriteResponse])
async def get_favorites(
    current_user: dict = Depends(get_current_user),
    service: FavoriteService = Depends(get_favorite_service),
):
    """取得所有收藏（flat list，供地圖側邊欄使用）"""
    return service.get_all()


@router.get("/grouped", response_model=dict[str, list[FavoriteResponse]])
async def get_favorites_grouped(
    current_user: dict = Depends(get_current_user),
    service: FavoriteService = Depends(get_favorite_service),
):
    """取得分組後的收藏（{category: [Favorite]}，供收藏資料夾頁使用）"""
    return service.get_grouped()


@router.post("", response_model=FavoriteResponse, status_code=201)
async def create_favorite(
    data: FavoriteCreate,
    current_user: dict = Depends(require_role("her")),
    service: FavoriteService = Depends(get_favorite_service),
):
    """新增收藏餐廳，後端自動呼叫 classify_restaurant 填入分類（僅 her 可寫入）"""
    return service.create(current_user["user_id"], data)


@router.patch("/reclassify")
async def reclassify_favorite(
    body: ReclassifyRequest,
    current_user: dict = Depends(require_role("her")),
    service: FavoriteService = Depends(get_favorite_service),
):
    """reclassify：將餐廳移到正確的分類資料夾（僅 her 可操作）"""
    service.update_category(body.restaurant_name, body.correct_category)
    return {"message": f"已將「{body.restaurant_name}」移到「{body.correct_category}」資料夾 ✅"}


@router.delete("/{favorite_id}", status_code=204)
async def delete_favorite(
    favorite_id: str,
    current_user: dict = Depends(require_role("her")),
    service: FavoriteService = Depends(get_favorite_service),
):
    """刪除收藏餐廳（僅 her 可刪除）"""
    service.delete(favorite_id)
