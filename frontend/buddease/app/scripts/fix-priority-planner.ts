#!/usr/bin/env tsx
// fix-priority-planner.ts - Plan the order to fix errors

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface FixPriority {
  folder: string;
  priority: number; // 1-10, 1 = highest
  errors: number;
  reason: string;
  commands: string[];
  dependsOn?: string[];
  estimatedTime: string; // "quick", "medium", "long"
}

class FixPriorityPlanner {
  async generatePlan(): Promise<FixPriority[]> {
    console.log('🎯 GENERATING FIX PRIORITY PLAN');
    console.log('='.repeat(60));
    
    // First, get the hotspots
    const hotspots = await this.getErrorHotspots();
    
    if (hotspots.length === 0) {
      console.log('🎉 No errors to fix!');
      return [];
    }
    
    // Generate priority plan
    const plan: FixPriority[] = [];
    
    hotspots.forEach((hotspot, index) => {
      const priority = this.calculatePriority(hotspot, index);
      plan.push({
        folder: hotspot.folder,
        priority: priority.score,
        errors: hotspot.errorCount,
        reason: priority.reason,
        commands: this.generateCommands(hotspot),
        dependsOn: this.getDependencies(hotspot),
        estimatedTime: this.estimateTime(hotspot)
      });
    });
    
    // Sort by priority
    plan.sort((a, b) => a.priority - b.priority);
    
    return plan;
  }
  
  private async getErrorHotspots(): Promise<any[]> {
    // Run the find-hotspots script or get data directly
    try {
      const output = execSync('npx tsc --noEmit --skipLibCheck 2>&1', {
        encoding: 'utf-8'
      });
      
      return this.parseAndGroupErrors(output);
    } catch (error: any) {
      if (error.stdout) {
        return this.parseAndGroupErrors(error.stdout.toString());
      }
      return [];
    }
  }
  
  private parseAndGroupErrors(output: string): any[] {
    const lines = output.split('\n');
    const errorsByFolder = new Map<string, any>();
    
    const errorPattern = /^(.*?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/;
    
    lines.forEach(line => {
      const match = line.match(errorPattern);
      if (match) {
        const [, file, , , code, message] = match;
        
        if (!file.includes('node_modules')) {
          const folder = this.getFolderGroup(file);
          
          if (!errorsByFolder.has(folder)) {
            errorsByFolder.set(folder, {
              folder,
              errorCount: 0,
              errorCodes: new Set<string>(),
              files: new Set<string>()
            });
          }
          
          const data = errorsByFolder.get(folder)!;
          data.errorCount++;
          data.errorCodes.add(code);
          data.files.add(file);
        }
      }
    });
    
    return Array.from(errorsByFolder.values()).map(data => ({
      ...data,
      errorCodes: Array.from(data.errorCodes),
      files: Array.from(data.files)
    }));
  }
  
  private getFolderGroup(filePath: string): string {
    const parts = filePath.split(path.sep);
    
    // Group logic
    if (parts.includes('app')) {
      const appIndex = parts.indexOf('app');
      if (appIndex + 1 < parts.length) {
        const nextPart = parts[appIndex + 1];
        if (['core', 'features', 'components', 'layouts', 'pages'].includes(nextPart)) {
          return `app/${nextPart}`;
        }
      }
      return 'app';
    } else if (parts.includes('src')) {
      return 'src';
    } else if (parts.includes('utils') || parts.includes('lib')) {
      return 'utils';
    } else if (parts.includes('types') || parts.includes('interfaces')) {
      return 'types';
    } else {
      return path.dirname(filePath);
    }
  }
  
  private calculatePriority(hotspot: any, index: number): { score: number; reason: string } {
    let score = 10 - index; // Base on order
    
    // Adjust based on folder importance
    if (hotspot.folder.includes('app/core') || hotspot.folder.includes('app/layout')) {
      score -= 3; // Higher priority
    }
    
    if (hotspot.folder.includes('utils') || hotspot.folder.includes('lib')) {
      score += 1; // Lower priority
    }
    
    // Adjust based on error types
    if (hotspot.errorCodes.includes('TS1005') || hotspot.errorCodes.includes('TS1128')) {
      score -= 2; // Syntax errors are critical
    }
    
    if (hotspot.errorCodes.includes('TS2304') || hotspot.errorCodes.includes('TS2307')) {
      score -= 1; // Import errors block other fixes
    }
    
    // Cap score between 1-10
    score = Math.max(1, Math.min(10, score));
    
    // Generate reason
    const reasons: string[] = [];
    if (index === 0) reasons.push('most errors');
    if (hotspot.folder.includes('core')) reasons.push('core functionality');
    if (hotspot.errorCodes.includes('TS1005')) reasons.push('syntax errors block everything');
    if (hotspot.errorCodes.includes('TS2304')) reasons.push('missing imports affect multiple files');
    
    return {
      score,
      reason: reasons.join(', ')
    };
  }
  
  private generateCommands(hotspot: any): string[] {
    const commands: string[] = [];
    
    // Check errors in this folder
    if (hotspot.files.length > 0) {
      const sampleFiles = hotspot.files.slice(0, 3);
      commands.push(`npx tsc --noEmit ${sampleFiles.join(' ')} 2>&1 | head -20`);
    }
    
    // Specific fix commands based on error types
    if (hotspot.errorCodes.some((code: string) => code === 'TS2304' || code === 'TS2307')) {
      commands.push('pnpm fix:types --dry-run');
    }
    
    if (hotspot.errorCodes.includes('TS1005')) {
      commands.push('# Check for missing brackets/semicolons');
      commands.push(`grep -n "TS1005" ts-errors.json | head -5`);
    }
    
    return commands;
  }
  
  private getDependencies(hotspot: any): string[] | undefined {
    const dependencies: string[] = [];
    
    // Core dependencies
    if (hotspot.folder.includes('features') && !hotspot.folder.includes('core')) {
      dependencies.push('app/core');
    }
    
    if (hotspot.folder.includes('pages') && !hotspot.folder.includes('layouts')) {
      dependencies.push('app/layouts');
    }
    
    return dependencies.length > 0 ? dependencies : undefined;
  }
  
  private estimateTime(hotspot: any): string {
    const errorCount = hotspot.errorCount;
    
    if (errorCount <= 5) return 'quick (5-15 min)';
    if (errorCount <= 15) return 'medium (15-45 min)';
    if (errorCount <= 30) return 'long (45-90 min)';
    return 'extensive (90+ min)';
  }
  
  async displayPlan(plan: FixPriority[]): Promise<void> {
    console.log('\n📋 FIX PRIORITY PLAN');
    console.log('='.repeat(60));
    
    if (plan.length === 0) {
      console.log('🎉 No fixes needed!');
      return;
    }
    
    console.log(`📊 Total areas to fix: ${plan.length}`);
    console.log('');
    
    plan.forEach((item, index) => {
      const priorityIcon = item.priority <= 3 ? '🚨' : item.priority <= 6 ? '⚠️' : '📝';
      
      console.log(`${index + 1}. ${priorityIcon} ${item.folder}`);
      console.log(`   📊 Errors: ${item.errors}`);
      console.log(`   🎯 Priority: ${item.priority}/10`);
      console.log(`   ⏱️  Estimated: ${item.estimatedTime}`);
      console.log(`   📝 Reason: ${item.reason}`);
      
      if (item.dependsOn && item.dependsOn.length > 0) {
        console.log(`   🔗 Depends on: ${item.dependsOn.join(', ')}`);
      }
      
      console.log(`   💻 Commands:`);
      item.commands.forEach((cmd, i) => {
        console.log(`      ${i + 1}. ${cmd}`);
      });
      
      console.log('');
    });
    
    // Generate summary
    console.log('📈 SUMMARY');
    console.log('='.repeat(30));
    
    const totalErrors = plan.reduce((sum, item) => sum + item.errors, 0);
    const quickWins = plan.filter(item => item.estimatedTime.includes('quick')).length;
    const highPriority = plan.filter(item => item.priority <= 3).length;
    
    console.log(`• Total errors to fix: ${totalErrors}`);
    console.log(`• Quick wins available: ${quickWins}`);
    console.log(`• High priority areas: ${highPriority}`);
    console.log(`• Start with: ${plan[0]?.folder || 'none'}`);
    console.log('');
    
    // Save plan to file
    await this.savePlanToFile(plan);
  }
  
  private async savePlanToFile(plan: FixPriority[]): Promise<void> {
    const planDir = path.join(process.cwd(), 'reports', 'fix-plans');
    
    if (!fs.existsSync(planDir)) {
      fs.mkdirSync(planDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const planFile = path.join(planDir, `fix-priority-${timestamp}.json`);
    
    fs.writeFileSync(planFile, JSON.stringify({
      generated: new Date().toISOString(),
      totalAreas: plan.length,
      totalErrors: plan.reduce((sum, item) => sum + item.errors, 0),
      plan: plan
    }, null, 2));
    
    console.log(`📄 Plan saved: ${planFile}`);
    
    // Also create executable script
    await this.createFixScript(plan, planDir, timestamp);
  }
  
  private async createFixScript(plan: FixPriority[], planDir: string, timestamp: string): Promise<void> {
    const scriptFile = path.join(planDir, `fix-execute-${timestamp}.sh`);
    
    const lines: string[] = [];
    lines.push('#!/bin/bash');
    lines.push('# Auto-generated fix script');
    lines.push(`# Created: ${new Date().toISOString()}`);
    lines.push('');
    lines.push('echo "🔧 EXECUTING FIX PRIORITY PLAN"');
    lines.push('echo "================================"');
    lines.push('');
    
    plan.forEach((item, index) => {
      lines.push(`echo "${index + 1}. Fixing ${item.folder} (${item.errors} errors)"`);
      lines.push(`echo "   Priority: ${item.priority}/10, Estimated: ${item.estimatedTime}"`);
      lines.push('');
      
      item.commands.forEach((cmd, i) => {
        if (!cmd.startsWith('#')) {
          lines.push(`echo "   Running: ${cmd}"`);
          lines.push(`${cmd}`);
          lines.push('');
        }
      });
      
      lines.push('echo "✅ Done with ${item.folder}"');
      lines.push('echo ""');
    });
    
    lines.push('echo "🎉 All fixes completed!"');
    
    fs.writeFileSync(scriptFile, lines.join('\n'));
    fs.chmodSync(scriptFile, '755');
    
    console.log(`📜 Fix script generated: ${scriptFile}`);
    console.log(`   Run: bash ${scriptFile}`);
  }
}

// Main execution
async function main() {
  const planner = new FixPriorityPlanner();
  
  const plan = await planner.generatePlan();
  await planner.displayPlan(plan);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
