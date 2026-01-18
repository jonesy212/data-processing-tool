// TypeScriptErrorAnalyzer.ts
import type { TSCompilerError } from '@/core/error-analyzer/ErrorFixManager';
import fs from 'fs';
import path from 'path';

export interface AnalyzedError {
  error: TSCompilerError;
  pattern: string;
  missingIdentifier?: string;
  expectedType?: string;
  actualType?: string;
  propertyName?: string;
  relatedFile?: string;
  suggestions: string[];
  complexity: 'simple' | 'medium' | 'complex';
}

export class TypeScriptErrorAnalyzer {
  private commonPatterns = {
    cannotFindName: /Cannot find name ['"]([^'"]+)['"]/,
    typeNotAssignable: /Type '([^']+)' is not assignable to type '([^']+)'/,
    missingProperty: /Property '(\w+)' is missing in type/,
    excessiveStackDepth: /Excessive stack depth comparing types/,
    cannotFindModule: /Cannot find module ['"]([^'"]+)['"]/,
    namespaceNotFound: /Cannot find namespace '(\w+)'/,
  };

  async analyzeErrors(errors: TSCompilerError[]): Promise<AnalyzedError[]> {
    const analyzedErrors: AnalyzedError[] = [];

    for (const error of errors) {
      const analyzed = await this.analyzeSingleError(error);
      analyzedErrors.push(analyzed);
    }

    return analyzedErrors;
  }

  private async analyzeSingleError(error: TSCompilerError): Promise<AnalyzedError> {
    const message = error.message;
    const analyzed: AnalyzedError = {
      error,
      pattern: 'unknown',
      suggestions: [],
      complexity: 'simple'
    };

    // Check each pattern
    for (const [patternName, regex] of Object.entries(this.commonPatterns)) {
      const match = message.match(regex);
      if (match) {
        analyzed.pattern = patternName;
        
        switch (patternName) {
          case 'cannotFindName':
            analyzed.missingIdentifier = match[1];
            analyzed.suggestions = await this.suggestCannotFindName(match[1], error);
            analyzed.complexity = 'simple';
            break;
            
          case 'typeNotAssignable':
            analyzed.actualType = match[1];
            analyzed.expectedType = match[2];
            analyzed.suggestions = this.suggestTypeMismatch(match[1], match[2], error);
            analyzed.complexity = 'medium';
            break;
            
          case 'missingProperty':
            analyzed.propertyName = match[1];
            analyzed.suggestions = this.suggestMissingProperty(match[1], error);
            analyzed.complexity = 'medium';
            break;
            
          case 'excessiveStackDepth':
            analyzed.suggestions = this.suggestCircularDependency(error);
            analyzed.complexity = 'complex';
            break;
            
          case 'namespaceNotFound':
            analyzed.missingIdentifier = match[1];
            analyzed.suggestions = this.suggestMissingNamespace(match[1]);
            analyzed.complexity = 'simple';
            break;
        }
        
        break;
      }
    }

    // Add contextual suggestions based on related information
    if (error.relatedInformation && error.relatedInformation.length > 0) {
      analyzed.relatedFile = error.relatedInformation[0].resource;
      analyzed.suggestions.push(
        `Related definition at ${path.basename(error.relatedInformation[0].resource)}:${error.relatedInformation[0].startLineNumber}`
      );
    }

    // Add code context
    const context = await this.getErrorContext(error);
    if (context) {
      analyzed.suggestions.push(`Context:\n${context}`);
    }

    return analyzed;
  }

  private async suggestCannotFindName(identifier: string, error: TSCompilerError): Promise<string[]> {
    const suggestions: string[] = [];
    
    suggestions.push(`Missing identifier: "${identifier}"`);
    
    // Check if it's a React/JSX element
    if (identifier.match(/^[A-Z]/) && error.resource.endsWith('.tsx')) {
      suggestions.push(`May be a React component - check imports`);
      suggestions.push(`Import statement needed: import { ${identifier} } from '...'`);
    }
    
    // Check if it's a common variable pattern
    const commonPatterns = this.detectCommonPatterns(identifier, error);
    suggestions.push(...commonPatterns);
    
    // Suggest checking for typos
    suggestions.push(`Check for typos: similar identifiers in file`);
    
    return suggestions;
  }

  private suggestTypeMismatch(actualType: string, expectedType: string, error: TSCompilerError): string[] {
    const suggestions: string[] = [];
    
    suggestions.push(`Type mismatch: "${actualType}" vs "${expectedType}"`);
    
    // Check for async/void vs Promise patterns
    if (actualType.includes('void') && expectedType.includes('Promise')) {
      suggestions.push(`Async function required - add async/await or return Promise`);
    }
    
    if (expectedType.includes('void') && actualType.includes('Promise')) {
      suggestions.push(`Non-async function expected - remove async/await or handle promise`);
    }
    
    // Check for function vs non-function
    if (actualType.includes('=>') && !expectedType.includes('=>')) {
      suggestions.push(`Function provided where value expected`);
    }
    
    if (!actualType.includes('=>') && expectedType.includes('=>')) {
      suggestions.push(`Value provided where function expected`);
    }
    
    return suggestions;
  }

  private suggestMissingProperty(propertyName: string, error: TSCompilerError): string[] {
    const suggestions: string[] = [];
    
    suggestions.push(`Missing property: "${propertyName}"`);
    
    // Try to infer type based on property name
    const typeSuggestion = this.inferPropertyType(propertyName);
    if (typeSuggestion) {
      suggestions.push(`Suggested type: ${typeSuggestion}`);
    }
    
    // Check if property exists in related files
    if (error.relatedInformation && error.relatedInformation.length > 0) {
      const relatedFile = error.relatedInformation[0].resource;
      suggestions.push(`Property defined in: ${path.basename(relatedFile)}`);
    }
    
    return suggestions;
  }

  private suggestCircularDependency(error: TSCompilerError): string[] {
    const suggestions: string[] = [];
    
    suggestions.push(`Circular type dependency detected`);
    suggestions.push(`Common causes:`);
    suggestions.push(`- Two types referencing each other`);
    suggestions.push(`- Generic type parameters causing infinite recursion`);
    suggestions.push(`- Interface extending itself through intermediaries`);
    suggestions.push(`Solution: Break the cycle with type aliases or restructuring`);
    
    return suggestions;
  }

  private suggestMissingNamespace(namespace: string): string[] {
    const suggestions: string[] = [];
    
    suggestions.push(`Missing namespace: "${namespace}"`);
    
    if (namespace === 'JSX') {
      suggestions.push(`JSX namespace requires React types`);
      suggestions.push(`Install: npm install --save-dev @types/react`);
      suggestions.push(`Add to tsconfig.json: { "jsx": "react-jsx" }`);
    }
    
    return suggestions;
  }

  private detectCommonPatterns(identifier: string, error: TSCompilerError): string[] {
    const patterns: string[] = [];
    
    // Check for common React patterns
    if (identifier === 'label' || identifier === 'id' || identifier === 'onClick') {
      patterns.push(`Common React prop - check component props interface`);
    }
    
    // Check for state/setter patterns
    if (identifier.endsWith('State') || identifier.startsWith('set')) {
      patterns.push(`May be a React state variable - check useState hook`);
    }
    
    // Check for hook patterns
    if (identifier.startsWith('use')) {
      patterns.push(`May be a custom hook - check imports`);
    }
    
    // Check for event handler patterns
    if (identifier.startsWith('handle') || identifier.startsWith('on')) {
      patterns.push(`May be an event handler - check function definition`);
    }
    
    return patterns;
  }

  private inferPropertyType(propertyName: string): string | null {
    const typeMap: Record<string, string> = {
      id: 'string | number',
      name: 'string',
      label: 'string',
      title: 'string',
      value: 'any',
      disabled: 'boolean',
      required: 'boolean',
      onClick: '() => void',
      onChange: '(value: any) => void',
      onSubmit: '(event: React.FormEvent) => void',
      children: 'React.ReactNode',
      className: 'string',
      style: 'React.CSSProperties',
      color: 'string',
      colors: 'string[] | Record<string, string>',
      width: 'string | number',
      height: 'string | number',
      size: 'string | number',
      type: 'string',
      placeholder: 'string',
    };
    
    return typeMap[propertyName] || null;
  }

  private async getErrorContext(error: TSCompilerError): Promise<string | null> {
    try {
      const filePath = error.resource;
      if (!fs.existsSync(filePath)) {
        return null;
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      const startLine = Math.max(0, error.startLineNumber - 3);
      const endLine = Math.min(lines.length, error.startLineNumber + 2);
      
      const contextLines: string[] = [];
      for (let i = startLine; i < endLine; i++) {
        const lineNumber = i + 1;
        const prefix = lineNumber === error.startLineNumber ? '>>> ' : '    ';
        contextLines.push(`${prefix}${lineNumber}: ${lines[i]}`);
      }
      
      return contextLines.join('\n');
    } catch {
      return null;
    }
  }

  groupErrorsByFile(errors: AnalyzedError[]): Map<string, AnalyzedError[]> {
    const grouped = new Map<string, AnalyzedError[]>();
    
    for (const error of errors) {
      const file = error.error.resource;
      if (!grouped.has(file)) {
        grouped.set(file, []);
      }
      grouped.get(file)!.push(error);
    }
    
    return grouped;
  }

  groupErrorsByPattern(errors: AnalyzedError[]): Map<string, AnalyzedError[]> {
    const grouped = new Map<string, AnalyzedError[]>();
    
    for (const error of errors) {
      const pattern = error.pattern;
      if (!grouped.has(pattern)) {
        grouped.set(pattern, []);
      }
      grouped.get(pattern)!.push(error);
    }
    
    return grouped;
  }
}