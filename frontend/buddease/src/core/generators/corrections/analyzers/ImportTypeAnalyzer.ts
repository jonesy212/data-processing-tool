// analyzers/ImportTypeAnalyzer.ts
import { BaseAnalyzer, type Suggestion } from './BaseAnalyzer';
import type { CorrectionType, CorrectionSeverity, CorrectionCategory } from '@/core/typings/correctionTypes';

export class ImportTypeAnalyzer extends BaseAnalyzer {
  readonly name = 'import-type';
  readonly errorCodes = ['TS1371', 'CUSTOM_TYPE_IMPORT'];
  readonly patterns = [
    // Pattern for imports that should be type-only
    /import\s+(?!type)(?:(?:\w+\s*,?\s*)?\{[^}]*\}|\w+)\s+from\s+['"](?:@\/core\/[^'"]+|\.\.?\/[^'"]+)['"]/g,
    // Pattern for mixed type/value imports
    /import\s+\{[^}]*\b(?:Props|Type|Interface|Config|Options|State|Entity|Metadata)\b[^}]*(?:\b\w+\b(?!Props|Type|Interface|Config|Options|State|Entity|Metadata)[^}]*)?\}\s+from\s+['"][^'"]+['"]/g
  ];
  
  // Override project analysis for better performance
  async analyzeProject(): Promise<Correction[]> {
    // Use your existing import fixing logic here
    // This could call fixTypeOnlyImportsFromCore() etc.
    return [];
  }
  
  protected generateSuggestion(
    filePath: string, 
    line: number, 
    match: RegExpMatchArray
  ): Suggestion {
    const fullMatch = match[0];
    
    // Determine the best fix based on import type
    if (fullMatch.includes('@/core') || fullMatch.includes('@/types')) {
      return {
        text: 'This import appears to be type-only. Add "type" keyword or split imports.',
        command: `pnpm fix:interface-imports:target ${filePath}`,
        autoFixable: true,
        priority: 'high'
      };
    }
    
    if (fullMatch.includes('Props') || fullMatch.includes('Interface')) {
      return {
        text: 'Component props/interface should be imported with "type" keyword.',
        command: `pnpm fix:interface-imports:target ${filePath} --safe`,
        autoFixable: true,
        priority: 'medium'
      };
    }
    
    return {
      text: 'Consider using import type for type-only imports.',
      command: `pnpm fix:interface-imports:target ${filePath}`,
      autoFixable: true,
      priority: 'low'
    };
  }
  
  protected classifyError(match: RegExpMatchArray): CorrectionType {
    const fullMatch = match[0];
    
    if (fullMatch.includes('import') && !fullMatch.includes('import type')) {
      if (fullMatch.includes('Props') || fullMatch.includes('Interface')) {
        return 'type-annotation';
      }
      if (fullMatch.includes('@/core')) {
        return 'compilation';
      }
    }
    
    return 'code-style';
  }
  
  protected determineSeverity(match: RegExpMatchArray, filePath: string): CorrectionSeverity {
    const fullMatch = match[0];
    
    // High severity for core module imports
    if (fullMatch.includes('@/core') && !fullMatch.includes('import type')) {
      return 'high';
    }
    
    // Medium for component props
    if (fullMatch.includes('Props') || fullMatch.includes('Interface')) {
      return 'medium';
    }
    
    return 'low';
  }
  
  protected getCategory(filePath: string, match: RegExpMatchArray): CorrectionCategory {
    const fullMatch = match[0];
    
    if (fullMatch.includes('@/core')) {
      return 'core-imports';
    }
    
    if (fullMatch.includes('Props') || fullMatch.includes('Interface')) {
      return 'react';
    }
    
    return 'imports';
  }
}