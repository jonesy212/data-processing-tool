// BuildErrorHandler.ts
import { ErrorReporter } from '@/utils/ErrorReporter';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class BuildErrorHandler {
  static async analyzeAndFixBuild(): Promise<boolean> {
    try {
      console.log('🔧 Running build to analyze errors...');
      
      // Try to build the project
      const { stderr } = await execAsync('pnpm build', {
        cwd: process.cwd()
      }).catch(error => ({ 
        stderr: error.stderr || error.message 
      }));

      if (stderr) {
        console.log('\n📋 Build errors detected, analyzing...');
        ErrorReporter.printQuickFixSummary(stderr);
        
        // Generate detailed report
        const reportFile = await ErrorReporter.generateErrorReport(stderr);
        console.log(`\n📄 Detailed error report: ${reportFile}`);
        
        return false; // Build failed
      }
      
      console.log('✅ Build successful - no errors found');
      return true;
      
    } catch (error) {
      console.error('❌ Error during build analysis:', error);
      return false;
    }
  }

  static async handleTypeCheck(): Promise<void> {
    try {
      console.log('🔍 Running TypeScript type check...');
      
      const { stderr } = await execAsync('npx tsc --noEmit --skipLibCheck', {
        cwd: process.cwd()
      }).catch(error => ({ 
        stderr: error.stderr || error.message 
      }));

      if (stderr) {
        console.log('\n📋 TypeScript errors detected:');
        ErrorReporter.printQuickFixSummary(stderr);
        
        const reportFile = await ErrorReporter.generateErrorReport(stderr, './type-error-reports');
        console.log(`📄 Type error report: ${reportFile}`);
      } else {
        console.log('✅ No TypeScript errors found');
      }
      
    } catch (error) {
      console.error('❌ Error during type check:', error);
    }
  }
}