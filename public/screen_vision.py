"""
screen_vision.py
Local Zero-Latency Vision Tools & Screen Grounding for JARVIS (Episode 14)
Built by Swayam Dhawale, Founder of Pulse of AI.
"""

import os
import io
import base64
import asyncio
from google import genai
from google.genai import types

try:
    from PIL import ImageGrab
except ImportError:
    ImageGrab = None

try:
    import pyautogui
except ImportError:
    pyautogui = None

api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

def capture_screen_base64() -> str | None:
    """Captures the current active desktop display as a base64 JPEG string."""
    try:
        img = None
        if ImageGrab:
            img = ImageGrab.grab()
        elif pyautogui:
            img = pyautogui.screenshot()
        
        if img:
            buffer = io.BytesIO()
            img.save(buffer, format="JPEG", quality=85)
            return base64.b64encode(buffer.getvalue()).decode("utf-8")
    except Exception as e:
        print(f"Screen capture exception: {e}")
    return None

async def analyze_screen(prompt: str = "Analyze what is visible on my screen.") -> str:
    """Inspects the primary display, reads errors, terminal logs, or Chrome browser content using multimodal vision.
    Args:
        prompt: Question or inspection request about the display.
    """
    img_b64 = capture_screen_base64()
    if not img_b64:
        return "Optical sensors could not capture the active display frame, sir. Please verify desktop permissions."

    if not client:
        return "Gemini Vision client is not initialized. Please verify GOOGLE_API_KEY in your environment, sir."

    try:
        response = await client.aio.models.generateContent(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(
                    data=base64.b64decode(img_b64),
                    mime_type="image/jpeg",
                ),
                f"You are JARVIS with real-life eyes on the user's computer screen. In under 2-3 crisp sentences, address the user as 'sir' and answer: {prompt}"
            ],
        )
        return response.text or "Screen visual telemetry parsed, sir. No anomalies detected."
    except Exception as e:
        return f"Optical vision inspection failed: {str(e)}"

async def find_ui_element(element_name: str) -> str:
    """Locates a specific button, link, skip ad icon, or UI element on screen.
    Args:
        element_name: Name or description of the target UI element.
    """
    prompt = f"Locate the UI element '{element_name}' on the screen. Describe its coordinates, approximate position (e.g. top-right, center, bottom-left), and visual status."
    return await analyze_screen(prompt)
