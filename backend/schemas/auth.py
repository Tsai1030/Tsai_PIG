"""
Auth 相關 Pydantic Schemas
"""

from pydantic import BaseModel


class LoginRequest(BaseModel):
    nickname: str
    password: str


class LoginResponse(BaseModel):
    """登入成功回應（token 不在 body，透過 httpOnly Cookie 傳遞）"""
    role: str
    nickname: str


class MeResponse(BaseModel):
    """/api/auth/me 回應"""
    role: str
    nickname: str
