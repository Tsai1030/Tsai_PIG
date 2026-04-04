# -*- coding: utf-8 -*-
"""
test_calendar -- Calendar Repository + Service tests
"""

import datetime

import pytest

from models.meal_plan import MealPlan
from repositories.meal_plan_repository import MealPlanRepository
from schemas.calendar import MealPlanCreate
from services.calendar_service import CalendarService


class TestMealPlanRepository:

    def test_upsert_creates_new(self, db):
        repo = MealPlanRepository(db)
        plan = repo.upsert(
            user_id="test-user",
            plan_date=datetime.date(2026, 4, 10),
            meal_type="lunch",
            restaurant_name="test-restaurant",
            address="test-addr",
            note=None,
        )
        assert plan.restaurant_name == "test-restaurant"
        assert plan.meal_type == "lunch"

    def test_upsert_updates_existing(self, db):
        repo = MealPlanRepository(db)
        repo.upsert(
            user_id="test-user",
            plan_date=datetime.date(2026, 4, 10),
            meal_type="lunch",
            restaurant_name="old-restaurant",
            address="addr-1",
            note=None,
        )
        updated = repo.upsert(
            user_id="test-user",
            plan_date=datetime.date(2026, 4, 10),
            meal_type="lunch",
            restaurant_name="new-restaurant",
            address="addr-2",
            note=None,
        )
        assert updated.restaurant_name == "new-restaurant"

    def test_get_by_month(self, db):
        repo = MealPlanRepository(db)
        repo.upsert(
            user_id="u1",
            plan_date=datetime.date(2026, 4, 5),
            meal_type="dinner",
            restaurant_name="A",
            address="",
            note=None,
        )
        repo.upsert(
            user_id="u1",
            plan_date=datetime.date(2026, 5, 1),
            meal_type="breakfast",
            restaurant_name="B",
            address="",
            note=None,
        )
        results = repo.get_by_month(2026, 4)
        assert len(results) == 1
        assert results[0].restaurant_name == "A"


class TestCalendarService:

    def test_upsert_succeeds(self, db):
        repo = MealPlanRepository(db)
        service = CalendarService(repo)
        result = service.upsert(
            user_id="test-user",
            data=MealPlanCreate(
                plan_date=datetime.date(2026, 4, 10),
                meal_type="lunch",
                restaurant_name="test-restaurant",
                address="test-addr",
            ),
        )
        assert result.restaurant_name == "test-restaurant"

    def test_upsert_rejects_invalid_meal_type(self, db):
        from fastapi import HTTPException

        repo = MealPlanRepository(db)
        service = CalendarService(repo)
        with pytest.raises(HTTPException) as exc_info:
            service.upsert(
                user_id="test-user",
                data=MealPlanCreate(
                    plan_date=datetime.date(2026, 4, 10),
                    meal_type="snack",
                    restaurant_name="test",
                    address="test",
                ),
            )
        assert exc_info.value.status_code == 422
