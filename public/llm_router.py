"""
llm_router.py
Fast Cloud Semantic Router for Deep Reasoning & Advanced Logic (Episode 17).
Built by Swayam Dhawale, Founder of Pulse of AI.
"""

import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

def query_deepseek_reasoning(query: str) -> str:
    """Invokes high-depth mathematical and algorithmic reasoning engine."""
    if not client:
        return f"Deep reasoning engine offline. Please verify API key, sir."
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"Solve this with deep logical clarity and provide a single concise final result: {query}"
        )
        return response.text.strip() if response and response.text else "Reasoning complete, sir."
    except Exception as e:
        return f"Reasoning exception: {str(e)}"
