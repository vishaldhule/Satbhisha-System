#!/usr/bin/env bash
# ==============================================================================
# J.A.R.V.I.S. EPISODE 19 - AUTONOMOUS NEURAL INSTALLER (Linux & macOS)
# Architected by Swayam Dhawale • Founder of Pulse of AI
# ==============================================================================

set -e

echo "==============================================================================="
echo "   J.A.R.V.I.S. EPISODE 19 - AUTONOMOUS NEURAL INSTALLER"
echo "   Pulse of AI • Swayam Dhawale Architecture"
echo "==============================================================================="
echo ""

# 1. Python check
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] python3 could not be found. Please install Python 3.10+."
    exit 1
fi

echo "[1/4] Python Environment:"
python3 --version

# 2. Pip upgrade
echo ""
echo "[2/4] Upgrading PIP package manager..."
python3 -m pip install --upgrade pip

# 3. Pip dependencies
echo ""
echo "[3/4] Installing dependencies from requirements.txt..."
python3 -m pip install -r requirements.txt || true

# 4. Environment setup
echo ""
echo "[4/4] Verifying .env file..."
if [ ! -f .env ]; then
    echo "Creating default .env template..."
    cat <<EOT >> .env
# J.A.R.V.I.S. Neural System Keys
GEMINI_API_KEY=
GOOGLE_API_KEY=
GROQ_API_KEY=
OPENROUTER_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=VG7gYikNQ71LJ52W9fAD
EOT
    echo "[OK] Generated .env template. Please insert your keys."
else
    echo "[OK] Existing .env file found."
fi

echo ""
echo "Running system verification..."
python3 setup_environment.py || true

echo ""
echo "==============================================================================="
echo " INSTALLATION COMPLETE!"
echo " To start J.A.R.V.I.S.: python3 agent.py"
echo " To generate PPTs:     python3 ppt_engine.py"
echo "==============================================================================="
