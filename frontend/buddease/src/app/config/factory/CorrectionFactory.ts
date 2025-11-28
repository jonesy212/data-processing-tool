// CorrectionFactory.ts
// factory/CorrectionFactory.ts
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import { CorrectionInput } from '@/typings/correctionTypes';

export class CorrectionFactory {
  static create(input: CorrectionInput): Correction {
    return {
      id: `${input.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: input.type,
      severity: input.severity,
      title: input.title,
      file: input.file,
      codeSnippet: input.codeSnippet,
      suggestion: input.suggestion,
      message: input.message || '',
      category: input.category,
      line: input.line,
      description: input.description|| input.suggestion,
      code: input.code,
      fix: input.fix,
      documentationLink: input.documentationLink || '',
    };
  }

  // Convenience methods for common patterns
  static createPerformanceIssue(
    id: string,
    title: string,
    file: string,
    codeSnippet: string,
    suggestion: string,
    line?: number
  ): Correction {
    return this.create({
      id,
      type: 'warning',
      severity: 'medium',
      title,
      file,
      codeSnippet,
      suggestion,
      category: 'performance',
      line
    });
  }

  static createMaintainabilityIssue(
    id: string,
    title: string,
    file: string,
    codeSnippet: string,
    suggestion: string,
    line?: number
  ): Correction {
    return this.create({
      id,
      type: 'suggestion',
      severity: 'low',
      title,
      file,
      codeSnippet,
      suggestion,
      category: 'maintainability',
      line
    });
  }

  static createCompilationError(
    id: string,
    title: string,
    file: string,
    codeSnippet: string,
    suggestion: string,
    line?: number
  ): Correction {
    return this.create({
      id,
      type: 'error',
      severity: 'high',
      title,
      file,
      codeSnippet,
      suggestion,
      category: 'compilation',
      line
    });
  }

  static createRuntimeWarning(
    id: string,
    title: string,
    file: string,
    codeSnippet: string,
    suggestion: string,
    line?: number
  ): Correction {
    return this.create({
      id,
      type: 'warning',
      severity: 'medium',
      title,
      file,
      codeSnippet,
      suggestion,
      category: 'runtime',
      line
    });
  }

  // React Native specific helpers
  static createRNPerformanceIssue(
    id: string,
    title: string,
    file: string,
    codeSnippet: string,
    suggestion: string,
    line?: number
  ): Correction {
    return this.create({
      id,
      type: 'warning',
      severity: 'medium',
      title,
      file,
      codeSnippet,
      suggestion,
      category: 'performance',
      line
    });
  }

  static createRNConfigurationIssue(
    id: string,
    title: string,
    file: string,
    codeSnippet: string,
    suggestion: string,
    line?: number
  ): Correction {
    return this.create({
      id,
      type: 'suggestion',
      severity: 'low',
      title,
      file,
      codeSnippet,
      suggestion,
      category: 'configuration',
      line
    });
  }

  
}