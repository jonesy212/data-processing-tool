// src/core/error-analyzer/phases/PhaseExecutor.ts
import {
    FileCategory // Move this from separate import
} from '@/core/documents/FileType';

import { DiagnosticResult, TypeScriptDiagnosticPhase } from '@/core/error-analyzer/phases/TypeScriptDiagnosticPhase';
import {
    fileCategoryMapping,
    suggestCorrectionCategoryFromFile
} from '@/core/libraries/categories/fileCategoryMapping';
import { determineFileCategoryLogger } from "@/core/logging/determineFileCategoryLogger";
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
  private executedPhases: Set<string> = new Set(); 
  private phaseResults: Map<string, any> = new Map(); 
 
  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.diagnosticPhase = new TypeScriptDiagnosticPhase(projectRoot);
    this.executionPlan = this.createExecutionPlan();
  }

  get executedPhasesList(): string[] {
    return Array.from(this.executedPhases);
  }


  private findAllTypeScriptFiles(): string[] {
    const tsFiles: string[] = [];
    
    function walkDir(dir: string) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          // Skip node_modules and other excluded directories
          if (!file.includes('node_modules') && !file.startsWith('.')) {
            walkDir(filePath);
          }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          tsFiles.push(filePath);
        }
      });
    }
    
    try {
      walkDir(this.projectRoot);
    } catch (error) {
      console.warn('Error walking directory:', error);
    }
    
    return tsFiles;
  }

  private generateCategoryRecommendations(categoryAnalysis: Record<string, any>): string[] {
    const recommendations: string[] = [];
    
    Object.entries(categoryAnalysis).forEach(([category, data]) => {
      if (data.count > 10) {
        recommendations.push(`Focus on ${category} files: ${data.count} files found`);
      }
      
      // Check for files without proper extensions
      data.files.forEach((file: any) => {
        const ext = path.extname(file.path);
        const validExts = fileCategoryMapping[category as FileCategory] || [];
        if (!validExts.includes(ext.slice(1))) {
          recommendations.push(`File ${file.name} may have wrong extension for ${category} category`);
        }
      });
    });
    
    return recommendations;
  }

  private createExecutionPlan(): ExecutionPlan {
    return {
      phases: [
        'initial-diagnosis',
        'file-category-analysis', 
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
private async executeFileCategoryAnalysis(): Promise<any> {
  // Analyze all TypeScript files in the project and categorize them
  const tsFiles = this.findAllTypeScriptFiles();
  
  const categoryAnalysis: Record<string, any> = {};
  const uncategorizedFiles: string[] = [];
  
  tsFiles.forEach(filePath => {
    const fileName = path.basename(filePath);
    const extension = path.extname(filePath).slice(1);
    
    try {
      const category = determineFileCategoryLogger(fileName, extension);
      
      // Skip files with null category
      if (!category) {
        uncategorizedFiles.push(fileName);
        return;
      }
      
      const correctionCategory = suggestCorrectionCategoryFromFile(fileName, extension);
      
      if (!categoryAnalysis[category]) {
        categoryAnalysis[category] = {
          count: 0,
          files: [],
          commonErrorPatterns: []
        };
      }
      
      categoryAnalysis[category].count++;
      categoryAnalysis[category].files.push({
        name: fileName,
        path: filePath,
        correctionCategory
      });
    } catch (error) {
      uncategorizedFiles.push(fileName);
    }
  });
  
  return {
    totalFilesAnalyzed: tsFiles.length,
    categorizedFiles: Object.values(categoryAnalysis).reduce((sum, cat) => sum + cat.count, 0),
    uncategorizedFiles: uncategorizedFiles.length,
    categories: categoryAnalysis,
    uncategorizedFileNames: uncategorizedFiles.slice(0, 10), // First 10
    recommendations: this.generateCategoryRecommendations(categoryAnalysis)
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



  async executePhase(phaseName: string): Promise<PhaseResult> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 Phase ${this.executionPlan.currentPhase + 1}: ${phaseName}`);
    console.log(`🚀 Executing: ${phaseName}`);
    console.log('='.repeat(60));
    
    if (this.executedPhases.has(phaseName)) {
      console.log(`📋 Phase ${phaseName} already executed, using cached result`);
      const cached = this.phaseResults.get(phaseName);
      return cached || { success: false, error: 'No cached result' };
    }
    
    const phaseProgress: PhaseProgress = {
      phase: phaseName,
      status: 'running',
      startTime: new Date()
    };
    
    this.executionPlan.progress.push(phaseProgress);
    this.executedPhases.add(phaseName);
    
    try {
      await this.runPhaseDependencies(phaseName);

      let result: any;
      
      switch (phaseName) {
        case 'initial-diagnosis':
          result = await this.executeInitialDiagnosis();
          break;
        case 'file-category-analysis':  
          result = await this.executeFileCategoryAnalysis();
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
      this.phaseResults.set(phaseName, { success: true, data: result });
      
      console.log(`✅ ${phaseName} completed successfully`);
      
      return { success: true, data: result };
      
    } catch (error) {
      phaseProgress.status = 'failed';
      phaseProgress.endTime = new Date();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      phaseProgress.error = errorMessage;
      
      console.error(`❌ ${phaseName} failed:`, errorMessage);
      
      return { success: false, error: errorMessage };
    }
  }
  
  // Update helper methods to return typed results
  private async executeInitialDiagnosis(): Promise<DiagnosticResult> {
    const result = await this.diagnosticPhase.execute();
    return result;
  }
  
  private async executeVerification(): Promise<VerificationResult> {
    const { execSync } = require('child_process');
    const output = execSync('npx tsc --noEmit --skipLibCheck --pretty false 2>&1', {
      encoding: 'utf-8'
    });
    
    const errors = this.diagnosticPhase['parseErrors'](output);
    const initialErrors = this.executionPlan.results['initial-diagnosis']?.projectErrors || 0;
    
    return {
      currentErrors: errors.length,
      initialErrors,
      progress: initialErrors - errors.length,
      remainingErrorTypes: this.getRemainingErrorTypes(errors)
    };
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
  const diagnosis = this.executionPlan.results['initial-diagnosis'];
  if (!diagnosis?.worstFile) {
    return { message: 'No file to analyze' };
  }
    
  const filePath = diagnosis.worstFile.path;
  const fileName = path.basename(filePath);
  const extension = path.extname(filePath).slice(1);
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Determine file category
  const fileCategory = determineFileCategoryLogger(fileName, extension);
  const correctionCategory = suggestCorrectionCategoryFromFile(fileName, extension);
  
  // Get errors for this file
  const { execSync } = require('child_process');
  const output = execSync(`npx tsc --noEmit --skipLibCheck "${filePath}" 2>&1`, {
    encoding: 'utf-8'
  });
  
  const errors = this.diagnosticPhase['parseErrors'](output);
  
  return {
    file: fileName,
    fileCategory,
    correctionCategory,
    lineCount: lines.length,
    errorCount: errors.length,
    errorsByLine: this.groupErrorsByLine(errors),
    firstErrorContext: this.getErrorContext(errors[0], lines),
    categorySpecificAnalysis: fileCategory 
      ? this.analyzeByFileCategory(filePath, fileCategory)
      : { message: 'No category-specific analysis available' }
  };
}


private analyzeByFileCategory(filePath: string, category: FileCategory): any {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  switch (category) {
    case FileCategory.Component:
      return this.analyzeComponentFile(content);
    case FileCategory.SmartContract:
      return this.analyzeSmartContractFile(content);
    case FileCategory.API:
      return this.analyzeApiFile(content);
    case FileCategory.Test:
      return this.analyzeTestFile(content);
    default:
      return { message: `No specific analysis for ${category}` };
  }
}



  private async executeLineDebugging(): Promise<any> {
    const fileAnalysis = this.executionPlan.results['file-analysis'];
    if (!fileAnalysis?.firstErrorContext) {
      return { message: 'No line to debug' };
    }
    
    const { lineNumber, context } = fileAnalysis.firstErrorContext;
    const line = context.find((l: any) => l.lineNumber === lineNumber)?.content || '';
    
    // Get the line analysis
    const analysis = this.analyzeLineSyntax(line);
    
    // Get file category from previous analysis
    const fileCategory = fileAnalysis.fileCategory; // This should be set in executeFileAnalysis()
    
    return {
      lineNumber,
      lineContent: line,
      analysis,
      suggestions: this.generateLineFixSuggestions(analysis, fileCategory), // Pass fileCategory here
      fileCategory: fileCategory || 'unknown'
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


  private generateLineFixSuggestions(
    analysis: any, 
    fileCategory?: FileCategory  // Add optional parameter
  ): string[] {
    const suggestions: string[] = [];
    
    // Generic TypeScript fixes
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
    
    // Category-specific fixes (only if fileCategory is provided)
    if (fileCategory) {
      switch (fileCategory) {
        case FileCategory.Component:
          suggestions.push('Check for missing React imports');
          suggestions.push('Verify JSX/TSX syntax');
          suggestions.push('Ensure component props are properly typed');
          break;
          
        case FileCategory.SmartContract:
          suggestions.push('Check Solidity syntax (if relevant)');
          suggestions.push('Verify web3 library imports');
          suggestions.push('Ensure contract ABI compatibility');
          break;
          
        case FileCategory.API:
          suggestions.push('Check for missing route handlers');
          suggestions.push('Verify middleware function signatures');
          suggestions.push('Ensure response types are correct');
          break;
          
        case FileCategory.Test:
          suggestions.push('Check for missing testing library imports');
          suggestions.push('Verify test assertions');
          suggestions.push('Ensure mock functions are properly typed');
          break;
          
        case FileCategory.Utility:
          suggestions.push('Check for proper export/import statements');
          suggestions.push('Verify utility function signatures');
          suggestions.push('Ensure consistent return types');
          break;
          
        // Add more cases as needed
        default:
          // No category-specific suggestions
          break;
      }
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


  private analyzeComponentFile(content: string): any {
    return {
      hasJSX: content.includes('<') && (content.includes('/>') || content.includes('</')),
      hasReactImport: content.includes("from 'react'") || content.includes('from "react"'),
      hasUseState: content.includes('useState'),
      hasUseEffect: content.includes('useEffect'),
      propTypes: (content.match(/interface.*Props|type.*Props/g) || []).length
    };
  }

  private analyzeSmartContractFile(content: string): any {
    return {
      hasSoliditySyntax: content.includes('pragma solidity') || content.includes('contract '),
      hasWeb3Imports: content.includes('web3') || content.includes('ethers'),
      hasABI: content.includes('ABI') || content.includes('abi'),
      hasContract: content.includes('contract ')
    };
  }

  private analyzeApiFile(content: string): any {
    return {
      hasRouteHandlers: content.includes('Router') || content.includes('app.get') || content.includes('app.post'),
      hasMiddleware: content.includes('middleware') || content.includes('next('),
      hasResponseTypes: content.includes('Response') || content.includes('res.')
    };
  }

  private analyzeTestFile(content: string): any {
    return {
      hasTestImports: content.includes('jest') || content.includes('vitest') || content.includes('@testing-library'),
      hasDescribe: content.includes('describe('),
      hasIt: content.includes('it(') || content.includes('test('),
      hasAssertions: content.includes('expect(') || content.includes('assert(')
    };
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


  private async runPhaseDependencies(phaseName: string): Promise<void> {
    const dependencies: Record<string, string[]> = {
      'file-category-analysis': [],  
      'error-grouping': ['initial-diagnosis'],
      'file-analysis': ['initial-diagnosis'],
      'line-debugging': ['file-analysis'],
      'auto-fix': ['initial-diagnosis'],
      'manual-fix': ['initial-diagnosis'],
      'verification': []
    };

    const requiredPhases = dependencies[phaseName] || [];
    
    for (const requiredPhase of requiredPhases) {
      if (!this.executionPlan.results[requiredPhase]) {
        console.log(`📋 Running required dependency: ${requiredPhase}`);
        await this.executePhase(requiredPhase);
      }
    }
  }

  // FIX: Replace the executeAll method (lines 691-705)
  async executeAll(): Promise<Map<string, any>> {
    console.log('🚀 Starting Full TypeScript Error Resolution');
    console.log('='.repeat(60));
    
    await this.executeAllPhases();
    
    // Convert results to Map
    const allResults = new Map<string, any>();
    Object.entries(this.executionPlan.results).forEach(([phase, result]) => {
      allResults.set(phase, result);
    });
    
    // Store in phaseResults cache
    allResults.forEach((result, phaseId) => {
      this.phaseResults.set(phaseId, result);
      this.executedPhases.add(phaseId);
    });
    
    console.log('\n🎉 All phases completed!');
    return allResults;
  }


  getPhaseResult(phaseId: string): any {
    return this.phaseResults.get(phaseId);
  }

  hasPhaseExecuted(phaseId: string): boolean {
    return this.executedPhases.has(phaseId);
  }

  clearCache(): void {
    this.executedPhases.clear();
    this.phaseResults.clear();
    console.log('🧹 Phase cache cleared');
  }
}

// Factory function for specific app areas
export async function runAppAreaDiagnosis(
  area: 'frontend' | 'backend' | 'shared' | 'all' = 'all',
  projectRoot?: string
): Promise<any> {
  const phase = new TypeScriptDiagnosticPhase(projectRoot);
  const result = await phase.execute();
  await phase.generateConsoleReport(result);
  
  // Tag the result with the area
  return {
    ...result,
    area,
    timestamp: new Date().toISOString()
  };
}

// Main execution function with area support
export async function runFullResolution(
  area: 'frontend' | 'backend' | 'shared' | 'all' = 'all',
  projectRoot?: string
): Promise<any> {
  const executor = new PhaseExecutor(projectRoot);
  
  console.log(`🎯 Running TypeScript Error Resolution for: ${area.toUpperCase()}`);
  console.log('='.repeat(60));
  
  let filterPattern = '';
  switch (area) {
    case 'frontend':
      filterPattern = 'src/app';
      break;
    case 'backend':
      filterPattern = 'src/server';
      break;
    case 'shared':
      filterPattern = 'src/shared';
      break;
    case 'all':
    default:
      filterPattern = '';
  }
  
  // Execute all phases
  const results = await executor.executeAllPhases(); // Changed to executeAllPhases()
  
  return {
    area,
    filterPattern,
    results: results, // Use the ExecutionPlan directly
    timestamp: new Date().toISOString()
  };
}

// Area-specific phase runners
export const phaseRunners = {
  frontend: async (projectRoot?: string) => 
    runFullResolution('frontend', projectRoot),
  
  backend: async (projectRoot?: string) => 
    runFullResolution('backend', projectRoot),
  
  shared: async (projectRoot?: string) => 
    runFullResolution('shared', projectRoot),
  
  all: async (projectRoot?: string) => 
    runFullResolution('all', projectRoot),
  
  // Quick diagnosis for specific areas
  diagnoseFrontend: async (projectRoot?: string) => {
    const phase = new TypeScriptDiagnosticPhase(projectRoot);
    const result = await phase.execute();
    // Filter to only frontend files
    const frontendFiles = result.filesWithErrors.filter((file: string) => 
      file.includes('src/app') || file.includes('src/components')
    );
    return {
      ...result,
      filesWithErrors: frontendFiles,
      area: 'frontend'
    };
  },
  
  diagnoseBackend: async (projectRoot?: string) => {
    const phase = new TypeScriptDiagnosticPhase(projectRoot);
    const result = await phase.execute();
    // Filter to only backend files
    const backendFiles = result.filesWithErrors.filter((file: string) => 
      file.includes('src/server') || file.includes('src/api')
    );
    return {
      ...result,
      filesWithErrors: backendFiles,
      area: 'backend'
    };
  }
};
