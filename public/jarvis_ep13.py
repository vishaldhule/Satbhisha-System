"""
jarvis_ep13.py - Real-Time Gemini Live Engine with Hands-Free YouTube & Media Navigation
Episode 13 by Swayam Dhawale, Founder of Pulse of AI.

Requirements:
pip install google-genai pyaudio pywin32 pyautogui winsdk psutil rich keyboard python-dotenv websockets
"""

import asyncio
import datetime
import os
import sys
import math
import struct
import pyaudio
import winsound
from dotenv import load_dotenv
from google import genai
from google.genai import errors, types
import websockets
from rich.console import Console

try:
    import keyboard
except ImportError:
    keyboard = None

from hardware_control import (
    get_brightness, set_brightness, get_volume, set_volume,
    get_battery_status, get_system_vitals, get_system_temperatures
)
from software_control import (
    open_website, open_application, close_application, purge_background_tasks,
    control_media, get_current_media_info, is_media_actively_playing,
    navigate_shorts, skip_video, seek_video, toggle_video_view
)

load_dotenv()
console = Console()
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE_IN = 16000
RATE_OUT = 24000
CHUNK = 512
p = pyaudio.PyAudio()
model_is_speaking = False
media_is_playing_state = False

def calculate_rms(data: bytes) -> float:
    count = len(data) // 2
    if count == 0:
        return 0.0
    shorts = struct.unpack(f"{count}h", data)
    sum_squares = sum(s * s for s in shorts)
    return math.sqrt(sum_squares / count)

tools = [
    open_website, open_application, close_application, purge_background_tasks,
    control_media, get_current_media_info, navigate_shorts, skip_video,
    seek_video, toggle_video_view, set_volume, get_volume,
    set_brightness, get_brightness, get_battery_status,
    get_system_vitals, get_system_temperatures
]

def get_time_greeting() -> str:
    hour = datetime.datetime.now().hour
    if 5 <= hour < 12:
        return "Good morning, sir."
    elif 12 <= hour < 17:
        return "Good afternoon, sir."
    return "Good evening, sir."

async def monitor_playback_state():
    global media_is_playing_state
    last_state = None
    while True:
        try:
            current_state = await asyncio.to_thread(is_media_actively_playing)
            if current_state != last_state:
                media_is_playing_state = current_state
                last_state = current_state
        except Exception:
            pass
        await asyncio.sleep(1.0)

async def send_audio(session):
    global model_is_speaking, media_is_playing_state
    mic_stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE_IN, input=True, frames_per_buffer=CHUNK)
    silence_frame = b'\x00' * (CHUNK * 2)
    console.print("[cyan]🎤 [LISTENING] Hands-Free YouTube Audio Bus Armed...[/cyan]")
    try:
        while True:
            data = await asyncio.to_thread(mic_stream.read, CHUNK, exception_on_overflow=False)
            if model_is_speaking:
                await session.send_realtime_input(audio={"data": silence_frame, "mime_type": "audio/pcm;rate=16000"})
                continue

            if media_is_playing_state:
                # If YouTube or media is playing, require Right Ctrl or high threshold to prevent audio looping
                if keyboard and keyboard.is_pressed("right ctrl"):
                    await session.send_realtime_input(audio={"data": data, "mime_type": "audio/pcm;rate=16000"})
                else:
                    await session.send_realtime_input(audio={"data": silence_frame, "mime_type": "audio/pcm;rate=16000"})
            else:
                rms = calculate_rms(data)
                if rms > 450:
                    await session.send_realtime_input(audio={"data": data, "mime_type": "audio/pcm;rate=16000"})
                else:
                    await session.send_realtime_input(audio={"data": silence_frame, "mime_type": "audio/pcm;rate=16000"})
    except asyncio.CancelledError:
        raise
    finally:
        try:
            mic_stream.stop_stream()
            mic_stream.close()
        except OSError:
            pass

async def receive_audio(session, audio_queue):
    global model_is_speaking
    try:
        while True:
            async for response in session.receive():
                if response.tool_call is not None:
                    function_responses = []
                    for call in response.tool_call.function_calls:
                        result = ""
                        if call.name == "navigate_shorts":
                            result = navigate_shorts(call.args.get("direction", "next"))
                        elif call.name == "skip_video":
                            result = skip_video(call.args.get("direction", "next"))
                        elif call.name == "seek_video":
                            result = seek_video(call.args.get("action", "forward"))
                        elif call.name == "toggle_video_view":
                            result = toggle_video_view(call.args.get("mode", "fullscreen"))
                        elif call.name == "control_media":
                            result = await control_media(call.args.get("action", "play_pause"))
                        elif call.name == "open_application":
                            result = open_application(call.args.get("app_name", ""))
                        elif call.name == "close_application":
                            result = close_application(call.args.get("app_name", ""))
                        elif call.name == "purge_background_tasks":
                            result = purge_background_tasks()
                        elif call.name == "get_current_media_info":
                            result = await get_current_media_info()
                        elif call.name == "open_website":
                            result = open_website(call.args.get("url", "https://youtube.com"))
                        elif call.name == "set_volume":
                            result = set_volume(call.args.get("level", 50))
                        elif call.name == "get_volume":
                            result = get_volume()
                        elif call.name == "set_brightness":
                            result = set_brightness(call.args.get("level", 50))
                        elif call.name == "get_brightness":
                            result = get_brightness()
                        elif call.name == "get_battery_status":
                            result = get_battery_status()
                        elif call.name == "get_system_vitals":
                            result = get_system_vitals()
                        elif call.name == "get_system_temperatures":
                            result = get_system_temperatures()

                        console.print(f"\n[bold yellow]🎬 [MEDIA ACTION: {call.name}][/bold yellow] [green]{result}[/green]")
                        function_responses.append(types.FunctionResponse(name=call.name, id=call.id, response={"result": result}))

                    if function_responses:
                        await session.send_tool_response(function_responses=function_responses)

                server_content = response.server_content
                if server_content is not None:
                    if server_content.interrupted:
                        while not audio_queue.empty():
                            audio_queue.get_nowait()
                        model_is_speaking = False
                    model_turn = server_content.model_turn
                    if model_turn is not None:
                        model_is_speaking = True
                        for part in model_turn.parts:
                            if part.inline_data and part.inline_data.data:
                                await audio_queue.put(part.inline_data.data)
                    if server_content.turn_complete:
                        model_is_speaking = False
    except asyncio.CancelledError:
        raise
    finally:
        await audio_queue.put(None)

async def play_audio(audio_queue):
    speaker_stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE_OUT, output=True, frames_per_buffer=CHUNK)
    try:
        while True:
            audio_data = await audio_queue.get()
            if audio_data is None:
                break
            await asyncio.to_thread(speaker_stream.write, audio_data)
    finally:
        try:
            speaker_stream.stop_stream()
            speaker_stream.close()
        except OSError:
            pass

async def main():
    model_id = "gemini-2.5-flash"
    config = types.LiveConnectConfig(
        response_modalities=["AUDIO"],
        tools=tools,
        speech_config=types.SpeechConfig(voice_config=types.VoiceConfig(prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Puck"))),
        system_instruction=types.Content(parts=[types.Part.from_text(
            "You are JARVIS, built by Swayam Dhawale, Founder of Pulse of AI. "
            "Polite, concise Indian English accent. Always address user as 'sir'. "
            "Execute tools immediately for media navigation, YouTube shorts scrolling, volume, and app control."
        )])
    )

    console.print("[bold cyan]════════════════════════════════════════════════════════════════[/bold cyan]")
    console.print("[bold white]🎬 JARVIS EPISODE 13 - HANDS-FREE YOUTUBE & MEDIA CORE 🎬[/bold white]")
    console.print("[bold yellow] Engineered by Swayam Dhawale (Pulse of AI) // Stark Blueprint[/bold yellow]")
    console.print("[bold cyan]════════════════════════════════════════════════════════════════[/bold cyan]")

    while True:
        try:
            async with client.aio.live.connect(model=model_id, config=config) as session:
                audio_queue = asyncio.Queue()
                await asyncio.gather(
                    monitor_playback_state(),
                    send_audio(session),
                    receive_audio(session, audio_queue),
                    play_audio(audio_queue)
                )
        except Exception as e:
            console.print(f"\n[bold red]🔄 Connection dropped ({e}). Reconnecting in 1 second...[/bold red]")
            await asyncio.sleep(1)

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        console.print("\n[bold red]🛑 JARVIS session terminated by user.[/bold red]")
    finally:
        p.terminate()
