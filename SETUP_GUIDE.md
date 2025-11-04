# Setup Guide for New Developers

This guide will help you set up the Healio project on a fresh machine.

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd helio
   ```

2. **Run the setup script**
   
   **macOS/Linux:**
   ```bash
   ./setup.sh
   ```
   
   **Windows:**
   ```bash
   setup.bat
   ```

3. **Configure environment variables**
   
   Create `Webapp/.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ML_API_URL=http://127.0.0.1:8000
   ```

4. **Start development servers**
   ```bash
   cd Webapp
   npm run dev
   ```

   This will start:
   - Next.js frontend on http://localhost:3000
   - ML API server on http://127.0.0.1:8000

## What the Setup Script Does

The setup script (`setup.sh` or `setup.bat`) automatically:

1. ✅ Checks for Python 3.8+ and Node.js 18+
2. ✅ Creates a Python virtual environment (`venv/`)
3. ✅ Installs all Python dependencies from `ML/requirements.txt`
4. ✅ Installs all Node.js dependencies from `Webapp/package.json`
5. ✅ Sets up everything needed to run the project

## Troubleshooting

### Python virtual environment not found

If you see an error about venv not existing:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r ML/requirements.txt
```

### ML API server won't start

1. Make sure venv is activated
2. Check that uvicorn is installed: `pip list | grep uvicorn`
3. If not, install: `pip install -r ML/requirements.txt`

### Port 8000 already in use

If port 8000 is already in use:
- Find the process: `lsof -i :8000` (macOS/Linux) or `netstat -ano | findstr :8000` (Windows)
- Kill it or change the port in `ML/api.py` and `Webapp/scripts/start-api.js`

### npm install fails

- Make sure Node.js 18+ is installed: `node --version`
- Clear cache and retry: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

## Manual Setup (Alternative)

If the setup script doesn't work, follow these steps:

1. **Set up Python environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install --upgrade pip
   pip install -r ML/requirements.txt
   ```

2. **Set up Node.js**
   ```bash
   cd Webapp
   npm install
   cd ..
   ```

3. **Verify setup**
   ```bash
   # Check Python packages
   source venv/bin/activate
   python -c "import uvicorn, fastapi; print('✅ Python packages OK')"
   
   # Check Node packages
   cd Webapp
   npm list --depth=0
   ```

## Project Structure

```
helio/
├── ML/                    # Machine Learning API
│   ├── api.py            # FastAPI server
│   ├── disease_model.joblib  # ML model file
│   └── requirements.txt  # Python dependencies
├── Webapp/                # Next.js frontend
│   ├── src/              # Source code
│   ├── scripts/         # Utility scripts
│   └── package.json     # Node.js dependencies
├── venv/                 # Python virtual environment (created by setup)
├── setup.sh              # Setup script (macOS/Linux)
├── setup.bat             # Setup script (Windows)
└── README.md             # Main documentation
```

## Important Notes

- The `venv/` directory is gitignored - each developer creates their own
- The ML model file (`disease_model.joblib`) is included in the repo
- Environment variables (`.env.local`) are gitignored for security
- Both servers (Next.js and ML API) run simultaneously when you run `npm run dev`

## Next Steps

After setup:
1. Read the main [README.md](README.md) for project overview
2. Check [Webapp/DEPLOYMENT.md](Webapp/DEPLOYMENT.md) for deployment info
3. Review the database schema in [Webapp/database_info.md](Webapp/database_info.md)

