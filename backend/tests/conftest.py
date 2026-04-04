"""
Test Conftest — 共用 fixture（in-memory SQLite + 測試用 FastAPI client）
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from core.database import get_db
from core.security import get_current_user
from main import app
from models.base import Base

TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(bind=engine)


@pytest.fixture(autouse=True)
def setup_db():
    """每個測試前建表、結束後清表。"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def override_db(db: Session):
    """覆蓋 FastAPI 的 get_db dependency。"""
    def _override():
        yield db
    app.dependency_overrides[get_db] = _override
    yield db
    app.dependency_overrides.pop(get_db, None)


def make_user_override(role: str, user_id: str = "test-user-id"):
    """產生一個覆蓋 get_current_user 的 fixture helper。"""
    async def _override():
        return {"user_id": user_id, "role": role}
    return _override


@pytest.fixture
def her_user():
    """模擬 her 角色登入。"""
    override = make_user_override("her")
    app.dependency_overrides[get_current_user] = override
    yield
    app.dependency_overrides.pop(get_current_user, None)


@pytest.fixture
def him_user():
    """模擬 him 角色登入。"""
    override = make_user_override("him")
    app.dependency_overrides[get_current_user] = override
    yield
    app.dependency_overrides.pop(get_current_user, None)
