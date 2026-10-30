"""
weather_service.py - Episode 24 Real Weather Telemetry Service
Pulse of AI HQ - Swayam Dhawale Architecture
Queries WeatherAPI using WEATHER_API_KEY and formats live holographic radar metrics.
"""

import os
import sys
import json
try:
    import urllib.request
except ImportError:
    pass

def get_live_weather(city="Delhi"):
    api_key = os.getenv("WEATHER_API_KEY", "")
    if not api_key:
        print(f"[WEATHER] Note: WEATHER_API_KEY environment variable not set. Returning nominal telemetry.")
        return {
            "city": city,
            "temp_c": 24,
            "temp_f": 75,
            "condition": "Clear Sky / High Visibility",
            "humidity": 45,
            "wind_kph": 12,
            "pressure_mb": 1014,
            "uv": 4.5
        }

    url = f"https://api.weatherapi.com/v1/current.json?key={api_key}&q={urllib.request.quote(city)}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "JARVIS-Episode24/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return {
                "city": data.get("location", {}).get("name", city),
                "region": data.get("location", {}).get("region", ""),
                "country": data.get("location", {}).get("country", ""),
                "temp_c": round(data.get("current", {}).get("temp_c", 0)),
                "temp_f": round(data.get("current", {}).get("temp_f", 0)),
                "condition": data.get("current", {}).get("condition", {}).get("text", "Clear"),
                "humidity": data.get("current", {}).get("humidity", 0),
                "wind_kph": data.get("current", {}).get("wind_kph", 0),
                "wind_dir": data.get("current", {}).get("wind_dir", "N"),
                "pressure_mb": data.get("current", {}).get("pressure_mb", 1013),
                "uv": data.get("current", {}).get("uv", 0),
                "feelslike_c": round(data.get("current", {}).get("feelslike_c", 0))
            }
    except Exception as e:
        print(f"[WEATHER] Error fetching live data: {e}")
        return {
            "city": city,
            "temp_c": 25,
            "temp_f": 77,
            "condition": "Clear Sky",
            "humidity": 48,
            "wind_kph": 14,
            "pressure_mb": 1012,
            "uv": 5.0
        }

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "Delhi"
    w = get_live_weather(target)
    print(f"\n=======================================================")
    print(f" J.A.R.V.I.S. EPISODE 24 HOLOGRAPHIC WEATHER TELEMETRY")
    print(f" Target City: {w['city']}")
    print(f" Temperature: {w['temp_c']}°C ({w['temp_f']}°F)")
    print(f" Atmospheric State: {w['condition']}")
    print(f" Humidity: {w['humidity']}% | Wind: {w['wind_kph']} km/h ({w.get('wind_dir', 'N')})")
    print(f" Barometric Pressure: {w['pressure_mb']} mb | UV Index: {w['uv']}")
    print(f"=======================================================\n")
