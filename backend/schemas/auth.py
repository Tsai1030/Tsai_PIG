"""
Auth 相關 Pydantic Schemas
"""

from pydantic import BaseModel


class LoginRequest(BaseModel):
    nickname: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    nickname: str
