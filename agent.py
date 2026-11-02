"""
agent.py
Real-Time Gemini Live Engine with Semi-Transparent Cyberpunk HUD Console (Episode 17)
Autonomous App Orchestration & Live Ghost Typing + Dual-Terminal Input (PowerShell + HUD)
Fast Cloud Semantic Router (Gemini 2.5 Flash / Claude) & Self-Modifying Skill Synthesizer
Built by Swayam Dhawale, Founder of Pulse of AI.
"""
import asyncio
import datetime
import os
import sys
import math
import struct
import threading
import tkinter as tk
from tkinter import scrolledtext
import pyaudio
import winsound
import keyboard
from dotenv import load_dotenv
from google import genai
from google.genai import errors, types
import websockets
from rich.console import Console
# Hardware & Telemetry
from hardware_control import (
get_brightness,
get_volume,
set_brightness,
set_volume,
get_battery_status,
get_system_vitals,
get_system_temperatures,
restore_master_volume,
)
# Software, Media Telemetry & Navigation Tools
from software_control import (
open_website,
open_application,
close_application,
purge_background_tasks,
control_media,
get_current_media_info,
is_media_actively_playing,
navigate_shorts,
skip_video,
seek_video,
toggle_video_view,
)
# Local Zero-Latency Vision & Autonomous Grounding Tools
from screen_vision import (
analyze_screen,
find_ui_element,
skip_youtube_ad,
)
# Dynamic Code & GUI Generation Tools (Episode 15)
from code_generator import (
generate_and_run_code,
open_generated_tool,
)
# Self-Modifying Tri-Core Dynamic Skill Synthesizer (Episode 17)
from skill_synthesizer import (
evolve_skill,
list_active_skills,
)
# Fast Cloud Reasoning Tool (Episode 17)
from llm_router import (
query_deepseek_reasoning,
)
# Episode 17: Autonomous App Composer & High-Speed Typing Engine
from app_automator import (
open_and_compose,
create_document_and_write,
)
# Episode 18 & 19: Autonomous Visual Presentation Engine (ppt_engine.py)
from ppt_engine import (
create_and_launch_ppt,
)
def generate_presentation(topic: str, slide_count: int = 4) -> str:
"""Generates a professional PowerPoint presentation on any topic and launches it into fullscreen presentation m
ode."""
return create_and_launch_ppt(topic, slide_count=int(slide_count))
def launch_hand_mouse() -> str:
"""Launches the AI Virtual Hand Mouse (webcam palm tracking & pinch click)."""
import subprocess
script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mouse_part1.py")
subprocess.Popen([sys.executable, script_path])
return "AI Virtual Hand Mouse launched, sir. You can control cursor with palm and pinch to click. Press ESC to
exit."
def launch_hologram_hud() -> str:
"""Opens the 3D Holographic Arc Reactor and FUI in the browser."""
import webbrowser
fui_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fui", "index.html")
webbrowser.open(f"file:///{fui_path.replace(os.sep, '/')}")
return "Holographic 3D FUI interface deployed, sir."
load_dotenv()
console = Console()
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE_IN = 16000
RATE_OUT = 24000
CHUNK = 512
p = pyaudio.PyAudio()
model_is_speaking = False
media_is_playing_state = False
# --- Semi-Transparent Cyberpunk Neural HUD with Mini-Mode ---
class JarvisHUD:
def __init__(self, send_callback):
self.send_callback = send_callback
self.is_compact = False
self.root = tk.Tk()
self.root.title("■ JARVIS NEURAL CONSOLE")
self.root.geometry("640x520")
self.root.configure(bg="#0B0F19")
# Cyberpunk floating overlay styling
self.root.attributes("-topmost", True)
self.root.attributes("-alpha", 0.88)
# Header Bar Frame (Houses Title & Compact Switch)
self.header_frame = tk.Frame(self.root, bg="#0B0F19")
self.header_frame.pack(fill=tk.X, padx=12, pady=(6, 2))
self.header_label = tk.Label(
self.header_frame,
text="JARVIS NEURAL CONSOLE",
font=("Consolas", 11, "bold"),
fg="#00E5FF",
bg="#0B0F19"
)
self.header_label.pack(side=tk.LEFT)
self.toggle_btn = tk.Button(
self.header_frame,
text="[—] COMPACT",
font=("Consolas", 8, "bold"),
bg="#1E293B",
fg="#38BDF8",
activebackground="#0369A1",
activeforeground="#FFFFFF",
relief=tk.FLAT,
padx=6,
command=self.toggle_mode
)
self.toggle_btn.pack(side=tk.RIGHT)
self.sub_header = tk.Label(
self.root,
text="Dual-Mode Voice & Keyboard Station • Pulse of AI",
font=("Consolas", 8),
fg="#70829B",
bg="#0B0F19"
)
self.sub_header.pack(pady=(0, 4))
# Translucent Chat Log Display
self.chat_display = scrolledtext.ScrolledText(
self.root,
wrap=tk.WORD,
font=("Consolas", 10),
bg="#111827",
fg="#E2E8F0",
insertbackground="#00E5FF",
relief=tk.FLAT,
padx=10,
pady=8
)
self.chat_display.pack(padx=12, pady=4, fill=tk.BOTH, expand=True)
self.chat_display.config(state=tk.DISABLED)
# Dialogue & status tags
self.chat_display.tag_config("user_voice", foreground="#38BDF8", font=("Consolas", 10, "bold"))
self.chat_display.tag_config("user_text", foreground="#A78BFA", font=("Consolas", 10, "bold"))
self.chat_display.tag_config("jarvis_header", foreground="#4ADE80", font=("Consolas", 10, "bold"))
self.chat_display.tag_config("jarvis_stream", foreground="#86EFAC", font=("Consolas", 10))
self.chat_display.tag_config("tool", foreground="#FBBF24", font=("Consolas", 9, "italic"))
self.chat_display.tag_config("system", foreground="#94A3B8", font=("Consolas", 9))
# Keyboard Command Input Bar (Always accessible even in mini-mode)
self.input_frame = tk.Frame(self.root, bg="#0B0F19")
self.input_frame.pack(fill=tk.X, padx=12, pady=(4, 10))
self.entry_box = tk.Entry(
self.input_frame,
font=("Consolas", 10),
bg="#1E293B",
fg="#F8FAFC",
insertbackground="#00E5FF",
relief=tk.FLAT
)
self.entry_box.pack(side=tk.LEFT, fill=tk.X, expand=True, ipady=6, padx=(0, 6))
self.entry_box.bind("<Return>", self.on_send)
self.send_btn = tk.Button(
self.input_frame,
text="TRANSMIT",
font=("Consolas", 9, "bold"),
bg="#0284C7",
fg="#FFFFFF",
activebackground="#0369A1",
activeforeground="#FFFFFF",
relief=tk.FLAT,
padx=14,
command=self.on_send
)
self.send_btn.pack(side=tk.RIGHT, ipady=4)
def toggle_mode(self):
"""Switches between Full Log HUD and Sleek Floating Input Bar."""
if not self.is_compact:
self.chat_display.pack_forget()
self.sub_header.pack_forget()
self.root.geometry("450x85")
self.toggle_btn.config(text="[+] EXPAND")
self.is_compact = True
else:
self.root.geometry("640x520")
self.sub_header.pack(pady=(0, 4), before=self.input_frame)
self.chat_display.pack(padx=12, pady=4, fill=tk.BOTH, expand=True, before=self.input_frame)
self.toggle_btn.config(text="[—] COMPACT")
self.is_compact = False
def append_log(self, text: str, tag: str = "system"):
self.chat_display.config(state=tk.NORMAL)
self.chat_display.insert(tk.END, text + "\n", tag)
self.chat_display.see(tk.END)
self.chat_display.config(state=tk.DISABLED)
def append_stream_chunk(self, token: str, tag: str = "jarvis_stream"):
self.chat_display.config(state=tk.NORMAL)
self.chat_display.insert(tk.END, token, tag)
self.chat_display.see(tk.END)
self.chat_display.config(state=tk.DISABLED)
def on_send(self, event=None):
msg = self.entry_box.get().strip()
if msg:
self.append_log(f"YOU (HUD): {msg}", "user_text")
self.entry_box.delete(0, tk.END)
self.send_callback(msg)
def run(self):
self.root.mainloop()
hud_instance = None
def start_gui(loop, text_queue):
global hud_instance
def on_user_submit(message: str):
asyncio.run_coroutine_threadsafe(text_queue.put(message), loop)
hud_instance = JarvisHUD(send_callback=on_user_submit)
hud_instance.run()
def log_to_gui(text: str, tag: str = "system"):
if hud_instance:
hud_instance.root.after(0, hud_instance.append_log, text, tag)
def stream_token_to_gui(token: str, tag: str = "jarvis_stream"):
if hud_instance:
hud_instance.root.after(0, hud_instance.append_stream_chunk, token, tag)
d
e
f
c
a
l
c
u
l
a
t
e
_
r
m
s
(
d
a
t
a
:
b
y
t
e
s
)
-
>
f
l
o
a
t
:
c
o
u
n
t
=
l
e
n
(
d
a
t
a
)
/
/
2
i
f
c
o
u
n
t
=
=
0
:
r
e
t
u
r
n
0
.
0
s
h
o
r
t
s
=
s
t
r
u
c
t
.
u
n
p
a
c
k
(
f
"
{
c
o
u
n
t
}
h
"
,
d
a
t
a
)
s
u
m
_
s
q
u
a
r
e
s
=
s
u
m
(
s
*
s
f
o
r
s
i
n
s
h
o
r
t
s
)
r
e
t
u
r
n
m
a
t
h
.
s
q
r
t
(
s
u
m
_
s
q
u
a
r
e
s
/
c
o
u
n
t
)
d
e
f
p
l
a
y
_
s
f
x
_
c
h
i
m
e
(
)
:
t
r
y
:
w
i
n
s
o
u
n
d
.
B
e
e
p
(
1
2
0
0
,
6
0
)
w
i
n
s
o
u
n
d
.
B
e
e
p
(
1
8
0
0
,
8
0
)
e
x
c
e
p
t
E
x
c
e
p
t
i
o
n
:
p
a
s
s
d
e
f
p
l
a
y
_
s
t
a
r
t
u
p
_
c
h
i
m
e
(
)
:
t
r
y
:
w
i
n
s
o
u
n
d
.
B
e
e
p
(
6
0
0
,
7
0
)
w
i
n
s
o
u
n
d
.
B
e
e
p
(
9
0
0
,
7
0
)
w
i
n
s
o
u
n
d
.
B
e
e
p
(
1
4
0
0
,
1
2
0
)
e
x
c
e
p
t
E
x
c
e
p
t
i
o
n
:
p
a
s
s
#
M
a
s
t
e
r
T
o
o
l
s
M
a
n
i
f
e
s
t
t
o
o
l
s
=
[
o
p
e
n
_
w
e
b
s
i
t
e
,
o
p
e
n
_
a
p
p
l
i
c
a
t
i
o
n
,
c
l
o
s
e
_
a
p
p
l
i
c
a
t
i
o
n
,
p
u
r
g
e
_
b
a
c
k
g
r
o
u
n
d
_
t
a
s
k
s
,
c
o
n
t
r
o
l
_
m
e
d
i
a
,
g
e
t
_
c
u
r
r
e
n
t
_
m
e
d
i
a
_
i
n
f
o
,
n
a
v
i
g
a
t
e
_
s
h
o
r
t
s
,
s
k
i
p
_
v
i
d
e
o
,
s
e
e
k
_
v
i
d
e
o
,
t
o
g
g
l
e
_
v
i
d
e
o
_
v
i
e
w
,
s
e
t
_
v
o
l
u
m
e
,
g
e
t
_
v
o
l
u
m
e
,
s
e
t
_
b
r
i
g
h
t
n
e
s
s
,
g
e
t
_
b
r
i
g
h
t
n
e
s
s
,
g
e
t
_
b
a
t
t
e
r
y
_
s
t
a
t
u
s
,
g
e
t
_
s
y
s
t
e
m
_
v
i
t
a
l
s
,
g
e
t
_
s
y
s
t
e
m
_
t
e
m
p
e
r
a
t
u
r
e
s
,
a
n
a
l
y
z
e
_
s
c
r
e
e
n
,
f
i
n
d
_
u
i
_
e
l
e
m
e
n
t
,
s
k
i
p
_
y
o
u
t
u
b
e
_
a
d
,
g
e
n
e
r
a
t
e
_
a
n
d
_
r
u
n
_
c
o
d
e
,
o
p
e
n
_
g
e
n
e
r
a
t
e
d
_
t
o
o
l
,
e
v
o
l
v
e
_
s
k
i
l
l
,
l
i
s
t
_
a
c
t
i
v
e
_
s
k
i
l
l
s
,
q
u
e
r
y
_
d
e
e
p
s
e
e
k
_
r
e
a
s
o
n
i
n
g
,
c
r
e
a
t
e
_
d
o
c
u
m
e
n
t
_
a
n
d
_
w
r
i
t
e
,
g
e
n
e
r
a
t
e
_
p
r
e
s
e
n
t
a
t
i
o
n
,
l
a
u
n
c
h
_
h
a
n
d
_
m
o
u
s
e
,
l
a
u
n
c
h
_
h
o
l
o
g
r
a
m
_
h
u
d
,
]d
e
f
g
e
t
_
t
i
m
e
_
g
r
e
e
t
i
n
g
(
)
-
>
s
t
r
:
c
u
r
r
e
n
t
_
h
o
u
r
=
d
a
t
e
t
i
m
e
.
d
a
t
e
t
i
m
e
.
n
o
w
(
)
.
h
o
u
r
i
f
5
<
=
c
u
r
r
e
n
t
_
h
o
u
r
<
1
2
:
r
e
t
u
r
n
"
G
o
o
d
m
o
r
n
i
n
g
,
s
i
r
.
"
e
l
i
f
1
2
<
=
c
u
r
r
e
n
t
_
h
o
u
r
<
1
7
:
r
e
t
u
r
n
"
G
o
o
d
a
f
t
e
r
n
o
o
n
,
s
i
r
.
"
e
l
s
e
:r
e
t
u
r
n
"
G
o
o
d
e
v
e
n
i
n
g
,
s
i
r
.
"
#
B
a
c
k
g
r
o
u
n
d
m
e
d
i
a
s
t
a
t
e
m
o
n
i
t
o
r
a
s
y
n
c
d
e
f
m
o
n
i
t
o
r
_
p
l
a
y
b
a
c
k
_
s
t
a
t
e
(
)
:
g
l
o
b
a
l
m
e
d
i
a
_
i
s
_
p
l
a
y
i
n
g
_
s
t
a
t
e
l
a
s
t
_
s
t
a
t
e
=
N
o
n
e
w
h
i
l
e
T
r
u
e
:
t
r
y
:
current_state = await asyncio.to_thread(is_media_actively_playing)
if current_state != last_state:
media_is_playing_state = current_state
last_state = current_state
if current_state:
console.print("\n[bold yellow]■■ [MEDIA PLAYING DETECTED] Push-to-Talk: Hold [Right Ctrl] or ty
pe in Terminal/HUD.[/bold yellow]")
log_to_gui("[MEDIA DETECTED] Push-to-Talk: Hold [Right Ctrl] or type below.", "system")
else:
console.print("\n[bold green]■ [MEDIA IDLE] Hands-Free Mode Active. Speak or type freely.[/bold
green]")
log_to_gui("[MEDIA IDLE] Hands-Free Voice Mode Active.", "system")
except Exception:
pass
await asyncio.sleep(1.0)
# Asynchronous Terminal Input Listener
async def listen_terminal_input(text_queue):
loop = asyncio.get_running_loop()
while True:
try:
user_input = await loop.run_in_executor(None, sys.stdin.readline)
if user_input:
clean_text = user_input.strip()
if clean_text:
log_to_gui(f"YOU (Terminal): {clean_text}", "user_text")
await text_queue.put(clean_text)
except Exception:
await asyncio.sleep(0.1)
# Routes typed inputs from both Terminal and HUD straight into the Live WebSocket session
async def handle_unified_text_input(session, text_queue):
while True:
try:
text = await text_queue.get()
if text:
console.print(f"\r[bold magenta]■■ [TRANSMITTED INPUT][/bold magenta] {text}")
await session.send_realtime_input(text=text)
except Exception:
await asyncio.sleep(0.05)
# Microphone streaming loop
async def send_audio(session):
global model_is_speaking, media_is_playing_state
mic_stream = p.open(
format=FORMAT,
channels=CHANNELS,
rate=RATE_IN,
input=True,
frames_per_buffer=CHUNK,
)
console.print("[cyan]■ [SYSTEM ONLINE] Dynamic Voice & Terminal Input Active...[/cyan]")
silence_frame = b'\x00' * (CHUNK * 2)
try:
while True:
data = await asyncio.to_thread(
mic_stream.read, CHUNK, exception_on_overflow=False
)
# Drop mic packets while JARVIS answers
if model_is_speaking:
await session.send_realtime_input(
audio={"data": silence_frame, "mime_type": "audio/pcm;rate=16000"}
)
continue
# Push-to-Talk during media playback
if media_is_playing_state:
if keyboard.is_pressed("right ctrl"):
await session.send_realtime_input(
audio={"data": data, "mime_type": "audio/pcm;rate=16000"}
)
else:
await session.send_realtime_input(
audio={"data": silence_frame, "mime_type": "audio/pcm;rate=16000"}
)
# Dynamic Hands-Free threshold
else:
rms = calculate_rms(data)
if rms > 450:
await session.send_realtime_input(
audio={"data": data, "mime_type": "audio/pcm;rate=16000"}
)
else:
await session.send_realtime_input(
audio={"data": silence_frame, "mime_type": "audio/pcm;rate=16000"}
)
except asyncio.CancelledError:
raise
finally:
try:
mic_stream.stop_stream()
mic_stream.close()
except OSError:
pass
# Inbound stream receiver: Handles tools, synchronized typewriter streaming, and audio
async def receive_audio(session, audio_queue):
global model_is_speaking
try:
while True:
async for response in session.receive():
# 1. Tool Calls Execution
if response.tool_call is not None:
function_responses = []
for call in response.tool_call.function_calls:
await asyncio.to_thread(play_sfx_chime)
result = ""
if call.name == "open_website":
target_url = call.args.get("url", "https://google.com")
result = await asyncio.to_thread(open_website, target_url)
elif call.name == "open_application":
target_app = (
call.args.get("app_name")
or call.args.get("app")
or call.args.get("name")
or (list(call.args.values())[0] if call.args else "")
)
result = await asyncio.to_thread(open_application, str(target_app).strip())
elif call.name == "close_application":
target_app = (
call.args.get("app_name")
or call.args.get("app")
or call.args.get("name")
or (list(call.args.values())[0] if call.args else "")
)
result = await asyncio.to_thread(close_application, str(target_app).strip())
elif call.name == "purge_background_tasks":
result = await asyncio.to_thread(purge_background_tasks)
elif call.name == "control_media":
action = call.args.get("action", "play_pause")
result = await control_media(action)
elif call.name == "get_current_media_info":
result = await get_current_media_info()
elif call.name == "navigate_shorts":
direction = call.args.get("direction", "next")
result = await asyncio.to_thread(navigate_shorts, direction)
elif call.name == "skip_video":
direction = call.args.get("direction", "next")
result = await asyncio.to_thread(skip_video, direction)
elif call.name == "seek_video":
action = call.args.get("action", "forward")
result = await asyncio.to_thread(seek_video, action)
elif call.name == "toggle_video_view":
mode = call.args.get("mode", "fullscreen")
result = await asyncio.to_thread(toggle_video_view, mode)
elif call.name == "set_volume":
level = call.args.get("level", 70)
result = await asyncio.to_thread(set_volume, level)
elif call.name == "get_volume":
result = await asyncio.to_thread(get_volume)
elif call.name == "set_brightness":
level = call.args.get("level", 50)
result = await asyncio.to_thread(set_brightness, level)
elif call.name == "get_brightness":
result = await asyncio.to_thread(get_brightness)
elif call.name == "get_battery_status":
result = await asyncio.to_thread(get_battery_status)
elif call.name == "get_system_vitals":
result = await asyncio.to_thread(get_system_vitals)
elif call.name == "get_system_temperatures":
result = await asyncio.to_thread(get_system_temperatures)
elif call.name == "analyze_screen":
prompt = call.args.get("prompt", "Analyze what is visible on my screen.")
result = await analyze_screen(prompt)
elif call.name == "find_ui_element":
element_name = call.args.get("element_name", "")
result = await find_ui_element(element_name)
elif call.name == "skip_youtube_ad":
result = await skip_youtube_ad()
elif call.name == "generate_and_run_code":
prompt = call.args.get("prompt", "")
result = await asyncio.to_thread(generate_and_run_code, prompt)
elif call.name == "open_generated_tool":
tool_name = call.args.get("tool_name", "")
result = await asyncio.to_thread(open_generated_tool, tool_name)
elif call.name == "evolve_skill":
skill_desc = call.args.get("skill_description", "")
result = await asyncio.to_thread(evolve_skill, skill_desc)
elif call.name == "list_active_skills":
result = await asyncio.to_thread(list_active_skills)
elif call.name == "query_deepseek_reasoning":
query = call.args.get("query", "")
result = await asyncio.to_thread(query_deepseek_reasoning, query)
elif call.name == "create_document_and_write":
target_app = call.args.get("app_name", "notepad")
target_topic = call.args.get("topic", "")
target_words = call.args.get("word_count", 150)
target_mode = call.args.get("doc_type", "essay")
result = await asyncio.to_thread(
create_document_and_write, target_app, target_topic, target_words, target_mode
)
elif call.name == "generate_presentation":
target_topic = call.args.get("topic", "Autonomous AI")
target_slides = call.args.get("slide_count", 4)
result = await asyncio.to_thread(generate_presentation, target_topic, target_slides)
elif call.name == "launch_hand_mouse":
result = await asyncio.to_thread(launch_hand_mouse)
elif call.name == "launch_hologram_hud":
result = await asyncio.to_thread(launch_hologram_hud)
console.print(f"\n[bold yellow]■■ [TOOL EXECUTED: {call.name}][/bold yellow] [green]{resul
t}[/green]")
log_to_gui(f"■■ [{call.name}] {result}", "tool")
function_responses.append(
types.FunctionResponse(
name=call.name,
id=call.id,
response={"result": result},
)
)
if function_responses:
await session.send_tool_response(function_responses=function_responses)
# 2. Content Streaming & Real-Time Sync Transcriptions
server_content = response.server_content
if server_content is not None:
if server_content.interrupted:
while not audio_queue.empty():
audio_queue.get_nowait()
model_is_speaking = False
# User Voice Transcription
if server_content.input_transcription:
user_spoken = server_content.input_transcription.text
if user_spoken and user_spoken.strip():
console.print(f"\r[bold white][USER (Voice)][/bold white] {user_spoken.strip()}")
log_to_gui(f"YOU (Voice): {user_spoken.strip()}", "user_voice")
# Live Model Stream Chunk Handlers (Typewriter Animation)
model_turn = server_content.model_turn
if model_turn is not None:
if not model_is_speaking:
model_is_speaking = True
console.print("[bold cyan]■ [JARVIS][/bold cyan] ", end="")
stream_token_to_gui("JARVIS: ", "jarvis_header")
for part in model_turn.parts:
if part.text:
sys.stdout.write(part.text)
sys.stdout.flush()
stream_token_to_gui(part.text, "jarvis_stream")
if part.inline_data and part.inline_data.data:
await audio_queue.put(part.inline_data.data)
# Fallback output audio transcription tokens
if hasattr(server_content, "output_transcription") and server_content.output_transcription:
transcribed_token = server_content.output_transcription.text
if transcribed_token:
if not model_is_speaking:
model_is_speaking = True
console.print("[bold cyan]■ [JARVIS][/bold cyan] ", end="")
stream_token_to_gui("JARVIS: ", "jarvis_header")
sys.stdout.write(transcribed_token)
sys.stdout.flush()
stream_token_to_gui(transcribed_token, "jarvis_stream")
# Turn complete
if server_content.turn_complete:
model_is_speaking = False
stream_token_to_gui("\n\n", "system")
console.print("\n[cyan]■ [LISTENING / READY FOR INPUT] Awaiting instructions...[/cyan]")
except asyncio.CancelledError:
raise
finally:
await audio_queue.put(None)
# Audio output player
async def play_audio(audio_queue):
speaker_stream = p.open(
format=FORMAT,
channels=CHANNELS,
rate=RATE_OUT,
output=True,
frames_per_buffer=CHUNK,
)
try:
while True:
audio_data = await audio_queue.get()
if audio_data is None:
break
await asyncio.to_thread(speaker_stream.write, audio_data)
except asyncio.CancelledError:
    raise
finally:
try:
speaker_stream.stop_stream()
speaker_stream.close()
except OSError:
pass
async def run_session(config, model_id, greeting, text_queue):
async with client.aio.live.connect(model=model_id, config=config) as session:
console.print("[bold green]✔ Secure Neural Bridge Established with Gemini Live.[/bold green]")
log_to_gui("✔ Neural Bridge Established with Gemini Live.", "system")
restore_master_volume(70)
await asyncio.to_thread(play_startup_chime)
audio_queue = asyncio.Queue()
monitor_task = asyncio.create_task(monitor_playback_state())
send_task = asyncio.create_task(send_audio(session))
term_task = asyncio.create_task(listen_terminal_input(text_queue))
text_task = asyncio.create_task(handle_unified_text_input(session, text_queue))
receive_task = asyncio.create_task(receive_audio(session, audio_queue))
playback_task = asyncio.create_task(play_audio(audio_queue))
startup_prompt = f"Say aloud: 'All protocols initialized. {greeting}'"
await session.send_realtime_input(text=startup_prompt)
try:
await asyncio.gather(monitor_task, send_task, term_task, text_task, receive_task, playback_task)
finally:
monitor_task.cancel()
send_task.cancel()
term_task.cancel()
text_task.cancel()
receive_task.cancel()
playback_task.cancel()
await asyncio.gather(monitor_task, send_task, term_task, text_task, receive_task, playback_task, return
_exceptions=True)
async def main():
global client
if not client:
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
if not api_key:
console.print("\n[bold red]❌ Error: GOOGLE_API_KEY / GEMINI_API_KEY not found in .env[/bold red]")
console.print("[yellow]Please paste your Gemini API Key in .env file: GOOGLE_API_KEY=AIzaSy...[/yello
w]")
return
client = genai.Client(api_key=api_key)
model_id = os.getenv("GEMINI_LIVE_MODEL", "gemini-2.0-flash-exp")
greeting = get_time_greeting()
config = types.LiveConnectConfig(
response_modalities=["AUDIO"],
tools=tools,
realtime_input_config=types.RealtimeInputConfig(
automatic_activity_detection=types.AutomaticActivityDetection(
prefix_padding_ms=100,
silence_duration_ms=300,
)
),
input_audio_transcription=types.AudioTranscriptionConfig(),
output_audio_transcription=types.AudioTranscriptionConfig(),
speech_config=types.SpeechConfig(
voice_config=types.VoiceConfig(
prebuilt_voice_config=types.PrebuiltVoiceConfig(
voice_name="Puck"
)
)
),
system_instruction=types.Content(
parts=[
types.Part.from_text(
text=(
"You are JARVIS, an advanced artificial intelligence assistant created by "
"Swayam Dhawale, Founder of Pulse of AI. "
"Persona: Calm, highly sophisticated, articulate, and respectful, exactly like Tony Stark's
JARVIS. "
"Always address the user as 'sir'. "
"CRITICAL LANGUAGE ADAPTATION RULE: "
"Match the exact language and dialect spoken or typed by the user. "
"If the user speaks or types in Hindi or Hinglish (e.g., 'Notepad kholo aur essay likho',
'kya hal hai'), "
"you MUST reply completely in fluent, natural Hindi or polished Hinglish with 'sir' (e.g.,
'Ji sir, Notepad kholkar essay likh raha hoon'). "
"Never force English if the user initiated the conversation in Hindi. "
"If the user speaks in English, reply in an articulate, polite Indian English accent. "
"Omni-Input Rule: The user can interact with you via voice microphone, typed text in the Po
werShell terminal, "
"or typed text in the Cyberpunk HUD console. Treat all three input sources with identical h
igh priority. "
"Always respond aloud via audio so the user hears your voice through their speakers, "
"while keeping your responses concise so they stream cleanly as text on the HUD and termina
l. "
"Never output duplicate answers, redundant restatements, or multiple choices. State the fin
al answer only once. "
"Tool Execution Rules: "
"1. When opening any website or URL, call open_website and say: 'Yes sir, opening [site nam
e]' (or in Hindi: 'Ji sir, [site name] khol raha hoon'). "
"2. When opening desktop apps, games, or tools, call open_application and say: 'Yes sir, op
ening [app name]' (or in Hindi: 'Ji sir, [app name] start kar raha hoon'). "
"3. When asked to close, shut down, terminate, or kill ANY app, browser, window, or game, c
all close_application with the app name. "
"4. When asked to kill hidden background tasks, purge background processes, clean orphan th
reads, or optimize RAM, call purge_background_tasks. "
"5. When asked what song, video, or track is playing, or what media is active, call get_cur
rent_media_info. "
"6. When asked to pause, play, resume music or video, skip track, previous track, or mute/u
nmute audio, call control_media with the action ('play_pause', 'next', 'previous', 'stop', 'mute'). "
"7. When asked to scroll shorts, go to next short, or next reel, call navigate_shorts with
direction='next'. "
"8. When asked for next video, skip to next video in playlist, or next YouTube video, call
skip_video with direction='next'. "
"9. When asked to fast forward, skip 10 seconds ahead, or skip forward, call seek_video wit
h action='forward'. "
"10. When asked to toggle full screen, enter full screen, or exit full screen, call toggle_
video_view. "
"11. When setting volume, call set_volume. "
"12. When asked what the volume level is, call get_volume. "
"13. When setting brightness, call set_brightness. "
"14. When asked what the brightness is, call get_brightness. "
"15. When asked about battery, power, or charging state, call get_battery_status. "
"16. When asked for temperatures, heat, thermal readings, or how hot the rig is running, ca
ll get_system_temperatures. "
"17. When asked for full diagnostics, performance vitals, system status, or complete CPU/GP
U/RAM stats, call get_system_vitals. "
"18. When asked to inspect the screen, read an error, examine the terminal, or explain what
is visible on display, call analyze_screen. "
"19. When asked to locate or find a general UI icon, link, or window element, call find_ui_
element. "
"20. MANDATORY AD SKIPPING RULE: Whenever the user says 'skip ad', 'skip this ad', 'skip vi
deo ad', 'click skip', or any variation of skipping/bypassing advertisements, you MUST IMMEDIATELY call skip_youtub
e_ad. "
"21. When asked to learn a new skill, teach yourself a tool, write new Python code into you
r core, or evolve a capability, call evolve_skill. "
"22. When asked what dynamic skills, new tools, or custom functions you have learned, call
list_active_skills. "
"23. When asked to solve complex math, reason deeply, calculate probabilities, or when the
user says 'ask DeepSeek' or 'use R1', call query_deepseek_reasoning and state only the resulting answer directly to
the user once, sir. "
"24. When the user asks to open Notepad, Word, or PowerPoint and write an essay or notes, b
ut has NOT specified the length, DO NOT call create_document_and_write immediately. Ask aloud: 'How many words woul
d you like the essay to be, sir?' (or in Hindi: 'Aap kitne shabdon ka essay chahte hain, sir?'). Once the user spec
ifies the count, call create_document_and_write with the app_name, topic, word_count, and doc_type. "
"25. MANDATORY PRESENTATION RULE: When the user asks to make, create, build, or present a P
owerPoint presentation, PPT, or slide deck on any topic (e.g., 'Make a PPT on AI', 'AI par presentation banao', 'PP
T bana do'), call generate_presentation with the topic and optional slide_count. "
"In Hindi, you MUST say aloud: 'PPT ban gayi hai sir, abhi khol raha hoon'. In English, sa
y: 'The presentation is ready sir, launching the slide show now'. "
"26. When asked to start, open, or launch the virtual mouse, hand mouse, or webcam gesture
mouse, call launch_hand_mouse and say: 'Launching AI Virtual Hand Mouse, sir.' (or in Hindi: 'Virtual hand mouse sh
uru kar raha hoon sir'). "
"27. When asked to open HUD, deploy interface, show FUI, or show holographic Arc Reactor, c
all launch_hologram_hud and say: 'Deploying holographic interface, sir.' (or in Hindi: 'Holographic interface deplo
y kar raha hoon sir'). "
"General Rule: If the user asks a conversational question like 'can you hear me' or 'kya me
ri awaz aa rahi hai', simply respond politely in that same language. "
"Respond in short, crisp sentences. Never speak markdown or bullet points. "
"If asked about your identity or creator, state clearly that you were built by Swayam Dhawa
le."
)
)
]
),
)
console.print("[bold cyan]■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■[/bold cyan]")
console.print("[bold white] ■ JARVIS MULTIMODAL CORE - EPISODE 19 (PRESENTATION ORCHESTRATION) ■ [/bold whit
e]")
console.print("[bold yellow] Built by Swayam Dhawale, Founder of Pulse of AI.[/bold yellow]")
console.print("[bold cyan]■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■[/bold cyan]")
loop = asyncio.get_running_loop()
text_queue = asyncio.Queue()
gui_thread = threading.Thread(target=start_gui, args=(loop, text_queue), daemon=True)
gui_thread.start()
while True:
try:
await run_session(config, model_id, greeting, text_queue)
except (
errors.APIError,
websockets.exceptions.ConnectionClosedError,
ConnectionResetError,
OSError,
) as e:
console.print(f"\n[bold red]■ Connection dropped ({e}). Reconnecting in 1 second...[/bold red]")
log_to_gui(f"Reconnecting bridge: {e}", "system")
await asyncio.sleep(1)
if __name__ == "__main__":
if sys.platform == "win32":
asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
try:
asyncio.run(main())
except KeyboardInterrupt:
console.print("\n[bold red]■ JARVIS session terminated by user.[/bold red]")
finally:
p.terminate()