// src/app/error-analyzer/phases/PhaseExecutor.ts
import { DiagnosticResult, TypeScriptDiagnosticPhase } from './TypeScriptDiagnosticPhase';
import fs from 'fs';
import path from 'path';

export interface PhaseProgress {
  phase: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  result?: any;
  error?: string;
}

export interface ExecutionPlan {
  phases: string[];
  currentPhase: number;
  progress: PhaseProgress[];
  results: Record<string, any>;
}

export class PhaseExecutor {
  private projectRoot: string;
  private executionPlan: ExecutionPlan;
  private diagnosticPhase: TypeScriptDiagnosticPhase;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.diagnosticPhase = new TypeScriptDiagnosticPhase(projectRoot);
    this.executionPlan = this.createExecutionPlan();
  }

  private createExecutionPlan(): ExecutionPlan {
    return {
      phases: [
        'initial-diagnosis',
        'skip-lib-check',
        'error-grouping',
        'file-analysis',
        'line-debugging',
        'auto-fix',
        'manual-fix',
        'verification'
      ],
      currentPhase: 0,
      progress: [],
      results: {}
    };
  }

  async executeAllPhases(): Promise<ExecutionPlan> {
    console.log('🚀 Starting TypeScript Error Resolution Phases\n');
    
    for (let i = 0; i < this.executionPlan.phases.length; i++) {
      const phaseName = this.executionPlan.phases[i];
      this.executionPlan.currentPhase = i;
      
      await this.executePhase(phaseName);
      
      // Check if we should continue based on previous phase results
      if (!this.shouldContinueToNextPhase(phaseName)) {
        console.log(`⏸️  Stopping after ${phaseName} phase`);
        break;
      }
    }
    
    this.generateFinalReport();
    return this.executionPlan;
  }

  async executePhase(phaseName: string): Promise<void> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 Phase ${this.executionPlan.currentPhase + 1}: ${phaseName}`);
    console.log('='.repeat(60));
    
    const phaseProgress: PhaseProgress = {
      phase: phaseName,
      status: 'running',
      startTime: new Date()
    };
    
    this.executionPlan.progress.push(phaseProgress);
    
    try {
      let result: any;
      
      switch (phaseName) {
        case 'initial-diagnosis':
          result = await this.executeInitialDiagnosis();
          break;
          
        case 'skip-lib-check':
          result = await this.executeSkipLibCheck();
          break;
          
        case 'error-grouping':
          result = await this.executeErrorGrouping();
          break;
          
        case 'file-analysis':
          result = await this.executeFileAnalysis();
          break;
          
        case 'line-debugging':
          result = await this.executeLineDebugging();
          break;
          
        case 'auto-fix':
          result = await this.executeAutoFix();
          break;
          
        case 'manual-fix':
          result = await this.executeManualFix();
          break;
          
        case 'verification':
          result = await this.executeVerification();
          break;
          
        default:
          throw new Error(`Unknown phase: ${phaseName}`);
      }
      
      phaseProgress.status = 'completed';
      phaseProgress.endTime = new Date();
      phaseProgress.result = result;
      this.executionPlan.results[phaseName] = result;
      
      console.log(`✅ ${phaseName} completed successfully`);
      
    } catch (error) {
      phaseProgress.status = 'failed';
      phaseProgress.endTime = new Date();
      phaseProgress.error = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`❌ ${phaseName} failed:`, phaseProgress.error);
      throw error;
    }
  }

  private async executeInitialDiagnosis(): Promise<DiagnosticResult> {
    return await this.diagnosticPhase.execute();
  }

  private async executeSkipLibCheck(): Promise<any> {
    // This phase runs TypeScript with --skipLibCheck flag
    const { execSync } = require('child_process');
    
    console.log('⚙️ Running TypeScript with --skipLibCheck...');
    
    try {
      const output = execSync('npx tsc --noEmit --skipLibCheck --pretty false', {
        encoding: 'utf-8'
      });
      
      // Parse errors from output
      const errors = this.diagnosticPhase['parseErrors'](output);
      
      return {
        command: 'npx tsc --noEmit --skipLibCheck',
        errorCount: errors.length,
        errors: errors.slice(0, 10) // First 10 errors
      };
      
    } catch (error: any) {
      if (error.stdout) {
        const errors = this.diagnosticPhase['parseErrors'](error.stdout);
        return {
          command: 'npx tsc --noEmit --skipLibCheck',
          errorCount: errors.length,
          errors: errors.slice(0, 10)
        };
      }
      throw error;
    }
  }

  private async executeErrorGrouping(): Promise<any> {
    // Get results from initial diagnosis
    const diagnosis = this.executionPlan.results['initial-diagnosis'];
    if (!diagnosis) {
      throw new Error('Initial diagnosis required for error grouping');
    }
    
    // Group errors by pattern
    const patterns = this.groupErrorsByPattern(diagnosis);
    
    return {
      totalGroups: patterns.size,
      patterns: Array.from(patterns.entries()).slice(0, 10)
    };
  }

  private async executeFileAnalysis(): Promise<any> {
    // Analyze the worst file from diagnosis
    const diagnosis = this.executionPlan.results['initial-diagnosis'];
    if (!diagnosis?.worstFile) {
      return { message: 'No file to analyze' };
    }
    
    const filePath = diagnosis.worstFile.path;
    
    // Read and analyze the file
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Get errors for this file
    const { execSync } = require('child_exec');
    const output = execSync(`npx tsc --noEmit --skipLibCheck "${filePath}" 2>&1`, {
      encoding: 'utf-8'
    });
    
    const errors = this.diagnosticPhase['parseErrors'](output);
    
    return {
      file: path.basename(filePath),
      lineCount: lines.length,
      errorCount: errors.length,
      errorsByLine: this.groupErrorsByLine(errors),
      firstErrorContext: this.getErrorContext(errors[0], lines)
    };
  }

  private async executeLineDebugging(): Promise<any> {
    // Get file analysis results
    const fileAnalysis = this.executionPlan.results['file-analysis'];
    if (!fileAnalysis?.firstErrorContext) {
      return { message: 'No line to debug' };
    }
    
    const { lineNumber, context } = fileAnalysis.firstErrorContext;
    const line = context.find((l: any) => l.lineNumber === lineNumber)?.content || '';
    
    // Analyze the line
    const analysis = this.analyzeLineSyntax(line);
    
    return {
      lineNumber,
      lineContent: line,
      analysis,
      suggestions: this.generateLineFixSuggestions(analysis)
    };
  }

  private async executeAutoFix(): Promise<any> {
    // Get the worst file
    const diagnosis = this.executionPlan.results['initial-diagnosis'];
    if (!diagnosis?.worstFile) {
      return { message: 'No file to fix' };
    }
    
    const filePath = diagnosis.worstFile.path;
    const backupPath = `${filePath}.backup.${Date.now()}`;
    
    // Create backup
    fs.copyFileSync(filePath, backupPath);
    
    // Apply common fixes
    const fixesApplied = this.applyCommonFixes(filePath);
    
    // Test the fix
    const { execSync } = require('child_process');
    const output = execSync(`npx tsc --noEmit --skipLibCheck "${filePath}" 2>&1`, {
      encoding: 'utf-8'
    });
    
    const errorsAfter = this.diagnosticPhase['parseErrors'](output);
    
    return {
      file: path.basename(filePath),
      backup: backupPath,
      fixesApplied,
      errorsBefore: diagnosis.worstFile.errorCount,
      errorsAfter: errorsAfter.length,
      progress: diagnosis.worstFile.errorCount - errorsAfter.length
    };
  }

  private async executeManualFix(): Promise<any> {
    // Provide guidance based on error types
    const diagnosis = this.executionPlan.results['initial-diagnosis'];
    if (!diagnosis) {
      return { message: 'No diagnosis available' };
    }
    
    const guidance = this.generateManualFixGuidance(diagnosis);
    
    return {
      guidance,
      commands: this.generateFixCommands(diagnosis)
    };
  }

  private async executeVerification(): Promise<any> {
    // Run final TypeScript check
    const { execSync } = require('child_process');
    
    const output = execSync('npx tsc --noEmit --skipLibCheck --pretty false 2>&1', {
      encoding: 'utf-8'
    });
    
    const errors = this.diagnosticPhase['parseErrors'](output);
    const initialErrors = this.executionPlan.results['initial-diagnosis']?.totalErrors || 0;
    
    return {
      currentErrors: errors.length,
      initialErrors,
      progress: initialErrors - errors.length,
      remainingErrorTypes: this.getRemainingErrorTypes(errors)
    };
  }

  // Helper methods
  private groupErrorsByPattern(diagnosis: DiagnosticResult): Map<string, number> {
    const patterns = new Map<string, number>();
    
    // This would analyze error messages for patterns
    // For now, group by error code description
    diagnosis.errorCodeDistribution.forEach((count, code) => {
      const pattern = this.getErrorPattern(code);
      patterns.set(pattern, (patterns.get(pattern) || 0) + count);
    });
    
    return patterns;
  }

  private getErrorPattern(code: string): string {
    const patterns: Record<string, string> = {
      '2304': 'Missing Identifier',
      '2322': 'Type Mismatch',
      '2741': 'Missing Property',
      '1005': 'Syntax Error',
      '1128': 'Syntax Error',
      '1003': 'Identifier Expected',
      '1109': 'Expression Expected'
    };
    
    return patterns[code] || `TS${code}`;
  }

  private groupErrorsByLine(errors: any[]): Map<number, number> {
    const lineErrors = new Map<number, number>();
    
    errors.forEach(error => {
      const line = error.startLineNumber;
      lineErrors.set(line, (lineErrors.get(line) || 0) + 1);
    });
    
    return lineErrors;
  }

  private getErrorContext(error: any, lines: string[]): any {
    if (!error) return null;
    
    const lineNumber = error.startLineNumber;
    const start = Math.max(0, lineNumber - 3);
    const end = Math.min(lines.length, lineNumber + 2);
    
    const context = [];
    for (let i = start; i < end; i++) {
      context.push({
        lineNumber: i + 1,
        content: lines[i],
        isErrorLine: i + 1 === lineNumber
      });
    }
    
    return {
      lineNumber,
      context
    };
  }

  private analyzeLineSyntax(line: string): any {
    const analysis = {
      length: line.length,
      openBrackets: (line.match(/</g) || []).length,
      closeBrackets: (line.match(/>/g) || []).length,
      openParens: (line.match(/\(/g) || []).length,
      closeParens: (line.match(/\)/g) || []).length,
      hasEquals: line.includes('='),
      hasMissingGeneric: line.includes('<') && !line.includes('>'),
      hasSpaceInArrow: line.includes('= >'),
      endsWithComma: line.trim().endsWith(','),
      endsWithSemicolon: line.trim().endsWith(';')
    };
    
    return analysis;
  }

  private generateLineFixSuggestions(analysis: any): string[] {
    const suggestions: string[] = [];
    
    if (analysis.openBrackets > analysis.closeBrackets) {
      suggestions.push('Add missing > to close generic type');
    }
    
    if (analysis.hasSpaceInArrow) {
      suggestions.push('Remove space in => (change "= >" to "=>")');
    }
    
    if (analysis.hasEquals && analysis.hasMissingGeneric) {
      suggestions.push('Check if = should be > in generic type');
    }
    
    if (!analysis.endsWithSemicolon && !analysis.endsWithComma) {
      suggestions.push('Consider adding semicolon at end of line');
    }
    
    return suggestions;
  }

  private applyCommonFixes(filePath: string): string[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    let newContent = content;
    const fixesApplied: string[] = [];
    
    // Fix space in =>
    if (content.includes('= >')) {
      newContent = newContent.replace(/= *>/g, '=>');
      fixesApplied.push('Fixed space in =>');
    }
    
    // Fix missing > in generics
    const missingGenericRegex = /(<[^>]*)\s*=\s*([^>])/g;
    if (missingGenericRegex.test(content)) {
      newContent = newContent.replace(missingGenericRegex, '$1> = $2');
      fixesApplied.push('Fixed missing > in generics');
    }
    
    // Fix extra comma before >
    if (content.includes(', >')) {
      newContent = newContent.replace(/, *>/g, ' >');
      fixesApplied.push('Fixed extra comma before >');
    }
    
    // Write changes if any fixes were applied
    if (fixesApplied.length > 0) {
      fs.writeFileSync(filePath, newContent);
    }
    
    return fixesApplied;
  }

  private generateManualFixGuidance(diagnosis: DiagnosticResult): any[] {
    const guidance: any[] = [];
    
    // Top 3 error types
    const sortedCodes = Array.from(diagnosis.errorCodeDistribution.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    sortedCodes.forEach(([code, count]) => {
      guidance.push({
        errorCode: `TS${code}`,
        count,
        description: this.getErrorDescription(code),
        suggestions: this.getFixSuggestions(code)
      });
    });
    
    return guidance;
  }

  private getErrorDescription(code: string): string {
    const descriptions: Record<string, string> = {
      '2304': 'Cannot find name - missing import or declaration',
      '2322': 'Type mismatch - incompatible types',
      '2741': 'Missing property in type/interface',
      '1005': "Expected ',' or '>' - syntax error",
      '1128': 'Declaration expected - missing semicolon or bracket',
      '1003': 'Identifier expected - missing variable/function name',
      '1109': 'Expression expected - incomplete statement'
    };
    
    return descriptions[code] || `TS${code} error`;
  }

  private getFixSuggestions(code: string): string[] {
    const suggestions: Record<string, string[]> = {
      '2304': [
        'Add import statement',
        'Check for typos in identifier name',
        'Ensure the identifier is exported from its module'
      ],
      '1005': [
        'Check for missing commas in lists/objects',
        'Check for missing > in generic types',
        'Verify all brackets/parentheses are properly closed'
      ],
      '1128': [
        'Add missing semicolon at end of line',
        'Check for unclosed braces {}',
        'Ensure statements are properly terminated'
      ]
    };
    
    return suggestions[code] || ['Review the TypeScript documentation for this error'];
  }

  private generateFixCommands(diagnosis: DiagnosticResult): string[] {
    const commands: string[] = [];
    
    if (diagnosis.nodeModuleErrors > 0) {
      commands.push('npx tsc --noEmit --skipLibCheck');
    }
    
    if (diagnosis.worstFile) {
      commands.push(`# Focus on ${diagnosis.worstFile.name}`);
      commands.push(`npx tsc --noEmit --skipLibCheck "${diagnosis.worstFile.path}"`);
    }
    
    // Add common fix commands
    commands.push('# Common fix commands:');
    commands.push("sed -i 's/\\(<[^>]*\\) = /\\1> = /g' filename.ts");
    commands.push("sed -i 's/= *>/=>/g' filename.ts");
    commands.push("sed -i 's/, *>/ >/g' filename.ts");
    
    return commands;
  }

  private getRemainingErrorTypes(errors: any[]): string[] {
    const errorTypes = new Set<string>();
    
    errors.forEach(error => {
      errorTypes.add(`TS${error.code}`);
    });
    
    return Array.from(errorTypes);
  }

  private shouldContinueToNextPhase(currentPhase: string): boolean {
    const phaseResults = this.executionPlan.results[currentPhase];
    
    if (!phaseResults) return true;
    
    switch (currentPhase) {
      case 'initial-diagnosis':
        return phaseResults.projectErrors > 0;
        
      case 'skip-lib-check':
        return phaseResults.errorCount > 0;
        
      case 'auto-fix':
        return phaseResults.progress > 0;
        
      default:
        return true;
    }
  }

  private generateFinalReport(): void {
    const reportsDir = path.join(this.projectRoot, 'reports', 'ts-resolution');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const filename = `resolution-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(reportsDir, filename);
    
    fs.writeFileSync(
      filepath,
      JSON.stringify(this.executionPlan, null, 2)
    );
    
    console.log(`\n📄 Final report saved: ${filepath}`);
    
    // Also generate a summary
    this.generateSummaryReport();
  }

  private generateSummaryReport(): void {
    console.log('\n📋 RESOLUTION SUMMARY');
    console.log('='.repeat(60));
    
    const initialDiagnosis = this.executionPlan.results['initial-diagnosis'];
    const verification = this.executionPlan.results['verification'];
    
    if (initialDiagnosis && verification) {
      const progress = initialDiagnosis.projectErrors - verification.currentErrors;
      const percentage = initialDiagnosis.projectErrors > 0 
        ? Math.round((progress / initialDiagnosis.projectErrors) * 100)
        : 0;
      
      console.log(`📈 Initial Errors: ${initialDiagnosis.projectErrors}`);
      console.log(`✅ Current Errors: ${verification.currentErrors}`);
      console.log(`🎉 Progress: ${progress} errors fixed (${percentage}%)`);
    }
    
    console.log(`\n🔄 Phases Completed: ${this.executionPlan.progress.filter(p => p.status === 'completed').length}`);
    
    this.executionPlan.progress.forEach(phase => {
      const statusIcon = phase.status === 'completed' ? '✅' : 
                         phase.status === 'failed' ? '❌' : '⏳';
      console.log(`${statusIcon} ${phase.phase}`);
    });
  }
}

// Factory function for easy use
export async function runFullResolution(projectRoot?: string): Promise<ExecutionPlan> {
  const executor = new PhaseExecutor(projectRoot);
  return await executor.executeAllPhases();
}