"""
Agent Tools — AI 工具函數

⚠️ S6 pre-build 說明：
    classify_restaurant 在 S6 以普通 async function 實作，供收藏模組直接 invoke。
    S7 將此函數升級為 LangGraph @tool，並加入 reclassify_restaurant、
    bind 進 StateGraph，完整整合進 Agent 對話流程。
    S7 升級時只需：
      1. 加上 @tool decorator 與 Pydantic Input Schema
      2. 移除此檔案內的直接 OpenAI 呼叫，改由 ToolNode 驅動
"""

import logging

from langchain_openai import ChatOpenAI
from pydantic import BaseModel

from core.config import settings

logger = logging.getLogger(__name__)

_llm = ChatOpenAI(
    model=settings.LLM_MAIN,
    api_key=settings.OPENAI_API_KEY,
)


class _ClassifyResult(BaseModel):
    category: str
    category_tags: list[str]
    is_new_folder: bool


_llm_structured = _llm.with_structured_output(_ClassifyResult)

_CLASSIFY_PROMPT = """你是一個餐廳分類助手。請分析這間餐廳並決定：
1. category：從現有資料夾中選最適合的，若都不符合則建立新的中文分類名稱（如：日式料理、火鍋、燒烤、咖啡甜點）
2. category_tags：最多 3 個簡短中文標籤（如：辣、適合約會、平價）
3. is_new_folder：若 category 不在現有資料夾中則為 true

餐廳名稱：{restaurant_name}
地址：{address}
現有資料夾：{available_folders}"""


async def classify_restaurant(
    restaurant_name: str,
    address: str,
    available_folders: list[str],
) -> dict:
    """呼叫 LLM 分類餐廳，回傳 {category, category_tags, is_new_folder}。"""
    prompt = _CLASSIFY_PROMPT.format(
        restaurant_name=restaurant_name,
        address=address,
        available_folders="、".join(available_folders) if available_folders else "（目前沒有資料夾）",
    )
    try:
        result: _ClassifyResult = await _llm_structured.ainvoke(prompt)
        return {
            "category": result.category,
            "category_tags": result.category_tags,
            "is_new_folder": result.is_new_folder,
        }
    except Exception as e:
        logger.error(f"classify_restaurant failed: {e}")
        return {"category": "其他", "category_tags": [], "is_new_folder": False}
