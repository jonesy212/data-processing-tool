// PatternAnalyzer.ts
// analyzers/PatternAnalyzer.ts

import fs from 'fs';
import path from 'path';
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import { BaseAnalyzer } from '@/app/generators/corrections/analyzers/BaseAnalyzer'
import { CorrectionMessageGenerator } from '@/app/generators/corrections/CorrectionMessageGenerator'
import { CorrectionFactory } from '@/app/config/factory/CorrectionFactory'

export class PatternAnalyzer extends BaseAnalyzer  {

  private async analyzeFile(filePath: string): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      
      // Run all pattern detection methods on the file content
      corrections.push(...this.detectMagicNumbers(content, filePath));
      corrections.push(...this.detectLongMethods(content, filePath));
      corrections.push(...this.detectComplexConditionals(content, filePath));
      corrections.push(...this.detectDuplicateCode(content, filePath));
      corrections.push(...this.detectLongFunctions(content, filePath));
      corrections.push(...this.detectDeepNesting(content, filePath));
      corrections.push(...this.analyzeComments(content, filePath));
      
      // Additional analysis for specific file types
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        corrections.push(...this.analyzeTypeScriptFile(content, filePath));
      }
      
      if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
        corrections.push(...this.analyzeReactFile(content, filePath));
      }
      
    } catch (error) {
      console.warn(`Could not analyze file ${filePath}:`, error);
    }
    
    return corrections;
  }
  private async analyzeWithParallelism(files: string[]): Promise<Correction[]> {
    const batchSize = 10; // Process files in batches
    const corrections: Correction[] = [];
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(file => this.analyzeFile(file))
      );
      corrections.push(...batchResults.flat());
    }
    
    return corrections;
  }
  
  // Helper methods
  private isSourceFile(filename: string): boolean {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte'];
    return extensions.some(ext => filename.endsWith(ext));
  }
  
  private getAllTypeScriptFiles(dir: string = process.cwd()): string[] {
    const config = {
      sourceDirs: ['src', 'app', 'components', 'utils', 'lib', 'pages'],
      excludeDirs: [
        'node_modules', 'dist', 'build', '.git', '.next', '.nuxt',
        'coverage', 'platform', '.vscode', '.github', 'public'
      ],
      extensions: ['.ts', '.tsx', '.mts', '.cts']
    };

    const files: string[] = [];
    const scannedDirs = new Set<string>();

    const scanDirectory = (currentDir: string): void => {
      if (scannedDirs.has(currentDir)) return;
      scannedDirs.add(currentDir);

      try {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          
          if (config.excludeDirs.includes(item)) {
            continue;
          }

          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            scanDirectory(fullPath);
          } else if (stat.isFile() && this.isTypeScriptFile(item, config.extensions)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Could not read directory: ${currentDir}`, error);
      }
    };

    // Scan source directories
    for (const sourceDir of config.sourceDirs) {
      const fullSourcePath = path.resolve(dir, sourceDir);
      if (fs.existsSync(fullSourcePath)) {
        scanDirectory(fullSourcePath);
      }
    }

    console.log(`📁 Found ${files.length} TypeScript files in ${scannedDirs.size} directories`);
    return files;
  }

  private isTypeScriptFile(filename: string, extensions: string[] = ['.ts', '.tsx', '.mts', '.cts']): boolean {
    const ext = path.extname(filename).toLowerCase();
    return extensions.includes(ext);
  }


private detectLongMethods(content: string, filePath: string): Correction[] {
  const corrections: Correction[] = [];
  const lines = content.split('\n');
  const MAX_METHOD_LENGTH = 20;
  
  let inMethod = false;
  let methodStartLine = 0;
  let methodName = '';
  let braceCount = 0;
  let methodLines: string[] = [];

  lines.forEach((line, index) => {
    // Detect method start
    const methodMatch = line.match(/(?:function|const|let|var)\s+(\w+)\s*=\s*\([^)]*\)\s*=>|function\s+(\w+)\s*\([^)]*\)|class\s+(\w+)/);
    if (methodMatch && !inMethod) {
      inMethod = true;
      methodStartLine = index + 1;
      methodName = methodMatch[1] || methodMatch[2] || methodMatch[3] || 'anonymous';
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
        
        if (methodLength > MAX_METHOD_LENGTH) {
          corrections.push(this.createCorrection(
            `long-method-${methodName}-${methodStartLine}`,
            'suggestion',
            'medium',
            `Method "${methodName}" is too long (${methodLength} lines)`,
            filePath,
            methodLines.slice(0, 3).join('\n') + '\n...',
            `Refactor method "${methodName}" into smaller functions. Consider breaking it down into:\n- ${methodName}Core()\n- ${methodName}Validation()\n- ${methodName}Processing()`,
            'maintainability',
            methodStartLine
          ));
        }
      }
    }
  });

  return corrections;
}



  
private detectComplexConditionals(content: string, filePath: string): Correction[] {
  const corrections: Correction[] = [];
  const lines = content.split('\n');
  
  const complexPatterns = [
    // Nested ternary operations
    /(\?.*:.*\?.*:)/g,
    // Long logical expressions
    /(&&|\|\|){4,}/g,
    // Deeply nested parentheses
    /\([^()]*\([^()]*\([^()]*\)[^()]*\)[^()]*\)/g
  ];

  lines.forEach((line, index) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.includes('/*')) {
      return;
    }

    // Check for complex conditionals
    complexPatterns.forEach((pattern, patternIndex) => {
      const matches = line.match(pattern);
      if (matches) {
        const issueType = [
          'nested-ternary',
          'long-logical-expression', 
          'deep-nested-parentheses'
        ][patternIndex];
        
        corrections.push(this.createCorrection(
          `complex-conditional-${issueType}-${index}`,
          'suggestion',
          'medium',
          `Complex conditional detected: ${this.getConditionalDescription(issueType)}`,
          filePath,
          line.trim(),
          this.getConditionalFix(issueType, line),
          'readability',
          index + 1
        ));
      }
    });

    // Check for too many conditions in if statements
    const ifMatch = line.match(/if\s*\((.*)\)/);
    if (ifMatch) {
      const condition = ifMatch[1];
      const andCount = (condition.match(/&&/g) || []).length;
      const orCount = (condition.match(/\|\|/g) || []).length;
      
      if (andCount + orCount >= 3) {
        corrections.push(this.createCorrection(
          `complex-if-condition-${index}`,
          'suggestion',
          'medium',
          `Complex if condition with ${andCount + orCount} logical operators`,
          filePath,
          line.trim(),
          `Extract complex condition into a descriptive function:\nconst shouldProcess = ${condition.replace(/&&/g, ' && ').replace(/\|\|/g, ' || ')};\nif (shouldProcess) { ... }`,
          'readability',
          index + 1
        ));
      }
    }
  });

  return corrections;
}

private getConditionalDescription(issueType: string): string {
  const descriptions: Record<string, string> = {
    'nested-ternary': 'Nested ternary operations',
    'long-logical-expression': 'Long chain of logical operators',
    'deep-nested-parentheses': 'Deeply nested parentheses'
  };
  return descriptions[issueType] || 'Complex conditional';
}

private getConditionalFix(issueType: string, originalLine: string): string {
  const fixes: Record<string, string> = {
    'nested-ternary': 'Replace nested ternary with if-else statements or switch case',
    'long-logical-expression': 'Extract logical conditions into well-named variables or functions',
    'deep-nested-parentheses': 'Simplify nested conditions by breaking them into separate statements'
  };
  return fixes[issueType] || 'Simplify the conditional logic';
}

private detectDuplicateCode(content: string, filePath: string): Correction[] {
  const corrections: Correction[] = [];
  const lines = content.split('\n');
  
  // Simple duplicate detection: look for repeated code blocks
  const codeBlocks = this.extractCodeBlocks(content);
  const duplicates = this.findDuplicates(codeBlocks);

  duplicates.forEach((duplicate, index) => {
    if (duplicate.count > 1) {
      corrections.push(this.createCorrection(
        `duplicate-code-${index}`,
        'suggestion',
        'low',
        `Duplicate code block found (${duplicate.count} occurrences)`,
        filePath,
        duplicate.lines.join('\n').substring(0, 200) + '...',
        `Extract duplicate code into a reusable function:\n\nfunction handleDuplicateLogic(params) {\n  ${duplicate.lines.join('\n  ')}\n}`,
        'maintainability',
        duplicate.startLine
      ));
    }
  });

  return corrections;
}

private extractCodeBlocks(content: string): Array<{lines: string[], startLine: number}> {
  const blocks: Array<{lines: string[], startLine: number}> = [];
  const lines = content.split('\n');
  
  let currentBlock: string[] = [];
  let blockStartLine = 0;
  let inBlock = false;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Start of a logical block
    if ((trimmed.startsWith('if') || trimmed.startsWith('for') || trimmed.startsWith('while') || 
         trimmed.match(/const\s+\w+\s*=\s*\(\)\s*=>/) || trimmed.match(/function\s+\w+/)) && 
        !inBlock) {
      inBlock = true;
      blockStartLine = index + 1;
      currentBlock = [line];
    } 
    // Continue block
    else if (inBlock) {
      currentBlock.push(line);
      
      // End of block (simple detection)
      if (trimmed === '}' && currentBlock.filter(l => l.includes('{')).length === 
          currentBlock.filter(l => l.includes('}')).length) {
        blocks.push({
          lines: currentBlock,
          startLine: blockStartLine
        });
        inBlock = false;
        currentBlock = [];
      }
    }
  });

  return blocks;
}

private findDuplicates(blocks: Array<{lines: string[], startLine: number}>): Array<{lines: string[], startLine: number, count: number}> {
  const duplicates: Array<{lines: string[], startLine: number, count: number}> = [];
  const seen = new Map<string, {lines: string[], startLine: number, count: number}>();

  blocks.forEach(block => {
    // Create a normalized version (remove whitespace and variable names)
    const normalized = block.lines
      .map(line => line
        .replace(/\s+/g, ' ')
        .replace(/\w+(?=\s*=\s*[^,])/g, 'var') // Normalize variable names
        .trim()
      )
      .join('\n');

    if (seen.has(normalized)) {
      const existing = seen.get(normalized)!;
      existing.count++;
    } else {
      seen.set(normalized, { ...block, count: 1 });
    }
  });

  // Return only actual duplicates (count > 1) and significant blocks (> 3 lines)
  return Array.from(seen.values())
    .filter(item => item.count > 1 && item.lines.length > 3)
    .sort((a, b) => b.lines.length - a.lines.length); // Sort by block size
}


  private detectMagicNumbers(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];
    const lines = content.split('\n');
    
    // Enhanced pattern to catch more magic number scenarios
    const magicNumberPatterns = [
      // Standalone numbers (3+ digits)
      /(?:[^a-zA-Z0-9_.]|^)(\d{3,})(?:[^a-zA-Z0-9_.]|$)/g,
      // Numbers in calculations (avoid common math)
      /(?<![a-zA-Z_])(\d{2,})(?:\s*[\+\-\*\/]\s*(?![01]\b))/g,
      // Numbers in array indices (avoid 0,1)
      /\[\s*(\d{2,})\s*\]/g
    ];

    const commonNumbers = new Set([
      '0', '1', '2', '10', '100', '1000', '1024', '60', '24', '3600', 
      '255', '512', '2048', '4096', '8192', '16', '32', '64', '128'
    ]);

    lines.forEach((line, lineNumber) => {
      // Skip comments and strings to reduce false positives
      if (this.isInCommentOrString(line, lineNumber, content)) {
        return;
      }

      magicNumberPatterns.forEach(pattern => {
        const matches = [...line.matchAll(pattern)];
        
        matches.forEach(match => {
          const number = match[1];
          if (!commonNumbers.has(number) && this.isLikelyMagicNumber(number, line)) {
            corrections.push(this.createCorrection(
              `magic-number-${number}-${lineNumber}`,
              'suggestion',
              this.getMagicNumberSeverity(number),
              `Magic number detected: ${number}`,
              filePath,
              line.trim(),
              this.getMagicNumberFix(number, line),
              'maintainability',
              lineNumber + 1
            ));
          }
        });
      });
    });

    return corrections;
  }

  private isInCommentOrString(line: string, lineNumber: number, content: string): boolean {
    // Simple check for line comments
    if (line.trim().startsWith('//') || line.includes('/*')) {
      return true;
    }
    
    // Check for strings (basic implementation)
    const quoteCount = (line.match(/"/g) || []).length;
    return quoteCount % 2 !== 0;
  }

  private isLikelyMagicNumber(number: string, line: string): boolean {
    const num = parseInt(number);
    
    // Skip numbers that are likely not magic
    if (num < 2 || num > 100000) return false;
    
    // Skip numbers in common patterns
    if (line.includes('px') || line.includes('rem') || line.includes('em')) return false;
    if (line.includes('color') || line.includes('rgb') || line.includes('#')) return false;
    if (line.includes('version') || line.includes('v' + number)) return false;
    
    return true;
  }

  private getMagicNumberSeverity(number: string): Correction['severity'] {
    const num = parseInt(number);
    if (num > 1000) return 'medium';
    if (num > 100) return 'low';
    return 'low';
  }

  private getMagicNumberFix(number: string, originalLine: string): string {
    const constantName = this.numberToConstantName(number);
    
    // Try to preserve the original context
    if (originalLine.includes('=')) {
      return originalLine.replace(
        new RegExp(`\\b${number}\\b`), 
        constantName
      );
    }
    
    return `const ${constantName} = ${number};\n${originalLine.replace(
      new RegExp(`\\b${number}\\b`), 
      constantName
    )}`;
  }

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const sourceFiles = this.getAllTypeScriptFiles();
    
    console.log(`🔍 Analyzing ${sourceFiles.length} TypeScript files for code patterns...`);
    
    for (const file of sourceFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        corrections.push(...this.detectMagicNumbers(content, file));
        corrections.push(...this.detectLongMethods(content, file));
        corrections.push(...this.detectComplexConditionals(content, file));
        corrections.push(...this.detectDuplicateCode(content, file));
      } catch (error) {
        console.warn(`Could not analyze ${file}:`, error);
      }
    }

    console.log('🔍 Analyzing code patterns...');

    // Analyze source code patterns
    const sourcePatterns = await this.analyzeSourceCodePatterns();
    corrections.push(...sourcePatterns);

    // Analyze performance patterns
    const performancePatterns = await this.analyzePerformancePatterns();
    corrections.push(...performancePatterns);

    // Analyze maintainability patterns
    const maintainabilityPatterns = await this.analyzeMaintainabilityPatterns();
    corrections.push(...maintainabilityPatterns);

    // Analyze TypeScript patterns
    const typescriptPatterns = await this.analyzeTypeScriptPatterns();
    corrections.push(...typescriptPatterns);

    // Analyze React patterns
    const reactPatterns = await this.analyzeReactPatterns();
    corrections.push(...reactPatterns);

    return corrections;
  }

  private async analyzeSourceCodePatterns(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const srcDir = path.resolve(process.cwd(), 'src');
    
    if (!fs.existsSync(srcDir)) {
      return corrections;
    }

    try {
      const files = await this.getSourceFiles(srcDir);
      
      for (const file of files) {
        const content = await fs.promises.readFile(file, 'utf8');
        const filePatterns = this.analyzeFilePatterns(content, file);
        corrections.push(...filePatterns);
      }

    } catch (error) {
      console.warn('Could not analyze source code patterns:', error);
    }

    return corrections;
  }

  private async getSourceFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    const scanDirectory = async (currentDir: string) => {
      const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (this.isSourceFile(entry.name)) {
          files.push(fullPath);
        }
      }
    };

    await scanDirectory(dir);
    return files;
  }

  private analyzeFilePatterns(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];
    const lines = content.split('\n');

    // Long function/method detection
    const longFunctionPatterns = this.detectLongFunctions(content, filePath);
    corrections.push(...longFunctionPatterns);

    // Complex conditional detection
    const complexConditionals = this.detectComplexConditionals(content, filePath);
    corrections.push(...complexConditionals);

    // Deep nesting detection
    const deepNesting = this.detectDeepNesting(content, filePath);
    corrections.push(...deepNesting);

    // Magic numbers detection
    const magicNumbers = this.detectMagicNumbers(content, filePath);
    corrections.push(...magicNumbers);

    // Code duplication patterns
    const duplication = this.detectCodeDuplication(content, filePath);
    corrections.push(...duplication);

    // Comment patterns
    const commentIssues = this.analyzeComments(content, filePath);
    corrections.push(...commentIssues);

    return corrections;
  }

  private detectLongFunctions(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];
    const lines = content.split('\n');
    
    let inFunction = false;
    let functionStartLine = 0;
    let functionName = '';
    let braceCount = 0;

    lines.forEach((line, index) => {
      // Detect function start
      const functionMatch = line.match(/(?:function|const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|\(\))\s*=>|function\s+(\w+)\s*\([^)]*\)/);
      if (functionMatch && !inFunction) {
        inFunction = true;
        functionStartLine = index;
        functionName = functionMatch[1] || functionMatch[2] || 'anonymous';
        braceCount = 0;
      }

      if (inFunction) {
        // Count braces to detect function end
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;

        // Function ended
        if (braceCount === 0 && functionStartLine !== index) {
          const functionLength = index - functionStartLine;
          
          if (functionLength > 50) {
            corrections.push(this.createCorrection(
              `long-function-${functionName}`,
              'warning',
              'medium',
              `Function "${functionName}" is too long (${functionLength} lines)`,
              filePath,
              `Function from line ${functionStartLine + 1} to ${index + 1}`,
              'Break down into smaller, focused functions',
              'maintainability',
              functionStartLine + 1
            ));
          }
          
          inFunction = false;
        }
      }
    });

    return corrections;
  }

  private detectDeepNesting(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];
    const lines = content.split('\n');
    
    let nestingLevel = 0;
    let maxNesting = 0;
    let maxNestingLine = 0;

    lines.forEach((line, index) => {
      // Count opening braces (increase nesting)
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      
      nestingLevel += openBraces - closeBraces;
      
      if (nestingLevel > maxNesting) {
        maxNesting = nestingLevel;
        maxNestingLine = index + 1;
      }

      // Reset for function boundaries
      if (line.includes('function') || line.includes('=>')) {
        if (maxNesting > 4) {
          corrections.push(this.createCorrection(
            `deep-nesting-${maxNestingLine}`,
            'warning',
            'medium',
            `Deep nesting detected (${maxNesting} levels)`,
            filePath,
            `Maximum nesting at line ${maxNestingLine}`,
            'Extract nested code into separate functions',
            'maintainability',
            maxNestingLine
          ));
        }
        maxNesting = 0;
      }
    });

    return corrections;
  }


  private detectCodeDuplication(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];
    
    // Simple duplicate line detection (basic approach)
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 10);
    const lineCounts = new Map<string, number>();
    
    lines.forEach(line => {
      lineCounts.set(line, (lineCounts.get(line) || 0) + 1);
    });

    lineCounts.forEach((count, line) => {
      if (count > 3 && line.length > 20) {
        corrections.push(this.createCorrection(
          `duplicate-code-${this.hashCode(line)}`,
          'warning',
          'medium',
          'Potential code duplication detected',
          filePath,
          `Line repeated ${count} times: ${line.substring(0, 50)}...`,
          'Extract duplicated code into reusable function',
          'maintainability'
        ));
      }
    });

    return corrections;
  }

  private analyzeComments(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];
    const lines = content.split('\n');
    
    let hasComments = false;
    let todoCount = 0;
    const todoLines: number[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check for comments
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
        hasComments = true;
        
        // Check for TODO comments
        if (trimmedLine.toLowerCase().includes('todo')) {
          todoCount++;
          todoLines.push(index + 1);
        }

        // Check for commented code
        if (this.looksLikeCode(trimmedLine) && !trimmedLine.includes('TODO') && !trimmedLine.includes('FIXME')) {
          corrections.push(this.createCorrection(
            `commented-code-${index}`,
            'suggestion',
            'low',
            'Commented code detected',
            filePath,
            trimmedLine,
            'Remove commented code or uncomment if needed',
            'maintainability',
            index + 1
          ));
        }
      }
    });

    // Report TODO comments
    if (todoCount > 0) {
      corrections.push(this.createCorrection(
        'todo-comments',
        'warning',
        'low',
        `${todoCount} TODO comments found`,
        filePath,
        `TODOs at lines: ${todoLines.join(', ')}`,
        'Address TODO comments before production',
        'maintainability'
      ));
    }

    // Check for lack of comments in complex files
    const lineCount = lines.filter(line => line.trim().length > 0).length;
    if (lineCount > 100 && !hasComments) {
      corrections.push(this.createCorrection(
        'missing-comments',
        'suggestion',
        'low',
        'No comments found in substantial file',
        filePath,
        `${lineCount} lines without comments`,
        'Add comments for complex logic and public APIs',
        'readability'
      ));
    }

    return corrections;
  }

  private async analyzePerformancePatterns(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const srcDir = path.resolve(process.cwd(), 'src');
    
    if (!fs.existsSync(srcDir)) return corrections;

    try {
      const files = await this.getSourceFiles(srcDir);
      
      for (const file of files) {
        const content = await fs.promises.readFile(file, 'utf8');
        
        // Inefficient loop patterns
        const loopPatterns = this.detectInefficientLoops(content, file);
        corrections.push(...loopPatterns);

        // Memory leak patterns
        const memoryPatterns = this.detectMemoryPatterns(content, file);
        corrections.push(...memoryPatterns);

        // Expensive operation patterns
        const expensiveOps = this.detectExpensiveOperations(content, file);
        corrections.push(...expensiveOps);
      }

    } catch (error) {
      console.warn('Could not analyze performance patterns:', error);
    }

    return corrections;
  }

  private detectInefficientLoops(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Nested loops with high complexity
      if (line.includes('for') && line.includes('for')) {
        corrections.push(this.createCorrection(
          `nested-loop-${index}`,
          'warning',
          'medium',
          'Potential nested loop with O(n²) complexity',
          filePath,
          line.trim(),
          'Consider optimizing algorithm or using more efficient data structures',
          'performance',
          index + 1
        ));
      }

      // DOM queries in loops
      if ((line.includes('querySelector') || line.includes('getElementById')) && 
          (line.includes('for') || line.includes('while'))) {
        corrections.push(this.createCorrection(
          `dom-query-in-loop-${index}`,
          'warning',
          'medium',
          'DOM query inside loop',
          filePath,
          line.trim(),
          'Cache DOM elements outside the loop',
          'performance',
          index + 1
        ));
      }
    });

    return corrections;
  }

  private detectMemoryPatterns(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];
    
    // Large object creation patterns
    if (content.includes('JSON.parse') && content.includes('JSON.stringify')) {
      corrections.push(this.createCorrection(
        'json-parse-stringify',
        'suggestion',
        'low',
        'JSON.parse/stringify operations detected',
        filePath,
        'Deep cloning with JSON',
        'Consider structuredClone or manual copying for better performance',
        'performance'
      ));
    }

    // Array copying patterns
    if (content.includes('.slice()') && content.includes('.concat()')) {
      corrections.push(this.createCorrection(
        'array-copying',
        'suggestion',
        'low',
        'Multiple array copying operations',
        filePath,
        'Array copying patterns',
        'Use spread operator [...] for better readability and performance',
        'performance'
      ));
    }

    return corrections;
  }

  private detectExpensiveOperations(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];
    
    // Regular expression creation in loops
    if (content.includes('new RegExp') && (content.includes('for') || content.includes('while'))) {
      corrections.push(this.createCorrection(
        'regex-in-loop',
        'warning',
        'medium',
        'Regular expression creation in loop',
        filePath,
        'new RegExp in loop context',
        'Create regex outside loop and reuse it',
        'performance'
      ));
    }

    // Synchronous file operations
    if (content.includes('fs.readFileSync') && !content.includes('// async')) {
      corrections.push(this.createCorrection(
        'sync-file-op',
        'suggestion',
        'low',
        'Synchronous file operation detected',
        filePath,
        'fs.readFileSync usage',
        'Use async/await with fs.promises for better performance',
        'performance'
      ));
    }

    return corrections;
  }

  private async analyzeMaintainabilityPatterns(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const srcDir = path.resolve(process.cwd(), 'src');
    
    if (!fs.existsSync(srcDir)) return corrections;

    try {
      const files = await this.getSourceFiles(srcDir);
      
      for (const file of files) {
        const content = await fs.promises.readFile(file, 'utf8');
        
        // Long file detection
        const lineCount = content.split('\n').length;
        if (lineCount > 300) {
          corrections.push(this.createCorrection(
            'long-file',
            'warning',
            'medium',
            `File is very long (${lineCount} lines)`,
            file,
            `File length: ${lineCount} lines`,
            'Consider splitting into smaller, focused files',
            'maintainability'
          ));
        }

        // Complex import patterns
        const importPatterns = this.analyzeImports(content, file);
        corrections.push(...importPatterns);
      }

    } catch (error) {
      console.warn('Could not analyze maintainability patterns:', error);
    }

    return corrections;
  }

  private analyzeImports(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];
    const lines = content.split('\n');
    
    let importCount = 0;
    let hasWildcardImport = false;

    lines.forEach((line, index) => {
      if (line.includes('import') || line.includes('require')) {
        importCount++;

        // Wildcard imports
        if (line.includes('* as') || line.includes('import *')) {
          hasWildcardImport = true;
          corrections.push(this.createCorrection(
            `wildcard-import-${index}`,
            'suggestion',
            'low',
            'Wildcard import detected',
            filePath,
            line.trim(),
            'Use named imports for better tree-shaking and clarity',
            'maintainability',
            index + 1
          ));
        }

        // Deep relative imports
        if (line.includes('../../../')) {
          corrections.push(this.createCorrection(
            `deep-relative-import-${index}`,
            'warning',
            'medium',
            'Deep relative import path',
            filePath,
            line.trim(),
            'Use absolute imports or barrel exports',
            'maintainability',
            index + 1
          ));
        }
      }
    });

    // Too many imports
    if (importCount > 20) {
      corrections.push(this.createCorrection(
        'many-imports',
        'suggestion',
        'low',
        `File has many imports (${importCount})`,
        filePath,
        `Import count: ${importCount}`,
        'Consider splitting functionality or using barrel exports',
        'maintainability'
      ));
    }

    return corrections;
  }

  private async analyzeTypeScriptPatterns(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const srcDir = path.resolve(process.cwd(), 'src');
    
    if (!fs.existsSync(srcDir)) return corrections;

    try {
      const files = await this.getSourceFiles(srcDir);
      
      for (const file of files) {
        if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          const content = await fs.promises.readFile(file, 'utf8');
          const tsPatterns = this.analyzeTypeScriptFile(content, file);
          corrections.push(...tsPatterns);
        }
      }

    } catch (error) {
      console.warn('Could not analyze TypeScript patterns:', error);
    }

    return corrections;
  }

  private analyzeTypeScriptFile(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];
    
    // Any usage
    if (content.includes(': any') && !content.includes('// eslint-disable')) {
      corrections.push(this.createCorrection(
        'typescript-any',
        'warning',
        'medium',
        'TypeScript "any" type usage',
        filePath,
        'Usage of : any type',
        'Use specific types instead of "any" for better type safety',
        'compilation'
      ));
    }

    // Implicit any in function parameters
    if (content.includes('function') && content.includes(') {') && !content.includes('):')) {
      corrections.push(this.createCorrection(
        'implicit-any-function',
        'warning',
        'medium',
        'Function with implicit any return type',
        filePath,
        'Function without return type annotation',
        'Add explicit return type annotations',
        'compilation'
      ));
    }

    return corrections;
  }

  private async analyzeReactPatterns(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const srcDir = path.resolve(process.cwd(), 'src');
    
    if (!fs.existsSync(srcDir)) return corrections;

    try {
      const files = await this.getSourceFiles(srcDir);
      
      for (const file of files) {
        if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
          const content = await fs.promises.readFile(file, 'utf8');
          const reactPatterns = this.analyzeReactFile(content, file);
          corrections.push(...reactPatterns);
        }
      }

    } catch (error) {
      console.warn('Could not analyze React patterns:', error);
    }

    return corrections;
  }

  private analyzeReactFile(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];
    
    // Inline function definitions in props
    if (content.includes('onClick={() =>') || content.includes('onChange={() =>')) {
      corrections.push(this.createCorrection(
        'inline-function-prop',
        'suggestion',
        'low',
        'Inline function in JSX prop',
        filePath,
        'Inline arrow function in prop',
        'Define function outside JSX or use useCallback for better performance',
        'performance'
      ));
    }

    // Missing keys in lists
    if (content.includes('.map(') && !content.includes('key={') && content.includes('</')) {
      corrections.push(this.createCorrection(
        'missing-react-key',
        'warning',
        'medium',
        'Potential missing key prop in list',
        filePath,
        'Array.map without key prop',
        'Add unique key prop to list items',
        'runtime'
      ));
    }

    return corrections;
  }



  private numberToConstantName(number: string): string {
    const names: Record<string, string> = {
      '2': 'TWO',
      '3': 'THREE',
      '4': 'FOUR',
      '5': 'FIVE',
      '6': 'SIX',
      '7': 'SEVEN',
      '8': 'EIGHT',
      '9': 'NINE',
      '10': 'TEN',
      '60': 'SECONDS_IN_MINUTE',
      '3600': 'SECONDS_IN_HOUR',
      '24': 'HOURS_IN_DAY',
      '1000': 'MILLISECONDS_IN_SECOND'
    };
    
    return names[number] || `CONSTANT_${number}`;
  }

  private looksLikeCode(line: string): boolean {
    // Check if commented line looks like actual code
    const codePatterns = [
      /const\s+\w+\s*=/, /let\s+\w+\s*=/, /var\s+\w+\s*=/,
      /function\s*\w*\(/, /=>\s*{/, /if\s*\(/, /for\s*\(/,
      /return\s+/, /import\s+/, /export\s+/
    ];
    
    return codePatterns.some(pattern => pattern.test(line));
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

  private createPatternCorrection(id: string, file: string, context: any = {}): Correction {
    console.log('🔍 [PatternAnalyzer] START createPatternCorrection:', { 
      id, 
      file, 
      contextKeys: Object.keys(context),
      contextValues: context 
    });

    // Debug available templates first
    CorrectionMessageGenerator.debugTemplates();
    
    let message = CorrectionMessageGenerator.generateMessage(id, context);
    
    console.log('🔍 [PatternAnalyzer] After generateMessage:', { 
      message,
      messageValid: !!(message && message !== 'undefined' && message !== 'null')
    });
    
    // If message is still undefined, use a fallback
    if (!message || message === 'undefined' || message === 'null') {
      console.error(`❌ [PatternAnalyzer] UNDEFINED MESSAGE for ID: ${id}`);
      console.error(`❌ [PatternAnalyzer] File: ${file}`);
      console.error(`❌ [PatternAnalyzer] Context:`, JSON.stringify(context, null, 2));
      message = `Performance improvement opportunity in ${file}`;
    }
    
    const correction = this.createPerformanceCorrection(
      id,
      message,
      file,
      context.code || '',
      context.fix || '',
      context.line
    );

    console.log('🔍 [PatternAnalyzer] FINAL correction message:', correction.message);
    console.log('🔍 [PatternAnalyzer] END createPatternCorrection\n');
    
    return correction;
  }
  // Example usage:
  private detectUnsafeJsonParsing(filePath: string, content: string): Correction[] {
    const corrections: Correction[] = [];
    
    if (content.includes('JSON.parse(') && !content.includes('try {') && !content.includes('catch')) {
      corrections.push(this.createPatternCorrection(
        `unsafe-json-parse-${path.basename(filePath)}`,
        filePath,
        {
          context: path.basename(filePath),
          code: 'const data = JSON.parse(jsonString); // Unsafe without error handling',
          fix: `try {\n  const data = JSON.parse(jsonString);\n} catch (error) {\n  console.error('JSON parse error:', error);\n}`,
          type: 'warning',
          severity: 'medium'
        }
      ));
    }

    return corrections;
  }

  private detectConsoleInProduction(filePath: string, content: string): Correction[] {
    const corrections: Correction[] = [];
    
    if (content.includes('console.log(') && !filePath.includes('test')) {
      corrections.push(this.createPatternCorrection(
        `console-in-production-${path.basename(filePath)}`,
        filePath,
        {
          code: 'console.log("Debug message"); // Remove from production',
          fix: '// Remove console statements or use proper logging',
          type: 'suggestion',
          severity: 'low'
        }
      ));
    }

    return corrections;
  }
}