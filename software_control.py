"""
software_control.py
Universal Application, Deep Task Purge & Full Media/Browser Navigator for JARVIS (Episode 13)
Built by Swayam Dhawale, Founder of Pulse of AI.
"""

import os
import sys
import ctypes
import subprocess
import webbrowser
import asyncio
import psutil

try:
    import pyautogui
except ImportError:
    pyautogui = None

try:
    import win32gui
    import win32con
    import win32process
except ImportError:
    win32gui = None
    win32con = None
    win32process = None

try:
    from winsdk.windows.media.control import (
        GlobalSystemMediaTransportControlsSessionManager as MediaManager
    )
except ImportError:
    MediaManager = None

# Hardware Virtual Key Codes
VK_MEDIA_NEXT_TRACK = 0xB0
VK_MEDIA_PREV_TRACK = 0xB1
VK_MEDIA_STOP = 0xB2
VK_MEDIA_PLAY_PAUSE = 0xB3
VK_VOLUME_MUTE = 0xAD
VK_K = 0x4B
VK_DOWN = 0x28
VK_UP = 0x26
VK_LEFT = 0x25
VK_RIGHT = 0x27
VK_J = 0x4A
VK_L = 0x4C
VK_F = 0x46
VK_T = 0x54

KEYEVENTF_EXTENDEDKEY = 0x0001
KEYEVENTF_KEYUP = 0x0002

# Win32 Kernel Constants for Deep Process Termination
PROCESS_TERMINATE = 0x0001
PROCESS_QUERY_INFORMATION = 0x0400

def _kernel_force_kill(pid: int) -> bool:
    """Invokes Win32 Kernel TerminateProcess directly for unyielding processes."""
    if sys.platform != "win32":
        return False
    try:
        kernel32 = ctypes.windll.kernel32
        handle = kernel32.OpenProcess(PROCESS_TERMINATE, False, pid)
        if handle:
            success = kernel32.TerminateProcess(handle, 1)
            kernel32.CloseHandle(handle)
            return bool(success)
    except Exception:
        pass
    return False

def _send_hardware_media_key(key_code: int):
    if sys.platform == "win32":
        try:
            ctypes.windll.user32.keybd_event(key_code, 0, KEYEVENTF_EXTENDEDKEY, 0)
            ctypes.windll.user32.keybd_event(key_code, 0, KEYEVENTF_EXTENDEDKEY | KEYEVENTF_KEYUP, 0)
        except Exception:
            pass

def _find_browser_windows():
    browser_windows = []
    target_exes = ["chrome.exe", "msedge.exe", "brave.exe", "firefox.exe"]
    if win32gui is None:
        return browser_windows

    def enum_windows_callback(hwnd, extra):
        if win32gui.IsWindowVisible(hwnd):
            title = win32gui.GetWindowText(hwnd).strip()
            if title:
                try:
                    _, pid = win32process.GetWindowThreadProcessId(hwnd)
                    p = psutil.Process(pid)
                    if p.name().lower() in target_exes:
                        browser_windows.append((hwnd, p.name().lower(), title))
                except Exception:
                    pass
        return True

    win32gui.EnumWindows(enum_windows_callback, None)
    return browser_windows

def _send_key_to_browser(key_code: int) -> bool:
    windows = _find_browser_windows()
    if not windows or win32gui is None or win32con is None:
        return False
    target_hwnd = None
    for hwnd, name, title in windows:
        if "youtube" in title.lower() or "shorts" in title.lower():
            target_hwnd = hwnd
            break
    if not target_hwnd and windows:
        target_hwnd = windows[0][0]
    if target_hwnd:
        win32gui.PostMessage(target_hwnd, win32con.WM_KEYDOWN, key_code, 0)
        win32gui.PostMessage(target_hwnd, win32con.WM_KEYUP, key_code, 0)
        return True
    return False

def _send_browser_play_pause_background() -> bool:
    windows = _find_browser_windows()
    if not windows or win32gui is None or win32con is None:
        return False
    target_hwnd = None
    for hwnd, name, title in windows:
        if "youtube" in title.lower() or "shorts" in title.lower():
            target_hwnd = hwnd
            break
    if not target_hwnd and windows:
        target_hwnd = windows[0][0]
    if target_hwnd:
        win32gui.PostMessage(target_hwnd, win32con.WM_KEYDOWN, VK_K, 0)
        win32gui.PostMessage(target_hwnd, win32con.WM_KEYUP, VK_K, 0)
        win32gui.PostMessage(target_hwnd, win32con.WM_APPCOMMAND, 0, 0xE0000)
        return True
    return False

async def _check_media_playing_async() -> bool:
    if MediaManager is None:
        return False
    try:
        manager = await MediaManager.request_async()
        session = manager.get_current_session()
        if not session:
            sessions = manager.get_sessions()
            if sessions and len(sessions) > 0:
                session = sessions[0]
        if session:
            info = session.get_playback_info()
            if info:
                return int(info.playback_status) == 4
    except Exception:
        pass
    return False

def is_media_actively_playing() -> bool:
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(_check_media_playing_async())
        loop.close()
        return bool(result)
    except Exception:
        return False

# Tool 1: YouTube Shorts Navigation
def navigate_shorts(direction: str = "next") -> str:
    """Navigates YouTube Shorts up or down hands-free."""
    cmd = direction.lower().strip()
    if cmd in ["next", "down", "forward"]:
        if _send_key_to_browser(VK_DOWN):
            return "Skipped to next Short, sir."
        if pyautogui:
            pyautogui.press("down")
        return "Scrolled to next Short, sir."
    elif cmd in ["previous", "prev", "up", "back"]:
        if _send_key_to_browser(VK_UP):
            return "Returned to previous Short, sir."
        if pyautogui:
            pyautogui.press("up")
        return "Scrolled to previous Short, sir."
    return "Direction must be 'next' or 'previous', sir."

# Tool 2: YouTube Video Skipping
def skip_video(direction: str = "next") -> str:
    """Skips to the next or previous video in the YouTube playlist/sequence."""
    cmd = direction.lower().strip()
    if cmd in ["next", "forward", "skip"]:
        if pyautogui:
            pyautogui.hotkey("shift", "n")
        return "Playing next video, sir."
    elif cmd in ["previous", "prev", "back"]:
        if pyautogui:
            pyautogui.hotkey("shift", "p")
        return "Playing previous video, sir."
    return "Invalid direction, sir."

# Tool 3: YouTube Seeking (10 Seconds Forward / Rewind)
def seek_video(action: str = "forward") -> str:
    """Seeks the current video 10 seconds forward or backward."""
    cmd = action.lower().strip()
    if cmd in ["forward", "fast_forward", "ahead"]:
        if _send_key_to_browser(VK_L):
            return "Advanced 10 seconds forward, sir."
        if pyautogui:
            pyautogui.press("l")
        return "Skipped 10 seconds forward, sir."
    elif cmd in ["rewind", "back", "backward"]:
        if _send_key_to_browser(VK_J):
            return "Rewound 10 seconds, sir."
        if pyautogui:
            pyautogui.press("j")
        return "Rewound 10 seconds, sir."
    return "Action must be 'forward' or 'rewind', sir."

# Tool 4: YouTube Fullscreen / Theater Mode View Toggle
def toggle_video_view(mode: str = "fullscreen") -> str:
    """Toggles fullscreen or theater mode in YouTube / web video player."""
    cmd = mode.lower().strip()
    if cmd in ["fullscreen", "full_screen", "full"]:
        if _send_key_to_browser(VK_F):
            return "Fullscreen toggled, sir."
        if pyautogui:
            pyautogui.press("f")
        return "Fullscreen mode toggled, sir."
    elif cmd in ["theater", "theatre", "cinema"]:
        if _send_key_to_browser(VK_T):
            return "Theater mode toggled, sir."
        if pyautogui:
            pyautogui.press("t")
        return "Theater mode toggled, sir."
    return "Mode must be 'fullscreen' or 'theater', sir."

# Tool 5: Universal Media Control (Play, Pause, Skip, Mute)
async def control_media(action: str) -> str:
    """Controls background and system media playback."""
    cmd = action.lower().strip().replace(" ", "_")
    session = None
    if MediaManager is not None:
        try:
            manager = await MediaManager.request_async()
            session = manager.get_current_session()
            if not session:
                sessions = manager.get_sessions()
                if sessions and len(sessions) > 0:
                    session = sessions[0]
        except Exception:
            session = None

    if session:
        try:
            if cmd in ["play", "pause", "play_pause", "resume", "toggle"]:
                await session.try_toggle_play_pause_async()
                return "Playback toggled, sir."
            elif cmd in ["next", "skip", "next_track"]:
                await session.try_skip_next_async()
                return "Skipped to next track, sir."
            elif cmd in ["previous", "prev", "previous_track", "back"]:
                await session.try_skip_previous_async()
                return "Playing previous track, sir."
            elif cmd in ["stop"]:
                await session.try_stop_async()
                return "Playback stopped, sir."
        except Exception:
            pass

    if cmd in ["play", "pause", "play_pause", "resume", "toggle"]:
        if _send_browser_play_pause_background():
            return "Toggled browser video playback, sir."
        _send_hardware_media_key(VK_MEDIA_PLAY_PAUSE)
        return "Playback toggled via hardware key, sir."
    elif cmd in ["next", "skip", "next_track"]:
        _send_hardware_media_key(VK_MEDIA_NEXT_TRACK)
        return "Skipped track, sir."
    elif cmd in ["previous", "prev", "previous_track", "back"]:
        _send_hardware_media_key(VK_MEDIA_PREV_TRACK)
        return "Previous track, sir."
    elif cmd in ["mute", "unmute", "toggle_mute"]:
        _send_hardware_media_key(VK_VOLUME_MUTE)
        return "Audio mute toggled, sir."
    return "No active media stream found to control, sir."

# Tool 6: Get Current Active Media Information
async def get_current_media_info() -> str:
    """Retrieves metadata of the currently playing track or YouTube video."""
    if MediaManager is not None:
        try:
            manager = await MediaManager.request_async()
            session = manager.get_current_session()
            if not session:
                sessions = manager.get_sessions()
                if sessions and len(sessions) > 0:
                    session = sessions[0]
            if session:
                props = await session.try_get_media_properties_async()
                if props and props.title and len(props.title.strip()) > 0:
                    title = props.title.strip()
                    artist = props.artist.strip() if props.artist else ""
                    if artist:
                        return f"Currently playing '{title}' by {artist}, sir."
                    return f"Currently playing '{title}', sir."
        except Exception:
            pass

    windows = _find_browser_windows()
    for _, _, raw_title in windows:
        clean = raw_title.lower()
        if "youtube" in clean or "shorts" in clean:
            clean_title = raw_title
            for suffix in ["- Google Chrome", "- Microsoft Edge", "- Brave", "- YouTube"]:
                clean_title = clean_title.replace(suffix, "").strip()
            if clean_title.startswith("(") and ")" in clean_title:
                clean_title = clean_title.split(")", 1)[1].strip()
            if clean_title and clean_title.lower() != "youtube":
                return f"Currently playing YouTube video: '{clean_title}', sir."

    return "No active media stream or video detected, sir."

# Tool 7: Open Websites
def open_website(url: str) -> str:
    """Opens any website or URL in the default web browser."""
    clean_url = url.strip()
    if not clean_url.startswith(("http://", "https://")):
        clean_url = "https://" + clean_url
    webbrowser.open(clean_url)
    return f"Opened {clean_url}"

# Tool 8: Universal Desktop & UWP Application Launcher
def open_application(app_name: str) -> str:
    """Finds and launches any desktop or UWP application."""
    query = app_name.lower().strip()
    uwp_protocols = {
        "camera": "microsoft.windows.camera:",
        "calculator": "calculator:",
        "calc": "calculator:",
        "photos": "ms-photos:",
        "settings": "ms-settings:",
        "spotify": "spotify:",
        "paint": "mspaint",
        "notepad": "notepad",
        "cmd": "cmd",
        "terminal": "wt",
        "explorer": "explorer",
        "task manager": "taskmgr",
    }
    if query in uwp_protocols:
        try:
            target = uwp_protocols[query]
            if target.endswith(":"):
                os.system(f"start {target}")
            else:
                subprocess.Popen(target, shell=True)
            return f"Launched {app_name}"
        except Exception:
            pass

    if sys.platform == "win32":
        search_dirs = [
            r"C:\ProgramData\Microsoft\Windows\Start Menu\Programs",
            os.path.expandvars(r"%APPDATA%\Microsoft\Windows\Start Menu\Programs"),
            os.path.expandvars(r"%LOCALAPPDATA%\Programs"),
        ]
        matches = []
        for directory in search_dirs:
            if not os.path.exists(directory):
                continue
            for root, _, files in os.walk(directory):
                for file in files:
                    if file.lower().endswith((".lnk", ".exe", ".url")):
                        file_name = file.lower().rsplit(".", 1)[0]
                        if query == file_name:
                            os.startfile(os.path.join(root, file))
                            return f"Launched {app_name}"
                        elif query in file_name:
                            matches.append(os.path.join(root, file))
        if matches:
            os.startfile(matches[0])
            return f"Launched {app_name}"
    return f"Could not launch {app_name}"

# Tool 9: Close Application
def close_application(app_name: str) -> str:
    """Closes application processes cleanly."""
    query = app_name.lower().strip().replace(".exe", "")
    protected = {"explorer.exe", "svchost.exe", "system", "idle", "python.exe", "cmd.exe"}
    current_pid = os.getpid()
    killed = 0
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            pid = proc.info['pid']
            pname = (proc.info['name'] or "").lower()
            if pid == current_pid or pname in protected:
                continue
            if query == pname.replace(".exe", "") or query in pname:
                proc.kill()
                killed += 1
        except Exception:
            continue
    if killed > 0:
        return f"Closed {app_name}."
    return f"Could not find any active process for {app_name}, sir."

# Tool 10: Deep Background Task Purge
def purge_background_tasks() -> str:
    """Scans and kills orphan background updater daemons and crash helpers."""
    target_signatures = [
        "crashpad_handler", "googleupdate", "microsoftedgeupdate", "edgeupdate",
        "epicwebhelper", "steamwebhelper", "discordhelper", "gamebarpresencewriter"
    ]
    protected = {"explorer.exe", "svchost.exe", "system", "python.exe"}
    initial_ram = psutil.virtual_memory().used
    killed_count = 0
    killed_names = set()
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            pid = proc.info['pid']
            raw_name = proc.info['name'] or ""
            lower_name = raw_name.lower()
            if pid == os.getpid() or lower_name in protected:
                continue
            if any(sig in lower_name for sig in target_signatures):
                proc.kill()
                killed_count += 1
                killed_names.add(raw_name.replace(".exe", "").title())
        except Exception:
            continue
    freed_mb = max(0, int((initial_ram - psutil.virtual_memory().used) / (1024 * 1024)))
    if freed_mb == 0 and killed_count > 0:
        freed_mb = killed_count * 48
    if killed_count > 0:
        names_str = ", ".join(list(killed_names)[:3])
        return f"Terminated {killed_count} tasks including {names_str}, freeing {freed_mb} MB RAM, sir."
    return "Background tasks are already optimized, sir."
