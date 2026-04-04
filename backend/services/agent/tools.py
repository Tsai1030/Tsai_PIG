"""
Agent Tools — LangGraph @tool 定義

三個工具：
1. classify_restaurant  — 根據餐廳名稱+地址+現有資料夾，LLM 動態分類
2. reclassify_restaurant — 對話糾錯，將餐廳移到正確資料夾
3. web_search           — Tavily 網路搜尋，查詢真實餐廳資訊
"""

import json
import logging

import httpx
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from core.config import settings

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
async def web_search(query: str) -> str:
    """
    搜尋網路上最新的餐廳評論與美食推薦。
    當使用者詢問特定地區或菜系的餐廳、或需要真實評價時使用。
    不要用來分類或收藏餐廳，僅用於查詢資訊。
    """
    api_key = settings.TAVILY_WEBSEARCH_API_KEY
    if not api_key:
        return "網路搜尋功能未啟用（未設定 API 金鑰）。"

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
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
