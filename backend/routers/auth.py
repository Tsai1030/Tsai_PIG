"""
Auth Router — POST /api/auth/login
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from repositories.user_repository import UserRepository
from schemas.auth import LoginRequest, TokenResponse
from services.auth_service import AuthService

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    service = AuthService(UserRepository(db))
    return service.login(data)
