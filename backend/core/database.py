"""
SQLAlchemy 資料庫引擎與 Session 管理
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from core.config import settings

# SQLite 需要 check_same_thread=False 才能跨線程使用
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI Dependency — 提供 DB Session，請求結束自動關閉"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
