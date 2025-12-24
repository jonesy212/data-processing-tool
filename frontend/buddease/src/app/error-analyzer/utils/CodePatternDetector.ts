// src/app/error-analyzer/utils/CodePatternDetector.ts

export interface CodePattern {
  name: string;
  pattern: RegExp;
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

export interface PatternMatch {
  pattern: CodePattern;
  match: string;
  line: number;
  file: string;
  context: string;
}

export class CodePatternDetector {
  private patterns: CodePattern[];

  constructor() {
    this.patterns = this.initializePatterns();
  }

  detectPatterns(code: string, filePath: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of this.patterns) {
        const patternMatches = line.match(pattern.pattern);
        if (patternMatches) {
          matches.push({
            pattern,
            match: patternMatches[0],
            line: i + 1,
            file: filePath,
            context: this.extractContext(lines, i)
          });
        }
      }
    }

    return matches;
  }

  detectSpecificPattern(code: string, patternName: string): PatternMatch[] {
    const pattern = this.patterns.find(p => p.name === patternName);
    if (!pattern) return [];

    return this.detectPatterns(code, '').filter(match => 
      match.pattern.name === patternName
    );
  }

  hasCircularImportPattern(imports: string[]): boolean {
    // Detect potential circular import patterns
    const importMap = new Map<string, string[]>();
    
    for (const imp of imports) {
      const fromMatch = imp.match(/from\s+['"]([^'"]+)['"]/);
      if (fromMatch) {
        const source = fromMatch[1];
        const importMatch = imp.match(/import\s+(?:{[^}]+}|\* as \w+|\w+)/);
        if (importMatch) {
          if (!importMap.has(source)) {
            importMap.set(source, []);
          }
          // Simplified - in production, parse imported names
        }
      }
    }

    // Check for A imports B, B imports A pattern
    const sources = Array.from(importMap.keys());
    for (let i = 0; i < sources.length; i++) {
      for (let j = i + 1; j < sources.length; j++) {
        const importsA = importMap.get(sources[i]) || [];
        const importsB = importMap.get(sources[j]) || [];
        
        // Check if they import each other
        if (importsA.some(imp => imp.includes(sources[j])) && 
            importsB.some(imp => imp.includes(sources[i]))) {
          return true;
        }
      }
    }

    return false;
  }

  hasTypeCircularity(types: string[], relationships: Map<string, string[]>): boolean {
    // Detect circular type dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (type: string): boolean => {
      if (recursionStack.has(type)) return true;
      if (visited.has(type)) return false;

      visited.add(type);
      recursionStack.add(type);

      const dependencies = relationships.get(type) || [];
      for (const dep of dependencies) {
        if (dfs(dep)) return true;
      }

      recursionStack.delete(type);
      return false;
    };

    for (const type of types) {
      if (dfs(type)) return true;
    }

    return false;
  }

  detectMissingTypeAnnotations(code: string): PatternMatch[] {
    const missingTypePatterns: CodePattern[] = [
      {
        name: 'missing-function-return-type',
        pattern: /function\s+\w+\s*\([^)]*\)\s*{/,
        description: 'Function missing return type annotation',
        severity: 'medium',
        suggestion: 'Add explicit return type: function name(): ReturnType { ... }'
      },
      {
        name: 'missing-arrow-function-type',
        pattern: /const\s+\w+\s*=\s*\([^)]*\)\s*=>/,
        description: 'Arrow function missing return type',
        severity: 'medium',
        suggestion: 'Add explicit return type: const name = (): ReturnType => { ... }'
      },
      {
        name: 'missing-variable-type',
        pattern: /(?:const|let|var)\s+\w+\s*=\s*[^:;\n]+(?!:)/,
        description: 'Variable missing type annotation',
        severity: 'low',
        suggestion: 'Add type annotation: const name: Type = value;'
      }
    ];

    return this.detectWithPatterns(code, missingTypePatterns, '');
  }

  detectAnyUsage(code: string): PatternMatch[] {
    const anyPatterns: CodePattern[] = [
      {
        name: 'explicit-any',
        pattern: /:\s*any\b/,
        description: 'Explicit "any" type usage',
        severity: 'medium',
        suggestion: 'Replace "any" with specific type or "unknown"'
      },
      {
        name: 'implicit-any-parameter',
        pattern: /function\s+\w+\s*\(\w+(?!:)\)/,
        description: 'Function parameter with implicit any',
        severity: 'medium',
        suggestion: 'Add type annotation to parameter'
      }
    ];

    return this.detectWithPatterns(code, anyPatterns, '');
  }

  detectReactPatterns(code: string): PatternMatch[] {
    const reactPatterns: CodePattern[] = [
      {
        name: 'missing-react-key',
        pattern: /\.map\s*\(\s*\([^)]*\)\s*=>\s*<[^>]*?(?<!key=)[^>]*>/,
        description: 'List rendering missing key prop',
        severity: 'high',
        suggestion: 'Add unique key prop to list items'
      },
      {
        name: 'inline-function-prop',
        pattern: /(?:onClick|onChange|onSubmit)={\s*\([^)]*\)\s*=>/,
        description: 'Inline function in JSX prop',
        severity: 'medium',
        suggestion: 'Define function outside render or use useCallback'
      },
      {
        name: 'missing-dependency-array',
        pattern: /useEffect\s*\(\s*\(\)\s*=>\s*\{[^}]*\}\s*\)/,
        description: 'useEffect without dependency array',
        severity: 'medium',
        suggestion: 'Add dependency array: useEffect(() => {}, [])'
      }
    ];

    return this.detectWithPatterns(code, reactPatterns, '');
  }

  detectPerformancePatterns(code: string): PatternMatch[] {
    const performancePatterns: CodePattern[] = [
      {
        name: 'json-parse-stringify',
        pattern: /JSON\.parse\s*\(\s*JSON\.stringify/,
        description: 'Using JSON.parse(JSON.stringify()) for cloning',
        severity: 'medium',
        suggestion: 'Use structuredClone() or library function for deep cloning'
      },
      {
        name: 'nested-loops',
        pattern: /for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)/,
        description: 'Nested loops with potential O(n²) complexity',
        severity: 'medium',
        suggestion: 'Consider optimizing algorithm or using more efficient data structures'
      },
      {
        name: 'dom-query-in-loop',
        pattern: /(?:for|while)\s*\([^)]*\)\s*\{[^}]*\.(?:querySelector|getElementById)/,
        description: 'DOM query inside loop',
        severity: 'high',
        suggestion: 'Cache DOM elements outside the loop'
      }
    ];

    return this.detectWithPatterns(code, performancePatterns, '');
  }

  private initializePatterns(): CodePattern[] {
    return [
      // Import patterns
      {
        name: 'wildcard-import',
        pattern: /import\s+\*\s+as\s+\w+\s+from/,
        description: 'Wildcard import (* as)',
        severity: 'low',
        suggestion: 'Use named imports for better tree-shaking'
      },
      {
        name: 'deep-relative-import',
        pattern: /from\s+['"]\.\.\/\.\.\/\.\.\//,
        description: 'Deep relative import path',
        severity: 'medium',
        suggestion: 'Use absolute imports or barrel exports'
      },

      // Type patterns
      {
        name: 'type-assertion-as-any',
        pattern: /as\s+any\b/,
        description: 'Type assertion to "any"',
        severity: 'medium',
        suggestion: 'Use specific type or "unknown" with type guards'
      },
      {
        name: 'non-null-assertion',
        pattern: /!\s*[)\];},]/,
        description: 'Non-null assertion operator',
        severity: 'low',
        suggestion: 'Add null check or use optional chaining'
      },

      // Code quality patterns
      {
        name: 'console-log',
        pattern: /console\.(log|warn|error|info)\(/,
        description: 'Console statement in code',
        severity: 'low',
        suggestion: 'Remove for production or use proper logging'
      },
      {
        name: 'magic-number',
        pattern: /\b\d{3,}\b/,
        description: 'Magic number (3+ digits)',
        severity: 'low',
        suggestion: 'Define as named constant'
      },
      {
        name: 'long-function',
        pattern: /function\s+\w+\s*\([^)]*\)\s*\{[^}]{100,}/,
        description: 'Potentially long function',
        severity: 'medium',
        suggestion: 'Consider breaking into smaller functions'
      }
    ];
  }

  private detectWithPatterns(code: string, patterns: CodePattern[], filePath: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of patterns) {
        const patternMatches = line.match(pattern.pattern);
        if (patternMatches) {
          matches.push({
            pattern,
            match: patternMatches[0],
            line: i + 1,
            file: filePath,
            context: this.extractContext(lines, i)
          });
        }
      }
    }

    return matches;
  }

  private extractContext(lines: string[], lineIndex: number, contextLines: number = 2): string {
    const start = Math.max(0, lineIndex - contextLines);
    const end = Math.min(lines.length, lineIndex + contextLines + 1);
    
    return lines.slice(start, end)
      .map((line, idx) => {
        const currentLine = start + idx + 1;
        const prefix = currentLine === lineIndex + 1 ? '>>> ' : '    ';
        return `${prefix}${currentLine}: ${line}`;
      })
      .join('\n');
  }

  generatePatternReport(matches: PatternMatch[]): string {
    const lines: string[] = [];
    
    lines.push('# Code Pattern Analysis');
    lines.push('');
    lines.push(`**Total Patterns Detected:** ${matches.length}`);
    lines.push('');
    
    // Group by pattern
    const grouped = new Map<string, PatternMatch[]>();
    for (const match of matches) {
      const key = match.pattern.name;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(match);
    }
    
    for (const [patternName, patternMatches] of grouped.entries()) {
      const pattern = patternMatches[0].pattern;
      
      lines.push(`## ${patternName}`);
      lines.push(`**Description:** ${pattern.description}`);
      lines.push(`**Severity:** ${pattern.severity.toUpperCase()}`);
      lines.push(`**Occurrences:** ${patternMatches.length}`);
      lines.push('');
      
      lines.push('**Suggestions:**');
      lines.push(pattern.suggestion);
      lines.push('');
      
      // Show first few matches
      if (patternMatches.length > 0) {
        lines.push('**Example Matches:**');
        for (const match of patternMatches.slice(0, 3)) {
          lines.push(`- ${match.file}:${match.line} - "${match.match.substring(0, 50)}..."`);
        }
        if (patternMatches.length > 3) {
          lines.push(`- ... and ${patternMatches.length - 3} more`);
        }
      }
      
      lines.push('');
    }
    
    // Summary by severity
    const bySeverity = new Map<string, number>();
    for (const match of matches) {
      const severity = match.pattern.severity;
      bySeverity.set(severity, (bySeverity.get(severity) || 0) + 1);
    }
    
    lines.push('## 📊 Summary by Severity');
    lines.push('');
    for (const [severity, count] of bySeverity.entries()) {
      lines.push(`- **${severity.toUpperCase()}**: ${count} patterns`);
    }
    
    return lines.join('\n');
  }
}