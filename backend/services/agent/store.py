import logging

import aiosqlite
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langgraph.store.memory import InMemoryStore

CHECKPOINT_DB_PATH = "./checkpoints.db"
logger = logging.getLogger(__name__)

memory_store = InMemoryStore()
_checkpointer_cm = None
_checkpointer: AsyncSqliteSaver | None = None


async def get_checkpointer() -> AsyncSqliteSaver:
    """Return a reusable async SQLite checkpointer for dev."""
    global _checkpointer_cm, _checkpointer
    if _checkpointer is None:
        _checkpointer_cm = AsyncSqliteSaver.from_conn_string(CHECKPOINT_DB_PATH)
        _checkpointer = await _checkpointer_cm.__aenter__()
    return _checkpointer


async def close_checkpointer() -> None:
    """Close checkpointer context on app shutdown."""
    global _checkpointer_cm, _checkpointer
    if _checkpointer_cm is not None:
        await _checkpointer_cm.__aexit__(None, None, None)
    _checkpointer_cm = None
    _checkpointer = None


async def reset_thread(thread_id: str) -> None:
    """Delete all checkpoint data for a thread (called after deserialization failure)."""
    try:
        async with aiosqlite.connect(CHECKPOINT_DB_PATH) as db:
            await db.execute("DELETE FROM checkpoints WHERE thread_id = ?", (thread_id,))
            await db.execute("DELETE FROM writes WHERE thread_id = ?", (thread_id,))
            await db.commit()
        logger.warning("reset_thread: cleared corrupted checkpoint thread=%s", thread_id)
    except Exception as exc:
        logger.error("reset_thread failed thread=%s: %s", thread_id, exc)
