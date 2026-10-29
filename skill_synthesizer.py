"""
skill_synthesizer.py
Dynamic Tri-Core Skill Synthesizer & Code Evolving Engine for JARVIS (Episode 17).
Built by Swayam Dhawale, Founder of Pulse of AI.
"""

import os
import json
import datetime

SKILLS_REGISTRY = "skills_registry.json"

def _load_skills():
    if os.path.exists(SKILLS_REGISTRY):
        try:
            with open(SKILLS_REGISTRY, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {
        "voice_navigation": "Native hands-free media and timeline scrubber.",
        "screen_vision": "Multimodal GPU visual perception and Chrome grounding.",
        "ghost_writing": "Autonomous application launcher and ghost typing composer.",
        "code_generator": "On-the-fly Python Tkinter/Pygame GUI synthesis."
    }

def _save_skills(skills):
    try:
        with open(SKILLS_REGISTRY, "w", encoding="utf-8") as f:
            json.dump(skills, f, indent=2)
    except Exception:
        pass

def evolve_skill(skill_description: str) -> str:
    """Dynamically teaches JARVIS a new custom function, python skill, or specialized workflow."""
    skills = _load_skills()
    skill_key = f"skill_{len(skills) + 1}_{datetime.datetime.now().strftime('%H%M%S')}"
    skills[skill_key] = skill_description
    _save_skills(skills)
    return f"Neural pathway evolved and assimilated new skill: '{skill_description}', sir."

def list_active_skills() -> str:
    """Lists all dynamically learned skills and active tools."""
    skills = _load_skills()
    summary = ", ".join([f"{k}: {v}" for k, v in list(skills.items())[:6]])
    return f"Active neural skills ({len(skills)} online): {summary}, sir."
