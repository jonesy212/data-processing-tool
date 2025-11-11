// analyzers/BaseAnalyzer.ts
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';

export abstract class BaseAnalyzer {
  abstract analyze(): Promise<Correction[]>;
  
  protected createCorrection(
    id: string,
    type: 'error' | 'warning' | 'suggestion',
    severity: 'critical' | 'high' | 'medium' | 'low',
    message: string,
    file: string,
    code: string,
    fix: string,
    category: 'compilation' | 'runtime' | 'security' | 'performance' | 'structure',
    line?: number
  ): Correction {
    return {
      id,
      type,
      severity,
      message,
      file,
      line,
      code,
      fix,
      category
    };
  }
}