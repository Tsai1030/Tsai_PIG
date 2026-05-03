"""Agent service for streaming chat responses."""

from __future__ import annotations

import logging
from typing import Any, AsyncGenerator

from langchain_core.messages import BaseMessage

from .agent.graph import build_graph
from .agent.store import get_checkpointer, memory_store, reset_thread

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


def _extract_output_text(output: Any) -> str:
    if isinstance(output, BaseMessage):
        return _extract_text(output.content)

    if isinstance(output, dict):
        content_text = _extract_text(output.get("content"))
        if content_text:
            return content_text

        messages = output.get("messages")
        if isinstance(messages, list):
            for message in reversed(messages):
                message_text = _extract_output_text(message)
                if message_text:
                    return message_text

    if isinstance(output, list):
        parts = [_extract_output_text(item) for item in output]
        return "".join(part for part in parts if part)

    return ""


def _is_primary_llm_metadata(metadata: Any) -> bool:
    if not isinstance(metadata, dict):
        return False
    return metadata.get("langgraph_node") == "llm"


def _extract_state_text(state: Any) -> str:
    if not isinstance(state, dict):
        return ""

    messages = state.get("messages")
    if isinstance(messages, list):
        for message in reversed(messages):
            message_text = _extract_output_text(message)
            if message_text:
                return message_text

    return _extract_output_text(state)


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
        user_id: str = "",
    ) -> AsyncGenerator[str, None]:
        async for chunk in self._do_stream(thread_id, user_input, user_role, user_id, is_retry=False):
            yield chunk

    async def _do_stream(
        self,
        thread_id: str,
        user_input: str,
        user_role: str,
        user_id: str,
        is_retry: bool,
    ) -> AsyncGenerator[str, None]:
        graph = await _get_graph()
        config = {
            "configurable": {
                "thread_id": thread_id,
                "user_id": user_id,
                "user_role": user_role,
            }
        }
        input_state = {"user_input": user_input, "user_role": user_role, "user_id": user_id}
        emitted_text = False
        fallback_text = ""
        streamed_text = ""
        checkpoint_error = False

        try:
            async for mode, payload in graph.astream(
                input_state,
                config=config,
                stream_mode=["messages", "values"],
            ):
                if mode == "messages":
                    chunk, metadata = payload
                    node_name = metadata.get("langgraph_node") if isinstance(metadata, dict) else None
                    logger.info("agent_stream mode=messages node=%s", node_name)

                    if not _is_primary_llm_metadata(metadata):
                        continue

                    chunk_text = _extract_text(getattr(chunk, "content", None))
                    if chunk_text:
                        emitted_text = True
                        streamed_text += chunk_text
                        yield chunk_text
                    continue

                if mode == "values":
                    logger.info("agent_stream mode=values")
                    state_text = _extract_state_text(payload)
                    if state_text:
                        fallback_text = state_text

        except Exception as exc:
            err_str = str(exc)
            if "Got unknown type" in err_str:
                checkpoint_error = True
                logger.warning(
                    "Corrupted checkpoint detected thread=%s, clearing and retrying (is_retry=%s)",
                    thread_id, is_retry,
                )
            else:
                logger.error("astream_events error (thread=%s): %s: %s", thread_id, type(exc).__name__, exc)

        # Auto-recover: clear corrupted checkpoint and retry once
        if checkpoint_error and not is_retry:
            await reset_thread(thread_id)
            async for chunk in self._do_stream(thread_id, user_input, user_role, user_id, is_retry=True):
                yield chunk
            return

        if checkpoint_error and is_retry:
            yield "抱歉，對話記憶讀取失敗，已自動重置，請重新傳送您的訊息。"
            return

        if emitted_text and fallback_text.startswith(streamed_text) and len(fallback_text) > len(streamed_text):
            yield fallback_text[len(streamed_text):]
            return

        if not emitted_text and fallback_text:
            yield fallback_text
            return

        if emitted_text:
            return

        logger.warning("stream_chat produced no visible text. role=%s thread=%s", user_role, thread_id)
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
