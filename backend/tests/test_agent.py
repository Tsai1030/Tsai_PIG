# -*- coding: utf-8 -*-
"""
test_agent -- Agent System Prompt loading tests
"""

import asyncio

from langchain_core.messages import AIMessage

from services.agent_service import AgentService
from services.agent.prompts import SUGAR_BASE_PROMPT, HIM_BASE_PROMPT, build_system_prompt


class TestBuildSystemPrompt:

    def test_her_base_prompt_contains_persona(self):
        prompt = build_system_prompt({}, user_role="her")
        assert "\u7cd6\u7cd6" in prompt
        assert "\u516c\u4e3b\u6bbf\u4e0b" in prompt

    def test_him_base_prompt_is_professional(self):
        prompt = build_system_prompt({}, user_role="him")
        assert "\u5c08\u696d" in prompt
        assert "\u7cd6\u7cd6" not in prompt

    def test_her_with_preferences_injects_prefs(self):
        prefs = {
            "likes": ["\u71d2\u70e4", "\u706b\u934b"],
            "dislikes": ["\u9999\u83dc"],
            "price": "$$",
            "mood_map": {"\u7d2f": "\u5916\u9001"},
        }
        prompt = build_system_prompt(prefs, user_role="her")
        assert "\u71d2\u70e4" in prompt
        assert "\u9999\u83dc" in prompt
        assert "$$" in prompt

    def test_him_with_preferences_injects_prefs(self):
        prefs = {"likes": ["\u65e5\u5f0f"], "dislikes": [], "price": "$$$"}
        prompt = build_system_prompt(prefs, user_role="him")
        assert "\u65e5\u5f0f" in prompt
        assert "$$$" in prompt

    def test_empty_preferences_returns_base_only(self):
        prompt = build_system_prompt({}, user_role="her")
        assert prompt == SUGAR_BASE_PROMPT

    def test_classify_tool_mentioned_in_prompt(self):
        assert "classify_restaurant" in SUGAR_BASE_PROMPT
        assert "reclassify_restaurant" in SUGAR_BASE_PROMPT

    def test_him_prompt_mentions_classify_tool(self):
        assert "classify_restaurant" in HIM_BASE_PROMPT


class FakeGraph:
    def __init__(self, chunks):
        self._chunks = chunks

    async def astream(self, *_args, **_kwargs):
        for chunk in self._chunks:
            yield chunk


def _collect_stream_chunks(service: AgentService, events) -> list[str]:
    async def _run() -> list[str]:
        async def _fake_get_graph():
            return FakeGraph(events)

        from services import agent_service

        original = agent_service._get_graph
        agent_service._get_graph = _fake_get_graph
        try:
            return [
                chunk
                async for chunk in service.stream_chat(
                    thread_id="thread-1",
                    user_input="你好",
                    user_role="her",
                    user_id="user-1",
                )
            ]
        finally:
            agent_service._get_graph = original

    return asyncio.run(_run())


class TestAgentServiceStreaming:
    def test_stream_chat_streams_message_chunks(self):
        chunks = _collect_stream_chunks(
            AgentService(),
            [
                ("messages", (AIMessage(content="糖糖"), {"langgraph_node": "llm"})),
                ("messages", (AIMessage(content="有收到"), {"langgraph_node": "llm"})),
                (
                    "values",
                    {
                        "messages": [
                            AIMessage(content="糖糖有收到"),
                        ]
                    },
                ),
            ],
        )

        assert chunks == ["糖糖", "有收到"]

    def test_stream_chat_uses_final_state_when_no_message_chunks(self):
        chunks = _collect_stream_chunks(
            AgentService(),
            [
                (
                    "values",
                    {
                        "messages": [
                            AIMessage(content="這是沒有 token stream 時的完整回覆。"),
                        ]
                    },
                ),
            ],
        )

        assert chunks == ["這是沒有 token stream 時的完整回覆。"]

    def test_stream_chat_appends_postprocess_suffix_after_stream(self):
        chunks = _collect_stream_chunks(
            AgentService(),
            [
                ("messages", (AIMessage(content="先回答"), {"langgraph_node": "llm"})),
                (
                    "values",
                    {
                        "messages": [
                            AIMessage(content="先回答，再補一句提醒"),
                        ]
                    },
                ),
            ],
        )

        assert chunks == ["先回答", "，再補一句提醒"]
