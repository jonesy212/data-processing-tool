// import-utils.ts
import { ImportClassifier } from '@/app/scripts/import-classifier';
import type { FixResult } from '@/app/scripts/import-fix-types'
import { AMBIGUOUS_CASES, TYPE_PATTERNS, VALUE_PATTERNS } from '@/app/scripts/type-patterns';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const classifier = new ImportClassifier();

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


export function shouldBeTypeImport(name: string, allImports: string[] = [], fileContent?: string): boolean {
  // Check naming patterns FIRST
  if (/^(Props|Type|Interface|Config|Settings|Data|Entity|Meta|State|Options|Payload)$/i.test(name)) {
    return true;
  }
  
  if (/[A-Z][a-z]+(Type|Props|Interface|Config)$/.test(name)) {
    return true;
  }
  
  // If we have file content, check actual usage
  if (fileContent) {
    // Check if it's used as a type (pattern matching)
    const typeUsagePatterns = [
      new RegExp(`:\\s*${name}[\\s;<>,]`), // type annotation
      new RegExp(`<${name}[\\s>]`), // generic parameter
      new RegExp(`extends\\s+${name}\\b`), // extends clause
      new RegExp(`implements\\s+${name}\\b`), // implements clause
    ];
    
    // Check if it's used as a value
    const valueUsagePatterns = [
      new RegExp(`${name}\\(`), // function call
      new RegExp(`${name}\\.`), // property access
      new RegExp(`new\\s+${name}\\b`), // constructor
      new RegExp(`<${name}[\\s/>]`), // JSX component
    ];
    
    const hasTypeUsage = typeUsagePatterns.some(pattern => pattern.test(fileContent));
    const hasValueUsage = valueUsagePatterns.some(pattern => pattern.test(fileContent));
    
    // If it has value usage, it's NOT a type-only import
    if (hasValueUsage) {
      return false;
    }
    
    // If it has type usage but no value usage, it's a type-only import
    if (hasTypeUsage) {
      return true;
    }
  }
  
  // Default: if it starts with capital letter and we can't determine, assume type
  return /^[A-Z]/.test(name);
}

export function analyzeImportStatement(importStatement: string): {
  typeImports: string[];
  valueImports: string[];
  shouldBeTypeOnly: boolean;
} {
  const result = {
    typeImports: [] as string[],
    valueImports: [] as string[],
    shouldBeTypeOnly: false
  };
  
  // Extract imports and source
  const importMatch = importStatement.match(/import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/);
  if (!importMatch) {
    // Handle default imports or other formats
    return result;
  }
  
  const [, importsStr, sourcePath] = importMatch;
  const imports = importsStr.split(',').map(i => i.trim()).filter(Boolean);
  
  // Classify each import
  imports.forEach(importName => {
    const isType = shouldBeTypeImportBasedOnNameAndContext(importName, sourcePath, imports);
    if (isType) {
      result.typeImports.push(importName);
    } else {
      result.valueImports.push(importName);
    }
  });
  
  // Determine if the whole statement should be type-only
  if (result.typeImports.length > 0 && result.valueImports.length === 0) {
    result.shouldBeTypeOnly = true;
  }
  
  return result;
}



export async function resolveSourceFile(
  sourcePath: string, 
  baseDir: string = process.cwd()
): Promise<string | null> {
  // Handle absolute paths
  if (path.isAbsolute(sourcePath) && fs.existsSync(sourcePath)) {
    return sourcePath;
  }

  // Handle relative imports with .ts/.tsx extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx', ''];
  
  for (const ext of extensions) {
    const fullPath = path.resolve(baseDir, sourcePath + ext);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  // Handle index.ts/index.tsx imports
  const indexVariations = [
    path.join(sourcePath, 'index.ts'),
    path.join(sourcePath, 'index.tsx'),
    path.join(sourcePath, 'index.js'),
    path.join(sourcePath, 'index.jsx')
  ];
  
  for (const indexPath of indexVariations) {
    const fullPath = path.resolve(baseDir, indexPath);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  // Handle path aliases (like @/components, ~/utils, etc.)
  const aliasPatterns = [
    // @/ alias
    { pattern: /^@\//, replace: 'src/' },
    // ~/ alias
    { pattern: /^~\//, replace: '' },
    // Custom aliases from tsconfig
    { pattern: /^components\//, replace: 'src/components/' },
    { pattern: /^utils\//, replace: 'src/utils/' },
    { pattern: /^hooks\//, replace: 'src/hooks/' },
    { pattern: /^types\//, replace: 'src/types/' },
  ];

  for (const alias of aliasPatterns) {
    if (alias.pattern.test(sourcePath)) {
      const resolvedPath = sourcePath.replace(alias.pattern, alias.replace);
      const result = await resolveSourceFile(resolvedPath, baseDir);
      if (result) return result;
    }
  }

  // Handle package imports (node_modules)
  if (!sourcePath.startsWith('.') && !sourcePath.startsWith('/')) {
    // Try to resolve through node_modules
    try {
      const resolved = require.resolve(sourcePath, { paths: [baseDir] });
      return resolved;
    } catch {
      // Not a node_modules package, continue
    }
  }

  // Handle TypeScript path mapping from tsconfig.json
  const tsconfigPath = path.resolve(baseDir, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      const paths = tsconfig.compilerOptions?.paths;
      
      if (paths) {
        for (const [pattern, mappings] of Object.entries(paths)) {
          // Convert pattern to regex (simplified)
          const regexPattern = pattern
            .replace(/\*/g, '([^\\/]+)')
            .replace(/\./g, '\\.');
          const regex = new RegExp(`^${regexPattern}$`);
          
          const match = sourcePath.match(regex);
          if (match) {
            for (const mapping of mappings as string[]) {
              let resolvedMapping = mapping;
              
              // Replace * with capture groups
              if (mapping.includes('*')) {
                resolvedMapping = mapping.replace(/\*/g, match[1]);
              }
              
              const result = await resolveSourceFile(resolvedMapping, baseDir);
              if (result) return result;
            }
          }
        }
      }
    } catch (error: unknown) {
    // Type guard to check if error has a message property
    if (error instanceof Error) {
      console.warn('⚠️ Could not parse tsconfig.json:', error.message);
    } else if (typeof error === 'string') {
      console.warn('⚠️ Could not parse tsconfig.json:', error);
    } else {
      console.warn('⚠️ Could not parse tsconfig.json:', String(error));
    }
  }
  }

  // Search recursively in the project
  const searchExtensions = ['.ts', '.tsx', '.js', '.jsx'];
  const searchDir = path.resolve(baseDir, 'src');
  
  if (fs.existsSync(searchDir)) {
    try {
      const foundFile = await findFileRecursively(searchDir, sourcePath, searchExtensions);
      if (foundFile) return foundFile;
    } catch (error) {
      // Search failed, continue
    }
  }

  return null;
}

async function findFileRecursively(
  dir: string, 
  sourcePath: string, 
  extensions: string[]
): Promise<string | null> {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip node_modules and dot directories
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
      continue;
    }
    
    if (entry.isDirectory()) {
      const result = await findFileRecursively(fullPath, sourcePath, extensions);
      if (result) return result;
    } else if (entry.isFile()) {
      const baseName = path.basename(sourcePath, path.extname(sourcePath));
      const fileBaseName = path.basename(entry.name, path.extname(entry.name));
      
      // Check if file matches
      if (fileBaseName === baseName) {
        return fullPath;
      }
      
      // Check directory name matches (for barrel files)
      const dirName = path.basename(path.dirname(fullPath));
      if (dirName === baseName) {
        // Check if it's an index file
        if (entry.name.startsWith('index.')) {
          return fullPath;
        }
      }
    }
  }
  
  return null;
}

// Helper function to check if import is from a type declaration file
export function isTypeDeclarationImport(sourcePath: string): boolean {
  return sourcePath.endsWith('.d.ts') || 
         sourcePath.includes('@types/') ||
         path.basename(sourcePath, '.d.ts') !== path.basename(sourcePath) ||
         sourcePath.includes('/types/') ||
         sourcePath.includes('/typings/') ||
         sourcePath.includes('/interfaces/');
}

// Helper function to get export type information from source file
export async function getExportTypes(
  sourcePath: string
): Promise<{ typeExports: string[]; valueExports: string[] }> {
  const result = { typeExports: [] as string[], valueExports: [] as string[] };
  
  try {
    const resolvedPath = await resolveSourceFile(sourcePath);
    if (!resolvedPath || !fs.existsSync(resolvedPath)) {
      return result;
    }
    
    const content = await fs.promises.readFile(resolvedPath, 'utf8');
    
    // Check for type exports
    const typeExportRegex = /export\s+(?:type\s+|interface\s+)(\w+)/g;
    let match;
    while ((match = typeExportRegex.exec(content)) !== null) {
      result.typeExports.push(match[1]);
    }
    
    // Check for export type { ... } statements
    const exportTypeGroupRegex = /export\s+type\s*\{([^}]+)\}/g;
    while ((match = exportTypeGroupRegex.exec(content)) !== null) {
      const types = match[1].split(',').map(t => t.trim()).filter(Boolean);
      result.typeExports.push(...types);
    }
    
    // Check for value exports (functions, classes, const)
    const valueExportRegex = /export\s+(?:function|class|const|let|var)\s+(\w+)/g;
    while ((match = valueExportRegex.exec(content)) !== null) {
      result.valueExports.push(match[1]);
    }
    
    // Check for export { ... } statements (mixed)
    const exportGroupRegex = /export\s*\{([^}]+)\}(?!\s*type)/g;
    while ((match = exportGroupRegex.exec(content)) !== null) {
      const exports = match[1].split(',').map(t => t.trim()).filter(Boolean);
      // These could be either types or values, need further analysis
      // For now, we'll treat them cautiously
      exports.forEach(exp => {
        // Check if export name matches type patterns
        if (shouldBeTypeImportBasedOnPattern(exp)) {
          result.typeExports.push(exp);
        } else {
          result.valueExports.push(exp);
        }
      });
    }
    
    // Remove duplicates
    result.typeExports = [...new Set(result.typeExports)];
    result.valueExports = [...new Set(result.valueExports)];
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️ Could not analyze exports from ${sourcePath}:`, errorMessage);
  }
  
  return result;
}

// Improved version of shouldBeTypeImportWithSourceCheck using resolveSourceFile
export async function shouldBeTypeImportWithEnhancedSourceCheck(
  name: string, 
  sourcePath: string
): Promise<boolean> {
  // Quick pattern check first
  const patternResult = shouldBeTypeImportBasedOnNameAndContext(name, sourcePath);
  
  // If source path indicates type declaration, it's definitely a type
  if (isTypeDeclarationImport(sourcePath)) {
    return true;
  }
  
  try {
    const resolvedPath = await resolveSourceFile(sourcePath);
    if (resolvedPath) {
      // Get actual exports from the source file
      const { typeExports, valueExports } = await getExportTypes(resolvedPath);
      
      // If we found explicit type export, use that
      if (typeExports.includes(name)) {
        return true;
      }
      
      // If we found explicit value export, use that
      if (valueExports.includes(name)) {
        return false;
      }
      
      // If the file itself is a type declaration file
      if (resolvedPath.endsWith('.d.ts')) {
        return true;
      }
      
      // Check file content patterns
      const content = await fs.promises.readFile(resolvedPath, 'utf8');
      
      // Look for specific patterns
      if (content.includes(`export interface ${name}`) ||
          content.includes(`export type ${name}`) ||
          content.includes(`export enum ${name}`)) {
        return true;
      }
      
      if (content.includes(`export function ${name}`) ||
          content.includes(`export class ${name}`) ||
          content.includes(`export const ${name}`) ||
          content.includes(`export let ${name}`) ||
          content.includes(`export var ${name}`) ||
          content.includes(`export default ${name}`)) {
        return false;
      }
      
      // Check for mixed export statements
      const exportStatementRegex = new RegExp(`export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`, 'g');
      const exportStatements = content.match(exportStatementRegex);
      
      if (exportStatements) {
        // If any export statement contains 'type', it's a type export
        for (const statement of exportStatements) {
          if (statement.includes('export type')) {
            return true;
          }
        }
      }
    }
  } catch (error: unknown) {
    // Fall back to pattern matching if source analysis fails
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.debug(`⚠️ Source analysis failed for ${name} from ${sourcePath}:`, errorMessage);
  }
  
  // Default to pattern-based decision
  return patternResult;
}



export async function shouldBeTypeImportWithSourceCheck(
  name: string, 
  sourcePath: string
): Promise<boolean> {
  // First use pattern matching
  const patternResult = shouldBeTypeImportBasedOnNameAndContext(name, sourcePath);
  
  // Optionally check source file for more accuracy
  if (process.env.CHECK_SOURCE_FILES === 'true') {
    try {
      const resolvedPath = await resolveSourceFile(sourcePath);
      if (resolvedPath && fs.existsSync(resolvedPath)) {
        const content = fs.readFileSync(resolvedPath, 'utf8');
        
        // Check for class export
        if (content.includes(`export class ${name}`) || 
            content.includes(`export default class ${name}`)) {
          return false;
        }
        
        // Check for function export
        if (content.includes(`export function ${name}`) ||
            content.includes(`export default function ${name}`)) {
          return false;
        }
        
        // Check for interface/type export
        if (content.includes(`export interface ${name}`) ||
            content.includes(`export type ${name}`)) {
          return true;
        }
      }
    } catch {
      // Fall back to pattern matching
    }
  }
  
  return patternResult;
}




export async function findFilePath(target: string): Promise<string | null> {
    // If it's already a valid path
    if (fs.existsSync(target)) {
        return target;
    }
    
    // If it exists with current directory
    const fullPath = path.resolve(process.cwd(), target);
    if (fs.existsSync(fullPath)) {
        return fullPath;
    }
    
    // Check if it's a relative path from src
    const srcPath = path.resolve(process.cwd(), 'src', target);
    if (fs.existsSync(srcPath)) {
        return srcPath;
    }
    
    // Try different extensions
    const possiblePaths = [
        path.resolve(process.cwd(), target),
        path.resolve(process.cwd(), 'src', target),
        path.resolve(process.cwd(), target + '.ts'),
        path.resolve(process.cwd(), target + '.tsx'),
        path.resolve(process.cwd(), 'src', target + '.ts'),
        path.resolve(process.cwd(), 'src', target + '.tsx'),
        // Try without extension
        path.resolve(process.cwd(), target.replace(/\.(ts|tsx)$/, '') + '.ts'),
        path.resolve(process.cwd(), target.replace(/\.(ts|tsx)$/, '') + '.tsx'),
    ];
    
    for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
            return possiblePath;
        }
    }
    
    // Search recursively using find command
    try {
        const basename = path.basename(target).replace(/\.(ts|tsx)$/, '');
        const findCmd = `find src/ -name "${basename}*" -type f 2>/dev/null | head -5`;
        const foundFiles = execSync(findCmd, { encoding: 'utf8' })
            .split('\n')
            .filter(f => f.trim() && (f.endsWith('.ts') || f.endsWith('.tsx')));
        
        if (foundFiles.length > 0) {
            return path.resolve(process.cwd(), foundFiles[0]);
        }
    } catch (error) {
        // Continue
    }
    
    return null;
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
  if (shouldBeTypeImportBasedOnNameAndContext(importStatement, undefined, [])) {
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

export function shouldBeTypeImportBasedOnNameAndContext(
  name: string, 
  sourcePath?: string,
  allImports?: string[]
): boolean {
  console.log(`🔍 Checking ${name} from ${sourcePath || 'unknown source'}`);
  
  // ===== STEP 1: Check exact matches (highest priority) =====
  if (TYPE_PATTERNS.exactMatches.has(name)) {
    console.log(`   ✅ ${name} is in TYPE_PATTERNS.exactMatches`);
    return true;
  }
  if (VALUE_PATTERNS.exactMatches.has(name)) {
    console.log(`   ❌ ${name} is in VALUE_PATTERNS.exactMatches`);
    return false;
  }
  
  // ===== STEP 2: Check ambiguous cases with source context =====
  const ambiguousHandler = AMBIGUOUS_CASES.get(name);
  if (ambiguousHandler) {
    const result = ambiguousHandler(sourcePath);
    console.log(`   ${result ? '✅' : '❌'} ${name} handled by AMBIGUOUS_CASES: ${result}`);
    return result;
  }
  
  // ===== STEP 3: Special handling for Redux Toolkit imports =====
  if (sourcePath && (sourcePath.includes('@reduxjs/toolkit') || sourcePath.includes('redux'))) {
    console.log(`🔍 Special handling for Redux Toolkit import: ${name}`);
    
    // Redux Toolkit types (should be imported as type)
    const reduxTypes = [
      'PayloadAction', 'Action', 'Reducer', 'Middleware', 'Store', 'Dispatch',
      'ThunkAction', 'AnyAction', 'State', 'Slice', 'CaseReducer',
      'PrepareAction', 'ActionCreatorWithPayload', 'ActionCreatorWithoutPayload',
      'ActionCreatorWithPreparedPayload', 'SerializableMiddleware'
    ];
    
    // Redux Toolkit values (runtime exports)
    const reduxValues = [
      'createSlice', 'createReducer', 'configureStore', 'createAsyncThunk',
      'combineReducers', 'createAction', 'createEntityAdapter', 'getDefaultMiddleware'
    ];
    
    if (reduxTypes.includes(name)) {
      console.log(`   ✅ ${name} is a Redux Toolkit type`);
      return true;
    }
    
    if (reduxValues.includes(name)) {
      console.log(`   ❌ ${name} is a Redux Toolkit runtime export`);
      return false;
    }
    
    // Pattern-based for Redux imports
    if (name.endsWith('Action') || name.endsWith('Reducer') || name.endsWith('State') || name.endsWith('Slice')) {
      console.log(`   ✅ ${name} looks like a Redux type (pattern match)`);
      return true;
    }
  }
  
  // ===== STEP 4: Special handling for MobX imports =====
  if (sourcePath && (sourcePath.includes('mobx') || sourcePath.includes('mobx-react'))) {
    console.log(`🔍 Special handling for MobX import: ${name}`);
    
    // MobX runtime exports (functions/decorators)
    const mobxRuntime = [
      'observable', 'makeObservable', 'makeAutoObservable', 'autorun',
      'reaction', 'when', 'computed', 'action', 'runInAction', 'flow',
      'toJS', 'isObservable', 'isObservableArray', 'isObservableObject',
      'isObservableMap', 'isObservableSet', 'isComputed', 'isAction'
    ];
    
    // MobX types (interfaces)
    const mobxTypes = [
      'IObservableArray', 'IObservableValue', 'IObservableObject',
      'IReactionDisposer', 'IAutorunOptions', 'IReactionOptions',
      'IComputedValue', 'IComputedValueOptions', 'ObservableMap',
      'ObservableSet', 'Reaction', 'Autorun', 'When', 'Computed'
    ];
    
    // Check if it's a MobX store class (from your architecture)
    const mobxStores = ['RootStore', 'ProjectStore', 'TaskStore', 'UserStore', 
                        'CalendarStore', 'SnapshotStore'];
    
    if (mobxTypes.includes(name)) {
      console.log(`   ✅ ${name} is a MobX type`);
      return true;
    }
    
    if (mobxRuntime.includes(name)) {
      console.log(`   ❌ ${name} is a MobX runtime function`);
      return false;
    }
    
    if (mobxStores.includes(name)) {
      console.log(`   ❌ ${name} is a MobX store class`);
      return false;
    }
    
    // Pattern-based for MobX
    if (name.startsWith('I') && /[A-Z]/.test(name[1])) {
      console.log(`   ✅ ${name} looks like a MobX interface (starts with I)`);
      return true;
    }
  }
  
  // ===== STEP 5: Special handling for Axios imports =====
  if (sourcePath && (sourcePath.includes('axios') || sourcePath === 'axios')) {
    console.log(`🔍 Special handling for Axios import: ${name}`);
    
    const axiosTypes = ['AxiosResponse', 'AxiosRequestConfig', 'AxiosInstance', 'AxiosStatic', 'AxiosPromise'];
    const axiosValues = ['default', 'axios', 'create'];
    
    // AxiosError is special - can be both
    if (name === 'AxiosError') {
      console.log(`   ⚠️  AxiosError is ambiguous - defaulting to type import`);
      return true; // Default to type since it's more commonly used as a type
    }
    
    if (axiosTypes.includes(name)) {
      console.log(`   ✅ ${name} is an Axios type`);
      return true;
    }
    
    if (axiosValues.includes(name)) {
      console.log(`   ❌ ${name} is an Axios runtime export`);
      return false;
    }
  }
  
  // ===== STEP 6: Check value patterns (avoid false positives) =====
  const matchesValuePattern = 
    VALUE_PATTERNS.prefixes.some(pattern => pattern.test(name)) ||
    VALUE_PATTERNS.suffixes.some(pattern => pattern.test(name));
  
  if (matchesValuePattern) {
    console.log(`   ❌ ${name} matches VALUE_PATTERNS`);
    return false;
  }
  
  // ===== STEP 7: Check type patterns =====
  const matchesTypePattern = 
    TYPE_PATTERNS.suffixes.some(pattern => pattern.test(name)) ||
    TYPE_PATTERNS.prefixes.some(pattern => pattern.test(name)) ||
    TYPE_PATTERNS.fullMatch.some(pattern => pattern.test(name));
  
  if (matchesTypePattern) {
    console.log(`   ✅ ${name} matches TYPE_PATTERNS`);
  }
  
  // ===== STEP 8: Source file context analysis =====
  if (sourcePath) {
    const fileName = sourcePath.split('/').pop()?.replace(/\.[^.]+$/, '') || '';
    
    // A. Files that typically export types
    const typeFilePatterns = [
      /types?$/i,
      /interfaces?$/i,
      /typings?$/i,
      /models?$/i,
      /entities?$/i,
      /configs?$/i,
      /schemas?$/i,
      /props$/i,
      /definitions?$/i,
    ];
    
    const isTypeFile = typeFilePatterns.some(pattern => pattern.test(fileName));
    if (isTypeFile && matchesTypePattern) {
      console.log(`   ✅ ${name} is from type file and matches patterns`);
      return true;
    }
    
    // B. Files that typically export runtime code
    const runtimeFilePatterns = [
      /actions?$/i,
      /services?$/i,
      /stores?$/i,
      /components?$/i,
      /pages?$/i,
      /utils?$/i,
      /helpers?$/i,
      /apis?$/i,
      /hooks?$/i,
      /reducers?$/i,
      /slices?$/i,
    ];
    
    const isRuntimeFile = runtimeFilePatterns.some(pattern => pattern.test(fileName));
    if (isRuntimeFile) {
      console.log(`   ❌ ${name} is from runtime file`);
      // Even if it matches type patterns, be conservative for runtime files
      return false;
    }
    
    // C. Check source path for keywords
    const sourceHasTypeKeywords = [
      'types',
      'typings', 
      'interfaces',
      'models',
      'config',
      'schemas'
    ].some(keyword => sourcePath.includes(keyword));
    
    if (sourceHasTypeKeywords && matchesTypePattern) {
      console.log(`   ✅ ${name} from type-related path and matches patterns`);
      return true;
    }
    
    // D. Check source path for runtime keywords
    const sourceHasRuntimeKeywords = [
      'actions',
      'services',
      'stores',
      'components',
      'pages',
      'utils',
      'helpers',
      'apis'
    ].some(keyword => sourcePath.includes(keyword));
    
    if (sourceHasRuntimeKeywords) {
      console.log(`   ❌ ${name} from runtime-related path`);
      return false;
    }
  }
  
  // ===== STEP 9: Check for single capital letters (T, K, V - TypeScript generics) =====
  if (/^[A-Z]$/.test(name)) {
    console.log(`   ✅ ${name} is a generic type parameter`);
    return true; // Single capital letters are almost always type parameters
  }
  
  // ===== STEP 10: Check import statement context (if provided) =====
  if (allImports && allImports.length > 0) {
    // If ALL imports in the statement match type patterns, it's likely a type-only import
    const allAreTypePatterns = allImports.every(importName => 
      TYPE_PATTERNS.suffixes.some(pattern => pattern.test(importName)) ||
      TYPE_PATTERNS.prefixes.some(pattern => pattern.test(importName))
    );
    
    if (allAreTypePatterns) {
      console.log(`   ✅ All imports in statement are type patterns`);
      return true;
    }
    
    // If ANY import clearly looks like a value, be conservative
    const hasClearValue = allImports.some(importName => 
      VALUE_PATTERNS.prefixes.some(pattern => pattern.test(importName)) ||
      VALUE_PATTERNS.exactMatches.has(importName)
    );
    
    if (hasClearValue) {
      console.log(`   ❌ Statement has clear value imports`);
      return false;
    }
  }
  
  // ===== STEP 11: Final decision =====
  // If it matches type patterns and we haven't found reasons against it
  if (matchesTypePattern) {
    console.log(`   ✅ Final decision: matches TYPE_PATTERNS`);
    return true;
  }
  
  // ===== STEP 12: Handle potentially unused imports (conservative approach) =====
  // Note: These imports might be unused now but could be needed in future development.
  // We take a conservative approach - keep them as they are and don't change import type
  // unless we're certain. Unused imports that aren't causing errors should be left
  // for the developer to clean up manually.
  const isLikelyUnused = false; // Could add logic here if needed

  // Final conservative default: if we can't determine, default to NOT type-only
  // This prevents breaking working code that might use the import in ways we can't detect
  if (!matchesTypePattern && !matchesValuePattern) {
    console.log(`   ⚠️  ${name} - ambiguous, defaulting to value import (conservative)`);
    return false;
  }
  // Default: conservative approach
  console.log(`   ❌ Final decision: default conservative (not a type)`);
  return false;
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
        
        // Normalize both the target and actual line for comparison
        const normalizeImport = (importStr: string): string => {
          return importStr
            .trim()
            .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
            .replace(/,\s+/g, ', ') // Normalize comma spacing
            .replace(/\s+from\s+/g, ' from ') // Normalize "from" spacing
            .replace(/['"]/g, "'"); // Normalize quotes
        };
        
        const normalizedOriginal = normalizeImport(fix.original);
        const normalizedFixed = normalizeImport(fix.fixed);
        
        // If line number is not provided or out of bounds, search for the import
        if (lineIndex < 0 || lineIndex >= lines.length || 
            normalizeImport(lines[lineIndex]) !== normalizedOriginal) {
          
          // Search for the import in the file using normalized comparison
          lineIndex = lines.findIndex(line => {
            const normalizedLine = normalizeImport(line);
            // Check if this line matches the original import (normalized)
            if (normalizedLine === normalizedOriginal) {
              return true;
            }
            
            // Also check if line contains the import names and source
            const importMatch = fix.original.match(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/);
            if (importMatch) {
              const [, importNames, sourcePath] = importMatch;
              const importNamesList = importNames.split(',').map((name: string) => name.trim());
              
              // Check if line contains all import names and source path
              if (line.includes('import') && line.includes(sourcePath)) {
                return importNamesList.every((name: string) => line.includes(name));
              }
            }
            
            return false;
          });
        }
        
        if (lineIndex >= 0 && lineIndex < lines.length) {
          const currentLine = lines[lineIndex];
          const normalizedCurrent = normalizeImport(currentLine);
          
          // Check if this line needs fixing (not already fixed)
          if (normalizedCurrent === normalizedOriginal && !currentLine.includes('import type')) {
            // Replace the original import with the fixed one
            lines[lineIndex] = currentLine.replace(/import\s+\{/, 'import type {');
            applied++;
            
            if (options.verbose) {
              const shortOriginal = fix.original.length > 60 ? fix.original.substring(0, 60) + '...' : fix.original;
              const shortFixed = fix.fixed.length > 60 ? fix.fixed.substring(0, 60) + '...' : fix.fixed;
              console.log(`✅ Fixed: ${path.basename(filePath)}:${lineIndex + 1} (${shortOriginal} → ${shortFixed})`);
            }
          } else if (currentLine.includes('import type')) {
            // Already fixed - skip
            if (options.verbose) {
              console.log(`⏭️  Skipped: ${path.basename(filePath)}:${lineIndex + 1} (already using import type)`);
            }
          } else {
            // Try a more flexible replacement
            if (currentLine.includes('import {') && currentLine.includes(fix.original.split(' from ')[1])) {
              // The import names might be in different order or have different spacing
              lines[lineIndex] = currentLine.replace(/import\s+\{/, 'import type {');
              applied++;
              
              if (options.verbose) {
                console.log(`✅ Fixed (flexible match): ${path.basename(filePath)}:${lineIndex + 1}`);
              }
            } else {
              if (options.verbose) {
                console.warn(`⚠️  Line ${lineIndex + 1} in ${filePath} doesn't match expected content`);
                console.warn(`    Looking for: ${normalizedOriginal}`);
                console.warn(`    Found: ${normalizedCurrent}`);
              }
              failed++;
            }
          }
        } else {
          if (options.verbose) {
            console.warn(`⚠️  Could not find import in ${filePath}: ${fix.original}`);
            
            // Debug: show what the file actually contains
            console.warn(`    Searching for: ${normalizedOriginal}`);
            console.warn(`    File contains these @/core imports:`);
            lines.forEach((line, idx) => {
              if (line.includes('@/core') && line.includes('import')) {
                console.warn(`    Line ${idx + 1}: ${line.trim()}`);
              }
            });
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

// Simple version without context
export function shouldBeTypeImportBasedOnPattern(name: string): boolean {
  // Check exact matches first
  if (TYPE_PATTERNS.exactMatches.has(name)) return true;
  if (VALUE_PATTERNS.exactMatches.has(name)) return false;
  
  // Check type patterns
  const matchesTypePattern = 
    TYPE_PATTERNS.suffixes.some(pattern => pattern.test(name)) ||
    TYPE_PATTERNS.prefixes.some(pattern => pattern.test(name)) ||
    TYPE_PATTERNS.fullMatch.some(pattern => pattern.test(name));
  
  // Check value patterns
  const matchesValuePattern = 
    VALUE_PATTERNS.suffixes.some(pattern => pattern.test(name)) ||
    VALUE_PATTERNS.prefixes.some(pattern => pattern.test(name));
  
  // If it looks like a type and doesn't look like a value, it's probably a type
  return matchesTypePattern && !matchesValuePattern;
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


// Alias for backward compatibility
export const shouldBeTypeImportBasedOnName = shouldBeTypeImportBasedOnNameAndContext;
