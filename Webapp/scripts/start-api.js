#!/usr/bin/env node
/**
 * Script to start the FastAPI ML server
 * This is called by npm scripts to run the API server
 */

const { spawn } = require('child_process');
const path = require('path');

// Script is in Webapp/scripts/, so project root is ../..
const projectRoot = path.resolve(__dirname, '../..');
const mlDir = path.join(projectRoot, 'ML');
const venvDir = path.join(projectRoot, 'venv');

// Check if venv exists
const fs = require('fs');
if (!fs.existsSync(venvDir)) {
  console.error('❌ Python virtual environment not found!');
  console.error('📁 Expected location:', venvDir);
  console.error('');
  console.error('Please run the setup script first:');
  console.error('  On macOS/Linux: ./setup.sh');
  console.error('  On Windows: setup.bat');
  console.error('');
  console.error('Or manually create the venv:');
  console.error('  python3 -m venv venv');
  console.error('  source venv/bin/activate  # On Windows: venv\\Scripts\\activate');
  console.error('  pip install -r ML/requirements.txt');
  process.exit(1);
}

const venvPython = path.join(projectRoot, 'venv', 'bin', 'python');

// Determine the python executable based on OS
const isWindows = process.platform === 'win32';
const pythonExecutable = isWindows 
  ? path.join(projectRoot, 'venv', 'Scripts', 'python.exe')
  : venvPython;

// Check if Python executable exists
if (!fs.existsSync(pythonExecutable)) {
  console.error('❌ Python executable not found in virtual environment!');
  console.error('📁 Expected location:', pythonExecutable);
  console.error('');
  console.error('Please reinstall the virtual environment:');
  console.error('  rm -rf venv  # On Windows: rmdir /s venv');
  console.error('  python3 -m venv venv');
  console.error('  source venv/bin/activate  # On Windows: venv\\Scripts\\activate');
  console.error('  pip install -r ML/requirements.txt');
  process.exit(1);
}

const uvicornArgs = [
  '-m', 'uvicorn',
  'api:app',
  '--reload',
  '--port', '8000',
  '--host', '127.0.0.1'
];

console.log('🚀 Starting ML API server...');
console.log(`📁 Working directory: ${mlDir}`);
console.log(`🐍 Python: ${pythonExecutable}`);

const apiProcess = spawn(pythonExecutable, uvicornArgs, {
  cwd: mlDir,
  stdio: 'inherit',
  shell: false
});

apiProcess.on('error', (error) => {
  console.error('❌ Failed to start API server:', error);
  process.exit(1);
});

apiProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`❌ API server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping API server...');
  apiProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  apiProcess.kill('SIGTERM');
  process.exit(0);
});

