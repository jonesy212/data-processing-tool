#!/usr/bin/env tsx
// fix-import-wrappers.ts

import fs from 'fs';
import path from 'path';

const configPath = path.join(__dirname, 'import-fix-config.json');

function loadConfig() {
  if (!fs.existsSync(configPath)) {
    console.error('❌ Config file not found at:', configPath);
    process.exit(1);
  }
  
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

async function runFix(targetType: 'interface' | 'file', targetName: string, options: string[] = []) {
  const config = loadConfig();
  
  let targetPath = '';
  if (targetType === 'interface' && config.targets[targetName]) {
    targetPath = config.targets[targetName].path;
  } else if (targetType === 'file' && config.files[targetName]) {
    targetPath = config.files[targetName].path;
  } else {
    console.error(`❌ Target "${targetName}" not found in config`);
    process.exit(1);
  }
  
  const args = [
    '--interface',
    targetName,
    ...options
  ];
  
  console.log(`🔧 Fixing ${targetType}: ${targetName} (${targetPath})`);
  
  // Execute the granular fixer
  const { execSync } = require('child_process');
  const command = `tsx ${path.join(__dirname, 'fix-specific-imports.ts')} ${args.join(' ')}`;
  
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error running fixer:', getErrorMessage(error));
    } else {
      console.error('Unknown error:', error);
    }
  }
}

// Individual command runners
export async function fixDataStoreImports() {
  await runFix('interface', 'DataStore');
}

export async function fixSnapshotImports() {
  await runFix('interface', 'Snapshot');
}

export async function fixVersionImports() {
  await runFix('interface', 'VersionedData');
}

export async function fixInitializedStateImports() {
  await runFix('interface', 'InitializedState');
}

export async function fixDataStoreMethodsImports() {
  await runFix('interface', 'DataStoreMethods');
}

// File-based fixes
export async function fixAllFromDataStoreFile() {
  await runFix('file', 'DataStore.ts');
}

export async function fixAllFromSnapshotFile() {
  await runFix('file', 'Snapshot.ts');
}


function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'string') {
    return error;
  } else {
    return 'Unknown error';
  }
}





// CLI
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const commands: Record<string, () => Promise<void>> = {
    'datastore': fixDataStoreImports,
    'snapshot': fixSnapshotImports,
    'version': fixVersionImports,
    'initialized-state': fixInitializedStateImports,
    'datastore-methods': fixDataStoreMethodsImports,
    'all-datastore': fixAllFromDataStoreFile,
    'all-snapshot': fixAllFromSnapshotFile,
  };
  
  if (!command || command === '--help') {
    console.log(`
Import Fix Wrappers
===================
Run specific import fixes using configured targets.

Available commands:
  datastore          Fix DataStore interface imports
  snapshot           Fix Snapshot interface imports  
  version            Fix VersionedData interface imports
  initialized-state  Fix InitializedState type imports
  datastore-methods  Fix DataStoreMethods interface imports
  all-datastore      Fix all imports from DataStore.ts file
  all-snapshot       Fix all imports from Snapshot.ts file

Options:
  --dry-run          Preview only
  --apply            Apply without confirmation

Examples:
  tsx fix-import-wrappers.ts datastore --dry-run
  tsx fix-import-wrappers.ts snapshot --apply
    `);
    return;
  }
  
  if (!commands[command]) {
    console.error(`❌ Unknown command: ${command}`);
    console.log('   Available commands:', Object.keys(commands).join(', '));
    process.exit(1);
  }
  
  await commands[command]();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}