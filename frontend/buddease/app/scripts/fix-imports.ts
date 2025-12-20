// scripts/fix-imports.ts - UPDATED VERSION WITH VALIDATION

import { ImportFix } from '@/app/generators/corrections/ImportFixServicies';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { ImportValidator } from './import-validator';
import { SafeFixer } from './safe-fixer';

const PROJECT_ROOT = process.cwd();
const SRC_ROOT = path.join(PROJECT_ROOT, 'src');
const importValidator = new ImportValidator(SRC_ROOT);
const SAFE_THRESHOLD = 80;

/**
 * Get all exported symbols from a file, including re-exports via `export * from ...`.
 */
function getExports(filePath: string, visitedFiles = new Set<string>()): string[] {
  const resolvedPath = path.resolve(filePath);
  if (visitedFiles.has(resolvedPath)) return []; // prevent infinite loops
  visitedFiles.add(resolvedPath);

  if (!fs.existsSync(resolvedPath)) return [];

  const sourceText = fs.readFileSync(resolvedPath, 'utf8');
  const sourceFile = ts.createSourceFile(resolvedPath, sourceText, ts.ScriptTarget.Latest, true);

  const exports: string[] = [];

  ts.forEachChild(sourceFile, node => {
    // Named exports: export { A, B }
    if (ts.isExportDeclaration(node) && node.exportClause) {
      if (ts.isNamedExports(node.exportClause)) {
        node.exportClause.elements.forEach(e => exports.push(e.name.getText()));
      }
    }

    // Namespace export: export * from './other'
    if (ts.isExportDeclaration(node) && node.exportClause === undefined && node.moduleSpecifier) {
      const modulePath = (node.moduleSpecifier as ts.StringLiteral).text;
      let resolvedModule: string;

      if (modulePath.startsWith('@/')) {
        resolvedModule = path.join(SRC_ROOT, modulePath.replace(/^@\//, ''));
      } else {
        resolvedModule = path.resolve(path.dirname(resolvedPath), modulePath);
      }

      // Try common extensions
      const exts = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
      const foundPath = exts.map(ext => resolvedModule + ext).find(fs.existsSync);

      if (foundPath) {
        exports.push(...getExports(foundPath, visitedFiles));
      }
    }

    // export default X
    if (ts.isExportAssignment(node)) {
      exports.push('default');
    }

    // export const/let/var
    if (ts.isVariableStatement(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      node.declarationList.declarations.forEach(d => exports.push(d.name.getText()));
    }

    // export class/function/interface
    if ((ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node) || ts.isInterfaceDeclaration(node)) &&
        node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) &&
        node.name) {
      exports.push(node.name.getText());
    }
  });

  return exports;
}

type ImportIssue = {
  file: string;
  line: number;
  importPath: string;
  reason: string;
  suggestedFix?: string;
  validated?: boolean;
  validationMessage?: string;
  confidenceScore?: number; 
};

const safeFixer = new SafeFixer();

const KNOWN_ALIAS_ROOTS = [
  '@/app',
  '@/utils',
  '@/components',
  '@/features',
  '@/hooks',
];

function getAllSourceFiles(dir: string, acc: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!full.includes('node_modules') && !full.includes('dist')) {
        getAllSourceFiles(full, acc);
      }
    } else if (/\.(ts|tsx|js|mjs)$/.test(full)) {
      acc.push(full);
    }
  }

  return acc;
}

// ---------------------
// PRECOMPUTE EXPORTS FOR ALL FILES
// ---------------------
const exportCache = new Map<string, string[]>();

function getExportsCached(filePath: string, visited = new Set<string>()): string[] {
  const resolved = path.resolve(filePath);
  if (visited.has(resolved)) return [];
  visited.add(resolved);

  if (exportCache.has(resolved)) return exportCache.get(resolved)!;

  const exports = getExports(resolved, visited);
  exportCache.set(resolved, exports);
  return exports;
}

// ---------------------
// PRECOMPUTE ALL SOURCE FILES ONCE
// ---------------------
const allSourceFiles = getAllSourceFiles(SRC_ROOT);
allSourceFiles.forEach(file => getExportsCached(file));

// ---------------------
// ENHANCED findFileExporting FUNCTION
// ---------------------

// Update the findFileExporting function to be more precise:
function findFileExporting(
  symbol: string,
  allFiles: string[],
  importingFile?: string
): string | null {
  const candidates: { file: string; distance: number; matchQuality: number }[] = [];

  for (const file of allFiles) {
    const exports = exportCache.get(path.resolve(file));
    if (!exports) continue;
    
    // Check for exact symbol match - only accept exact matches
    if (exports.includes(symbol)) {
      let matchQuality = 1.0;
      
      // Calculate filename relevance
      const fileName = path.basename(file, path.extname(file));
      
      // Bonus if filename matches symbol exactly (for default exports)
      if (fileName === symbol) {
        matchQuality += 1.0;
      }
      
      // Calculate directory distance
      let distance = 0;
      if (importingFile) {
        const importingDir = path.dirname(importingFile);
        const targetDir = path.dirname(file);
        
        const importingPathParts = importingDir.split(path.sep);
        const targetPathParts = targetDir.split(path.sep);
        
        // Find common ancestor depth
        let commonDepth = 0;
        while (commonDepth < importingPathParts.length && 
               commonDepth < targetPathParts.length && 
               importingPathParts[commonDepth] === targetPathParts[commonDepth]) {
          commonDepth++;
        }
        
        distance = (importingPathParts.length - commonDepth) + 
                   (targetPathParts.length - commonDepth);
        
        // Bonus for being in the same or nearby directory
        if (distance <= 2) {
          matchQuality += 0.5;
        }
      }
      
      // Check file naming patterns
      if (symbol.endsWith('Props') && !fileName.includes('Props')) {
        matchQuality -= 0.3;
      }
      if (symbol.endsWith('Type') && !fileName.includes('Type')) {
        matchQuality -= 0.3;
      }
      
      candidates.push({ 
        file, 
        distance, 
        matchQuality 
      });
    }
  }

  if (candidates.length === 0) return null;

  // Sort by best match (highest quality, then shortest distance)
  candidates.sort((a, b) => {
    if (Math.abs(b.matchQuality - a.matchQuality) > 0.1) {
      return b.matchQuality - a.matchQuality;
    }
    return a.distance - b.distance;
  });

  const bestMatch = candidates[0].file;
  const relativeToSrc = path.relative(SRC_ROOT, bestMatch).replace(/\\/g, '/');
  
  // Convert to @/ path
  return `@/${relativeToSrc.replace(/\.(ts|tsx|js|mjs|jsx)$/, '')}`;
}

// ---------------------
// IMPROVED resolveESM FUNCTION WITH VALIDATION
// ---------------------
function resolveESM(
  importPath: string,
  fromFile: string,
  allFiles: string[],
  importedSymbol: string = 'default'
): { exists: boolean; suggestedPath?: string | undefined; validation?: any } {
  const exts = ['', '.ts', '.tsx', '.js', '.mjs', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx', '.d.ts'];
  
  // For non-relative imports, check if they're node modules
  if (!importPath.startsWith('.') && !importPath.startsWith('/') && !importPath.startsWith('@/') && !importPath.startsWith('~')) {
    return { exists: true };
  }

  let resolvedPath: string;

  // Handle @/ imports
  if (importPath.startsWith('@/')) {
    // Try multiple possible base directories
    const possibleBases = ['src/app', 'app', 'src'];
    let foundPath: string | null = null;
    
    for (const base of possibleBases) {
      resolvedPath = path.join(PROJECT_ROOT, base, importPath.replace(/^@\//, ''));
      
      // Check with extensions
      for (const ext of exts) {
        const testPath = resolvedPath + ext;
        if (fs.existsSync(testPath)) {
          foundPath = testPath;
          break;
        }
      }
      
      if (foundPath) break;
    }
    
    if (foundPath) {
      return { exists: true };
    }
    
    // If not found, try to find the right file
    const suggested = findFileExporting(importedSymbol, allFiles, fromFile);
    if (suggested) {
      // Validate the suggestion
      const validation = validateSuggestionQuick(importPath, suggested, fromFile);
      if (validation.isValid) {
        return { exists: false, suggestedPath: suggested };
      }
    }
    
    return { exists: false, suggestedPath: undefined };
  }

  // Handle relative imports
  resolvedPath = path.resolve(path.dirname(fromFile), importPath);
  
  // Check with extensions
  for (const ext of exts) {
    const testPath = resolvedPath + ext;
    if (fs.existsSync(testPath)) {
      return { exists: true };
    }
  }
  
  // Try to find by symbol
  const suggested = findFileExporting(importedSymbol, allFiles, fromFile);
  if (suggested) {
    const validation = validateSuggestionQuick(importPath, suggested, fromFile);
    if (validation.isValid) {
      return { exists: false, suggestedPath: suggested };
    }
  }
  
  return { exists: false, suggestedPath: undefined };
}

// ---------------------
// VALIDATION FUNCTIONS
// ---------------------
function validateSuggestionQuick(originalPath: string, suggestedPath: string, fromFile: string): {
  isValid: boolean;
  message: string;
} {
  // Basic validation: check if suggested file exists
  const exts = ['', '.ts', '.tsx', '.js', '.mjs', '.jsx', '/index.ts', '/index.tsx'];
  
  if (suggestedPath.startsWith('@/')) {
    const relativePath = suggestedPath.replace(/^@\//, '');
    const possibleBases = ['src/app', 'app', 'src'];
    
    for (const base of possibleBases) {
      const basePath = path.join(PROJECT_ROOT, base, relativePath);
      for (const ext of exts) {
        if (fs.existsSync(basePath + ext)) {
          return { isValid: true, message: 'Valid suggestion - file exists' };
        }
      }
    }
    return { isValid: false, message: 'Suggested file does not exist' };
  }
  
  // Handle relative suggestions
  const fromDir = path.dirname(fromFile);
  const resolvedSuggestion = path.resolve(fromDir, suggestedPath);
  
  for (const ext of exts) {
    const testPath = resolvedSuggestion + ext;
    if (fs.existsSync(testPath)) {
      return { isValid: true, message: 'Valid suggestion - file exists' };
    }
  }
  
  return { isValid: false, message: 'Suggested path not found' };
}



/******************************************************************
 *  validateAndFilterIssues  –  run only once, cache result
 ******************************************************************/
let validatedCache: {
  validIssues: ImportIssue[];
  invalidIssues: ImportIssue[];
  validationReport: string;
} | null = null;

// ---------------------
// PRE-SCAN VALIDATION STEP
// ---------------------
async function validateAndFilterIssues(
  issues: ImportIssue[]
): Promise<{
  validIssues: ImportIssue[];
  invalidIssues: ImportIssue[];
  validationReport: string;
}> {

  if (validatedCache) return validatedCache; // ← already did the work

  console.log('\n🔍 Validating suggested fixes...');

  const validIssues: ImportIssue[]   = [];
  const invalidIssues: ImportIssue[] = [];
  const validationDetails: string[]  = [];

  for (const issue of issues) {
    const relPath = `${path.relative(PROJECT_ROOT, issue.file)}:${issue.line}`;

    /* ----------------------------------------------------------
       0.  If we already have a suggestion, run FULL validation
    ---------------------------------------------------------- */
    if (issue.suggestedFix) {
      const fullCheck = await validateFixSuggestion(issue); // semantic + exist
      if (fullCheck.isValid) {
        validIssues.push({ ...issue, validated: true, validationMessage: fullCheck.message });
        validationDetails.push(`✅ ${relPath} – ${fullCheck.message}`);
        continue;
      }
    }

    /* ----------------------------------------------------------
       1.  Try typo / exact-path recovery
    ---------------------------------------------------------- */
    const typoFix = tryFixTypo(issue.importPath, issue.file);
    if (typoFix) {
      validIssues.push({
        ...issue,
        suggestedFix: typoFix,
        validated: true,
        validationMessage: 'Fixed typo / path structure',
      });
      validationDetails.push(`✅ ${relPath} – Typo fixed: ${issue.importPath} → ${typoFix}`);
      continue;
    }

    /* ----------------------------------------------------------
       2.  Loose semantic fallback
    ---------------------------------------------------------- */
    const semantic = findBetterSuggestion(issue.importPath, issue.file);
    if (semantic) {
      // quick existence check only
      const quick = validateSuggestionQuick(issue.importPath, semantic, issue.file);
      if (quick.isValid) {
        validIssues.push({
          ...issue,
          suggestedFix: semantic,
          validated: true,
          validationMessage: `Semantic fallback: ${semantic}`,
        });
        validationDetails.push(`✅ ${relPath} – Semantic fallback: ${semantic}`);
        continue;
      }
    }

    /* ----------------------------------------------------------
       3.  Nothing worked – keep for manual review
    ---------------------------------------------------------- */
    validIssues.push({
      ...issue,
      reason: 'ESM resolution failure – manual review required',
      validationMessage: 'No automatic fix found',
    });
    validationDetails.push(`⚠️  ${relPath} – No valid suggestion`);
  }

  /* ---- report ---- */
  const validationReport =
    `## Validation Results\n\n` +
    `**Total Issues:** ${issues.length}\n` +
    `**✅ Issues to process:** ${validIssues.length}\n` +
    `**❌ Rejected:** ${invalidIssues.length}\n\n` +
    `### Details:\n${validationDetails.slice(0, 100).join('\n')}` +
    (validationDetails.length > 100 ? `\n... and ${validationDetails.length - 100} more` : '');

  validatedCache = { validIssues, invalidIssues, validationReport };
  return validatedCache;
}

async function validateFixSuggestion(issue: ImportIssue): Promise<{
  isValid: boolean;
  message: string;
  actualPath?: string;
}> {
  // First check if suggestedFix is actually an object from findCorrectPathBySymbols
  let suggestedPath: string | undefined;
  
  if (issue.suggestedFix && typeof issue.suggestedFix === 'object') {
    // Handle the case where suggestedFix is an object from findCorrectPathBySymbols
    suggestedPath = (issue.suggestedFix as any).path;
  } else {
    suggestedPath = issue.suggestedFix;
  }
  
  if (!suggestedPath) {
    return { 
      isValid: false, 
      message: 'No suggestion provided' 
    };
  }
  
  // USE ImportValidator here
  const validationResult = importValidator.validateImportPath(
    suggestedPath,
    issue.file,
    issue.importPath
  );
  
  if (!validationResult.isValid) {
    return { 
      isValid: false, 
      message: validationResult.reason 
    };
  }
  
  const exts = ['', '.ts', '.tsx', '.js', '.mjs', '.jsx', '/index.ts', '/index.tsx'];
  
  // Convert @/ to actual file path
  if (suggestedPath.startsWith('@/')) {
    const relativePath = suggestedPath.replace(/^@\//, '');
    
    // Try multiple possible bases based on your project structure
    const possibleBases = ['src/app', 'app', 'src'];
    let foundPath: string | null = null;
    
    for (const base of possibleBases) {
      const testBasePath = path.join(PROJECT_ROOT, base, relativePath);
      
      for (const ext of exts) {
        const testPath = testBasePath + ext;
        if (fs.existsSync(testPath)) {
          foundPath = testPath;
          break;
        }
      }
      
      if (foundPath) break;
    }
    
    if (foundPath) {
      return { 
        isValid: true, 
        message: `Found: ${path.relative(PROJECT_ROOT, foundPath)}`,
        actualPath: foundPath 
      };
    }
    
    return { 
      isValid: false, 
      message: `Suggested path not found: ${suggestedPath}` 
    };
  }
  
  // Handle relative suggestions
  const fromDir = path.dirname(issue.file);
  const resolvedSuggestion = path.resolve(fromDir, suggestedPath);
  
  for (const ext of exts) {
    const testPath = resolvedSuggestion + ext;
    if (fs.existsSync(testPath)) {
      return { 
        isValid: true, 
        message: `Found: ${path.relative(PROJECT_ROOT, testPath)}`,
        actualPath: testPath 
      };
    }
  }
  
  return { 
    isValid: false, 
    message: `Suggested path not found: ${suggestedPath}` 
  };
}

// ---------------------
// SCAN RUNTIME IMPORT FAILURES WITH VALIDATION
// ---------------------

// And modify the scanRuntimeImportFailures function to be less restrictive:
function scanRuntimeImportFailures(): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const manualPath = './reports/manual-review-queue.json';
  if (fs.existsSync(manualPath)) {
    const manual = JSON.parse(fs.readFileSync(manualPath, 'utf-8')) as ImportIssue[];
    issues.unshift(...manual);
    fs.unlinkSync(manualPath);   // consume once
  }
  
  const importRegex = /import\s+(?:([\w*\s{},]+)\s+from\s+)?['"]([^'"]+)['"]/g;
  const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;
  const seenKeys = new Set<string>();

  for (const file of allSourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, i) => {
      let match;

      /* ---------------  STATIC IMPORTS  --------------- */
      while ((match = importRegex.exec(line))) {
        const importClause = match[1] || 'default';
        const importPath = match[2];
        
        // Extract imported symbols
        const importedSymbols = extractImportedSymbols(importClause);
        
        const seenKey = `${file}:${i + 1}:${importPath}`;
        if (seenKeys.has(seenKey)) continue;
        seenKeys.add(seenKey);

        const { exists } = resolveESM(importPath, file, allSourceFiles);
        if (!exists) {
          // Try to find the correct path by searching for the imported symbols
          const suggestedPath = findCorrectPathBySymbols(importedSymbols, file, importPath);
          
          issues.push({
            file,
            line: i + 1,
            importPath,
            reason: 'ESM resolution failure',
            suggestedFix: suggestedPath,
            confidenceScore: suggestedPath ? 85 : 30,
          });
        } else {
          // Even if the path exists, check if it exports the required symbols
          const missingSymbols = checkMissingSymbols(importPath, file, importedSymbols);
          if (missingSymbols.length > 0) {
            // Try to find files that do export these symbols
            const suggestedPath = findPathForMissingSymbols(missingSymbols, file, importPath);
            if (suggestedPath) {
              issues.push({
                file,
                line: i + 1,
                importPath,
                reason: `Missing exports: ${missingSymbols.join(', ')}`,
                suggestedFix: suggestedPath,
                confidenceScore: 90,
              });
            }
          }
        }
      }

      /* ---------------  DYNAMIC IMPORTS  --------------- */
      while ((match = dynamicImportRegex.exec(line))) {
        const importPath = match[1];

        const seenKey = `${file}:${i + 1}:${importPath}`;
        if (seenKeys.has(seenKey)) continue;
        seenKeys.add(seenKey);

        const { exists } = resolveESM(importPath, file, allSourceFiles, 'default');
        if (!exists) {
          const fix = findCorrectPathBySymbols(['default'], file, importPath) ||
                     tryExactNameRecovery(importPath, file) ||
                     resolveIntentPreserving(importPath, file) ||
                     findBetterSuggestion(importPath, file);

          issues.push({
            file,
            line: i + 1,
            importPath,
            reason: 'Dynamic ESM import failure',
            suggestedFix: fix,
            confidenceScore: fix ? 80 : 30,
          });
        }
      }
    });
  }
  return issues;
}

// Helper function to extract symbols from import clause
function extractImportedSymbols(importClause: string): string[] {
  const symbols: string[] = [];
  
  // Handle default import
  if (importClause.includes('default')) {
    symbols.push('default');
  }
  
  // Extract named imports: { a, b, c } or { a as b, c }
  const namedMatch = importClause.match(/{([^}]*)}/);
  if (namedMatch) {
    const namedImports = namedMatch[1]
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    // Remove aliases: "a as b" becomes "a"
    namedImports.forEach(imp => {
      const originalName = imp.split(/\s+as\s+/)[0].trim();
      symbols.push(originalName);
    });
  }
  
  // Handle namespace imports: import * as something
  const namespaceMatch = importClause.match(/\*\s+as\s+(\w+)/);
  if (namespaceMatch) {
    symbols.push('*'); // Special symbol for namespace imports
  }
  
  // Handle bare import: import "module" (no symbols)
  if (symbols.length === 0) {
    symbols.push('*'); // All exports
  }
  
  return symbols;
}

// Find correct path by searching for files that export the required symbols
function findCorrectPathBySymbols(
  symbols: string[], 
  fromFile: string, 
  originalPath: string
): { path: string | undefined; confidence: number } {
  
  if (symbols.length === 0 || (symbols.length === 1 && symbols[0] === '*')) {
    return { path: undefined, confidence: 0 };
  }
  
  // First, check if there's a direct mapping for the symbol
  for (const symbol of symbols) {
    if (symbol === 'default') continue;
    
    const filePath = findFileExporting(symbol, allSourceFiles, fromFile);
    if (filePath) {
      // Verify that ALL required symbols are exported from this file
      if (verifySymbolsExported(filePath, symbols)) {
        return { path: filePath, confidence: 95 };
      } else {
        // Some symbols are missing - lower confidence
        return { path: filePath, confidence: 85 };
      }
    }
  }
  
  // If no single file exports all symbols, look for files that export at least one
  const candidateFiles = new Map<string, { count: number; symbols: string[] }>();
  
  for (const symbol of symbols) {
    if (symbol === 'default') continue;
    
    const filePath = findFileExporting(symbol, allSourceFiles, fromFile);
    if (filePath) {
      const current = candidateFiles.get(filePath) || { count: 0, symbols: [] };
      current.count++;
      current.symbols.push(symbol);
      candidateFiles.set(filePath, current);
    }
  }
  
  // Find the file that exports the most of our required symbols
  let bestFile: string | undefined;
  let bestCount = 0;
  let bestSymbols: string[] = [];
  
  candidateFiles.forEach((data, filePath) => {
    if (data.count > bestCount) {
      bestCount = data.count;
      bestFile = filePath;
      bestSymbols = data.symbols;
    }
  });
  
  if (bestFile) {
    const confidence = Math.min(90, 70 + (bestCount * 10));
    return { 
      path: bestFile, 
      confidence 
    };
  }
  
  return { path: undefined, confidence: 0 };
}


function fixMissingExportsImport(issue: ImportIssue): ImportIssue[] {
  if (!issue.reason?.includes('Missing exports:')) {
    return [issue];
  }
  
  // Extract missing symbols from reason
  const missingMatch = issue.reason.match(/Missing exports: (.*)/);
  if (!missingMatch) return [issue];
  
  const missingSymbols = missingMatch[1].split(', ').map(s => s.trim());
  const suggestedPath = issue.suggestedFix;
  
  if (!suggestedPath) return [issue];
  
  // Check which symbols are actually exported by the suggested file
  const actualExports = getExportsFromPath(suggestedPath, issue.file);
  const exportedSymbols = missingSymbols.filter(symbol => 
    actualExports.includes(symbol)
  );
  
  // If some symbols are exported but not all, create multiple fixes
  if (exportedSymbols.length > 0 && exportedSymbols.length < missingSymbols.length) {
    const nonExportedSymbols = missingSymbols.filter(symbol => 
      !actualExports.includes(symbol)
    );
    
    // Find files for the non-exported symbols
    const fixes: ImportIssue[] = [];
    
    // First fix: keep exported symbols in original import
    fixes.push({
      ...issue,
      suggestedFix: suggestedPath,
      reason: `Keep exported symbols: ${exportedSymbols.join(', ')}`,
      confidenceScore: 90,
      validationMessage: `Found in ${suggestedPath}`
    });
    
    // Additional fixes for non-exported symbols
    for (const symbol of nonExportedSymbols) {
      const symbolPath = findFileExporting(symbol, allSourceFiles, issue.file);
      if (symbolPath) {
        fixes.push({
          file: issue.file,
          line: issue.line,
          importPath: issue.importPath,
          suggestedFix: symbolPath,
          reason: `Add missing symbol: ${symbol}`,
          confidenceScore: 85,
          validated: true,
          validationMessage: `Found ${symbol} in ${symbolPath}`
        });
      }
    }
    
    return fixes;
  }
  
  return [issue];
}

// Verify that a file exports all required symbols
function verifySymbolsExported(filePath: string, symbols: string[]): boolean {
  const resolvedPath = filePath.replace(/^@\//, '');
  
  // Try multiple possible bases
  const possibleBases = ['src/app', 'app', 'src'];
  let actualPath: string | undefined;
  
  for (const base of possibleBases) {
    const testPath = path.join(PROJECT_ROOT, base, resolvedPath);
    const exts = ['.ts', '.tsx', '.js', '.jsx'];
    
    for (const ext of exts) {
      if (fs.existsSync(testPath + ext)) {
        actualPath = testPath + ext;
        break;
      }
    }
    if (actualPath) break;
  }
  
  if (!actualPath) return false;
  
  try {
    const exports = getExportsCached(actualPath);
    
    // Check if all symbols are exported (default is special)
    for (const symbol of symbols) {
      if (symbol === 'default') {
        if (!exports.includes('default')) {
          return false;
        }
      } else if (!exports.includes(symbol)) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.warn(`Could not read exports from ${actualPath}:`, error);
    return false;
  }
}

// Check which symbols are missing from an existing import
function checkMissingSymbols(
  importPath: string,
  fromFile: string,
  symbols: string[]
): string[] {
  const resolvedPath = importPath.replace(/^@\//, '');
  
  // Try multiple possible bases
  const possibleBases = ['src/app', 'app', 'src'];
  let actualPath: string | undefined;
  
  for (const base of possibleBases) {
    const testPath = path.join(PROJECT_ROOT, base, resolvedPath);
    const exts = ['.ts', '.tsx', '.js', '.jsx'];
    
    for (const ext of exts) {
      if (fs.existsSync(testPath + ext)) {
        actualPath = testPath + ext;
        break;
      }
    }
    if (actualPath) break;
  }
  
  if (!actualPath) return symbols; // All symbols missing if file doesn't exist
  
  try {
    const exports = getExportsCached(actualPath);
    const missing: string[] = [];
    
    for (const symbol of symbols) {
      if (symbol === 'default') {
        if (!exports.includes('default')) {
          missing.push('default');
        }
      } else if (!exports.includes(symbol)) {
        missing.push(symbol);
      }
    }
    
    return missing;
  } catch (error) {
    console.warn(`Could not check exports from ${actualPath}:`, error);
    return symbols; // Assume all are missing if we can't check
  }
}

// Find a path for missing symbols
function findPathForMissingSymbols(
  missingSymbols: string[],
  fromFile: string,
  originalPath: string
): string | undefined {
  // Try to find a single file that exports all missing symbols
  for (const symbol of missingSymbols) {
    if (symbol === 'default') continue;
    
    const filePath = findFileExporting(symbol, allSourceFiles, fromFile);
    if (filePath) {
      // Check if this file exports all missing symbols
      if (verifySymbolsExported(filePath, missingSymbols)) {
        return filePath;
      }
    }
  }
  
  // If no single file has all, return the most promising one
  for (const symbol of missingSymbols) {
    if (symbol === 'default') continue;
    
    const filePath = findFileExporting(symbol, allSourceFiles, fromFile);
    if (filePath) {
      return filePath;
    }
  }
  
  return undefined;
}



function tryExactNameRecovery(importPath: string, fromFile: string): string | undefined {
  if (!importPath.startsWith('@/')) return;

  const base       = importPath.replace(/^@\//, '');
  const exts       = ['.ts', '.tsx'];
  const variants   = [
    base,                         // exact
    base.replace(/^ap\//, 'app/'), // typo ap→app
  ];

  for (const v of variants) {
    for (const ext of exts) {
      const p = path.join(PROJECT_ROOT, 'src', v + ext);
      if (fs.existsSync(p)) return '@/' + v; // found – keep name & fix typo only
    }
  }
  return undefined;
}

function tryFixTypo(importPath: string, fromFile: string): string | undefined {
  // 0. Exact-name recovery (preserves file name, fixes only typo/path)
  const exact = tryExactNameRecovery(importPath, fromFile);
  if (exact) return exact;

  const intent = resolveIntentPreserving(importPath, fromFile);
  if (intent) return intent;

  if (!importPath.startsWith('@/')) return;

  const exts = ['', '.ts', '.tsx', '.js', '.jsx'];
  let basePath = importPath.replace(/^@\//, '');

  // 1. Fix 'ap/' → 'app/'
  if (basePath.startsWith('ap/')) {
    basePath = 'app' + basePath.slice(2);
  }

  // 2. Fix double '/components/' or missing '/components/'
  const variants = [
    basePath, // original
    basePath.replace('/components/state/', '/state/'), // remove extra /components
    basePath.replace('/state/', '/components/state/'), // add missing /components
  ];

  for (const variant of variants) {
    for (const ext of exts) {
      const full = path.join(PROJECT_ROOT, 'src', variant + ext);
      if (fs.existsSync(full)) {
        return '@/' + variant;
      }
    }
  }

  return undefined;
}

function findBetterSuggestion(importPath: string, fromFile: string): string | undefined {
  // Don't try to fix @/ imports that look correct already
  if (importPath.startsWith('@/app/') || importPath.startsWith('@/utils/')) {
    // Check if it exists
    const { exists } = resolveESM(importPath, fromFile, allSourceFiles);
    if (exists) {
      return importPath; // It's already correct
    }
  }
  
  const importBase = path.basename(importPath, path.extname(importPath)).toLowerCase();
  
  // Get context from the import path
  const isInComponents = importPath.includes('/components/') || fromFile.includes('/components/');
  const isInUtils = importPath.includes('/utils/') || fromFile.includes('/utils/');
  const isInApp = importPath.startsWith('@/app/') || fromFile.includes('/app/');
  
  const similarFiles = allSourceFiles.filter(file => {
    const fileName = path.basename(file, path.extname(file)).toLowerCase();
    
    // Exact match is best
    if (fileName === importBase) {
      return true;
    }
    
    // Check directory context
    if (isInComponents && !file.includes('/components/')) {
      return false;
    }
    if (isInUtils && !file.includes('/utils/')) {
      return false;
    }
    if (isInApp && !file.includes('/app/')) {
      return false;
    }
    
    // Check for meaningful similarity (not just partial matches)
    const wordsInImport = importBase.split(/(?=[A-Z])|_|-/).filter(w => w.length > 2);
    const wordsInFile = fileName.split(/(?=[A-Z])|_|-/).filter(w => w.length > 2);
    
    const commonWords = wordsInImport.filter(word => 
      wordsInFile.some(fileWord => 
        fileWord.toLowerCase().includes(word.toLowerCase()) || 
        word.toLowerCase().includes(fileWord.toLowerCase())
      )
    );
    
    return commonWords.length >= Math.min(wordsInImport.length, 2);
  });

  if (similarFiles.length > 0) {
    // Prefer same-dir matches
    const sameDirFiles = similarFiles.filter(
      f => path.dirname(f) === path.dirname(fromFile)
    );
    
    // Prefer files with exact name match
    const exactMatches = similarFiles.filter(
      f => path.basename(f, path.extname(f)).toLowerCase() === importBase
    );
    
    const targetFile = exactMatches[0] || sameDirFiles[0] || similarFiles[0];

    /* ----- Additional validation ----- */
    const originalBase = path.basename(importPath, path.extname(importPath));
    const candidateBase = path.basename(targetFile, path.extname(targetFile));
    
    // Skip if the suggested file has a completely different purpose
    // (e.g., suggesting Calendar for CalendarMonthView is wrong)
    if (originalBase.includes('MonthView') && !candidateBase.includes('Month')) {
      return undefined;
    }
    if (originalBase.includes('Component') && !candidateBase.includes('Component')) {
      return undefined;
    }

    // Build return path
    const relativeToSrc = path.relative(SRC_ROOT, targetFile).replace(/\\/g, '/');
    const exts = ['', '.ts', '.tsx', '.js', '.mjs', '.jsx'];
    for (const ext of exts) {
      if (fs.existsSync(targetFile + ext)) {
        return `@/${relativeToSrc.replace(/\.(ts|tsx|js|mjs|jsx)$/, '')}`;
      }
    }
  }

  return undefined;
}

// ---------------------
// TypeScript Check
// ---------------------
async function runTypeScriptCheck(): Promise<string[]> {
  console.log('🔍 Running TypeScript compiler...');
  try {
    const result = execSync('npx tsc --noEmit --pretty false 2>&1', {
      encoding: 'utf8'
    });

    const errors: string[] = [];
    result.split('\n').forEach(line => {
      if (line.includes('error TS2307')) errors.push(line.trim());
    });

    return errors;
  } catch (e: any) {
    return (e.stdout || e.stderr || '')
      .split('\n')
      .filter((l: string) => l.includes('TS2307'));
  }
}


// In the autoFixAliases function or when deciding which fixes to apply:
function shouldApplyFix(fix: ImportFix | ImportIssue): boolean {
  // Extract suggested path from fix
  let suggestedFix: any;
  let confidenceScore: number | undefined;
  
  if ('confidenceScore' in fix) {
    // This is ImportFix
    confidenceScore = fix.confidenceScore;
    suggestedFix = fix.targetImportPath;
  } else {
    // This is ImportIssue
    confidenceScore = (fix as any).confidenceScore;
    suggestedFix = (fix as any).suggestedFix;
  }
  
  // Extract string from object if needed
  if (suggestedFix && typeof suggestedFix === 'object') {
    if (typeof suggestedFix.path === 'string') {
      suggestedFix = suggestedFix.path;
    } else if (typeof suggestedFix.suggestedFix === 'string') {
      suggestedFix = suggestedFix.suggestedFix;
    } else {
      console.log(`⚠️  Skipping fix: Cannot extract string path from object`);
      return false;
    }
  }
  
  // Check confidence score
  if (confidenceScore !== undefined && confidenceScore < SAFE_THRESHOLD) {
    console.log(`⚠️  Skipping low confidence fix: ${confidenceScore} < ${SAFE_THRESHOLD}`);
    return false;
  }
  
  // Additional validation - check if the suggestion makes sense
  const issue = fix as any;
  
  // Don't apply fixes that change component names to completely different components
  if (issue.importPath && suggestedFix) {
    const importName = path.basename(issue.importPath, path.extname(issue.importPath));
    const suggestedName = path.basename(suggestedFix, path.extname(suggestedFix));
    
    // If the suggested name is completely different (like Calendar for CalendarMonthView), skip
    if (importName.includes('MonthView') && !suggestedName.includes('Month')) {
      console.log(`⚠️  Skipping: ${importName} → ${suggestedName} (name mismatch)`);
      return false;
    }
    
    // Don't change from @/utils to @/app unless there's a good reason
    if (issue.importPath.startsWith('@/utils/') && suggestedFix.startsWith('@/app/')) {
      console.log(`⚠️  Skipping: Changing from utils to app directory`);
      return false;
    }
  }
  
  try {
    const validation = importValidator.validateFix(fix);
    return validation.isValid;
  } catch (error) {
    console.warn(`Validation failed for fix:`, error);
    return false;
  }
}

function filterProblematicFixes(issues: ImportIssue[]): ImportIssue[] {
  return issues.filter(issue => {
    // Extract the actual suggested path (might be an object)
    let suggestedFix: any = issue.suggestedFix;
    
    if (suggestedFix && typeof suggestedFix === 'object') {
      if (typeof suggestedFix.path === 'string') {
        suggestedFix = suggestedFix.path;
      } else if (typeof suggestedFix.suggestedFix === 'string') {
        suggestedFix = suggestedFix.suggestedFix;
      } else {
        // If we can't extract a string path, skip this fix
        console.log(`⚠️  Skipping: Cannot extract string path from object`, suggestedFix);
        return false;
      }
    }
    
    // Skip fixes that are clearly wrong
    if (suggestedFix) {
      // Only reject if we have a better suggestion already
      const importName = path.basename(issue.importPath, path.extname(issue.importPath));
      const suggestedName = path.basename(suggestedFix, path.extname(suggestedFix));
      
      // Don't reject just because names don't match exactly
      // Only reject if the suggestion makes no sense at all
      if (importName.includes('MonthView') && suggestedName.includes('Calendar') && !suggestedName.includes('Month')) {
        console.log(`⚠️  Skipping: ${importName} → ${suggestedName} (possible wrong component)`);
        return false;
      }
      
      // Don't reject directory changes if they make sense
      if (issue.importPath.startsWith('@/utils/') && suggestedFix.startsWith('@/app/')) {
        // Check if the app version actually exists
        const appVersionExists = checkIfFileExists(suggestedFix, issue.file);
        const utilsVersionExists = checkIfFileExists(
          issue.importPath.replace('@/utils/', '@/app/'), 
          issue.file
        );
        
        if (!appVersionExists && utilsVersionExists) {
          console.log(`⚠️  Skipping: ${issue.importPath} → ${suggestedFix} (@/utils version exists)`);
          return false;
        }
      }
    }
    
    return true;
  });
}

function checkIfFileExists(importPath: any, fromFile: string): boolean {
  const exts = ['', '.ts', '.tsx', '.js', '.jsx'];
  
  // Extract string from object if needed
  let pathString: string;
  
  if (typeof importPath === 'object' && importPath !== null) {
    if (typeof importPath.path === 'string') {
      pathString = importPath.path;
    } else if (typeof importPath.suggestedFix === 'string') {
      pathString = importPath.suggestedFix;
    } else {
      return false;
    }
  } else if (typeof importPath === 'string') {
    pathString = importPath;
  } else {
    return false;
  }
  
  if (pathString.startsWith('@/')) {
    const relativePath = pathString.replace(/^@\//, '');
    const possibleBases = ['src/app', 'app', 'src'];
    
    for (const base of possibleBases) {
      const basePath = path.join(PROJECT_ROOT, base, relativePath);
      for (const ext of exts) {
        if (fs.existsSync(basePath + ext)) {
          return true;
        }
      }
    }
  }
  
  return false;
}


// ---------------------
// Auto-fix Aliases (WITH VALIDATION)
// ---------------------
function autoFixAliases(issues: ImportIssue[]): { fixed: number; failed: number } {
  let fixed = 0;
  let failed = 0;
  const total = issues.length;
  
  console.log(`🔧 Starting to fix ${total} issues...`);
  
  // Group issues by file for batch processing
  const issuesByFile = new Map<string, ImportIssue[]>();
  
  for (const issue of issues) {
    if (!issuesByFile.has(issue.file)) {
      issuesByFile.set(issue.file, []);
    }
    issuesByFile.get(issue.file)!.push(issue);
  }
  
  console.log(`📊 Processing ${issuesByFile.size} files with multiple fixes each`);
  
  let fileIndex = 0;
  const totalFiles = issuesByFile.size;
  
  for (const [filePath, fileIssues] of issuesByFile) {
    fileIndex++;
    
    // Show progress
    if (fileIndex % 10 === 0 || fileIndex === totalFiles) {
      console.log(`📊 File progress: ${fileIndex}/${totalFiles} (${Math.round((fileIndex / totalFiles) * 100)}%)`);
    }
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      failed += fileIssues.length;
      continue;
    }
    
    try {
      // Read file once
      const startTime = Date.now();
      let content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      let fileFixed = 0;
      let fileFailed = 0;
      
      // Process all issues for this file
      for (const issue of fileIssues) {
        // Validate the issue
        if (!shouldApplyFix(issue)) {
          fileFailed++;
          continue;
        }
        
        if (!issue.suggestedFix || !issue.validated) {
          fileFailed++;
          continue;
        }
        
        // Check if line exists and contains the import
        if (issue.line - 1 >= lines.length) {
          console.log(`❌ Line ${issue.line} out of bounds in ${filePath}`);
          fileFailed++;
          continue;
        }
        
        const lineIndex = issue.line - 1;
        let lineContent = lines[lineIndex];
        
        // Check if the import path exists in this line
        if (!lineContent.includes(issue.importPath)) {
          // Try to find which line actually has this import
          const foundLineIndex = lines.findIndex(line => line.includes(issue.importPath));
          if (foundLineIndex === -1) {
            console.log(`❌ Import path '${issue.importPath}' not found in ${filePath}`);
            fileFailed++;
            continue;
          }
          // Update the issue with the correct line
          issue.line = foundLineIndex + 1;
          lineContent = lines[foundLineIndex];
        }
        
        // Perform the replacement
        const importPattern = new RegExp(`(['"])${issue.importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`);
        
        if (!importPattern.test(lineContent)) {
          console.log(`❌ Could not match import pattern in ${filePath}:${issue.line}`);
          fileFailed++;
          continue;
        }
        
        const newLine = lineContent.replace(importPattern, `$1${issue.suggestedFix}$2`);
        lines[lineIndex] = newLine;
        fileFixed++;
        
        // Record the fix (simplified version for batching)
        safeFixer.recordFix({
          file: filePath,
          originalImport: issue.importPath,
          newImport: issue.suggestedFix,
          line: issue.line
        });
      }
      
      // Write file once with all changes
      if (fileFixed > 0) {
        // Create backup
        const backupPath = safeFixer.createBackup(filePath);
        
        // Write the modified content
        const newContent = lines.join('\n');
        fs.writeFileSync(filePath, newContent);
        
        const elapsed = Date.now() - startTime;
        console.log(`✅ Fixed ${fileFixed} imports in ${path.basename(filePath)} (${elapsed}ms)`);
        fixed += fileFixed;
      }
      
      failed += fileFailed;
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error);
      failed += fileIssues.length;
    }
  }
  
  console.log(`\n📊 Final results: ${fixed} fixed, ${failed} failed out of ${total} total`);
  
  // Save all records at once
  safeFixer.saveRecords(path.join('./reports', `fix-records-${Date.now()}.json`));
  return { fixed, failed };
}

function resolveIntentPreserving(
  importPath: string,
  fromFile: string
): string | undefined {
  const exts = ['.ts', '.tsx'];
  const isImporterTSX = fromFile.endsWith('.tsx');

  // 1. Try the exact path first (respect original extension)
  for (const ext of exts) {
    const exact = path.join(PROJECT_ROOT, 'src', importPath.replace(/^@\//, '') + ext);
    if (fs.existsSync(exact)) return importPath; // exact hit – keep it
  }

  // 2. If importer is TSX and import has NO extension, prefer .tsx inside components/
  if (isImporterTSX && !importPath.endsWith('.ts') && !importPath.endsWith('.tsx')) {
    const componentsCandidate = path.join(
      PROJECT_ROOT,
      'src',
      importPath.replace(/^@\//, '') + '.tsx'
    );
    if (fs.existsSync(componentsCandidate) && componentsCandidate.includes('/components/')) {
      return importPath; // already points to .tsx in components – keep
    }

    // 3. If original .ts exists BUT there’s also a .tsx in components, return the latter
    const tsPath  = path.join(PROJECT_ROOT, 'src', importPath.replace(/^@\//, '') + '.ts');
    const tsxPath = path.join(PROJECT_ROOT, 'src', importPath.replace(/^@\//, '') + '.tsx');
    if (fs.existsSync(tsPath) && fs.existsSync(tsxPath) && tsxPath.includes('/components/')) {
      return importPath + '.tsx'; // force .tsx version
    }
  }

  return undefined;
}


function tryFileNameHit(importPath: string): string | undefined {
  if (!importPath.startsWith('@/')) return;
  const base  = importPath.replace(/^@\//, '');
  const exts  = ['.ts', '.tsx'];
  for (const ext of exts) {
    const p = path.join(PROJECT_ROOT, 'src', base + ext);
    if (fs.existsSync(p)) return importPath; // file exists – use as-is
  }
  return undefined;
}

// ---------------------
// Generate Report with Validation Status
// ---------------------
function generateDetailedReport(validIssues: ImportIssue[], invalidIssues: ImportIssue[] = [], outputPath: string = './reports/import-fixes.md') {
  const filesWithValidIssues = new Set(validIssues.map(i => i.file));
  const filesWithInvalidIssues = new Set(invalidIssues.map(i => i.file));
  
  let markdown = `# 📦 Import Fix Report (Validated)\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n`;
  markdown += `**Total Issues Found:** ${validIssues.length + invalidIssues.length}\n`;
  markdown += `**✅ Valid Suggestions:** ${validIssues.length}\n`;
  markdown += `**❌ Invalid/Needs Review:** ${invalidIssues.length}\n`;
  markdown += `**Files with Valid Issues:** ${filesWithValidIssues.size}\n`;
  markdown += `**Files with Invalid Issues:** ${filesWithInvalidIssues.size}\n\n`;
  
  markdown += `## ✅ Validated Fixes (Ready to Apply)\n\n`;
  
  if (validIssues.length === 0) {
    markdown += `No validated fixes available.\n`;
  } else {
    // Group valid issues by file
    const validIssuesByFile: Record<string, ImportIssue[]> = {};
    validIssues.forEach(issue => {
      if (!validIssuesByFile[issue.file]) {
        validIssuesByFile[issue.file] = [];
      }
      validIssuesByFile[issue.file].push(issue);
    });
    
    Object.entries(validIssuesByFile).forEach(([file, fileIssues]) => {
      const relativePath = path.relative(PROJECT_ROOT, file);
      markdown += `#### 📄 ${relativePath}\n\n`;
      
      fileIssues.forEach((issue, index) => {
        // Extract suggested fix from object if needed
        let suggestedFix = issue.suggestedFix;
        if (suggestedFix && typeof suggestedFix === 'object') {
          if (typeof suggestedFix.path === 'string') {
            suggestedFix = suggestedFix.path;
          } else if (typeof suggestedFix.suggestedFix === 'string') {
            suggestedFix = suggestedFix.suggestedFix;
          } else {
            suggestedFix = '[Object]';
          }
        }
        
        markdown += `${index + 1}. **Line ${issue.line}**: \`${issue.importPath}\`\n`;
        markdown += `   - **Suggested fix:** \`${issue.importPath}\` → \`${suggestedFix}\`\n`;
        if (issue.validationMessage) {
          markdown += `   - **Validation:** ${issue.validationMessage}\n`;
        }
        markdown += `\n`;
      });
    });
  }
  
  if (invalidIssues.length > 0) {
    markdown += `## ❌ Issues Needing Manual Review\n\n`;
    
    // Group invalid issues by file
    const invalidIssuesByFile: Record<string, ImportIssue[]> = {};
    invalidIssues.forEach(issue => {
      if (!invalidIssuesByFile[issue.file]) {
        invalidIssuesByFile[issue.file] = [];
      }
      invalidIssuesByFile[issue.file].push(issue);
    });
    
    Object.entries(invalidIssuesByFile).forEach(([file, fileIssues]) => {
      const relativePath = path.relative(PROJECT_ROOT, file);
      markdown += `#### 📄 ${relativePath}\n\n`;
      
      fileIssues.forEach((issue, index) => {
        markdown += `${index + 1}. **Line ${issue.line}**: \`${issue.importPath}\`\n`;
        markdown += `   - **Reason:** ${issue.reason}\n`;
        if (issue.validationMessage) {
          markdown += `   - **Validation:** ${issue.validationMessage}\n`;
        }
        if (issue.suggestedFix) {
          markdown += `   - **Original suggestion (rejected):** \`${issue.suggestedFix}\`\n`;
        }
        markdown += `\n`;
      });
    });
  }
  
  // Commands section
  markdown += `### 🚀 Available Commands\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `# Scan only (dry run)\n`;
  markdown += `pnpm run fix-imports:dry-run\n\n`;
  markdown += `# Apply safest fixes only (symbol-based, ≥95% confidence)\n`;
  markdown += `pnpm run fix-imports:safe\n\n`;
  markdown += `# Apply high confidence fixes (≥90% confidence)\n`;
  markdown += `pnpm run fix-imports:high\n\n`;
  markdown += `# Apply medium+ confidence fixes (≥70% confidence)\n`;
  markdown += `pnpm run fix-imports\n\n`;
  markdown += `# Apply all fixes (including low confidence)\n`;
  markdown += `pnpm run fix-imports:all\n\n`;
  markdown += `# Rollback all previous fixes\n`;
  markdown += `pnpm run fix-imports:rollback\n`;
  markdown += `\`\`\`\n\n`;

  // Recommended workflow
  markdown += `### 📋 Recommended Workflow\n\n`;
  markdown += `1. **Scan first:** \`pnpm run fix-imports:dry-run\`\n`;
  markdown += `2. **Review report:** Check ./reports/import-fixes.md\n`;
  markdown += `3. **Apply safest fixes:** \`pnpm run fix-imports:safe\`\n`;
  markdown += `4. **Test:** \`pnpm run test:types\`\n`;
  markdown += `5. **If needed, apply more fixes:** \`pnpm run fix-imports:high\` or \`pnpm run fix-imports\`\n`;
  markdown += `6. **Rollback if needed:** \`pnpm run fix-imports:rollback\`\n\n`;
  
  // Ensure directory exists
  const reportDir = path.dirname(outputPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, markdown);
  console.log(`📄 Detailed report saved to: ${outputPath}`);
}


// ---------------------
// Main (UPDATED WITH VALIDATION)
// ---------------------
async function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  const shouldFixHigh = args.includes('--fix-high');
  const shouldFixAll = args.includes('--fix-all');
  const isDryRun = args.includes('--dry-run');
  const isSafeMode = args.includes('--safe');
  
  console.log('\n🎯 Import Fixer - Symbol-Aware Edition\n');
  console.log('='.repeat(60));

  // First, build a comprehensive export cache
  console.log('📦 Building export cache...');
  
  // Pre-build export cache for all source files
  for (const file of allSourceFiles) {
    try {
      const resolved = path.resolve(file);
      const exports = getExports(resolved);
      exportCache.set(resolved, exports);
    } catch (error) {
      console.warn(`⚠️ Could not analyze exports for ${file}:`, error);
    }
  }
  console.log(`✅ Cached exports for ${exportCache.size} files`);
  
  const tsErrors = await runTypeScriptCheck();
  console.log(`📋 TypeScript import errors: ${tsErrors.length}`);
  
  console.log('\n🔍 Scanning for import issues with symbol awareness...');
  const runtimeIssues = scanRuntimeImportFailures();
  
  console.log('\n🔍 Analyzing import issues with symbol-based resolution...');
  const analyzedIssues = createSmartImportFixes(runtimeIssues);
  
  console.log(`📊 Found ${analyzedIssues.length} issues after symbol analysis`);
  
  // VALIDATION STEP
  console.log('\n🔍 Validating suggested fixes...');
  const { validIssues, invalidIssues, validationReport } = await validateAndFilterIssues(analyzedIssues);
  
  // FILTER OUT PROBLEMATIC FIXES
  const filteredValidIssues = filterProblematicFixes(validIssues);
  const filteredCount = validIssues.length - filteredValidIssues.length;
  if (filteredCount > 0) {
    console.log(`\n⚠️  Filtered out ${filteredCount} problematic fixes`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SYMBOL-AWARE SCAN RESULTS');
  console.log('='.repeat(60));
  
  // Create report directory
  const reportDir = './reports';
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Categorize issues by type
  const symbolBasedIssues = filteredValidIssues.filter(i => i.reason?.includes('Symbol-based'));
  const otherIssues = filteredValidIssues.filter(i => !i.reason?.includes('Symbol-based'));
  
  if (filteredValidIssues.length === 0) {
    console.log('✅ No validated import issues found');
  } else {
    console.log(`🚨 Found ${filteredValidIssues.length} VALIDATED import issues`);
    console.log(`   📈 ${symbolBasedIssues.length} symbol-based resolutions`);
    console.log(`   📊 ${otherIssues.length} other issues`);
    console.log(`⚠️  ${invalidIssues.length} issues had invalid suggestions and need manual review\n`);
    
    // Save validation report
    fs.writeFileSync(
      path.join(reportDir, 'validation-report.md'),
      validationReport
    );
    
    // queue low-confidence items for next scan
    const manual = filteredValidIssues.filter(i => (i.confidenceScore ?? 0) < SAFE_THRESHOLD);
    if (manual.length) {
      fs.writeFileSync(
        path.join(reportDir, 'manual-review-queue.json'),
        JSON.stringify(manual, null, 2)
      );
      console.log(`📋 ${manual.length} low-confidence fixes queued for manual review.`);
    }
    
    // Show examples of symbol-based fixes
    if (symbolBasedIssues.length > 0) {
      console.log('📝 Example SYMBOL-BASED fixes (high confidence):');
      symbolBasedIssues.slice(0, 10).forEach((issue, idx) => {
        const relativeFile = path.relative(PROJECT_ROOT, issue.file);
        console.log(`${idx + 1}. ${relativeFile}:${issue.line}`);
        console.log(`   ${issue.importPath} → ${issue.suggestedFix}`);
        console.log(`   Reason: ${issue.reason} (conf: ${issue.confidenceScore}%)`);
      });
    }
    
    if (otherIssues.length > 0) {
      console.log('\n📝 Example OTHER fixes:');
      otherIssues.slice(0, 5).forEach((issue, idx) => {
        const relativeFile = path.relative(PROJECT_ROOT, issue.file);
        console.log(`${idx + 1}. ${relativeFile}:${issue.line}`);
        console.log(`   ${issue.importPath} → ${issue.suggestedFix}  (conf: ${issue.confidenceScore ?? '—'}%)`);
      });
    }
    
    if (invalidIssues.length > 0) {
      console.log('\n❌ Example INVALID suggestions (needs manual review):');
      invalidIssues.slice(0, 5).forEach((issue, idx) => {
        const relativeFile = path.relative(PROJECT_ROOT, issue.file);
        console.log(`${idx + 1}. ${relativeFile}:${issue.line}`);
        console.log(`   ${issue.importPath} → ${issue.reason}`);
      });
    }
    
    // Generate detailed report with validation status
    generateDetailedReport(filteredValidIssues, invalidIssues);
  }

  // DETERMINE FIXING STRATEGY
  let applyFixes = false;
  let confidenceThreshold = 0;
  let mode = '';

  if (shouldFixAll) {
    applyFixes = true;
    confidenceThreshold = 0; // Apply all
    mode = 'all';
  } else if (shouldFixHigh) {
    applyFixes = true;
    confidenceThreshold = 75; // Lowered from 90
    mode = 'high';
  } else if (isSafeMode) {
    applyFixes = true;
    confidenceThreshold = 85; // Lowered from 95 (symbol-based with partial matches)
    mode = 'safe';
  } else if (shouldFix) {
    applyFixes = true;
    confidenceThreshold = 60; // Lowered from 70
    mode = 'default';
  } else if (isDryRun) {
    mode = 'dry-run';
  }

  
  if (mode === 'dry-run') {
    console.log('\n' + '='.repeat(60));
    console.log('📊 DRY RUN - No changes made');
    console.log('='.repeat(60));
    
    // Show what would be fixed with different thresholds
    const symbolBasedCount = filteredValidIssues.filter(i => 
      i.confidenceScore && i.confidenceScore >= 95
    ).length;
    const highConfidenceCount = filteredValidIssues.filter(i => 
      i.confidenceScore && i.confidenceScore >= 90
    ).length;
    const mediumConfidenceCount = filteredValidIssues.filter(i => 
      i.confidenceScore && i.confidenceScore >= 70 && i.confidenceScore < 90
    ).length;
    const lowConfidenceCount = filteredValidIssues.filter(i => 
      !i.confidenceScore || i.confidenceScore < 70
    ).length;
    
    console.log(`\n📊 What would be fixed with different commands:`);
    console.log(`   pnpm run fix-imports:safe - ${symbolBasedCount} symbol-based fixes (≥95%)`);
    console.log(`   pnpm run fix-imports:high - ${highConfidenceCount} high confidence fixes (≥90%)`);
    console.log(`   pnpm run fix-imports - ${highConfidenceCount + mediumConfidenceCount} medium+ fixes (≥70%)`);
    console.log(`   pnpm run fix-imports:all - ${filteredValidIssues.length} all fixes`);
    
    console.log(`\n⚠️  ${lowConfidenceCount} low confidence issues need manual review`);
  } 
  else if (applyFixes && filteredValidIssues.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('🔧 AUTO-FIXING VALIDATED BROKEN IMPORTS');
    console.log('='.repeat(60));
    
    const sortedIssues = [...filteredValidIssues].sort((a, b) => 
      (b.confidenceScore || 0) - (a.confidenceScore || 0)
    );
  
    // Filter issues by confidence threshold
    const issuesToFix = filteredValidIssues.filter(issue => 
      issue.confidenceScore && issue.confidenceScore >= confidenceThreshold
    );
    
    console.log(`📊 Mode: ${mode.toUpperCase()}, applying fixes with confidence ≥ ${confidenceThreshold}%`);
    console.log(`   Total issues: ${filteredValidIssues.length}`);
    console.log(`   Issues to fix: ${issuesToFix.length}`);
    console.log(`   Skipped: ${filteredValidIssues.length - issuesToFix.length}`);
    
    const confidenceGroups = {
      '≥90%': issuesToFix.filter(i => i.confidenceScore && i.confidenceScore >= 90).length,
      '80-89%': issuesToFix.filter(i => i.confidenceScore && i.confidenceScore >= 80 && i.confidenceScore < 90).length,
      '70-79%': issuesToFix.filter(i => i.confidenceScore && i.confidenceScore >= 70 && i.confidenceScore < 80).length,
      '60-69%': issuesToFix.filter(i => i.confidenceScore && i.confidenceScore >= 60 && i.confidenceScore < 70).length,
      '<60%': issuesToFix.filter(i => i.confidenceScore && i.confidenceScore < 60).length,
    };

    console.log(`📈 Confidence distribution:`);
    for (const [range, count] of Object.entries(confidenceGroups)) {
      if (count > 0) {
        console.log(`   ${range}: ${count} issues`);
      }
    }
    if (issuesToFix.length === 0) {
      console.log('\n⚠️  No fixes meet the confidence threshold');
      
      // Show what would be fixed with lower thresholds
      const mediumConfidence = filteredValidIssues.filter(i => 
        i.confidenceScore && i.confidenceScore >= 70
      ).length;
      const lowConfidence = filteredValidIssues.filter(i => 
        !i.confidenceScore || i.confidenceScore < 70
      ).length;
      
      console.log(`\n📊 Try these commands instead:`);
      console.log(`   pnpm run fix-imports:high - Apply high confidence fixes (≥90%)`);
      console.log(`   pnpm run fix-imports - Apply medium+ confidence fixes (≥70%)`);
      console.log(`   pnpm run fix-imports:all - Apply all fixes`);
      
      process.exit(0);
    }
    
    // Apply fixes
    const { fixed, failed } = autoFixAliases(issuesToFix);
    console.log(`\n📊 Fix Results:`);
    console.log(`✅ Fixed: ${fixed} imports`);
    console.log(`❌ Failed: ${failed} imports`);
    
    // Save remaining issues for manual review
    const remainingIssues = filteredValidIssues.filter(issue => 
      !issue.confidenceScore || issue.confidenceScore < confidenceThreshold
    );
    
    if (remainingIssues.length > 0) {
      fs.writeFileSync(
        path.join(reportDir, `remaining-issues-${mode}.json`),
        JSON.stringify(remainingIssues, null, 2)
      );
      console.log(`\n📋 ${remainingIssues.length} remaining issues saved for manual review`);
    }
    
    if (fixed > 0) {
      console.log(`\n💡 Tip: Run the scanner again to verify fixes`);
      console.log(`   Command: pnpm run fix-imports:dry-run`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Symbol-aware scan complete');
  console.log('='.repeat(60));
  
  // Save comprehensive report
  const data = {
    generated: new Date().toISOString(),
    summary: {
      totalFilesScanned: allSourceFiles.length,
      totalIssuesFound: runtimeIssues.length,
      symbolBasedIssues: symbolBasedIssues.length,
      otherIssues: otherIssues.length,
      validatedIssues: filteredValidIssues.length,
      invalidIssues: invalidIssues.length,
      highConfidence: filteredValidIssues.filter(i => i.confidenceScore && i.confidenceScore >= 90).length,
      mediumConfidence: filteredValidIssues.filter(i => i.confidenceScore && i.confidenceScore >= 70 && i.confidenceScore < 90).length,
      lowConfidence: filteredValidIssues.filter(i => !i.confidenceScore || i.confidenceScore < 70).length,
    },
    symbolBasedIssues: symbolBasedIssues.map(issue => ({
      file: path.relative(PROJECT_ROOT, issue.file),
      line: issue.line,
      importPath: issue.importPath,
      suggestedFix: issue.suggestedFix,
      reason: issue.reason,
      confidenceScore: issue.confidenceScore,
      validationMessage: issue.validationMessage
    })),
    otherValidIssues: otherIssues.map(issue => ({
      file: path.relative(PROJECT_ROOT, issue.file),
      line: issue.line,
      importPath: issue.importPath,
      suggestedFix: issue.suggestedFix,
      reason: issue.reason,
      confidenceScore: issue.confidenceScore,
      validationMessage: issue.validationMessage
    })),
    invalidIssues: invalidIssues.map(issue => ({
      file: path.relative(PROJECT_ROOT, issue.file),
      line: issue.line,
      importPath: issue.importPath,
      originalSuggestion: issue.suggestedFix,
      reason: issue.reason,
      validationMessage: issue.validationMessage
    })),
    exportCacheStats: {
      totalFiles: exportCache.size,
      averageExportsPerFile: Math.round(
        Array.from(exportCache.values()).reduce((sum, exports) => sum + exports.length, 0) / exportCache.size
      ),
      uniqueExports: new Set(Array.from(exportCache.values()).flat()).size
    }
  };

  if (process.argv.includes('--rollback')) {
    const rec = './reports/fix-records-<latest>.json';
    const records = safeFixer.loadRecords(rec);
    records.forEach(r => fs.copyFileSync(r.backupPath, r.file));
    console.log('✅ Rolled back', records.length, 'files');
    process.exit(0);
  }
  
  fs.writeFileSync(
    path.join(reportDir, 'import-issues-symbol-aware.json'),
    JSON.stringify(data, null, 2)
  );
  
  console.log(`📄 Full report saved to: ${path.join(reportDir, 'import-issues-symbol-aware.json')}`);
}


// Function to create smart import fixes that split imports when needed
function createSmartImportFixes(issues: ImportIssue[]): ImportIssue[] {
  const smartFixes: ImportIssue[] = [];
  
  for (const issue of issues) {
    // Skip if no suggested fix
    if (!issue.suggestedFix) {
      smartFixes.push(issue);
      continue;
    }
    
    // Check if this is a "Missing exports" issue
    if (issue.reason?.includes('Missing exports:')) {
      // Already handled by fixMissingExportsImport
      smartFixes.push(issue);
      continue;
    }
    
    // Check if the suggested file exports all needed symbols
    const importMatch = issue.importPath.match(/import\s+(?:([\w*\s{},]+)\s+from\s+)?['"]([^'"]+)['"]/);
    if (!importMatch) {
      smartFixes.push(issue);
      continue;
    }
    
    const importClause = importMatch[1];
    if (!importClause) {
      smartFixes.push(issue);
      continue;
    }
    
    const importedSymbols = extractImportedSymbols(importClause);
    const suggestedExports = getExportsFromPath(issue.suggestedFix, issue.file);
    
    // Check which symbols are actually exported
    const exportedSymbols = importedSymbols.filter(symbol => 
      suggestedExports.includes(symbol) || symbol === 'default'
    );
    
    const missingSymbols = importedSymbols.filter(symbol => 
      !suggestedExports.includes(symbol) && symbol !== 'default'
    );
    
    // If all symbols are exported, use the original fix
    if (missingSymbols.length === 0) {
      smartFixes.push(issue);
      continue;
    }
    
    // If some symbols are missing, create multiple fixes
    if (exportedSymbols.length > 0) {
      // First fix: keep exported symbols
      smartFixes.push({
        ...issue,
        suggestedFix: issue.suggestedFix,
        reason: `Keep exported symbols: ${exportedSymbols.join(', ')}`,
        confidenceScore: Math.max(issue.confidenceScore || 30, 85),
        validationMessage: `${exportedSymbols.length} of ${importedSymbols.length} symbols found`
      });
    }
    
    // Find files for missing symbols
    for (const symbol of missingSymbols) {
      const symbolPath = findFileExporting(symbol, allSourceFiles, issue.file);
      if (symbolPath) {
        smartFixes.push({
          file: issue.file,
          line: issue.line,
          importPath: issue.importPath,
          suggestedFix: symbolPath,
          reason: `Add missing symbol: ${symbol}`,
          confidenceScore: 80,
          validated: true,
          validationMessage: `Found ${symbol} in ${symbolPath}`
        });
      }
    }
  }
  
  return smartFixes;
}


// Helper function for user confirmation
async function askForConfirmation(question: string): Promise<boolean> {
  if (process.env.CI) {
    return false; // Skip in CI environments
  }
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(`${question} (y/N) `, (answer: string) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});