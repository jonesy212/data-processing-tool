#!/usr/bin/env tsx
// cli.ts


import { APP_SPECIFIC_RULES, applyAppSpecificRules } from '@/core/error-analyzer/rules/app-specific-rules';
import { TypeScriptErrorFixSystem } from '@/core/error-analyzer/TypeScriptErrorFixSystem';
import { ImportFixerService, type ImportFix } from '@/core/generators/corrections/ImportFixServicies';
import path from 'path';

async function main() {
  const system = new TypeScriptErrorFixSystem();
  const fixer = new ImportFixerService();
  
  // Parse CLI arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
TypeScript Error Fix System CLI
Usage:
  tsx cli.ts [command] [options]

Commands:
  analyze <file.json>      Analyze TypeScript errors from JSON file
  fix-imports [path]       Fix import errors in project
  apply-rules [path]       Apply app-specific import/export rules
  summary                  Show current progress summary
  report                   Generate full progress report
  reset                    Reset progress tracking
  history                  Show fix history
  trends                   Show progress trends
  list-rules               List all app-specific rules

Options:
  --help                   Show this help message
  --output <dir>          Output directory for reports
  --format <format>       Output format (json, markdown)
  --dry-run               Show what would be changed without applying
  --debug                 Show debug information
  --verbose               Show detailed information
  --no-rules              Disable app-specific rules (for fix-imports)
    `);
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'analyze':
      if (args[1]) {
        await system.analyzeFromFile(args[1]);
      } else {
        console.error('Error: Please provide a JSON file path');
      }
      break;
      
    case 'fix-imports':
      await handleFixImports(args.slice(1), fixer);
      break;
      
    case 'apply-rules':
      await handleApplyRules(args.slice(1), fixer);
      break;
      
    case 'list-rules':
      listAppSpecificRules();
      break;
      
    case 'summary':
      console.log(system.getProgressReport());
      break;
      
    case 'report':
      const report = system.getProgressReport();
      console.log(report);
      break;
      
    case 'reset':
      console.log('Reset functionality would go here');
      break;
      
    case 'history':
      console.log('History functionality would go here');
      break;
      
    case 'trends':
      console.log('Trends functionality would go here');
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
  }
}


async function applyFixesWithOptions(
    fixer: ImportFixerService,
    fixes: ImportFix[],  // ✅ Use ImportFix type instead of any[]
    options: { minConfidence?: 'high' | 'medium' | 'low'; applyRules?: boolean }
): Promise<{ success: boolean; applied: number }> {
    const minConfidence = options.minConfidence || 'medium';
    const applyRules = options.applyRules ?? true;
    
    // Filter by confidence with proper typing
    const confidenceLevels = { high: 3, medium: 2, low: 1 } as const;
    const minLevel = confidenceLevels[minConfidence];
    
    const filteredFixes = fixes.filter((fix: ImportFix) => {
        const fixConfidence = fix.confidence || 'medium';
        
        // Type-safe access
        let fixLevel: number;
        switch (fixConfidence) {
            case 'high':
                fixLevel = confidenceLevels.high;
                break;
            case 'medium':
                fixLevel = confidenceLevels.medium;
                break;
            case 'low':
                fixLevel = confidenceLevels.low;
                break;
            default:
                // Default to medium if invalid (shouldn't happen with proper typing)
                fixLevel = confidenceLevels.medium;
        }
        
        return fixLevel >= minLevel;
    });
    
    if (filteredFixes.length === 0) {
        console.log(`⚠️ No fixes meet the minimum confidence level: ${minConfidence}`);
        return { success: false, applied: 0 };
    }
    
    // Group fixes with proper typing
    const fileGroups = new Map<string, ImportFix[]>();
    filteredFixes.forEach((fix: ImportFix) => {
        if (!fileGroups.has(fix.filePath)) {
            fileGroups.set(fix.filePath, []);
        }
        fileGroups.get(fix.filePath)!.push(fix);
    });
    
    // Create changes for confirmation
    const changes = Array.from(fileGroups.entries()).map(([file, fileFixes]) => ({
        file,
        changes: fileFixes.map((fix: ImportFix) =>
            fix.originalLine
                ? `Update import for ${fix.missingTypes.join(', ')}`
                : `Add import for ${fix.missingTypes.join(', ')}`
        )
    }));
    
    // Get confirmation
    const confirmationService = fixer.getConfirmationService();
    const confirmed = await confirmationService.confirmMultiple(changes);
    
    if (!confirmed) {
        console.log('❌ Import fixes cancelled by user');
        return { success: false, applied: 0 };
    }
    
    // Apply fixes
    let totalApplied = 0;
    for (const [filePath, fileFixes] of fileGroups) {
        try {
            const result = await fixer.applyFixes(fileFixes, {
                backup: true,
                applyRules: applyRules
            });
            
            if (result.success) {
                console.log(`✅ Applied ${fileFixes.length} fixes to ${path.basename(filePath)}`);
                totalApplied += fileFixes.length;
            }
        } catch (error) {
            console.error(`❌ Failed to apply fixes to ${filePath}:`, error);
        }
    }
    
    return { success: true, applied: totalApplied };
}

async function handleFixImports(args: string[], fixer: ImportFixerService) {
  const rootDir = args.find(arg => !arg.startsWith('--')) || process.cwd();
  const options = parseOptions(args);
  
  console.log(`🔍 Scanning for import issues in: ${rootDir}\n`);
  
  // Scan for import issues
  const analyses = await fixer.scanProject(rootDir);
  let allFixes = analyses.flatMap(analysis => analysis.suggestedFixes);
  
  if (allFixes.length === 0) {
    console.log('✅ No import issues found!');
    return;
  }
  
  console.log(`📋 Found ${allFixes.length} import fixes across ${analyses.length} files`);
  
  // 🆕 FILTER BY CONFIDENCE if specified
  if (options.minConfidence) {
    const confidenceLevels = { high: 3, medium: 2, low: 1 };
    const minLevel = confidenceLevels[options.minConfidence];
    
    allFixes = allFixes.filter(fix => {
      const fixLevel = confidenceLevels[fix.confidence || 'medium'];
      return fixLevel >= minLevel;
    });
    
    console.log(`📊 After filtering (${options.minConfidence}+): ${allFixes.length} fixes remain`);
  }
  
  // Group by confidence for display
  const highConfidence = allFixes.filter(f => f.confidence === 'high');
  const mediumConfidence = allFixes.filter(f => f.confidence === 'medium');
  const lowConfidence = allFixes.filter(f => f.confidence === 'low');
  
  console.log(`   High confidence: ${highConfidence.length}`);
  console.log(`   Medium confidence: ${mediumConfidence.length}`);
  console.log(`   Low confidence: ${lowConfidence.length}`);
  
  if (options.dryRun) {
    console.log('\n🔍 DRY RUN - Showing what would be changed:');
    showDryRunChanges(allFixes);
    return;
  }
  
  // 🆕 CREATE A MODIFIED FIXER THAT APPLIES RULES
  if (!options.noRules) {
    console.log('\n📐 Note: App-specific rules will be applied automatically');
  }
  
  // Apply fixes with confirmation (single parameter)
  const result = await fixer.applyFixesWithOptions(allFixes, {
      minConfidence: options.minConfidence,
      applyRules: !options.noRules
  });  

  if (result.success) {
    console.log(`\n✅ Successfully applied ${result.applied} import fixes`);
    
    // 🆕 MANUALLY APPLY RULES IF NEEDED
    if (!options.noRules && result.applied > 0) {
      console.log('\n📐 Applying app-specific rules...');
      
      // You'll need to implement or call a method to apply rules
      // For now, we'll show a message
      console.log('   (App-specific rules would be applied here)');
    }
  } else {
    console.log('\n❌ Fix application cancelled or failed');
  }
}

async function handleApplyRules(args: string[], fixer: ImportFixerService) {
  const rootDir = args.find(arg => !arg.startsWith('--')) || process.cwd();
  const options = parseOptions(args);
  
  console.log(`📐 Applying app-specific rules to: ${rootDir}\n`);
  
  if (options.dryRun) {
    console.log('🔍 DRY RUN - Showing what rules would be applied:\n');
    
    // Show which rules would apply
    const tsFiles = fixer['getAllTypeScriptFiles'](rootDir);
    let totalFiles = 0;
    let filesWithRules = 0;
    
    for (const file of tsFiles.slice(0, 10)) { // Limit to first 10 for preview
      totalFiles++;
      const content = await import('fs').then(fs => 
        fs.promises.readFile(file, 'utf8')
      );
      const corrected = applyAppSpecificRules(content);
      
      if (content !== corrected) {
        filesWithRules++;
        console.log(`📄 ${file}:`);
        
        // Show what would change
        const originalLines = content.split('\n');
        const correctedLines = corrected.split('\n');
        
        for (let i = 0; i < Math.min(originalLines.length, correctedLines.length); i++) {
          if (originalLines[i] !== correctedLines[i]) {
            console.log(`   Line ${i + 1}: ${originalLines[i]} → ${correctedLines[i]}`);
          }
        }
        console.log('');
      }
    }
    
    console.log(`📊 Summary: ${filesWithRules}/${totalFiles} files would be modified`);
    return;
  }
  
  // Actually apply the rules
  console.log('🔄 Applying app-specific rules...\n');
  
  const result = await fixer['applyAppSpecificRulesToProject'](rootDir);
  
  console.log(`\n📊 Results:`);
  console.log(`   Success: ${result.success}`);
  console.log(`   Files updated: ${result.filesUpdated}`);

  if (result.filesUpdated === 0) {
    console.log('\n✅ All files already follow app-specific rules!');
  } else {
    console.log(`\n✅ Successfully updated ${result.filesUpdated} files`);
  }
}

function listAppSpecificRules() {
  console.log('📋 App-specific import/export rules:\n');
  
  Object.entries(APP_SPECIFIC_RULES).forEach(([name, rule], index) => {
    console.log(`${index + 1}. 🔹 ${name}:`);
    console.log(`   📝 ${rule.message}`);
    
    // Show pattern in a readable way
    const patternStr = rule.pattern.toString();
    console.log(`   🔍 Pattern: ${patternStr.substring(1, patternStr.length - 1)}`);
    
    // Show fix
    if (rule.fix.includes('\n')) {
      console.log(`   🔧 Fix:`);
      rule.fix.split('\n').forEach(line => console.log(`      ${line}`));
    } else {
      console.log(`   🔧 Fix: ${rule.fix}`);
    }
    
    console.log('');
  });
}

function parseOptions(args: string[]): {
  dryRun: boolean;
  debug: boolean;
  verbose: boolean;
  noRules: boolean;
  minConfidence?: 'high' | 'medium' | 'low';
  format?: string;
} {
  return {
    dryRun: args.includes('--dry-run'),
    debug: args.includes('--debug'),
    verbose: args.includes('--verbose'),
    noRules: args.includes('--no-rules'),
    minConfidence: args.includes('--high') ? 'high' : 
                   args.includes('--medium') ? 'medium' :
                   args.includes('--low') ? 'low' : undefined,
    format: getArgValue(args, '--format')
  };
}

function getArgValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index !== -1 && index + 1 < args.length ? args[index + 1] : undefined;
}

function showDryRunChanges(fixes: any[]) {
  const files = new Map<string, any[]>();
  
  // Group by file
  fixes.forEach(fix => {
    if (!files.has(fix.filePath)) {
      files.set(fix.filePath, []);
    }
    files.get(fix.filePath)!.push(fix);
  });
  
  // Show changes per file
  files.forEach((fileFixes, filePath) => {
    console.log(`\n📁 ${filePath}:`);
    fileFixes.forEach((fix, index) => {
      console.log(`   ${index + 1}. ${fix.reason || 'Import fix'}`);
      if (fix.originalLine) {
        console.log(`      Before: ${fix.originalLine}`);
      }
      console.log(`      After:  ${fix.newLine}`);
    });
  });
  
  console.log(`\n📊 Total: ${fixes.length} fixes would be applied across ${files.size} files`);
}

if (require.main === module) {
  main().catch(console.error);
}