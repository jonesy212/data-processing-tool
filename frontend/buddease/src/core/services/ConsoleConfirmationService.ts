// ConsoleConfirmationService.ts
import type { ConfirmationService } from '@/core/services/ConfirmationService';
import path from 'path';

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
      console.log('\n📋 CONSOLIDATING HEADERS IMPORTS');
      console.log('='.repeat(50));
      console.log('Rationale: headersConfig should be imported from the canonical');
      console.log('source (SharedHeaders.ts) rather than internal HeadersConfig.tsx');
      console.log('='.repeat(50));
      
      changes.forEach(({file, changes}) => {
          const relativePath = path.relative(process.cwd(), file);
          console.log(`\n📁 ${relativePath}:`);
          changes.forEach(change => {
              if (change.includes('headersConfig')) {
                  console.log(`   • Consolidate: ${change.replace('Move', 'Use canonical')}`);
              } else {
                  console.log(`   • ${change}`);
              }
          });
      });

      const totalChanges = changes.reduce((acc, curr) => acc + curr.changes.length, 0);
      return this.confirm(`Consolidate ${totalChanges} imports to use canonical headersConfig source?`);
  }
}