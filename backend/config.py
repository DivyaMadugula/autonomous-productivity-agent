import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    MAX_TASKS_PER_SLOT = 2

settings = Settings()