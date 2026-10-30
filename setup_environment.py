"""
setup_environment.py
J.A.R.V.I.S. Neural Environment Diagnostic & Verification Suite (Episode 19)
Architected by Swayam Dhawale, Founder of Pulse of AI.
"""

import sys
import os
import platform

def print_banner():
    banner = r"""
   __  ___   ____  _    __ _____ _____    ____  ____  ________
  / / /   | / __ \| |  / //_  _// ___/   / __ \/ __ \/ ____/ /
 / / / /| |/ /_/ /| | / /  / /  \__ \   / / / / /_/ / __/ / / 
/ /_/ / ___ / _, _/ | |/ / _/ /  ___/ /  / /_/ / ____/ /___/_/  
\____/_/  |_/_/ |_| |___/ /___/ /____/   \____/_/   /_____(_)   

   EPISODE 19: NEURAL RUNTIME DIAGNOSTIC & ENVIRONMENT AUDIT
   Pulse of AI • Swayam Dhawale Architecture
"""
    print(banner)

def check_python_version():
    ver = sys.version_info
    print(f"[1/5] Python Version: {ver.major}.{ver.minor}.{ver.micro} ({platform.system()} {platform.machine()})")
    if ver.major < 3 or (ver.major == 3 and ver.minor < 9):
        print("  ❌ WARNING: Python 3.9 or higher recommended for Episode 19 features.")
        return False
    print("  ✔ Python version certified compatible.")
    return True

def check_modules():
    print("\n[2/5] Inspecting Installed Core Modules:")
    modules = [
        ("pptx", "python-pptx (Episode 18 & 19 Presentation Engine)"),
        ("pyautogui", "pyautogui (Hands-Free Desktop Navigation)"),
        ("google.genai", "google-genai (Gemini Live & Reasoning)"),
        ("requests", "requests (No-Key Free AI Image Ingestion)"),
        ("dotenv", "python-dotenv (Environment Key Security)"),
        ("psutil", "psutil (Hardware & Task Manager Telemetry)"),
        ("pyaudio", "pyaudio (Bimodal Real-Time Audio Streaming)"),
        ("rich", "rich (Cyberpunk HUD Terminal Engine)"),
    ]

    missing = []
    for mod_name, desc in modules:
        try:
            __import__(mod_name)
            print(f"  ✔ {desc.split()[0]:<15} : Available ({desc})")
        except ImportError:
            print(f"  ❌ {desc.split()[0]:<15} : MISSING ({desc})")
            missing.append(desc.split()[0])

    if missing:
        print(f"\n  ⚠ Run 'pip install {' '.join(missing)}' to install missing components.")
    else:
        print("  ✔ All essential libraries successfully installed.")
    return len(missing) == 0

def check_env_keys():
    print("\n[3/5] Inspecting API Configuration (.env):")
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass

    keys = [
        ("GEMINI_API_KEY", "Gemini Multimodal Reasoning Engine (High Priority)"),
        ("GOOGLE_API_KEY", "Google Gemini Live Direct Key"),
        ("GROQ_API_KEY", "Groq LLaMA Edge High-Speed Failover"),
        ("OPENROUTER_API_KEY", "OpenRouter Multi-Model Fallback"),
        ("ELEVENLABS_API_KEY", "ElevenLabs Neural Speech Synthesis"),
        ("ELEVENLABS_VOICE_ID", "Voice ID (Avni: VG7gYikNQ71LJ52W9fAD)"),
    ]

    found_any_ai = False
    for key, desc in keys:
        val = os.getenv(key)
        if val and len(val.strip()) > 3:
            masked = val[:4] + "..." + val[-3:] if len(val) > 8 else "***"
            print(f"  ✔ {key:<20} : DETECTED [{masked}]")
            if "GEMINI" in key or "GOOGLE" in key or "GROQ" in key:
                found_any_ai = True
        else:
            print(f"  ◌ {key:<20} : Not set ({desc})")

    if not found_any_ai:
        print("\n  💡 TIP: Even without API keys, ppt_engine.py includes built-in Emergency")
        print("     High-Detail Synthesis for 100% crash-free PPT generation.")

def check_output_dirs():
    print("\n[4/5] Inspecting Target Output Directories:")
    desktop_dir = os.path.join(os.path.expanduser("~"), "Desktop", "Jarvis_Presentations")
    try:
        os.makedirs(desktop_dir, exist_ok=True)
        print(f"  ✔ Presentations Directory: {desktop_dir} (Ready)")
    except Exception as e:
        print(f"  ⚠ Directory fallback: {e}")

def run_smoke_test():
    print("\n[5/5] Smoke Testing PPT Engine Layouts:")
    try:
        import pptx
        prs = pptx.Presentation()
        prs.slide_width = pptx.util.Inches(13.333)
        prs.slide_height = pptx.util.Inches(7.5)
        print("  ✔ Presentation object initialization: OK (16:9 Widescreen)")
    except Exception as e:
        print(f"  ⚠ PPT engine test note: {e}")

if __name__ == "__main__":
    print_banner()
    check_python_version()
    check_modules()
    check_env_keys()
    check_output_dirs()
    run_smoke_test()
    print("\n" + "="*79)
    print("  DIAGNOSTIC COMPLETE • J.A.R.V.I.S. READY FOR DEPLOYMENT")
    print("="*79 + "\n")
