"""
fui_bridge.py - Episode 24 Tactical FUI WebSocket & Local Bridge
Pulse of AI HQ - Swayam Dhawale Architecture
Connects the local Python agent and hardware sensors to the 3D Holographic Canvas HUD.
"""

import sys
import os
import time
import json
import asyncio
try:
    import websockets
    import psutil
except ImportError:
    pass

class TacticalFuiBridge:
    def __init__(self, host="127.0.0.1", port=8765):
        self.host = host
        self.port = port
        self.clients = set()
        self.serious_mode = False

    async def telemetry_loop(self):
        while True:
            try:
                # Gather system telemetry
                cpu = psutil.cpu_percent(interval=None) if 'psutil' in sys.modules else 24.5
                mem = psutil.virtual_memory().percent if 'psutil' in sys.modules else 42.0

                payload = json.dumps({
                    "type": "telemetry",
                    "cpu": cpu,
                    "ram": mem,
                    "serious": self.serious_mode,
                    "timestamp": time.time()
                })

                if self.clients:
                    await asyncio.gather(*[client.send(payload) for client in self.clients])
            except Exception as e:
                pass
            await asyncio.sleep(1.0)

    async def handler(self, websocket, path):
        self.clients.add(websocket)
        print(f"[FUI BRIDGE] Client connected: {websocket.remote_address}")
        try:
            async for message in websocket:
                data = json.loads(message)
                if data.get("action") == "toggle_serious_mode":
                    self.serious_mode = not self.serious_mode
                    print(f"[TACTICAL FUI] Serious Mode set to {self.serious_mode}")
                    await websocket.send(json.dumps({
                        "type": "serious_mode_ack",
                        "active": self.serious_mode
                    }))
        except Exception:
            pass
        finally:
            self.clients.remove(websocket)

    def run(self):
        print(f"===========================================================")
        print(f" J.A.R.V.I.S. EPISODE 24 TACTICAL FUI BRIDGE")
        print(f" Connecting 3D Hologram to Local OS Telemetry & Voice")
        print(f" Listening on ws://{self.host}:{self.port}")
        print(f"===========================================================")
        loop = asyncio.get_event_loop()
        server = websockets.serve(self.handler, self.host, self.port)
        loop.run_until_complete(server)
        loop.run_until_complete(self.telemetry_loop())
        loop.run_forever()

if __name__ == "__main__":
    bridge = TacticalFuiBridge()
    try:
        bridge.run()
    except KeyboardInterrupt:
        print("\n[FUI BRIDGE] Terminated gracefully.")
