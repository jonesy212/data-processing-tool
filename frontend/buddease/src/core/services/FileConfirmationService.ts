// confirmation/FileConfirmationService.ts
import { ImportFix } from '@/core/generators/corrections/ImportFixServicies';
import { ConfirmationService } from '@/core/services/ConfirmationService';
import fs from 'fs';

export class FileConfirmationService implements ConfirmationService {
  private readonly CONFIRMATION_FILE = '.import-fixes-confirm';

  async requestConfirmation(fixes: ImportFix[]): Promise<boolean> {
    // Write changes to a file for review
    const confirmationData = {
      timestamp: new Date().toISOString(),
      totalFixes: fixes.length,
      files: this.groupFixesByFile(fixes),
      summary: this.generateSummary(fixes)
    };

    await fs.promises.writeFile(
      this.CONFIRMATION_FILE,
      JSON.stringify(confirmationData, null, 2),
      'utf8'
    );

    console.log(`\n📝 Fixes written to ${this.CONFIRMATION_FILE}`);
    console.log('Review the changes and run:');
    console.log('  npm run apply-import-fixes');
    
    return false; // Don't apply immediately
  }

  async checkConfirmation(): Promise<boolean> {
    try {
      const data = await fs.promises.readFile(this.CONFIRMATION_FILE, 'utf8');
      const confirmation = JSON.parse(data);
      
      // Check if file is recent (less than 1 hour old)
      const fileTime = new Date(confirmation.timestamp).getTime();
      const currentTime = new Date().getTime();
      
      if (currentTime - fileTime > 3600000) { // 1 hour
        console.log('Confirmation file expired');
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  cleanup() {
    try {
      fs.unlinkSync(this.CONFIRMATION_FILE);
    } catch {
      // File doesn't exist, that's fine
    }
  }

  private groupFixesByFile(fixes: ImportFix[]): any {
    const groups: any = {};
    
    fixes.forEach(fix => {
      if (!groups[fix.filePath]) {
        groups[fix.filePath] = [];
      }
      groups[fix.filePath].push({
        missingTypes: fix.missingTypes,
        originalLine: fix.originalLine,
        newLine: fix.newLine
      });
    });
    
    return groups;
  }

  private generateSummary(fixes: ImportFix[]): any {
    const typeCounts = new Map<string, number>();
    const fileCounts = new Map<string, number>();
    
    fixes.forEach(fix => {
      fix.missingTypes.forEach(type => {
        typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
      });
      fileCounts.set(fix.filePath, (fileCounts.get(fix.filePath) || 0) + 1);
    });
    
    return {
      totalFiles: fileCounts.size,
      totalFixes: fixes.length,
      topMissingTypes: Array.from(typeCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    };
  }



    async confirm(message: string): Promise<boolean> {
    // Write confirmation request to a file for batch processing
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const confirmationFile = `confirmation-${timestamp}.txt`;
    
    const content = `Confirmation Request: ${message}\nTimestamp: ${new Date().toISOString()}\n\nTo confirm, create a file named "confirm-${timestamp}" in the same directory.`;
    
    await fs.promises.writeFile(confirmationFile, content, 'utf8');
    console.log(`📝 Confirmation request written to: ${confirmationFile}`);
    
    // Wait for confirmation file to appear
    return this.waitForConfirmation(confirmationFile, timestamp);
  }

  async confirmMultiple(changes: Array<{file: string; changes: string[]}>): Promise<boolean> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const changesFile = `changes-${timestamp}.txt`;
    
    let content = `Import Fixes to Apply - ${new Date().toISOString()}\n\n`;
    changes.forEach(({file, changes}) => {
      content += `File: ${file}\n`;
      changes.forEach(change => content += `  - ${change}\n`);
      content += '\n';
    });

    content += `Total changes: ${changes.reduce((acc, curr) => acc + curr.changes.length, 0)}\n\n`;
    content += `To confirm, create a file named "confirm-${timestamp}" in the same directory.`;

    await fs.promises.writeFile(changesFile, content, 'utf8');
    console.log(`📝 Changes list written to: ${changesFile}`);
    
    return this.waitForConfirmation(changesFile, timestamp);
  }

  private async waitForConfirmation(originalFile: string, timestamp: string): Promise<boolean> {
    const confirmFile = `confirm-${timestamp}`;
    const maxWaitTime = 30000; // 30 seconds
    const checkInterval = 1000; // 1 second
    const startTime = Date.now();

    console.log(`⏳ Waiting for confirmation file: ${confirmFile}`);
    console.log('⏰ Timeout: 30 seconds');

    return new Promise((resolve) => {
      const checkForFile = () => {
        if (fs.existsSync(confirmFile)) {
          // Clean up
          fs.unlinkSync(confirmFile);
          if (fs.existsSync(originalFile)) {
            fs.unlinkSync(originalFile);
          }
          console.log('✅ Confirmation received');
          resolve(true);
        } else if (Date.now() - startTime > maxWaitTime) {
          console.log('❌ Confirmation timeout');
          if (fs.existsSync(originalFile)) {
            fs.unlinkSync(originalFile);
          }
          resolve(false);
        } else {
          setTimeout(checkForFile, checkInterval);
        }
      };

      checkForFile();
    });
  }
}