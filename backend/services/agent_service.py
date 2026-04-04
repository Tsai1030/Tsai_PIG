"""Agent service for streaming chat responses."""

from __future__ import annotations

import logging
from typing import Any, AsyncGenerator

from langchain_core.messages import AIMessage, SystemMessage

from .agent.graph import build_graph
from .agent.store import get_checkpointer, memory_store

logger = logging.getLogger(__name__)

_graph = None


def _extract_text(content: Any) -> str:
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
                continue
            if isinstance(item, dict):
                text = item.get("text")
                if isinstance(text, str):
                    parts.append(text)
        return "".join(parts)

    if isinstance(content, dict):
        text = content.get("text")
        if isinstance(text, str):
            return text

    return ""


def _is_primary_llm_event(event: dict[str, Any]) -> bool:
    metadata = event.get("metadata", {})
    if not isinstance(metadata, dict):
        return False
    return metadata.get("langgraph_node") == "llm"


async def _get_graph():
    global _graph
    if _graph is None:
        checkpointer = await get_checkpointer()
        _graph = build_graph(store=memory_store, checkpointer=checkpointer)
    return _graph


class AgentService:
    async def stream_chat(
        self,
        thread_id: str,
        user_input: str,
        user_role: str,
    ) -> AsyncGenerator[str, None]:
        graph = await _get_graph()
        config = {"configurable": {"thread_id": thread_id}}
        input_state = {"user_input": user_input, "user_role": user_role}
        emitted_text = False
        fallback_text = ""

        try:
            async for event in graph.astream_events(
                input_state,
                config=config,
                version="v2",
            ):
                etype = event.get("event", "")
                metadata = event.get("metadata", {})
                node_name = metadata.get("langgraph_node") if isinstance(metadata, dict) else None

                logger.info("agent_event event=%s node=%s", etype, node_name)

                if not _is_primary_llm_event(event):
                    continue

                if etype == "on_chat_model_stream":
                    chunk = event.get("data", {}).get("chunk")
                    chunk_text = _extract_text(getattr(chunk, "content", None))
                    if chunk_text:
                        emitted_text = True
                        yield chunk_text
                    continue

                if etype == "on_chat_model_end":
                    output = event.get("data", {}).get("output")
                    end_text = _extract_text(getattr(output, "content", None))
                    logger.info("agent_llm_end node=%s has_text=%s", node_name, bool(end_text))
                    if end_text and not emitted_text:
                        fallback_text = end_text

        except Exception as exc:
            logger.error("astream_events error (thread=%s): %s: %s", thread_id, type(exc).__name__, exc)
            if fallback_text:
                logger.info("using fallback_text captured before exception")
            elif emitted_text:
                return

        if not emitted_text and fallback_text:
            yield fallback_text
            return

        if emitted_text:
            return

        try:
            snapshot = await graph.aget_state(config)
            values = snapshot.values if snapshot else {}
            messages = values.get("messages", []) if isinstance(values, dict) else []
            for msg in reversed(messages):
                if not isinstance(msg, AIMessage):
                    continue
                state_text = _extract_text(msg.content).strip()
                logger.info(
                    "agent_state_fallback role=%s thread=%s has_text=%s",
                    user_role,
                    thread_id,
                    bool(state_text),
                )
                if state_text:
                    yield state_text
                    return
        except Exception as exc:
            logger.warning("stream_chat state fallback failed: %s", exc)

        logger.warning(
            "stream_chat produced no visible assistant text. role=%s thread=%s",
            user_role,
            thread_id,
        )
        yield "抱歉，我剛才沒有成功回應，請再說一次。"

    async def get_state(self, thread_id: str) -> dict | None:
        graph = await _get_graph()
        config = {"configurable": {"thread_id": thread_id}}
        try:
            snapshot = await graph.aget_state(config)
            if not snapshot or not snapshot.values:
                return None
            state = snapshot.values
            return {
                "thread_id": thread_id,
                "turn_count": state.get("turn_count", 0),
                "needs_reminder": state.get("needs_reminder", False),
                "summary": state.get("summary", ""),
                "user_preferences": state.get("user_preferences", {}),
                "available_folders": state.get("available_folders", []),
                "recommended": state.get("recommended", []),
                "last_category_result": state.get("last_category_result"),
                "message_count": len(state.get("messages", [])),
            }
        except Exception as exc:
            logger.error("get_state failed: %s", exc)
            return None
