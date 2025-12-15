// scripts/import-validator.ts
import fs from 'fs';
import path from 'path';

export interface ImportValidationResult {
  isValid: boolean;
  suggestedPath?: string;
  alternatives?: string[];
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

export class ImportValidator {
  private srcRoot: string;
  
  constructor(srcRoot: string) {
    this.srcRoot = srcRoot;
  }
  
  // Check if import is valid
  validateImport(importPath: string, fromFile: string): ImportValidationResult {
    // Skip non-relative imports
    if (!importPath.startsWith('@/') && !importPath.startsWith('.') && !importPath.startsWith('/')) {
      return { isValid: true, confidence: 'high', reason: 'External package' };
    }
    
    // Check if import exists
    const resolvedPath = this.resolveImport(importPath, fromFile);
    if (resolvedPath.exists) {
      return { isValid: true, confidence: 'high', reason: 'Import resolves successfully' };
    }
    
    // Try to find correct path
    const suggestions = this.findSuggestions(importPath);
    
    if (suggestions.length > 0) {
      return {
        isValid: false,
        suggestedPath: suggestions[0],
        alternatives: suggestions.slice(1),
        confidence: suggestions.length === 1 ? 'high' : 'medium',
        reason: 'Import not found, but similar files exist'
      };
    }
    
    return {
      isValid: false,
      confidence: 'low',
      reason: 'Import not found and no suggestions available'
    };
  }
  
  private resolveImport(importPath: string, fromFile: string): { exists: boolean; path?: string } {
    let resolved: string;
    
    if (importPath.startsWith('@/')) {
      resolved = path.join(this.srcRoot, importPath.replace(/^@\//, ''));
    } else {
      resolved = path.resolve(path.dirname(fromFile), importPath);
    }
    
    const exts = ['', '.ts', '.tsx', '.js', '.mjs', '/index.ts', '/index.tsx', '/index.js'];
    
    for (const ext of exts) {
      const testPath = resolved + ext;
      if (fs.existsSync(testPath)) {
        return { exists: true, path: testPath };
      }
    }
    
    return { exists: false };
  }
  
  private findSuggestions(importPath: string): string[] {
    if (!importPath.startsWith('@/')) {
      return [];
    }
    
    const relativePath = importPath.replace(/^@\//, '');
    const fileName = path.basename(relativePath);
    const baseName = fileName.replace(/\.(ts|tsx|js|mjs)$/, '');
    
    const suggestions: string[] = [];
    
    // Search for files with similar names
    this.searchFiles(this.srcRoot, baseName).forEach(file => {
      const relativeToSrc = path.relative(this.srcRoot, file);
      suggestions.push(`@/${relativeToSrc.replace(/\\/g, '/').replace(/\.(ts|tsx|js|mjs)$/, '')}`);
    });
    
    return suggestions;
  }
  
  private searchFiles(dir: string, searchTerm: string): string[] {
    const results: string[] = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!fullPath.includes('node_modules') && !fullPath.includes('dist')) {
            results.push(...this.searchFiles(fullPath, searchTerm));
          }
        } else if (entry.name.includes(searchTerm)) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return results;
  }
}