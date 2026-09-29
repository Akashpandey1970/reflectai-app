import os
from langchain_groq import ChatGroq
from app.core.config import settings

def get_grok_llm(temperature: float = 0.0, max_tokens: int = 600):
    # Read API key safely from settings or fallback to system environment
    api_key = getattr(settings, "GROQ_API_KEY", None) or os.getenv("GROQ_API_KEY")
    
    if not api_key:
        raise ValueError("GROQ_API_KEY is missing in backend/.env")

    return ChatGroq(
        model_name="openai/gpt-oss-20b",
        temperature=temperature,
        max_tokens=max_tokens,
        groq_api_key=api_key,
    )