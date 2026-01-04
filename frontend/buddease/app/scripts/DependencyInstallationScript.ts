// DependencyInstallationScript.ts

import { ProjectConfig } from '@/core/config/ProjectConfig';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class DependencyInstallationScript {
  async execute(projectConfig: ProjectConfig): Promise<void> {
    console.log('🚀 Starting dependency installation...');
    
    try {
      // Create package.json if it doesn't exist
      await this.createPackageJson(projectConfig);
      
      // Install required dependencies
      await this.installDependencies(projectConfig);
      
      // Install optional dependencies based on features
      await this.installFeatureDependencies(projectConfig);
      
      // Install dev dependencies
      await this.installDevDependencies(projectConfig);
      
      console.log('✅ Dependency installation completed successfully!');
    } catch (error) {
      console.error('❌ Dependency installation failed:', error);
      throw error;
    }
  }

  private async createPackageJson(projectConfig: ProjectConfig): Promise<void> {
    const packageJsonPath = path.join(projectConfig.projectPath, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      const packageJson = {
        name: projectConfig.projectName,
        version: '1.0.0',
        description: `Auto-generated project: ${projectConfig.projectName}`,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          test: 'jest',
          lint: 'eslint . --ext .ts,.tsx,.js,.jsx',
          typecheck: 'tsc --noEmit'
        },
        dependencies: {},
        devDependencies: {}
      };
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('📄 Created package.json');
    }
  }

  private async installDependencies(projectConfig: ProjectConfig): Promise<void> {
    const { packageManager } = projectConfig;
    const installCommand = this.getInstallCommand(packageManager);
    
    // Core dependencies
    const coreDeps = [
      'react', 'react-dom', 'next',
      'typescript', '@types/react', '@types/node'
    ];
    
    console.log('📦 Installing core dependencies...');
    await execAsync(`${installCommand} ${coreDeps.join(' ')}`, {
      cwd: projectConfig.projectPath
    });
  }

    private async installFeatureDependencies(projectConfig: ProjectConfig): Promise<void> {
    const { packageManager, features } = projectConfig;
    const installCommand = this.getInstallCommand(packageManager);
    const featureDeps: string[] = [];

    // Your specific dependencies
    if (features.authentication) {
        featureDeps.push('next-auth', 'bcryptjs', 'jsonwebtoken', '@types/jsonwebtoken');
    }

    if (features.database) {
        switch (projectConfig.database) {
        case 'postgresql':
            featureDeps.push('pg', '@types/pg');
            break;
        case 'mongodb':
            featureDeps.push('mongoose', '@types/mongoose');
            break;
        }
    }

    if (features.api) {
        featureDeps.push('axios');
    }

    // Add your specific UI and utility dependencies
    featureDeps.push(
        'antd',
        '@ant-design/icons',
        'react-icons',
        'chart.js',
        'react-chartjs-2',
        'date-fns',
        'lodash',
        '@types/lodash',
        'clsx',
        'tailwind-merge'
    );

    // Web3 dependencies
    featureDeps.push('ethers', 'web3');

    if (featureDeps.length > 0) {
        console.log('🔧 Installing feature dependencies...');
        await execAsync(`${installCommand} ${featureDeps.join(' ')}`, {
        cwd: projectConfig.projectPath
        });
    }
    }

  private async installDevDependencies(projectConfig: ProjectConfig): Promise<void> {
    const { packageManager } = projectConfig;
    const installCommand = `${this.getInstallCommand(packageManager)} -D`;
    
    const devDeps = [
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      'eslint',
      'prettier',
      'jest',
      '@testing-library/react',
      '@testing-library/jest-dom'
    ];
    
    console.log('🔧 Installing dev dependencies...');
    await execAsync(`${installCommand} ${devDeps.join(' ')}`, {
      cwd: projectConfig.projectPath
    });
  }

  private getInstallCommand(packageManager: string): string {
    switch (packageManager) {
      case 'yarn': return 'yarn add';
      case 'pnpm': return 'pnpm add';
      default: return 'npm install';
    }
  }
}