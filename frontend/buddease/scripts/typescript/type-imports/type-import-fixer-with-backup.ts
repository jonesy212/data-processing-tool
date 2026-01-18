#!/usr/bin/env node
// type-import-fixer-with-backup.ts

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';
import type { FolderStats } from '@/core/error-analyzer/fix-strategy'

import { TypeImportFixer } from '@/core/error-analyzer/TypeImportFixer'

interface ImportFixerFolderStats {
  folder: string;
  fileCount: number;
  importCount: number;
  files: string[];
  importsByType: Record<string, number>;
}
// Helper for clear messages - MAKE SURE THIS CLASS IS DEFINED
export class HumanMessages {
  static header(text: string) {
    console.log('\n' + '='.repeat(60));
    console.log(`🎯 ${text}`);
    console.log('='.repeat(60) + '\n');
  }
  
  static section(text: string) {
    console.log(`\n📦 ${text}`);
    console.log('─'.repeat(40));
  }
  
  static step(text: string, emoji = '🔧') {
    console.log(`${emoji} ${text}`);
  }
  
  static success(text: string) {
    console.log(`✅ ${text}`);
  }
  
  static warning(text: string) {
    console.log(`⚠️  ${text}`);
  }
  
  static error(text: string) {
    console.log(`❌ ${text}`);
  }
  
  static info(text: string) {
    console.log(`ℹ️  ${text}`);
  }
}

// Updated BackupManager - SIMPLIFIED VERSION
export class BackupManager {
  private backupRoot: string;
  private sessionId: string;
  private fileContents = new Map<string, string>();
  private originalPaths = new Map<string, string>(); // Store original absolute paths
  
  constructor() {
    this.sessionId = `fix-session-${Date.now()}`;
    this.backupRoot = path.join(process.cwd(), '.temp-fix-backups', this.sessionId);
    
    HumanMessages.section('Setting up backup system');
    HumanMessages.step(`Session ID: ${this.sessionId}`);
    HumanMessages.step(`Backup location: ${this.backupRoot}`);
  }
  
  createBackup(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      HumanMessages.error(`File not found: ${filePath}`);
      throw new Error(`Cannot backup non-existent file: ${filePath}`);
    }
    
    const relativePath = path.relative(process.cwd(), filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Store in memory
    this.fileContents.set(relativePath, content);
    this.originalPaths.set(relativePath, filePath); // Store absolute path
    
    // Write to disk (optional, for safety)
    const backupPath = path.join(this.backupRoot, relativePath);
    const backupDir = path.dirname(backupPath);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    fs.writeFileSync(backupPath, content, 'utf8');
    
    HumanMessages.step(`Backed up: ${relativePath}`, '💾');
  }
  
  rollbackAll(): number {
    HumanMessages.section('ROLLING BACK ALL CHANGES');
    
    let restored = 0;
    
    // Restore from memory
    if (this.fileContents.size > 0) {
      HumanMessages.info(`Restoring ${this.fileContents.size} files from memory...`);
      
      for (const [relativePath, content] of this.fileContents) {
        const originalPath = this.originalPaths.get(relativePath);
        
        if (originalPath) {
          fs.writeFileSync(originalPath, content, 'utf8');
          restored++;
          HumanMessages.step(`Restored: ${relativePath}`, '↩️');
        }
      }
    }
    
    // Fallback to disk
    if (restored === 0 && fs.existsSync(this.backupRoot)) {
      restored = this.restoreFromDisk();
    }
    
    if (restored > 0) {
      HumanMessages.success(`Rolled back ${restored} files to original state`);
    } else {
      HumanMessages.error('No backups found to rollback');
    }
    
    return restored;
  }
  
  private restoreFromDisk(): number {
    let restored = 0;
    
    try {
      // Read session info to get file list
      const infoPath = path.join(this.backupRoot, 'session-info.json');
      if (fs.existsSync(infoPath)) {
        const sessionInfo = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
        
        if (sessionInfo.filesChanged) {
          for (const relativePath of sessionInfo.filesChanged) {
            const backupPath = path.join(this.backupRoot, relativePath);
            const originalPath = path.join(process.cwd(), relativePath);
            
            if (fs.existsSync(backupPath)) {
              // Ensure directory exists
              const originalDir = path.dirname(originalPath);
              if (!fs.existsSync(originalDir)) {
                fs.mkdirSync(originalDir, { recursive: true });
              }
              
              fs.copyFileSync(backupPath, originalPath);
              restored++;
              HumanMessages.step(`Restored from disk: ${relativePath}`, '💾');
            }
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      HumanMessages.error(`Error restoring from disk: ${errorMessage}`);
    }
    
    return restored;
  }
  
  createSessionInfo(files: string[], changes: any[], stats: ImportFixerFolderStats[]) {
    const relativeFiles = files.map(file => path.relative(process.cwd(), file));
    
    // Convert ImportFixerFolderStats to a serializable format
    const serializableStats = stats.map(stat => ({
      folder: stat.folder,
      fileCount: stat.fileCount,
      importCount: stat.importCount,
      files: stat.files,
      importsByType: stat.importsByType // Already Record<string, number>, so serializable
    }));
    
    const sessionInfo = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      totalFiles: files.length,
      changesMade: changes.length,
      filesChanged: relativeFiles,
      changes: changes.map(change => ({
        ...change,
        file: path.relative(process.cwd(), change.file)
      })),
      folderStats: serializableStats, // Use the serializable version
      backupLocation: this.backupRoot
    };
    
    const infoPath = path.join(this.backupRoot, 'session-info.json');
    const infoDir = path.dirname(infoPath);
    
    if (!fs.existsSync(infoDir)) {
      fs.mkdirSync(infoDir, { recursive: true });
    }
    
    fs.writeFileSync(infoPath, JSON.stringify(sessionInfo, null, 2));
    HumanMessages.success(`Session info saved to: ${infoPath}`);
  }
  
  getSessionInfo() {
    const infoPath = path.join(this.backupRoot, 'session-info.json');
    if (fs.existsSync(infoPath)) {
      return JSON.parse(fs.readFileSync(infoPath, 'utf8'));
    }
    return null;
  }
}

// TypeImportFixer class (keep your existing implementation)
// ...

// Main function - FIXED
async function main() {
  // Check if HumanMessages class exists
  if (typeof HumanMessages === 'undefined') {
    console.error('❌ Error: HumanMessages class not found!');
    process.exit(1);
  }
  
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const rollback = args.includes('--rollback');
  const analyzeOnly = args.includes('--analyze-only');
  
  const fixer = new TypeImportFixer();
  
  try {
    if (rollback) {
      await fixer.rollback();
    } else if (analyzeOnly) {
      await fixer.analyzeOnly();
    } else {
      await fixer.run(dryRun);
    }
  } catch (error: unknown) {
    // FIXED: Proper error type handling
    const errorMessage = error instanceof Error ? error.message : String(error);
    HumanMessages.error(`Fatal error: ${errorMessage}`);
    process.exit(1);
  }
}

// ES module entry point - FIXED
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: unknown) => {
    // FIXED: Proper error type handling
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Unhandled error:', errorMessage);
    process.exit(1);
  });
}