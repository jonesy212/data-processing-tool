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
    const timestamp = Date.now();
    const backupPath = path.join(this.backupDir, `${path.basename(fix.file)}.${timestamp}.bak`);
    
    this.records.push({
      timestamp: new Date(timestamp).toISOString(),
      file: fix.file,
      originalImport: fix.originalImport,
      newImport: fix.newImport,
      line: fix.line,
      backupPath,
      resolved: false
    });
  }
  
  createBackup(filePath: string): string {
    const timestamp = Date.now();
    const backupPath = path.join(this.backupDir, `${path.basename(filePath)}.${timestamp}.bak`);
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
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
  saveRecords(outputPath: string = './reports/fix-records.json'): void {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify({
      generated: new Date().toISOString(),
      totalFixes: this.records.length,
      records: this.records
    }, null, 2));
    
    console.log(`📝 Fix records saved to ${outputPath}`);
  }
  
  // Load fix records
  loadRecords(inputPath: string): FixRecord[] {
    if (fs.existsSync(inputPath)) {
      const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
      return data.records || [];
    }
    return [];
  }
}