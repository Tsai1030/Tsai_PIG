"""
test_auth — 角色保護驗證
"""

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


class TestRoleProtection:
    """驗證 her-only 端點對不同角色的存取控制。"""

    def test_her_can_create_favorite(self, override_db, her_user):
        """her 角色可以建立收藏。"""
        res = client.post(
            "/api/favorites",
            json={
                "restaurant_name": "測試餐廳",
                "address": "台北市信義區",
            },
        )
        # 201 或因 OpenAI key 無���而 500，但不應該是 403
        assert res.status_code != 403

    def test_him_cannot_create_favorite(self, override_db, him_user):
        """him 角色不能建立收藏（403）。"""
        res = client.post(
            "/api/favorites",
            json={
                "restaurant_name": "測試餐廳",
                "address": "台北市信義區",
            },
        )
        assert res.status_code == 403

    def test_him_cannot_delete_favorite(self, override_db, him_user):
        """him 角色不能刪除收藏（403）。"""
        res = client.delete("/api/favorites/some-id")
        assert res.status_code == 403

    def test_unauthenticated_cannot_access_calendar(self):
        """未登入���能存取日曆。"""
        res = client.get("/api/calendar", params={"year": 2026, "month": 4})
        assert res.status_code == 401

    def test_unauthenticated_cannot_access_agent(self):
        """未登入不能存取 Agent。"""
        res = client.post(
            "/api/agent/chat",
            json={"message": "hello"},
        )
        assert res.status_code == 401
