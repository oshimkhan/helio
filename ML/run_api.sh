#!/bin/bash
# Script to run the FastAPI server with uvicorn

# Navigate to the ML directory
cd "$(dirname "$0")"

# Activate virtual environment
source ../venv/bin/activate

# Run uvicorn server
uvicorn api:app --reload --port 8000 --host 127.0.0.1

