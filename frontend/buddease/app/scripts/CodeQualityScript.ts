// CodeQualityScript.ts
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path';

class CodeQualityScript {
  private readonly MAX_METHOD_LENGTH = 50;
  private readonly MAX_FILE_LENGTH = 300;
  private readonly MAX_NESTING_LEVEL = 4;
  private readonly MIN_DUPLICATE_LINES = 5;

  // Main execution method
  async execute(): Promise<Correction[]> {
    console.log('🔍 Starting code quality analysis...');
    
    try {
      const files = await this.discoverAllSourceFiles();
      console.log(`📁 Found ${files.length} source files`);
      
      const magicNumbers = await this.findMagicNumbers(files);
      const longMethods = await this.identifyLongMethods(files);
      const duplicates = await this.detectDuplicates(files);
      const complexConditionals = await this.detectComplexConditionals(files);
      const importIssues = await this.analyzeImports(files);
      
      const allIssues = [
        ...magicNumbers,
        ...longMethods,
        ...duplicates,
        ...complexConditionals,
        ...importIssues
      ];
      
      const corrections = this.generateFixes(allIssues);
      
      console.log(`✅ Analysis complete: ${corrections.length} issues found`);
      return corrections;
      
    } catch (error) {
      console.error('❌ Code quality analysis failed:', error);
      return [];
    }
  }

  // File discovery logic
  private async discoverAllSourceFiles(): Promise<string[]> {
    const sourceDirs = ['src', 'app', 'lib', 'components', 'utils'];
    const fileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte'];
    const excludeDirs = ['node_modules', 'dist', 'build', '.git', '.next', '.nuxt', 'coverage'];
    
    const files: string[] = [];

    const scanDirectory = async (dir: string): Promise<void> => {
      try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            if (!excludeDirs.includes(entry.name) && !entry.name.startsWith('.')) {
              await scanDirectory(fullPath);
            }
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (fileExtensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not scan directory ${dir}:`, error);
      }
    };

    // Scan all potential source directories
    for (const dir of sourceDirs) {
      if (fs.existsSync(dir)) {
        await scanDirectory(dir);
      }
    }

    // Also scan root directory for additional files
    if (files.length === 0) {
      await scanDirectory(process.cwd());
    }

    return files;
  }

  // Magic number detection logic
  private async findMagicNumbers(files: string[]): Promise<Array<{file: string, line: number, number: string, context: string}>> {
    const issues: Array<{file: string, line: number, number: string, context: string}> = [];
    const commonNumbers = new Set(['0', '1', '2', '10', '100', '1000', '60', '24', '3600', '255']);

    for (const file of files) {
      try {
        const content = await fs.promises.readFile(file, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Skip comments and strings
          if (this.isInCommentOrString(line, index, content)) {
            return;
          }

          // Enhanced magic number patterns
          const patterns = [
            // Standalone numbers (3+ digits)
            /\b(\d{3,})\b/g,
            // Numbers in calculations (avoid common math)
            /(?<![a-zA-Z_])(\d{2,})(?:\s*[\+\-\*\/]\s*(?![01]\b))/g,
            // Numbers in array indices (avoid 0,1)
            /\[\s*(\d{2,})\s*\]/g,
            // Numbers in function calls
            /\(\s*(\d{2,})\s*\)/g
          ];

          patterns.forEach(pattern => {
            const matches = [...line.matchAll(pattern)];
            matches.forEach(match => {
              const number = match[1];
              if (!commonNumbers.has(number) && this.isLikelyMagicNumber(number, line)) {
                issues.push({
                  file,
                  line: index + 1,
                  number,
                  context: line.trim()
                });
              }
            });
          });
        });

      } catch (error) {
        console.warn(`⚠️ Could not analyze ${file} for magic numbers:`, error);
      }
    }

    console.log(`🔢 Found ${issues.length} magic number issues`);
    return issues;
  }

  // Long method detection logic
  private async identifyLongMethods(files: string[]): Promise<Array<{file: string, method: string, lines: number, startLine: number}>> {
    const issues: Array<{file: string, method: string, lines: number, startLine: number}> = [];

    for (const file of files) {
      try {
        const content = await fs.promises.readFile(file, 'utf8');
        const lines = content.split('\n');
        
        let inMethod = false;
        let methodStartLine = 0;
        let methodName = '';
        let braceCount = 0;
        let methodLines: string[] = [];

        lines.forEach((line, index) => {
          // Detect method/function start
          const methodMatch = line.match(/(?:function|const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|\(\))\s*=>|function\s+(\w+)\s*\([^)]*\)|class\s+(\w+)|(\w+)\s*\([^)]*\)\s*{/);
          if (methodMatch && !inMethod) {
            inMethod = true;
            methodStartLine = index + 1;
            methodName = methodMatch[1] || methodMatch[2] || methodMatch[3] || methodMatch[4] || 'anonymous';
            braceCount = 0;
            methodLines = [line];
            return;
          }

          if (inMethod) {
            methodLines.push(line);
            
            // Count braces to track method boundaries
            const openBraces = (line.match(/{/g) || []).length;
            const closeBraces = (line.match(/}/g) || []).length;
            braceCount += openBraces - closeBraces;

            // Method ended
            if (braceCount === 0 && line.includes('}')) {
              inMethod = false;
              const methodLength = methodLines.length;
              
              if (methodLength > this.MAX_METHOD_LENGTH) {
                issues.push({
                  file,
                  method: methodName,
                  lines: methodLength,
                  startLine: methodStartLine
                });
              }
            }
          }
        });

      } catch (error) {
        console.warn(`⚠️ Could not analyze ${file} for long methods:`, error);
      }
    }

    console.log(`📏 Found ${issues.length} long method issues`);
    return issues;
  }

  private async detectDuplicates(files: string[]): Promise<Array<{file: string, duplicates: Array<{lines: string[], count: number, startLine: number}>}>> {
    const allBlocks: Array<{file: string, block: string, lines: string[], startLine: number}> = [];
    
    // First, extract all code blocks from all files
    for (const file of files) {
      try {
        const content = await fs.promises.readFile(file, 'utf8');
        const blocks = this.extractCodeBlocks(content, file);
        allBlocks.push(...blocks);
      } catch (error) {
        console.warn(`⚠️ Could not analyze ${file} for duplicates:`, error);
      }
    }

    // Then, find duplicates across all files
    const duplicateMap = new Map<string, Array<{file: string, lines: string[], startLine: number}>>();
    
    allBlocks.forEach(({file, block, lines, startLine}) => {
      if (!duplicateMap.has(block)) {
        duplicateMap.set(block, []);
      }
      duplicateMap.get(block)!.push({file, lines, startLine});
    });

    // Group by file and format results
    const fileDuplicates = new Map<string, Array<{lines: string[], count: number, startLine: number}>>();
    
    duplicateMap.forEach((occurrences, block) => {
      if (occurrences.length > 1 && block.split('\n').length >= this.MIN_DUPLICATE_LINES) {
        occurrences.forEach(({file, lines, startLine}) => {
          if (!fileDuplicates.has(file)) {
            fileDuplicates.set(file, []);
          }
          fileDuplicates.get(file)!.push({
            lines,
            count: occurrences.length,
            startLine
          });
        });
      }
    });

    const results = Array.from(fileDuplicates.entries()).map(([file, duplicates]) => ({
      file,
      duplicates: duplicates.slice(0, 10) // Limit to top 10 per file
    }));

    console.log(`🔄 Found ${results.length} files with duplicate code`);
    return results;
  }

  // Complex conditional detection logic
  private async detectComplexConditionals(files: string[]): Promise<Array<{file: string, line: number, type: string, context: string}>> {
    const issues: Array<{file: string, line: number, type: string, context: string}> = [];

    for (const file of files) {
      try {
        const content = await fs.promises.readFile(file, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Skip comments
          if (line.trim().startsWith('//') || line.includes('/*')) {
            return;
          }

          const trimmedLine = line.trim();

          // Nested ternary detection
          if ((trimmedLine.match(/\?/g) || []).length >= 2) {
            issues.push({
              file,
              line: index + 1,
              type: 'nested-ternary',
              context: trimmedLine.substring(0, 100)
            });
          }

          // Long logical expressions
          const logicalOps = (trimmedLine.match(/(&&|\|\|)/g) || []).length;
          if (logicalOps >= 3) {
            issues.push({
              file,
              line: index + 1,
              type: 'complex-logical-expression',
              context: trimmedLine.substring(0, 100)
            });
          }

          // Deep nested parentheses
          const parenthesesDepth = this.calculateParenthesesDepth(trimmedLine);
          if (parenthesesDepth >= 3) {
            issues.push({
              file,
              line: index + 1,
              type: 'deep-nested-parentheses',
              context: trimmedLine.substring(0, 100)
            });
          }

          // Multiple conditions in if statements
          const ifMatch = trimmedLine.match(/if\s*\((.*)\)/);
          if (ifMatch) {
            const condition = ifMatch[1];
            const conditionComplexity = this.assessConditionComplexity(condition);
            if (conditionComplexity >= 3) {
              issues.push({
                file,
                line: index + 1,
                type: 'complex-if-condition',
                context: trimmedLine.substring(0, 100)
              });
            }
          }
        });

      } catch (error) {
        console.warn(`⚠️ Could not analyze ${file} for complex conditionals:`, error);
      }
    }

    console.log(`🎯 Found ${issues.length} complex conditional issues`);
    return issues;
  }

  // Import analysis logic
  private async analyzeImports(files: string[]): Promise<Array<{file: string, issue: string, line?: number, context: string}>> {
    const issues: Array<{file: string, issue: string, line?: number, context: string}> = [];

    for (const file of files) {
      try {
        const content = await fs.promises.readFile(file, 'utf8');
        const lines = content.split('\n');

        let importCount = 0;
        let hasDeepRelativeImports = false;

        lines.forEach((line, index) => {
          const trimmedLine = line.trim();

          if (trimmedLine.startsWith('import') || trimmedLine.startsWith('export')) {
            importCount++;

            // Wildcard imports
            if (trimmedLine.includes('* as') || trimmedLine.includes('import *')) {
              issues.push({
                file,
                issue: 'wildcard-import',
                line: index + 1,
                context: trimmedLine
              });
            }

            // Deep relative imports
            if (trimmedLine.includes('../../../') || trimmedLine.includes('../../..')) {
              hasDeepRelativeImports = true;
              issues.push({
                file,
                issue: 'deep-relative-import',
                line: index + 1,
                context: trimmedLine
              });
            }

            // Circular import patterns (simplified check)
            if (trimmedLine.includes('./') && trimmedLine.includes('/index')) {
              issues.push({
                file,
                issue: 'potential-circular-import',
                line: index + 1,
                context: trimmedLine
              });
            }
          }
        });

        // Too many imports
        if (importCount > 20) {
          issues.push({
            file,
            issue: 'too-many-imports',
            context: `File has ${importCount} imports`
          });
        }

        // No imports in substantial file
        const lineCount = lines.filter(l => l.trim().length > 0).length;
        if (lineCount > 50 && importCount === 0) {
          issues.push({
            file,
            issue: 'no-imports',
            context: `Substantial file (${lineCount} lines) has no imports`
          });
        }

      } catch (error) {
        console.warn(`⚠️ Could not analyze ${file} for import issues:`, error);
      }
    }

    console.log(`📦 Found ${issues.length} import-related issues`);
    return issues;
  }
  
  // Fix generation logic
  private generateFixes(issues: any[]): Correction[] {
    const corrections: Correction[] = [];

    issues.forEach(issue => {
      if (this.isMagicNumberIssue(issue)) {
        corrections.push(this.createMagicNumberCorrection({
          ...issue,
          message: issue.message || 'Magic number should be replaced with a constant',
          code: issue.number || 'N/A',
          fix: issue.fix || `const CONST_${issue.number} = ${issue.number};`
        }));
      } else if (this.isLongMethodIssue(issue)) {
        corrections.push(this.createLongMethodCorrection({
          ...issue,
          message: issue.message || 'Method exceeds recommended length',
          code: issue.code || 'N/A',
          fix: issue.fix || 'Refactor method into smaller functions'
        }));
      } else if (this.isDuplicateIssue(issue)) {
        corrections.push(...this.createDuplicateCorrections({
          ...issue,
          message: issue.message || 'Duplicate code block detected',
          code: issue.code || 'N/A',
          fix: issue.fix || 'Extract into reusable function'
        }));
      } else if (this.isComplexConditionalIssue(issue)) {
        corrections.push(this.createComplexConditionalCorrection({
          ...issue,
          message: issue.message || 'Conditional logic is too complex',
          code: issue.code || 'N/A',
          fix: issue.fix || 'Simplify the conditional logic'
        }));
      } else if (this.isImportIssue(issue)) {
        corrections.push(this.createImportCorrection({
          ...issue,
          message: issue.message || 'Import issue detected',
          code: issue.code || 'N/A',
          fix: issue.fix || 'Refactor import statements'
        }));
      }
    });

    return corrections;
  }

  // Helper methods
  private isInCommentOrString(line: string, lineIndex: number, fullContent: string): boolean {
    if (line.trim().startsWith('//') || line.includes('/*')) {
      return true;
    }
    
    // Simple string detection (could be enhanced)
    const singleQuoteCount = (line.match(/'/g) || []).length;
    const doubleQuoteCount = (line.match(/"/g) || []).length;
    return (singleQuoteCount % 2 !== 0) || (doubleQuoteCount % 2 !== 0);
  }

  private isLikelyMagicNumber(number: string, line: string): boolean {
    const num = parseInt(number);
    if (num < 2 || num > 100000) return false;
    
    // Skip numbers in common patterns
    if (line.includes('px') || line.includes('rem') || line.includes('em')) return false;
    if (line.includes('color') || line.includes('rgb') || line.includes('#')) return false;
    if (line.includes('version') || line.includes('v' + number)) return false;
    if (line.includes('id') || line.includes('ID') || line.includes('Id')) return false;
    
    return true;
  }

private extractCodeBlocks(content: string, filePath: string): Array<{file: string, block: string, lines: string[], startLine: number}> {
    const blocks: Array<{file: string, block: string, lines: string[], startLine: number}> = [];
    const lines = content.split('\n');
    
    let currentBlock: string[] = [];
    let blockStartLine = 0;
    let inBlock = false;
    let braceCount = 0;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Start of a logical block
      if ((trimmed.startsWith('if') || trimmed.startsWith('for') || trimmed.startsWith('while') || 
           trimmed.startsWith('function') || trimmed.match(/const\s+\w+\s*=\s*\(\)\s*=>/) ||
           trimmed.match(/\w+\s*\([^)]*\)\s*{/)) && !inBlock) {
        inBlock = true;
        blockStartLine = index + 1;
        currentBlock = [line];
        braceCount = 0;
      } 
      // Continue block
      else if (inBlock) {
        currentBlock.push(line);
        
        // Count braces
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;

        // End of block
        if (braceCount === 0 && currentBlock.length > 1) {
          const normalizedBlock = currentBlock
            .map(l => l.replace(/\s+/g, ' ').replace(/\w+(?=\s*=\s*[^,])/g, 'var').trim())
            .join('\n');
          
          blocks.push({
            file: filePath, // Add the file path here
            block: normalizedBlock,
            lines: [...currentBlock],
            startLine: blockStartLine
          });
          
          inBlock = false;
          currentBlock = [];
        }
      }
    });

    return blocks.filter(block => block.lines.length >= this.MIN_DUPLICATE_LINES);
}
  
  private calculateParenthesesDepth(line: string): number {
    let maxDepth = 0;
    let currentDepth = 0;

    for (const char of line) {
      if (char === '(') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === ')') {
        currentDepth--;
      }
    }

    return maxDepth;
  }

  private assessConditionComplexity(condition: string): number {
    let complexity = 0;
    
    // Count logical operators
    complexity += (condition.match(/(&&|\|\|)/g) || []).length;
    
    // Count comparison operators
    complexity += (condition.match(/(===|!==|==|!=|>|<|>=|<=)/g) || []).length;
    
    // Count function calls
    complexity += (condition.match(/\w+\(/g) || []).length;
    
    return complexity;
  }

  // Type guards for issue discrimination
  private isMagicNumberIssue(issue: any): issue is {file: string, line: number, number: string, context: string} {
    return issue.number !== undefined;
  }

  private isLongMethodIssue(issue: any): issue is {file: string, method: string, lines: number, startLine: number} {
    return issue.method !== undefined && issue.lines !== undefined;
  }

  private isDuplicateIssue(issue: any): issue is {file: string, duplicates: Array<{lines: string[], count: number, startLine: number}>} {
    return issue.duplicates !== undefined;
  }

  private isComplexConditionalIssue(issue: any): issue is {file: string, line: number, type: string, context: string} {
    return issue.type !== undefined && issue.type.includes('complex') || issue.type.includes('nested');
  }

  private isImportIssue(issue: any): issue is {file: string, issue: string, line?: number, context: string} {
    return issue.issue !== undefined && issue.issue.includes('import');
  }

  // Correction creation methods
  private createMagicNumberCorrection(issue: {
    file: string,
    line: number,
    number: string,
    context: string,
    message: string,
    code: string,
    fix: string
    
  }): Correction {
    const constantName = this.numberToConstantName(issue.number);
    
    return {
      id: `magic-number-${issue.number}-${issue.line}-${this.hashCode(issue.file)}`,
      type: 'suggestion',
      severity: this.getMagicNumberSeverity(issue.number),
      title: `Magic number detected: ${issue.number}`,
      file: issue.file,
      codeSnippet: issue.context,
      suggestion: `Replace with named constant: const ${constantName} = ${issue.number};`,
      category: 'maintainability',
      line: issue.line,
      message: issue.message,
      code: issue.code,
      fix: issue.fix,
    
    };
  }

  private createLongMethodCorrection(issue: {
    file: string,
    method: string,
    lines: number,
    startLine: number,
    message: string,
    code: string,
    fix: string
  }): Correction {
    return {
      id: `long-method-${issue.method}-${issue.startLine}-${this.hashCode(issue.file)}`,
      type: 'suggestion',
      severity: 'medium',
      title: `Method "${issue.method}" is too long (${issue.lines} lines)`,
      file: issue.file,
      codeSnippet: `Method starts at line ${issue.startLine}`,
      suggestion: `Break down into smaller functions. Consider extracting:\n- ${issue.method}Core()\n- ${issue.method}Validation()\n- ${issue.method}Processing()`,
      category: 'maintainability',
      line: issue.startLine,
      message: issue.message,
      code: issue.code,
      fix: issue.fix 
    };
  }

  private createDuplicateCorrections(issue: {
    file: string,
    duplicates: Array<{
      lines: string[],
      count: number, startLine: number
    }>,
    message: string,
    code: string,
    fix: string
  }): Correction[] {
    return issue.duplicates.map((dup, index) => ({
      id: `duplicate-code-${index}-${this.hashCode(issue.file)}`,
      type: 'suggestion',
      severity: 'medium',
      title: `Duplicate code block (${dup.count} occurrences)`,
      file: issue.file,
      codeSnippet: dup.lines.slice(0, 3).join('\n') + '\n...',
      suggestion: 'Extract duplicate code into a reusable function or utility',
      category: 'maintainability',
      line: dup.startLine,
      message: issue.message,
      code: issue.code, 
      fix: issue.fix
    }));
  }

  private createComplexConditionalCorrection(issue: {
    file: string,
    line: number,
    type: string,
    context: string,
    message: string,
    code: string,
    fix: string
  }): Correction {
    const suggestion = this.getConditionalSuggestion(issue.type, issue.context);
    
    return {
      id: `complex-conditional-${issue.type}-${issue.line}-${this.hashCode(issue.file)}`,
      type: 'suggestion',
      severity: 'medium',
      title: `Complex conditional: ${this.getConditionalTitle(issue.type)}`,
      file: issue.file,
      codeSnippet: issue.context,
      suggestion,
      category: 'readability',
      line: issue.line,
      message: issue.message,
      code: issue.code, 
      fix: issue.fix
    };
  }

  private createImportCorrection(issue: {
    file: string,
    issue: string,
    line?: number,
    context: string,
    message: string,
    code: string,
    fix: string}): Correction {
    const suggestion = this.getImportSuggestion(issue.issue);
    
    return {
      id: `import-issue-${issue.issue}-${this.hashCode(issue.file)}`,
      type: 'suggestion',
      severity: 'low',
      title: `Import issue: ${this.getImportTitle(issue.issue)}`,
      file: issue.file,
      codeSnippet: issue.context,
      suggestion,
      category: 'maintainability',
      line: issue.line,
      message: issue.message,
      code: issue.code, 
      fix: issue.fix
    };
  }

  // Additional helper methods for suggestions
  private numberToConstantName(number: string): string {
    const names: Record<string, string> = {
      '2': 'TWO', '3': 'THREE', '4': 'FOUR', '5': 'FIVE',
      '6': 'SIX', '7': 'SEVEN', '8': 'EIGHT', '9': 'NINE',
      '10': 'TEN', '60': 'SECONDS_IN_MINUTE', '3600': 'SECONDS_IN_HOUR',
      '24': 'HOURS_IN_DAY', '1000': 'MILLISECONDS_IN_SECOND'
    };
    
    return names[number] || `CONSTANT_${number}`;
  }

  private getMagicNumberSeverity(number: string): Correction['severity'] {
    const num = parseInt(number);
    if (num > 1000) return 'medium';
    return 'low';
  }

  private getConditionalTitle(type: string): string {
    const titles: Record<string, string> = {
      'nested-ternary': 'Nested ternary operations',
      'complex-logical-expression': 'Long chain of logical operators',
      'deep-nested-parentheses': 'Deeply nested parentheses',
      'complex-if-condition': 'Complex if condition'
    };
    return titles[type] || 'Complex conditional logic';
  }

  private getConditionalSuggestion(type: string, context: string): string {
    const suggestions: Record<string, string> = {
      'nested-ternary': 'Replace nested ternary with if-else statements or switch case for better readability',
      'complex-logical-expression': 'Extract logical conditions into well-named variables or helper functions',
      'deep-nested-parentheses': 'Simplify nested conditions by breaking them into separate statements',
      'complex-if-condition': 'Extract complex condition into a descriptive function with a meaningful name'
    };
    return suggestions[type] || 'Simplify the conditional logic for better maintainability';
  }

  private getImportTitle(issue: string): string {
    const titles: Record<string, string> = {
      'wildcard-import': 'Wildcard import detected',
      'deep-relative-import': 'Deep relative import path',
      'potential-circular-import': 'Potential circular import',
      'too-many-imports': 'Too many imports in file',
      'no-imports': 'No imports in substantial file'
    };
    return titles[issue] || 'Import structure issue';
  }

  private getImportSuggestion(issue: string): string {
    const suggestions: Record<string, string> = {
      'wildcard-import': 'Use named imports for better tree-shaking and code clarity',
      'deep-relative-import': 'Use absolute imports or barrel exports to simplify import paths',
      'potential-circular-import': 'Review import structure to avoid circular dependencies',
      'too-many-imports': 'Consider splitting functionality or using barrel exports to reduce import count',
      'no-imports': 'Consider if this file should be split or if dependencies are missing'
    };
    return suggestions[issue] || 'Review and optimize import structure';
  }

  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).substring(0, 8);
  }
}

export { CodeQualityScript };