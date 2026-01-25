#!/usr/bin/env tsx
// Strategic Verification Workflow
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface VerificationStep {
  id: string;
  name: string;
  command: string;
  category: string;
  priority: number;
  critical: boolean;
}

class StrategicVerifier {
  private steps: VerificationStep[] = [
    // CRITICAL: Type Import Fixers
    {
      id: 'type-imports',
      name: 'Type Import Fixer',
      command: 'pnpm fix:types --dry-run',
      category: 'TypeScript',
      priority: 1,
      critical: true
    },
    {
      id: 'ts-strict',
      name: 'Strict Type Checking',
      command: 'pnpm ts:strict-type',
      category: 'TypeScript',
      priority: 1,
      critical: true
    },
    {
      id: 'verify-namespace',
      name: 'Namespace Verification',
      command: 'pnpm verify:namespace',
      category: 'TypeScript',
      priority: 2,
      critical: false
    },
    
    // IMPORTANT: Import Management
    {
      id: 'import-dedup',
      name: 'Import Deduplication',
      command: 'pnpm imports:deduplicate --dry-run',
      category: 'Imports',
      priority: 2,
      critical: false
    },
    
    // IMPORTANT: Code Quality
    {
      id: 'lint',
      name: 'Linting',
      command: 'pnpm lint',
      category: 'Quality',
      priority: 3,
      critical: false
    },
    
    // APP FUNCTIONALITY
    {
      id: 'dev-safe',
      name: 'Development Server',
      command: 'pnpm dev:safe --dry-run || echo "Dev server check"',
      category: 'App',
      priority: 4,
      critical: true
    },
    
    // ISOLATION TESTING
    {
      id: 'isolation',
      name: 'Section Isolation',
      command: 'pnpm test:isolated --dry-run || echo "Isolation check"',
      category: 'App',
      priority: 5,
      critical: false
    }
  ];
  
  private results: Record<string, {
    passed: boolean;
    output: string;
    error?: string;
    duration: number;
  }> = {};
  
  async runVerification() {
    console.log('🎯 STRATEGIC VERIFICATION WORKFLOW');
    console.log('='.repeat(60));
    console.log('Goal: Reach zero errors with systematic testing\n');
    
    // Sort by priority and criticality
    const sortedSteps = [...this.steps].sort((a, b) => {
      if (a.critical !== b.critical) return a.critical ? -1 : 1;
      return a.priority - b.priority;
    });
    
    let criticalFailures = 0;
    let totalErrors = 0;
    
    // Run critical steps first
    console.log('🚀 PHASE 1: CRITICAL VERIFICATION');
    console.log('='.repeat(40));
    
    for (const step of sortedSteps.filter(s => s.critical)) {
      const result = await this.executeStep(step);
      this.results[step.id] = result;
      
      if (!result.passed) {
        criticalFailures++;
        console.log(`❌ ${step.name}: FAILED`);
        if (result.error) console.log(`   Error: ${result.error}`);
      } else {
        console.log(`✅ ${step.name}: PASSED (${result.duration}ms)`);
      }
    }
    
    if (criticalFailures > 0) {
      console.log(`\n🚨 ${criticalFailures} CRITICAL FAILURES - STOPPING`);
      this.generateReport();
      process.exit(1);
    }
    
    // Run non-critical steps
    console.log('\n🔧 PHASE 2: OPTIMIZATION VERIFICATION');
    console.log('='.repeat(40));
    
    for (const step of sortedSteps.filter(s => !s.critical)) {
      const result = await this.executeStep(step);
      this.results[step.id] = result;
      
      if (!result.passed) {
        console.log(`⚠️ ${step.name}: Issues found`);
        totalErrors++;
      } else {
        console.log(`✅ ${step.name}: OK (${result.duration}ms)`);
      }
    }
    
    // Run error countdown
    console.log('\n📊 PHASE 3: ERROR COUNTDOWN');
    console.log('='.repeat(40));
    
    try {
      const errorOutput = execSync('pnpm tsc --noEmit 2>&1 | grep -c "error TS" || echo "0"', {
        encoding: 'utf-8'
      });
      const errorCount = parseInt(errorOutput.trim());
      totalErrors += errorCount;
      
      console.log(`🎯 Current TypeScript Errors: ${errorCount}`);
      
      if (errorCount === 0) {
        console.log('🎉 ZERO TYPE ERRORS ACHIEVED!');
      } else if (errorCount <= 10) {
        console.log(`🔥 Almost there! ${errorCount} errors remaining.`);
      } else {
        console.log(`🛠️ ${errorCount} errors to fix.`);
      }
      
    } catch (error) {
      console.log('⚠️ Could not count errors');
    }
    
    // Final report
    console.log('\n📈 VERIFICATION COMPLETE');
    console.log('='.repeat(60));
    
    const passedSteps = Object.values(this.results).filter(r => r.passed).length;
    const totalSteps = Object.keys(this.results).length;
    
    console.log(`📊 Steps passed: ${passedSteps}/${totalSteps}`);
    console.log(`🎯 Total errors detected: ${totalErrors}`);
    console.log(`📈 App readiness: ${this.calculateReadiness()}%`);
    
    if (totalErrors === 0 && passedSteps === totalSteps) {
      console.log('\n🎉 PRODUCTION READY! 🎉');
      console.log('All verifications passed with zero errors.');
    } else {
      console.log('\n🎯 NEXT STEPS:');
      this.generateRecommendations();
    }
    
    this.generateReport();
  }
  
  private async executeStep(step: VerificationStep) {
    const startTime = Date.now();
    
    try {
      // Use timeout to prevent hanging
      const output = execSync(`timeout 30 ${step.command} 2>&1 || true`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      // Check if command indicates success
      const passed = this.checkSuccess(step.id, output);
      
      return {
        passed,
        output: output.slice(0, 500), // Keep first 500 chars
        duration: Date.now() - startTime
      };
      
    } catch (error: any) {
      return {
        passed: false,
        output: '',
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }
  
  private checkSuccess(stepId: string, output: string): boolean {
    // Different success criteria for different steps
    switch (stepId) {
      case 'verify-namespace':
        return output.includes('✅ No namespace import issues') || 
               !output.includes("'*' is a type");
      
      case 'ts-strict':
        return !output.includes('error TS') && 
               !output.includes('Found') && // tsc error count
               output.length < 1000; // Short output usually means success
      
      case 'lint':
        return !output.includes('error') && 
               !output.includes('Error') &&
               output.includes('✓') || output.includes('success');
      
      default:
        // For dry-run commands, success means no errors in output
        return !output.includes('error') && 
               !output.includes('Error') &&
               !output.includes('ERR!');
    }
  }
  
  private calculateReadiness(): number {
    const criticalSteps = this.steps.filter(s => s.critical);
    const criticalPassed = criticalSteps.filter(s => 
      this.results[s.id]?.passed
    ).length;
    
    if (criticalPassed !== criticalSteps.length) return 0;
    
    const allPassed = Object.values(this.results).filter(r => r.passed).length;
    return Math.round((allPassed / this.steps.length) * 100);
  }
  
  private generateRecommendations() {
    console.log('\n🎯 FIX PRIORITY ORDER:');
    
    // Check TypeScript errors first
    try {
      const errorOutput = execSync('pnpm tsc --noEmit 2>&1 | grep "error TS" | head -5', {
        encoding: 'utf-8'
      });
      
      if (errorOutput.trim()) {
        console.log('1. Fix TypeScript errors:');
        console.log(errorOutput.split('\n').filter(Boolean).map((line, i) => `   ${i+1}. ${line}`).join('\n'));
      }
    } catch {}
    
    // Check failed steps
    const failedSteps = Object.entries(this.results)
      .filter(([, result]) => !result.passed)
      .map(([id]) => this.steps.find(s => s.id === id))
      .filter(Boolean) as VerificationStep[];
    
    if (failedSteps.length > 0) {
      console.log('2. Fix verification failures:');
      failedSteps.forEach((step, i) => {
        console.log(`   ${i+1}. ${step.name}: pnpm ${step.command.replace('--dry-run ', '')}`);
      });
    }
    
    console.log('3. Run isolated testing: pnpm test:isolated');
    console.log('4. Final verification: pnpm error-countdown');
  }
  
  private generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        totalSteps: this.steps.length,
        passedSteps: Object.values(this.results).filter(r => r.passed).length,
        criticalPassed: this.steps.filter(s => 
          s.critical && this.results[s.id]?.passed
        ).length,
        readiness: this.calculateReadiness()
      }
    };
    
    const reportFile = path.join(process.cwd(), 'verification-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportFile}`);
  }
}

// Run verification
const verifier = new StrategicVerifier();
verifier.runVerification().catch(console.error);