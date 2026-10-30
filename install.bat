@echo off
title J.A.R.V.I.S. Episode 19 Neural Installation Suite • Pulse of AI
color 0B
cls

echo ===============================================================================
echo        __  ___   ____  _    __ _____ _____    ____  ____  ________
echo       / / /   ^| / __ \^| ^|  / //_  _// ___/   / __ \/ __ \/ ____/ /
echo  __  / / / /^| ^|/ /_/ /^| ^| / /  / /  \__ \   / / / / /_/ / __/ / / 
echo / /_/ / / ___ / _, _/ ^| ^|/ / _/ /  ___/ /  / /_/ / ____/ /___/_/  
echo \____/_/_/  ^|_/_/ ^|_^| ^|___/ /___/ /____/   \____/_/   /_____(_)   
echo.
echo        J.A.R.V.I.S. EPISODE 19 - AUTONOMOUS NEURAL INSTALLER
echo        Architected by Swayam Dhawale • Founder of Pulse of AI
echo ===============================================================================
echo.

:: 1. Check Python Installation
echo [1/5] Checking Python environment...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Python is not installed or not added to your PATH!
    echo Please install Python 3.10 or higher from https://python.org and check "Add Python to PATH".
    pause
    exit /b 1
)
python --version

:: 2. Upgrade PIP
echo.
echo [2/5] Upgrading PIP package manager...
python -m pip install --upgrade pip

:: 3. Install All Episode 19 Dependencies
echo.
echo [3/5] Installing J.A.R.V.I.S. EP 19 production dependencies...
echo Installing: python-pptx, pyautogui, google-genai, pyaudio, pywin32, pyperclip, psutil, winsdk, python-dotenv, rich, keyboard, requests, websockets...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Some dependencies failed to install via pip.
    echo Trying fallback individual installs...
    pip install python-pptx pyautogui google-genai requests python-dotenv rich keyboard psutil websockets
)

:: 4. Setup .env Configuration
echo.
echo [4/5] Checking environment configuration (.env)...
if not exist ".env" (
    echo Creating default .env configuration...
    echo # J.A.R.V.I.S. Neural System Keys > .env
    echo GEMINI_API_KEY=>> .env
    echo GOOGLE_API_KEY=>> .env
    echo GROQ_API_KEY=>> .env
    echo OPENROUTER_API_KEY=>> .env
    echo ELEVENLABS_API_KEY=>> .env
    echo ELEVENLABS_VOICE_ID=VG7gYikNQ71LJ52W9fAD>> .env
    echo.
    echo [NOTICE] Created .env file. Please edit .env and insert your API keys.
) else (
    echo [OK] .env configuration detected.
)

:: 5. System Health Verification
echo.
echo [5/5] Running Neural Verification Routine...
python setup_environment.py

echo.
echo ===============================================================================
echo    INSTALLATION COMPLETE!
echo    To launch J.A.R.V.I.S. Cyberpunk HUD Console: python agent.py
echo    To test Autonomous Presentation Generator:    python ppt_engine.py
echo ===============================================================================
echo.
set /p launch_choice="Would you like to launch J.A.R.V.I.S. Agent now? (Y/N): "
if /i "%launch_choice%"=="Y" (
    python agent.py
)

pause
