from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Fizyoterapi Platformu API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"

    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_minutes: int = 60 * 24 * 7

    supabase_url: str
    supabase_anon_key: str
    database_url: str

    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://localhost:19006",
            "http://localhost:8081",
        ]
    )

    ai_min_detection_confidence: float = 0.5
    ai_min_tracking_confidence: float = 0.5

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


settings = Settings()
