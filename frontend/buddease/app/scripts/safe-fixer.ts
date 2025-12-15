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
  
  // Safe replacement that only replaces exact matches
  replaceImport(filePath: string, lineNumber: number, oldImport: string, newImport: string): boolean {
    try {
      // Read file
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      if (lineNumber < 1 || lineNumber > lines.length) {
        console.error(`❌ Line ${lineNumber} out of range in ${filePath}`);
        return false;
      }
      
      const lineIndex = lineNumber - 1;
      const originalLine = lines[lineIndex];
      
      // Check if line contains the exact import
      const importPattern = new RegExp(`['"]${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
      if (!importPattern.test(originalLine)) {
        console.error(`❌ Import '${oldImport}' not found on line ${lineNumber} in ${filePath}`);
        return false;
      }
      
      // Create backup
      const timestamp = Date.now();
      const backupPath = path.join(this.backupDir, `${path.basename(filePath)}.${timestamp}.bak`);
      fs.copyFileSync(filePath, backupPath);
      
      // Replace only the import, preserving everything else
      const newLine = originalLine.replace(
        new RegExp(`(['"])${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`),
        `$1${newImport}$2`
      );
      
      lines[lineIndex] = newLine;
      
      // Write file
      fs.writeFileSync(filePath, lines.join('\n'));
      
      // Record the fix
      this.records.push({
        timestamp: new Date(timestamp).toISOString(),
        file: filePath,
        originalImport: oldImport,
        newImport: newImport,
        line: lineNumber,
        backupPath,
        resolved: false
      });
      
      console.log(`✅ Fixed: ${oldImport} → ${newImport} in ${path.basename(filePath)}:${lineNumber}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to fix import in ${filePath}:`, error);
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