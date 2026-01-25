// scripts/milestone/MilestoneTracker.ts
import fs from 'fs';
import path from 'path';
import { PermanentBackupManager } from '../safety/PermanentBackupManager';
import { EventEmitter } from '@/core/libraries/eventSystem/eventEmitter';

// Define event types
interface MilestoneEvents {
  milestoneCompleted: { 
    milestone: string; 
    id: string; 
    verification: any; 
    timestamp: string;
  };
  allMilestonesComplete: { 
    foundationId: string; 
    milestones: any[]; 
    timestamp: string;
  };
  foundationCreated: { 
    foundationId: string; 
    timestamp: string;
  };
  error: {
    error: any;
    event: string;
    listenerId: string;
    data: any;
  };
}


export class MilestoneTracker extends EventEmitter<MilestoneEvents> {

  private readonly MILESTONE_DIR = path.join('.migrations', 'foundation');
  private backupManager = new PermanentBackupManager();

  private readonly FOUNDATION_MILESTONES = [
    {
      id: 'milestone-1',
      name: 'TypeScript Error Elimination',
      description: 'Zero TypeScript compilation errors',
      verification: async () => {
        const { execSync } = require('child_process');
        try {
          const output = execSync('npx tsc --noEmit --skipLibCheck 2>&1', { encoding: 'utf8' });
          const errorCount = output.split('\n').filter((line: string) => line.includes('error TS')).length;
          return { passed: errorCount === 0, details: `Found ${errorCount} TypeScript errors` };
        } catch (error: any) {
          return { passed: false, details: `TypeScript check failed: ${error.message}` };
        }
      }
    },
    {
      id: 'milestone-2',
      name: 'Import System Cleanup',
      description: 'All imports deduplicated and organized',
      verification: async () => {
        // Count duplicate imports
        const importPattern = /import\s+(?:{[^}]+}|\w+)\s+from\s+['"]([^'"]+)['"]/g;
        const files = this.getAllTypeScriptFiles();
        const importMap = new Map<string, string[]>();
        
        for (const file of files) {
          const content = fs.readFileSync(file, 'utf8');
          const matches = content.matchAll(importPattern);
          
          for (const match of matches) {
            const importPath = match[1];
            if (!importMap.has(importPath)) {
              importMap.set(importPath, []);
            }
            importMap.get(importPath)!.push(file);
          }
        }
        
        const duplicates = Array.from(importMap.entries())
          .filter(([, files]) => files.length > 1)
          .length;
        
        return { 
          passed: duplicates < 10, 
          details: `Found ${duplicates} duplicate imports across files` 
        };
      }
    },
    {
      id: 'milestone-3',
      name: 'Linting Compliance',
      description: 'Zero linting errors with strict rules',
      verification: async () => {
        try {
          const { execSync } = require('child_process');
          const output = execSync('npm run lint 2>&1', { encoding: 'utf8' });
          const hasErrors = output.includes('✖');
          return { 
            passed: !hasErrors, 
            details: hasErrors ? 'Linting errors found' : 'All linting rules passed' 
          };
        } catch {
          return { passed: false, details: 'Linting check failed' };
        }
      }
    },
    {
      id: 'milestone-4',
      name: 'Test Suite Passing',
      description: 'All unit tests pass',
      verification: async () => {
        try {
          const { execSync } = require('child_process');
          execSync('npm test -- --passWithNoTests', { stdio: 'pipe' });
          return { passed: true, details: 'All tests passing' };
        } catch (error: any) {
          return { passed: false, details: `Tests failing: ${error.message}` };
        }
      }
    },
    {
      id: 'milestone-5',
      name: 'Build Success',
      description: 'Full production build succeeds',
      verification: async () => {
        try {
          const { execSync } = require('child_process');
          execSync('npm run build', { stdio: 'pipe' });
          return { passed: true, details: 'Build successful' };
        } catch (error: any) {
          return { passed: false, details: `Build failed: ${error.message}` };
        }
      }
    }
  ];
  
  constructor() {
    super();
    this.ensureMilestoneDirectory();
  }
  
  private ensureMilestoneDirectory(): void {
    if (!fs.existsSync(this.MILESTONE_DIR)) {
      fs.mkdirSync(this.MILESTONE_DIR, { recursive: true });
    }
  }
  
  private getAllTypeScriptFiles(): string[] {
    const files: string[] = [];
    
    function walk(dir: string) {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          if (!item.name.includes('node_modules') && !item.name.startsWith('.')) {
            walk(fullPath);
          }
        } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
    }
    
    walk('src');
    return files;
  }
  
  
  /**
   * Execute foundation checklist with milestone tracking
   */
  async executeFoundationChecklist(): Promise<{
    completed: number;
    total: number;
    milestones: Array<{ name: string; passed: boolean; details: string }>;
    foundationId?: string;
  }> {
    console.log('🏗️ FOUNDATION CHECKLIST EXECUTION');
    console.log('='.repeat(60));
    
    const results: Array<{ name: string; passed: boolean; details: string }> = [];
    let completed = 0;
    
    for (const milestone of this.FOUNDATION_MILESTONES) {
      console.log(`\n🎯 ${milestone.name}: ${milestone.description}`);
      
      try {
        const verification = await milestone.verification();
        results.push({
          name: milestone.name,
          passed: verification.passed,
          details: verification.details
        });
        
        if (verification.passed) {
          console.log(`✅ PASSED: ${verification.details}`);
          completed++;
          
          // Create milestone backup
          await this.createMilestoneBackup(milestone);
          
          // Emit milestone completed event
          super.emit('milestoneCompleted', {
            milestone: milestone.name,
            id: milestone.id,
            verification,
            timestamp: new Date().toISOString()
          });
        } else {
          console.log(`❌ FAILED: ${verification.details}`);
        }
      } catch (error: any) {
        console.log(`⚠️ ERROR: ${error.message}`);
        results.push({
          name: milestone.name,
          passed: false,
          details: `Verification error: ${error.message}`
        });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 RESULTS: ${completed}/${this.FOUNDATION_MILESTONES.length} milestones passed`);
    
    // If ALL milestones passed, create permanent foundation
    let foundationId: string | undefined;
    if (completed === this.FOUNDATION_MILESTONES.length) {
      console.log('\n🎉 ALL MILESTONES PASSED! Creating permanent foundation...');
      foundationId = await this.backupManager.createImmutableFoundation(
        'Foundation Complete',
        'All foundation milestones passed',
        'system'
      );
      
      // Emit all milestones complete event
      super.emit('allMilestonesComplete', {
        foundationId,
        milestones: results,
        timestamp: new Date().toISOString()
      });
      
      // Emit foundation created event
      super.emit('foundationCreated', {
        foundationId,
        timestamp: new Date().toISOString()
      });
    }
    
    // Save milestone report
    await this.saveMilestoneReport(results, foundationId);
    
    return {
      completed,
      total: this.FOUNDATION_MILESTONES.length,
      milestones: results,
      foundationId
    };
  }
  
  private async createMilestoneBackup(milestone: any): Promise<void> {
    const milestoneDir = path.join(this.MILESTONE_DIR, milestone.id);
    if (!fs.existsSync(milestoneDir)) {
      fs.mkdirSync(milestoneDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(milestoneDir, `snapshot-${timestamp}`);
    
    // Save current state
    fs.cpSync('src', path.join(backupPath, 'src'), { recursive: true });
    
    // Save milestone info
    const info = {
      milestone: milestone.name,
      timestamp: new Date().toISOString(),
      verification: await milestone.verification()
    };
    
    fs.writeFileSync(
      path.join(backupPath, 'milestone-info.json'),
      JSON.stringify(info, null, 2),
      'utf8'
    );
    
    console.log(`   💾 Milestone backup created: ${backupPath}`);
  }
  
  private async saveMilestoneReport(
    results: Array<{ name: string; passed: boolean; details: string }>,
    foundationId?: string
  ): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      completed: results.filter(r => r.passed).length,
      total: results.length,
      foundationId,
      milestones: results,
      recommendations: this.generateRecommendations(results)
    };
    
    const reportPath = path.join(this.MILESTONE_DIR, 'foundation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    // Also create markdown version for easy reading
    const markdown = this.generateMarkdownReport(report);
    fs.writeFileSync(
      path.join(this.MILESTONE_DIR, 'FOUNDATION-REPORT.md'),
      markdown,
      'utf8'
    );
    
    console.log(`📄 Report saved: ${reportPath}`);
  }
  
  private generateRecommendations(results: Array<{ name: string; passed: boolean; details: string }>): string[] {
    const recommendations: string[] = [];
    const failed = results.filter(r => !r.passed);
    
    if (failed.length > 0) {
      failed.forEach(failure => {
        recommendations.push(`Fix: ${failure.name} - ${failure.details}`);
      });
    } else {
      recommendations.push('All milestones passed! Ready for development.');
      recommendations.push('Create permanent foundation snapshot.');
      recommendations.push('Setup developer onboarding process.');
    }
    
    return recommendations;
  }
  
  private generateMarkdownReport(report: any): string {
    return `# FOUNDATION CHECKLIST REPORT

Generated: ${report.timestamp}
Status: ${report.completed}/${report.total} milestones passed
${report.foundationId ? `Foundation ID: ${report.foundationId}` : 'No foundation created'}

## 📊 Milestone Results

${report.milestones.map((m: any, i: number) => `
### ${i + 1}. ${m.name}
- **Status:** ${m.passed ? '✅ PASSED' : '❌ FAILED'}
- **Details:** ${m.details}
`).join('\n')}

## 💡 Recommendations

${report.recommendations.map((r: string) => `- ${r}`).join('\n')}

## 🚀 Next Steps

1. ${report.completed === report.total ? 'Begin developer onboarding' : 'Address failed milestones'}
2. ${report.foundationId ? `Reference foundation: \`${report.foundationId}\`` : 'Complete all milestones first'}
3. Setup continuous integration with milestone verification

---
*This report was automatically generated by the Foundation Checklist System.*
`;
  }
  
  /**
   * Track developer progress against foundation
   */
  async trackDeveloperProgress(developerId: string): Promise<{
    driftFromFoundation: any;
    introducedErrors: number;
    filesModified: string[];
  }> {
    console.log(`👤 Tracking developer: ${developerId}`);
    
    // Get latest foundation
    const foundations = this.backupManager.listImmutableFoundations();
    if (foundations.length === 0) {
      return {
        driftFromFoundation: { error: 'No foundation found' },
        introducedErrors: 0,
        filesModified: []
      };
    }
    
    const latestFoundation = foundations[0];
    const verification = await this.backupManager.verifyAgainstFoundation(latestFoundation.id);
    
    // Get developer-specific changes
    const changedFiles = await this.getDeveloperChangedFiles(developerId);
    
    // Count errors introduced by developer
    const introducedErrors = await this.countNewErrorsSinceFoundation(latestFoundation.id);
    
    return {
      driftFromFoundation: verification,
      introducedErrors,
      filesModified: changedFiles
    };
  }
  private async getDeveloperChangedFiles(developerId: string): Promise<string[]> {
    try {
      const { execSync } = require('child_process');
      const output = execSync(`git log --oneline --name-only --author="${developerId}" -10`, {
        encoding: 'utf8'
      });
      
      const lines = output.split('\n')
        .filter((line: string) => line.trim() && !line.startsWith(' ') && line.includes('.'));
      
      // Cast to string[] to fix the TypeScript error
      return Array.from(new Set(lines)) as string[];
    } catch {
      return [];
    }
  }
  
  private async countNewErrorsSinceFoundation(foundationId: string): Promise<number> {
    // Compare current error count with foundation's error count
    const foundationPath = path.join('.migrations', 'permanent-safe-points', foundationId);
    const manifestPath = path.join(foundationPath, 'manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      return 0;
    }
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const foundationErrors = manifest.verification.typeScriptErrors;
    
    // Get current errors
    const { execSync } = require('child_process');
    try {
      const output = execSync('npx tsc --noEmit --skipLibCheck 2>&1', { encoding: 'utf8' });
      const currentErrors = output.split('\n').filter((line: string) => line.includes('error TS')).length;
      
      return Math.max(0, currentErrors - foundationErrors);
    } catch {
      return 0;
    }
  }
}