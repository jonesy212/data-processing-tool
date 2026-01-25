// analyzers/ReduxAnalyzer.ts
import { BaseAnalyzer, type Suggestion } from './BaseAnalyzer';
import type { CorrectionType, CorrectionSeverity, CorrectionCategory } from '@/core/typings/correctionTypes';

export class ReduxAnalyzer extends BaseAnalyzer {
  readonly name = 'redux';
  readonly errorCodes = ['TS2339', 'TS2345', 'TS2554'];
  readonly patterns = [
    /useDispatch\(\)\.([^;\s]+)/g, // Dispatch calls
    /useSelector\(([^)]+)\)/g,     // Selector calls
    /dispatch\({\s*type:\s*['"]([^'"]+)['"]/g // Action dispatch
  ];
  
  protected generateSuggestion(
    filePath: string, 
    line: number, 
    match: RegExpMatchArray
  ): Suggestion {
    const fullMatch = match[0];
    
    if (fullMatch.includes('useDispatch')) {
      return {
        text: 'Consider using typed hooks from @/hooks/redux-typed',
        command: `pnpm fix:redux-types:file ${filePath}`,
        autoFixable: true,
        priority: 'high'
      };
    }
    
    if (fullMatch.includes('useSelector')) {
      return {
        text: 'Verify selector return type matches Redux state',
        command: `pnpm analyze:redux:selectors ${filePath}`,
        autoFixable: false,
        priority: 'medium'
      };
    }
    
    return {
      text: 'Verify action type exists in Redux slice',
      command: `pnpm analyze:redux:actions ${match[1]}`,
      autoFixable: false,
      priority: 'medium'
    };
  }
  
  protected classifyError(match: RegExpMatchArray): CorrectionType {
    const fullMatch = match[0];
    
    if (fullMatch.includes('useDispatch') || fullMatch.includes('useSelector')) {
      return 'type-annotation';
    }
    
    return 'runtime';
  }
  
  protected determineSeverity(match: RegExpMatchArray, filePath: string): CorrectionSeverity {
    // High severity for potential runtime errors
    if (match[0].includes('dispatch(') && match[1]?.includes('undefined')) {
      return 'high';
    }
    
    return 'medium';
  }
  
  protected getCategory(filePath: string, match: RegExpMatchArray): CorrectionCategory {
    return 'redux';
  }
}