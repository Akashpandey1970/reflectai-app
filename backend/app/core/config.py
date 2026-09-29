from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    GROQ_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    COLLECTION_NAME: str = "enterprise_knowledge"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="allow"  # Extra fields ko allow karega, validation crash nahi hoga
    )

settings = Settings()