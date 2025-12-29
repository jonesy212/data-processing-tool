// src/core/error-analyzer/phases/TypeScriptDiagnosticPhase.ts
import { TSCompilerError } from '@/core/error-analyzer/ErrorFixManager';
import { execSync, ExecSyncOptions } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface DiagnosticResult {
  phase: string;
  timestamp: string;
  totalErrors: number;
  nodeModuleErrors: number;
  projectErrors: number;
  filesWithErrors: string[];
  worstFile?: {
    path: string;
    name: string;
    errorCount: number;
    percentage: number;
  };
  errorCodeDistribution: Map<string, number>;
  recommendations: string[];
  nextPhase: string;
  area?: string;
}

export class TypeScriptDiagnosticPhase {
  private projectRoot: string;
  private execOptions: ExecSyncOptions;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.execOptions = {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'] // Capture all output
    };
  }

  async execute(): Promise<DiagnosticResult> {
    console.log('🔍 Phase 1: Initial Diagnosis');
    console.log('='.repeat(60));

    const timestamp = new Date().toISOString();
    
    try {
      // Step 1: Run TypeScript compiler
      const tscOutput = this.runTypeScriptCheck();
      
      // Step 2: Parse and analyze errors
      const errors = this.parseErrors(tscOutput);
      
      // Step 3: Perform analysis
      const analysis = this.analyzeErrors(errors);
      
      // Step 4: Generate recommendations
      const recommendations = this.generateRecommendations(analysis);
      
      // Step 5: Save diagnostic report
      this.saveDiagnosticReport({
        phase: 'initial-diagnosis',
        timestamp,
        ...analysis,
        recommendations,
        nextPhase: this.determineNextPhase(analysis)
      });

      return {
        phase: 'initial-diagnosis',
        timestamp,
        ...analysis,
        recommendations,
        nextPhase: this.determineNextPhase(analysis)
      };

    } catch (error) {
      console.error('❌ Error during diagnosis:', error);
      throw error;
    }
  }

  private runTypeScriptCheck(): string {
    console.log('⚙️ Running TypeScript compiler...');
    
    try {
      const command = 'npx tsc --noEmit --pretty false';
      
      // Type-safe approach
      const output = execSync(command, {
        ...this.execOptions,
        encoding: 'utf-8' as const  // ✅ Use 'as const' for literal type
      });
      
      // Now TypeScript knows it's a string
      return output;
      
    } catch (error: any) {
      if (error.stdout) {
        // Also ensure stdout is string
        const stdout = typeof error.stdout === 'string' 
          ? error.stdout 
          : error.stdout.toString('utf-8');
        return stdout;
      }
      throw new Error(`Failed to run TypeScript check: ${error.message}`);
    }
  }

  private parseErrors(tscOutput: string): TSCompilerError[] {
    console.log('📊 Parsing errors...');
    
    const errors: TSCompilerError[] = [];
    const lines = tscOutput.split('\n');
    
    for (const line of lines) {
      const error = this.parseErrorLine(line);
      if (error) {
        errors.push(error);
      }
    }
    
    console.log(`Found ${errors.length} TypeScript errors`);
    return errors;
  }

  private parseErrorLine(line: string): TSCompilerError | null {
    // Match: filename(line,col): error TS1234: message
    const errorPattern = /^(.*?)\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)$/;
    const match = line.match(errorPattern);
    
    if (!match) return null;
    
    const [, resource, startLineStr, startColStr, code, message] = match;
    
    return {
      resource: path.resolve(resource.trim()),
      owner: 'typescript',
      code,
      severity: this.getErrorSeverity(code),
      message: message.trim(),
      source: 'TypeScript',
      startLineNumber: parseInt(startLineStr, 10),
      startColumn: parseInt(startColStr, 10),
      endLineNumber: parseInt(startLineStr, 10),
      endColumn: parseInt(startColStr, 10) + 10
    };
  }

  private getErrorSeverity(code: string): number {
    const severityMap: Record<string, number> = {
      '2304': 8, // Cannot find name - high severity
      '2322': 7, // Type mismatch
      '2741': 6, // Missing property
      '2321': 9, // Circular dependency - critical
      '1005': 5, // Syntax error
      '1128': 5, // Syntax error
      '1003': 4, // Identifier expected
      '1109': 4  // Expression expected
    };
    
    return severityMap[code] || 5; // Default medium severity
  }

  private analyzeErrors(errors: TSCompilerError[]): {
    totalErrors: number;
    nodeModuleErrors: number;
    projectErrors: number;
    filesWithErrors: string[];
    worstFile?: DiagnosticResult['worstFile'];
    errorCodeDistribution: Map<string, number>;
  } {
    console.log('📈 Analyzing error patterns...');
    
    // Count total errors
    const totalErrors = errors.length;
    
    // Separate node_modules vs project errors
    const nodeModuleErrors = errors.filter(e => 
      e.resource.includes('node_modules')
    ).length;
    
    const projectErrors = totalErrors - nodeModuleErrors;
    
    // Group by file
    const filesWithErrors = this.groupErrorsByFile(errors);
    
    // Find worst file
    const worstFile = this.findWorstFile(errors, totalErrors);
    
    // Distribution by error code
    const errorCodeDistribution = this.groupByErrorCode(errors);
    
    return {
      totalErrors,
      nodeModuleErrors,
      projectErrors,
      filesWithErrors,
      worstFile,
      errorCodeDistribution
    };
  }

  private groupErrorsByFile(errors: TSCompilerError[]): string[] {
    const fileSet = new Set<string>();
    
    errors.forEach(error => {
      if (!error.resource.includes('node_modules')) {
        fileSet.add(path.relative(this.projectRoot, error.resource));
      }
    });
    
    return Array.from(fileSet);
  }

  private findWorstFile(
    errors: TSCompilerError[], 
    totalErrors: number
  ): DiagnosticResult['worstFile'] | undefined {
    const fileErrors = new Map<string, number>();
    
    // Count errors per project file (exclude node_modules)
    errors.forEach(error => {
      if (!error.resource.includes('node_modules')) {
        const file = error.resource;
        fileErrors.set(file, (fileErrors.get(file) || 0) + 1);
      }
    });
    
    if (fileErrors.size === 0) return undefined;
    
    // Find file with most errors
    let worstFilePath = '';
    let maxErrors = 0;
    
    fileErrors.forEach((count, file) => {
      if (count > maxErrors) {
        maxErrors = count;
        worstFilePath = file;
      }
    });
    
    return {
      path: worstFilePath,
      name: path.basename(worstFilePath),
      errorCount: maxErrors,
      percentage: totalErrors > 0 ? Math.round((maxErrors / totalErrors) * 100) : 0
    };
  }

  private groupByErrorCode(errors: TSCompilerError[]): Map<string, number> {
    const distribution = new Map<string, number>();
    
    errors.forEach(error => {
      const code = error.code;
      distribution.set(code, (distribution.get(code) || 0) + 1);
    });
    
    return distribution;
  }

  private generateRecommendations(analysis: {
    totalErrors: number;
    nodeModuleErrors: number;
    projectErrors: number;
    worstFile?: DiagnosticResult['worstFile'];
    errorCodeDistribution: Map<string, number>;
  }): string[] {
    const recommendations: string[] = [];
    
    // Node modules errors
    if (analysis.nodeModuleErrors > 0) {
      recommendations.push(
        `Skip ${analysis.nodeModuleErrors} node_modules errors with: npx tsc --noEmit --skipLibCheck`
      );
    }
    
    // Focus recommendation
    if (analysis.worstFile) {
      recommendations.push(
        `Focus on ${analysis.worstFile.name} first (${analysis.worstFile.errorCount} errors, ${analysis.worstFile.percentage}% of total)`
      );
    }
    
    // Batch fix recommendations
    const sortedCodes = Array.from(analysis.errorCodeDistribution.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (sortedCodes.length > 0) {
      const [topCode, topCount] = sortedCodes[0];
      recommendations.push(
        `Batch fix all TS${topCode} errors (${topCount} occurrences)`
      );
    }
    
    // Quick wins
    if (analysis.projectErrors > 10) {
      recommendations.push(
        'Start with quick wins: Fix files with 1-3 errors first'
      );
    }
    
    return recommendations;
  }

  private determineNextPhase(analysis: {
    nodeModuleErrors: number;
    projectErrors: number;
  }): string {
    if (analysis.nodeModuleErrors > analysis.projectErrors) {
      return 'skip-lib-check';
    }
    
    if (analysis.projectErrors > 20) {
      return 'error-grouping';
    }
    
    return 'file-analysis';
  }

  private saveDiagnosticReport(result: DiagnosticResult): void {
    const reportsDir = path.join(this.projectRoot, 'reports', 'ts-diagnostics');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const filename = `diagnosis-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(reportsDir, filename);
    
    // Convert Map to object for JSON serialization
    const serializableResult = {
      ...result,
      errorCodeDistribution: Object.fromEntries(result.errorCodeDistribution)
    };
    
    fs.writeFileSync(
      filepath,
      JSON.stringify(serializableResult, null, 2)
    );
    
    console.log(`📄 Diagnostic report saved: ${filepath}`);
  }

  async generateConsoleReport(result: DiagnosticResult): Promise<void> {
    console.log('\n📊 DIAGNOSTIC RESULTS');
    console.log('='.repeat(60));
    
    console.log(`📈 Total Errors: ${result.totalErrors}`);
    console.log(`📦 Node Modules: ${result.nodeModuleErrors}`);
    console.log(`📁 Project Files: ${result.projectErrors}`);
    
    if (result.worstFile) {
      console.log(`\n🎯 Focus File: ${result.worstFile.name}`);
      console.log(`   Errors: ${result.worstFile.errorCount} (${result.worstFile.percentage}% of total)`);
      console.log(`   Path: ${result.worstFile.path}`);
    }
    
    console.log('\n📊 Error Code Distribution:');
    const sortedCodes = Array.from(result.errorCodeDistribution.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    sortedCodes.forEach(([code, count]) => {
      const percentage = Math.round((count / result.totalErrors) * 100);
      console.log(`   TS${code.padEnd(6)} ${count.toString().padStart(3)}× (${percentage}%)`);
    });
    
    console.log('\n🚀 RECOMMENDATIONS:');
    result.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
    
    console.log(`\n➡️ Next Phase: ${result.nextPhase}`);
  }
}

// Factory function for easy use
export async function runInitialDiagnosis(projectRoot?: string): Promise<DiagnosticResult> {
  const phase = new TypeScriptDiagnosticPhase(projectRoot);
  const result = await phase.execute();
  await phase.generateConsoleReport(result);
  return result;
}