"""
ppt_engine.py
Ultimate Autonomous Presentation Engine for JARVIS (Production Grade - Episode 19).
Features: Gemini -> Groq -> OpenRouter Multi-Model Router, Deep Content Enforcement,
NO-KEY Free AI Image Generation, and 5 Flawless Dynamic Visual Layouts.
Built by Swayam Dhawale, Founder of Pulse of AI.
"""

import os
import json
import threading
import time
import random
import urllib.parse
import requests
import pyautogui
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from dotenv import load_dotenv

# Initialize environment variables
load_dotenv()

# ==========================================
# SYSTEM CONFIGURATION & DIRECTORIES
# ==========================================
OUTPUT_DIR = os.path.join(os.path.expanduser("~"), "Desktop", "Jarvis_Presentations")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Cyberpunk Modern Enterprise Palette
COLOR_BG = RGBColor(11, 15, 25)           # Deep Void Slate (#0B0F19)
COLOR_CARD_BG = RGBColor(20, 27, 45)      # Elevated Card Plate (#141B2D)
COLOR_CARD_BORDER = RGBColor(30, 41, 69)  # Subtle Border Line
COLOR_CYAN = RGBColor(0, 229, 255)        # Primary Neon Accent
COLOR_PURPLE = RGBColor(168, 85, 247)     # Secondary Accent
COLOR_WHITE = RGBColor(248, 250, 252)     # Header Text
COLOR_TEXT = RGBColor(226, 232, 240)      # Body Text
COLOR_MUTED = RGBColor(148, 163, 184)     # Muted Metadata


# ==========================================
# CORE UTILITY FUNCTIONS
# ==========================================
def clean_json_response(text: str) -> dict:
    """Strips markdown and parses the raw JSON payload safely."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError as e:
        print(f"[PPT_ENGINE] CRITICAL JSON PARSE ERROR: {e}")
        raise ValueError("The LLM returned corrupted JSON formatting.")


# ==========================================
# AI TEXT GENERATION (THE BRAIN)
# ==========================================
def fetch_llm_payload(topic: str) -> dict:
    """
    Multi-Model Router: Routes between Gemini, Groq, and OpenRouter.
    Forces extremely high-detail, rich contextual paragraphs.
    """
    prompt = f"""
You are an elite, world-class presentation designer and subject matter expert.
Create an exhaustive, highly detailed 6 to 8 slide professional presentation on '{topic}'.

CRITICAL INSTRUCTIONS:
1. Do NOT use short bullet points. Every 'desc' (description) must be a deep, rich, comprehensive 2-to-3 sentence explanation.
2. Every 'summary' must be a highly professional, academic-level paragraph introducing the slide.
3. Return ONLY a valid JSON object. No markdown, no conversational filler.

You must choose the absolute best visual layout for each slide from these options:
['split_image_right', 'split_image_left', 'cards', 'timeline', 'flowchart']

Format:
{{
  "main_title": "Title",
  "subtitle": "Subtitle",
  "slides": [
    {{
      "layout": "<CHOOSE 1 ABOVE FROM OPTIONS>",
      "badge": "<Short 1-2 badge category word>",
      "heading": "<Slide Title>",
      "summary": "<Deep, 3-line analysis comprehensive concept expert slide summarizing this>",
      "image_prompt": "<Highly descriptive prompt representing slide concept for AI generator>",
      "items": [
        {{"title": "Detailed Concept Name", "desc": "A very rich, detailed, 2-to-3 sentence explanation providing deep value."}}
      ]
    }}
  ]
}}
"""

    # 1. ATTEMPT GEMINI API
    google_key = os.getenv("GOOGLE_API_KEY")
    if not google_key:
        try:
            from Setup import get_or_prompt_api_key
            google_key = get_or_prompt_api_key()
        except Exception:
            pass

    if google_key:
        print("[PPT_ENGINE] Sending prompt to Google Gemini...")
        try:
            from google import genai
            from google.genai import types
            client = genai.Client(api_key=google_key)
            model_target = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
            response = client.models.generate_content(
                model=model_target,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )
            print("[PPT_ENGINE] Gemini successfully generated rich content.")
            return clean_json_response(response.text)
        except Exception as e:
            print(f"[PPT_ENGINE] ■■ Gemini failed or quota exhausted: {e}")

    # 2. ATTEMPT GROQ API (Blazing Fast Fallback)
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        print("[PPT_ENGINE] Routing to Groq AI...")
        try:
            headers = {"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"}
            payload = {
                "model": "llama3-70b-8192",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2
            }
            groq_url = "https://" + "api.groq.com" + "/openai/v1/chat/completions"
            res = requests.post(groq_url, json=payload, headers=headers)
            res.raise_for_status()
            print("[PPT_ENGINE] Groq successfully generated rich content.")
            return clean_json_response(res.json()["choices"][0]["message"]["content"])
        except Exception as e:
            print(f"[PPT_ENGINE] ■■ Groq failed: {e}")
    else:
        print("[PPT_ENGINE] ■ No GROQ_API_KEY found in .env.")

    # 3. ATTEMPT OPENROUTER API
    or_key = os.getenv("OPENROUTER_API_KEY")
    if or_key:
        print("[PPT_ENGINE] Routing to OpenRouter...")
        try:
            headers = {"Authorization": f"Bearer {or_key}", "Content-Type": "application/json"}
            payload = {
                "model": "google/gemini-2.5-flash:free",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2
            }
            or_url = "https://" + "openrouter.ai" + "/api/v1/chat/completions"
            res = requests.post(or_url, json=payload, headers=headers)
            res.raise_for_status()
            print("[PPT_ENGINE] OpenRouter successfully generated rich content.")
            return clean_json_response(res.json()["choices"][0]["message"]["content"])
        except Exception as e:
            print(f"[PPT_ENGINE] ■■ OpenRouter failed: {e}")
    else:
        print("[PPT_ENGINE] ■ No OPENROUTER_API_KEY found in .env.")

    # 4. EMERGENCY LOCAL KNOWLEDGE SYNTHESIS (GUARANTEED NO-CRASH DECK)
    print("\n[PPT_ENGINE] Using local high-detail synthesis for guaranteed presentation compilation.")
    clean_topic = topic.strip().title() if topic.strip() else "Autonomous Intelligence"
    return {
        "main_title": f"{clean_topic.upper()} ARCHITECTURE",
        "subtitle": f"Autonomous Operational Blueprint & Deployment Paradigm • Pulse of AI",
        "slides": [
            {
                "layout": "split_image_right",
                "badge": "FOUNDATION",
                "heading": "SYSTEM PHILOSOPHY & OBJECTIVES",
                "summary": f"The integration of modern {clean_topic} represents an epochal leap toward autonomous agentic workflows. By removing deterministic friction and executing parallel sub-second routines, modern platforms achieve unprecedented scalability.",
                "image_prompt": f"Futuristic cyberpunk neural interface for {clean_topic}, holographic glowing lines, deep obsidian background",
                "items": [
                    {"title": "Zero-Latency Telemetry", "desc": f"Bidirectional data telemetry pipelines actively monitor throughput and system health while running parallel inference loops for {clean_topic}."},
                    {"title": "Autonomous Delegation", "desc": "Sub-processes execute asynchronously without blocking critical user threads, ensuring continuous deterministic responsiveness."},
                    {"title": "Deterministic Safety", "desc": "Hardware safety rails and active memory locks ensure runtime stability even under intensive model inference spikes."}
                ]
            },
            {
                "layout": "cards",
                "badge": "PILLARS",
                "heading": "CORE COMPUTATIONAL PILLARS",
                "summary": f"Three foundational pillars anchor the {clean_topic} infrastructure, spanning multi-tier neural models, persistent hardware telemetry, and automated presentation workflows.",
                "image_prompt": f"Futuristic glowing server racks with neon cyan and purple data streams",
                "items": [
                    {"title": "Distributed Neural Routing", "desc": f"Intelligent multi-model fallback cascades requests across high-speed edge clusters, dynamically mitigating rate limits and downtime."},
                    {"title": "Physical Desktop Grounding", "desc": "Native OS integration directly binds mouse, keyboard, and COM automation layers for seamless workspace manipulation."},
                    {"title": "Self-Evolving Capability Core", "desc": "Tri-core skill synthesizer continuously inspects operational deficiencies, writing and executing new tools on demand."}
                ]
            },
            {
                "layout": "timeline",
                "badge": "ROADMAP",
                "heading": "STRATEGIC EXECUTION TIMELINE",
                "summary": f"A structured phase-by-phase rollout engineered to transition experimental {clean_topic} concepts into hardened enterprise deployment.",
                "image_prompt": f"Digital timeline roadmap with glowing nodes and futuristic cyan conduits",
                "items": [
                    {"title": "Phase 1: Sensory Integration", "desc": "Full deployment of local visual processing and audio streaming loops."},
                    {"title": "Phase 2: Dynamic Skill Synthesis", "desc": "Autonomous runtime Python tool generation and live hot-reloading."},
                    {"title": "Phase 3: Deep App Orchestration", "desc": "Hands-free control of Word, PowerPoint, and system utilities."},
                    {"title": "Phase 4: Autonomous Horizon", "desc": "Self-supervised edge execution and persistent agentic autonomy."}
                ]
            },
            {
                "layout": "flowchart",
                "badge": "PIPELINE",
                "heading": "OPERATIONAL INGESTION PIPELINE",
                "summary": f"Visualizing the deterministic data journey from raw multimodal sensor ingestion down to physical OS execution.",
                "image_prompt": f"High tech holographic workflow pipeline schematic with purple data arrows",
                "items": [
                    {"title": "Ingestion & Activity Detection", "desc": "Real-time audio and visual streams are sampled and threshold-verified via RMS energy calculation."},
                    {"title": "Reflex Engine Classification", "desc": "Commands are parsed via zero-latency sub-10ms pattern matchers before escalating to cloud LLMs."},
                    {"title": "Physical Dispatch & Execution", "desc": "OS-level automation handles PowerPoint, desktop tools, and document synthesizers with verified window handles."}
                ]
            },
            {
                "layout": "split_image_left",
                "badge": "HORIZON",
                "heading": "ENTERPRISE IMPACT & FUTURE HORIZONS",
                "summary": f"The long-term realization of {clean_topic} transforms traditional computing interfaces into frictionless, voice-and-vision collaborative partnerships.",
                "image_prompt": f"Holographic futuristic human-AI workspace with floating dark glass UI widgets",
                "items": [
                    {"title": "Exponential Productivity Gain", "desc": "Eliminating manual presentation drafting and document formatting frees operators for high-leverage strategic reasoning."},
                    {"title": "Unified Multimodal Intelligence", "desc": "Speech, vision, and desktop action converge into an integrated digital assistant that anticipates operational needs."},
                    {"title": "Continuous Adaptation", "desc": "The platform learns user preferences and custom domain nomenclature, perpetually refining its output quality."}
                ]
            }
        ]
    }


# ==========================================
# 100% FREE NO-KEY IMAGE FETCHING SYSTEM
# ==========================================
def fetch_and_save_image(prompt: str, slide_index: int) -> str:
    """
    Downloads an AI image without requiring any API keys.
    Saves it locally to guarantee the PowerPoint library can render it.
    """
    if not prompt:
        prompt = "modern futuristic corporate technology"
    safe_prompt = urllib.parse.quote(prompt.replace('\n', ' ')[:150])
    temp_img_path = os.path.join(OUTPUT_DIR, f"temp_slide_img_{slide_index}.jpg")

    print(f"[PPT_ENGINE] Generating AI image for Slide {slide_index + 1}...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "image/jpeg,image/webp,image/png,*/*"
    }

    # Attempt 1: Pollinations Generative AI
    pollinations_url = "https://" + "image.pollinations.ai" + f"/prompt/{safe_prompt}?width=800&height=1080&nologo=true"
    try:
        res = requests.get(pollinations_url, headers=headers, timeout=12, stream=True)
        if res.status_code == 200:
            with open(temp_img_path, "wb") as f:
                for chunk in res.iter_content(1024):
                    f.write(chunk)
            if os.path.getsize(temp_img_path) > 5000:
                return temp_img_path
    except Exception as e:
        print(f"[PPT_ENGINE] -> AI Image Generator timed out: {e}")

    # Attempt 2: High-Res Abstract Picsum Fallback
    print(f"[PPT_ENGINE] -> Resorting to high-res abstract fallback image...")
    fallback_seed = str(random.randint(1000, 9999))
    fallback_url = "https://" + "picsum.photos" + f"/seed/{fallback_seed}/800/1080"
    try:
        res = requests.get(fallback_url, headers=headers, timeout=8, stream=True)
        if res.status_code == 200:
            with open(temp_img_path, "wb") as f:
                for chunk in res.iter_content(1024):
                    f.write(chunk)
            return temp_img_path
    except Exception:
        pass

    return None


def apply_background(slide):
    """Paints the background with the custom cyberpunk dark slate color."""
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = COLOR_BG


# ==========================================
# POWERPOINT SLIDE COMPILATION & LOGIC
# ==========================================
def build_dynamic_presentation(topic: str) -> str:
    print(f"[PPT_ENGINE] Initiating Deep Analysis Deck Generation for: '{topic}'")
    deck_data = fetch_llm_payload(topic)

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    temp_image_files = []

    # ==========================================
    # SLIDE 1: TITLE SLIDE
    # ==========================================
    slide1 = prs.slides.add_slide(blank_layout)
    apply_background(slide1)
    title_box = slide1.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(6.0), Inches(3.0))
    tf = title_box.text_frame
    tf.word_wrap = True

    tf.paragraphs[0].text = "EXECUTIVE INTELLIGENCE BRIEFING"
    tf.paragraphs[0].font.size = Pt(13)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = COLOR_PURPLE

    p_title = tf.add_paragraph()
    p_title.text = deck_data.get("main_title", topic).upper()
    p_title.font.size = Pt(44)
    p_title.font.bold = True
    p_title.font.color.rgb = COLOR_WHITE
    p_title.space_before = Pt(8)

    p_sub = tf.add_paragraph()
    p_sub.text = deck_data.get("subtitle", "Autonomous System Generation • Pulse of AI")
    p_sub.font.size = Pt(16)
    p_sub.font.color.rgb = COLOR_MUTED
    p_sub.space_before = Pt(14)

    # Compile Title Image
    title_img_prompt = f"Abstract conceptual art representing {topic}, dark corporate cyberpunk aesthetics"
    img_path = fetch_and_save_image(title_img_prompt, 0)
    if img_path and os.path.exists(img_path):
        slide1.shapes.add_picture(img_path, Inches(7.333), Inches(0), Inches(6.0), Inches(7.5))
        temp_image_files.append(img_path)

    # ==========================================
    # DYNAMIC CONTENT SLIDES
    # ==========================================
    for idx, slide_info in enumerate(deck_data.get("slides", [])):
        slide = prs.slides.add_slide(blank_layout)
        apply_background(slide)
        layout = slide_info.get("layout", "split_image_right")
        print(f"[PPT_ENGINE] Assembling Slide {idx+2}: {slide_info.get('heading')} (Layout: {layout})")

        # Slide Header Assembly
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.5), Inches(1.0))
        htf = header_box.text_frame

        hp = htf.paragraphs[0]
        hp.text = slide_info.get("badge", "OVERVIEW").upper()
        hp.font.size = Pt(11)
        hp.font.bold = True
        hp.font.color.rgb = COLOR_CYAN

        hp_h = htf.add_paragraph()
        hp_h.text = slide_info.get("heading", "").upper()
        hp_h.font.size = Pt(28)
        hp_h.font.bold = True
        hp_h.font.color.rgb = COLOR_WHITE
        hp_h.space_before = Pt(4)

        items = slide_info.get("items", [])

        # --- LAYOUT: SPLIT IMAGE RIGHT ---
        if layout == "split_image_right":
            sum_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(6.0), Inches(1.0))
            sum_box.text_frame.word_wrap = True
            sum_box.text_frame.paragraphs[0].text = slide_info.get("summary", "")
            sum_box.text_frame.paragraphs[0].font.size = Pt(15)
            sum_box.text_frame.paragraphs[0].font.color.rgb = COLOR_TEXT

            start_y = 3.0
            for item in items[:3]:
                b_box = slide.shapes.add_textbox(Inches(0.8), Inches(start_y), Inches(6.0), Inches(1.2))
                b_box.text_frame.word_wrap = True
                bp = b_box.text_frame.paragraphs[0]
                bp.text = f"• {item.get('title', '')}:"
                bp.font.bold = True
                bp.font.size = Pt(14)
                bp.font.color.rgb = COLOR_CYAN

                bp_desc = b_box.text_frame.add_paragraph()
                bp_desc.text = item.get('desc', '')
                bp_desc.font.size = Pt(12)
                bp_desc.font.color.rgb = COLOR_MUTED
                bp_desc.space_before = Pt(3)
                start_y += 1.2

            img_path = fetch_and_save_image(slide_info.get("image_prompt", topic), idx + 1)
            if img_path and os.path.exists(img_path):
                slide.shapes.add_picture(img_path, Inches(7.5), Inches(1.5), Inches(5.0), Inches(5.5))
                temp_image_files.append(img_path)

        # --- LAYOUT: SPLIT IMAGE LEFT ---
        elif layout == "split_image_left":
            img_path = fetch_and_save_image(slide_info.get("image_prompt", topic), idx + 1)
            if img_path and os.path.exists(img_path):
                slide.shapes.add_picture(img_path, Inches(0.8), Inches(1.5), Inches(5.0), Inches(5.5))
                temp_image_files.append(img_path)

            sum_box = slide.shapes.add_textbox(Inches(6.2), Inches(1.8), Inches(6.5), Inches(1.0))
            sum_box.text_frame.word_wrap = True
            sum_box.text_frame.paragraphs[0].text = slide_info.get("summary", "")
            sum_box.text_frame.paragraphs[0].font.size = Pt(15)
            sum_box.text_frame.paragraphs[0].font.color.rgb = COLOR_TEXT

            start_y = 3.0
            for item in items[:3]:
                b_box = slide.shapes.add_textbox(Inches(6.2), Inches(start_y), Inches(6.5), Inches(1.2))
                b_box.text_frame.word_wrap = True
                bp = b_box.text_frame.paragraphs[0]
                bp.text = f"• {item.get('title', '')}:"
                bp.font.bold = True
                bp.font.size = Pt(14)
                bp.font.color.rgb = COLOR_CYAN

                bp_desc = b_box.text_frame.add_paragraph()
                bp_desc.text = item.get('desc', '')
                bp_desc.font.size = Pt(12)
                bp_desc.font.color.rgb = COLOR_MUTED
                bp_desc.space_before = Pt(3)
                start_y += 1.2

        # --- LAYOUT: TIMELINE ---
        elif layout == "timeline":
            sum_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(11.5), Inches(0.8))
            sum_box.text_frame.paragraphs[0].text = slide_info.get("summary", "")
            sum_box.text_frame.paragraphs[0].font.size = Pt(15)
            sum_box.text_frame.paragraphs[0].font.color.rgb = COLOR_TEXT

            base_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.0), Inches(4.5), Inches(11.3), Pt(4))
            base_line.fill.solid()
            base_line.fill.fore_color.rgb = COLOR_MUTED

            node_x = 1.5
            for idx_item, item in enumerate(items[:4]):
                node = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(node_x), Inches(4.35), Inches(0.35), Inches(0.35))
                node.fill.solid()
                node.fill.fore_color.rgb = COLOR_CYAN

                t_box = slide.shapes.add_textbox(Inches(node_x - 1.2), Inches(2.8 if idx_item % 2 == 0 else 5.0), Inches(2.8), Inches(1.5))
                t_box.text_frame.word_wrap = True
                p1 = t_box.text_frame.paragraphs[0]
                p1.text = item.get("title", "")
                p1.font.bold = True
                p1.font.size = Pt(14)
                p1.font.color.rgb = COLOR_WHITE

                p2 = t_box.text_frame.add_paragraph()
                p2.text = item.get("desc", "")
                p2.font.size = Pt(12)
                p2.font.color.rgb = COLOR_MUTED
                node_x += 3.1

        # --- LAYOUT: FLOWCHART / PROCESS ---
        elif layout == "flowchart":
            sum_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(11.5), Inches(0.8))
            sum_box.text_frame.paragraphs[0].text = slide_info.get("summary", "")
            sum_box.text_frame.paragraphs[0].font.size = Pt(15)
            sum_box.text_frame.paragraphs[0].font.color.rgb = COLOR_TEXT

            start_y = 2.5
            for idx_item, item in enumerate(items[:3]):
                box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.6), Inches(start_y), Inches(6.0), Inches(1.2))
                box.fill.solid()
                box.fill.fore_color.rgb = COLOR_CARD_BG
                box.line.color.rgb = COLOR_CYAN

                btf = box.text_frame
                bp = btf.paragraphs[0]
                bp.text = f"{item.get('title', '').upper()}"
                bp.font.bold = True
                bp.font.size = Pt(13)
                bp.font.color.rgb = COLOR_CYAN

                bp_desc = btf.add_paragraph()
                bp_desc.text = item.get("desc", "")
                bp_desc.font.size = Pt(11)
                bp_desc.font.color.rgb = COLOR_TEXT
                bp_desc.space_before = Pt(4)

                if idx_item < len(items[:3]) - 1:
                    arrow = slide.shapes.add_shape(MSO_SHAPE.DOWN_ARROW, Inches(6.3), Inches(start_y + 1.25), Inches(0.4), Inches(0.35))
                    arrow.fill.solid()
                    arrow.fill.fore_color.rgb = COLOR_PURPLE

                start_y += 1.7

        # --- LAYOUT: CARDS / METRICS (Default) ---
        else:
            sum_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(11.5), Inches(0.8))
            sum_box.text_frame.paragraphs[0].text = slide_info.get("summary", "")
            sum_box.text_frame.paragraphs[0].font.size = Pt(15)
            sum_box.text_frame.paragraphs[0].font.color.rgb = COLOR_TEXT

            start_x = 1.0
            for item in items[:3]:
                card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(start_x), Inches(3.0), Inches(3.5), Inches(3.5))
                card.fill.solid()
                card.fill.fore_color.rgb = COLOR_CARD_BG
                card.line.color.rgb = COLOR_CARD_BORDER

                ctf = card.text_frame
                ctf.word_wrap = True
                cp1 = ctf.paragraphs[0]
                cp1.text = item.get("title", "")
                cp1.font.bold = True
                cp1.font.size = Pt(16)
                cp1.font.color.rgb = COLOR_CYAN

                cp2 = ctf.add_paragraph()
                cp2.text = item.get("desc", "")
                cp2.font.size = Pt(13)
                cp2.font.color.rgb = COLOR_MUTED
                cp2.space_before = Pt(12)

                start_x += 3.9

    # ==========================================
    # FILE SAVING & CLEANUP
    # ==========================================
    safe_name = "".join(c for c in topic if c.isalnum() or c in (" ", "_")).rstrip()
    filepath = os.path.join(OUTPUT_DIR, f"{safe_name.replace(' ', '_')}_Dynamic_Deck.pptx")
    prs.save(filepath)

    # Erase the downloaded temp images
    for temp_img in temp_image_files:
        try:
            if os.path.exists(temp_img):
                os.remove(temp_img)
        except Exception:
            pass

    print(f"[PPT_ENGINE] Generation Complete: {filepath}")
    return filepath


def _launch_worker(filepath: str):
    """Spawns a thread to physically open PowerPoint and press F5."""
    try:
        os.startfile(filepath)
        time.sleep(3.0)
        pyautogui.press("f5")
    except Exception as e:
        print(f"[PPT_ENGINE] Auto-launch failed: {e}")


def create_and_launch_ppt(topic: str, slide_count: int = 6) -> str:
    """Entry point for JARVIS Voice Command routing."""
    filepath = build_dynamic_presentation(topic)
    threading.Thread(target=_launch_worker, args=(filepath,), daemon=True).start()
    return f"Successfully generated a deeply researched, visually advanced presentation on '{topic}' and launched the slide show, sir. I love ppt made by this code."
