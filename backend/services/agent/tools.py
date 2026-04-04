"""
Agent Tools — LangGraph @tool 定義

五個工具：
1. classify_restaurant  — 根據餐廳名稱+地址+現有資料夾，LLM 動態分類
2. reclassify_restaurant — 對話糾錯，將餐廳移到正確資料夾
3. web_search           — Tavily 網路搜尋，查詢真實餐廳資訊
4. save_favorite        — 將餐廳收藏寫入資料庫（her/him 皆可）
5. add_to_calendar      — 將餐廳加入日曆（僅 her）
"""

import datetime
import json
import logging

import httpx
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from core.config import settings
from core.database import SessionLocal

logger = logging.getLogger(__name__)

_llm_classify = ChatOpenAI(
    model=settings.LLM_NANO,
    api_key=settings.OPENAI_API_KEY,
    max_completion_tokens=500,
)


# ── 1. classify_restaurant ──────────────────────────────────


class ClassifyInput(BaseModel):
    restaurant_name: str = Field(description="餐廳名稱")
    address: str = Field(description="餐廳地址（可空白）", default="")
    available_folders: list[str] = Field(
        description="目前已有的資料夾名稱列表", default=[]
    )


@tool("classify_restaurant", args_schema=ClassifyInput)
def classify_restaurant(
    restaurant_name: str,
    address: str = "",
    available_folders: list[str] = [],
) -> dict:
    """
    根據餐廳名稱與地址，由 LLM 自行判斷最適合的餐廳類型。
    優先歸入已有資料夾；若完全沒有合適的現有資料夾，才新建一個。
    當使用者要收藏一家餐廳時呼叫此工具。
    """
    existing = "、".join(available_folders) if available_folders else "（目前尚無資料夾）"
    prompt = f"""你是餐廳分類專家。根據餐廳名稱和地址，判斷這家餐廳最主要的類型。

餐廳名稱：{restaurant_name}
地址：{address}

目前已有的資料夾（請優先從中選一個）：
{existing}

判斷規則：
1. 若餐廳屬於上方任一資料夾 → 選那個資料夾（即使名稱略有差異，如「燒烤」vs「烤肉」請統一選已有的）
2. 若沒有任何合適的現有資料夾 → 自己決定一個簡短的分類名稱（2-4 字，繁體中文）
3. 只回傳 JSON，不要其他文字

回傳格式：
{{"category": "火鍋", "is_new_folder": false}}"""

    try:
        response = _llm_classify.invoke(prompt)
        result = json.loads(response.content)
        category = result.get("category", "其他").strip()
        is_new = result.get("is_new_folder", True)
        return {
            "name": restaurant_name,
            "category": category,
            "is_new_folder": is_new,
        }
    except Exception as e:
        logger.error(f"classify_restaurant failed: {e}")
        return {
            "name": restaurant_name,
            "category": "其他",
            "is_new_folder": False,
        }


# ── 2. reclassify_restaurant ────────────────────────────────


class ReclassifyInput(BaseModel):
    restaurant_name: str = Field(description="要更正分類的餐廳名稱")
    correct_category: str = Field(description="正確的分類資料夾名稱")


@tool("reclassify_restaurant", args_schema=ReclassifyInput)
def reclassify_restaurant(
    restaurant_name: str,
    correct_category: str,
) -> dict:
    """
    當使用者在對話中說某家餐廳分類錯誤，呼叫此工具將其移到正確的資料夾。
    觸發語句範例：「分錯了」「把XX移到XX」「應該是XX類」
    """
    return {
        "restaurant_name": restaurant_name,
        "correct_category": correct_category,
        "action": "reclassify",
        "message": f"已將「{restaurant_name}」移到「{correct_category}」資料夾 ✅",
    }


# ── 3. web_search ───────────────────────────────────────────


class WebSearchInput(BaseModel):
    query: str = Field(description="搜尋查詢，例如：台北中山區鴨肉麵推薦、好吃的日式拉麵 信義區")


@tool("web_search", args_schema=WebSearchInput)
def web_search(query: str) -> str:
    """
    搜尋網路上最新的餐廳評論與美食推薦。
    當使用者詢問特定地區或菜系的餐廳、或需要真實評價時使用。
    不要用來分類或收藏餐廳，僅用於查詢資訊。
    """
    api_key = settings.TAVILY_WEBSEARCH_API_KEY
    if not api_key:
        return "網路搜尋功能未啟用（未設定 API 金鑰）。"

    try:
        with httpx.Client(timeout=15) as client:
            response = client.post(
                "https://api.tavily.com/search",
                json={
                    "api_key": api_key,
                    "query": query,
                    "max_results": 3,
                    "include_answer": True,
                    "search_depth": "basic",
                },
            )
            response.raise_for_status()
            data = response.json()

        parts: list[str] = []
        answer = data.get("answer", "")
        if answer:
            parts.append(f"摘要：{answer}")

        for result in data.get("results", [])[:3]:
            title = result.get("title", "")
            content = (result.get("content") or "")[:300]
            if title and content:
                parts.append(f"【{title}】\n{content}")

        return "\n\n".join(parts) if parts else "未找到相關搜尋結果。"
    except Exception as e:
        logger.error(f"web_search failed: {e}")
        return "搜尋時發生錯誤，請稍後再試。"


# ── 4. save_favorite ────────────────────────────────────────


class SaveFavoriteInput(BaseModel):
    restaurant_name: str = Field(description="要收藏的餐廳名稱")
    address: str = Field(description="餐廳地址（可空白）", default="")
    maps_url: str = Field(description="Google Maps 連結（可空白）", default="")


@tool("save_favorite", args_schema=SaveFavoriteInput)
def save_favorite(
    restaurant_name: str,
    address: str = "",
    maps_url: str = "",
    config: RunnableConfig = None,
) -> str:
    """
    將使用者提到的餐廳加入收藏清單，並自動分類到對應資料夾。
    當使用者說「收藏這間」「幫我加入最愛」「存起來」等語句時呼叫。
    呼叫前先確認有餐廳名稱；若使用者未提供地址則留空。
    """
    from repositories.favorite_repository import FavoriteRepository
    from models.favorite import Favorite

    configurable = (config or {}).get("configurable", {}) if isinstance(config, dict) else getattr(config, "get", lambda k, d=None: d)("configurable", {})
    user_id = configurable.get("user_id", "her") if configurable else "her"

    db = SessionLocal()
    try:
        repo = FavoriteRepository(db)
        available_folders = repo.get_categories()
        classification = classify_restaurant.invoke({
            "restaurant_name": restaurant_name,
            "address": address,
            "available_folders": available_folders,
        })
        fav = Favorite(
            user_id=user_id,
            restaurant_name=restaurant_name,
            address=address,
            maps_url=maps_url or None,
            category=classification["category"],
        )
        repo.create(fav)
        folder = classification["category"]
        return f"已將「{restaurant_name}」收藏到「{folder}」資料夾 ✅"
    except Exception as e:
        logger.error(f"save_favorite failed: {e}")
        return f"收藏失敗，請稍後再試。"
    finally:
        db.close()


# ── 5. add_to_calendar ──────────────────────────────────────

MEAL_TYPE_MAP = {
    "早餐": "breakfast", "早上": "breakfast", "breakfast": "breakfast",
    "午餐": "lunch", "中午": "lunch", "lunch": "lunch",
    "晚餐": "dinner", "晚上": "dinner", "dinner": "dinner",
}


class AddToCalendarInput(BaseModel):
    restaurant_name: str = Field(description="要加入日曆的餐廳名稱")
    address: str = Field(description="餐廳地址（可空白）", default="")
    plan_date: str = Field(description="日期，格式 YYYY-MM-DD，例如 2026-04-04")
    meal_type: str = Field(description="餐別：早餐/午餐/晚餐（或 breakfast/lunch/dinner）")


@tool("add_to_calendar", args_schema=AddToCalendarInput)
def add_to_calendar(
    restaurant_name: str,
    plan_date: str,
    meal_type: str,
    address: str = "",
    config: RunnableConfig = None,
) -> str:
    """
    將選定餐廳加入公主的飲食日曆。僅限 her 角色使用。
    呼叫此工具前必須先向使用者確認：
      1. 是哪一天（今天還是其他日期）
      2. 哪一餐（早餐/午餐/晚餐）
    確認完畢後才呼叫，不要猜測。
    """
    from repositories.meal_plan_repository import MealPlanRepository

    configurable = (config or {}).get("configurable", {}) if isinstance(config, dict) else getattr(config, "get", lambda k, d=None: d)("configurable", {})
    user_id = configurable.get("user_id", "her") if configurable else "her"
    user_role = configurable.get("user_role", "her") if configurable else "her"

    if user_role != "her":
        return "此功能僅限公主使用 💕"

    normalized_meal = MEAL_TYPE_MAP.get(meal_type.strip(), meal_type.strip().lower())
    if normalized_meal not in ("breakfast", "lunch", "dinner"):
        return f"餐別「{meal_type}」無法識別，請說早餐、午餐或晚餐。"

    try:
        parsed_date = datetime.date.fromisoformat(plan_date)
    except ValueError:
        return f"日期格式錯誤：{plan_date}，請使用 YYYY-MM-DD 格式。"

    db = SessionLocal()
    try:
        repo = MealPlanRepository(db)
        repo.upsert(
            user_id=user_id,
            plan_date=parsed_date,
            meal_type=normalized_meal,
            restaurant_name=restaurant_name,
            address=address,
            note=None,
        )
        meal_label = {"breakfast": "早餐", "lunch": "午餐", "dinner": "晚餐"}[normalized_meal]
        return f"已將「{restaurant_name}」加入 {parsed_date} {meal_label}的日曆 📅✅"
    except Exception as e:
        logger.error(f"add_to_calendar failed: {e}")
        return "新增日曆失敗，請稍後再試。"
    finally:
        db.close()
