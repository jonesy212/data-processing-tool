#!/usr/bin/env tsx
// scripts/migration-backup/PreMigrationBackup.ts

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

interface MigrationBackup {
  id: string;
  timestamp: Date;
  description: string;
  originalStructure: FileStructure[];
  backupPath: string;
  rollbackScript: string;
  checksum: string;
}

interface FileStructure {
  path: string;
  type: 'file' | 'directory';
  size: number;
  checksum?: string;
  originalLocation: string;
  backupLocation: string;
}

class PreMigrationBackup {
  private backupRoot = path.resolve('.migration-backups');
  private currentBackupId: string;
  private backupPath: string;
  
  constructor(description: string = 'Script Migration Backup') {
    this.currentBackupId = this.generateBackupId();
    this.backupPath = path.join(this.backupRoot, this.currentBackupId);
    
    this.ensureDirectory(this.backupRoot);
    this.ensureDirectory(this.backupPath);
  }
  
  private generateBackupId(): string {
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '-');
    const random = crypto.randomBytes(4).toString('hex');
    return `migration-${timestamp}-${random}`;
  }
  
  private ensureDirectory(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  private calculateChecksum(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  }
  
  private isScriptFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    const scriptExtensions = ['.ts', '.tsx', '.js', '.jsx', '.sh', '.bash'];
    const fileName = path.basename(filePath).toLowerCase();
    
    return scriptExtensions.includes(ext) || 
           fileName.includes('script') ||
           fileName.includes('fix') ||
           fileName.includes('backup') ||
           fileName.includes('deploy') ||
           fileName.includes('build');
  }
  
  private findScriptFiles(rootDir: string = '.'): FileStructure[] {
    const scriptFiles: FileStructure[] = [];
    
    const scanDirectory = (dir: string, depth = 0) => {
      if (depth > 6) return; // Limit recursion depth
      
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          // Skip backup directories and node_modules
          if (entry.name.includes('backup') || 
              entry.name === 'node_modules' || 
              entry.name === '.git' ||
              entry.name.startsWith('.')) {
            continue;
          }
          
          if (entry.isDirectory()) {
            scanDirectory(fullPath, depth + 1);
          } else if (entry.isFile()) {
            if (this.isScriptFile(fullPath)) {
              const stats = fs.statSync(fullPath);
              const checksum = this.calculateChecksum(fullPath);
              
              scriptFiles.push({
                path: fullPath,
                type: 'file',
                size: stats.size,
                checksum,
                originalLocation: fullPath,
                backupLocation: this.getBackupLocation(fullPath)
              });
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not scan ${dir}:`, error.message);
      }
    };
    
    scanDirectory(rootDir);
    return scriptFiles;
  }
  
  private getBackupLocation(originalPath: string): string {
    // Convert original path to backup path
    const relativePath = path.relative('.', originalPath);
    return path.join(this.backupPath, 'files', relativePath);
  }
  
  async createBackup(description: string): Promise<MigrationBackup> {
    console.log('📦 Creating pre-migration backup...');
    console.log('='.repeat(60));
    
    // Find all script files
    const scriptFiles = this.findScriptFiles();
    console.log(`📊 Found ${scriptFiles.length} script files to backup`);
    
    // Backup each file
    let backedUp = 0;
    const backedFiles: string[] = [];
    
    for (const file of scriptFiles) {
      try {
        // Create backup directory
        const backupDir = path.dirname(file.backupLocation);
        this.ensureDirectory(backupDir);
        
        // Copy file
        fs.copyFileSync(file.path, file.backupLocation);
        backedUp++;
        backedFiles.push(file.path);
        
        if (backedUp % 20 === 0) {
          console.log(`  📄 Backed up ${backedUp} files...`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to backup ${file.path}:`, error.message);
      }
    }
    
    // Save package.json
    const packageJsonPath = path.resolve('package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageBackupPath = path.join(this.backupPath, 'package.json.backup');
      fs.copyFileSync(packageJsonPath, packageBackupPath);
      console.log(`📄 Backed up package.json`);
    }
    
    // Create rollback script
    const rollbackScript = this.createRollbackScript(backedFiles);
    
    // Create manifest
    const manifest: MigrationBackup = {
      id: this.currentBackupId,
      timestamp: new Date(),
      description,
      originalStructure: scriptFiles,
      backupPath: this.backupPath,
      rollbackScript,
      checksum: this.calculateBackupChecksum(backedFiles)
    };
    
    // Save manifest
    const manifestPath = path.join(this.backupPath, 'manifest.json');
    fs.writeFileSync(
      manifestPath,
      JSON.stringify(manifest, null, 2),
      'utf8'
    );
    
    // Save simple rollback command
    const rollbackFilePath = path.join(this.backupPath, 'rollback.sh');
    fs.writeFileSync(
      rollbackFilePath,
      this.createSimpleRollbackScript(manifest),
      'utf8'
    );
    fs.chmodSync(rollbackFilePath, 0o755);
    
    console.log('='.repeat(60));
    console.log(`✅ Backup complete!`);
    console.log(`📁 Backup ID: ${this.currentBackupId}`);
    console.log(`📦 Location: ${this.backupPath}`);
    console.log(`📄 Total files: ${backedUp}`);
    console.log(`🔄 Rollback: bash ${rollbackFilePath}`);
    console.log('='.repeat(60));
    
    return manifest;
  }
  
  private createRollbackScript(backedFiles: string[]): string {
    const script = `#!/bin/bash

# Rollback script for migration backup: ${this.currentBackupId}
# Generated on: ${new Date().toISOString()}

echo "🔄 Restoring from backup: ${this.currentBackupId}"
echo "=".repeat(60)

BACKUP_DIR="${this.backupPath}/files"
RESTORED=0
FAILED=0

# Restore each file
cat << 'EOF' | while read -r original backup; do
${backedFiles.map(file => {
  const backupLoc = this.getBackupLocation(file);
  return `${file} ${backupLoc}`;
}).join('\n')}
EOF
do
  if [ -f "\$backup" ]; then
    echo "📄 Restoring: \$original"
    mkdir -p "\$(dirname "\$original")"
    cp "\$backup" "\$original"
    RESTORED=\$((RESTORED + 1))
  else
    echo "⚠️ Backup not found: \$backup"
    FAILED=\$((FAILED + 1))
  fi
done

# Restore package.json if exists
PACKAGE_BACKUP="${this.backupPath}/package.json.backup"
if [ -f "\$PACKAGE_BACKUP" ]; then
  echo "📦 Restoring package.json"
  cp "\$PACKAGE_BACKUP" "./package.json"
fi

echo "=".repeat(60)
echo "📊 Rollback complete:"
echo "   ✅ Restored: \$RESTORED files"
echo "   ❌ Failed: \$FAILED files"
echo "   📁 Backup ID: ${this.currentBackupId}"
`;
    
    return script;
  }
  
  private createSimpleRollbackScript(manifest: MigrationBackup): string {
    return `#!/bin/bash
# Quick rollback for ${manifest.id}
# Run: bash "${path.join(this.backupPath, 'rollback.sh')}"

echo "🔄 Quick Rollback"
echo "=".repeat(50)

tsx scripts/migration-backup/PreMigrationBackup.ts rollback ${manifest.id}

echo "=".repeat(50)
echo "✅ Rollback initiated!"
echo "📁 Check .migration-backups/${manifest.id}/rollback.log for details"
`;
  }
  
  private calculateBackupChecksum(files: string[]): string {
    const hash = crypto.createHash('sha256');
    
    for (const file of files) {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        hash.update(file + stats.size + stats.mtimeMs);
      }
    }
    
    return hash.digest('hex');
  }
  
  async rollback(backupId?: string): Promise<void> {
    const backupToRestore = backupId || this.currentBackupId;
    const manifestPath = path.join(this.backupRoot, backupToRestore, 'manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Backup ${backupToRestore} not found`);
    }
    
    const manifest: MigrationBackup = JSON.parse(
      fs.readFileSync(manifestPath, 'utf8')
    );
    
    console.log(`🔄 Rolling back from backup: ${manifest.id}`);
    console.log(`📝 Description: ${manifest.description}`);
    console.log(`📅 Date: ${manifest.timestamp}`);
    console.log('='.repeat(60));
    
    let restored = 0;
    let failed = 0;
    
    for (const file of manifest.originalStructure) {
      try {
        if (fs.existsSync(file.backupLocation)) {
          // Ensure directory exists
          const targetDir = path.dirname(file.originalLocation);
          this.ensureDirectory(targetDir);
          
          // Restore file
          fs.copyFileSync(file.backupLocation, file.originalLocation);
          
          // Verify checksum
          const restoredChecksum = this.calculateChecksum(file.originalLocation);
          if (restoredChecksum === file.checksum) {
            console.log(`✅ Restored: ${file.originalLocation}`);
            restored++;
          } else {
            console.warn(`⚠️ Checksum mismatch: ${file.originalLocation}`);
            failed++;
          }
        } else {
          console.warn(`⚠️ Backup not found: ${file.backupLocation}`);
          failed++;
        }
      } catch (error) {
        console.error(`❌ Failed to restore ${file.originalLocation}:`, error.message);
        failed++;
      }
    }
    
    // Restore package.json
    const packageBackup = path.join(manifest.backupPath, 'package.json.backup');
    if (fs.existsSync(packageBackup)) {
      fs.copyFileSync(packageBackup, path.resolve('package.json'));
      console.log(`📦 Restored package.json`);
    }
    
    console.log('='.repeat(60));
    console.log(`📊 Rollback Results:`);
    console.log(`   ✅ Successfully restored: ${restored} files`);
    console.log(`   ❌ Failed: ${failed} files`);
    console.log(`   📁 Backup ID: ${manifest.id}`);
    console.log(`   💾 Location: ${manifest.backupPath}`);
    
    // Create rollback log
    const logPath = path.join(manifest.backupPath, 'rollback.log');
    fs.writeFileSync(
      logPath,
      `Rollback completed: ${new Date().toISOString()}
Restored: ${restored} files
Failed: ${failed} files
`,
      'utf8'
    );
  }
  
  listBackups(): void {
    console.log('📦 Available Migration Backups');
    console.log('='.repeat(60));
    
    if (!fs.existsSync(this.backupRoot)) {
      console.log('No backups found');
      return;
    }
    
    const backups = fs.readdirSync(this.backupRoot, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && entry.name.startsWith('migration-'))
      .sort((a, b) => b.name.localeCompare(a.name)); // Newest first
    
    if (backups.length === 0) {
      console.log('No migration backups found');
      return;
    }
    
    backups.forEach(backup => {
      const manifestPath = path.join(this.backupRoot, backup.name, 'manifest.json');
      
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          const date = new Date(manifest.timestamp).toLocaleString();
          console.log(`\n📁 ${backup.name}`);
          console.log(`   📝 ${manifest.description}`);
          console.log(`   📅 ${date}`);
          console.log(`   📄 ${manifest.originalStructure.length} files`);
          console.log(`   🔄 Rollback: pnpm migration:rollback ${backup.name}`);
        } catch (error) {
          console.log(`\n📁 ${backup.name} (corrupted manifest)`);
        }
      } else {
        console.log(`\n📁 ${backup.name} (no manifest)`);
      }
    });
  }
  
  cleanupOldBackups(keepLast: number = 5): void {
    if (!fs.existsSync(this.backupRoot)) return;
    
    const backups = fs.readdirSync(this.backupRoot, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && entry.name.startsWith('migration-'))
      .sort((a, b) => b.name.localeCompare(a.name));
    
    if (backups.length <= keepLast) {
      console.log(`Keeping all ${backups.length} backups`);
      return;
    }
    
    const toDelete = backups.slice(keepLast);
    console.log(`🗑️  Cleaning up ${toDelete.length} old backups...`);
    
    for (const backup of toDelete) {
      const backupPath = path.join(this.backupRoot, backup.name);
      try {
        fs.rmSync(backupPath, { recursive: true, force: true });
        console.log(`  ✅ Deleted: ${backup.name}`);
      } catch (error) {
        console.warn(`  ❌ Failed to delete ${backup.name}:`, error.message);
      }
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  const backupManager = new PreMigrationBackup();
  
  switch (command) {
    case 'create':
      const description = args[1] || 'Script migration backup';
      await backupManager.createBackup(description);
      break;
      
    case 'rollback':
      const backupId = args[1];
      await backupManager.rollback(backupId);
      break;
      
    case 'list':
      backupManager.listBackups();
      break;
      
    case 'cleanup':
      const keep = parseInt(args[1]) || 5;
      backupManager.cleanupOldBackups(keep);
      break;
      
    case 'help':
    default:
      console.log(`
🛡️  Pre-Migration Backup Manager
================================

Commands:
  create [description]  - Create a new backup before migration
  rollback [id]         - Rollback to a specific backup
  list                  - List all available backups
  cleanup [keep=5]      - Clean up old backups (keep last N)
  help                  - Show this help

Examples:
  # Create backup before migrating scripts
  pnpm migration:backup
  
  # List all backups
  pnpm migration:list
  
  # Rollback to specific backup
  pnpm migration:rollback migration-2024-01-15-120000-abcd1234
  
  # Clean up, keep only last 3 backups
  pnpm migration:cleanup 3

Before running any script migration:
  1. pnpm migration:backup "Before script reorganization"
  2. Review backup: pnpm migration:list
  3. Run migration (e.g., pnpm script:run)
  4. If issues: pnpm migration:rollback

Safety Features:
  • Full file checksum verification
  • Backup manifest with all details
  • Automatic rollback script generation
  • Package.json backup included
      `);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { PreMigrationBackup };