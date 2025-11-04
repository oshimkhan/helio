#!/bin/bash
# Script to start the FastAPI server with uvicorn
# This is called from npm scripts

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Navigate to ML directory
cd "$SCRIPT_DIR"

# Activate virtual environment
source "$PROJECT_ROOT/venv/bin/activate"

# Run uvicorn server
exec uvicorn api:app --reload --port 8000 --host 127.0.0.1

