"""
應用程式設定 — 從 .env 讀取環境變數
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # AI
    OPENAI_API_KEY: str = ""
    LLM_MAIN: str = "gpt-5-mini"
    LLM_NANO: str = "gpt-5-nano"

    # Database
    DATABASE_URL: str = "sqlite:///./sweet_food.db"

    # JWT
    JWT_SECRET: str = "change-me-to-a-strong-random-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080  # 7 天

    # Google Maps
    GOOGLE_MAPS_API_KEY: str = ""

    # Tavily Web Search
    TAVILY_WEBSEARCH_API_KEY: str = ""

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
