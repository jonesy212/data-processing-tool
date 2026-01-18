// TypeRelationshipAnalyzer.ts
import type { TSCompilerError } from '@/core/error-analyzer/ErrorFixManager';
import type { RelationshipMap } from '@/core/error-analyzer/types/ErrorAnalysisTypes';
import fs from 'fs';

export class TypeRelationshipAnalyzer {
  async buildRelationshipMap(errors: TSCompilerError[]): Promise<RelationshipMap> {
    const propertyUsages = new Map<string, Array<any>>();
    const methodUsages = new Map<string, Array<any>>();
    const typeDependencies = new Map<string, string[]>();
    const fileDependencies = new Map<string, string[]>();
    
    // Extract unique files from errors
    const uniqueFiles = new Set(errors.map(e => e.resource));
    
    // Analyze each file for relationships
    for (const file of uniqueFiles) {
      await this.analyzeFile(file, {
        propertyUsages,
        methodUsages,
        typeDependencies,
        fileDependencies
      });
    }
    
    // Add relationships from errors themselves
    for (const error of errors) {
      this.extractRelationshipsFromError(error, {
        propertyUsages,
        methodUsages,
        typeDependencies,
        fileDependencies
      });
    }
    
    return {
      propertyUsages,
      methodUsages,
      typeDependencies,
      fileDependencies
    };
  }

  private async analyzeFile(
    filePath: string,
    maps: {
      propertyUsages: Map<string, Array<any>>;
      methodUsages: Map<string, Array<any>>;
      typeDependencies: Map<string, string[]>;
      fileDependencies: Map<string, string[]>;
    }
  ): Promise<void> {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // Extract imports for file dependencies
      const imports = this.extractImports(content);
      maps.fileDependencies.set(filePath, imports);
      
      // Analyze for property and method usages
      this.analyzePropertyUsages(content, filePath, lines, maps.propertyUsages);
      this.analyzeMethodUsages(content, filePath, lines, maps.methodUsages);
      this.analyzeTypeDependencies(content, filePath, maps.typeDependencies);
      
    } catch (error) {
      console.warn(`Could not analyze file ${filePath}:`, error);
    }
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+(?:.*?from\s+)?['"]([^'"]+)['"]/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  private analyzePropertyUsages(
    content: string,
    filePath: string,
    lines: string[],
    propertyMap: Map<string, Array<any>>
  ): void {
    // Look for property assignments and usages
    const propertyRegex = /\b(\w+)\s*[:=]\s*[^;{]/g;
    const usageRegex = /\b(\w+)\.(\w+)\b/g;
    
    // Direct property declarations
    let match;
    while ((match = propertyRegex.exec(content)) !== null) {
      const propertyName = match[1];
      const lineNumber = this.getLineNumber(content, match.index);
      
      this.addToMap(propertyMap, propertyName, {
        file: filePath,
        line: lineNumber,
        context: lines[lineNumber - 1]?.trim() || '',
        type: 'declaration'
      });
    }
    
    // Property usages (obj.property)
    while ((match = usageRegex.exec(content)) !== null) {
      const propertyName = match[2];
      const lineNumber = this.getLineNumber(content, match.index);
      
      this.addToMap(propertyMap, propertyName, {
        file: filePath,
        line: lineNumber,
        context: lines[lineNumber - 1]?.trim() || '',
        type: 'usage'
      });
    }
  }

  private analyzeMethodUsages(
    content: string,
    filePath: string,
    lines: string[],
    methodMap: Map<string, Array<any>>
  ): void {
    // Look for method declarations
    const methodDeclRegex = /\b(\w+)\s*\([^)]*\)\s*(?::\s*([^{]+))?\s*\{/g;
    const methodCallRegex = /\b(\w+)\.(\w+)\s*\(/g;
    const functionDeclRegex = /(?:function|const|let|var)\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g;
    
    // Method declarations
    let match;
    while ((match = methodDeclRegex.exec(content)) !== null) {
      const methodName = match[1];
      const returnType = match[2] || 'void';
      const lineNumber = this.getLineNumber(content, match.index);
      
      this.addToMap(methodMap, methodName, {
        file: filePath,
        line: lineNumber,
        signature: this.extractMethodSignature(lines, lineNumber),
        returnType: returnType.trim()
      });
    }
    
    // Arrow function declarations
    while ((match = functionDeclRegex.exec(content)) !== null) {
      const methodName = match[1];
      const lineNumber = this.getLineNumber(content, match.index);
      
      this.addToMap(methodMap, methodName, {
        file: filePath,
        line: lineNumber,
        signature: this.extractMethodSignature(lines, lineNumber),
        returnType: 'unknown'
      });
    }
    
    // Method calls
    while ((match = methodCallRegex.exec(content)) !== null) {
      const methodName = match[2];
      const lineNumber = this.getLineNumber(content, match.index);
      
      this.addToMap(methodMap, methodName, {
        file: filePath,
        line: lineNumber,
        signature: 'call',
        returnType: 'unknown'
      });
    }
  }
    private analyzeTypeDependencies(
        content: string,
        filePath: string,
        typeMap: Map<string, string[]>
        ): void {
        // Look for type references in interfaces, types, and generics
        const interfaceRegex = /interface\s+(\w+).*?\{/gs;
        const typeAliasRegex = /type\s+(\w+)\s*=/g;
        
        // Extract interface names using matchAll
        const interfaceMatches = content.matchAll(interfaceRegex);
        for (const match of interfaceMatches) {
            const interfaceName = match[1];
            if (!typeMap.has(interfaceName)) {
            typeMap.set(interfaceName, []);
            }
        }
        
        // Extract type alias names using matchAll
        const typeMatches = content.matchAll(typeAliasRegex);
        for (const match of typeMatches) {
            const typeName = match[1];
            if (!typeMap.has(typeName)) {
            typeMap.set(typeName, []);
            }
        }
        
        // Extract generic dependencies
        const typeReferences = this.extractTypeReferences(content);
        for (const [type, dependencies] of typeReferences) {
            typeMap.set(type, dependencies);
        }
    }
    
  private extractTypeReferences(content: string): Map<string, string[]> {
    const typeRefs = new Map<string, string[]>();
    
    // Look for type annotations
    const typeAnnotationRegex = /:\s*([A-Z][a-zA-Z0-9_$<>[\], ]*?)(?=\s*[;),=}])/g;
    const interfaceExtendsRegex = /interface\s+\w+\s+extends\s+([^{]+)\{/g;
    
    const allMatches = [...content.matchAll(typeAnnotationRegex), ...content.matchAll(interfaceExtendsRegex)];
    
    for (const match of allMatches) {
      const typeString = match[1];
      const types = this.extractIndividualTypes(typeString);
      
      // Find the declaring type (simplified - in real implementation, use AST)
      const lines = content.substring(0, match.index).split('\n');
      const currentLine = lines[lines.length - 1];
      
      const typeMatch = currentLine.match(/(?:interface|type|class)\s+(\w+)/);
      if (typeMatch) {
        const declaringType = typeMatch[1];
        const existing = typeRefs.get(declaringType) || [];
        typeRefs.set(declaringType, [...new Set([...existing, ...types])]);
      }
    }
    
    return typeRefs;
  }

  private extractIndividualTypes(typeString: string): string[] {
    // Simple extraction - in production, use proper TypeScript AST
    const types: string[] = [];
    
    // Remove generic parameters for now
    const cleanString = typeString.replace(/<[^>]+>/g, '');
    
    // Split by union/intersection
    const parts = cleanString.split(/\s*[&|]\s*/);
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed && !['string', 'number', 'boolean', 'any', 'void'].includes(trimmed)) {
        types.push(trimmed);
      }
    }
    
    return types;
  }

  private extractRelationshipsFromError(
    error: TSCompilerError,
    maps: {
      propertyUsages: Map<string, Array<any>>;
      methodUsages: Map<string, Array<any>>;
      typeDependencies: Map<string, string[]>;
      fileDependencies: Map<string, string[]>;
    }
  ): void {
    const message = error.message;
    
    // Extract missing identifiers
    const missingMatch = message.match(/Cannot find name ['"]([^'"]+)['"]/);
    if (missingMatch) {
      const identifier = missingMatch[1];
      
      // Check if it's likely a property or method
      const context = this.getErrorContext(error);
      if (context?.includes('.')) {
        // It's a property/method access
        this.addToMap(maps.propertyUsages, identifier, {
          file: error.resource,
          line: error.startLineNumber,
          context: message,
          type: 'missing'
        });
      } else {
        // It's a variable/function
        this.addToMap(maps.methodUsages, identifier, {
          file: error.resource,
          line: error.startLineNumber,
          signature: 'unknown',
          returnType: 'unknown'
        });
      }
    }
    
    // Extract type references from type errors
    const typeMatch = message.match(/in type '([^']+)'/);
    if (typeMatch) {
      const typeName = typeMatch[1];
      if (!maps.typeDependencies.has(typeName)) {
        maps.typeDependencies.set(typeName, []);
      }
    }
  }

  private addToMap<T>(map: Map<string, T[]>, key: string, value: T): void {
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(value);
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  private extractMethodSignature(lines: string[], lineNumber: number): string {
    const startLine = Math.max(0, lineNumber - 1);
    const relevantLines = lines.slice(startLine, startLine + 3);
    return relevantLines.join(' ').substring(0, 100) + '...';
  }

  private getErrorContext(error: TSCompilerError): string | null {
    try {
      const filePath = error.resource;
      if (!fs.existsSync(filePath)) {
        return null;
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      if (error.startLineNumber > 0 && error.startLineNumber <= lines.length) {
        return lines[error.startLineNumber - 1].trim();
      }
    } catch {
      // Ignore errors
    }
    
    return null;
  }

  findSimilarIdentifiers(identifier: string, propertyMap: Map<string, any[]>): string[] {
    const similar: string[] = [];
    
    for (const existingIdentifier of propertyMap.keys()) {
      if (this.areIdentifiersSimilar(identifier, existingIdentifier)) {
        similar.push(existingIdentifier);
      }
    }
    
    return similar;
  }

  private areIdentifiersSimilar(a: string, b: string): boolean {
    if (a === b) return true;
    
    // Check for common variations
    const variations = [
      a.toLowerCase() === b.toLowerCase(),
      a.replace(/[_-]/g, '') === b.replace(/[_-]/g, ''),
      this.levenshteinDistance(a, b) <= 2
    ];
    
    return variations.some(v => v);
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[b.length][a.length];
  }
}