// scripts/sync-configs-with-backup.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { generateAliases } = require('../configs/alias-config');

class ConfigSyncWithBackup {
  constructor() {
    this.backupDir = path.join(__dirname, '..', '.config-backups');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.originalHashes = new Map();
  }

  // Create backup before making changes
  createBackup() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    const configFiles = [
      'tsconfig.json',
      'babel.config.js', 
      'vitest.config.js',
      'jest.config.js'
    ];

    console.log('📦 Creating backups...');
    
    configFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        const backupPath = path.join(this.backupDir, `${this.timestamp}-${file}`);
        fs.copyFileSync(filePath, backupPath);
        console.log(`   ✅ Backed up ${file}`);
        
        // Store original content hash for validation
        const content = fs.readFileSync(filePath, 'utf8');
        this.originalHashes.set(file, this.hashContent(content));
      }
    });

    // Create backup manifest
    const manifest = {
      timestamp: this.timestamp,
      files: configFiles.filter(file => fs.existsSync(path.join(__dirname, '..', file))),
      originalHashes: Object.fromEntries(this.originalHashes)
    };

    fs.writeFileSync(
      path.join(this.backupDir, `${this.timestamp}-manifest.json`),
      JSON.stringify(manifest, null, 2)
    );
  }

  // Rollback to previous state
  rollback(specificTimestamp = null) {
    const backups = fs.readdirSync(this.backupDir)
      .filter(file => file.endsWith('-manifest.json'))
      .sort()
      .reverse();

    if (backups.length === 0) {
      console.log('❌ No backups found to rollback to');
      return false;
    }

    const targetBackup = specificTimestamp 
      ? backups.find(backup => backup.includes(specificTimestamp))
      : backups[0]; // Use latest backup

    if (!targetBackup) {
      console.log(`❌ Backup for timestamp ${specificTimestamp} not found`);
      return false;
    }

    const manifestPath = path.join(this.backupDir, targetBackup);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const timestamp = manifest.timestamp;

    console.log(`🔄 Rolling back to backup: ${timestamp}`);

    manifest.files.forEach(file => {
      const backupPath = path.join(this.backupDir, `${timestamp}-${file}`);
      const originalPath = path.join(__dirname, '..', file);

      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, originalPath);
        console.log(`   ✅ Restored ${file}`);
      }
    });

    console.log('🎉 Rollback completed successfully!');
    return true;
  }

  // List available backups
  listBackups() {
    if (!fs.existsSync(this.backupDir)) {
      console.log('No backups available');
      return;
    }

    const backups = fs.readdirSync(this.backupDir)
      .filter(file => file.endsWith('-manifest.json'))
      .sort()
      .reverse();

    console.log('📚 Available backups:');
    backups.forEach(backup => {
      const timestamp = backup.replace('-manifest.json', '');
      const manifest = JSON.parse(fs.readFileSync(path.join(this.backupDir, backup), 'utf8'));
      console.log(`   📅 ${timestamp} - ${manifest.files.length} files`);
    });
  }

  // Verify current configs match expected state
  verifySync() {
    const configFiles = ['tsconfig.json', 'babel.config.js', 'vitest.config.js', 'jest.config.js'];
    let allValid = true;

    console.log('🔍 Verifying configuration sync...');

    configFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const aliases = Object.keys(require('../configs/alias-config').ALIASES);
        
        const missingAliases = aliases.filter(alias => !content.includes(alias));
        if (missingAliases.length > 0) {
          console.log(`   ❌ ${file}: Missing ${missingAliases.length} aliases`);
          allValid = false;
        } else {
          console.log(`   ✅ ${file}: All aliases present`);
        }
      }
    });

    return allValid;
  }

  // Utility function
  hashContent(content) {
    // Simple hash for content comparison
    return require('crypto').createHash('md5').update(content).digest('hex');
  }

  // Main sync with backup
  sync() {
    console.log('🔄 Starting configuration sync with backup...');
    
    // Create backup first
    this.createBackup();
    
    // Then run the sync (using your existing sync logic)
    try {
      require('./sync-configs-modified').runSync();
      console.log('✅ Sync completed successfully');
      
      // Verify the sync
      if (this.verifySync()) {
        console.log('🎉 All configurations verified and synchronized!');
      } else {
        console.log('⚠️  Sync completed but verification failed. Consider rolling back.');
      }
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
      console.log('🔄 Attempting automatic rollback...');
      this.rollback();
    }
  }
}

// Export for CLI usage
module.exports = ConfigSyncWithBackup;