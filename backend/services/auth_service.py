"""
AuthService — 登入驗證 + JWT 產生
"""

from fastapi import HTTPException, status

from core.security import create_access_token, hash_password, verify_password
from models.user import User
from repositories.user_repository import UserRepository
from schemas.auth import LoginRequest, TokenResponse


class AuthService:

    def __init__(self, repo: UserRepository):
        self.repo = repo

    def login(self, data: LoginRequest) -> TokenResponse:
        user = self.repo.get_by_nickname(data.nickname)
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="帳號或密碼錯誤",
            )
        token = create_access_token({"sub": user.id, "role": user.role})
        return TokenResponse(
            access_token=token,
            role=user.role,
            nickname=user.nickname,
        )

    def seed_default_users(self) -> None:
        """建立預設使用者（開發用）：her / him"""
        if not self.repo.get_by_role("her"):
            self.repo.create(User(
                role="her",
                nickname="公主",
                password_hash=hash_password("her123"),
            ))
        if not self.repo.get_by_role("him"):
            self.repo.create(User(
                role="him",
                nickname="王子",
                password_hash=hash_password("him123"),
            ))
