# -*- coding: utf-8 -*-
"""
test_agent -- Agent System Prompt loading tests
"""

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
