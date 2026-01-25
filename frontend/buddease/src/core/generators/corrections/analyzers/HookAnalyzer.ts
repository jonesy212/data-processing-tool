// analyzers/HookAnalyzer.ts
import { BaseAnalyzer } from './BaseAnalyzer';
import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import * as fs from 'fs/promises';
import * as path from 'path';

export class HookAnalyzer extends BaseAnalyzer {
  name = 'hook';
  filePatterns = ['**/use*.ts', '**/use*.tsx'];

  // Hook-specific patterns
  private patterns = {
    hookNaming: /^use[A-Z]/,
    usesHooks: /use(State|Effect|Context|Reducer|Callback|Memo|Ref)\(/,
    effectDependencies: /useEffect\(\(\) => \{[^}]*\},?\s*(\[[^\]]*\])\)/,
    missingCleanup: /useEffect\(\(\) => \{[^}]*\}\)/,
    contextUsage: /useContext\([^)]+\)/,
    stateUpdates: /set[A-Z][a-zA-Z]*\(/,
    asyncInEffect: /useEffect\(\(\) => \{(?:[^}]*\basync\b|[^}]*\bawait\b)[^}]*\}\)/
  };

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const files = await this.getFiles(this.filePatterns);
    
    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      const hookName = path.basename(file, path.extname(file));
      
      // Validate hook naming convention
      if (!this.patterns.hookNaming.test(hookName)) {
        corrections.push(this.createHookNamingCorrection(file, hookName));
      }

      // Analyze hook implementation
      corrections.push(...this.analyzeHookImplementation(file, content, hookName));
      
      // Check for specific hook issues
      corrections.push(...this.analyzeUseEffectUsage(file, content));
      corrections.push(...this.analyzeContextUsage(file, content));
      corrections.push(...this.analyzeStateManagement(file, content));
    }
    
    return corrections;
  }

  private createHookNamingCorrection(file: string, hookName: string): Correction {
    return this.createCorrection(
      `hook-naming-${this.hashPath(file)}`,
      'error' as CorrectionType,
      'high' as CorrectionSeverity,
      `Hook violates naming convention: ${hookName}`,
      file,
      `// Hook name: ${hookName}\n// Expected: use[CapitalizedName]`,
      `Rename to: use${hookName.charAt(0).toUpperCase() + hookName.slice(1)}`,
      'hook-naming' as CorrectionCategory,
      1
    );
  }

  private analyzeHookImplementation(
    file: string, 
    content: string, 
    hookName: string
  ): Correction[] {
    const corrections: Correction[] = [];

    // Check if hook uses other hooks
    const hookMatches = content.match(this.patterns.usesHooks);
    if (!hookMatches || hookMatches.length === 0) {
      corrections.push(this.createCorrection(
        `hook-no-hooks-${this.hashPath(file)}`,
        'warning' as CorrectionType,
        'medium' as CorrectionSeverity,
        `Hook doesn't use React hooks: ${hookName}`,
        file,
        this.extractCodeSnippet(content, 'export const'),
        'Consider if this should be a regular function instead of a hook',
        'hook-architecture' as CorrectionCategory
      ));
    }

    // Check for proper return value documentation
    const hasReturn = content.includes('return');
    const hasJSDoc = content.includes('/**') || content.includes('// Returns');
    
    if (hasReturn && !hasJSDoc) {
      corrections.push(this.createCorrection(
        `hook-documentation-${this.hashPath(file)}`,
        'suggestion' as CorrectionType,
        'low' as CorrectionSeverity,
        `Hook missing return type documentation: ${hookName}`,
        file,
        this.extractCodeSnippet(content, 'return'),
        'Add JSDoc comment with @returns annotation',
        'hook-documentation' as CorrectionCategory
      ));
    }

    return corrections;
  }

  private analyzeUseEffectUsage(file: string, content: string): Correction[] {
    const corrections: Correction[] = [];
    const useEffects = this.getAllUseEffects(content);

    for (const effect of useEffects) {
      // Check for async operations in useEffect
      if (this.patterns.asyncInEffect.test(effect.code)) {
        corrections.push(this.createCorrection(
          `hook-async-effect-${this.hashPath(file)}`,
          'error' as CorrectionType,
          'critical' as CorrectionSeverity,
          'useEffect cannot be async',
          file,
          effect.code,
          'Extract async logic into separate function and call it in useEffect',
          'hook-correctness' as CorrectionCategory,
          effect.line
        ));
      }

      // Check for proper dependency array
      const depsMatch = effect.code.match(this.patterns.effectDependencies);
      if (!depsMatch) {
        corrections.push(this.createCorrection(
          `hook-effect-deps-${this.hashPath(file)}`,
          'warning' as CorrectionType,
          'high' as CorrectionSeverity,
          'useEffect missing dependency array',
          file,
          effect.code,
          'Add dependency array: useEffect(() => {...}, [])',
          'hook-dependencies' as CorrectionCategory,
          effect.line
        ));
      } else if (depsMatch[1] === '[]') {
        // Check for potential missing dependencies
        const usedVars = this.getUsedVariables(effect.code);
        if (usedVars.length > 0) {
          corrections.push(this.createCorrection(
            `hook-effect-empty-deps-${this.hashPath(file)}`,
            'warning' as CorrectionType,
            'medium' as CorrectionSeverity,
            'useEffect with empty deps but uses external variables',
            file,
            `Variables used: ${usedVars.join(', ')}`,
            `Add dependencies: [${usedVars.join(', ')}] or use callback`,
            'hook-dependencies' as CorrectionCategory,
            effect.line
          ));
        }
      }

      // Check for cleanup functions
      if (!effect.code.includes('return')) {
        const shouldHaveCleanup = this.hasEventListenersOrSubscriptions(effect.code);
        if (shouldHaveCleanup) {
          corrections.push(this.createCorrection(
            `hook-effect-cleanup-${this.hashPath(file)}`,
            'warning' as CorrectionType,
            'medium' as CorrectionSeverity,
            'useEffect may need cleanup function',
            file,
            effect.code,
            'Add return () => { cleanup logic } for event listeners/subscriptions',
            'hook-cleanup' as CorrectionCategory,
            effect.line
          ));
        }
      }
    }

    return corrections;
  }

  private getAllUseEffects(content: string): Array<{code: string, line: number}> {
    const effects: Array<{code: string, line: number}> = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('useEffect(')) {
        // Capture multi-line useEffect
        let effectCode = lines[i];
        let j = i + 1;
        let openBraces = (lines[i].match(/\(/g) || []).length - (lines[i].match(/\)/g) || []).length;
        let openCurlies = (lines[i].match(/\{/g) || []).length - (lines[i].match(/\}/g) || []).length;
        
        while ((openBraces > 0 || openCurlies > 0) && j < lines.length) {
          effectCode += '\n' + lines[j];
          openBraces += (lines[j].match(/\(/g) || []).length - (lines[j].match(/\)/g) || []).length;
          openCurlies += (lines[j].match(/\{/g) || []).length - (lines[j].match(/\}/g) || []).length;
          j++;
        }
        
        effects.push({code: effectCode, line: i + 1});
      }
    }
    
    return effects;
  }

  private getUsedVariables(effectCode: string): string[] {
    // Simple heuristic: look for variable names that aren't declared in effect
    const declaredVars = effectCode.match(/\bconst\s+(\w+)|\blet\s+(\w+)|\bvar\s+(\w+)/g) || [];
    const allVars = effectCode.match(/\b[a-zA-Z_]\w*\b/g) || [];
    
    // Filter out React hooks, built-ins, and declared variables
    const reactHooks = ['useState', 'useEffect', 'useContext', 'useReducer', 'useCallback', 'useMemo', 'useRef'];
    const usedVars = allVars.filter(v => 
      !reactHooks.includes(v) && 
      !['window', 'document', 'console'].includes(v) &&
      !declaredVars.some(decl => decl.includes(v))
    );
    
    return [...new Set(usedVars)].slice(0, 3); // Return top 3
  }

  private hasEventListenersOrSubscriptions(code: string): boolean {
    return code.includes('addEventListener') || 
           code.includes('addListener') || 
           code.includes('setInterval') || 
           code.includes('setTimeout');
  }

  private analyzeContextUsage(file: string, content: string): Correction[] {
    const corrections: Correction[] = [];
    const contextMatches = content.match(/useContext\([^)]+\)/g);

    if (contextMatches) {
      contextMatches.forEach((match, index) => {
        if (match.includes('useContext()')) {
          corrections.push(this.createCorrection(
            `hook-context-no-arg-${this.hashPath(file)}-${index}`,
            'error' as CorrectionType,
            'high' as CorrectionSeverity,
            'useContext requires context argument',
            file,
            match,
            'Pass context: useContext(MyContext)',
            'hook-correctness' as CorrectionCategory
          ));
        }

        // Check for null check
        const lines = content.split('\n');
        const contextLine = lines.findIndex(line => line.includes(match));
        if (contextLine > 0) {
          const nextLines = lines.slice(contextLine, contextLine + 3).join('\n');
          if (!nextLines.includes('if') && !nextLines.includes('?')) {
            corrections.push(this.createCorrection(
              `hook-context-null-check-${this.hashPath(file)}-${index}`,
              'warning' as CorrectionType,
              'medium' as CorrectionSeverity,
              'Context usage missing null check',
              file,
              match,
              'Add: const value = useContext(MyContext); if (!value) return null;',
              'hook-robustness' as CorrectionCategory,
              contextLine + 1
            ));
          }
        }
      });
    }

    return corrections;
  }

  private analyzeStateManagement(file: string, content: string): Correction[] {
    const corrections: Correction[] = [];
    const stateMatches = content.match(/useState<[^>]+>/g);

    if (stateMatches) {
      stateMatches.forEach((match, index) => {
        // Check for complex state without useReducer
        if (match.includes('useState<object>') || match.includes('useState<any>')) {
          corrections.push(this.createCorrection(
            `hook-state-complexity-${this.hashPath(file)}-${index}`,
            'suggestion' as CorrectionType,
            'low' as CorrectionSeverity,
            'Complex state should use useReducer',
            file,
            match,
            'Consider useReducer for complex state transitions',
            'hook-architecture' as CorrectionCategory
          ));
        }
      });
    }

    return corrections;
  }

  // Utility methods
  private extractCodeSnippet(content: string, pattern: RegExp | string, contextLines: number = 2): string {
    const lines = content.split('\n');
    const searchPattern = pattern instanceof RegExp ? pattern : new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const matchIndex = lines.findIndex(line => searchPattern.test(line));
    
    if (matchIndex === -1) return '// Pattern not found';
    
    const start = Math.max(0, matchIndex - contextLines);
    const end = Math.min(lines.length, matchIndex + contextLines + 1);
    
    return lines.slice(start, end).join('\n');
  }

  private getLineNumber(content: string, search: string): number {
    const lines = content.split('\n');
    const index = lines.findIndex(line => line.includes(search));
    return index === -1 ? 1 : index + 1;
  }

  private hashPath(filePath: string): string {
    return Buffer.from(filePath).toString('base64').slice(0, 10);
  }
}