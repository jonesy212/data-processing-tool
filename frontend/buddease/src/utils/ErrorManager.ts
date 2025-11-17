// utils/ErrorManager.ts

import fs from 'fs'

export interface CategorizedError {
  id: string;
  category: ErrorCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  pattern: RegExp | string;
  title: string;
  description: string;
  immediateAction: string;
  rootCause: string;
  fixSteps: string[];
  preventionTips: string[];
  relatedFiles?: string[];
}

export type ErrorCategory = 
  | 'syntax' 
  | 'type-checking' 
  | 'build' 
  | 'dependency' 
  | 'configuration' 
  | 'runtime' 
  | 'import' 
  | 'memory' 
  | 'performance'
  | 'compilation';

export class ErrorManager {
  private static errorPatterns: CategorizedError[] = [
    // SYNTAX ERRORS
    {
      id: 'syntax-missing-brace',
      category: 'syntax',
      severity: 'critical',
      pattern: /Expected "\)" but found "\{"/,
      title: 'Missing Closing Brace or Parenthesis',
      description: 'The compiler expected a closing brace or parenthesis but found an opening brace instead',
      immediateAction: 'Find the method or function missing its closing brace',
      rootCause: 'Unbalanced braces, parentheses, or brackets in TypeScript/JavaScript code',
      fixSteps: [
        'Locate the method definition before the error line',
        'Check if all opening braces { have matching closing braces }',
        'Look for missing closing parentheses ) in function calls or conditionals',
        'Use VS Code bracket matching (Ctrl+Shift+\\\) to identify unbalanced pairs'
      ],
      preventionTips: [
        'Use consistent indentation to visualize code blocks',
        'Enable bracket pair colorization in VS Code',
        'Use Prettier for automatic code formatting',
        'Enable ESLint rule "curly" to enforce brace usage'
      ]
    },
    {
      id: 'syntax-unexpected-token',
      category: 'syntax',
      severity: 'critical',
      pattern: /Unexpected token/,
      title: 'Unexpected Token in Code',
      description: 'The compiler encountered a token it did not expect at this position',
      immediateAction: 'Check the line mentioned in the error for typos or incorrect syntax',
      rootCause: 'Missing semicolons, commas, or incorrect operator usage',
      fixSteps: [
        'Look for missing commas in object literals or arrays',
        'Check for missing semicolons at line endings',
        'Verify all strings are properly closed with quotes',
        'Check for incorrect operator usage (= vs ===, etc.)'
      ],
      preventionTips: [
        'Use TypeScript strict mode',
        'Enable ESLint with recommended rules',
        'Use Prettier for consistent formatting'
      ]
    },

    // BUILD ERRORS
    {
      id: 'build-transform-error',
      category: 'build',
      severity: 'high',
      pattern: /TransformError/,
      title: 'Build Transformation Error',
      description: 'ESBuild or Metro bundler failed to transform the code',
      immediateAction: 'Check the specific file mentioned in the transform error',
      rootCause: 'Syntax errors, unsupported JavaScript features, or configuration issues',
      fixSteps: [
        'Examine the file mentioned in the error message',
        'Check for modern JavaScript features that might need transpilation',
        'Verify Babel/TypeScript configuration',
        'Ensure all imports are correct and files exist'
      ],
      preventionTips: [
        'Use consistent TypeScript configuration across the project',
        'Test build process regularly in CI/CD',
        'Keep dependencies updated'
      ]
    },

    // TYPE CHECKING ERRORS
    {
      id: 'type-missing-property',
      category: 'type-checking',
      severity: 'medium',
      pattern: /Property '.*' does not exist on type/,
      title: 'Missing Property on Type',
      description: 'Trying to access a property that TypeScript cannot find on the type',
      immediateAction: 'Check the interface or type definition for the missing property',
      rootCause: 'Incomplete type definitions or incorrect property access',
      fixSteps: [
        'Verify the property name is spelled correctly',
        'Check if the property exists in the type/interface definition',
        'Add the missing property to the type definition if needed',
        'Use optional chaining (?.) if the property might be undefined'
      ],
      preventionTips: [
        'Use strict TypeScript configuration',
        'Define complete interfaces for all data structures',
        'Use TypeScript generics for reusable type safety'
      ]
    },

    // DEPENDENCY ERRORS
    {
      id: 'dependency-module-not-found',
      category: 'dependency',
      severity: 'high',
      pattern: /Cannot find module/,
      title: 'Module Not Found',
      description: 'The import statement references a module that cannot be found',
      immediateAction: 'Verify the import path and check if the module is installed',
      rootCause: 'Incorrect import paths, missing dependencies, or module resolution issues',
      fixSteps: [
        'Check the import path for typos',
        'Verify the package is installed in node_modules',
        'Check if the file exists at the specified path',
        'Update TypeScript module resolution in tsconfig.json'
      ],
      preventionTips: [
        'Use absolute imports with path mapping',
        'Keep package.json dependencies organized',
        'Use TypeScript path mapping for cleaner imports'
      ]
    },

    // CONFIGURATION ERRORS
    {
      id: 'config-parse-error',
      category: 'configuration',
      severity: 'high',
      pattern: /Failed to parse/,
      title: 'Configuration Parse Error',
      description: 'A configuration file (JSON, JS, TS) could not be parsed',
      immediateAction: 'Check the configuration file for syntax errors',
      rootCause: 'JSON syntax errors, JavaScript syntax errors in config files, or missing commas',
      fixSteps: [
        'Validate JSON syntax in configuration files',
        'Check for trailing commas in JSON files',
        'Verify JavaScript syntax in .js/.ts config files',
        'Use a JSON validator tool'
      ],
      preventionTips: [
        'Use JSON schemas for configuration files',
        'Validate config files in pre-commit hooks',
        'Use TypeScript for configuration files when possible'
      ]
    },
    {
      id: 'type-cannot-read-property',
      category: 'runtime',
      severity: 'high',
      pattern: /Cannot read property/,
      title: 'Cannot Read Property',
      description: 'Trying to access a property on an undefined or null value',
      immediateAction: 'Check if the object exists before accessing its property',
      rootCause: 'Undefined or null values being accessed',
      fixSteps: [
        'Add null/undefined checks before property access',
        'Use optional chaining (?.) operator',
        'Add default values with nullish coalescing (??)',
        'Check the data flow to ensure the object is properly initialized'
      ],
      preventionTips: [
        'Use TypeScript strict mode',
        'Enable no-implicit-any rule',
        'Use optional chaining for safe property access'
      ]
    },

    // MODULE RESOLUTION ERRORS
    {
      id: 'module-resolution-error',
      category: 'import',
      severity: 'high',
      pattern: /Module not found.*Can't resolve/,
      title: 'Module Resolution Error',
      description: 'The module system cannot find and resolve the imported module',
      immediateAction: 'Check the import path and verify the module exists',
      rootCause: 'Incorrect import paths, missing dependencies, or module configuration issues',
      fixSteps: [
        'Verify the import path is correct',
        'Check if the package is installed in node_modules',
        'Verify the file exists at the specified path',
        'Check webpack/TypeScript module resolution configuration'
      ],
      preventionTips: [
        'Use absolute imports with path mapping',
        'Keep imports organized and consistent',
        'Use TypeScript path mapping for cleaner imports'
      ]
    },
    // DUPLICATE DEFINITION ERRORS
    {
      id: 'duplicate-identifier',
      category: 'compilation',
      severity: 'critical',
      pattern: /Duplicate identifier/,
      title: 'Duplicate Identifier Found',
      description: 'The same variable, function, or class name is defined multiple times',
      immediateAction: 'Find and remove the duplicate definition',
      rootCause: 'Multiple declarations of the same identifier in the same scope',
      fixSteps: [
        'Search for the duplicate identifier in the file',
        'Remove or rename one of the definitions',
        'Check for copy-paste errors or accidental duplication',
        'Use unique names for each declaration'
      ],
      preventionTips: [
        'Use ESLint no-redeclare rule',
        'Enable TypeScript strict mode',
        'Use consistent naming conventions'
      ]
    },
    {
      id: 'duplicate-function',
      category: 'compilation', 
      severity: 'critical',
      pattern: /Duplicate function implementation/,
      title: 'Duplicate Function/Method Implementation',
      description: 'The same function or method is defined multiple times in the same scope',
      immediateAction: 'Find and remove the duplicate function/method',
      rootCause: 'Accidental copy-paste or method duplication in class',
      fixSteps: [
        'Search for the function/method name in the file',
        'Remove the duplicate implementation',
        'Check if methods were accidentally copied',
        'Ensure each method has a unique name'
      ],
      preventionTips: [
        'Review code changes before committing',
        'Use IDE features to detect duplicates',
        'Enable TypeScript noImplicitOverride'
      ]
    },
    {
      id: 'unexpected-brace-after-return',
      category: 'syntax',
      severity: 'critical',
      pattern: /Expected "\)" but found "\{"/,
      title: 'Possible Duplicate Method or Missing Closing Brace',
      description: 'The compiler found an opening brace where it expected a closing parenthesis, often indicating duplicate method definitions or unbalanced braces',
      immediateAction: 'Check for duplicate method names or missing closing braces',
      rootCause: 'Duplicate method definitions, missing function closures, or unbalanced code blocks',
      fixSteps: [
        'Search for duplicate method/function names in the file',
        'Check if all opening braces { have matching closing braces }',
        'Look for methods with the same name in the same class',
        'Verify method signatures are unique in classes'
      ],
      preventionTips: [
        'Use consistent code formatting',
        'Enable bracket pair colorization in VS Code',
        'Use Prettier for automatic formatting'
      ]
    }
  ];

  static categorizeError(errorMessage: string): CategorizedError | null {
    for (const errorPattern of this.errorPatterns) {
      if (typeof errorPattern.pattern === 'string') {
        if (errorMessage.includes(errorPattern.pattern)) {
          return errorPattern;
        }
      } else {
        if (errorPattern.pattern.test(errorMessage)) {
          return errorPattern;
        }
      }
    }
    return null;
  }


  static extractErrorContext(errorMessage: string): { file?: string; line?: number; column?: number; context?: string } {
    // Try multiple patterns to extract file and line information
    const patterns = [
      /(\/[^\s]+\.(ts|tsx|js|jsx)):(\d+):(\d+)/, // /path/file.ts:123:45
      /(src\/[^\s]+\.(ts|tsx|js|jsx)):(\d+):(\d+)/, // src/path/file.ts:123:45
      /(\.\/[^\s]+\.(ts|tsx|js|jsx)):(\d+):(\d+)/, // ./path/file.ts:123:45
      /at\s+.*?\(([^:]+):(\d+):(\d+)\)/, // at function (file.ts:123:45)
      /at\s+([^:]+):(\d+):(\d+)/ // at file.ts:123:45
    ];

    for (const pattern of patterns) {
      const match = errorMessage.match(pattern);
      if (match) {
        const file = match[1];
        const line = parseInt(match[2] || match[3]);
        const column = parseInt(match[3] || match[4]);
        
        // Extract context around the error
        let context = '';
        if (file && fs.existsSync(file)) {
          try {
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n');
            if (line && line <= lines.length) {
              const startLine = Math.max(1, line - 2);
              const endLine = Math.min(lines.length, line + 2);
              context = lines.slice(startLine - 1, endLine).join('\n');
            }
          } catch (error) {
            // If we can't read the file, just continue
          }
        }
        
        return { file, line, column, context };
      }
    }
    
    return {};
  }

  static generateFixReport(error: CategorizedError, context: { file?: string; line?: number } = {}): string {
    const lines: string[] = [];

    lines.push(`# 🚨 ${error.title}`);
    lines.push('');
    lines.push(`**Category:** ${error.category}`);
    lines.push(`**Severity:** ${error.severity}`);
    lines.push('');
    
    if (context.file) {
      lines.push(`**File:** ${context.file}`);
    }
    if (context.line) {
      lines.push(`**Line:** ${context.line}`);
    }
    
    lines.push('');
    lines.push('## 📋 Description');
    lines.push(error.description);
    lines.push('');
    
    lines.push('## 🚀 Immediate Action Required');
    lines.push(error.immediateAction);
    lines.push('');
    
    lines.push('## 🔍 Root Cause');
    lines.push(error.rootCause);
    lines.push('');
    
    lines.push('## 🛠️ Fix Steps');
    error.fixSteps.forEach((step, index) => {
      lines.push(`${index + 1}. ${step}`);
    });
    lines.push('');
    
    lines.push('## 🛡️ Prevention Tips');
    error.preventionTips.forEach((tip, index) => {
      lines.push(`- ${tip}`);
    });

    return lines.join('\n');
  }

  static analyzeBuildOutput(output: string): Array<{ error: CategorizedError; context: any; rawMessage: string }> {
    const lines = output.split('\n');
    const errors: Array<{ error: CategorizedError; context: any; rawMessage: string }> = [];

    for (const line of lines) {
      if (line.includes('ERROR') || line.includes('Error')) {
        const categorized = this.categorizeError(line);
        if (categorized) {
          const context = this.extractErrorContext(line);
          
          errors.push({
            error: categorized,
            context,
            rawMessage: line
          });
        }
      }
    }

    return errors;
  }
}