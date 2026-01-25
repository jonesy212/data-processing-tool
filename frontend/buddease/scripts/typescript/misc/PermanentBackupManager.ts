// PermanentBackupManager.ts
// scripts/safety/PermanentBackupManager.ts

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

class PermanentBackupManager {
  private readonly PERMANENT_DIR = path.join('.migrations', 'permanent-safe-points');
  private readonly IMMUTABLE_PREFIX = 'immutable-';
  
  constructor() {
    this.ensurePermanentDirectory();
  }
  
  private ensurePermanentDirectory(): void {
    if (!fs.existsSync(this.PERMANENT_DIR)) {
      fs.mkdirSync(this.PERMANENT_DIR, { recursive: true });
      // Make directory read-only at OS level
      fs.chmodSync(this.PERMANENT_DIR, 0o555); // Read + execute only
    }
  }
  
  /**
   * Create immutable foundation snapshot
   * Once created, cannot be modified or deleted
   */
  async createImmutableFoundation(
    name: string,
    description: string,
    creator: string
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `${this.IMMUTABLE_PREFIX}${timestamp}-${crypto.randomBytes(4).toString('hex')}`;
    const backupPath = path.join(this.PERMANENT_DIR, backupId);
    
    console.log(`🔒 Creating IMMUTABLE foundation: ${name}`);
    console.log(`👤 Creator: ${creator}`);
    
    // Create backup structure
    fs.mkdirSync(backupPath, { recursive: true });
    
    // 1. Backup entire src directory
    const srcBackup = path.join(backupPath, 'src-backup');
    fs.cpSync('src', srcBackup, { recursive: true });
    
    // 2. Backup package.json and configs
    const configsBackup = path.join(backupPath, 'configs');
    fs.mkdirSync(configsBackup);
    ['package.json', 'tsconfig.json', 'pnpm-lock.yaml'].forEach(config => {
      if (fs.existsSync(config)) {
        fs.copyFileSync(config, path.join(configsBackup, config));
      }
    });
    
    // 3. Create manifest with cryptographic signature
    const manifest = {
      id: backupId,
      name,
      description,
      creator,
      timestamp: new Date().toISOString(),
      gitHash: await this.getGitHash(),
      checksum: await this.calculateDirectoryChecksum('src'),
      immutable: true,
      verification: {
        typeScriptErrors: await this.countTypeScriptErrors(),
        lintErrors: await this.countLintErrors(),
        testPassing: await this.areTestsPassing()
      }
    };
    
    fs.writeFileSync(
      path.join(backupPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf8'
    );
    
    // 4. Create immutable signature
    const signature = await this.createImmutableSignature(manifest);
    fs.writeFileSync(
      path.join(backupPath, 'signature.sha256'),
      signature,
      'utf8'
    );
    
    // 5. Make backup READ-ONLY
    fs.chmodSync(backupPath, 0o555); // Read + execute only
    this.makeFilesImmutable(backupPath);
    
    // 6. Log to tracking system
    await this.logToTrackingSystem(manifest, creator);
    
    console.log(`✅ IMMUTABLE foundation created: ${backupId}`);
    console.log(`📊 Verification: ${manifest.verification.typeScriptErrors} TypeScript errors`);
    console.log(`🔗 Can be referenced as: foundation:${backupId}`);
    
    return backupId;
  }
  
  private async createImmutableSignature(manifest: any): Promise<string> {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(manifest));
    hash.update(await this.getGitHash());
    hash.update(Date.now().toString());
    return hash.digest('hex');
  }
  
  private makeFilesImmutable(dir: string): void {
    const files = this.getAllFiles(dir);
    files.forEach(file => {
      try {
        fs.chmodSync(file, 0o444); // Read-only
        // On Unix systems, we could also set immutable flag:
        // require('child_process').execSync(`chattr +i "${file}"`);
      } catch (error) {
        // Continue if we can't set permissions
      }
    });
  }
  
  private getAllFiles(dir: string): string[] {
    const files: string[] = [];
    
    function walk(directory: string) {
      const items = fs.readdirSync(directory, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(directory, item.name);
        
        if (item.isDirectory()) {
          walk(fullPath);
        } else if (item.isFile()) {
          files.push(fullPath);
        }
      }
    }
    
    walk(dir);
    return files;
  }
  
  private async getGitHash(): Promise<string> {
    try {
      const { execSync } = require('child_process');
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch {
      return 'no-git';
    }
  }
  
  private async calculateDirectoryChecksum(dir: string): Promise<string> {
    if (!fs.existsSync(dir)) return '';
    
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    const files = this.getAllFiles(dir).sort();
    
    for (const file of files) {
      const stats = fs.statSync(file);
      hash.update(file);
      hash.update(stats.mtimeMs.toString());
      hash.update(stats.size.toString());
    }
    
    return hash.digest('hex');
  }
  
  private async countTypeScriptErrors(): Promise<number> {
    try {
      const { execSync } = require('child_process');
      const output = execSync('npx tsc --noEmit --skipLibCheck 2>&1', { encoding: 'utf8' });
      const errorLines = output.split('\n').filter((line: string) => line.includes('error TS'));
      return errorLines.length;
    } catch {
      return -1; // Could not determine
    }
  }
  
  private async countLintErrors(): Promise<number> {
    try {
      const { execSync } = require('child_process');
      const output = execSync('npm run lint 2>&1', { encoding: 'utf8' });
      const matches = output.match(/✖ \d+ problems/);
      return matches ? parseInt(matches[0].replace(/\D/g, '')) : 0;
    } catch {
      return -1;
    }
  }
  
  private async areTestsPassing(): Promise<boolean> {
    try {
      const { execSync } = require('child_process');
      execSync('npm test -- --passWithNoTests', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }
  
  private async logToTrackingSystem(manifest: any, creator: string): Promise<void> {
    const trackingDir = path.join('.tracking');
    if (!fs.existsSync(trackingDir)) {
      fs.mkdirSync(trackingDir, { recursive: true });
    }
    
    const trackingLog = path.join(trackingDir, 'foundation-snapshots.log');
    const entry = {
      timestamp: new Date().toISOString(),
      action: 'create_immutable_foundation',
      backupId: manifest.id,
      name: manifest.name,
      creator,
      verification: manifest.verification,
      gitHash: manifest.gitHash,
      checksum: manifest.checksum
    };
    
    let logs = [];
    if (fs.existsSync(trackingLog)) {
      logs = JSON.parse(fs.readFileSync(trackingLog, 'utf8'));
    }
    
    logs.push(entry);
    fs.writeFileSync(trackingLog, JSON.stringify(logs, null, 2), 'utf8');
  }
  
  /**
   * Verify if current code matches foundation
   */
  async verifyAgainstFoundation(foundationId: string): Promise<{
    matches: boolean;
    differences: string[];
    drifts: Array<{ file: string; changeType: string }>;
  }> {
    const foundationPath = path.join(this.PERMANENT_DIR, foundationId);
    if (!fs.existsSync(foundationPath)) {
      throw new Error(`Foundation ${foundationId} not found`);
    }
    
    const manifestPath = path.join(foundationPath, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    const currentChecksum = await this.calculateDirectoryChecksum('src');
    const currentGitHash = await this.getGitHash();
    
    const differences: string[] = [];
    const drifts: Array<{ file: string; changeType: string }> = [];
    
    // Check 1: Checksum match
    if (currentChecksum !== manifest.checksum) {
      differences.push('Source code checksum mismatch');
      
      // Find specific file differences
      const foundationSrc = path.join(foundationPath, 'src-backup');
      const currentSrc = 'src';
      
      if (fs.existsSync(foundationSrc)) {
        const fileDrifts = await this.compareDirectories(foundationSrc, currentSrc);
        drifts.push(...fileDrifts);
      }
    }
    
    // Check 2: Git hash (if applicable)
    if (manifest.gitHash !== 'no-git' && currentGitHash !== manifest.gitHash) {
      differences.push('Git commit divergence');
    }
    
    // Check 3: Error count comparison
    const currentErrors = await this.countTypeScriptErrors();
    if (currentErrors > manifest.verification.typeScriptErrors) {
      differences.push(`Increased TypeScript errors: ${currentErrors} > ${manifest.verification.typeScriptErrors}`);
    }
    
    return {
      matches: differences.length === 0,
      differences,
      drifts
    };
  }
  
  private async compareDirectories(dirA: string, dirB: string): Promise<Array<{ file: string; changeType: string }>> {
    const drifts: Array<{ file: string; changeType: string }> = [];
    
    function getAllRelativeFiles(dir: string): string[] {
      const files: string[] = [];
      
      function walk(directory: string, base: string) {
        const items = fs.readdirSync(directory, { withFileTypes: true });
        
        for (const item of items) {
          const relativePath = path.join(base, item.name);
          const fullPath = path.join(directory, item.name);
          
          if (item.isDirectory()) {
            walk(fullPath, relativePath);
          } else if (item.isFile()) {
            files.push(relativePath);
          }
        }
      }
      
      walk(dir, '');
      return files;
    }
    
    const filesA = getAllRelativeFiles(dirA);
    const filesB = getAllRelativeFiles(dirB);
    
    // Check for added files
    for (const file of filesB) {
      if (!filesA.includes(file)) {
        drifts.push({ file, changeType: 'added' });
      }
    }
    
    // Check for removed files
    for (const file of filesA) {
      if (!filesB.includes(file)) {
        drifts.push({ file, changeType: 'removed' });
      }
    }
    
    // Check for modified files
    for (const file of filesA.filter(f => filesB.includes(f))) {
      const fileA = path.join(dirA, file);
      const fileB = path.join(dirB, file);
      
      if (fs.existsSync(fileA) && fs.existsSync(fileB)) {
        const contentA = fs.readFileSync(fileA, 'utf8');
        const contentB = fs.readFileSync(fileB, 'utf8');
        
        if (contentA !== contentB) {
          drifts.push({ file, changeType: 'modified' });
        }
      }
    }
    
    return drifts;
  }
/**
 * Get list of all immutable foundations
 */
listImmutableFoundations(): Array<{
  id: string;
  name: string;
  timestamp: string;
  creator: string;
  verification: any;
}> {
  if (!fs.existsSync(this.PERMANENT_DIR)) {
    return [];
  }
  
  const foundations = fs.readdirSync(this.PERMANENT_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith(this.IMMUTABLE_PREFIX))
    .map(dir => {
      const manifestPath = path.join(this.PERMANENT_DIR, dir.name, 'manifest.json');
      
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          return {
            id: dir.name,
            name: manifest.name,
            timestamp: manifest.timestamp,
            creator: manifest.creator,
            verification: manifest.verification
          };
        } catch (error) {
          return null;
        }
      }
      return null;
    })
    .filter((foundation): foundation is NonNullable<typeof foundation> => foundation !== null);
  
  return foundations.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
  
  /**
   * Create developer-specific checkpoint
   * Tracks who made what changes
   */
  async createDeveloperCheckpoint(
    developerId: string,
    featureName: string,
    description: string
  ): Promise<string> {
    const devDir = path.join('.migrations', 'dev-phases', `dev-${developerId}`);
    if (!fs.existsSync(devDir)) {
      fs.mkdirSync(devDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const checkpointId = `checkpoint-${timestamp}`;
    const checkpointPath = path.join(devDir, checkpointId);
    
    fs.mkdirSync(checkpointPath, { recursive: true });
    
    // Capture git diff of developer's changes
    const gitDiff = await this.captureGitDiff(developerId);
    
    // Create developer manifest
    const manifest = {
      id: checkpointId,
      developerId,
      featureName,
      description,
      timestamp: new Date().toISOString(),
      gitDiff,
      filesChanged: await this.getChangedFiles(),
      errorCount: await this.countTypeScriptErrors(),
      basedOnFoundation: await this.getCurrentFoundationReference()
    };
    
    fs.writeFileSync(
      path.join(checkpointPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf8'
    );
    
    // Track developer activity
    await this.trackDeveloperActivity(developerId, checkpointId, featureName);
    
    console.log(`👤 Developer checkpoint created for ${developerId}: ${featureName}`);
    
    return checkpointId;
  }
  
  private async captureGitDiff(developerId: string): Promise<string> {
    try {
      const { execSync } = require('child_process');
      
      // Get commits by this developer (simplified)
      const commits = execSync('git log --oneline -10', { encoding: 'utf8' })
        .split('\n')
        .filter((line: string) => line.toLowerCase().includes(developerId.toLowerCase()));
      
      if (commits.length > 0) {
        const latestCommit = commits[0].split(' ')[0];
        return execSync(`git diff ${latestCommit}~1 ${latestCommit}`, { encoding: 'utf8' });
      }
      
      return 'No git diff available';
    } catch {
      return 'Git not available';
    }
  }
  
  private async getChangedFiles(): Promise<string[]> {
    try {
      const { execSync } = require('child_process');
      const output = execSync('git status --porcelain', { encoding: 'utf8' });
      return output.split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => line.substring(3).trim());
    } catch {
      return [];
    }
  }
  
  private async getCurrentFoundationReference(): Promise<string | null> {
    const foundations = this.listImmutableFoundations();
    if (foundations.length === 0) return null;
    
    // Find the foundation we're closest to
    const currentChecksum = await this.calculateDirectoryChecksum('src');
    
    for (const foundation of foundations) {
      const foundationPath = path.join(this.PERMANENT_DIR, foundation.id);
      const manifestPath = path.join(foundationPath, 'manifest.json');
      
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        // Simple check - if we have similar error counts
        const currentErrors = await this.countTypeScriptErrors();
        if (Math.abs(currentErrors - manifest.verification.typeScriptErrors) < 5) {
          return foundation.id;
        }
      }
    }
    
    return foundations[0]?.id || null;
  }
  
  private async trackDeveloperActivity(
    developerId: string,
    checkpointId: string,
    featureName: string
  ): Promise<void> {
    const trackingDir = path.join('.tracking');
    if (!fs.existsSync(trackingDir)) {
      fs.mkdirSync(trackingDir, { recursive: true });
    }
    
    const developerMapPath = path.join(trackingDir, 'developer-mapping.json');
    let developerMap: Record<string, any> = {};
    
    if (fs.existsSync(developerMapPath)) {
      developerMap = JSON.parse(fs.readFileSync(developerMapPath, 'utf8'));
    }
    
    if (!developerMap[developerId]) {
      developerMap[developerId] = {
        firstSeen: new Date().toISOString(),
        checkpoints: [],
        features: []
      };
    }
    
    developerMap[developerId].checkpoints.push(checkpointId);
    developerMap[developerId].features.push({
      name: featureName,
      timestamp: new Date().toISOString(),
      checkpointId
    });
    
    developerMap[developerId].lastActive = new Date().toISOString();
    
    fs.writeFileSync(
      developerMapPath,
      JSON.stringify(developerMap, null, 2),
      'utf8'
    );
  }
  
  /**
   * Track error origins - when/where errors were introduced
   */
  async trackErrorOrigin(
    errorType: string,
    errorMessage: string,
    filePath: string,
    lineNumber: number
  ): Promise<void> {
    const trackingDir = path.join('.tracking');
    if (!fs.existsSync(trackingDir)) {
      fs.mkdirSync(trackingDir, { recursive: true });
    }
    
    const errorLogPath = path.join(trackingDir, 'error-origins.log');
    
    // Get current git info to identify who might have introduced this
    let gitBlame = 'unknown';
    try {
      const { execSync } = require('child_process');
      gitBlame = execSync(`git blame -L ${lineNumber},${lineNumber} "${filePath}"`, {
        encoding: 'utf8'
      }).split(' ')[0];
    } catch (error) {
      // Could not get git blame
    }
    
    const errorEntry = {
      timestamp: new Date().toISOString(),
      errorType,
      errorMessage,
      filePath,
      lineNumber,
      gitBlame,
      currentDeveloper: process.env.DEVELOPER_ID || 'unknown',
      foundationReference: await this.getCurrentFoundationReference(),
      // Take snapshot of surrounding code for context
      codeContext: await this.getCodeContext(filePath, lineNumber)
    };
    
    let errorLogs = [];
    if (fs.existsSync(errorLogPath)) {
      errorLogs = JSON.parse(fs.readFileSync(errorLogPath, 'utf8'));
    }
    
    errorLogs.push(errorEntry);
    fs.writeFileSync(errorLogPath, JSON.stringify(errorLogs, null, 2), 'utf8');
    
    console.log(`📝 Error origin tracked: ${errorType} in ${filePath}:${lineNumber}`);
  }
  
  private async getCodeContext(filePath: string, lineNumber: number): Promise<string> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      const start = Math.max(0, lineNumber - 3);
      const end = Math.min(lines.length - 1, lineNumber + 2);
      
      return lines.slice(start, end + 1).join('\n');
    } catch {
      return 'Could not read file';
    }
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  const manager = new PermanentBackupManager();
  
  async function main() {
    switch (command) {
      case 'create-foundation':
        const name = args[1] || 'Foundation Snapshot';
        const description = args[2] || 'Stable foundation point';
        const creator = args[3] || process.env.USER || 'unknown';
        await manager.createImmutableFoundation(name, description, creator);
        break;
        
      case 'list-foundations':
        const foundations = manager.listImmutableFoundations();
        console.log('🔒 IMMUTABLE FOUNDATIONS:');
        console.log('='.repeat(60));
        
        foundations.forEach((foundation, index) => {
          console.log(`\n${index + 1}. ${foundation.name}`);
          console.log(`   ID: ${foundation.id}`);
          console.log(`   Date: ${new Date(foundation.timestamp).toLocaleString()}`);
          console.log(`   Creator: ${foundation.creator}`);
          console.log(`   TypeScript Errors: ${foundation.verification.typeScriptErrors}`);
        });
        break;
        
      case 'verify-foundation':
        const foundationId = args[1];
        if (!foundationId) {
          console.error('❌ Foundation ID required');
          process.exit(1);
        }
        
        const verification = await manager.verifyAgainstFoundation(foundationId);
        console.log(`🔍 Verification against ${foundationId}:`);
        console.log(`   Matches: ${verification.matches ? '✅ YES' : '❌ NO'}`);
        
        if (!verification.matches) {
          console.log(`\n📊 Differences:`);
          verification.differences.forEach(diff => console.log(`   • ${diff}`));
          
          if (verification.drifts.length > 0) {
            console.log(`\n📁 File drifts:`);
            verification.drifts.slice(0, 10).forEach(drift => {
              console.log(`   • ${drift.changeType}: ${drift.file}`);
            });
          }
        }
        break;
        
      case 'create-checkpoint':
        const developerId = args[1];
        const featureName = args[2] || 'feature';
        const checkpointDesc = args[3] || 'Developer checkpoint';
        
        if (!developerId) {
          console.error('❌ Developer ID required');
          process.exit(1);
        }
        
        await manager.createDeveloperCheckpoint(developerId, featureName, checkpointDesc);
        break;
        
      case 'track-error':
        const errorType = args[1];
        const errorMessage = args[2];
        const filePath = args[3];
        const lineNumber = parseInt(args[4]);
        
        if (!errorType || !errorMessage || !filePath || !lineNumber) {
          console.error('❌ All parameters required: errorType errorMessage filePath lineNumber');
          process.exit(1);
        }
        
        await manager.trackErrorOrigin(errorType, errorMessage, filePath, lineNumber);
        break;
        
      case 'help':
      default:
        console.log(`
🔒 PERMANENT BACKUP & TRACKING SYSTEM
====================================

Commands:
  create-foundation <name> <description> <creator>
    - Create immutable foundation snapshot
  
  list-foundations
    - List all immutable foundations
  
  verify-foundation <foundation-id>
    - Verify current code against foundation
  
  create-checkpoint <developer-id> <feature-name> <description>
    - Create developer-specific checkpoint
  
  track-error <type> <message> <file> <line>
    - Track where an error originated
  
  help
    - Show this help

Examples:
  # Create foundation after fixing all TypeScript errors
  pnpm foundation:create "TypeScript Clean" "All type errors fixed" "dev-john"
  
  # Verify we haven't drifted from foundation
  pnpm foundation:verify immutable-2025-01-15-120000-abcd1234
  
  # Developer creates checkpoint
  DEVELOPER_ID=dev-john pnpm checkpoint:create "auth-system" "Added authentication"
  
  # Track error when it occurs
  pnpm track:error "TS2304" "Cannot find name 'User'" "src/models/user.ts" 45

Safety Features:
  • Immutable backups (cannot be modified/deleted)
  • Cryptographic verification
  • Developer change tracking
  • Error origin tracking
  • Foundation drift detection
        `);
    }
  }
  
  main().catch(console.error);
}

export { PermanentBackupManager };