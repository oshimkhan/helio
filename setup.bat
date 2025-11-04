@echo off
REM Setup script for Healio project (Windows)
REM This script sets up both the frontend and ML backend

echo 🚀 Setting up Healio project...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 3 is not installed. Please install Python 3.8+ first.
    exit /b 1
)

echo ✅ Python found
python --version

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ Node.js found
node --version

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo.
    echo 📦 Creating Python virtual environment...
    python -m venv venv
    echo ✅ Virtual environment created
) else (
    echo ✅ Virtual environment already exists
)

REM Activate virtual environment and install Python dependencies
echo.
echo 📦 Installing Python dependencies...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r ML\requirements.txt

echo.
echo ✅ Python dependencies installed

REM Install Node.js dependencies
echo.
echo 📦 Installing Node.js dependencies...
cd Webapp
call npm install
cd ..

echo.
echo ✅ Node.js dependencies installed

echo.
echo 🎉 Setup complete!
echo.
echo To start the development servers, run:
echo   cd Webapp
echo   npm run dev
echo.
echo This will start both:
echo   - Next.js frontend on http://localhost:3000
echo   - ML API server on http://127.0.0.1:8000

