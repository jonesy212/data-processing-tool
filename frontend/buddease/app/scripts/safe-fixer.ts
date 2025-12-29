// scripts/safe-fixer.ts
import fs from 'fs';
import path from 'path';

export interface FixRecord {
  timestamp: string;
  file: string;
  originalImport: string;
  newImport: string;
  line: number;
  backupPath: string;
  resolved: boolean;
}


export class SafeFixer {
  private records: FixRecord[] = [];
  private backupDir: string;
  private pendingFiles: Map<string, {
    fixes: Array<{ originalImport: string; newImport: string; line: number }>;
    backupPath: string | null;
  }> = new Map();
  
  constructor(backupDir: string = './.import-fix-backups') {
    this.backupDir = backupDir;
    this.ensureBackupDir();
  }
  
  private ensureBackupDir(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }
  
  // Simplified method for batching
  recordFix(fix: { file: string; originalImport: string; newImport: string; line: number }): void {
    const filePath = path.resolve(fix.file);
    
    if (!this.pendingFiles.has(filePath)) {
      this.pendingFiles.set(filePath, {
        fixes: [],
        backupPath: null
      });
    }
    
    const fileData = this.pendingFiles.get(filePath)!;
    fileData.fixes.push(fix);
  }
  
  createBackup(filePath: string): string {
    const resolvedPath = path.resolve(filePath);
    
    // Check if we already have a backup for this file
    if (this.pendingFiles.has(resolvedPath)) {
      const fileData = this.pendingFiles.get(resolvedPath)!;
      if (fileData.backupPath && fs.existsSync(fileData.backupPath)) {
        return fileData.backupPath; // Return existing backup
      }
    }
    
    // Create new backup
    const timestamp = Date.now();
    const fileName = path.basename(filePath);
    const backupFileName = `${fileName}.${timestamp}.bak`;
    const backupPath = path.join(this.backupDir, backupFileName);
    
    // Copy file
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, backupPath);
      
      // Store backup path
      if (this.pendingFiles.has(resolvedPath)) {
        this.pendingFiles.get(resolvedPath)!.backupPath = backupPath;
      } else {
        this.pendingFiles.set(resolvedPath, {
          fixes: [],
          backupPath
        });
      }
      
      console.log(`📁 Created backup: ${backupFileName}`);
      return backupPath;
    }
    
    throw new Error(`File not found: ${filePath}`);
  }
  
  // Keep the old method for backward compatibility
  replaceImport(filePath: string, lineNumber: number, oldImport: string, newImport: string): boolean {
    // This is now a wrapper for the batch method
    this.recordFix({ file: filePath, originalImport: oldImport, newImport, line: lineNumber });
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      if (lineNumber < 1 || lineNumber > lines.length) {
        return false;
      }
      
      const lineIndex = lineNumber - 1;
      const lineContent = lines[lineIndex];
      const importPattern = new RegExp(`(['"])${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`);
      
      if (!importPattern.test(lineContent)) {
        return false;
      }
      
      const newLine = lineContent.replace(importPattern, `$1${newImport}$2`);
      lines[lineIndex] = newLine;
      
      // Create backup
      this.createBackup(filePath);
      
      // Write file
      fs.writeFileSync(filePath, lines.join('\n'));
      return true;
      
    } catch (error) {
      return false;
    }
  }

  
  // Save fix records
  saveRecords(outputPath: string = './reports/fix-records.json', sessionId?: string): void {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const sessionInfo = {
      sessionId: sessionId || Date.now().toString(),
      generated: new Date().toISOString(),
      totalFixes: this.records.length,
      records: this.records
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(sessionInfo, null, 2));
    
    console.log(`📝 Fix records saved to ${outputPath} (${this.records.length} records)`);
    
    // Clear after saving to prevent accumulation
    this.clearAll();
  }

    // Save session-specific records
  saveSessionRecords(sessionId: string): string {
    const outputPath = path.join('./reports', `fix-records-${sessionId}.json`);
    this.saveRecords(outputPath, sessionId);
    return outputPath;
  }
  
  // Load fix records
  loadRecords(inputPath: string): FixRecord[] {
    if (fs.existsSync(inputPath)) {
      const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
      return data.records || [];
    }
    return [];
  }

    
  // Clear pending fixes
  clearPending(): void {
    this.pendingFiles.clear();
  }

  /**
   * Apply fixes for a specific file (alias for applyPendingFixes)
   * This method exists for backward compatibility with existing code
   * 
   * @param filePath - Path to the file to apply fixes to
   * @returns boolean indicating if any fixes were applied
   */

  applyPendingFixes(filePath: string): { fixed: number; failed: number } {
    const resolvedPath = path.resolve(filePath);
    
    if (!this.pendingFiles.has(resolvedPath)) {
      return { fixed: 0, failed: 0 };
    }
    
    const fileData = this.pendingFiles.get(resolvedPath)!;
    
    if (fileData.fixes.length === 0) {
      return { fixed: 0, failed: 0 };
    }
    
    let fixed = 0;
    let failed = 0;
    
    try {
      // Read the file
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      // Track which lines we've modified
      const modifiedLines = new Set<number>();
      let hasChanges = false;
      
      // Apply each fix
      for (const fix of fileData.fixes) {
        const lineIndex = fix.line - 1;
        
        // Skip if line is out of bounds
        if (lineIndex < 0 || lineIndex >= lines.length) {
          failed++;
          continue;
        }
        
        // Skip if line already modified
        if (modifiedLines.has(lineIndex)) {
          failed++; // Count as failed to avoid overwriting
          continue;
        }
        
        const lineContent = lines[lineIndex];
        const importPattern = new RegExp(`(['"])${fix.originalImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`);
        
        if (importPattern.test(lineContent)) {
          const newLine = lineContent.replace(importPattern, `$1${fix.newImport}$2`);
          lines[lineIndex] = newLine;
          modifiedLines.add(lineIndex);
          hasChanges = true;
          fixed++;
          
          // Add to records
          this.records.push({
            timestamp: new Date().toISOString(),
            file: filePath,
            originalImport: fix.originalImport,
            newImport: fix.newImport,
            line: fix.line,
            backupPath: fileData.backupPath || '',
            resolved: true
          });
        } else {
          // Fix pattern not found in line
          failed++;
        }
      }
      
      // Write back if there were changes
      if (hasChanges) {
        const newContent = lines.join('\n');
        fs.writeFileSync(filePath, newContent);
      }
      
      // Remove processed fixes from pending list
      if (fixed > 0) {
        this.pendingFiles.set(resolvedPath, {
          fixes: [],
          backupPath: fileData.backupPath
        });
      }
      
      console.log(`✅ Applied ${fixed} fixes to ${path.basename(filePath)} (${failed} failed)`);
      
    } catch (error) {
      console.error(`❌ Error applying fixes to ${filePath}:`, error);
      // Count all pending fixes as failed on error
      failed = fileData.fixes.length;
    }
    
    return { fixed, failed };
  }

  // Keep this as an alias that points to applyPendingFixes
  applyFixesForFile(filePath: string): { fixed: number; failed: number } {
    return this.applyPendingFixes(filePath);
  }
  // Apply all pending fixes across all files
  applyAllPendingFixes(): { fixed: number; files: number } {
    let totalFixed = 0;
    let totalFiles = 0;
    
    for (const [filePath, fileData] of this.pendingFiles) {
      if (fileData.fixes.length > 0) {
        const fixedCount = this.applyPendingFixes(filePath) ? fileData.fixes.length : 0;
        if (fixedCount > 0) {
          totalFixed += fixedCount;
          totalFiles++;
        }
      }
    }
    
    return { fixed: totalFixed, files: totalFiles };
  }
  
  
  // Get all backup files for a specific source file
  getBackupsForFile(filePath: string): string[] {
    const fileName = path.basename(filePath);
    const backups: string[] = [];
    
    if (fs.existsSync(this.backupDir)) {
      const files = fs.readdirSync(this.backupDir);
      backups.push(...files
        .filter(f => f.startsWith(fileName + '.'))
        .map(f => path.join(this.backupDir, f))
        .sort((a, b) => {
          // Sort by timestamp (newest first)
          const timeA = parseInt(path.basename(a).split('.').slice(-2)[0]) || 0;
          const timeB = parseInt(path.basename(b).split('.').slice(-2)[0]) || 0;
          return timeB - timeA;
        })
      );
    }
    
    return backups;
  }

  clearAll(): void {
    this.records = [];
    this.pendingFiles.clear();
    console.log('🧹 Cleared all fix records and pending files');
  }
  
  // Get only new records since last clear
  getNewRecords(): FixRecord[] {
    return [...this.records];
  }
  
  // Restore from the latest backup
  restoreLatestBackup(filePath: string): boolean {
    const backups = this.getBackupsForFile(filePath);
    
    if (backups.length === 0) {
      console.log(`❌ No backups found for ${filePath}`);
      return false;
    }
    
    try {
      const latestBackup = backups[0];
      fs.copyFileSync(latestBackup, filePath);
      console.log(`✅ Restored ${filePath} from ${path.basename(latestBackup)}`);
      return true;
    } catch (error) {
      console.error(`❌ Error restoring ${filePath}:`, error);
      return false;
    }
  }
}