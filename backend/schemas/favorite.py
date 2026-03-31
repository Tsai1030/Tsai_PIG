"""
Favorite Pydantic Schemas — 收藏餐廳請求/回應格式
"""

import datetime
from typing import Any, Optional

from pydantic import BaseModel


class FavoriteCreate(BaseModel):
    restaurant_name: str
    address: str
    maps_url: Optional[str] = None


class FavoriteResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    restaurant_name: str
    address: str
    maps_url: Optional[str]
    category: str
    category_tags: Optional[list[Any]]
    created_at: datetime.datetime
