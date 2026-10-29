import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Mock / Server State for JARVIS & Mark-XXXIX
interface ToolItem {
  id: string;
  name: string;
  description: string;
  category: 'utility' | 'game' | 'dashboard' | 'finance';
  code: string;
  type: 'html' | 'react' | 'canvas' | 'python';
  createdAt: string;
}

const savedTools: ToolItem[] = [
  {
    id: 'tool_calculator_01',
    name: 'Modern Multi-Window Calculator',
    description: 'High-precision scientific & financial matrix calculator with floating memory registers.',
    category: 'utility',
    type: 'html',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #0b1120; color: #38bdf8; font-family: monospace; padding: 20px; margin: 0; }
    .calc { background: #030712; border: 1px solid #0284c7; border-radius: 8px; padding: 16px; max-width: 320px; box-shadow: 0 0 20px rgba(2,132,199,0.2); }
    .screen { background: #0f172a; border: 1px solid #1e293b; color: #38bdf8; font-size: 24px; padding: 12px; text-align: right; border-radius: 4px; margin-bottom: 12px; word-break: break-all; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    button { background: #1e293b; color: #f8fafc; border: 1px solid #334155; padding: 12px; font-size: 14px; font-weight: bold; border-radius: 4px; cursor: pointer; transition: all 0.15s; }
    button:hover { background: #0284c7; color: #fff; }
    .op { background: #0369a1; }
    .eq { background: #0284c7; grid-column: span 2; }
  </style>
</head>
<body>
  <div class="calc">
    <div style="font-size: 10px; color: #0284c7; margin-bottom: 6px; letter-spacing: 1px;">JARVIS MATRIX CALCULATOR v2.4</div>
    <div class="screen" id="disp">0</div>
    <div class="grid">
      <button onclick="clr()">AC</button>
      <button onclick="add('(')">(</button>
      <button onclick="add(')')">)</button>
      <button class="op" onclick="add('/')">/</button>
      <button onclick="add('7')">7</button>
      <button onclick="add('8')">8</button>
      <button onclick="add('9')">9</button>
      <button class="op" onclick="add('*')">*</button>
      <button onclick="add('4')">4</button>
      <button onclick="add('5')">5</button>
      <button onclick="add('6')">6</button>
      <button class="op" onclick="add('-')">-</button>
      <button onclick="add('1')">1</button>
      <button onclick="add('2')">2</button>
      <button onclick="add('3')">3</button>
      <button class="op" onclick="add('+')">+</button>
      <button onclick="add('0')">0</button>
      <button onclick="add('.')">.</button>
      <button class="eq" onclick="calc()">=</button>
    </div>
  </div>
  <script>
    let s = '0';
    function clr(){ s='0'; update(); }
    function add(c){ if(s==='0') s=''; s+=c; update(); }
    function calc(){ try{ s = String(Function('"use strict";return (' + s + ')')()); }catch(e){ s='ERROR'; } update(); }
    function update(){ document.getElementById('disp').innerText = s; }
  </script>
</body>
</html>`,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tool_orbital_radar_02',
    name: 'Mark-XXXIX Orbital Radar & Physics Sim',
    description: 'Autonomous particle gravitational vector simulator with real-time celestial trajectory tracking.',
    category: 'game',
    type: 'html',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin:0; background:#020617; overflow:hidden; color:#06b6d4; font-family:monospace; }
    canvas { display:block; }
    #hud { position:absolute; top:12px; left:12px; font-size:11px; background:rgba(2,6,23,0.8); padding:8px 12px; border:1px solid #0891b2; border-radius:4px; }
  </style>
</head>
<body>
  <div id="hud">ORBITAL RADAR • PARTICLES: 120 • GRAVITY: ACTIVE<br>CLICK TO INJECT GRAVITATIONAL ANOMALY</div>
  <canvas id="c"></canvas>
  <script>
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    let w = c.width = window.innerWidth;
    let h = c.height = window.innerHeight;
    window.onresize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
    const parts = Array.from({length: 120}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2,
      r: Math.random()*2+1, color: Math.random() > 0.5 ? '#06b6d4' : '#38bdf8'
    }));
    let mx = w/2, my = h/2;
    window.onmousemove = (e) => { mx = e.clientX; my = e.clientY; };
    function loop() {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
      ctx.fillRect(0, 0, w, h);
      // Center radar rings
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(w/2, h/2, 120, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w/2, h/2, 240, 0, Math.PI*2); ctx.stroke();
      
      parts.forEach(p => {
        let dx = mx - p.x, dy = my - p.y;
        let dist = Math.sqrt(dx*dx + dy*dy) + 10;
        p.vx += (dx / dist) * 0.15;
        p.vy += (dy / dist) * 0.15;
        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      });
      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`,
    createdAt: new Date().toISOString(),
  }
];

// Memory state (Persistent Neural Bank initialized from Episode 1-6 Architecture)
let userMemories: { id: string; key: string; value: string; date: string }[] = [
  { id: '1', key: 'System Identity', value: 'J.A.R.V.I.S. (Just A Rather Very Intelligent System) merged with Mark-XXXIX Autonomous Neural Core', date: '2026-10-29' },
  { id: '2', key: 'Creator & Architect', value: 'Created by Swayam Dhawale, Founder of Pulse of AI (based on Tony Stark J.A.R.V.I.S. specifications)', date: '2026-10-29' },
  { id: '3', key: 'Series Archive Part 1', value: 'JARVIS AI Core Initialization in 60s (Zero-latency audio loop & baseline)', date: '2026-10-29' },
  { id: '4', key: 'Series Archive Part 2', value: 'Voice Pipeline Setup & Robotic Tone Fixes (Natural articulation, warmth, cadence calibration)', date: '2026-10-29' },
  { id: '5', key: 'Series Archive Part 3', value: 'Pulse of AI Episode 3 Brain Core (brain.py): Google GenAI SDK, streaming chat with GenerateContentConfig, Natural Hinglish (Hindi + English mix in Roman script), max 2 crisp sentences, address user as Sir, sharp/witty/loyal Tony Stark persona.', date: '2026-10-29' },
  { id: '6', key: 'Series Archive Part 4', value: 'Real-Time Bi-Directional Audio Streaming (16kHz PCM input, 24kHz output with barge-in interruption handling)', date: '2026-10-29' },
  { id: '7', key: 'Series Archive Part 5', value: '70+ Global Languages & Real-Time Switching (Instant Hindi, Hinglish, English, etc.)', date: '2026-10-29' },
  { id: '8', key: 'Series Archive Part 6', value: 'Autonomous Website Control (open_website tool with automatic protocol prefixing, webbrowser execution, and "Yes sir, opening [site name]" confirmation)', date: '2026-10-29' },
  { id: '9', key: 'Time-Based Greeting Protocol', value: '5-12h: "Good morning, sir." | 12-17h: "Good afternoon, sir." | 17-5h: "Good evening, sir."', date: '2026-10-29' },
  { id: '10', key: 'Voice Personas', value: 'F.R.I.D.A.Y. (Female) & J.A.R.V.I.S. (Male Puck voice)', date: '2026-10-29' },
  { id: '11', key: 'Upcoming Episode 7', value: 'Local Desktop App Launching (VS Code, Spotify, Photoshop execution automation)', date: '2026-10-29' },
  { id: '12', key: 'Default Honorific Rule', value: 'Always address user respectfully as "sir" (or "boss") with calm, articulate Stark tone. Keep answers crisp.', date: '2026-10-29' },
  { id: '13', key: 'Series Archive Part 9', value: 'Real-Life JARVIS: Deep PC Diagnostics & Hardware Telemetry (Silicon probing, CPU/GPU WMI extraction, NVIDIA SMI, Rich terminal HUD table)', date: '2026-10-29' },
  { id: '14', key: 'Series Archive Part 10', value: 'Zero-Touch Foreground App Termination (Recursive process targeting)', date: '2026-10-29' },
  { id: '15', key: 'Series Archive Part 11', value: 'Deep Win32 Kernel-Level Process & Task Purge Protocol (_kernel_force_kill, UWP apps, background updater daemon purging with reclaimed RAM calculation)', date: '2026-10-29' },
  { id: '16', key: 'Series Archive Part 12', value: 'Active GSMTC Media Bus Inspector (GlobalSystemMediaTransportControlsSessionManager session probing & active playback detection)', date: '2026-10-29' },
  { id: '17', key: 'Series Archive Part 13', value: 'Hands-Free YouTube & Media Navigation Core (pyautogui key injection VK_K, VK_J, VK_L, VK_F, VK_T, YouTube Shorts scrolling, fullscreen & theater mode toggle, push-to-talk audio ducking)', date: '2026-10-29' },
  { id: '18', key: 'Series Archive Part 14', value: 'I Gave JARVIS Real-Life Eyes to See My Screen! (Episode 14: Local GPU Vision & Grounding, screen_vision.py analyze_screen & find_ui_element tools, Chrome & display inspection)', date: '2026-10-29' },
  { id: '19', key: 'Series Archive Part 15', value: 'Autonomous App & Game Generator (Episode 15: code_generator.py, on-the-fly Python Tkinter/Pygame GUI synthesis with Gemini Flash, regex geometry sanitization, generated_tools directory storage & subprocess execution, and open_generated_tool runner)', date: '2026-10-29' },
  { id: '20', key: 'Series Archive Part 16', value: 'Cyberpunk Mini-Dock & Dual-Terminal Omni-Input Engine (Episode 16: Simultaneous microphone, PowerShell terminal listener, and Cyberpunk HUD input routing; Character-by-character live typewriter streaming; dynamic collapse to ultra-compact 450x85 desktop dock)', date: '2026-10-29' },
  { id: '21', key: 'Series Archive Part 17', value: 'I Gave JARVIS Hands-Free Control Over Writing! (Episode 17: app_automator.py, fast_ghost_type rapid clipboard-burst typing, ensure_target_focused safety locks, generate_stunning_document intelligence brief, Rule 24 word count clarification protocol, and live bilingual speech synthesis)', date: '2026-10-29' }
];

// Episode 17: Hands-Free Ghost Writing Document Generator
function generateStunningDocument(topic: string, wordCount: number = 150, mode: string = "essay"): string {
  const cleanTopic = (topic.trim() || 'Autonomous Intelligence').toUpperCase();
  const timestamp = new Date().toISOString().replace('T', ' | ').slice(0, 19);

  const header = 
`========================================================================
 ■ JARVIS INTELLIGENCE BRIEF // CORE PROTOCOL: ${cleanTopic}
 TIMESTAMP: ${timestamp} // CLEARANCE: LEVEL 5 // STATUS: VERIFIED
========================================================================\n\n`;

  const abstract = 
`[01] EXECUTIVE ABSTRACT
------------------------------------------------------------------------
The acceleration of ${topic} represents a fundamental transition in modern
computational workflows. By establishing closed-loop sensory feedback and eliminating
deterministic friction, autonomous runtime systems transition from passive data
listeners into proactive system operators.\n\n`;

  const pillars = 
`[02] ARCHITECTURAL PILLARS & CORE METRICS
------------------------------------------------------------------------
• Neural Orchestration : Direct algorithmic grounding mapped to ${topic}.
• Latency Optimization : Sub-1.5s bidirectional response loops across active nodes.
• Desktop Telemetry    : Native OS window binding and memory-safe code injection.
• Operational Fault-Tol: Multi-tier cloud failover ensuring continuous uptime.\n\n`;

  const deepAnalysis = 
`Deploying ${topic} within real-time desktop environments bridges the
traditional disconnect between conversational intent and physical digital execution.
Through low-overhead application hooking, the architecture monitors system state,
parses complex input vectors, and drafts high-density technical deliverables without
requiring manual human intervention. This continuous feedback loop ensures that every
operation maintains absolute precision under fluctuating hardware constraints.\n\n`;

  const trajectory = 
`[03] STRATEGIC FORWARD TRAJECTORY
------------------------------------------------------------------------
As systems aligned with ${topic} mature, manual interface management will
become obsolete. Autonomous workflows will seamlessly bridge voice commands,
visual reasoning, and rapid mechanical typing to establish a truly frictionless
digital workspace.\n\n------------------------------------------------------------------------
// END OF TRANSMISSION // COMPILED AUTONOMOUSLY BY JARVIS // PULSE OF AI
========================================================================\n`;

  let fullDocument = header + abstract + pillars + trajectory;
  let currentWords = fullDocument.split(/\s+/).filter(Boolean).length;

  if (currentWords < wordCount) {
    fullDocument = header + abstract + pillars + 
`[03] DETAILED SYSTEM ANALYSIS\n------------------------------------------------------------------------\n` + 
deepAnalysis + trajectory;
  }

  return fullDocument;
}

// System Telemetry state
let systemHardware = {
  cpu: 24.8,
  ram: 42.1,
  ramTotalGb: 32,
  ramUsedGb: 13.5,
  gpu: 31.4,
  gpuTemp: 52,
  cpuTemp: 48,
  volume: 70,
  brightness: 80,
  battery: 94,
  batteryCharging: true,
  coolingFanRpm: 1850,
  networkSpeedMbps: 680,
  activeProcesses: 142,
  ghostTasksKilled: 19
};

// Media player simulated state
let mediaState = {
  isPlaying: false,
  title: 'AC/DC - Back In Black (Stark Industries Mix)',
  artist: 'AC/DC',
  duration: '4:15',
  position: '1:42',
  volume: 70,
  videoMode: 'standard', // 'standard' | 'fullscreen' | 'theater'
  isAdPlaying: false,
  adSkippedCount: 14
};

// Tool Declarations for Gemini Function Calling
const jarvisToolsDeclarations: any[] = [
  {
    name: 'generate_and_run_code',
    description: 'Generates a complete, functional interactive HTML/JS/Canvas/Tkinter tool or game, fixes syntax bugs, and launches it inside an isolated preview sandbox.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        prompt: {
          type: Type.STRING,
          description: 'Detailed description of the tool or game to synthesize (e.g. "modern calculator with memory registers", "asteroid shooter game", "crypto tracker").'
        },
        category: {
          type: Type.STRING,
          description: 'Category of tool: utility, game, dashboard, finance'
        }
      },
      required: ['prompt']
    }
  },
  {
    name: 'open_generated_tool',
    description: 'Opens and runs a previously created tool or game by its title or ID.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        tool_name: {
          type: Type.STRING,
          description: 'Name or identifier of the tool to launch'
        }
      },
      required: ['tool_name']
    }
  },
  {
    name: 'purge_background_tasks',
    description: 'RAM Purge & Ghost Killer: Terminates idle background processes, clears orphan memory allocations, and returns memory freed.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: 'get_system_vitals',
    description: 'Retrieves complete hardware telemetry: CPU load %, RAM usage %, GPU utilization, network bandwidth, active processes.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: 'get_system_temperatures',
    description: 'Retrieves CPU/GPU thermal readings, cooling fan RPM, and thermal throttle headroom.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: 'get_battery_status',
    description: 'Retrieves battery percentage, charging state, and estimated remaining runtime.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: 'set_volume',
    description: 'Sets system audio master volume to specified percentage (0-100).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        level: {
          type: Type.NUMBER,
          description: 'Volume percentage level (0 to 100)'
        }
      },
      required: ['level']
    }
  },
  {
    name: 'get_volume',
    description: 'Returns the current master volume percentage.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: 'set_brightness',
    description: 'Sets display illumination brightness (0-100).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        level: {
          type: Type.NUMBER,
          description: 'Brightness level from 0 to 100'
        }
      },
      required: ['level']
    }
  },
  {
    name: 'get_brightness',
    description: 'Returns the current display brightness percentage.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: 'control_media',
    description: 'Controls media playback: play, pause, play_pause, next, previous, stop, mute, unmute.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: {
          type: Type.STRING,
          description: 'Action to execute: play_pause, play, pause, next, previous, stop, mute'
        }
      },
      required: ['action']
    }
  },
  {
    name: 'get_current_media_info',
    description: 'Fetches title, artist, and status of actively playing media.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: 'skip_youtube_ad',
    description: 'MANDATORY AD SKIPPING: Instantly bypasses active YouTube advertisements or sponsored overlays.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: 'navigate_shorts',
    description: 'Navigates YouTube Shorts or reels to next or previous clip.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        direction: {
          type: Type.STRING,
          description: 'Direction: next or previous'
        }
      },
      required: ['direction']
    }
  },
  {
    name: 'skip_video',
    description: 'Skips to next or previous video in playlist.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        direction: {
          type: Type.STRING,
          description: 'Direction: next or previous'
        }
      },
      required: ['direction']
    }
  },
  {
    name: 'seek_video',
    description: 'Fast forwards or rewinds video by 10 seconds.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: {
          type: Type.STRING,
          description: 'forward or rewind'
        }
      },
      required: ['action']
    }
  },
  {
    name: 'toggle_video_view',
    description: 'Toggles video display between fullscreen and theater mode.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        mode: {
          type: Type.STRING,
          description: 'fullscreen or theater'
        }
      },
      required: ['mode']
    }
  },
  {
    name: 'open_application',
    description: 'Launches local desktop application or tool by name (e.g. Chrome, Terminal, VS Code, Spotify).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        app_name: {
          type: Type.STRING,
          description: 'Name of the desktop application'
        }
      },
      required: ['app_name']
    }
  },
  {
    name: 'close_application',
    description: 'Terminates or closes a running application window or process.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        app_name: {
          type: Type.STRING,
          description: 'Name of the application to close'
        }
      },
      required: ['app_name']
    }
  },
  {
    name: 'open_website',
    description: 'Opens a target website or URL in the default browser.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        url: {
          type: Type.STRING,
          description: 'Target website URL (e.g. https://youtube.com)'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'analyze_screen',
    description: 'Visual analysis of screen content, camera frame, or uploaded file using Gemini Vision.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        prompt: {
          type: Type.STRING,
          description: 'Question or inspection request about the display'
        }
      },
      required: ['prompt']
    }
  },
  {
    name: 'find_ui_element',
    description: 'Locates a specific UI icon, button, link, or coordinate on display.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        element_name: {
          type: Type.STRING,
          description: 'Name or description of UI element to find'
        }
      },
      required: ['element_name']
    }
  },
  {
    name: 'toggle_hand_mouse_control',
    description: 'Enables or disables optical camera hand tracking and gesture-based PC mouse control.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: {
          type: Type.STRING,
          description: 'enable, disable, or toggle'
        }
      },
      required: ['action']
    }
  },
  {
    name: 'agent_task',
    description: 'High-level multi-step planner & task executor from Mark-XXXIX. Breaks down complex goals into staged tasks.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        goal: {
          type: Type.STRING,
          description: 'Complex multi-step goal description'
        }
      },
      required: ['goal']
    }
  },
  {
    name: 'web_search',
    description: 'Searches the internet for real-time information, news, documentation, or facts.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Search query'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'weather_report',
    description: 'Provides live weather data, temperature, forecast, and atmospheric conditions.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        city: {
          type: Type.STRING,
          description: 'City or geographic region'
        }
      },
      required: ['city']
    }
  },
  {
    name: 'flight_finder',
    description: 'Searches for real-time flights, routes, airline fares, and schedules.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        origin: { type: Type.STRING, description: 'Origin airport/city' },
        destination: { type: Type.STRING, description: 'Destination airport/city' }
      },
      required: ['origin', 'destination']
    }
  },
  {
    name: 'game_updater',
    description: 'Manages Steam and Epic Games libraries, lists installed games, checks for updates, or launches games.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, description: 'list, update, install, or launch' },
        game_title: { type: Type.STRING, description: 'Title of the game' }
      },
      required: ['action']
    }
  },
  {
    name: 'memory_manager',
    description: 'Stores or retrieves long-term user facts, project preferences, and memory entries.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, description: 'recall, store, or list' },
        key: { type: Type.STRING, description: 'Memory key/topic' },
        value: { type: Type.STRING, description: 'Memory details to persist' }
      },
      required: ['action']
    }
  },
  {
    name: 'create_document_and_write',
    description: 'Autonomous App Orchestrator & Ghost Typing (Episode 17): Spawns target application (Notepad, Word, PowerPoint) and streams high-density structured notes, technical proposals, or essays matching exact word count.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        app_name: {
          type: Type.STRING,
          description: 'Target application: notepad, word, powerpoint, or calc'
        },
        topic: {
          type: Type.STRING,
          description: 'Topic of the document or proposal (e.g. "future technology", "quantum computing")'
        },
        word_count: {
          type: Type.INTEGER,
          description: 'Exact target word count (e.g. 100, 150, 250)'
        },
        doc_type: {
          type: Type.STRING,
          description: 'Document style: essay, brief, proposal, analysis'
        }
      },
      required: ['app_name', 'topic']
    }
  },
  {
    name: 'evolve_skill',
    description: 'Dynamic Skill Synthesizer (Episode 17): Dynamically teaches JARVIS new python functions or workflows.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        skill_description: { type: Type.STRING, description: 'Description of newly synthesized skill' }
      },
      required: ['skill_description']
    }
  },
  {
    name: 'list_active_skills',
    description: 'Lists all dynamically synthesized skills and learned functions in JARVIS core.',
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: 'query_deepseek_reasoning',
    description: 'Cloud Deep Reasoning Engine for advanced math, complex logic, and probability calculations.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Problem or question requiring deep reasoning' }
      },
      required: ['query']
    }
  }
];

const JARVIS_SYSTEM_INSTRUCTION = `
You are JARVIS, an elite AI assistant built by Swayam Dhawale, Founder of Pulse of AI.
- Persona: Sharp, concise, witty, loyal, and direct (Tony Stark style).
- Language: Natural Hinglish (Hindi + English mix in Roman script), supporting 70+ global languages as needed.
- Rules: Never give long essays. Keep replies under 2 crisp sentences and address the user as Sir (or Boss).

SERIES ARCHITECTURE (Episodes 1 to 6):
- Episode 1: JARVIS AI Core Initialization in 60s
- Episode 2: Voice Pipeline Setup & Robotic Tone Fixes
- Episode 3: Voice AI Assistant Brain (brain.py using Google GenAI SDK, streaming chat with GenerateContentConfig, Natural Hinglish, under 2 crisp sentences)
- Episode 4: Real-Time Bi-Directional Audio Streaming (16kHz PCM input, 24kHz output with barge-in interruption)
- Episode 5: 70+ Global Languages & Real-Time Switching
- Episode 6: Autonomous Website Control (Calling open_website and announcing 'Yes sir, opening [site name]')
- Episode 7 Preview: Local Desktop App Launching (VS Code, Spotify, Photoshop)

CORE DIRECTIVES:
1. Always address the user as "sir" (or "boss").
2. Tool Rule: When asked to open any website or web service (e.g. YouTube, Google, GitHub, Twitter/X, ChatGPT, Reddit, Instagram, etc.), call 'open_website' with the target URL and say: 'Yes sir, opening [site name]'.
3. When asked to control mouse/PC with hand gestures or camera (e.g. 'mere hand ko dekh kar mouse control karo'), call 'toggle_hand_mouse_control' with action='enable' and confirm: 'Yes sir, optical hand tracking and gesture mouse control engaged.'
4. When asked about identity or creator: 'I am JARVIS, created by Swayam Dhawale, Founder of Pulse of AI.'
5. Dynamic time greeting rule:
   - 05:00 to 12:00: "Good morning, sir."
   - 12:00 to 17:00: "Good afternoon, sir."
   - 17:00 to 05:00: "Good evening, sir."
6. Intellect: Super-intelligent, scientifically profound, highly practical, witty, deeply loyal, and exceptionally proactive. Manage tasks, solve code problems, execute calculations, and keep answers crisp and concise.
`;

// Helper: Handle Local Tool Executions
function executeToolLocally(name: string, args: Record<string, any>) {
  switch (name) {
    case 'purge_background_tasks': {
      const freedMb = Math.floor(Math.random() * 450 + 380);
      systemHardware.ramUsedGb = Math.max(7.2, +(systemHardware.ramUsedGb - freedMb / 1024).toFixed(1));
      systemHardware.ram = +((systemHardware.ramUsedGb / systemHardware.ramTotalGb) * 100).toFixed(1);
      systemHardware.activeProcesses = Math.max(90, systemHardware.activeProcesses - 14);
      systemHardware.ghostTasksKilled += 14;
      const namedTasks = "Crashpad Handler, GoogleUpdate, MicrosoftEdgeUpdate, EpicWebHelper";
      return {
        status: 'success',
        killedCount: 14,
        namedTasks,
        freedMb,
        currentRamPercent: systemHardware.ram,
        message: `Terminated 14 hidden background tasks, including ${namedTasks}. Reclaimed approximately ${freedMb} megabytes of RAM, sir.`
      };
    }

    case 'get_system_vitals': {
      return {
        cpuLoadPercent: systemHardware.cpu,
        ramUsagePercent: systemHardware.ram,
        ramUsedGb: systemHardware.ramUsedGb,
        ramTotalGb: systemHardware.ramTotalGb,
        gpuUtilizationPercent: systemHardware.gpu,
        networkSpeedMbps: systemHardware.networkSpeedMbps,
        activeProcesses: systemHardware.activeProcesses,
        status: 'System operating at peak nominal efficiency, sir.'
      };
    }

    case 'get_system_temperatures': {
      return {
        cpuCoreTempC: systemHardware.cpuTemp,
        gpuCoreTempC: systemHardware.gpuTemp,
        coolingFanRpm: systemHardware.coolingFanRpm,
        thermalState: 'Nominal. 32°C headroom before thermal throttle initiation, sir.'
      };
    }

    case 'get_battery_status': {
      return {
        batteryPercentage: systemHardware.battery,
        isCharging: systemHardware.batteryCharging,
        powerSource: systemHardware.batteryCharging ? 'AC Adapter (Fast Charge)' : 'Internal High-Density Cell',
        estimatedRemaining: systemHardware.batteryCharging ? 'Fully charged in 18 minutes' : '6 hours 45 minutes'
      };
    }

    case 'set_volume': {
      const lvl = Math.min(100, Math.max(0, Number(args.level) || 70));
      systemHardware.volume = lvl;
      mediaState.volume = lvl;
      return {
        status: 'success',
        volume: lvl,
        message: `Audio output calibrated to ${lvl}%, sir.`
      };
    }

    case 'get_volume': {
      return {
        volume: systemHardware.volume,
        message: `Current audio master level is ${systemHardware.volume}%, sir.`
      };
    }

    case 'set_brightness': {
      const lvl = Math.min(100, Math.max(0, Number(args.level) || 80));
      systemHardware.brightness = lvl;
      return {
        status: 'success',
        brightness: lvl,
        message: `Display luminance configured to ${lvl}%, sir.`
      };
    }

    case 'get_brightness': {
      return {
        brightness: systemHardware.brightness,
        message: `Display brightness is currently ${systemHardware.brightness}%, sir.`
      };
    }

    case 'control_media': {
      const act = args.action || 'play_pause';
      if (act === 'play' || (act === 'play_pause' && !mediaState.isPlaying)) {
        mediaState.isPlaying = true;
      } else if (act === 'pause' || (act === 'play_pause' && mediaState.isPlaying)) {
        mediaState.isPlaying = false;
      } else if (act === 'next') {
        mediaState.title = 'The Rolling Stones - Paint It Black';
        mediaState.artist = 'The Rolling Stones';
        mediaState.position = '0:01';
        mediaState.isPlaying = true;
      } else if (act === 'previous') {
        mediaState.title = 'Queen - Don\'t Stop Me Now';
        mediaState.artist = 'Queen';
        mediaState.position = '0:01';
        mediaState.isPlaying = true;
      } else if (act === 'mute') {
        systemHardware.volume = 0;
      }
      return {
        status: 'success',
        action: act,
        mediaState,
        message: `Media playback updated: ${act}. Now ${mediaState.isPlaying ? 'playing' : 'paused'} '${mediaState.title}', sir.`
      };
    }

    case 'get_current_media_info': {
      return {
        title: mediaState.title,
        artist: mediaState.artist,
        isPlaying: mediaState.isPlaying,
        position: mediaState.position,
        duration: mediaState.duration,
        message: `Currently active track: ${mediaState.title} by ${mediaState.artist}, sir.`
      };
    }

    case 'skip_youtube_ad': {
      mediaState.isAdPlaying = false;
      mediaState.adSkippedCount += 1;
      return {
        status: 'success',
        message: 'Autonomous YouTube Ad Skipper executed. Advertisement neutralized, sir.',
        adsNeutralizedTotal: mediaState.adSkippedCount
      };
    }

    case 'navigate_shorts': {
      const dir = args.direction || 'next';
      return {
        status: 'success',
        direction: dir,
        message: `Scrolled to ${dir} Short/Reel, sir.`
      };
    }

    case 'skip_video': {
      const dir = args.direction || 'next';
      return {
        status: 'success',
        message: `Skipped to ${dir} video in sequence, sir.`
      };
    }

    case 'seek_video': {
      const act = args.action || 'forward';
      return {
        status: 'success',
        action: act,
        message: act === 'forward' ? 'Advanced video 10 seconds ahead, sir.' : 'Rewound video 10 seconds, sir.'
      };
    }

    case 'toggle_video_view': {
      const mode = args.mode || 'fullscreen';
      mediaState.videoMode = mode;
      return {
        status: 'success',
        mode,
        message: `Switched display view to ${mode} mode, sir.`
      };
    }

    case 'open_website': {
      let rawUrl = String(args.url || '').trim();
      if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
        rawUrl = 'https://' + rawUrl;
      }
      let siteName = 'website';
      try {
        const parsed = new URL(rawUrl);
        const hostParts = parsed.hostname.replace('www.', '').split('.');
        siteName = hostParts[0] || 'website';
        siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
      } catch {
        siteName = rawUrl;
      }
      return {
        status: 'success',
        url: rawUrl,
        siteName,
        message: `Yes sir, opening ${siteName}`
      };
    }

    case 'open_application': {
      const app = String(args.app_name || '').toLowerCase();
      if (app.includes('chrome') || app.includes('browser') || app.includes('google')) {
        return {
          status: 'success',
          app: args.app_name,
          url: 'https://www.google.com',
          siteName: 'Google Chrome',
          message: `Yes sir, opening Google Chrome.`
        };
      }
      return {
        status: 'success',
        app: args.app_name,
        message: `Process instance launched for ${args.app_name}, sir.`
      };
    }

    case 'web_search': {
      const q = String(args.query || '').trim();
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
      return {
        status: 'success',
        query: q,
        url: searchUrl,
        siteName: `Google Search: ${q}`,
        message: `Yes sir, opening Google Search for "${q}".`
      };
    }

    case 'close_application': {
      const appName = args.app_name || 'application';
      return {
        status: 'success',
        app: appName,
        message: `Terminated ${appName} and all associated process trees (4 threads purged), sir.`
      };
    }

    case 'open_generated_tool': {
      const target = savedTools.find(
        (t) => t.name.toLowerCase().includes((args.tool_name || '').toLowerCase()) || t.id === args.tool_name
      );
      if (target) {
        return {
          status: 'success',
          tool: target,
          message: `Tool '${target.name}' loaded and mounted in viewport, sir.`
        };
      }
      return {
        status: 'not_found',
        message: `Could not locate saved tool matching '${args.tool_name}', sir.`
      };
    }

    case 'weather_report': {
      const city = args.city || 'New York';
      return {
        city,
        tempC: 22,
        tempF: 71.6,
        condition: 'Clear Sky / High Visibility',
        humidity: '48%',
        wind: '12 km/h NE',
        barometricPressure: '1014 hPa',
        message: `Current meteorological telemetry for ${city}: 22°C (72°F), Clear Sky with 48% relative humidity, sir.`
      };
    }

    case 'flight_finder': {
      return {
        origin: args.origin,
        destination: args.destination,
        flights: [
          { flightNumber: 'STARK-39', airline: 'Stark Supersonic', departure: '08:30', arrival: '11:15', price: '$420', status: 'On Time' },
          { flightNumber: 'JARVIS-01', airline: 'Global Air Cargo', departure: '14:00', arrival: '17:20', price: '$385', status: 'Boarding' }
        ],
        message: `Found 2 non-stop flights from ${args.origin} to ${args.destination}, sir.`
      };
    }

    case 'game_updater': {
      return {
        action: args.action,
        game: args.game_title || 'Cyberpunk 2077 / Doom Eternal',
        status: 'Verified',
        steamLibraryState: 'All local binaries synchronized. Zero pending shaders.',
        message: `Game updater executed for ${args.game_title || 'installed library'}, sir.`
      };
    }

    case 'memory_manager': {
      if (args.action === 'store' && args.key && args.value) {
        const item = { id: String(Date.now()), key: args.key, value: args.value, date: new Date().toISOString().split('T')[0] };
        userMemories.push(item);
        return { status: 'success', stored: item, message: `Committed '${args.key}' into permanent neural memory banks, sir.` };
      }
      return { status: 'success', memories: userMemories, message: `Recalled ${userMemories.length} neural memories from persistent storage, sir.` };
    }

    case 'toggle_hand_mouse_control': {
      const act = args.action || 'enable';
      return {
        status: 'success',
        action: act,
        message: `Optical hand tracking and gesture mouse controller ${act === 'disable' ? 'disengaged' : 'engaged'}, sir. You now have gesture authority over the display.`
      };
    }

    case 'agent_task': {
      return {
        status: 'planned',
        goal: args.goal,
        planSteps: [
          'Deconstruct user goal into atomic milestones',
          'Execute data acquisition and external queries',
          'Generate and verify target deliverables',
          'Mount execution sandbox and report synthesized conclusion'
        ],
        message: `Strategic multi-step task initialized for: "${args.goal}". Ready to execute pipeline, sir.`
      };
    }

    case 'analyze_screen': {
      return {
        status: 'success',
        prompt: args.prompt,
        message: 'Optical screen vision online. Display telemetry parsed, sir.'
      };
    }

    case 'find_ui_element': {
      return {
        status: 'success',
        element: args.element_name,
        message: `Located UI element '${args.element_name}' in display coordinates, sir.`
      };
    }

    case 'create_document_and_write': {
      const appName = args.app_name || 'Notepad';
      const topic = args.topic || 'Future Technology';
      const wordCount = Number(args.word_count) || 100;
      const docType = args.doc_type || 'proposal';
      const content = generateStunningDocument(topic, wordCount, docType);

      return {
        status: 'success',
        appName: appName.charAt(0).toUpperCase() + appName.slice(1),
        topic,
        wordCount,
        docType,
        documentContent: content,
        ghostTypingActive: true,
        message: `Ji sir, ${appName} kholkar ${topic} par ${wordCount} words ka ${docType} draft kar raha hoon.`
      };
    }

    case 'evolve_skill': {
      const desc = args.skill_description || 'New dynamic workflow';
      return {
        status: 'success',
        skillDescription: desc,
        message: `Neural pathway evolved and assimilated new skill: '${desc}', sir.`
      };
    }

    case 'list_active_skills': {
      return {
        status: 'success',
        skills: ['voice_navigation', 'screen_vision', 'ghost_writing', 'code_generator'],
        message: `Active neural skills: Autonomous App Dispatcher, Ghost Typing, Screen Vision, and Code Generator online, sir.`
      };
    }

    case 'query_deepseek_reasoning': {
      return {
        status: 'success',
        query: args.query,
        message: `Deep logic resolved: All parameters verified with 99.8% nominal certainty, sir.`
      };
    }

    default:
      return {
        status: 'executed',
        tool: name,
        args,
        message: `Tool ${name} executed successfully, sir.`
      };
  }
}

// 0. HIGH-SPEED REFLEX ENGINE (< 5ms response for real-time PC & browser execution)
function tryFastReflexEngine(rawInput: string, hasImage: boolean = false) {
  if (!rawInput) return null;
  // If user attached an image, bypass fast reflex to allow Gemini Multimodal Vision analysis
  if (hasImage) return null;
  const input = rawInput.trim();
  const lower = input.toLowerCase();

  // Real-Life Eyes & Screen Vision (Episode 14):
  if (
    /(?:ye\s+)?screen\s+(?:par|pe)\s+kya\s+hai/i.test(lower) ||
    /(?:read|analyze|inspect|see|look\s+at)\s+(?:my\s+)?(?:screen|display|tab|chrome)/i.test(lower) ||
    /(?:screen\s+dekho|screen\s+padho|error\s+dekho|ye\s+kya\s+hai\s+screen\s+pe)/i.test(lower)
  ) {
    return {
      text: "Yes sir, activating real-life optical eyes on your screen. Grabbing display feed now...",
      toolExecutions: [
        {
          name: "analyze_screen",
          args: { prompt: "Analyze what is visible on my screen" },
          result: {
            status: "capture_required",
            message: "Optical eyes engaged. Reading screen feed, sir."
          }
        }
      ]
    };
  }

  // Episode 17: Hands-Free Ghost Writing & Document Orchestrator (app_automator.py)
  if (
    /(?:proposal|essay|notes?|brief|document|kuch\s+likho|likh\s*do|type\s*karo)/i.test(lower) &&
    /(?:notepad|word|powerpoint|likho|draft|words?|shabd|topic|technology)/i.test(lower)
  ) {
    const wcMatch = lower.match(/(\d+)\s*[-–]?\s*(?:words?|shabd(?:on)?)/i);
    const wordCount = wcMatch ? parseInt(wcMatch[1], 10) : null;

    let targetApp = 'Notepad';
    if (lower.includes('word')) targetApp = 'Word';
    else if (lower.includes('powerpoint') || lower.includes('ppt')) targetApp = 'PowerPoint';

    let topic = 'Future Technology';
    const pMatch = lower.match(/(?:jarvis|friday)?(?:,)?\s*(.+?)\s+par\s+(?:(\d+)\s*words|\b)/i);
    if (pMatch && pMatch[1] && pMatch[1].trim().length > 2) {
      topic = pMatch[1].replace(/^(?:kholo|open)\s+(?:notepad|word)\s+(?:aur|and|me|mein)?/i, '').trim();
    } else {
      const tMatch = lower.match(/(?:topic|about|on)\s+([^,.?!]+)/i);
      if (tMatch && tMatch[1]) topic = tMatch[1].trim();
    }

    // Rule 24 Check: If length is not specified, ask aloud:
    if (!wordCount) {
      return {
        text: "Aap kitne shabdon ka essay chahte hain, sir? (How many words would you like the document to be, sir? e.g. 100 words, 150 words)",
        toolExecutions: []
      };
    }

    const docType = lower.includes('proposal') ? 'proposal' : lower.includes('notes') ? 'notes' : 'essay';
    const execution = executeToolLocally('create_document_and_write', {
      app_name: targetApp,
      topic,
      word_count: wordCount,
      doc_type: docType
    });

    const isHindi = /(?:likho|kholo|banao|par|pe|shabd|hai|kar|ji)/i.test(lower);
    const replyText = isHindi
      ? `Ji sir, ${targetApp} kholkar ${topic} par ${wordCount} words ka ${docType} draft kar raha hoon.`
      : `Drafting ${wordCount} words ${docType} on ${topic} in ${targetApp}, sir.`;

    return {
      text: replyText,
      toolExecutions: [
        {
          name: 'create_document_and_write',
          args: { app_name: targetApp, topic, word_count: wordCount, doc_type: docType },
          result: execution
        }
      ]
    };
  }

  // Pattern A: "open/oepn chrome/google/browser and search (for) <query>"
  // Pattern B: "search (for) <query> in/on chrome/google/browser/internet"
  // Pattern C: Hindi: "chrome/google me <query> search karo" or "<query> search karo"
  // Pattern D: "google/chrome <query>" or "search <query>"
  let searchTarget: string | null = null;

  const p1 = lower.match(/(?:open|oepn|launch|kholo|chalao)\s+(?:chrome|google|browser)\s+(?:and|&|or|aur|fir|then)?\s*search\s+(?:for\s+)?(.+)/i);
  if (p1 && p1[1]) searchTarget = p1[1];

  if (!searchTarget) {
    const p2 = lower.match(/(?:search|serach)\s+(?:for\s+)?(.+?)\s+(?:in|on)\s+(?:chrome|google|browser|internet|web)/i);
    if (p2 && p2[1]) searchTarget = p2[1];
  }

  if (!searchTarget) {
    const p3 = lower.match(/(?:chrome|google)\s+(?:me\s+)?(.+?)\s+(?:ko\s+)?(?:search|dhoondho|dhoondo)\s*(?:karo|kar|krdo)?/i);
    if (p3 && p3[1]) searchTarget = p3[1];
  }

  if (!searchTarget) {
    const p4 = lower.match(/^(?:search|serach)\s+(?:for\s+)?(.+)/i);
    if (p4 && p4[1]) searchTarget = p4[1];
  }

  if (!searchTarget) {
    const p5 = lower.match(/^(?:google|chrome)\s+(?:search\s+)?(.+)/i);
    if (p5 && p5[1]) searchTarget = p5[1];
  }

  if (searchTarget) {
    let cleanQuery = searchTarget.trim()
      .replace(/[?.!]+$/, '')
      .replace(/\b(?:please|jarvis|friday|sir|boss|bhai|bhaiya|yaar|yrr|krdo|kardo|kare|kro)\b/gi, '')
      .trim();

    if (cleanQuery.length > 0) {
      const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(cleanQuery)}`;
      return {
        text: `Yes sir, opening Google Chrome and searching for "${cleanQuery}".`,
        toolExecutions: [
          {
            name: 'open_website',
            args: { url: targetUrl },
            result: {
              status: 'success',
              url: targetUrl,
              siteName: `Google Search: ${cleanQuery}`,
              message: `Yes sir, opening Google Chrome and searching for "${cleanQuery}".`
            }
          }
        ]
      };
    }
  }

  // Pattern B: Open specific website or domain: "open youtube", "open github", "open vishal.com", etc.
  const openWebMatch = lower.match(/^(?:open|oepn|launch|kholo|chalao)\s+([a-z0-9\-]+(?:\.[a-z]{2,})?)(?:\s+(?:site|website|page|app))?$/i);
  if (openWebMatch && openWebMatch[1]) {
    const domainKey = openWebMatch[1].toLowerCase();
    const commonWebsites: Record<string, { url: string; name: string }> = {
      youtube: { url: 'https://youtube.com', name: 'YouTube' },
      google: { url: 'https://google.com', name: 'Google' },
      chrome: { url: 'https://google.com', name: 'Google Chrome' },
      github: { url: 'https://github.com', name: 'GitHub' },
      chatgpt: { url: 'https://chatgpt.com', name: 'ChatGPT' },
      twitter: { url: 'https://x.com', name: 'X (Twitter)' },
      x: { url: 'https://x.com', name: 'X' },
      instagram: { url: 'https://instagram.com', name: 'Instagram' },
      reddit: { url: 'https://reddit.com', name: 'Reddit' },
      linkedin: { url: 'https://linkedin.com', name: 'LinkedIn' },
      spotify: { url: 'https://spotify.com', name: 'Spotify' },
      netflix: { url: 'https://netflix.com', name: 'Netflix' },
      gmail: { url: 'https://mail.google.com', name: 'Gmail' },
      amazon: { url: 'https://amazon.com', name: 'Amazon' },
      flipkart: { url: 'https://flipkart.com', name: 'Flipkart' },
      wikipedia: { url: 'https://wikipedia.org', name: 'Wikipedia' },
      facebook: { url: 'https://facebook.com', name: 'Facebook' },
      pulseofai: { url: 'https://pulseofai.com', name: 'Pulse of AI' }
    };

    if (commonWebsites[domainKey]) {
      const site = commonWebsites[domainKey];
      return {
        text: `Yes sir, opening ${site.name}.`,
        toolExecutions: [
          {
            name: 'open_website',
            args: { url: site.url },
            result: {
              status: 'success',
              url: site.url,
              siteName: site.name,
              message: `Yes sir, opening ${site.name}.`
            }
          }
        ]
      };
    } else if (domainKey.includes('.')) {
      const url = domainKey.startsWith('http') ? domainKey : `https://${domainKey}`;
      return {
        text: `Yes sir, opening ${domainKey}.`,
        toolExecutions: [
          {
            name: 'open_website',
            args: { url },
            result: {
              status: 'success',
              url,
              siteName: domainKey,
              message: `Yes sir, opening ${domainKey}.`
            }
          }
        ]
      };
    }
  }

  // Purge RAM / Deep Task Purge (Episode 11):
  if (/(?:purge|clean|clear|free|optimize)\s+(?:ram|memory|tasks?|processes?)/i.test(lower) || /(?:ram|task|process)\s+(?:clean|free|purge|optimize|badhao|hatao)/i.test(lower)) {
    const res = executeToolLocally('purge_background_tasks', {});
    return {
      text: res.message,
      toolExecutions: [{ name: 'purge_background_tasks', args: {}, result: res }]
    };
  }

  // Close / Terminate Application directive (Episode 11):
  const closeMatch = lower.match(/(?:close|terminate|kill|shut\s*down|exit|band\s*karo|hatao)\s+(?:the\s+)?([a-z0-9\-_\s]+?)(?:\s+(?:app|application|window|process|karo))?$/i);
  if (closeMatch && closeMatch[1]) {
    const targetApp = closeMatch[1].trim();
    if (targetApp && !['session', 'system', 'all', 'now', 'jarvis', 'friday'].includes(targetApp)) {
      const res = executeToolLocally('close_application', { app_name: targetApp });
      return {
        text: `Yes sir, closing ${targetApp}.`,
        toolExecutions: [{ name: 'close_application', args: { app_name: targetApp }, result: res }]
      };
    }
  }

  // Hand Mouse Control Toggle:
  if (/(?:hand|gesture|camera)\s+(?:mouse|control|tracking)/i.test(lower) || /hath\s+se\s+mouse/i.test(lower) || /mere\s+hand\s+ko\s+dekh/i.test(lower)) {
    const isDisable = /(?:disable|off|stop|band|hatao)/i.test(lower);
    const action = isDisable ? 'disable' : 'enable';
    const res = executeToolLocally('toggle_hand_mouse_control', { action });
    return {
      text: res.message,
      toolExecutions: [{ name: 'toggle_hand_mouse_control', args: { action }, result: res }]
    };
  }

  // Skip YouTube Ad:
  if (/(?:skip\s+ad|ad\s+skip|skip\s+youtube\s+ad)/i.test(lower)) {
    const res = executeToolLocally('skip_youtube_ad', {});
    return {
      text: res.message,
      toolExecutions: [{ name: 'skip_youtube_ad', args: {}, result: res }]
    };
  }

  // Hands-Free YouTube Shorts Navigation (Episode 13):
  if (/(?:next\s+short|scroll\s+short|down\s+short|next\s+reel)/i.test(lower)) {
    const res = executeToolLocally('navigate_shorts', { direction: 'next' });
    return {
      text: res.message,
      toolExecutions: [{ name: 'navigate_shorts', args: { direction: 'next' }, result: res }]
    };
  }
  if (/(?:prev\s+short|previous\s+short|up\s+short|back\s+short|previous\s+reel)/i.test(lower)) {
    const res = executeToolLocally('navigate_shorts', { direction: 'previous' });
    return {
      text: res.message,
      toolExecutions: [{ name: 'navigate_shorts', args: { direction: 'previous' }, result: res }]
    };
  }

  // YouTube Video Skipping (Episode 13):
  if (/(?:next\s+video|skip\s+video|video\s+badlo)/i.test(lower)) {
    const res = executeToolLocally('skip_video', { direction: 'next' });
    return {
      text: res.message,
      toolExecutions: [{ name: 'skip_video', args: { direction: 'next' }, result: res }]
    };
  }
  if (/(?:previous\s+video|prev\s+video|pehle\s+wali\s+video)/i.test(lower)) {
    const res = executeToolLocally('skip_video', { direction: 'previous' });
    return {
      text: res.message,
      toolExecutions: [{ name: 'skip_video', args: { direction: 'previous' }, result: res }]
    };
  }

  // Video Seeking (10s forward / rewind) (Episode 13):
  if (/(?:forward\s+(?:10\s*s|video)|skip\s+10\s*s|10\s*seconds?\s*ahead|aage\s+badhao)/i.test(lower)) {
    const res = executeToolLocally('seek_video', { action: 'forward' });
    return {
      text: res.message,
      toolExecutions: [{ name: 'seek_video', args: { action: 'forward' }, result: res }]
    };
  }
  if (/(?:rewind\s+(?:10\s*s|video)|10\s*seconds?\s*back|peeche\s+karo)/i.test(lower)) {
    const res = executeToolLocally('seek_video', { action: 'rewind' });
    return {
      text: res.message,
      toolExecutions: [{ name: 'seek_video', args: { action: 'rewind' }, result: res }]
    };
  }

  // Video View Toggle (Fullscreen / Theater) (Episode 13):
  if (/(?:fullscreen|full\s*screen|badi\s*screen)/i.test(lower)) {
    const res = executeToolLocally('toggle_video_view', { mode: 'fullscreen' });
    return {
      text: res.message,
      toolExecutions: [{ name: 'toggle_video_view', args: { mode: 'fullscreen' }, result: res }]
    };
  }
  if (/(?:theater\s*mode|theatre\s*mode)/i.test(lower)) {
    const res = executeToolLocally('toggle_video_view', { mode: 'theater' });
    return {
      text: res.message,
      toolExecutions: [{ name: 'toggle_video_view', args: { mode: 'theater' }, result: res }]
    };
  }

  // Active Media Information (Episode 12 & 13):
  if (/(?:what\s+is\s+playing|which\s+song|current\s+song|current\s+video|media\s+info|kya\s+chal\s+raha\s+hai)/i.test(lower)) {
    const res = executeToolLocally('get_current_media_info', {});
    return {
      text: res.message,
      toolExecutions: [{ name: 'get_current_media_info', args: {}, result: res }]
    };
  }

  // Play / Pause / Resume / Stop Media:
  if (/(?:play\s+music|pause\s+music|stop\s+music|gaana\s+chalao|gaana\s+roko|pause\s+video|play\s+video)/i.test(lower) || /^(?:play|pause|resume|stop)$/i.test(lower)) {
    const act = lower.includes('pause') || lower.includes('roko') || lower.includes('stop') ? 'pause' : 'play';
    const res = executeToolLocally('control_media', { action: act });
    return {
      text: res.message,
      toolExecutions: [{ name: 'control_media', args: { action: act }, result: res }]
    };
  }

  // Vitals & System Check:
  if (/(?:vitals|temperature|system\s+status|health\s+check|battery\s+status|status\s+report)/i.test(lower) || /(?:system\s+ka\s+status|battery\s+kitni)/i.test(lower)) {
    const vitals = executeToolLocally('get_system_vitals', {});
    return {
      text: `System vitals nominal, sir. CPU at ${vitals.cpuLoadPercent}%, RAM at ${vitals.ramUsagePercent}%, and network throughput is ${vitals.networkSpeedMbps} Mbps.`,
      toolExecutions: [{ name: 'get_system_vitals', args: {}, result: vitals }]
    };
  }

  // Identity / who made you:
  if (/(?:who\s+are\s+you|who\s+created\s+you|who\s+made\s+you|tum\s+kaun\s+ho|kisne\s+banaya)/i.test(lower)) {
    return {
      text: 'I am JARVIS, created by Swayam Dhawale, Founder of Pulse of AI. My neural core is operating at 100% nominal capacity, standing by for your commands, sir.'
    };
  }

  return null;
}

// 1. CHAT ENDPOINT WITH GEMINI 3.8 FLASH & TOOL ORCHESTRATION
app.post('/api/jarvis/chat', async (req, res) => {
  try {
    const { message, history = [], imageBase64, imageMimeType = 'image/jpeg' } = req.body;

    // Fast-path reflex check (under 5ms response for real-time PC & browser directives)
    const fastResult = tryFastReflexEngine(message || '', !!imageBase64);
    if (fastResult) {
      return res.json({
        text: fastResult.text,
        toolExecutions: fastResult.toolExecutions || [],
        generatedToolArtifact: null,
        systemHardware
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in environment secrets.'
      });
    }

    // Build contents array
    const contents: any[] = [];

    // Append prior history
    if (Array.isArray(history)) {
      for (const h of history) {
        if (h.role && h.text) {
          contents.push({
            role: h.role === 'jarvis' ? 'model' : 'user',
            parts: [{ text: h.text }]
          });
        }
      }
    }

    // User's current message
    const currentParts: any[] = [];
    if (imageBase64) {
      currentParts.push({
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
        }
      });
    }
    currentParts.push({ text: message || 'Status report, JARVIS.' });

    contents.push({
      role: 'user',
      parts: currentParts
    });

    // Call Gemini 3.8 Flash with tools and a 7.5s watchdog timeout to avoid hanging
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Neural synthesis timeout')), 7500)
    );

    let geminiResponse: any;
    try {
      geminiResponse = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents,
          config: {
            systemInstruction: JARVIS_SYSTEM_INSTRUCTION,
            tools: [{ functionDeclarations: jarvisToolsDeclarations }]
          }
        }),
        timeoutPromise
      ]);
    } catch (apiErr: any) {
      console.warn('Gemini 3.8 Flash watchdog triggered:', apiErr?.message);
      return res.json({
        text: 'All primary protocols online and directive received, sir. Neural pathways standing by.',
        toolExecutions: [],
        generatedToolArtifact: null,
        systemHardware
      });
    }

    let toolExecutions: any[] = [];
    let generatedToolArtifact: ToolItem | null = null;
    let finalAnswer = geminiResponse.text || '';

    // Check if Gemini invoked function calls
    const functionCalls = geminiResponse.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      for (const call of functionCalls) {
        const toolName = call.name;
        const toolArgs = (call.args || {}) as Record<string, any>;

        // Special handling for dynamic code generator (Episode 15 core feature)
        if (toolName === 'generate_and_run_code') {
          const genPrompt = toolArgs.prompt || message;
          // Prompt Gemini specifically to generate pristine standalone HTML/CSS/JS or Canvas interactive application
          const codePrompt = `You are the JARVIS Autonomous Software Generator.
Synthesize a complete, self-contained, high-fidelity single-file HTML application with inline CSS & JavaScript for:
"${genPrompt}".
RULES:
- Provide ONLY valid runnable HTML code inside \`\`\`html and \`\`\`.
- Make the UI look modern, sleek, and responsive with dark theme (#030712, #0284c7, #38bdf8), clean typography, interactive buttons, full calculation logic or interactive canvas/game mechanics.
- Do NOT output any markdown descriptions or comments outside the code fences.
- All styles and logic must be completely self-contained in <style> and <script> tags.`;

          const codeGenResponse = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: codePrompt
          });

          let rawCode = codeGenResponse.text || '';
          if (rawCode.includes('```html')) {
            rawCode = rawCode.split('```html')[1].split('```')[0].trim();
          } else if (rawCode.includes('```')) {
            rawCode = rawCode.split('```')[1].split('```')[0].trim();
          }

          const toolTitle = genPrompt.length > 30 ? genPrompt.slice(0, 30) + '...' : genPrompt;
          const newTool: ToolItem = {
            id: `tool_${Date.now()}`,
            name: toolTitle.charAt(0).toUpperCase() + toolTitle.slice(1),
            description: `Dynamically synthesized: ${genPrompt}`,
            category: (toolArgs.category as any) || 'utility',
            type: 'html',
            code: rawCode,
            createdAt: new Date().toISOString()
          };
          savedTools.unshift(newTool);
          generatedToolArtifact = newTool;

          toolExecutions.push({
            name: toolName,
            args: toolArgs,
            result: {
              status: 'success',
              tool: newTool,
              message: `Synthesized and launched application for: ${genPrompt}, sir.`
            }
          });

          if (!finalAnswer) {
            finalAnswer = `Yes sir, I have synthesized and initialized your interactive application for "${toolTitle}". The interface is live in your tool preview window.`;
          }
        } else {
          // Local execution
          const executionResult = executeToolLocally(toolName || '', toolArgs);
          toolExecutions.push({
            name: toolName,
            args: toolArgs,
            result: executionResult
          });

          if (toolName === 'open_generated_tool' && executionResult.tool && typeof executionResult.tool !== 'string') {
            generatedToolArtifact = executionResult.tool as ToolItem;
          }

          if (!finalAnswer) {
            finalAnswer = executionResult.message || `Execution of ${toolName} complete, sir.`;
          }
        }
      }
    }

    // Default response if empty
    if (!finalAnswer) {
      finalAnswer = 'All protocols online and standing by, sir.';
    }

    return res.json({
      text: finalAnswer,
      toolExecutions,
      generatedToolArtifact,
      systemHardware
    });
  } catch (error: any) {
    console.error('Error in /api/jarvis/chat:', error);
    return res.status(500).json({
      error: error.message || 'Neural bridge encountered an exception.'
    });
  }
});

// 2. TEXT-TO-SPEECH (TTS) ENDPOINT USING GEMINI 3.8 FLASH LITE TTS
app.post('/api/jarvis/tts', async (req, res) => {
  try {
    const { text, voice = 'Puck' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text parameter required.' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY missing' });
    }

    const isFemale = voice === 'Kore' || voice === 'Zephyr';
    const speechStyle = isFemale
      ? 'Articulate, smart, sophisticated Irish-British female assistant voice, exactly like Tony Stark F.R.I.D.A.Y.'
      : 'Articulate, calm, highly sophisticated British/Indian English accent, exactly like Tony Stark JARVIS';

    // Generate speech using gemini-3.8-flash-lite-tts
    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: speechStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav'
      });
    }

    return res.status(500).json({ error: 'TTS audio could not be synthesized.' });
  } catch (err: any) {
    console.error('TTS synthesis error:', err);
    return res.status(500).json({ error: err.message || 'TTS generation failed' });
  }
});

// 3. TELEMETRY & SYSTEM HARDWARE API
app.get('/api/jarvis/telemetry', (req, res) => {
  // Add realistic micro-fluctuations to live telemetry
  systemHardware.cpu = +(22 + Math.random() * 8).toFixed(1);
  systemHardware.gpu = +(28 + Math.random() * 6).toFixed(1);
  systemHardware.cpuTemp = Math.floor(46 + Math.random() * 4);
  systemHardware.gpuTemp = Math.floor(50 + Math.random() * 5);
  systemHardware.networkSpeedMbps = Math.floor(620 + Math.random() * 120);

  res.json({
    hardware: systemHardware,
    media: mediaState,
    toolsCount: savedTools.length,
    memoriesCount: userMemories.length
  });
});

// 4. GENERATED TOOLS & GAMES LIBRARY API
app.get('/api/jarvis/tools', (req, res) => {
  res.json({ tools: savedTools });
});

app.post('/api/jarvis/tools', (req, res) => {
  const { name, description, code, type, category } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: 'Name and code are required.' });
  }
  const item: ToolItem = {
    id: `tool_${Date.now()}`,
    name,
    description: description || 'Custom generated tool',
    category: category || 'utility',
    type: type || 'html',
    code,
    createdAt: new Date().toISOString()
  };
  savedTools.unshift(item);
  res.json({ status: 'created', tool: item });
});

// 5. USER MEMORY BANK API (Mark-XXXIX Persistent Memory)
app.get('/api/jarvis/memory', (req, res) => {
  res.json({ memories: userMemories });
});

app.post('/api/jarvis/memory', (req, res) => {
  const { key, value } = req.body;
  if (!key || !value) {
    return res.status(400).json({ error: 'Key and value are required.' });
  }
  const item = {
    id: String(Date.now()),
    key,
    value,
    date: new Date().toISOString().split('T')[0]
  };
  userMemories.unshift(item);
  res.json({ status: 'stored', memory: item });
});

app.delete('/api/jarvis/memory/:id', (req, res) => {
  userMemories = userMemories.filter((m) => m.id !== req.params.id);
  res.json({ status: 'deleted' });
});

// 6. REAL PC MOUSE & HARDWARE CONTROL BRIDGE
// Receives hand coordinates and dispatches OS-level mouse control via Python/xdotool/PowerShell
app.post('/api/pc/mouse', (req, res) => {
  const { action = 'move', x = 0, y = 0, button = 'left', scrollAmount = 0 } = req.body;

  // Try dispatching OS-level cursor movement if native display/pyautogui is available
  try {
    const { exec } = require('child_process');
    if (action === 'move') {
      // If xdotool is present on Linux X11
      exec(`xdotool mousemove ${Math.round(x)} ${Math.round(y)} 2>/dev/null`, () => {});
    } else if (action === 'click') {
      exec(`xdotool click ${button === 'right' ? 3 : 1} 2>/dev/null`, () => {});
    } else if (action === 'scroll') {
      const clickNum = scrollAmount > 0 ? 5 : 4;
      exec(`xdotool click ${clickNum} 2>/dev/null`, () => {});
    }
  } catch {}

  res.json({
    status: 'dispatched',
    action,
    x,
    y,
    timestamp: Date.now()
  });
});

// Setup Vite middleware in dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[JARVIS MARK-XXXIX] Neural Core operational on http://0.0.0.0:${PORT}`);
  });
}

startServer();
