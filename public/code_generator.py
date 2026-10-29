"""
code_generator.py
Dynamic GUI and Python Tool Generation Engine for JARVIS (Episode 15).
Built by Swayam Dhawale, Founder of Pulse of AI.
"""

import os
import re
import time
import subprocess
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

def generate_and_run_code(prompt: str) -> str:
    """Generates a complete Python GUI script using Gemini, fixes syntax bugs, and executes it."""
    if not client:
        return "Gemini API client not initialized. Please verify GOOGLE_API_KEY in your environment, sir."

    system_prompt = (
        f"User request: '{prompt}'. "
        "Write a complete, fully functional Python script that includes a clean Graphical User Interface (GUI) "
        "using Python's built-in 'tkinter' library. Make it look modern, clean, and properly sized. "
        "IMPORTANT: In tkinter geometry specs like root.geometry('450x650'), NEVER put spaces around the 'x' (e.g., use '450x650', not '450 x 650'). "
        "Return ONLY valid Python code enclosed in ```python and ``` without any extra text or markdown descriptions."
    )

    # Retry loop to gracefully handle temporary 503 high-demand server spikes
    response = None
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=system_prompt,
                config=types.GenerateContentConfig(temperature=0.2)
            )
            break
        except Exception:
            if attempt == 2:
                return "Failed to generate UI code due to high server demand, sir. Please try again."
            time.sleep(1.5)

    if not response or not response.text:
        return "Failed to receive generated code from the model, sir."

    try:
        code_text = response.text
        if "```python" in code_text:
            code_text = code_text.split("```python")[1].split("```")[0].strip()
        elif "```" in code_text:
            code_text = code_text.split("```")[1].split("```")[0].strip()

        # Fix any lingering spacing bugs in geometry specs (e.g. "450 x 650" -> "450x650")
        code_text = re.sub(r'(\d+)\s+x\s+(\d+)', r'\1x\2', code_text)

        os.makedirs("generated_tools", exist_ok=True)
        safe_name = re.sub(r'[^a-zA-Z0-9_]', '_', prompt.lower())[:30].strip('_') or "dynamic_gui_tool"
        file_path = os.path.join("generated_tools", f"{safe_name}.py")

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(code_text)

        latest_ptr = os.path.join("generated_tools", "dynamic_gui_tool.py")
        with open(latest_ptr, "w", encoding="utf-8") as f:
            f.write(code_text)

        try:
            subprocess.Popen(["python", file_path])
        except Exception:
            subprocess.Popen(["python3", file_path])

        return f"Successfully generated and launched GUI application for: {prompt}, sir."
    except Exception as e:
        return f"Failed to parse and execute UI code, sir: {str(e)}"

def open_generated_tool(tool_name: str) -> str:
    """Opens and executes a previously generated GUI application or tool."""
    try:
        tools_dir = "generated_tools"
        if not os.path.exists(tools_dir):
            return f"No generated tools directory found, sir."

        files = os.listdir(tools_dir)
        target_file = None
        clean_query = tool_name.lower().replace(".py", "")

        for f in files:
            if clean_query in f.lower():
                target_file = f
                break

        if not target_file and files:
            target_file = files[0]

        if not target_file:
            return f"No matching generated tool found for '{tool_name}', sir."

        full_path = os.path.join(tools_dir, target_file)
        try:
            subprocess.Popen(["python", full_path])
        except Exception:
            subprocess.Popen(["python3", full_path])

        return f"Successfully launched saved tool: {target_file}, sir."
    except Exception as e:
        return f"Failed to open generated tool: {str(e)}, sir."
