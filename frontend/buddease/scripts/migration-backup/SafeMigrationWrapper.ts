#!/usr/bin/env tsx
// SafeMigrationWrapper.ts
// scripts/migration-backup/SafeMigrationWrapper.ts

import { PreMigrationBackup } from './PreMigrationBackup';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class SafeMigrationWrapper {
  private backupManager = new PreMigrationBackup();
  
  async runWithBackup(
    migrationCommand: string,
    description: string = 'Automated script migration'
  ): Promise<MigrationResult> {
    console.log('🛡️  Starting Safe Migration');
    console.log('='.repeat(60));
    
    // Step 1: Create backup
    console.log('📦 Step 1: Creating backup...');
    const backup = await this.backupManager.createBackup(description);
    
    // Step 2: Record current git state
    console.log('\n📝 Step 2: Recording current state...');
    const gitState = this.recordGitState();
    
    // Step 3: Run migration command
    console.log(`\n⚡ Step 3: Running migration: ${migrationCommand}`);
    let migrationSuccess = false;
    let migrationOutput = '';
    let migrationError = '';
    
    try {
      const output = execSync(migrationCommand, {
        encoding: 'utf8',
        stdio: 'pipe',
        maxBuffer: 10 * 1024 * 1024
      });
      migrationOutput = output;
      migrationSuccess = true;
      console.log('✅ Migration command executed successfully');
    } catch (error: any) {
      migrationError = error.message;
      if (error.stdout) migrationOutput += error.stdout.toString();
      if (error.stderr) migrationError += error.stderr.toString();
      console.error('❌ Migration command failed:', migrationError);
    }
    
    // Step 4: Verify results
    console.log('\n🔍 Step 4: Verifying migration...');
    const verification = this.verifyMigration(backup.id);
    
    // Step 5: Generate report
    console.log('\n📊 Step 5: Generating report...');
    const report = this.generateReport({
      backup,
      migrationCommand,
      migrationSuccess,
      migrationOutput,
      migrationError,
      gitState,
      verification
    });
    
    console.log('='.repeat(60));
    console.log('🛡️  Safe Migration Complete');
    console.log(`📁 Backup ID: ${backup.id}`);
    console.log(`✅ Migration success: ${migrationSuccess}`);
    console.log(`🔍 Files moved: ${verification.filesMoved}`);
    console.log(`📄 Report: ${report.reportPath}`);
    
    if (!migrationSuccess) {
      console.log('\n⚠️  Migration failed! You can:');
      console.log(`   1. Review errors: ${report.reportPath}`);
      console.log(`   2. Rollback: pnpm migration:rollback ${backup.id}`);
      console.log(`   3. Manually fix issues and try again`);
    } else {
      console.log('\n✅ Migration successful!');
      console.log(`   📁 Check ${report.reportPath} for details`);
      console.log(`   🔄 Rollback still available if needed: pnpm migration:rollback ${backup.id}`);
    }
    
    return {
      success: migrationSuccess,
      backupId: backup.id,
      reportPath: report.reportPath,
      filesMoved: verification.filesMoved,
      errors: verification.errors
    };
  }
  
private recordGitState(): GitState {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    return {
      branch,
      commit,
      hasChanges: status.trim().length > 0,
      timestamp: new Date()
    };
  } catch (error: any) {
    return {
      branch: 'unknown',
      commit: 'unknown',
      hasChanges: false,
      timestamp: new Date(),
      error: error?.message || 'Unknown git error'
    };
  }
}

async autoRollbackOnFailure(backupId: string, error: Error): Promise<void> {
  console.log('\n⚠️  Auto-rollback triggered due to failure');
  console.log('='.repeat(60));
  
  try {
    await this.backupManager.rollback(backupId);
    
    // Log the failure and rollback
    const logPath = path.resolve('.migration-backups', backupId, 'auto-rollback.log');
    fs.writeFileSync(
      logPath,
      `Auto-rollback triggered: ${new Date().toISOString()}
      Error: ${error.message}
      Stack: ${error.stack || 'No stack trace'}
      `,
      'utf8'
    );
    
    console.log('✅ Auto-rollback completed');
  } catch (rollbackError: any) {
    console.error('❌ Auto-rollback failed:', rollbackError?.message || 'Unknown rollback error');
    throw new Error(`Migration failed and rollback also failed: ${rollbackError?.message || 'Unknown error'}`);
  }
}

  
  private verifyMigration(backupId: string): VerificationResult {
    const backupRoot = path.resolve('.migration-backups');
    const backupPath = path.join(backupRoot, backupId);
    const manifestPath = path.join(backupPath, 'manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      return { filesMoved: 0, errors: ['Backup manifest not found'] };
    }
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    let filesMoved = 0;
    const errors: string[] = [];
    
    // Check if original files still exist at old locations
    for (const file of manifest.originalStructure) {
      if (fs.existsSync(file.originalLocation)) {
        filesMoved++;
      } else {
        errors.push(`File no longer at original location: ${file.originalLocation}`);
      }
    }
    
    return { filesMoved, errors };
  }
  
  private generateReport(data: ReportData): ReportResult {
    const reportDir = path.resolve('.migration-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportDir, `migration-${timestamp}.json`);
    
    const report = {
      timestamp: new Date().toISOString(),
      ...data
    };
    
    fs.writeFileSync(
      reportPath,
      JSON.stringify(report, null, 2),
      'utf8'
    );
    
    return { reportPath };
  }
  
  async autoRollbackOnFailure(backupId: string, error: Error): Promise<void> {
    console.log('\n⚠️  Auto-rollback triggered due to failure');
    console.log('='.repeat(60));
    
    try {
      await this.backupManager.rollback(backupId);
      
      // Log the failure and rollback
      const logPath = path.resolve('.migration-backups', backupId, 'auto-rollback.log');
      fs.writeFileSync(
        logPath,
        `Auto-rollback triggered: ${new Date().toISOString()}
  Error: ${error.message}
  Stack: ${error.stack || 'No stack trace'}
  `,
        'utf8'
      );
      
      console.log('✅ Auto-rollback completed');
    } catch (rollbackError: any) {
      console.error('❌ Auto-rollback failed:', rollbackError?.message || 'Unknown rollback error');
      throw new Error(`Migration failed and rollback also failed: ${rollbackError?.message || 'Unknown error'}`);
    }
  }
}

// Supporting Types
interface GitState {
  branch: string;
  commit: string;
  hasChanges: boolean;
  timestamp: Date;
  error?: string;
}

interface VerificationResult {
  filesMoved: number;
  errors: string[];
}

interface ReportData {
  backup: any;
  migrationCommand: string;
  migrationSuccess: boolean;
  migrationOutput: string;
  migrationError: string;
  gitState: GitState;
  verification: VerificationResult;
}

interface ReportResult {
  reportPath: string;
}

interface MigrationResult {
  success: boolean;
  backupId: string;
  reportPath: string;
  filesMoved: number;
  errors: string[];
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const wrapper = new SafeMigrationWrapper();
  
  if (command === 'run') {
    const migrationCommand = args.slice(1).join(' ');
    if (!migrationCommand) {
      console.error('❌ Please specify migration command');
      console.log('Usage: pnpm migration:safe-run "<command>"');
      process.exit(1);
    }
    
    await wrapper.runWithBackup(
      migrationCommand,
      `Safe migration: ${migrationCommand}`
    );
    
  } else if (command === 'auto-rollback') {
    const backupId = args[1];
    const error = new Error(args.slice(2).join(' ') || 'Unknown error');
    
    if (!backupId) {
      console.error('❌ Please specify backup ID');
      process.exit(1);
    }
    
    await wrapper.autoRollbackOnFailure(backupId, error);
    
  } else {
    console.log(`
🛡️  Safe Migration Wrapper
===========================

Run migrations with automatic backup and rollback capability.

Commands:
  run "<command>"      - Run command with automatic backup
  auto-rollback <id>   - Auto-rollback on failure (internal use)
  help                 - Show this help

Examples:
  # Run smart organizer with backup
  pnpm migration:safe-run "pnpm script:run"
  
  # Run dry-run first
  pnpm migration:safe-run "pnpm script:dry-run"
  
  # Run category migration
  pnpm migration:safe-run "pnpm script:category type-imports"

Safety Features:
  • Automatic backup before migration
  • Git state recording
  • Verification after migration
  • Detailed report generation
  • One-command rollback if needed
      `);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SafeMigrationWrapper };