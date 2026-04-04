from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langgraph.store.memory import InMemoryStore

CHECKPOINT_DB_PATH = "./checkpoints.db"

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
