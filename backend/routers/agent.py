"""
Agent Router — AI 美食顧問對話端點

- POST /api/agent/chat  — SSE 串流對話
- GET  /api/agent/state — Debug 用，回傳完整 State JSON（dev only）
"""

import json
import os
import time
import uuid
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from core.security import get_current_user
from services.agent_service import AgentService

router = APIRouter()

_agent_service = AgentService()

# ── Rate Limiting：每 thread_id 每小時最多 20 次 ──────────
RATE_LIMIT = 20
RATE_WINDOW = 3600  # 1 hour in seconds
_rate_store: dict[str, list[float]] = defaultdict(list)


def _check_rate_limit(thread_id: str) -> None:
    now = time.time()
    timestamps = _rate_store[thread_id]
    _rate_store[thread_id] = [t for t in timestamps if now - t < RATE_WINDOW]
    if len(_rate_store[thread_id]) >= RATE_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"此對話已達每小時 {RATE_LIMIT} 次上限，請稍後再試",
        )
    _rate_store[thread_id].append(now)


class ChatRequest(BaseModel):
    message: str
    thread_id: str | None = None


@router.post("/chat")
async def chat(
    body: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    """SSE 串流對話端點。thread_id 為空時自動產生新 session。"""
    thread_id = body.thread_id or str(uuid.uuid4())
    _check_rate_limit(thread_id)
    user_role = current_user["role"]

    async def event_stream():
        yield f"data: {json.dumps({'thread_id': thread_id})}\n\n"
        async for chunk in _agent_service.stream_chat(
            thread_id=thread_id,
            user_input=body.message,
            user_role=user_role,
        ):
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/state")
async def get_state(
    thread_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Debug 用：回傳完整 State JSON。僅 dev 環境開放。"""
    is_dev = os.getenv("ENV", "dev") == "dev"
    if not is_dev:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="此端點僅限開發環境使用",
        )
    state = await _agent_service.get_state(thread_id)
    if not state:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="找不到指定的對話",
        )
    return state
