// scripts/deduplicate-imports.ts
import { ImportAnalysis } from '@/core/generators/corrections/reports/ImportReport';
import fs from 'fs';
import path from 'path';

export interface ImportStatement {
  line: number;
  content: string;
  symbols: string[];
  source: string;
  isDefault: boolean;
}

export interface DeduplicationResult {
  removed: number;
  merged: number;
  backupPath?: string;
}

export interface DeduplicationAnalysis {
  imports: ImportStatement[];
  duplicateGroups: number[][];
  hasDuplicates: boolean;
  duplicateSources: string[];
  duplicateCount: number;
}

export class ImportDeduplicator {
  /**
   * Analyze imports in a file for duplicates (compatible with your ImportAnalysis)
   */
  static analyzeImportsInFile(filePath: string): DeduplicationAnalysis {
    const imports = this.extractImportsFromContent(filePath);
    const duplicateGroups = this.findDuplicateImports(imports);
    const duplicateSources = duplicateGroups
      .map(group => imports[group[0]]?.source)
      .filter(source => source !== undefined);
    
    return {
      imports,
      duplicateGroups,
      hasDuplicates: duplicateGroups.length > 0,
      duplicateSources,
      duplicateCount: duplicateGroups.reduce((sum, group) => sum + (group.length - 1), 0)
    };
  }

  /**
   * Convert deduplication analysis to your ImportAnalysis format
   */
  static toImportAnalysis(filePath: string, analysis: DeduplicationAnalysis): Partial<ImportAnalysis> {
    const duplicateImports = analysis.duplicateGroups.map(group => {
      const sources = group.map(idx => analysis.imports[idx].source);
      return `Duplicates from ${analysis.imports[group[0]].source}: ${group.length} imports`;
    });
    
    const issues = analysis.hasDuplicates 
      ? [`Found ${analysis.duplicateCount} duplicate imports from ${analysis.duplicateSources.length} sources`]
      : [];
    
    return {
      duplicateImports,
      issues,
      // You can map other properties as needed
      // For example:
      imports: analysis.imports.map(imp => ({
        // Map to your ParsedImport interface
        line: imp.line,
        source: imp.source,
        symbols: imp.symbols,
        type: imp.isDefault ? 'default' : 'named',
        isExternal: !imp.source.startsWith('.') && !imp.source.startsWith('@/'),
        isValid: true
      }))
    };
  }

  /**
   * Deduplicate imports in a file
   */
  static deduplicateFile(filePath: string): DeduplicationResult {
    const { imports, duplicateGroups } = this.analyzeImportsInFile(filePath);
    
    if (duplicateGroups.length === 0) {
      return { removed: 0, merged: 0 };
    }
    
    // Create backup
    const backupPath = `${filePath}.dedup-backup.${Date.now()}.bak`;
    fs.copyFileSync(filePath, backupPath);
    
    // Process duplicates
    const result = this.processDuplicates(filePath, imports, duplicateGroups);
    
    return {
      ...result,
      backupPath
    };
  }

  /**
   * Process all TypeScript files in a directory
   */
  static deduplicateProject(rootDir: string): {
    totalRemoved: number;
    totalFiles: number;
    totalMerged: number;
    details: Array<{
      file: string;
      removed: number;
      merged: number;
      duplicateSources: string[];
    }>;
  } {
    const tsFiles = this.findAllTypeScriptFiles(rootDir);
    let totalRemoved = 0;
    let totalFiles = 0;
    let totalMerged = 0;
    const details: Array<{ file: string; removed: number; merged: number; duplicateSources: string[] }> = [];

    tsFiles.forEach(file => {
      try {
        const result = this.deduplicateFile(file);
        if (result.removed > 0) {
          totalRemoved += result.removed;
          totalMerged += result.merged;
          totalFiles++;
          
          const analysis = this.analyzeImportsInFile(file);
          details.push({
            file: path.relative(rootDir, file),
            removed: result.removed,
            merged: result.merged,
            duplicateSources: analysis.duplicateSources
          });
        }
      } catch (error) {
        console.warn(`⚠️ Failed to process ${file}:`, error);
      }
    });

    return {
      totalRemoved,
      totalFiles,
      totalMerged,
      details
    };
  }

  /**
   * Extract imports from file content
   */
  private static extractImportsFromContent(filePath: string): ImportStatement[] {
    const imports: ImportStatement[] = [];
    
    if (!fs.existsSync(filePath)) {
      return imports;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (this.isImportStatement(trimmedLine)) {
        const symbols = this.extractImportSymbols(trimmedLine);
        const source = this.extractImportSource(trimmedLine);
        
        imports.push({
          line: index + 1,
          content: trimmedLine,
          symbols,
          source,
          isDefault: this.isDefaultImport(trimmedLine)
        });
      }
    });
    
    return imports;
  }

  /**
   * Check if a line is an import statement
   */
  private static isImportStatement(line: string): boolean {
    return line.startsWith('import ') && line.includes('from');
  }

  /**
   * Check if an import is a default import
   */
  private static isDefaultImport(line: string): boolean {
    return line.includes('import ') && 
           !line.includes('{') && 
           !line.includes('*') &&
           !line.includes('import type');
  }

  /**
   * Extract symbols from import statement
   */
  static extractImportSymbols(importLine: string): string[] {
    const symbols: string[] = [];
    
    // Handle default import: import X from 'module'
    const defaultMatch = importLine.match(/import\s+([^{*\s]+)\s+from/);
    if (defaultMatch) {
      const symbol = defaultMatch[1].trim();
      if (symbol && symbol !== 'type') {
        symbols.push(symbol);
      }
      return symbols;
    }
    
    // Handle named imports: import { a, b } from 'module'
    const namedMatch = importLine.match(/import\s+{([^}]+)}\s+from/);
    if (namedMatch) {
      return namedMatch[1]
        .split(',')
        .map(s => {
          // Handle aliases: "a as b" -> extract "a"
          const parts = s.trim().split(/\s+as\s+/);
          return parts[0].trim();
        })
        .filter(s => s.length > 0);
    }
    
    // Handle namespace import: import * as X from 'module'
    const namespaceMatch = importLine.match(/import\s+\*\s+as\s+(\w+)\s+from/);
    if (namespaceMatch) {
      symbols.push(namespaceMatch[1].trim());
    }
    
    return symbols;
  }

  /**
   * Extract source from import statement
   */
  static extractImportSource(importLine: string): string {
    const match = importLine.match(/from\s+['"]([^'"]+)['"]/);
    return match ? match[1] : '';
  }

  /**
   * Find duplicate imports (imports from the same source)
   */
  private static findDuplicateImports(imports: ImportStatement[]): number[][] {
    const groups = new Map<string, number[]>();
    
    imports.forEach((imp, index) => {
      if (!groups.has(imp.source)) {
        groups.set(imp.source, []);
      }
      groups.get(imp.source)!.push(index);
    });
    
    // Return groups with more than one import from the same source
    const duplicates: number[][] = [];
    groups.forEach((indices, source) => {
      if (indices.length > 1) {
        duplicates.push(indices);
      }
    });
    
    return duplicates;
  }

  /**
   * Process duplicate imports and write modified content
   */
  private static processDuplicates(
    filePath: string,
    imports: ImportStatement[],
    duplicateGroups: number[][]
  ): { removed: number; merged: number } {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    const linesToKeep = new Set<number>();
    const linesToRemove = new Set<number>();
    
    // Mark which lines to keep and which to remove
    duplicateGroups.forEach(group => {
      if (group.length > 1) {
        linesToKeep.add(imports[group[0]].line - 1);
        for (let i = 1; i < group.length; i++) {
          linesToRemove.add(imports[group[i]].line - 1);
        }
      }
    });
    
    // Merge imports
    const mergedImports = this.mergeImports(imports.filter((_, idx) => 
      !linesToRemove.has(imports[idx].line - 1)
    ));
    
    // Generate new content
    const newLines: string[] = [];
    
    lines.forEach((line, index) => {
      if (linesToRemove.has(index)) {
        return; // Skip removed lines
      }
      
      if (linesToKeep.has(index)) {
        // Replace with merged import
        const imp = imports.find(i => i.line - 1 === index);
        if (imp) {
          const mergedImp = mergedImports.find(m => m.source === imp.source);
          if (mergedImp) {
            newLines.push(this.generateImportStatement(mergedImp));
            return;
          }
        }
      }
      
      newLines.push(line);
    });
    
    // Write back to file
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf-8');
    
    return {
      removed: linesToRemove.size,
      merged: mergedImports.length
    };
  }

  /**
   * Merge imports from the same source
   */
  private static mergeImports(imports: ImportStatement[]): ImportStatement[] {
    const merged: ImportStatement[] = [];
    const sourceMap = new Map<string, ImportStatement>();
    
    for (const imp of imports) {
      if (!sourceMap.has(imp.source)) {
        sourceMap.set(imp.source, { ...imp, symbols: [...imp.symbols] });
      } else {
        const existing = sourceMap.get(imp.source)!;
        
        // Merge symbols, avoiding duplicates
        for (const symbol of imp.symbols) {
          if (!existing.symbols.includes(symbol)) {
            existing.symbols.push(symbol);
          }
        }
        
        // Keep the earliest line number
        existing.line = Math.min(existing.line, imp.line);
      }
    }
    
    // Convert map back to array and sort by line number
    sourceMap.forEach(imp => merged.push(imp));
    merged.sort((a, b) => a.line - b.line);
    
    return merged;
  }

  /**
   * Generate import statement from ImportStatement object
   */
  private static generateImportStatement(imp: ImportStatement): string {
    if (imp.isDefault && imp.symbols.length === 1) {
      return `import ${imp.symbols[0]} from '${imp.source}';`;
    } else if (imp.symbols.length > 0) {
      return `import { ${imp.symbols.join(', ')} } from '${imp.source}';`;
    } else {
      return `import '${imp.source}';`;
    }
  }

  /**
   * Find all TypeScript files in a directory
   */
  private static findAllTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];
    
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        if (!item.name.includes('node_modules') && 
            !item.name.startsWith('.') && 
            !item.name.includes('dist')) {
          files.push(...this.findAllTypeScriptFiles(fullPath));
        }
      } else if (this.isTypeScriptFile(item.name)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Check if a file is a TypeScript file
   */
  private static isTypeScriptFile(filename: string): boolean {
    return filename.endsWith('.ts') || 
           filename.endsWith('.tsx') || 
           filename.endsWith('.js') || 
           filename.endsWith('.jsx');
  }

  /**
   * Format import analysis for console output
   */
  static formatAnalysis(analysis: DeduplicationAnalysis, filePath: string, relativeTo?: string): string {
    const relativePath = relativeTo ? path.relative(relativeTo, filePath) : filePath;
    let output = `\n📄 ${relativePath}:\n`;
    output += `   Total imports: ${analysis.imports.length}\n`;
    output += `   Duplicate groups: ${analysis.duplicateGroups.length}\n`;
    output += `   Total duplicates: ${analysis.duplicateCount}\n`;
    
    if (analysis.duplicateGroups.length > 0) {
      analysis.duplicateGroups.forEach((group, idx) => {
        const source = analysis.imports[group[0]].source;
        output += `   Duplicates from "${source}": ${group.length} imports\n`;
        group.forEach(impIndex => {
          const imp = analysis.imports[impIndex];
          output += `     Line ${imp.line}: ${imp.content}\n`;
        });
      });
    } else {
      output += `   ✅ No duplicates found\n`;
    }
    
    return output;
  }
  
  /**
   * Get statistics for a project
   */
  static getProjectStats(rootDir: string): {
    totalFiles: number;
    totalImports: number;
    filesWithDuplicates: number;
    totalDuplicates: number;
    duplicateSources: string[];
  } {
    const tsFiles = this.findAllTypeScriptFiles(rootDir);
    let totalImports = 0;
    let filesWithDuplicates = 0;
    let totalDuplicates = 0;
    const duplicateSourcesSet = new Set<string>();
    
    tsFiles.forEach(file => {
      const analysis = this.analyzeImportsInFile(file);
      totalImports += analysis.imports.length;
      
      if (analysis.hasDuplicates) {
        filesWithDuplicates++;
        totalDuplicates += analysis.duplicateCount;
        analysis.duplicateSources.forEach(source => duplicateSourcesSet.add(source));
      }
    });
    
    return {
      totalFiles: tsFiles.length,
      totalImports,
      filesWithDuplicates,
      totalDuplicates,
      duplicateSources: Array.from(duplicateSourcesSet)
    };
  }
}

/**
 * CLI interface
 */
function runDeduplicationCLI(args: string[]): void {
  if (args.length === 0) {
    console.log(`
Import Deduplicator
===================

Usage:
  tsx scripts/deduplicate-imports.ts <command> [options]

Commands:
  analyze [file]          - Analyze file or project for duplicate imports
  deduplicate            - Remove duplicate imports from project
  stats                  - Show project statistics
  help                   - Show this help message

Options:
  --limit=<number>       - Limit analysis to N files (default: 10 for analyze)
  --output=<path>        - Output report to specific path

Examples:
  tsx scripts/deduplicate-imports.ts analyze src/app/api/ApiHighlightEvent.tsx
  tsx scripts/deduplicate-imports.ts deduplicate
  tsx scripts/deduplicate-imports.ts stats
    `);
    return;
  }
  
  const command = args[0];
  
  try {
    if (command === 'analyze') {
      const fileArg = args.find(arg => !arg.startsWith('--'));
      const limitArg = args.find(arg => arg.startsWith('--limit='));
      const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10;
      
      if (fileArg && fileArg !== 'analyze') {
        const analysis = ImportDeduplicator.analyzeImportsInFile(fileArg);
        console.log(ImportDeduplicator.formatAnalysis(analysis, fileArg, process.cwd()));
      } else {
        const tsFiles = ImportDeduplicator.findAllTypeScriptFiles(process.cwd()).slice(0, limit);
        console.log(`🔍 Analyzing ${tsFiles.length} files for duplicate imports...\n`);
        
        tsFiles.forEach(file => {
          const analysis = ImportDeduplicator.analyzeImportsInFile(file);
          if (analysis.hasDuplicates) {
            console.log(ImportDeduplicator.formatAnalysis(analysis, file, process.cwd()));
          }
        });
      }
      
    } else if (command === 'deduplicate') {
      console.log('🔍 Scanning project for duplicate imports...\n');
      const result = ImportDeduplicator.deduplicateProject(process.cwd());
      
      console.log('\n' + '='.repeat(60));
      console.log('📊 DEDUPLICATION SUMMARY');
      console.log('='.repeat(60));
      console.log(`📁 Files scanned: ${result.details.length}`);
      console.log(`🔄 Files with duplicates: ${result.totalFiles}`);
      console.log(`🗑️  Total duplicates removed: ${result.totalRemoved}`);
      console.log(`🧩 Total imports after merging: ${result.totalMerged}`);
      console.log('='.repeat(60));
      
      if (result.totalFiles > 0) {
        console.log('\n📋 Files with duplicates removed:');
        result.details.forEach(detail => {
          console.log(`  • ${detail.file}: ${detail.removed} duplicates removed`);
          if (detail.duplicateSources.length > 0) {
            console.log(`    Sources: ${detail.duplicateSources.join(', ')}`);
          }
        });
      }
      
      // Save detailed report
      const reportDir = './reports';
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          filesScanned: result.details.length,
          filesWithDuplicates: result.totalFiles,
          duplicatesRemoved: result.totalRemoved,
          importsAfterMerging: result.totalMerged
        },
        details: result.details
      };
      
      const outputPath = path.join(reportDir, 'deduplication-report.json');
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
      
      console.log(`\n📄 Report saved to: ${outputPath}`);
      
    } else if (command === 'stats') {
      console.log('📊 Gathering project import statistics...\n');
      const stats = ImportDeduplicator.getProjectStats(process.cwd());
      
      console.log('\n' + '='.repeat(60));
      console.log('📈 IMPORT STATISTICS');
      console.log('='.repeat(60));
      console.log(`📁 Total TypeScript files: ${stats.totalFiles}`);
      console.log(`📦 Total imports found: ${stats.totalImports}`);
      console.log(`🔄 Files with duplicates: ${stats.filesWithDuplicates} (${((stats.filesWithDuplicates / stats.totalFiles) * 100).toFixed(1)}%)`);
      console.log(`🗑️  Total duplicate imports: ${stats.totalDuplicates}`);
      console.log(`📊 Average imports per file: ${(stats.totalImports / stats.totalFiles).toFixed(1)}`);
      
      if (stats.duplicateSources.length > 0) {
        console.log(`\n🔗 Most common duplicate sources:`);
        // Show top 10 duplicate sources
        stats.duplicateSources.slice(0, 10).forEach(source => {
          console.log(`  • ${source}`);
        });
        if (stats.duplicateSources.length > 10) {
          console.log(`  ... and ${stats.duplicateSources.length - 10} more`);
        }
      }
      
    } else if (command === 'help') {
      runDeduplicationCLI([]);
    } else {
      console.error(`❌ Unknown command: ${command}`);
      console.log('Run with no arguments or "help" to see usage.');
    }
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
    console.error(error.stack);
  }
}


async function analyzeImportsForDuplicates(): Promise<void> {
  console.log('\n🔍 Import Duplicate Analysis\n');
  console.log('='.repeat(60));
  
  // Check if specific file is provided
  const args = process.argv.slice(2);
  const fileArgIndex = args.findIndex(arg => !arg.startsWith('--'));
  const fileArg = fileArgIndex > -1 ? args[fileArgIndex] : null;
  
  if (fileArg && fs.existsSync(fileArg)) {
    // Analyze specific file
    const analysis = ImportDeduplicator.analyzeImportsInFile(fileArg);
    console.log(ImportDeduplicator.formatAnalysis(analysis, fileArg, PROJECT_ROOT));
  } else {
    // Analyze top files in project
    const tsFiles = ImportDeduplicator.findAllTypeScriptFiles(SRC_ROOT).slice(0, 15);
    console.log(`Analyzing ${tsFiles.length} files for duplicate imports...\n`);
    
    let filesWithDuplicates = 0;
    
    tsFiles.forEach(file => {
      const analysis = ImportDeduplicator.analyzeImportsInFile(file);
      if (analysis.hasDuplicates) {
        filesWithDuplicates++;
        console.log(ImportDeduplicator.formatAnalysis(analysis, file, PROJECT_ROOT));
      }
    });
    
    if (filesWithDuplicates === 0) {
      console.log('✅ No duplicate imports found in the analyzed files!');
    }
    
    // Show project stats
    const stats = ImportDeduplicator.getProjectStats(PROJECT_ROOT);
    console.log('\n📊 Project-wide statistics:');
    console.log(`   Total files: ${stats.totalFiles}`);
    console.log(`   Files with duplicates: ${stats.filesWithDuplicates}`);
    console.log(`   Total duplicates: ${stats.totalDuplicates}`);
  }
}

// Export the class for use in other files (like fix-imports.ts)
export default ImportDeduplicator;

// For standalone script execution
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runDeduplicationCLI(process.argv.slice(2));
}
export { runDeduplicationCLI };
