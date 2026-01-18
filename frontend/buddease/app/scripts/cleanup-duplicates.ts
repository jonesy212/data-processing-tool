#!/usr/bin/env tsx
// scripts/cleanup-duplicates.ts

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';


interface CleanupResult {
  kept: string[];
  removed: string[];
  skipped: string[];
}


class DuplicateCleanup {
  private preservedLocations = [
    'scripts/typescript/testing/',
    'scripts/shell/backup/',
    'scripts/'
  ];
  
  private oldLocations = [
    './',
    'scripts/migration-workflow/',
    'scripts/migration-backup/',
    'app/scripts/'
  ];
  
  async cleanup(): Promise<CleanupResult> {
    console.log('🧹 Starting duplicate file cleanup...');
    console.log('='.repeat(60));
    
    // Find all TypeScript and shell files
    const allScripts = this.findAllScripts();
    
    // Group by filename
    const filesByBasename = this.groupByBasename(allScripts);
    
    const result: CleanupResult = {
      kept: [],
      removed: [],
      skipped: []
    };
    
    for (const [basename, locations] of Object.entries(filesByBasename)) {
      if (locations.length > 1) {
        console.log(`\n🔍 Found ${locations.length} instances of: ${basename}`);
        
        // Determine which to keep (prefer scripts/ directory)
        const keepLocation = this.determineKeepLocation(locations);
        
        for (const location of locations) {
          if (location === keepLocation) {
            console.log(`   ✅ Keeping: ${location}`);
            result.kept.push(location);
          } else {
            console.log(`   🗑️  Removing: ${location}`);
            try {
              fs.unlinkSync(location);
              result.removed.push(location);
            } catch (error: any) {
              console.warn(`   ⚠️  Failed to remove ${location}:`, error.message);
              result.skipped.push(location);
            }
          }
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Cleanup Results:');
    console.log(`   ✅ Kept: ${result.kept.length} files`);
    console.log(`   🗑️  Removed: ${result.removed.length} duplicate files`);
    if (result.skipped.length > 0) {
      console.log(`   ⏭️  Skipped: ${result.skipped.length} files`);
    }
    console.log('='.repeat(60));
    
    return result;
  }

  async cleanupDuplicates(): Promise<void> {
    console.log('🧹 Starting duplicate file cleanup...');
    console.log('='.repeat(60));
    
    // Find all TypeScript and shell files
    const allScripts = this.findAllScripts();
    
    // Group by filename
    const filesByBasename = this.groupByBasename(allScripts);
    
    let removed = 0;
    let kept = 0;
    
    for (const [basename, locations] of Object.entries(filesByBasename)) {
      if (locations.length > 1) {
        console.log(`\n🔍 Found ${locations.length} instances of: ${basename}`);
        
        // Determine which to keep (prefer scripts/ directory)
        const keepLocation = this.determineKeepLocation(locations);
        
        for (const location of locations) {
          if (location === keepLocation) {
            console.log(`   ✅ Keeping: ${location}`);
            kept++;
          } else {
            console.log(`   🗑️  Removing: ${location}`);
            try {
              fs.unlinkSync(location);
              removed++;
            } catch (error: any) {
              console.warn(`   ⚠️  Failed to remove ${location}:`, error.message);
            }
          }
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Cleanup Results:');
    console.log(`   ✅ Kept: ${kept} files`);
    console.log(`   🗑️  Removed: ${removed} duplicate files`);
    console.log('='.repeat(60));
  }
  
  private findAllScripts(): string[] {
    const scripts: string[] = [];
    
    const scanDir = (dir: string, depth = 0) => {
      if (depth > 6) return;
      
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          // Skip certain directories
          if (entry.name.includes('node_modules') || 
              entry.name.includes('.git') ||
              entry.name.includes('.migration-backups') ||
              entry.name.includes('.smart-backups') ||
              entry.name.startsWith('.')) {
            continue;
          }
          
          if (entry.isDirectory()) {
            scanDir(fullPath, depth + 1);
          } else if (entry.isFile() && !entry.isSymbolicLink()) {
            const ext = path.extname(fullPath).toLowerCase();
            if (['.ts', '.tsx', '.js', '.jsx', '.sh', '.bash'].includes(ext)) {
              scripts.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Silent skip
      }
    };
    
    scanDir('.');
    return scripts;
  }
  
  private groupByBasename(files: string[]): Record<string, string[]> {
    const groups: Record<string, string[]> = {};
    
    for (const file of files) {
      const basename = path.basename(file);
      if (!groups[basename]) {
        groups[basename] = [];
      }
      groups[basename].push(file);
    }
    
    // Filter to only groups with duplicates
    const duplicateGroups: Record<string, string[]> = {};
    for (const [basename, locations] of Object.entries(groups)) {
      if (locations.length > 1) {
        duplicateGroups[basename] = locations;
      }
    }
    
    return duplicateGroups;
  }
  
  private determineKeepLocation(locations: string[]): string {
    // Priority 1: Files in organized scripts/ structure
    for (const preserved of this.preservedLocations) {
      for (const location of locations) {
        if (location.includes(preserved)) {
          return location;
        }
      }
    }
    
    // Priority 2: Files in scripts/ directory
    for (const location of locations) {
      if (location.startsWith('scripts/')) {
        return location;
      }
    }
    
    // Priority 3: Newest file
    let newestLocation = locations[0];
    let newestTime = 0;
    
    for (const location of locations) {
      try {
        const stats = fs.statSync(location);
        if (stats.mtimeMs > newestTime) {
          newestTime = stats.mtimeMs;
          newestLocation = location;
        }
      } catch (error) {
        // Skip if can't stat
      }
    }
    
    return newestLocation;
  }
  
  async verifyCleanup(): Promise<void> {
    console.log('🔍 Verifying cleanup...');
    console.log('='.repeat(60));
    
    const scripts = this.findAllScripts();
    const groups = this.groupByBasename(scripts);
    
    const duplicates: Record<string, string[]> = {};
    
    for (const [basename, locations] of Object.entries(groups)) {
      if (locations.length > 1) {
        duplicates[basename] = locations;
      }
    }
    
    if (Object.keys(duplicates).length === 0) {
      console.log('✅ No duplicates found!');
    } else {
      console.log('⚠️  Found remaining duplicates:');
      for (const [basename, locations] of Object.entries(duplicates)) {
        console.log(`\n📁 ${basename}:`);
        for (const location of locations) {
          console.log(`   • ${location}`);
        }
      }
    }
    
    console.log('='.repeat(60));
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'cleanup';
  
  const cleanup = new DuplicateCleanup();
  
  switch (command) {
    case 'cleanup':
      await cleanup.cleanupDuplicates();
      break;
      
    case 'verify':
      await cleanup.verifyCleanup();
      break;
      
    case 'help':
    default:
      console.log(`
🧹 Duplicate Cleanup Manager
===========================

Commands:
  cleanup  - Remove duplicate files (keep organized versions)
  verify   - Check for remaining duplicates
  help     - Show this help

Examples:
  # Remove duplicates
  pnpm cleanup:duplicates
  
  # Verify cleanup
  pnpm cleanup:verify
  
  # Check specific file patterns
  find . -name "run-report-tests.ts" -o -name "one-command-migration.sh" | grep -v node_modules

Rules:
  • Keep files in organized scripts/ directory structure
  • Remove duplicates from old locations (root, app/scripts/, etc.)
  • Preserve symlinks for backward compatibility
      `);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { DuplicateCleanup };