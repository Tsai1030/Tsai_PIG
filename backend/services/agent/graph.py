"""
Agent Graph — StateGraph 組裝、條件邊、build_graph(store, checkpointer)
"""

from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.store.base import BaseStore

from .nodes import (
    COMPACT_EVERY,
    llm_node,
    postprocess_node,
    preprocess_node,
    session_start_node,
    summarize_node,
    write_preferences_node,
)
from .state import AgentState
from .tools import classify_restaurant, reclassify_restaurant, web_search

tool_node = ToolNode([classify_restaurant, reclassify_restaurant, web_search])


def should_compact(state: AgentState) -> str:
    """條件路由：每 COMPACT_EVERY 輪觸發一次 summarize；否則直接寫偏好。"""
    if state["turn_count"] > 0 and state["turn_count"] % COMPACT_EVERY == 0:
        return "compact"
    return "done"


def build_graph(store: BaseStore, checkpointer) -> StateGraph:
    """組裝完整 StateGraph，注入 store + checkpointer。"""
    graph = StateGraph(AgentState)

    # ── 節點 ──────────────────────────────────────────
    graph.add_node("session_start", session_start_node)
    graph.add_node("preprocess", preprocess_node)
    graph.add_node("llm", llm_node)
    graph.add_node("tools", tool_node)
    graph.add_node("postprocess", postprocess_node)
    graph.add_node("summarize", summarize_node)
    graph.add_node("write_preferences", write_preferences_node)

    # ── 邊 ────────────────────────────────────────────
    graph.add_edge(START, "session_start")
    graph.add_edge("session_start", "preprocess")
    graph.add_edge("preprocess", "llm")

    # LLM → tools（若有 tool_calls）or postprocess
    graph.add_conditional_edges(
        "llm",
        tools_condition,
        {"tools": "tools", "__end__": "postprocess"},
    )
    graph.add_edge("tools", "llm")

    # postprocess → compact 判斷
    graph.add_conditional_edges(
        "postprocess",
        should_compact,
        {"compact": "summarize", "done": "write_preferences"},
    )
    graph.add_edge("summarize", "write_preferences")
    graph.add_edge("write_preferences", END)

    return graph.compile(store=store, checkpointer=checkpointer)
