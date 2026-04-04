"""
Agent Nodes — LangGraph StateGraph 的 6 個節點函數

1. session_start_node  — 讀取長期偏好 + 現有資料夾，注入 System Prompt
2. preprocess_node     — turn+1，注入 summary，30 輪提醒 flag
3. llm_node            — ChatOpenAI.bind_tools，含串流
4. postprocess_node    — LLM structured output 解析推薦 + 30 輪提醒
5. summarize_node      — gpt-nano 漸進摘要，RemoveMessage 刪舊
6. write_preferences_node — 從 summary 萃取偏好 JSON，寫入 Store
"""

import json
import logging

from langchain_core.messages import (
    AIMessage,
    HumanMessage,
    RemoveMessage,
    SystemMessage,
)
from langchain_openai import ChatOpenAI
from langgraph.store.base import BaseStore

from core.config import settings

from .prompts import build_system_prompt
from .state import AgentState
from .tools import add_to_calendar, classify_restaurant, reclassify_restaurant, save_favorite, web_search

logger = logging.getLogger(__name__)

# ── LLM 實例（混用策略）─────────────────────────────────
llm = ChatOpenAI(
    model=settings.LLM_MAIN,
    api_key=settings.OPENAI_API_KEY,
    max_completion_tokens=4000,
    streaming=True,
)
llm_nano = ChatOpenAI(
    model=settings.LLM_NANO,
    api_key=settings.OPENAI_API_KEY,
    max_completion_tokens=1000,
)

# her 可用所有工具（含日曆）；him 不含 add_to_calendar
_TOOLS_HER = [classify_restaurant, reclassify_restaurant, web_search, save_favorite, add_to_calendar]
_TOOLS_HIM = [classify_restaurant, reclassify_restaurant, web_search, save_favorite]

llm_with_tools_her = llm.bind_tools(_TOOLS_HER)
llm_with_tools_him = llm.bind_tools(_TOOLS_HIM)

COMPACT_EVERY = 10
KEEP_RECENT = 8
REMINDER_AT = 30


# ── 1. session_start_node ────────────────────────────────────


def session_start_node(state: AgentState, store: BaseStore) -> dict:
    """
    每次 session 的第一個節點。
    - 從 Store 讀取 user_preferences + available_folders
    - 僅第一輪（turn_count == 0）才完整初始化 State
    - 後續輪次只更新 available_folders（新收藏後可能增加）
    """
    user_id = state["user_role"]
    namespace = (user_id, "preferences")
    items = store.search(namespace)
    prefs = items[0].value if items else {}

    folder_ns = (user_id, "folders")
    folder_items = store.search(folder_ns)
    folders = folder_items[0].value.get("list", []) if folder_items else []

    is_first_turn = state.get("turn_count", 0) == 0
    system_content = build_system_prompt(prefs, user_role=user_id)

    base: dict = {
        "available_folders": folders,
        "user_preferences": prefs,
    }

    if is_first_turn:
        base.update(
            {
                "messages": [SystemMessage(content=system_content)],
                "summary": "",
                "turn_count": 0,
                "needs_reminder": False,
                "recommended": [],
            }
        )

    return base


# ── 2. preprocess_node ───────────────────────────────────────


def preprocess_node(state: AgentState) -> dict:
    """turn+1、注入 summary（更新 SystemMessage 而非新增）、30 輪提醒 flag。"""
    new_turn = state["turn_count"] + 1
    needs_remind = new_turn >= REMINDER_AT

    msgs = state["messages"]
    updates: list = []

    summary = state.get("summary", "")
    if summary:
        # 找到既有的 summary SystemMessage，更新它；沒有就新增一條
        summary_content = f"【對話摘要 - 之前聊過的內容】\n{summary}"
        existing_summary_msg = next(
            (m for m in msgs if isinstance(m, SystemMessage) and m.content.startswith("【對話摘要")),
            None,
        )
        if existing_summary_msg:
            # 刪除舊的，加入更新後的
            updates.append(RemoveMessage(id=existing_summary_msg.id))
            updates.append(SystemMessage(content=summary_content))
        else:
            updates.append(SystemMessage(content=summary_content))

    updates.append(HumanMessage(content=state["user_input"]))

    return {
        "messages": updates,
        "turn_count": new_turn,
        "needs_reminder": needs_remind,
    }


# ── 3. llm_node ─────────────────────────────────────────────


async def llm_node(state: AgentState) -> dict:
    """LLM 節點：依 user_role 使用對應工具集。"""
    bound = llm_with_tools_her if state.get("user_role") == "her" else llm_with_tools_him
    response = await bound.ainvoke(state["messages"])
    return {"messages": [response]}


# ── 4. postprocess_node ──────────────────────────────────────


async def postprocess_node(state: AgentState) -> dict:
    """解析推薦餐廳名稱 + 30 輪可愛提醒。"""
    msgs = state["messages"]
    last_ai_content = msgs[-1].content if msgs else ""
    new_recommended = list(state["recommended"])

    if last_ai_content.strip():
        extract_prompt = (
            "從以下回覆中，找出所有被推薦的餐廳名稱。\n"
            '只回傳 JSON，格式：{"restaurants": ["餐廳A", "餐廳B"]}\n'
            '若沒有推薦任何餐廳，回傳：{"restaurants": []}\n\n'
            f"回覆內容：\n{last_ai_content}"
        )
        try:
            resp = await llm_nano.ainvoke(extract_prompt)
            parsed = json.loads(resp.content)
            for name in parsed.get("restaurants", []):
                if name and name not in new_recommended:
                    new_recommended.append(name)
        except Exception:
            pass

    updated_msgs = []
    if state["needs_reminder"] and msgs and state.get("user_role") == "her":
        reminder = (
            "\n\n---\n"
            "（糖糖偷偷趴在桌上，用最後一口氣說）\n"
            "公主殿下～糖糖今天陪您聊了好久好久了... 小翅膀已經快飛不動了 🪽💦\n"
            "如果要繼續探索美食，可以開一個新的對話視窗，糖糖就會元氣滿滿地回來喔！\n"
            "（但如果公主非要繼續，糖糖還是會撐著回答的啦 💕）"
        )
        last = msgs[-1]
        updated_msgs = [
            RemoveMessage(id=last.id),
            AIMessage(content=last.content + reminder),
        ]

    return {
        "messages": updated_msgs,
        "recommended": new_recommended,
    }


# ── 5. summarize_node ────────────────────────────────────────


async def summarize_node(state: AgentState) -> dict:
    """漸進式 Compact：gpt-nano 摘要 + RemoveMessage 保留最近 4 條。"""
    existing_summary = state.get("summary", "")
    msgs = state["messages"]

    if existing_summary:
        prompt = (
            f"這是目前的對話摘要：\n{existing_summary}\n\n"
            "請根據以上新訊息，延伸並更新這份摘要，特別記錄："
            "使用者喜歡 / 不喜歡的食物種類、價位偏好、情緒習慣。"
            "摘要用繁體中文，150 字以內。"
        )
    else:
        prompt = (
            "請把以上對話整理成簡短摘要，特別記錄："
            "使用者喜歡 / 不喜歡的食物種類、價位偏好、情緒與推薦偏好。"
            "摘要用繁體中文，150 字以內。"
        )

    sum_msgs = msgs + [HumanMessage(content=prompt)]
    response = await llm_nano.ainvoke(sum_msgs)
    new_summary = response.content

    system_msgs = [m for m in msgs if isinstance(m, SystemMessage)]
    recent_msgs = [m for m in msgs if not isinstance(m, SystemMessage)][
        -KEEP_RECENT:
    ]
    delete_msgs = [
        RemoveMessage(id=m.id)
        for m in msgs
        if m not in system_msgs and m not in recent_msgs
    ]

    return {
        "summary": new_summary,
        "messages": delete_msgs,
    }


# ── 6. write_preferences_node ────────────────────────────────


async def write_preferences_node(state: AgentState, store: BaseStore) -> dict:
    """從 summary 萃取偏好 JSON，寫入長期 Store。"""
    if not state.get("summary"):
        return {}

    extract_prompt = (
        "從以下對話摘要中萃取使用者的飲食偏好，以 JSON 回傳：\n"
        f"{state['summary']}\n\n"
        "格式：\n"
        '{"likes": ["燒烤", "火鍋"], "dislikes": ["香菜"], '
        '"price": "$$", "mood_map": {"累": "外送", "開心": "餐廳"}}\n\n'
        "只回傳 JSON，不要其他文字。"
    )

    try:
        response = await llm_nano.ainvoke(extract_prompt)
        new_prefs = json.loads(response.content)
    except Exception:
        return {}

    user_id = state["user_role"]
    namespace = (user_id, "preferences")
    store.put(namespace, "user_prefs", new_prefs)

    return {"user_preferences": new_prefs}
