// import-validator.ts
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

    /**
   * Validates if an import path exists and suggests corrections if needed
   */
  validateImportPath(
    suggestedPath: string, 
    fromFile: string, 
    originalPath?: string
  ): ImportValidationResult {
    
    // If no suggested path, it's invalid
    if (!suggestedPath || suggestedPath.trim() === '') {
      return {
        isValid: false,
        confidence: 'low',
        reason: 'No suggested path provided'
      };
    }
    
    // Check if suggested path exists
    const exists = this.doesImportExist(suggestedPath, fromFile);
    
    if (exists) {
      return {
        isValid: true,
        confidence: 'high',
        reason: 'Suggested import path exists'
      };
    }
    
    // If suggested path doesn't exist, try to find alternatives
    const alternatives = this.findAlternativePaths(suggestedPath, fromFile);
    
    if (alternatives.length > 0) {
      // Check if any alternative actually exists
      const existingAlternatives = alternatives.filter(alt => 
        this.doesImportExist(alt, fromFile)
      );
      
      if (existingAlternatives.length > 0) {
        return {
          isValid: false,
          suggestedPath: existingAlternatives[0],
          alternatives: existingAlternatives.slice(1),
          confidence: existingAlternatives.length === 1 ? 'high' : 'medium',
          reason: `Suggested path doesn't exist, but found ${existingAlternatives.length} alternatives`
        };
      }
    }
    
    // Try to extract filename from path and search for it
    const fileName = this.extractFileName(suggestedPath);
    const similarFiles = this.findSimilarFiles(fileName, fromFile);
    
    if (similarFiles.length > 0) {
      return {
        isValid: false,
        suggestedPath: similarFiles[0],
        alternatives: similarFiles.slice(1),
        confidence: 'medium',
        reason: `Found ${similarFiles.length} files with similar names`
      };
    }
    
    // Check if it might be a module that needs installation
    if (!suggestedPath.startsWith('@/') && !suggestedPath.startsWith('.')) {
      return {
        isValid: false,
        confidence: 'low',
        reason: 'Suggested path appears to be an external module that might need installation'
      };
    }
    
    return {
      isValid: false,
      confidence: 'low',
      reason: 'Suggested import path does not exist'
    };
  }



    /**
   * Check if an import path exists on disk
   */
  private doesImportExist(importPath: string, fromFile: string): boolean {
    const exts = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
    
    if (importPath.startsWith('@/')) {
      const relativePath = importPath.replace(/^@\//, '');
      const possibleBases = ['src/app', 'app', 'src'];
      
      for (const base of possibleBases) {
        const basePath = path.join(this.srcRoot, '..', base, relativePath);
        for (const ext of exts) {
          if (fs.existsSync(basePath + ext)) {
            return true;
          }
        }
      }
      return false;
    }
    
    // Handle relative paths
    const fromDir = path.dirname(fromFile);
    const resolvedPath = path.resolve(fromDir, importPath);
    
    for (const ext of exts) {
      if (fs.existsSync(resolvedPath + ext)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Find alternative paths that might be correct
   */
  private findAlternativePaths(importPath: string, fromFile: string): string[] {
    const alternatives: string[] = [];
    const importDir = path.dirname(importPath);
    const importName = path.basename(importPath);
    
    // Try common variations
    const variations = [
      // Try with @/ prefix if missing
      !importPath.startsWith('@/') && !importPath.startsWith('.') ? `@/${importPath}` : null,
      // Try without @/ prefix
      importPath.startsWith('@/') ? importPath.replace(/^@\//, '') : null,
      `${importPath}.ts`,
      `${importPath}.tsx`,
      // Try index file
      `${importPath}/index.ts`,
      `${importPath}/index.tsx`,
      // Try parent directory
      importDir !== '.' ? path.join(path.dirname(importDir), importName) : null,
    ].filter(Boolean) as string[];
    
    // Check which variations exist
    for (const variation of variations) {
      if (this.doesImportExist(variation, fromFile)) {
        alternatives.push(variation);
      }
    }
    
    return alternatives;
  }
  
  /**
   * Extract just the filename from a path
   */
  private extractFileName(importPath: string): string {
    const baseName = path.basename(importPath);
    // Remove extension
    return baseName.replace(/\.(ts|tsx|js|jsx)$/, '');
  }
  
  /**
   * Find files with similar names
   */
  private findSimilarFiles(fileName: string, fromFile: string): string[] {
    const similarFiles: string[] = [];
    const fromDir = path.dirname(fromFile);
    
    // Search recursively from srcRoot
    const searchDir = this.srcRoot;
    
    try {
      const files = this.getAllFiles(searchDir);
      
      files.forEach(file => {
        const relativeToSrc = path.relative(this.srcRoot, file).replace(/\\/g, '/');
        const fileBaseName = path.basename(file, path.extname(file));
        
        // Check similarity
        if (fileBaseName.toLowerCase().includes(fileName.toLowerCase()) ||
            fileName.toLowerCase().includes(fileBaseName.toLowerCase())) {
          
          // Convert to @/ path if in src directory
          if (relativeToSrc.startsWith('app/')) {
            similarFiles.push(`@/${relativeToSrc.replace(/\.(ts|tsx|js|jsx)$/, '')}`);
          }
        }
      });
    } catch (error) {
      console.warn('Error searching for similar files:', error);
    }
    
    // Sort by relevance (closer directories first)
    return similarFiles.sort((a, b) => {
      const aDistance = this.calculateDirectoryDistance(a, fromDir);
      const bDistance = this.calculateDirectoryDistance(b, fromDir);
      return aDistance - bDistance;
    });
  }
  
  /**
   * Get all TypeScript/JavaScript files recursively
   */
  private getAllFiles(dir: string): string[] {
    const files: string[] = [];
    
    const readDir = (currentDir: string) => {
      try {
        const items = fs.readdirSync(currentDir, { withFileTypes: true });
        
        for (const item of items) {
          if (item.name.startsWith('.') || item.name === 'node_modules' || item.name === 'dist') {
            continue;
          }
          
          const fullPath = path.join(currentDir, item.name);
          
          if (item.isDirectory()) {
            readDir(fullPath);
          } else if (/\.(ts|tsx|js|jsx)$/.test(item.name)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };
    
    readDir(dir);
    return files;
  }
  
  /**
   * Calculate directory distance between two paths
   */
  private calculateDirectoryDistance(importPath: string, fromDir: string): number {
    try {
      let actualPath = importPath;
      
      if (importPath.startsWith('@/')) {
        const relativePath = importPath.replace(/^@\//, '');
        const possibleBases = ['src/app', 'app', 'src'];
        
        for (const base of possibleBases) {
          const testPath = path.join(this.srcRoot, '..', base, relativePath);
          const exts = ['', '.ts', '.tsx', '.js', '.jsx'];
          for (const ext of exts) {
            if (fs.existsSync(testPath + ext)) {
              actualPath = path.dirname(testPath + ext);
              break;
            }
          }
        }
      }
      
      const fromParts = fromDir.split(path.sep);
      const toParts = actualPath.split(path.sep);
      
      // Find common ancestor
      let commonDepth = 0;
      while (commonDepth < fromParts.length && 
             commonDepth < toParts.length && 
             fromParts[commonDepth] === toParts[commonDepth]) {
        commonDepth++;
      }
      
      return (fromParts.length - commonDepth) + (toParts.length - commonDepth);
    } catch (error) {
      return 999; // High distance if can't calculate
    }
  }
  
  // Add these stub methods if they don't exist
  private resolveImport(importPath: string, fromFile: string): { exists: boolean; path?: string } {
    // Implement based on your existing logic
    return { exists: this.doesImportExist(importPath, fromFile) };
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
   /**
   * Validate a complete fix (ImportFix or ImportIssue)
   */
  validateFix(fix: any): ImportValidationResult {
    // Extract the suggested path
    let suggestedPath = fix.suggestedFix || fix.targetImportPath;
    const fromFile = fix.file || fix.filePath;
    const originalPath = fix.importPath || 
                      (fix.originalLine && fix.originalLine.match(/from\s+['"]([^'"]+)['"]/)?.[1]);
    
    // Handle case where suggestedPath might be an object
    if (suggestedPath && typeof suggestedPath === 'object') {
      if (typeof suggestedPath.path === 'string') {
        suggestedPath = suggestedPath.path;
      } else if (typeof suggestedPath.suggestedFix === 'string') {
        suggestedPath = suggestedPath.suggestedFix;
      } else {
        // If it's an object like { path: undefined, confidence: 0 }
        return {
          isValid: false,
          confidence: 'low',
          reason: 'No valid path suggestion found in object'
        };
      }
    }
    
    if (!suggestedPath) {
      return {
        isValid: false,
        confidence: 'low',
        reason: 'No suggested fix provided'
      };
    }
    
    if (!fromFile) {
      return {
        isValid: false,
        confidence: 'low',
        reason: 'No source file specified'
      };
    }

    if (typeof suggestedPath === 'string') {
      if (suggestedPath.includes('[object Object]')) {
        return {
          isValid: false,
          confidence: 'low',
          reason: 'Import path was corrupted by object stringification'
        };
      }
    }
    
    // Use the existing validateImportPath method
    return this.validateImportPath(suggestedPath, fromFile, originalPath);
  }
}