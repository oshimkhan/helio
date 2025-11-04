#!/usr/bin/env node
/**
 * Pre-flight check to ensure Python environment is set up
 * This runs before npm run dev to give helpful errors
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../..');
const venvDir = path.join(projectRoot, 'venv');
const mlRequirements = path.join(projectRoot, 'ML', 'requirements.txt');

// Check if venv exists
if (!fs.existsSync(venvDir)) {
  console.error('\n❌ Python virtual environment not found!');
  console.error('📁 Expected location:', venvDir);
  console.error('');
  console.error('Please run the setup script from the project root first:');
  console.error('  cd ..');
  console.error('  chmod +x setup.sh  # macOS/Linux only');
  console.error('  ./setup.sh         # macOS/Linux');
  console.error('  # OR');
  console.error('  setup.bat          # Windows');
  console.error('');
  console.error('This will set up both Python and Node.js dependencies.');
  console.error('');
  process.exit(1);
}

// Check if requirements file exists
if (!fs.existsSync(mlRequirements)) {
  console.error('\n⚠️  Warning: ML requirements.txt not found');
  console.error('The ML API may not work correctly.');
}

// Check if uvicorn is installed (basic check)
const venvPython = path.join(projectRoot, 'venv', 'bin', 'python');
const isWindows = process.platform === 'win32';
const pythonExecutable = isWindows 
  ? path.join(projectRoot, 'venv', 'Scripts', 'python.exe')
  : venvPython;

if (!fs.existsSync(pythonExecutable)) {
  console.error('\n❌ Python executable not found in virtual environment!');
  console.error('Please reinstall the virtual environment:');
  console.error('  cd ..');
  console.error('  rm -rf venv  # On Windows: rmdir /s venv');
  console.error('  ./setup.sh   # or setup.bat on Windows');
  console.error('');
  process.exit(1);
}

// All checks passed
console.log('✅ Python environment detected');
console.log('🚀 Starting development servers...\n');

