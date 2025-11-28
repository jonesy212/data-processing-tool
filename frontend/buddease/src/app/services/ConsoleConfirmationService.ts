// ConsoleConfirmationService.ts
import { ConfirmationService } from '@/app/services/ConfirmationService';

export class ConsoleConfirmationService implements ConfirmationService {
  async confirm(message: string): Promise<boolean> {
    console.log(`\n❓ ${message}`);
    console.log('Type "yes" to continue or "no" to cancel:');
    
    return new Promise((resolve) => {
      const stdin = process.stdin;
      const stdout = process.stdout;
      
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');
      
      const onData = (key: string) => {
        if (key === 'y' || key === 'Y') {
          stdin.removeListener('data', onData);
          stdin.setRawMode(false);
          stdin.pause();
          resolve(true);
        } else if (key === 'n' || key === 'N') {
          stdin.removeListener('data', onData);
          stdin.setRawMode(false);
          stdin.pause();
          resolve(false);
        }
      };
      
      stdin.on('data', onData);
    });
  }

  async confirmMultiple(changes: Array<{file: string; changes: string[]}>): Promise<boolean> {
    console.log('\n📋 The following changes will be made:');
    changes.forEach(({file, changes}) => {
      console.log(`\n📁 ${file}:`);
      changes.forEach(change => console.log(`   • ${change}`));
    });

    return this.confirm(`Apply ${changes.reduce((acc, curr) => acc + curr.changes.length, 0)} import fixes?`);
  }
}