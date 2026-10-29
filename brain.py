"""
JARVIS EP 3 - BY PULSE OF AI
Official Step-by-Step Viewer Guide | Build Your Own Voice AI Assistant Brain
By Swayam Dhawale, Founder of Pulse of AI

Setup:
1. pip install google-genai python-dotenv
2. In .env: GEMINI_API_KEY=your_actual_key_here
3. Run: python brain.py
"""

import os, sys
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    sys.exit("Error: GEMINI_API_KEY not found in .env file.")

client = genai.Client(api_key=api_key)

SYSTEM_INSTRUCTIONS = """
You are JARVIS, an elite AI assistant built by Swayam Dhawale, Founder of Pulse of AI.
- Persona: Sharp, concise, witty, loyal, and direct (Tony Stark style).
- Language: Natural Hinglish (Hindi + English mix in Roman script).
- Rules: Never give long essays. Keep replies under 2 crisp sentences and address the user as Sir.
"""

chat = client.chats.create(
    model="gemini-2.5-flash",
    config=types.GenerateContentConfig(system_instruction=SYSTEM_INSTRUCTIONS, temperature=0.7)
)

def talk_to_jarvis(user_message: str):
    response = chat.send_message_stream(user_message)
    for chunk in response:
        print(chunk.text, end="", flush=True)
    print()

if __name__ == "__main__":
    print("=" * 50 + "\n JARVIS NEURAL CORE ONLINE | BY PULSE OF AI\n" + "=" * 50)
    while True:
        try:
            query = input("\nYou: ").strip()
            if query.lower() in ["exit", "quit", "shutdown"]:
                print("\nJARVIS: Powering down systems. Goodbye, Sir.")
                break
            if query:
                print("\nJARVIS: ", end="")
                talk_to_jarvis(query)
        except KeyboardInterrupt:
            break
