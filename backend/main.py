"""
甜蜜食記 — FastAPI 後端入口
Sweet Food Diary Backend Entry Point
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.database import SessionLocal, engine
from models.base import Base
from models.favorite import Favorite  # noqa: F401 — 確保 ORM Model 被載入
from models.user import User  # noqa: F401 — 確保 ORM Model 被載入
from repositories.user_repository import UserRepository
from routers import auth, calendar, favorites
from services.auth_service import AuthService


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup：建表 + 種子資料 ──────────────────────────
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        AuthService(UserRepository(db)).seed_default_users()
    finally:
        db.close()
    yield
    # ── Shutdown ──────────────────────────────────────────


app = FastAPI(
    title="甜蜜食記 API",
    description="Sweet Food Diary — 情侶美食點餐 App 後端 API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — 允許前端 Next.js 開發伺服器存取
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """健康檢查端點"""
    return {"status": "ok", "app": "sweet-food-diary"}


# ── Router 掛載 ──────────────────────────────────────────
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["Calendar"])
app.include_router(favorites.router, prefix="/api/favorites", tags=["Favorites"])
# app.include_router(agent.router, prefix="/api/agent", tags=["Agent"])
