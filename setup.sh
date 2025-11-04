#!/bin/bash
# Setup script for Healio project
# This script sets up both the frontend and ML backend

set -e

echo "🚀 Setting up Healio project..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo ""
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment and install Python dependencies
echo ""
echo "📦 Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r ML/requirements.txt

echo ""
echo "✅ Python dependencies installed"

# Install Node.js dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
cd Webapp
npm install
cd ..

echo ""
echo "✅ Node.js dependencies installed"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development servers, run:"
echo "  cd Webapp"
echo "  npm run dev"
echo ""
echo "This will start both:"
echo "  - Next.js frontend on http://localhost:3000"
echo "  - ML API server on http://127.0.0.1:8000"

