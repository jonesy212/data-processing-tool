RegexHelpers.ts

export class RegexHelpers {
  private static readonly patterns = {
    inlineStylesheetCreate: /StyleSheet\.create\(\s*\{[^}]*\}/g,
    inlineStyleObject: /<View.*style=\{.*\}/g,
    consoleStatement: /console\.(log|warn|error)\(/g,
    deepRelativeImport: /import.*from.*['"`]\.\.\/\.\.\/\.\./g,
    zeroTimeout: /setTimeout\(.*,\s*0\)/g,
    unsafeJsonParse: /JSON\.parse\(.*\)/g,
    scrollViewDirectView: /<ScrollView.*>\s*<View/g,
    inlineArrowFunction: /onPress=\{\(\)\s*=>\s*\{/g,
    listMapWithoutKey: /\.map\(.*\{.*=>/g,
    unsafeOptionalChaining: /(\w+)\.\?\./g,
    renderMethodComplex: /render\(\)\s*\{[^}]*\{[^}]*\{/g,
    versionConflict: /found: (.*)\n.*required: (.*)/g,
    memoryExhaustion: /JavaScript heap out of memory/g,
  };

  /**
   * Test if content matches a specific pattern
   */
  static test(patternName: keyof typeof RegexHelpers.patterns, content: string): boolean {
    const pattern = this.patterns[patternName];
    return pattern.test(content);
  }

  /**
   * Find all matches for a specific pattern
   */
  static match(patternName: keyof typeof RegexHelpers.patterns, content: string): RegExpMatchArray[] {
    const pattern = this.patterns[patternName];
    const matches: RegExpMatchArray[] = [];
    let match: RegExpMatchArray | null;
    
    // Reset the regex state
    const regex = new RegExp(pattern.source, pattern.flags);
    
    while ((match = regex.exec(content)) !== null) {
      matches.push(match);
      // Prevent infinite loops for zero-length matches
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
    }
    
    return matches;
  }

  /**
   * Count occurrences of a pattern
   */
  static count(patternName: keyof typeof RegexHelpers.patterns, content: string): number {
    return this.match(patternName, content).length;
  }

  /**
   * Extract specific groups from matches
   */
  static extractGroups(patternName: keyof typeof RegexHelpers.patterns, content: string): string[][] {
    const matches = this.match(patternName, content);
    return matches.map(match => {
      // Return all capture groups (excluding the full match)
      return match.slice(1).filter(group => group !== undefined);
    });
  }

  /**
   * Replace matches with a replacement string
   */
  static replace(
    patternName: keyof typeof RegexHelpers.patterns, 
    content: string, 
    replacement: string | ((match: string, ...groups: string[]) => string)
  ): string {
    const pattern = this.patterns[patternName];
    if (typeof replacement === 'string') {
      return content.replace(pattern, replacement);
    } else {
      return content.replace(pattern, replacement);
    }
  }

  /**
   * Find the line numbers where patterns occur
   */
  static findLineNumbers(patternName: keyof typeof RegexHelpers.patterns, content: string): Array<{ line: number; match: string }> {
    const lines = content.split('\n');
    const results: Array<{ line: number; match: string }> = [];
    const pattern = this.patterns[patternName];
    
    lines.forEach((line, index) => {
      const matches = line.match(pattern);
      if (matches) {
        matches.forEach(match => {
          results.push({
            line: index + 1, // 1-based line numbers
            match: match
          });
        });
      }
    });
    
    return results;
  }

  /**
   * Check if any of multiple patterns match
   */
  static testAny(patternNames: Array<keyof typeof RegexHelpers.patterns>, content: string): boolean {
    return patternNames.some(patternName => this.test(patternName, content));
  }

  /**
   * Get all pattern names that match the content
   */
  static getMatchingPatterns(content: string): Array<keyof typeof RegexHelpers.patterns> {
    const matching: Array<keyof typeof RegexHelpers.patterns> = [];
    
    (Object.keys(this.patterns) as Array<keyof typeof RegexHelpers.patterns>).forEach(patternName => {
      if (this.test(patternName, content)) {
        matching.push(patternName);
      }
    });
    
    return matching;
  }

  /**
   * Validate and get pattern information
   */
  static getPatternInfo(patternName: keyof typeof RegexHelpers.patterns): { 
    pattern: RegExp; 
    description: string;
    category: string;
  } {
    const descriptions: Record<keyof typeof RegexHelpers.patterns, { description: string; category: string }> = {
      inlineStylesheetCreate: {
        description: 'Inline StyleSheet.create calls (should be moved to styles file)',
        category: 'performance'
      },
      inlineStyleObject: {
        description: 'Inline style objects in JSX (causes re-renders)',
        category: 'performance'
      },
      consoleStatement: {
        description: 'Console statements (should be removed in production)',
        category: 'maintainability'
      },
      deepRelativeImport: {
        description: 'Deep relative imports (hard to maintain)',
        category: 'structure'
      },
      zeroTimeout: {
        description: 'setTimeout with zero delay (can cause performance issues)',
        category: 'performance'
      },
      unsafeJsonParse: {
        description: 'Unsafe JSON.parse without error handling',
        category: 'security'
      },
      scrollViewDirectView: {
        description: 'ScrollView with direct View child (should use FlatList for performance)',
        category: 'performance'
      },
      inlineArrowFunction: {
        description: 'Inline arrow functions in props (causes unnecessary re-renders)',
        category: 'performance'
      },
      listMapWithoutKey: {
        description: 'Array.map without key prop (React performance warning)',
        category: 'performance'
      },
      unsafeOptionalChaining: {
        description: 'Potentially unsafe optional chaining usage',
        category: 'runtime'
      },
      renderMethodComplex: {
        description: 'Complex nested render method (hard to maintain)',
        category: 'maintainability'
      },
      versionConflict: {
        description: 'Version conflict detected in build logs',
        category: 'compilation'
      },
      memoryExhaustion: {
        description: 'JavaScript heap memory exhaustion',
        category: 'performance'
      }
    };

    return {
      pattern: this.patterns[patternName],
      ...descriptions[patternName]
    };
  }

  /**
   * Get all available pattern names
   */
  static getAvailablePatterns(): Array<keyof typeof RegexHelpers.patterns> {
    return Object.keys(this.patterns) as Array<keyof typeof RegexHelpers.patterns>;
  }

  /**
   * Create a custom pattern and add it temporarily
   */
  static createCustomPattern(name: string, pattern: RegExp): void {
    // Note: This won't persist the pattern in the static patterns object
    // but can be used for one-off operations
    (this.patterns as any)[name] = pattern;
  }

  /**
   * Analyze content and return detailed report
   */
  static analyzeContent(content: string): Array<{
    pattern: keyof typeof RegexHelpers.patterns;
    count: number;
    lines: number[];
    description: string;
    category: string;
  }> {
    const analysis: Array<{
      pattern: keyof typeof RegexHelpers.patterns;
      count: number;
      lines: number[];
      description: string;
      category: string;
    }> = [];

    this.getAvailablePatterns().forEach(patternName => {
      const matches = this.match(patternName, content);
      if (matches.length > 0) {
        const lineNumbers = this.findLineNumbers(patternName, content).map(item => item.line);
        const patternInfo = this.getPatternInfo(patternName);
        
        analysis.push({
          pattern: patternName,
          count: matches.length,
          lines: lineNumbers,
          description: patternInfo.description,
          category: patternInfo.category
        });
      }
    });

    return analysis.sort((a, b) => b.count - a.count); // Sort by count descending
  }

  /**
   * Check if content contains any problematic patterns
   */
  static hasIssues(content: string): boolean {
    return this.getAvailablePatterns().some(patternName => this.test(patternName, content));
  }

  /**
   * Get a summary of issues found
   */
  static getIssueSummary(content: string): { 
    totalIssues: number; 
    byCategory: Record<string, number>;
    criticalIssues: Array<keyof typeof RegexHelpers.patterns>;
  } {
    const analysis = this.analyzeContent(content);
    const byCategory: Record<string, number> = {};
    const criticalIssues: Array<keyof typeof RegexHelpers.patterns> = [];
    
    analysis.forEach(item => {
      byCategory[item.category] = (byCategory[item.category] || 0) + item.count;
      
      // Consider security and critical performance issues as critical
      if (item.category === 'security' || 
          (item.category === 'performance' && item.count > 3) ||
          item.pattern === 'memoryExhaustion') {
        criticalIssues.push(item.pattern);
      }
    });

    return {
      totalIssues: analysis.reduce((sum, item) => sum + item.count, 0),
      byCategory,
      criticalIssues
    };
  }
}

Default export for backward compatibility
export default RegexHelpers;

Utility function exports for common use cases
export const testPattern = RegexHelpers.test.bind(RegexHelpers);
export const matchPattern = RegexHelpers.match.bind(RegexHelpers);
export const countPattern = RegexHelpers.count.bind(RegexHelpers);
export const analyzeContent = RegexHelpers.analyzeContent.bind(RegexHelpers);
export const hasIssues = RegexHelpers.hasIssues.bind(RegexHelpers);