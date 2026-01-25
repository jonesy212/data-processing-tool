#!/usr/bin/env tsx
// step-by-step-fixer.ts - Interactive step-by-step error fixing

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

interface FixStep {
  step: number;
  description: string;
  command: string;
  checkCommand?: string;
  expectedResult?: string;
  optional?: boolean;
}

class StepByStepFixer {
  private rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  private steps: FixStep[] = [
    {
      step: 1,
      description: "Check total errors",
      command: "npx tsc --noEmit --skipLibCheck 2>&1 | grep -c 'error TS' || echo '0'",
      expectedResult: "Should show number of errors"
    },
    {
      step: 2,
      description: "Find worst folder",
      command: "npx tsc --noEmit --skipLibCheck 2>&1 | grep -o 'src/[^:]*' | sort | uniq -c | sort -rn | head -1",
      expectedResult: "Shows folder with most errors"
    },
    {
      step: 3,
      description: "Check error types in worst folder",
      command: "FOLDER=$(npx tsc --noEmit --skipLibCheck 2>&1 | grep -o 'src/[^:]*' | sort | uniq -c | sort -rn | head -1 | awk '{print $2}') && echo 'Checking: $FOLDER' && npx tsc --noEmit --skipLibCheck $FOLDER 2>&1 | grep -o 'TS[0-9]*' | sort | uniq -c | sort -rn",
      expectedResult: "Shows most common error codes"
    },
    {
      step: 4,
      description: "Fix syntax errors first (TS1005, TS1128)",
      command: "echo 'Checking for syntax errors...' && npx tsc --noEmit --skipLibCheck 2>&1 | grep -E '(TS1005|TS1128)' | head -5",
      optional: true
    },
    {
      step: 5,
      description: "Fix missing imports (TS2304, TS2307)",
      command: "pnpm fix:types --dry-run",
      optional: true
    },
    {
      step: 6,
      description: "Apply import fixes",
      command: "read -p 'Apply import fixes? (y/n): ' && if [[ $REPLY =~ ^[Yy]$ ]]; then pnpm fix:types; fi",
      optional: true
    },
    {
      step: 7,
      description: "Check progress",
      command: "BEFORE=$1 AFTER=$(npx tsc --noEmit --skipLibCheck 2>&1 | grep -c 'error TS' || echo '0') && echo 'Before: $BEFORE, After: $AFTER, Fixed: $((BEFORE - AFTER))'",
      checkCommand: "echo 'Progress checked'"
    },
    {
      step: 8,
      description: "Fix type mismatches (TS2322, TS2345)",
      command: "echo 'Check type mismatch errors:' && npx tsc --noEmit --skipLibCheck 2>&1 | grep -E '(TS2322|TS2345)' | head -5",
      optional: true
    },
    {
      step: 9,
      description: "Test core sections",
      command: "pnpm test:isolated",
      expectedResult: "Should show which sections pass"
    },
    {
      step: 10,
      description: "Final verification",
      command: "pnpm verify:all",
      expectedResult: "All verifications should pass"
    }
  ];

  async run(): Promise<void> {
    console.log('🔄 STEP-BY-STEP ERROR FIXING WORKFLOW');
    console.log('='.repeat(60));
    
    let initialErrors = 0;
    
    try {
      // Get initial error count
      const output = execSync(this.steps[0].command, { encoding: 'utf-8' });
      initialErrors = parseInt(output.trim()) || 0;
      
      console.log(`📊 Initial errors: ${initialErrors}`);
      console.log('');
      
      if (initialErrors === 0) {
        console.log('🎉 No errors to fix!');
        return;
      }
    } catch (error) {
      console.log('⚠️ Could not get initial error count');
    }
    
    // Execute steps
    for (const step of this.steps) {
      await this.executeStep(step, initialErrors);
    }
    
    // Final summary
    await this.showFinalSummary(initialErrors);
    
    this.rl.close();
  }

  private async executeStep(step: FixStep, initialErrors: number): Promise<void> {
    console.log(`\n${step.step}. ${step.description}`);
    console.log('-'.repeat(40));
    
    if (step.expectedResult) {
      console.log(`Expected: ${step.expectedResult}`);
    }
    
    const shouldRun = await this.askQuestion(`Run this step? (y/n/skip): `);
    
    if (shouldRun.toLowerCase() === 'skip') {
      console.log('⏭️  Skipped');
      return;
    }
    
    if (shouldRun.toLowerCase() === 'y' || shouldRun.toLowerCase() === 'yes') {
      try {
        // Special handling for step 7 which needs initialErrors
        let command = step.command;
        if (step.step === 7) {
          command = command.replace('$1', initialErrors.toString());
        }
        
        console.log(`$ ${command.substring(0, 80)}${command.length > 80 ? '...' : ''}`);
        
        const output = execSync(command, { encoding: 'utf-8', shell: true });
        console.log(output);
        
        if (step.checkCommand) {
          const checkOutput = execSync(step.checkCommand, { encoding: 'utf-8' });
          console.log(`Check: ${checkOutput.trim()}`);
        }
        
        console.log('✅ Step completed');
        
      } catch (error: any) {
        console.error(`❌ Step failed:`, error.message);
        
        if (!step.optional) {
          const continueAnyway = await this.askQuestion('Continue anyway? (y/n): ');
          if (continueAnyway.toLowerCase() !== 'y') {
            console.log('⚠️ Stopping workflow');
            process.exit(1);
          }
        }
      }
    } else {
      console.log('⏭️  Skipped by user');
    }
    
    // Pause between steps
    if (step.step < this.steps.length) {
      await this.pause();
    }
  }

  private askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  private pause(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  private async showFinalSummary(initialErrors: number): Promise<void> {
    console.log('\n📈 FINAL SUMMARY');
    console.log('='.repeat(60));
    
    try {
      const finalOutput = execSync("npx tsc --noEmit --skipLibCheck 2>&1 | grep -c 'error TS' || echo '0'", {
        encoding: 'utf-8'
      });
      
      const finalErrors = parseInt(finalOutput.trim()) || 0;
      const fixedCount = initialErrors - finalErrors;
      const percentage = initialErrors > 0 ? Math.round((fixedCount / initialErrors) * 100) : 100;
      
      console.log(`📊 Initial errors: ${initialErrors}`);
      console.log(`📊 Final errors: ${finalErrors}`);
      console.log(`🎯 Fixed: ${fixedCount} errors (${percentage}%)`);
      
      if (finalErrors === 0) {
        console.log('\n🎉 CONGRATULATIONS! ALL ERRORS FIXED! 🎉');
      } else if (percentage >= 70) {
        console.log('\n🔥 Excellent progress! Almost there!');
      } else if (percentage >= 40) {
        console.log('\n📈 Good progress! Keep going!');
      } else {
        console.log('\n🛠️ Work in progress. Focus on one area at a time.');
      }
      
      // Show remaining error types
      const remainingTypes = execSync("npx tsc --noEmit --skipLibCheck 2>&1 | grep -o 'TS[0-9]*' | sort | uniq -c | sort -rn", {
        encoding: 'utf-8'
      });
      
      console.log('\n🔍 Remaining error types:');
      console.log(remainingTypes);
      
    } catch (error) {
      console.log('⚠️ Could not generate final summary');
    }
    
    // Create workflow report
    await this.createWorkflowReport(initialErrors);
  }

  private async createWorkflowReport(initialErrors: number): Promise<void> {
    const reportDir = path.join(process.cwd(), 'reports', 'workflows');
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `workflow-${timestamp}.md`);
    
    let finalErrors = 0;
    try {
      const output = execSync("npx tsc --noEmit --skipLibCheck 2>&1 | grep -c 'error TS' || echo '0'", {
        encoding: 'utf-8'
      });
      finalErrors = parseInt(output.trim()) || 0;
    } catch {
      // Ignore errors
    }
    
    const report = `# 🛠️ Fix Workflow Report

**Date:** ${new Date().toISOString()}
**Initial Errors:** ${initialErrors}
**Final Errors:** ${finalErrors}
**Fixed:** ${initialErrors - finalErrors} errors
**Progress:** ${Math.round(((initialErrors - finalErrors) / initialErrors) * 100)}%

## Steps Completed:
${this.steps.map(s => `- ${s.description}`).join('\n')}

## Next Steps:
${this.getNextSteps(finalErrors)}

## Recommendations:
${this.getRecommendations(finalErrors)}
`;
    
    fs.writeFileSync(reportFile, report);
    console.log(`\n📄 Workflow report saved: ${reportFile}`);
  }

  private getNextSteps(errorCount: number): string {
    if (errorCount === 0) {
      return "- ✅ All done! Run tests and deploy";
    }
    
    if (errorCount <= 10) {
      return "- Fix remaining individual errors\n- Run full test suite\n- Check app functionality";
    }
    
    if (errorCount <= 30) {
      return "- Focus on one folder at a time\n- Use pnpm fix:types for imports\n- Check type definitions";
    }
    
    return "- Continue with step-by-step workflow\n- Focus on core functionality first\n- Fix syntax errors before imports";
  }

  private getRecommendations(errorCount: number): string {
    const recommendations: string[] = [];
    
    if (errorCount > 50) {
      recommendations.push("Use batch fixing: pnpm fix:types");
      recommendations.push("Focus on core/ folder first");
      recommendations.push("Skip node_modules errors with --skipLibCheck");
    }
    
    if (errorCount > 20) {
      recommendations.push("Run pnpm find:hotspots to see worst areas");
      recommendations.push("Fix imports before type mismatches");
    }
    
    if (errorCount <= 20) {
      recommendations.push("Manual review of each error");
      recommendations.push("Test each fix individually");
    }
    
    return recommendations.map(r => `- ${r}`).join('\n');
  }
}

// Main execution
async function main() {
  const fixer = new StepByStepFixer();
  await fixer.run();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
