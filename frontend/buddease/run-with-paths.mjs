// run-with-paths.mjs
import { register } from 'tsconfig-paths';
import { spawn } from 'child_process';

// Register path mappings
register({
  baseUrl: process.cwd(),
  paths: {
    "@/*": ["src/*"],
    "@/app/*": ["src/app/*"],
    "@/analyzers/*": ["src/app/generators/corrections/analyzers/*"],
    "@/components/*": ["src/app/components/*"],
    "@/utils/*": ["src/utils/*"],
    "@/types/*": ["src/app/types/*"],
    "@/scripts/*": ["src/app/scripts/*"],
    // Include only essential paths
  }
});

// Get the script path from command line arguments
const scriptPath = process.argv[2];
if (!scriptPath) {
  console.error('❌ No script path provided');
  process.exit(1);
}

console.log(`🚀 Running: ${scriptPath}`);

// Use --import instead of --loader for Node.js v22+
const tsxProcess = spawn('node', [
  '--import',
  'tsx',
  scriptPath,
  ...process.argv.slice(3)
], {
  stdio: 'inherit',
  shell: true
});

tsxProcess.on('close', (code) => {
  process.exit(code || 0);
});