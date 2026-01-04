confirmation/InteractiveConfirmationService.ts
import { ImportFix } from '@/core/generators/corrections/ImportFixServicies';
import { ConfirmationService } from '@/core/services/ConfirmationService';
import { ConsoleConfirmationService } from '@/core/services/ConsoleConfirmationService';

import chalk from 'chalk';
import path from 'path';
import readline from 'readline';

export class InteractiveConfirmationService implements ConfirmationService {
  private rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  async confirmWithPreview(fixes: ImportFix[]): Promise<boolean> {
    console.log(chalk.yellow('\n🔍 IMPORT FIXES PREVIEW'));
    console.log(chalk.yellow('='.repeat(50)));
    
    fixes.forEach((fix, index) => {
      console.log(`\n${chalk.blue(`${index + 1}. ${path.basename(fix.filePath)}`)}`);
      
      if (fix.originalLine) {
        console.log(chalk.red('   ┌ BEFORE:'));
        console.log(chalk.red(`   │ ${fix.originalLine}`));
      } else {
        console.log(chalk.green('   ┌ NEW IMPORT:'));
      }
      
      console.log(chalk.green('   └ AFTER:'));
      console.log(chalk.green(`     ${fix.newLine}`));
    });

    console.log(chalk.yellow('\nOptions:'));
    console.log('  [a] Apply all fixes');
    console.log('  [s] Show file by file');
    console.log('  [c] Cancel');

    return new Promise((resolve) => {
      this.rl.question('\nChoose an option: ', (answer) => {
        switch (answer.toLowerCase()) {
          case 'a':
            resolve(true);
            break;
          case 's':
            this.showFileByFile(fixes).then(resolve);
            break;
          case 'c':
            resolve(false);
            break;
          default:
            console.log(chalk.red('Invalid option'));
            this.confirmWithPreview(fixes).then(resolve);
        }
      });
    });
  }

  private async showFileByFile(fixes: ImportFix[]): Promise<boolean> {
    const fileGroups = this.groupFixesByFile(fixes);
    let allApproved = true;

    for (const [filePath, fileFixes] of fileGroups) {
      console.log(chalk.blue(`\n📁 File: ${filePath}`));
      
      fileFixes.forEach((fix, index) => {
        console.log(`\n   ${chalk.yellow(`Fix ${index + 1}:`)}`);
        if (fix.originalLine) {
          console.log(chalk.red(`   - Remove: ${fix.originalLine}`));
        }
        console.log(chalk.green(`   + Add: ${fix.newLine}`));
      });

      const approved = await new Promise<boolean>((resolve) => {
        this.rl.question('\nApply these fixes? [y/n/skip]: ', (answer) => {
          resolve(answer.toLowerCase() === 'y');
        });
      });

      if (!approved) {
        allApproved = false;
        break;
      }
    }

    return allApproved;
  }

    async confirm(message: string): Promise<boolean> {
      // Implement interactive confirmation (could use inquirer.js or similar)
      console.log(`\n🔄 Interactive: ${message}`);
      // For now, use console confirmation as fallback
      const consoleService = new ConsoleConfirmationService();
      return consoleService.confirm(message);
    }

    async confirmMultiple(changes: Array<{file: string; changes: string[]}>): Promise<boolean> {
      console.log('\n📋 Interactive - The following changes will be made:');
      changes.forEach(({file, changes}) => {
        console.log(`\n📁 ${file}:`);
        changes.forEach(change => console.log(`   • ${change}`));
      });

      return this.confirm(`Apply ${changes.reduce((acc, curr) => acc + curr.changes.length, 0)} import fixes?`);
    }

  private groupFixesByFile(fixes: ImportFix[]): Map<string, ImportFix[]> {
    const groups = new Map<string, ImportFix[]>();
    
    fixes.forEach(fix => {
      if (!groups.has(fix.filePath)) {
        groups.set(fix.filePath, []);
      }
      groups.get(fix.filePath)!.push(fix);
    });
    
    return groups;
  }

  close() {
    this.rl.close();
  }
}