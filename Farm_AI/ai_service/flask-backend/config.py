import os
from dotenv import load_dotenv

load_dotenv()

weather_api_key = "9d7cde1f6d07ec55650544be1631307e"
gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")