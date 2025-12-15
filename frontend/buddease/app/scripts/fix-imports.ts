// scripts/fix-imports.ts - UPDATED VERSION

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { SafeFixer } from './safe-fixer'; // ADD THIS
import ts from 'typescript';
import { ImportValidator } from '@/app/scripts/import-validator'

const PROJECT_ROOT = process.cwd();
const SRC_ROOT = path.join(PROJECT_ROOT, 'src');

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
  suggestedFix?: string; // Add suggested fix
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
// FIND CORRECT PATH FOR BROKEN IMPORT
// ---------------------
function findCorrectPath(importPath: string, fromFile: string, allFiles: string[]): string | null {
  const exts = ['', '.ts', '.tsx', '.js', '.mjs', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx', '.d.ts', '.css', '.json'];

  // ---------- HANDLE ALIAS @/ ----------
  if (importPath.startsWith('@/')) {
    const relativePath = importPath.replace(/^@\//, '');
    const searchPath = path.join(SRC_ROOT, relativePath);

    // Exact path exists?
    if (exts.some(ext => fs.existsSync(searchPath + ext))) return importPath;

    // Fuzzy match
    const importFileName = path.basename(importPath).toLowerCase();
    const possibleMatches = allFiles.filter(file => {
      const fileName = path.basename(file, path.extname(file)).toLowerCase();
      return fileName.includes(importFileName) || importFileName.includes(fileName);
    });

    if (possibleMatches.length > 0) {
      const bestMatch = possibleMatches[0];
      const relativeToSrc = path.relative(SRC_ROOT, bestMatch).replace(/\\/g, '/');
      return `@/${relativeToSrc.replace(/\.(ts|tsx|js|mjs|jsx|css|json)$/, '')}`;
    }
  }

  // ---------- HANDLE RELATIVE PATHS ./ or ../ ----------
  if (importPath.startsWith('.') || importPath.startsWith('/')) {
    const absoluteTarget = path.resolve(path.dirname(fromFile), importPath);

    // Exact path exists?
    for (const ext of exts) {
      if (fs.existsSync(absoluteTarget + ext)) {
        let rel = path.relative(SRC_ROOT, absoluteTarget + ext).replace(/\\/g, '/');

        // Prefer alias if inside SRC_ROOT
        if (rel.startsWith('app/')) rel = `@/${rel}`;
        else if (!rel.startsWith('.')) rel = './' + rel;

        return rel.replace(/\.(ts|tsx|js|mjs|jsx|css|json)$/, '');
      }
    }

    // Fuzzy match
    const importFileName = path.basename(importPath).toLowerCase();
    const possibleMatches = allFiles.filter(file => {
      const fileName = path.basename(file, path.extname(file)).toLowerCase();
      return fileName.includes(importFileName) || importFileName.includes(fileName);
    });

    if (possibleMatches.length > 0) {
      const bestMatch = possibleMatches[0];
      let rel = path.relative(path.dirname(fromFile), bestMatch).replace(/\\/g, '/');
      if (!rel.startsWith('.')) rel = './' + rel;

      // Convert to alias if inside app/
      const relativeToSrc = path.relative(SRC_ROOT, bestMatch).replace(/\\/g, '/');
      if (relativeToSrc.startsWith('app/')) {
        return `@/${relativeToSrc.replace(/\.(ts|tsx|js|mjs|jsx|css|json)$/, '')}`;
      }

      return rel.replace(/\.(ts|tsx|js|mjs|jsx|css|json)$/, '');
    }
  }

  return null; // no suggestion found
}

const importValidator = new ImportValidator(SRC_ROOT);

// ---------------------
// REAL ESM RESOLUTION CHECK (updated with findFileExporting)
// ---------------------
function resolveESM(
  importPath: string,
  fromFile: string,
  allFiles: string[],
  importedSymbol: string = 'default'
): { exists: boolean; suggestedPath?: string | null } {
  // First check if file exists at exact path
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
      return { exists: false, suggestedPath: suggested };
    }
    
    return { exists: false, suggestedPath: null };
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
    return { exists: false, suggestedPath: suggested };
  }
  
  return { exists: false, suggestedPath: null };
}



// ---------------------
// Scan all imports for runtime breakage (updated with findFileExporting)
// ---------------------
function scanRuntimeImportFailures(): ImportIssue[] {
  const issues: ImportIssue[] = [];

  const importRegex = /import\s+(?:([\w*\s{},]+)\s+from\s+)?['"]([^'"]+)['"]/g;
  const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;

  for (const file of allSourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, i) => {
      let match;

      // --------------------- Named & Default Imports ---------------------
      while ((match = importRegex.exec(line))) {
        const importClause = match[1]; // e.g. { A, B } or default
        const imp = match[2];          // import path

        let symbols: string[] = [];
        if (importClause) {
          const namedMatch = importClause.match(/{([^}]+)}/);
          if (namedMatch) {
            symbols = namedMatch[1].split(',').map(s => s.trim());
          } else {
            symbols = [importClause.trim()];
          }
        } else {
          symbols = ['default'];
        }

        for (const sym of symbols) {
          const { exists, suggestedPath } = resolveESM(imp, file, allSourceFiles, sym);
          if (!exists) {
            issues.push({ file, line: i + 1, importPath: imp, reason: 'ESM resolution failure', suggestedFix: suggestedPath || undefined });
          }
        }
      }

      // --------------------- Dynamic Imports ---------------------
      while ((match = dynamicImportRegex.exec(line))) {
        const imp = match[1];
        const { exists, suggestedPath } = resolveESM(imp, file, allSourceFiles, 'default');
        if (!exists) {
          issues.push({ file, line: i + 1, importPath: imp, reason: 'Dynamic ESM import failure', suggestedFix: suggestedPath || undefined });
        }
      }
    });
  }

  return issues;
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

// ---------------------
// Auto-fix Aliases (IMPROVED)
// ---------------------
function autoFixAliases(issues: ImportIssue[]): { fixed: number; failed: number } {
  let fixed = 0;
  let failed = 0;

  for (const issue of issues) {
    if (!issue.importPath.startsWith('@/') || !issue.suggestedFix) continue;

    let content = fs.readFileSync(issue.file, 'utf8');
    const original = issue.importPath;
    const suggested = issue.suggestedFix;

    if (!content.includes(original)) continue;

    // Create backup
    const backup = issue.file + '.bak.' + Date.now();
    fs.copyFileSync(issue.file, backup);

    // Replace the import
    const lines = content.split('\n');
    let updated = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`'${original}'`) || lines[i].includes(`"${original}"`)) {
        lines[i] = lines[i].replace(`'${original}'`, `'${suggested}'`)
                          .replace(`"${original}"`, `"${suggested}"`);
        updated = true;
        break;
      }
    }
    
    if (updated) {
      try {
        fs.writeFileSync(issue.file, lines.join('\n'));
        fixed++;
        console.log(`✅ Fixed: ${original} → ${suggested}`);
      } catch (error) {
        console.error(`❌ Failed to fix ${original}:`, error);
        failed++;
      }
    }
  }

  return { fixed, failed };
}

// ---------------------
// Generate Report with Better Formatting
// ---------------------
function generateDetailedReport(issues: ImportIssue[], outputPath: string = './reports/import-fixes.md') {
  const filesWithIssues = new Set(issues.map(i => i.file));
  
  // Group by file
  const issuesByFile: Record<string, ImportIssue[]> = {};
  issues.forEach(issue => {
    if (!issuesByFile[issue.file]) {
      issuesByFile[issue.file] = [];
    }
    issuesByFile[issue.file].push(issue);
  });
  
  let markdown = `# 📦 Import Fix Report\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n`;
  markdown += `**Total Issues:** ${issues.length}\n`;
  markdown += `**Files Affected:** ${filesWithIssues.size}\n\n`;
  
  markdown += `## 🔧 Recommended Fixes\n\n`;
  
  if (issues.length === 0) {
    markdown += `✅ No import fixes needed.\n`;
  } else {
    markdown += `### Summary\n`;
    markdown += `- **Total issues to fix:** ${issues.length}\n`;
    markdown += `- **Files needing attention:** ${filesWithIssues.size}\n`;
    markdown += `- **Issues with suggested fixes:** ${issues.filter(i => i.suggestedFix).length}\n\n`;
    
    markdown += `### Fixable Issues by File\n\n`;
    
    Object.entries(issuesByFile).forEach(([file, fileIssues]) => {
      const relativePath = path.relative(PROJECT_ROOT, file);
      markdown += `#### 📄 ${relativePath}\n\n`;
      
      fileIssues.forEach((issue, index) => {
        markdown += `${index + 1}. **Line ${issue.line}**: \`${issue.importPath}\`\n`;
        markdown += `   - **Reason:** ${issue.reason}\n`;
        if (issue.suggestedFix) {
          markdown += `   - **Suggested fix:** \`${issue.importPath}\` → \`${issue.suggestedFix}\`\n`;
        } else {
          markdown += `   - **⚠️ No suggestion available**\n`;
        }
        markdown += `\n`;
      });
      
      markdown += `---\n\n`;
    });
    
    // UPDATED: Commands section with your actual pnpm scripts
    markdown += `### 🚀 Available Commands\n\n`;
    markdown += `\`\`\`bash\n`;
    markdown += `# Scan and report only\n`;
    markdown += `pnpm run fix-imports:scan\n\n`;
    markdown += `# Dry run - show what would change\n`;
    markdown += `pnpm run fix-imports:dry-run\n\n`;
    markdown += `# Apply high confidence fixes only (RECOMMENDED)\n`;
    markdown += `pnpm run fix-imports:safe\n\n`;
    markdown += `# Apply all suggested fixes (use with caution)\n`;
    markdown += `pnpm run fix-imports:all\n\n`;
    markdown += `# Rollback all previous fixes\n`;
    markdown += `pnpm run fix-imports:rollback\n\n`;
    markdown += `# Interactive mode (for manual review)\n`;
    markdown += `pnpm run fix-imports:interactive\n`;
    markdown += `\`\`\`\n\n`;

    // Add workflow example
    markdown += `### 📋 Recommended Workflow\n\n`;
    markdown += `1. **Scan first:** \`pnpm run fix-imports:scan\`\n`;
    markdown += `2. **Preview changes:** \`pnpm run fix-imports:dry-run\`\n`;
    markdown += `3. **Apply safe fixes:** \`pnpm run fix-imports:safe\`\n`;
    markdown += `4. **Test:** \`pnpm run test:types\`\n`;
    markdown += `5. **Rollback if needed:** \`pnpm run fix-imports:rollback\`\n\n`;
    
    // Add manual fix instructions for specific patterns
    markdown += `### 🔍 Common Patterns to Fix Manually\n\n`;
    
    const patterns: Record<string, number> = {};
    issues.forEach(issue => {
      if (issue.suggestedFix) {
        const pattern = `${issue.importPath} → ${issue.suggestedFix}`;
        patterns[pattern] = (patterns[pattern] || 0) + 1;
      }
    });
    
    // Sort by frequency
    const sortedPatterns: [string, number][] = Object.entries(patterns)
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, 10);
    
    if (sortedPatterns.length > 0) {
      markdown += `| From | To | Count |\n`;
      markdown += `|------|----|-------|\n`;
      sortedPatterns.forEach(([pattern, count]) => {
        const [from, to] = pattern.split(' → ');
        markdown += `| \`${from}\` | \`${to}\` | ${count} |\n`;
      });
    }
  }
  
  // Ensure directory exists
  const reportDir = path.dirname(outputPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, markdown);
  console.log(`📄 Detailed report saved to: ${outputPath}`);
}


const allFileExports: Record<string, string[]> = {};
for (const file of allSourceFiles) {
  allFileExports[file] = getExportsCached(file);
}

/**
 * Find the most appropriate file that exports a given symbol.
 * Prefers files closer to the importing file and within the same module/alias root.
 */

function findFileExporting(
  symbol: string,
  allFiles: string[],
  importingFile?: string
): string | null {
  const candidates: { file: string; distance: number; matchQuality: number }[] = [];

  for (const file of allFiles) {
    const exports = exportCache.get(path.resolve(file));
    if (!exports) continue;
    
    // Check for exact symbol match
    if (exports.includes(symbol)) {
      let matchQuality = 1.0;
      
      // Penalize if file doesn't contain symbol in its filename
      const fileName = path.basename(file, path.extname(file));
      if (fileName.toLowerCase().includes(symbol.toLowerCase())) {
        matchQuality += 0.5; // Bonus for filename match
      }
      
      // Calculate directory distance
      let distance = 0;
      if (importingFile) {
        const importingDir = path.dirname(importingFile);
        const targetDir = path.dirname(file);
        
        // Penalize imports that jump across major directories
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
    if (b.matchQuality !== a.matchQuality) {
      return b.matchQuality - a.matchQuality;
    }
    return a.distance - b.distance;
  });

  const bestMatch = candidates[0].file;
  const relativeToSrc = path.relative(SRC_ROOT, bestMatch).replace(/\\/g, '/');
  
  // IMPORTANT: Don't add @/ prefix if it's already relative to src
  // The file path should already be relative to src root
  if (relativeToSrc.startsWith('app/') || relativeToSrc.startsWith('src/app/')) {
    return `@/${relativeToSrc.replace(/\.(ts|tsx|js|mjs|jsx)$/, '')}`;
  }
  
  return `@/src/${relativeToSrc.replace(/\.(ts|tsx|js|mjs|jsx)$/, '')}`;
}



  async function validateFixSuggestions(issues: ImportIssue[]): Promise<ImportIssue[]> {
  const validatedIssues: ImportIssue[] = [];
  
  for (const issue of issues) {
    if (!issue.suggestedFix) {
      validatedIssues.push(issue);
      continue;
    }
    
    // Check if the suggested fix actually exists
    const suggestedPath = issue.suggestedFix.replace(/^@\//, 'src/app/');
    const fullPath = path.join(PROJECT_ROOT, suggestedPath);
    
    const exts = ['', '.ts', '.tsx', '.js', '.mjs', '.jsx', '/index.ts', '/index.tsx'];
    const exists = exts.some(ext => fs.existsSync(fullPath + ext));
    
    if (exists) {
      validatedIssues.push(issue);
    } else {
      // Try to find a better match
      const betterFix = await findBetterFix(issue);
      validatedIssues.push({
        ...issue,
        suggestedFix: betterFix || undefined
      });
    }
  }
  
  return validatedIssues;
}

async function findBetterFix(issue: ImportIssue): Promise<string | null> {
  // Extract the target filename from import path
  const importBasename = path.basename(issue.importPath);
  
  // Search for files with similar names
  const allFiles = getAllSourceFiles(SRC_ROOT);
  const possibleMatches = allFiles.filter(file => {
    const fileName = path.basename(file, path.extname(file));
    return fileName.toLowerCase() === importBasename.toLowerCase();
  });
  
  if (possibleMatches.length > 0) {
    const relativePath = path.relative(SRC_ROOT, possibleMatches[0]).replace(/\\/g, '/');
    return `@/${relativePath.replace(/\.(ts|tsx|js|mjs|jsx)$/, '')}`;
  }
  
  return null;
}



// ---------------------
// Main (IMPROVED)
// ---------------------
async function main() {
  console.log('\n🎯 Import Fixer (Production-grade ESM)\n');
  console.log('='.repeat(60));

  const tsErrors = await runTypeScriptCheck();
  console.log(`📋 TypeScript import errors: ${tsErrors.length}`);
  
  console.log('\n🔍 Scanning for REAL ESM runtime failures...');
  const runtimeIssues = scanRuntimeImportFailures();

  console.log('\n' + '='.repeat(60));
  console.log('📊 SCAN RESULTS');
  console.log('='.repeat(60));
  
  if (runtimeIssues.length === 0) {
    console.log('✅ No ESM runtime import failures found');
  } else {
    console.log(`🚨 Found ${runtimeIssues.length} ESM runtime failures in ${new Set(runtimeIssues.map(i => i.file)).size} files\n`);
    
    // Show top issues with suggestions
    const issuesWithSuggestions = runtimeIssues.filter(i => i.suggestedFix);
    const issuesWithoutSuggestions = runtimeIssues.filter(i => !i.suggestedFix);
    
    console.log(`🔧 ${issuesWithSuggestions.length} issues with suggested fixes`);
    console.log(`⚠️  ${issuesWithoutSuggestions.length} issues need manual investigation\n`);
    
    // Show example fixes
    if (issuesWithSuggestions.length > 0) {
      console.log('📝 Example fixes:');
      issuesWithSuggestions.slice(0, 10).forEach((issue, idx) => {
        const relativeFile = path.relative(PROJECT_ROOT, issue.file);
        console.log(`${idx + 1}. ${relativeFile}:${issue.line}`);
        console.log(`   ${issue.importPath} → ${issue.suggestedFix}`);
      });
      
      if (issuesWithSuggestions.length > 10) {
        console.log(`   ... and ${issuesWithSuggestions.length - 10} more`);
      }
    }
    
    // Generate detailed report
    generateDetailedReport(runtimeIssues);
  }

  const shouldFix = process.argv.includes('--fix');

  if (shouldFix && runtimeIssues.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('🔧 AUTO-FIXING BROKEN IMPORTS');
    console.log('='.repeat(60));
    
    const { fixed, failed } = autoFixAliases(runtimeIssues);
    console.log(`\n📊 Fix Results:`);
    console.log(`✅ Fixed: ${fixed} imports`);
    console.log(`❌ Failed: ${failed} imports`);
    
    if (fixed > 0) {
      console.log(`\n💡 Tip: Run the scanner again to verify fixes`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Scan complete');
  console.log('='.repeat(60));
  
  // Save raw data for reference
  const dataDir = './reports';
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const data = {
    generated: new Date().toISOString(),
    totalIssues: runtimeIssues.length,
    issues: runtimeIssues.map(issue => ({
      file: path.relative(PROJECT_ROOT, issue.file),
      line: issue.line,
      importPath: issue.importPath,
      suggestedFix: issue.suggestedFix,
      reason: issue.reason
    })),
    summary: {
      filesWithIssues: new Set(runtimeIssues.map(i => i.file)).size,
      issuesWithSuggestions: runtimeIssues.filter(i => i.suggestedFix).length,
      issuesWithoutSuggestions: runtimeIssues.filter(i => !i.suggestedFix).length
    }
  };
  
  fs.writeFileSync(
    path.join(dataDir, 'import-issues-detailed.json'),
    JSON.stringify(data, null, 2)
  );
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});