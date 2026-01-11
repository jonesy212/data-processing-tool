// file: app/scripts/shared/import-utils.ts
import fs from 'fs';
import path from 'path';

export interface FixResult {
  file: string;
  original: string;
  fixed: string;
  success: boolean;
  line?: number;
}

export interface TypeImportError {
  typeName: string;
  file: string;
  line?: number;
  column?: number;
  importStatement?: string;
  errorMessage?: string;
  originalLine: string;
}


export function createBackup(filePath: string): string {
  const backupPath = `${filePath}.backup-${Date.now()}`;
  const content = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(backupPath, content, 'utf8');
  return backupPath;
}

export function groupFixesByFile(fixes: FixResult[]): Map<string, FixResult[]> {
  const fixesByFile = new Map<string, FixResult[]>();
  fixes.forEach(fix => {
    const normalizedPath = path.resolve(process.cwd(), fix.file);
    if (!fixesByFile.has(normalizedPath)) {
      fixesByFile.set(normalizedPath, []);
    }
    fixesByFile.get(normalizedPath)!.push({...fix, file: normalizedPath});
  });
  return fixesByFile;
}

export function sortFixesDescending(fixes: FixResult[]): FixResult[] {
  return [...fixes].sort((a, b) => (b.line || 0) - (a.line || 0));
}
export function shouldBeTypeImport(importName: string, importNames?: string[]): boolean {
  const namesToCheck = importNames ? [importName, ...importNames] : [importName];
  
  for (const name of namesToCheck) {
    const typePatterns = [
      /Entity$/,
      /Data$/,
      /Config$/,
      /Store$/,
      /Props$/,
      /Options$/,
      /Manager$/,
      /Type$/,
      /Interface$/,
      /State$/,
      /Meta$/,
      /Payload$/,
      /Event$/,
      /Category$/,
      /Version$/,
      /Snapshot$/,
      /Attachment$/,
      /Collection$/,
      /Item$/,
      /Field$/,
      /^Base[A-Z]/,
      /^Default[A-Z]/,
      /^Snapshot[A-Z]/,
      /^Version[A-Z]/,
      /^Realtime[A-Z]/,
      /^[A-Z][a-z]+$/, // PascalCase single words (likely types)
      /^[A-Z][a-z]+[A-Z][a-z]+$/, // PascalCase multi-words (likely types)
      /name$/i // Add this pattern - names are often types
    ];
    
    const valuePatterns = [
      /^use[A-Z]/, // React hooks
      /^create[A-Z]/, // Factory functions
      /^get[A-Z]/, // Getter functions
      /^set[A-Z]/, // Setter functions
      /^is[A-Z]/, // Checker functions
      /^has[A-Z]/, // Checker functions
      /^[a-z]/, // lowercase usually values
      /Api$/, // APIs are usually runtime
      /StoreClass$/, // Classes are runtime
      /Service$/, // Services are runtime
      /Utils$/, // Utils are runtime
      /Helper$/ // Helpers are runtime
    ];
    
    const isType = typePatterns.some(pattern => pattern.test(name));
    const isValue = valuePatterns.some(pattern => pattern.test(name));
    
    // If it matches a type pattern and NOT a value pattern, it's a type
    if (isType && !isValue) {
      return true;
    }
  }
  
  // If none of the names match type patterns, it's not a type-only import
  return false;
}

export function fixImportStatement(importStatement: string): string {
  if (!importStatement.includes('import')) return importStatement;
  if (importStatement.includes('import type')) return importStatement;
  
  // Pattern 1: Named imports - import { X, Y } from 'path'
  const namedImportRegex = /^import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/;
  const namedMatch = importStatement.match(namedImportRegex);
  
  if (namedMatch) {
    const imports = namedMatch[1].split(',').map(i => i.trim()).filter(Boolean);
    const source = namedMatch[2];
    
    // Check if ALL imports in this statement should be type imports
    const allShouldBeType = imports.every(imp => shouldBeTypeImportBasedOnName(imp));
    
    if (allShouldBeType) {
      // All imports are types - convert whole statement to import type
      return `import type { ${imports.join(', ')} } from '${source}'`;
    }
    
    // Check if ANY imports should be type imports
    const typeImports = imports.filter(imp => shouldBeTypeImportBasedOnName(imp));
    const valueImports = imports.filter(imp => !shouldBeTypeImportBasedOnName(imp));
    
    if (typeImports.length > 0 && valueImports.length === 0) {
      // All are types (but our check above missed some edge case)
      return `import type { ${imports.join(', ')} } from '${source}'`;
    } else if (typeImports.length > 0 && valueImports.length > 0) {
      // Mixed imports - split them
      return `import type { ${typeImports.join(', ')} } from '${source}';\nimport { ${valueImports.join(', ')} } from '${source}'`;
    }
  }
  
  // Pattern 2: Default import - import X from 'path'
  const defaultImportRegex = /^import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/;
  const defaultMatch = importStatement.match(defaultImportRegex);
  
  if (defaultMatch) {
    const importName = defaultMatch[1];
    const source = defaultMatch[2];
    
    // Check both the import name AND the source filename
    const fileName = path.basename(source, path.extname(source));
    const shouldBeType = shouldBeTypeImportBasedOnName(importName) || 
                        shouldBeTypeImportBasedOnName(fileName);
    
    if (shouldBeType) {
      return `import type ${importName} from '${source}'`;
    }
  }
  
  // Pattern 3: Namespace import - import * as X from 'path'
  const namespaceImportRegex = /^import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/;
  const namespaceMatch = importStatement.match(namespaceImportRegex);
  
  if (namespaceMatch) {
    const namespaceName = namespaceMatch[1];
    const source = namespaceMatch[2];
    
    // Check both the namespace name AND the source filename
    const fileName = path.basename(source, path.extname(source));
    const shouldBeType = shouldBeTypeImportBasedOnName(namespaceName) || 
                        shouldBeTypeImportBasedOnName(fileName);
    
    if (shouldBeType) {
      return `import type * as ${namespaceName} from '${source}'`;
    }
  }
  
  // Pattern 4: Side-effect import - import 'path' (no bindings)
  const sideEffectRegex = /^import\s+['"]([^'"]+)['"]/;
  if (importStatement.match(sideEffectRegex)) {
    // Side-effect imports are never type imports
    return importStatement;
  }
  
  // Pattern 5: Dynamic import - import('path')
  if (importStatement.includes('import(')) {
    // Dynamic imports are runtime only
    return importStatement;
  }
  
  // For compatibility with the original function signature
  if (shouldBeTypeImportBasedOnNameAndContext(importStatement, [])) {
    // This handles the case where the original function used the full statement
    // Try to convert based on patterns
    if (importStatement.includes('import {')) {
      return importStatement.replace('import {', 'import type {');
    } else if (importStatement.includes('import ')) {
      return importStatement.replace('import ', 'import type ');
    }
  }
  
  return importStatement; // No change needed
}

// Helper function for the simple case (just checking the name)
function shouldBeTypeImportBasedOnName(name: string): boolean {
  const typePatterns = [
    /Entity$/,
    /Data$/,
    /Config$/,
    /Store$/,
    /Props$/,
    /Options$/,
    /Manager$/,
    /Type$/,
    /Interface$/,
    /State$/,
    /Meta$/,
    /Payload$/,
    /Event$/,
    /Category$/,
    /Version$/,
    /Snapshot$/,
    /Attachment$/,
    /Collection$/,
    /Item$/,
    /Field$/,
    /^Base[A-Z]/,
    /^Default[A-Z]/,
    /^Snapshot[A-Z]/,
    /^Version[A-Z]/,
    /^Realtime[A-Z]/,
    /^T[A-Z]/, // Generic types: T, TKey, TValue
    /Props$/, // React props
    /State$/, // Component state
    /Context$/, // React context
    /Response$/, // API response types
    /Request$/, // API request types
    /Parameters$/, // Function parameters type
    /ReturnType$/ // Function return type
  ];
  
  const valuePatterns = [
    /^use[A-Z]/, // React hooks
    /^create[A-Z]/, // Factory functions
    /^get[A-Z]/, // Getter functions
    /^set[A-Z]/, // Setter functions
    /^is[A-Z]/, // Checker functions
    /^has[A-Z]/, // Checker functions
    /^[a-z]/, // lowercase usually values
    /Api$/, // APIs are usually runtime
    /StoreClass$/, // Classes are runtime
    /Service$/, // Services are runtime
    /Helper$/, // Helper functions
    /Util$/, // Utility functions
    /^fetch/, // Fetch functions
    /^update/, // Update functions
    /^delete/, // Delete functions
    /^add/, // Add functions
    /^remove/, // Remove functions
  ];
  
  const isType = typePatterns.some(pattern => pattern.test(name));
  const isValue = valuePatterns.some(pattern => pattern.test(name));
  
  // If it looks like a type and doesn't look like a value, it's probably a type
  return isType && !isValue;
}

// For compatibility with original function that took importStatement and array of names
function shouldBeTypeImportBasedOnNameAndContext(importStatement: string, importedNames: string[]): boolean {
  // First check individual names
  if (importedNames.length > 0) {
    return importedNames.some(name => shouldBeTypeImportBasedOnName(name));
  }
  
  // Fallback: check the import statement itself for patterns
  const typePatterns = [
    /DataStore$/,
    /Entity$/,
    /Metadata$/,
    /Config$/,
    /Interface$/,
    /Type$/,
    /Props$/,
    /State$/,
    /Context$/,
    /Snapshot$/,
    /Definition$/,
    /Analysis$/,
    /Transition$/
  ];
  
  // Check for type-related keywords in the import statement
  const hasTypeKeyword = typePatterns.some(pattern => 
    importStatement.includes(pattern.source.replace('\\$', ''))
  );
  
  // Check source path for type indicators
  const sourceMatch = importStatement.match(/from\s+['"]([^'"]+)['"]/);
  if (sourceMatch) {
    const source = sourceMatch[1];
    const fileName = path.basename(source, path.extname(source));
    
    // Files with these names often export types
    const typeFilePatterns = [
      /types?$/,
      /interfaces?$/,
      /props$/,
      /config$/,
      /schemas?$/,
      /models?$/,
      /entities?$/
    ];
    
    const isTypeFile = typeFilePatterns.some(pattern => pattern.test(fileName));
    if (isTypeFile) {
      return true;
    }
  }
  
  return hasTypeKeyword;
}


export function extractImportNames(importStatement: string): string[] {
  if (!importStatement.includes('import')) return [];
  
  // Named imports
  const namedMatch = importStatement.match(/import\s+(?:type\s+)?{([^}]+)}/);
  if (namedMatch) {
    return namedMatch[1].split(',').map(i => i.trim()).filter(Boolean);
  }
  
  // Default import
  const defaultMatch = importStatement.match(/import\s+(?:type\s+)?(\w+)\s+from/);
  if (defaultMatch) {
    return [defaultMatch[1]];
  }
  
  // Namespace import
  const namespaceMatch = importStatement.match(/import\s+(?:type\s+)?\*\s+as\s+(\w+)/);
  if (namespaceMatch) {
    return [namespaceMatch[1]];
  }
  
  return [];
}

export function findInterfaceExports(): Array<{file: string; interfaces: string[]}> {
  const result: Array<{file: string; interfaces: string[]}> = [];
  
  function findTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && item !== 'node_modules' && !item.startsWith('.')) {
            files.push(...findTypeScriptFiles(fullPath));
          } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
            files.push(fullPath);
          }
        } catch (error) {
          // Skip files we can't access
        }
      }
    } catch (error) {
      // Skip directories we can't access
    }
    
    return files;
  }
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = fs.existsSync(srcDir) 
    ? findTypeScriptFiles(srcDir)
    : findTypeScriptFiles(process.cwd());
  
  console.log(`📁 Scanning ${files.length} TypeScript files...`);
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const interfaces: string[] = [];
      
      // Find interface exports
      const interfaceRegex = /export\s+(?:type\s+)?interface\s+(\w+)/g;
      let match;
      while ((match = interfaceRegex.exec(content)) !== null) {
        interfaces.push(match[1]);
      }
      
      // Find type exports
      const typeRegex = /export\s+type\s+(\w+)(?:\s*=\s*[^;]+)?;/g;
      while ((match = typeRegex.exec(content)) !== null) {
        interfaces.push(match[1]);
      }
      
      // Find export type { ... } statements
      const typeExportRegex = /export\s+type\s*\{([^}]+)\}/g;
      while ((match = typeExportRegex.exec(content)) !== null) {
        const types = match[1].split(',').map(t => t.trim()).filter(Boolean);
        interfaces.push(...types);
      }
      
      if (interfaces.length > 0) {
        const relativePath = path.relative(process.cwd(), file);
        result.push({
          file: relativePath,
          interfaces: [...new Set(interfaces)] // Remove duplicates
        });
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  return result;
}

export function applyFixes(
  fixes: FixResult[], 
  options: { 
    context?: 'interface' | 'type' | 'comprehensive';
    showTips?: boolean;
    verbose?: boolean;
  } = {}
): { applied: number; failed: number; backups: string[] } {
  let applied = 0;
  let failed = 0;
  const backups: string[] = [];
  
  // Group by file for batch processing
  const fixesByFile = new Map<string, FixResult[]>();
  fixes.forEach(fix => {
    const normalizedPath = path.resolve(process.cwd(), fix.file);
    if (!fixesByFile.has(normalizedPath)) {
      fixesByFile.set(normalizedPath, []);
    }
    fixesByFile.get(normalizedPath)!.push({...fix, file: normalizedPath});
  });
  
  for (const [filePath, fileFixes] of fixesByFile) {
    try {
      // Create backup
      const backupPath = `${filePath}.backup-${Date.now()}`;
      const content = fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(backupPath, content, 'utf8');
      backups.push(backupPath);
      
      if (options.verbose) {
        console.log(`💾 Backup created: ${path.relative(process.cwd(), backupPath)}`);
      }
      
      // Apply fixes
      const lines = content.split('\n');
      
      // Sort fixes by line number (descending) to avoid line number shifting
      const sortedFixes = [...fileFixes].sort((a, b) => (b.line || 0) - (a.line || 0));
      
      for (const fix of sortedFixes) {
        // Try to find the line if line number is not provided or invalid
        let lineIndex = (fix.line || 1) - 1;
        
        // If line number is not provided or out of bounds, search for the import
        if (lineIndex < 0 || lineIndex >= lines.length || !lines[lineIndex].includes(fix.original)) {
          // Search for the import in the file
          lineIndex = lines.findIndex(line => 
            line.includes(fix.original) && 
            !line.includes('import type') // Ensure we don't match already fixed imports
          );
          
          if (lineIndex === -1) {
            // Try a more flexible search - just look for the import statement pattern
            const importMatch = fix.original.match(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/);
            if (importMatch) {
              const [, importNames, sourcePath] = importMatch;
              const importNamesList = importNames.split(',').map(name => name.trim());
              
              // Search for any line containing all the import names and source path
              lineIndex = lines.findIndex(line => {
                if (line.includes('import type')) return false;
                if (!line.includes(sourcePath)) return false;
                return importNamesList.every(name => line.includes(name));
              });
            }
          }
        }
        
        if (lineIndex >= 0 && lineIndex < lines.length) {
          // Check if this line needs fixing (not already fixed)
          if (lines[lineIndex].includes(fix.original) && !lines[lineIndex].includes('import type')) {
            // Replace the original import with the fixed one
            lines[lineIndex] = lines[lineIndex].replace(fix.original, fix.fixed);
            applied++;
            
            if (options.verbose) {
              const shortOriginal = fix.original.length > 60 ? fix.original.substring(0, 60) + '...' : fix.original;
              const shortFixed = fix.fixed.length > 60 ? fix.fixed.substring(0, 60) + '...' : fix.fixed;
              console.log(`✅ Fixed: ${path.basename(filePath)}:${lineIndex + 1} (${shortOriginal} → ${shortFixed})`);
            }
          } else if (lines[lineIndex].includes('import type')) {
            // Already fixed - skip
            if (options.verbose) {
              console.log(`⏭️  Skipped: ${path.basename(filePath)}:${lineIndex + 1} (already using import type)`);
            }
          } else {
            if (options.verbose) {
              console.warn(`⚠️  Line ${lineIndex + 1} in ${filePath} doesn't match expected content`);
              console.warn(`    Looking for: ${fix.original}`);
              console.warn(`    Found: ${lines[lineIndex]}`);
            }
            failed++;
          }
        } else {
          if (options.verbose) {
            console.warn(`⚠️  Could not find import in ${filePath}: ${fix.original}`);
          }
          failed++;
        }
      }
      
      // Write changes
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, (error as Error).message);
      failed += fileFixes.length;
    }
  }
  
  console.log(`\n📊 Results:`);
  console.log(`✅ Applied: ${applied} fixes`);
  console.log(`❌ Failed: ${failed} fixes`);
  
  // Show backups summary
  if (backups.length > 0 && options.verbose) {
    console.log(`💾 Created ${backups.length} backup(s)`);
  }
  
  // Show context-specific tips
  if (failed > 0 && options.showTips !== false) {
    const tips = getContextTips(options.context);
    if (tips) {
      console.log(`\n💡 ${tips}`);
    }
  }
  
  return { applied, failed, backups };
}


export function getContextTips(context?: string): string | null {
  const tips: Record<string, string> = {
    'interface': "Try running 'pnpm fix:types:safe' which uses AST-based parsing instead of grep",
    'type': "Some imports might need manual review. Check for mixed imports (types + values) in the same statement",
    'comprehensive': "Some errors might require manual fixing. Consider running individual fixers: 'pnpm fix:interface-imports' and 'pnpm fix:types'",
    'default': "Try running the fixer again or check for edge cases manually"
  };
  
  return tips[context || 'default'] || tips.default;
}