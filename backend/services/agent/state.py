"""
AgentState — LangGraph 全局共享狀態定義
"""

import operator
from typing import Annotated, TypedDict

from langchain_core.messages import BaseMessage


class AgentState(TypedDict):
    """
    LangGraph StateGraph 全局共享狀態。
    每個 Node 返回 dict 的部分欄位，框架自動 merge。

    -- 對話核心 --
    messages       : 當前視窗內的完整訊息（自動 append，compact 後保留最近 4 條）
    summary        : 漸進式摘要字串，取代被壓縮的舊訊息
    turn_count     : 累計輪數（不因 compact 重置，永久遞增）
    needs_reminder : turn >= 30 後每輪設為 True，結尾附加糖糖可愛提醒台詞

    -- 用戶與角色 --
    user_id        : 資料庫用戶 ID（用於寫入收藏/日曆）
    user_role      : "her" 或 "him"
    user_input     : 本輪原始輸入

    -- 長期偏好（從 Store 讀入，每次 session 開始注入）--
    user_preferences : 使用者偏好快照 JSON

    -- 推薦去重 --
    recommended    : 本 session 已推薦餐廳名稱

    -- 收藏分類 --
    pending_favorite     : 待收藏店家 {name, address}
    last_category_result : 最近分類結果 {name, category, is_new_folder}
    available_folders    : 從 DB 動態讀取的現有資料夾名稱列表
    """

    messages: Annotated[list[BaseMessage], operator.add]
    summary: str
    turn_count: int
    needs_reminder: bool
    user_id: str
    user_role: str
    user_input: str
    user_preferences: dict
    recommended: list[str]
    pending_favorite: dict | None
    last_category_result: dict | None
    available_folders: list[str]
