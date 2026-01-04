// scripts/QualityChecksScript.ts
import type { ProjectConfig } from '@/core/config/ProjectConfig';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class QualityChecksScript {
  async execute(projectConfig: ProjectConfig): Promise<void> {
    console.log('🔍 Running quality checks...');
    
    try {
      // TypeScript type checking
      await this.runTypeCheck(projectConfig);
      
      // ESLint code linting
      await this.runLinter(projectConfig);
      
      // Code formatting check
      await this.runFormatCheck(projectConfig);
      
      // Security audit
      await this.runSecurityAudit(projectConfig);
      
      // Test setup verification
      await this.verifyTestSetup(projectConfig);
      
      // Build verification
      await this.verifyBuild(projectConfig);
      
      console.log('✅ All quality checks passed!');
    } catch (error) {
      console.error('❌ Quality checks failed:', error);
      throw error;
    }
  }

  private async runTypeCheck(projectConfig: ProjectConfig): Promise<void> {
    console.log('📝 Running TypeScript type check...');
    
    try {
      await execAsync('npx tsc --noEmit', {
        cwd: projectConfig.projectPath
      });
      console.log('✅ TypeScript type check passed');
    } catch (error) {
      console.error('❌ TypeScript errors found:');
      throw new Error('TypeScript compilation failed');
    }
  }

  private async runLinter(projectConfig: ProjectConfig): Promise<void> {
    console.log('🔦 Running ESLint...');
    
    try {
      await execAsync('npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings=0', {
        cwd: projectConfig.projectPath
      });
      console.log('✅ ESLint check passed');
    } catch (error) {
      console.error('❌ ESLint errors found:');
      throw new Error('ESLint validation failed');
    }
  }

  private async runFormatCheck(projectConfig: ProjectConfig): Promise<void> {
    console.log('🎨 Checking code formatting...');
    
    try {
      await execAsync('npx prettier --check .', {
        cwd: projectConfig.projectPath
      });
      console.log('✅ Code formatting check passed');
    } catch (error) {
      console.error('❌ Code formatting issues found');
      throw new Error('Prettier formatting check failed');
    }
  }

  private async runSecurityAudit(projectConfig: ProjectConfig): Promise<void> {
    console.log('🔒 Running security audit...');
    
    try {
      await execAsync('npm audit --audit-level moderate', {
        cwd: projectConfig.projectPath
      });
      console.log('✅ Security audit passed');
    } catch (error) {
      console.warn('⚠️ Security vulnerabilities found (continuing anyway)');
      // Don't throw for security audit - just warn
    }
  }

  private async verifyTestSetup(projectConfig: ProjectConfig): Promise<void> {
    console.log('🧪 Verifying test setup...');
    
    if (projectConfig.features.testing) {
      try {
        // Create a simple test to verify setup
        const testContent = `import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home Page', () => {
  it('renders welcome message', () => {
    render(<Home />);
    expect(screen.getByText(/Welcome to/)).toBeInTheDocument();
  });
});`;

        const testDir = path.join(projectConfig.projectPath, '__tests__');
        if (!fs.existsSync(testDir)) {
          fs.mkdirSync(testDir, { recursive: true });
        }
        
        fs.writeFileSync(path.join(testDir, 'home.test.tsx'), testContent);
        
        // Run tests
        await execAsync('npx jest --passWithNoTests', {
          cwd: projectConfig.projectPath
        });
        
        console.log('✅ Test setup verified');
      } catch (error) {
        console.error('❌ Test setup verification failed');
        throw new Error('Test setup verification failed');
      }
    } else {
      console.log('⏭️ Testing disabled, skipping test setup verification');
    }
  }

  private async verifyBuild(projectConfig: ProjectConfig): Promise<void> {
    console.log('🏗️ Verifying build process...');
    
    try {
      await execAsync('npm run build', {
        cwd: projectConfig.projectPath
      });
      console.log('✅ Build verification passed');
    } catch (error) {
      console.error('❌ Build verification failed');
      throw new Error('Build process verification failed');
    }
  }
}