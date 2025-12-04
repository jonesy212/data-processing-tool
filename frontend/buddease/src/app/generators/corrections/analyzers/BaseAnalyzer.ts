// BaseAnalyzer.ts
// analyzers/BaseAnalyzer.ts
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import { CorrectionFactory } from '@/app/config/factory/CorrectionFactory';
import { CorrectionType, CorrectionSeverity, CorrectionCategory } from '@/app/typings/correctionTypes';

export abstract class BaseAnalyzer {
  abstract analyze(): Promise<Correction[]>;

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
    // /* ======  DEBUG START  ====== */
    // const err = new Error(
    //   `createCorrection called – stack below\nid:${id}\nfile:${file}`
    // );
    // console.error(err.stack);
    // /* ======  DEBUG END  ====== */
    
    return CorrectionFactory.create({
      id,
      type,
      severity,
      title, // Add this
      message: title, // Keep this
      file,
      codeSnippet,
      suggestion,
      category,
      line,
      description: description || title
    });
  }


  /* ------------------------------------------------------------------ */
  protected getPriority(severity: Correction['severity']): number {
    const map: Record<typeof severity, number> = { critical: 1, high: 2, medium: 3, low: 4 };
    return map[severity] ?? 5;
  }


  // Convenience methods
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
}