// run-with-paths.mjs
import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { register } from 'tsconfig-paths';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Enhanced debugging
console.log('🔍 DEBUG: Starting path resolution...');
console.log('🔍 DEBUG: Current working directory:', process.cwd());
console.log('🔍 DEBUG: Script directory:', __dirname);

// Register path mappings with error handling
try {
  console.log('🔍 DEBUG: Registering path mappings...');
  register({
    baseUrl: process.cwd(),
    paths: {
      "@/*": ["src/*"],
      "@/core/*": ["src/app/*"],
      "@/analyzers/*": ["src/app/generators/corrections/analyzers/*"],
      "@/components/*": ["src/app/components/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/app/types/*"],
      "@/scripts/*": ["src/app/scripts/*"],
    }
  });
  console.log('✅ DEBUG: Path mappings registered successfully');
} catch (error) {
  console.error('❌ DEBUG: Failed to register path mappings:', error);
  process.exit(1);
}

// Get the script path from command line arguments
const scriptPath = process.argv[2];
if (!scriptPath) {
  console.error('❌ No script path provided');
  console.log('🔍 DEBUG: process.argv:', process.argv);
  process.exit(1);
}

// Resolve the absolute path
const absoluteScriptPath = resolve(process.cwd(), scriptPath);
console.log('🔍 DEBUG: Script path:', scriptPath);
console.log('🔍 DEBUG: Absolute script path:', absoluteScriptPath);

// Check if the script file exists
import { existsSync } from 'fs';
if (!existsSync(absoluteScriptPath)) {
  console.error(`❌ Script file not found: ${absoluteScriptPath}`);
  console.log('🔍 DEBUG: Current directory contents:');
  
  // List directory contents for debugging
  const { readdirSync } = await import('fs');
  try {
    const files = readdirSync(process.cwd());
    console.log('🔍 DEBUG: Root directory:', files.slice(0, 10));
    
    const srcFiles = readdirSync(resolve(process.cwd(), 'src'));
    console.log('🔍 DEBUG: src directory:', srcFiles.slice(0, 10));
    
    const appFiles = readdirSync(resolve(process.cwd(), 'src/app'));
    console.log('🔍 DEBUG: src/app directory:', appFiles.slice(0, 10));
  } catch (err) {
    console.log('🔍 DEBUG: Could not read directory structure:', err.message);
  }
  
  process.exit(1);
}

console.log(`🚀 Running: ${absoluteScriptPath}`);

// Enhanced child process with better error handling
console.log('🔍 DEBUG: Spawning child process...');
const tsxProcess = spawn('node', [
  '--loader',
  'tsx',
  absoluteScriptPath,
  ...process.argv.slice(3)
], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    DEBUG_PATHS: 'true', // Add debug flag for the child process
    NODE_OPTIONS: '--enable-source-maps' // Better stack traces
  }
});

tsxProcess.on('error', (error) => {
  console.error('❌ Child process failed to start:', error);
  console.log('🔍 DEBUG: Error details:', {
    code: error.code,
    path: error.path,
    spawnargs: error.spawnargs
  });
});

tsxProcess.on('close', (code) => {
  console.log(`🔍 DEBUG: Child process exited with code: ${code}`);
  process.exit(code || 0);
});