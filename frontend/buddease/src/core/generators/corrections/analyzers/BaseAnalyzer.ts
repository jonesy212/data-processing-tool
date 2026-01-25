// analyzers/BaseAnalyzer.ts
import { CorrectionFactory } from '@/core/config/factory/CorrectionFactory';
import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import type { CorrectionCategory, CorrectionSeverity, CorrectionType } from '@/core/typings/correctionTypes';
import fs from 'fs/promises';

export interface Issue {
  type: CorrectionType;
  severity: CorrectionSeverity;
  line: number;
  original: string;
  suggestion: string;
  command?: string;
  autoFixable: boolean;
  codeSnippet?: string;
  category: CorrectionCategory;
}

export interface AnalysisResult {
  filePath: string;
  issues: Issue[];
  summary: {
    errorCount: number;
    warningCount: number;
    suggestions: number;
  };
}

export interface Suggestion {
  text: string;
  command?: string;
  autoFixable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Unified BaseAnalyzer
export abstract class BaseAnalyzer {
  // Analysis statistics
  protected errorCount = 0;
  protected warningCount = 0;
  protected suggestions: Suggestion[] = [];
  
  // Abstract properties for concrete analyzers to define
  abstract readonly name: string;
  abstract readonly patterns: RegExp[];
  abstract readonly errorCodes: string[]; // TS error codes or custom codes
  
  // Main analysis method - can analyze file or content
  async analyzeFile(filePath: string): Promise<Correction[]> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const issues = this.scan(content, filePath);
      
      // Convert issues to Corrections
      return issues.map(issue => this.issueToCorrection(issue, filePath));
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error);
      return [];
    }
  }
  
  // Analyze project-wide (can be overridden by specific analyzers)
  async analyzeProject(): Promise<Correction[]> {
    // Default implementation - analyze specific files
    // Concrete analyzers can override with their own logic
    return [];
  }
  
  // Scan content for patterns
  protected scan(content: string, filePath: string): Issue[] {
    const issues: Issue[] = [];
    
    // Check for specific error patterns
    for (const pattern of this.patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const lineNumber = this.getLineNumber(content, match.index);
        const suggestion = this.generateSuggestion(filePath, lineNumber, match);
        
        issues.push({
          type: this.classifyError(match),
          severity: this.determineSeverity(match, filePath),
          line: lineNumber,
          original: match[0],
          suggestion: suggestion.text,
          command: suggestion.command,
          autoFixable: suggestion.autoFixable,
          codeSnippet: this.extractCodeSnippet(content, lineNumber),
          category: this.getCategory(filePath, match)
        });
      }
    }
    
    // Update statistics
    this.errorCount += issues.filter(i => i.severity === 'critical' || i.severity === 'high').length;
    this.warningCount += issues.filter(i => i.severity === 'medium' || i.severity === 'low').length;
    this.suggestions.push(...issues.map(i => ({
      text: i.suggestion,
      command: i.command,
      autoFixable: i.autoFixable,
      priority: i.severity === 'critical' ? 'critical' :
                i.severity === 'high' ? 'high' :
                i.severity === 'medium' ? 'medium' : 'low'
    })));
    
    return issues;
  }
  
  // Convert an Issue to a Correction
  protected issueToCorrection(issue: Issue, filePath: string): Correction {
    const id = `${this.name}:${filePath}:${issue.line}:${Date.now()}`;
    
    return this.createCorrection(
      id,
      issue.type,
      issue.severity,
      this.generateTitle(issue, filePath),  // title
      filePath,
      issue.codeSnippet || issue.original,
      issue.suggestion,
      issue.category,
      issue.line,
      this.generateDescription(issue, filePath)
    );
  }
  
  // Generate descriptive title
  protected generateTitle(issue: Issue, filePath: string): string {
    const fileName = filePath.split('/').pop() || filePath;
    return `${this.name} issue in ${fileName}:${issue.line}`;
  }
  
  // Generate detailed description
  protected generateDescription(issue: Issue, filePath: string): string {
    return `${issue.suggestion}\n\nFound in: ${filePath}:${issue.line}\nOriginal code: ${issue.original}`;
  }
  
  // Abstract methods for concrete analyzers to implement
  protected abstract generateSuggestion(
    filePath: string, 
    line: number, 
    match: RegExpMatchArray
  ): Suggestion;
  
  protected abstract classifyError(match: RegExpMatchArray): CorrectionType;
  
  protected abstract determineSeverity(match: RegExpMatchArray, filePath: string): CorrectionSeverity;
  
  protected abstract getCategory(filePath: string, match: RegExpMatchArray): CorrectionCategory;
  
  // Utility methods from your original BaseAnalyzer
  protected createCorrection(
    id: string,
    type: CorrectionType,
    severity: CorrectionSeverity,
    title: string,
    file: string,
    codeSnippet: string,
    suggestion: string,
    category: CorrectionCategory,
    line?: number,
    description?: string,
  ): Correction {
    return CorrectionFactory.create({
      id,
      type,
      severity,
      title,
      message: title,
      file,
      codeSnippet,
      suggestion,
      category,
      line,
      description: description || title
    });
  }
  
  protected getPriority(severity: Correction['severity']): number {
    const map: Record<typeof severity, number> = { 
      critical: 1, 
      high: 2, 
      medium: 3, 
      low: 4 
    };
    return map[severity] ?? 5;
  }
  
  // Convenience methods from your original BaseAnalyzer
  protected createPerformanceCorrection(
    id: string,
    title: string,
    file: string,
    codeSnippet: string,
    suggestion: string,
    line?: number
  ): Correction {
    return CorrectionFactory.createPerformanceIssue(id, title, file, codeSnippet, suggestion, line);
  }
  
  protected createMaintainabilityCorrection(
    id: string,
    title: string,
    file: string,
    codeSnippet: string,
    suggestion: string,
    line?: number
  ): Correction {
    return CorrectionFactory.createMaintainabilityIssue(id, title, file, codeSnippet, suggestion, line);
  }
  
  protected createCompilationCorrection(
    id: string,
    title: string,
    file: string,
    codeSnippet: string,
    suggestion: string,
    line?: number
  ): Correction {
    return CorrectionFactory.createCompilationError(id, title, file, codeSnippet, suggestion, line);
  }
  
  // Utility methods from pattern-based analyzer
  protected getLineNumber(content: string, charIndex: number): number {
    if (charIndex === undefined || charIndex === null) return 1;
    return content.substring(0, charIndex).split('\n').length;
  }
  
  protected extractCodeSnippet(content: string, lineNumber: number, contextLines: number = 2): string {
    const lines = content.split('\n');
    const start = Math.max(0, lineNumber - contextLines - 1);
    const end = Math.min(lines.length, lineNumber + contextLines);
    
    return lines.slice(start, end)
      .map((line, index) => {
        const currentLine = start + index + 1;
        const prefix = currentLine === lineNumber ? '❌ ' : '   ';
        return `${prefix}${currentLine}: ${line}`;
      })
      .join('\n');
  }
  
  // Generate summary report
  protected generateSummary(issues: Issue[]): {
    errorCount: number;
    warningCount: number;
    suggestions: number;
  } {
    const errorCount = issues.filter(i => 
      i.severity === 'critical' || i.severity === 'high'
    ).length;
    
    const warningCount = issues.filter(i => 
      i.severity === 'medium' || i.severity === 'low'
    ).length;
    
    return {
      errorCount,
      warningCount,
      suggestions: issues.length
    };
  }
  
  // Verification logic (similar to your import fixer's verifyFixes)
  async verifyFixes(files: string[]): Promise<{
    success: boolean;
    fixed: number;
    remaining: number;
    details: Array<{ file: string; issues: Issue[] }>;
  }> {
    const details: Array<{ file: string; issues: Issue[] }> = [];
    let fixed = 0;
    let remaining = 0;
    
    for (const file of files) {
      const corrections = await this.analyzeFile(file);
      const remainingIssues = corrections.length;
      remaining += remainingIssues;
      
      details.push({
        file,
        issues: corrections.map(c => ({
          type: c.type,
          severity: c.severity,
          line: c.line || 0,
          original: c.codeSnippet || '',
          suggestion: c.suggestion,
          command: '', // Can be derived from correction metadata
          autoFixable: true, // Assuming all corrections are auto-fixable
          codeSnippet: c.codeSnippet,
          category: c.category
        }))
      });
      
      // Count as fixed if no issues remain
      if (remainingIssues === 0) {
        fixed++;
      }
    }
    
    return {
      success: remaining === 0,
      fixed,
      remaining,
      details
    };
  }
}