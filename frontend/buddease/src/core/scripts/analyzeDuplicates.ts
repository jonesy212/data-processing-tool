// analyzeDuplicates.ts
scripts/analyzeDuplicates.ts
import { ImportFixerService } from '@/core/generators/corrections/ImportFixServicies';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface DuplicateReport {
  duplicates: {
    interfaces: Map<string, string[]>;
    types: Map<string, string[]>;
    classes: Map<string, string[]>;
    enums: Map<string, string[]>;
  };
  timestamp: string;
  totalFilesScanned: number;
}

class TypeScriptDuplicateAnalyzer {
  private interfaces = new Map<string, string[]>();
  private types = new Map<string, string[]>();
  private classes = new Map<string, string[]>();
  private enums = new Map<string, string[]>();

  async analyzeProject(srcDir: string = './src'): Promise<DuplicateReport> {
    console.log('🔍 Scanning for duplicate interfaces, types, classes, and enums...');
    
    const files = this.getTypeScriptFiles(srcDir);
    let totalFilesScanned = 0;

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        this.analyzeFile(content, file);
        totalFilesScanned++;
      } catch (error) {
        console.warn(`⚠️ Could not read file: ${file}`);
      }
    }

    return {
      duplicates: {
        interfaces: this.filterDuplicates(this.interfaces),
        types: this.filterDuplicates(this.types),
        classes: this.filterDuplicates(this.classes),
        enums: this.filterDuplicates(this.enums),
      },
      timestamp: new Date().toISOString(),
      totalFilesScanned
    };
  }

  private getTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item === 'node_modules' || item === 'dist') continue;
      
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getTypeScriptFiles(fullPath));
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  private analyzeFile(content: string, filePath: string): void {
    // Match interfaces
    const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
    let match;
    while ((match = interfaceRegex.exec(content)) !== null) {
      this.addToMap(this.interfaces, match[1], filePath);
    }

    // Match type aliases
    const typeRegex = /(?:export\s+)?type\s+(\w+)\s*=/g;
    while ((match = typeRegex.exec(content)) !== null) {
      this.addToMap(this.types, match[1], filePath);
    }

    // Match classes
    const classRegex = /(?:export\s+)?class\s+(\w+)/g;
    while ((match = classRegex.exec(content)) !== null) {
      this.addToMap(this.classes, match[1], filePath);
    }

    // Match enums
    const enumRegex = /(?:export\s+)?enum\s+(\w+)/g;
    while ((match = enumRegex.exec(content)) !== null) {
      this.addToMap(this.enums, match[1], filePath);
    }
  }

  private addToMap(map: Map<string, string[]>, name: string, filePath: string): void {
    if (!map.has(name)) {
      map.set(name, []);
    }
    map.get(name)!.push(filePath);
  }

  private filterDuplicates(map: Map<string, string[]>): Map<string, string[]> {
    const duplicates = new Map<string, string[]>();
    for (const [name, files] of map.entries()) {
      if (files.length > 1) {
        duplicates.set(name, files);
      }
    }
    return duplicates;
  }

  generateReport(report: DuplicateReport): string {
    const { duplicates, timestamp, totalFilesScanned } = report;
    
    let output = `# TypeScript Duplicate Analysis Report\n`;
    output += `**Generated**: ${timestamp}\n`;
    output += `**Files Scanned**: ${totalFilesScanned}\n\n`;

    if (this.hasDuplicates(duplicates)) {
      output += `## ❌ DUPLICATES FOUND\n\n`;

      // Interfaces
      if (duplicates.interfaces.size > 0) {
        output += `### Interfaces (${duplicates.interfaces.size} duplicates)\n`;
        for (const [name, files] of duplicates.interfaces.entries()) {
          output += `- **${name}**\n`;
          files.forEach(file => output += `  - ${file}\n`);
        }
        output += '\n';
      }

      // Types
      if (duplicates.types.size > 0) {
        output += `### Type Aliases (${duplicates.types.size} duplicates)\n`;
        for (const [name, files] of duplicates.types.entries()) {
          output += `- **${name}**\n`;
          files.forEach(file => output += `  - ${file}\n`);
        }
        output += '\n';
      }

      // Classes
      if (duplicates.classes.size > 0) {
        output += `### Classes (${duplicates.classes.size} duplicates)\n`;
        for (const [name, files] of duplicates.classes.entries()) {
          output += `- **${name}**\n`;
          files.forEach(file => output += `  - ${file}\n`);
        }
        output += '\n';
      }

      // Enums
      if (duplicates.enums.size > 0) {
        output += `### Enums (${duplicates.enums.size} duplicates)\n`;
        for (const [name, files] of duplicates.enums.entries()) {
          output += `- **${name}**\n`;
          files.forEach(file => output += `  - ${file}\n`);
        }
      }
    } else {
      output += `## ✅ No duplicates found! Your codebase is clean.\n`;
    }

    return output;
  }

  private hasDuplicates(duplicates: DuplicateReport['duplicates']): boolean {
    return duplicates.interfaces.size > 0 || 
           duplicates.types.size > 0 || 
           duplicates.classes.size > 0 || 
           duplicates.enums.size > 0;
  }
}

// Run the analysis
=== MAIN FUNCTION - Enhanced Version ===
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const interactive = args.includes('--interactive');
  const fixOnly = args.includes('--fix-only');
  const minConfidence = args.includes('--high') ? 'high' : 
                       args.includes('--medium') ? 'medium' : 'low';

  console.log('🎯 Import Fixer - Fixing ACTUAL TypeScript Errors\n');
  
  const confirmationType = interactive ? 'interactive' : 'console';
  const fixer = new ImportFixerService(confirmationType);

  try {
    // OPTION 1: Fix ONLY real TypeScript errors (fast and focused)
    if (fixOnly) {
      console.log('🔧 Mode: Fixing only real TypeScript import errors');
      const result = await fixer.fixRealTypeScriptErrors();
      console.log(`\n📊 Result: Fixed ${result.fixed} real import errors`);
      
      if (result.fixed === 0) {
        console.log('✅ No real TypeScript import errors found!');
      }
      return;
    }

    // OPTION 2: Full analysis (traditional)
    console.log('🔍 Running comprehensive import analysis...');
    
    // First, get ACTUAL TypeScript errors
    console.log('📋 Checking TypeScript compilation...');
    const tsErrorsByFile = await fixer['getAllTypeScriptErrors'](); // Access private method
    
    const filesWithRealErrors = Array.from(tsErrorsByFile.keys());
    console.log(`📊 Found ${filesWithRealErrors.length} files with TypeScript compilation errors`);

    // Scan project (now enhanced to prioritize TypeScript errors)
    const { analyses, fixesByConfidence } = await fixer.scanProjectWithConfidence();

    const totalFixes = fixesByConfidence.high.length + 
                      fixesByConfidence.medium.length + 
                      fixesByConfidence.low.length;

    // Display comprehensive results
    console.log('\n📊 Import Issues Summary:');
    console.log(`   TypeScript compilation errors: ${filesWithRealErrors.length}`);
    console.log(`   High confidence fixes: ${fixesByConfidence.high.length}`);
    console.log(`   Medium confidence fixes: ${fixesByConfidence.medium.length}`);
    console.log(`   Low confidence fixes: ${fixesByConfidence.low.length}`);
    console.log(`   Total files analyzed: ${analyses.length}`);

    // Show real TypeScript errors that might need manual fixing
    if (filesWithRealErrors.length > 0 && totalFixes === 0) {
      console.log('\n⚠️  IMPORTANT: TypeScript found import errors but scanner couldn\'t detect them.');
      console.log('   Files with unresolved errors:');
      filesWithRealErrors.slice(0, 5).forEach((file, index) => {
        const relativePath = path.relative(process.cwd(), file);
        const errors = tsErrorsByFile.get(file) || [];
        const missingModules = fixer['extractMissingModulesFromTSErrors'](errors);
        console.log(`   ${index + 1}. ${relativePath}`);
        if (missingModules.length > 0) {
          console.log(`      Missing: ${missingModules.join(', ')}`);
        }
      });
      if (filesWithRealErrors.length > 5) {
        console.log(`      ... and ${filesWithRealErrors.length - 5} more files`);
      }
    }

    if (totalFixes === 0 && filesWithRealErrors.length === 0) {
      console.log('✅ No import issues found!');
      return;
    }

    // Show sample of issues
    if (fixesByConfidence.high.length > 0) {
      console.log('\n🔧 High Confidence Fixes (sample):');
      fixesByConfidence.high.slice(0, 3).forEach((fix, index) => {
        console.log(`\n${index + 1}. 📁 ${path.relative(process.cwd(), fix.filePath)}`);
        console.log(`   💡 ${fix.reason || 'Auto-detected import issue'}`);
        console.log(`   ❌ ${fix.originalLine || 'MISSING IMPORT'}`);
        console.log(`   ✅ ${fix.newLine}`);
      });
    }

    if (dryRun) {
      console.log('\n🔍 DRY RUN: No changes were applied');
      console.log('💡 Remove --dry-run flag to apply fixes');
      return;
    }

    // Apply fixes based on confidence level
    if (fixesByConfidence.high.length > 0) {
      console.log('\n🚀 Applying high confidence fixes...');
      const result = await fixer.applyFixesWithConfidence(fixesByConfidence.high, 'high');
      if (result.success) {
        console.log(`✅ Applied ${result.applied} high confidence fixes`);
      }
    }

    // Handle medium confidence fixes
    if (fixesByConfidence.medium.length > 0) {
      if (interactive) {
        console.log('\n🔍 Medium confidence fixes require review:');
        const result = await fixer.applyFixesWithConfidence(fixesByConfidence.medium, 'medium');
        if (result.success) {
          console.log(`✅ Applied ${result.applied} medium confidence fixes`);
        }
      } else {
        console.log(`\n📋 ${fixesByConfidence.medium.length} medium confidence fixes available`);
        console.log('💡 Run with --interactive to review and apply medium confidence fixes');
      }
    }

    // After fixing, show remaining TypeScript errors
    if (!dryRun && filesWithRealErrors.length > 0) {
      console.log('\n🔍 Checking if TypeScript errors were resolved...');
      const remainingErrors = await fixer['getAllTypeScriptErrors']();
      const remainingFiles = Array.from(remainingErrors.keys()).length;
      
      if (remainingFiles < filesWithRealErrors.length) {
        console.log(`✅ Reduced TypeScript errors from ${filesWithRealErrors.length} to ${remainingFiles} files`);
      }
      
      if (remainingFiles > 0) {
        console.log(`\n⚠️  ${remainingFiles} files still have TypeScript errors`);
        console.log('💡 Some errors may require manual fixing or missing files');
      }
    }

  } catch (error) {
    console.error('❌ Error during import analysis:', error);
    process.exit(1);
  }
}


// Check if this is the main module in a cross-platform way
function isMainModule(importMetaUrl: string): boolean {
  if (typeof require !== 'undefined' && require.main === module) {
    return true; // CommonJS
  }
  
  try {
    const __filename = fileURLToPath(importMetaUrl);
    const __dirname = path.dirname(__filename);
    return process.argv[1] === __filename;
  } catch {
    return false;
  }
}

// Then use:
if (isMainModule(import.meta.url)) {
  main().catch(console.error);
}

export { main, TypeScriptDuplicateAnalyzer };

