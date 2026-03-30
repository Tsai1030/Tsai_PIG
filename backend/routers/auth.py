"""
Auth Router — login (Set-Cookie) / logout (clear Cookie) / me
"""

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from core.config import settings
from core.database import get_db
from core.security import COOKIE_NAME, get_current_user
from repositories.user_repository import UserRepository
from schemas.auth import LoginRequest, LoginResponse, MeResponse
from services.auth_service import AuthService

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    service = AuthService(UserRepository(db))
    result = service.login(data)

    response = JSONResponse(
        content=LoginResponse(role=result.role, nickname=result.nickname).model_dump()
    )
    response.set_cookie(
        key=COOKIE_NAME,
        value=result.token,
        httponly=True,
        samesite="lax",
        secure=False,  # 開發環境 HTTP；正式部署改 True
        max_age=settings.JWT_EXPIRE_MINUTES * 60,
        path="/",
    )
    return response


@router.post("/logout")
async def logout():
    response = JSONResponse(content={"message": "已登出"})
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        httponly=True,
        samesite="lax",
    )
    return response


@router.get("/me", response_model=MeResponse)
async def me(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """從 Cookie 的 JWT 取得當前使用者資訊"""
    repo = UserRepository(db)
    user = repo.get_by_id(current_user["user_id"])
    if not user:
        return JSONResponse(status_code=401, content={"detail": "使用者不存在"})
    return MeResponse(role=user.role, nickname=user.nickname)
