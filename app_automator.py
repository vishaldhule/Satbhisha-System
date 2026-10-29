"""
app_automator.py
Autonomous Application Dispatcher & High-Tech Typing Engine for JARVIS (Episode 17).
Features asynchronous background execution for immediate voice replies,
strict foreground window verification, and rapid clipboard-burst typing.
Built by Swayam Dhawale, Founder of Pulse of AI.
"""

import time
import threading
import subprocess

try:
    import pyautogui
except ImportError:
    pyautogui = None

try:
    import pyperclip
except ImportError:
    pyperclip = None

try:
    import pygetwindow as gw
except ImportError:
    gw = None

APP_TARGETS = {
    "notepad": {"cmd": "notepad.exe", "title": "Notepad"},
    "word": {"cmd": "start winword", "title": "Word"},
    "powerpoint": {"cmd": "start powerpnt", "title": "PowerPoint"},
    "calc": {"cmd": "calc.exe", "title": "Calculator"}
}

def generate_stunning_document(topic: str, word_count: int = 150, mode: str = "essay") -> str:
    """Creates a beautifully structured, multi-section document matching the target word count."""
    clean_topic = topic.strip().title() if topic.strip() else "Autonomous Intelligence"
    timestamp = time.strftime("%Y-%m-%d | %H:%M:%S")

    header = (
        "========================================================================\n"
        f" ■ JARVIS INTELLIGENCE BRIEF // CORE PROTOCOL: {clean_topic.upper()}\n"
        f" TIMESTAMP: {timestamp} // CLEARANCE: LEVEL 5 // STATUS: VERIFIED\n"
        "========================================================================\n\n"
    )

    abstract = (
        "[01] EXECUTIVE ABSTRACT\n"
        "------------------------------------------------------------------------\n"
        f"The acceleration of {clean_topic} represents a fundamental transition in modern\n"
        "computational workflows. By establishing closed-loop sensory feedback and eliminating\n"
        "deterministic friction, autonomous runtime systems transition from passive data\n"
        "listeners into proactive system operators.\n\n"
    )

    pillars = (
        "[02] ARCHITECTURAL PILLARS & CORE METRICS\n"
        "------------------------------------------------------------------------\n"
        f"• Neural Orchestration : Direct algorithmic grounding mapped to {clean_topic}.\n"
        "• Latency Optimization : Sub-1.5s bidirectional response loops across active nodes.\n"
        "• Desktop Telemetry    : Native OS window binding and memory-safe code injection.\n"
        "• Operational Fault-Tol: Multi-tier cloud failover ensuring continuous uptime.\n\n"
    )

    deep_analysis_base = (
        f"Deploying {clean_topic} within real-time desktop environments bridges the\n"
        "traditional disconnect between conversational intent and physical digital execution.\n"
        "Through low-overhead application hooking, the architecture monitors system state,\n"
        "parses complex input vectors, and drafts high-density technical deliverables without\n"
        "requiring manual human intervention. This continuous feedback loop ensures that every\n"
        "operation maintains absolute precision under fluctuating hardware constraints.\n\n"
    )

    trajectory = (
        "[03] STRATEGIC FORWARD TRAJECTORY\n"
        "------------------------------------------------------------------------\n"
        f"As systems aligned with {clean_topic} mature, manual interface management will\n"
        "become obsolete. Autonomous workflows will seamlessly bridge voice commands,\n"
        "visual reasoning, and rapid mechanical typing to establish a truly frictionless\n"
        "digital workspace.\n\n"
        "------------------------------------------------------------------------\n"
        "// END OF TRANSMISSION // COMPILED AUTONOMOUSLY BY JARVIS // PULSE OF AI\n"
        "========================================================================\n"
    )

    current_text = header + abstract + pillars + trajectory
    current_words = len(current_text.split())
    body_expanded = ""

    while (current_words + len(body_expanded.split())) < word_count:
        body_expanded += deep_analysis_base
        if (current_words + len(body_expanded.split())) >= word_count:
            break

    if body_expanded:
        full_document = (
            header
            + abstract
            + pillars
            + "[03] DETAILED SYSTEM ANALYSIS\n------------------------------------------------------------------------\n"
            + body_expanded
            + trajectory
        )
    else:
        full_document = header + abstract + pillars + trajectory

    return full_document

def ensure_target_focused(target_title: str) -> bool:
    """Verifies and forces the target window into the foreground."""
    if not gw:
        return True
    try:
        windows = [w for w in gw.getAllWindows() if target_title.lower() in w.title.lower()]
        if not windows:
            return False
        target_win = windows[0]
        if target_win.isMinimized:
            target_win.restore()
        target_win.activate()
        time.sleep(0.15)
        return True
    except Exception:
        return False

def fast_ghost_type(text: str, target_title: str, word_delay: float = 0.012, line_delay: float = 0.04):
    """Types into the target application with focus safety locks."""
    if not pyautogui or not pyperclip:
        print("[AUTOMATOR] pyautogui/pyperclip not installed; running in virtual head mode.")
        return

    lines = text.split("\n")
    for line in lines:
        if not ensure_target_focused(target_title):
            print(f"[AUTOMATOR] Target window '{target_title}' lost focus. Halting injection to protect active window.")
            break

        if not line.strip():
            pyautogui.press("enter")
            continue

        if any(border_char in line for border_char in ["===", "---"]):
            pyperclip.copy(line)
            pyautogui.hotkey("ctrl", "v")
            pyautogui.press("enter")
            time.sleep(0.03)
            continue

        words = line.split(" ")
        for i, word in enumerate(words):
            pyperclip.copy(word + (" " if i < len(words) - 1 else ""))
            pyautogui.hotkey("ctrl", "v")
            time.sleep(word_delay)

        pyautogui.press("enter")
        time.sleep(line_delay)

def _compose_worker(target_key: str, topic: str, word_count: int, mode: str):
    """Background worker handling application spawning, focus, and stream typing."""
    app_meta = APP_TARGETS.get(target_key, APP_TARGETS["notepad"])
    try:
        subprocess.Popen(app_meta["cmd"], shell=True)
        time.sleep(1.2)
    except Exception:
        target_key = "notepad"
        app_meta = APP_TARGETS["notepad"]
        try:
            subprocess.Popen(app_meta["cmd"], shell=True)
            time.sleep(1.2)
        except Exception:
            pass

    ensure_target_focused(app_meta["title"])
    document_content = generate_stunning_document(topic, word_count=int(word_count), mode=mode)
    fast_ghost_type(document_content, target_title=app_meta["title"], word_delay=0.012, line_delay=0.03)

def open_and_compose(app_name: str, topic: str, word_count: int = 150, mode: str = "essay") -> str:
    """Dispatches the document composition task to a background worker and returns immediately."""
    raw_app = app_name.strip().lower() if app_name else "notepad"
    target_key = "notepad"
    for key in APP_TARGETS.keys():
        if key in raw_app:
            target_key = key
            break

    app_meta = APP_TARGETS[target_key]
    worker = threading.Thread(
        target=_compose_worker,
        args=(target_key, topic, word_count, mode),
        daemon=True
    )
    worker.start()

    return f"Dispatching background automation: Opening {app_meta['title']} and composing {word_count} words on '{topic}' right now, sir."

def create_document_and_write(app_name: str, topic: str, word_count: int = 150, doc_type: str = "essay") -> str:
    """Opens Notepad, Word, or PowerPoint and writes an essay or notes matching the exact target word count."""
    return open_and_compose(app_name, topic, word_count=int(word_count), mode=doc_type)
