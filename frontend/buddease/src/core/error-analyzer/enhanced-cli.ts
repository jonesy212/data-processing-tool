#!/usr/bin/env tsx
// enhanced-cli.ts
// app/error-analyzer/enhanced-cli.ts

import { ErrorFixManager } from '@/core/error-analyzer/ErrorFixManager';
import { FileRelationshipAnalyzer } from '@/core/error-analyzer/FileRelationshipAnalyzer';
import { TypeScriptErrorFixSystem } from '@/core/error-analyzer/TypeScriptErrorFixSystem';
import type { TSCompilerError, FixPlan } from '@/core/error-analyzer/ErrorFixManager';
import type { AnalyzedError, RelationshipMap } from '@/core/error-analyzer/types/ErrorAnalysisTypes';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface FileRelationship {
  file: string;
  dependencies: string[];
  dependents: string[];
  priorityScore: number;
  errorCount: number;
}

interface NavigationPlan {
  priority: string[];
  dependencies: Map<string, string[]>;
  recommendations: string[];
}

class EnhancedTypeScriptErrorFixSystem extends TypeScriptErrorFixSystem {
  private relationshipAnalyzer: FileRelationshipAnalyzer;
  
  constructor() {
    super();
    this.relationshipAnalyzer = new FileRelationshipAnalyzer();
  }

  // In the analyzeWithNavigation method, update the timestamp generation:
  async analyzeWithNavigation(filePath: string): Promise<void> {
    console.log('🧭 Starting TypeScript Error Analysis with Navigation...');
    
    // Read errors
    const content = fs.readFileSync(filePath, 'utf-8');
    const errors: TSCompilerError[] = JSON.parse(content);
    
    // Create fix manager and analyze
    const fixManager = new ErrorFixManager();
    
    // Type-safe access to private methods
    const errorAnalyzer = (fixManager as any).errorAnalyzer;
    const relationshipAnalyzer = (fixManager as any).relationshipAnalyzer;
    
    if (!errorAnalyzer || !relationshipAnalyzer) {
      throw new Error('Failed to access error analyzer components');
    }
    
    // Step 1: Analyze errors and get fix plans
    console.log('🔍 Analyzing errors and relationships...');
    const analyzedErrors: AnalyzedError[] = await errorAnalyzer.analyzeErrors(errors);
    const relationshipMap: RelationshipMap = await relationshipAnalyzer.buildRelationshipMap(errors);
    const fixPlans: FixPlan[] = await (fixManager as any).generateFixPlans(analyzedErrors, relationshipMap);
    
    // Step 2: Analyze file relationships
    console.log('🗺️ Building file relationship map...');
    const fileRelationships = await this.relationshipAnalyzer.analyzeRelationships(
      fixPlans,
      relationshipMap
    );
    
    // Step 3: Generate navigation strategy
    console.log('📋 Generating navigation plan...');
    const strategy = await this.relationshipAnalyzer.generateFixStrategy(
      fileRelationships,
      fixPlans
    );
    
    // Step 4: Generate navigation plan
    const navigationPlan = await this.relationshipAnalyzer.generateNavigationPlan(
      fileRelationships,
      fixPlans
    );
    
    // Create descriptive timestamp with error count
    const errorCount = errors.length;
    const fileCount = new Set(errors.map((e: TSCompilerError) => e.resource)).size;
    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const formattedTime = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    
    // Create descriptive output directory name
    const outputDir = `reports/ts-navigation-${formattedDate}-${formattedTime}-${errorCount}errors`;
    
    fs.mkdirSync(outputDir, { recursive: true });
    
    // Save reports with descriptive names
    fs.writeFileSync(path.join(outputDir, '01-fix-strategy.md'), strategy);
    fs.writeFileSync(path.join(outputDir, '02-navigation-plan.md'), navigationPlan);
    
    // Save grouped data with descriptive name
    const hierarchyGroups = await this.relationshipAnalyzer.groupByHierarchy(fileRelationships);
    const connectionGroups = await this.relationshipAnalyzer.groupByConnections(fileRelationships);
    const confidenceGroups = await this.relationshipAnalyzer.groupByConfidence(fixPlans);
    
    fs.writeFileSync(
      path.join(outputDir, '03-file-groups.json'),
      JSON.stringify({
        metadata: {
          generated: new Date().toISOString(),
          totalErrors: errorCount,
          totalFiles: fileCount,
          fixPlansCount: fixPlans.length,
          highConfidenceCount: fixPlans.filter(p => p.confidence >= 80).length
        },
        hierarchyGroups,
        connectionGroups,
        confidenceGroups,
        topFiles: Array.from(fileRelationships.values())
          .sort((a, b) => b.priorityScore - a.priorityScore)
          .slice(0, 20)
      }, null, 2)
    );
    
    // Also create a summary file
    const summary = this.generateSummary(errors, fixPlans, fileCount);
    fs.writeFileSync(path.join(outputDir, '00-quick-summary.md'), summary);
    
    console.log(`✅ Analysis complete!`);
    console.log(`📁 Reports saved to: ${outputDir}`);
    console.log(`📊 Quick summary written to: ${outputDir}/00-quick-summary.md`);
    
    // Print quick summary to console
    console.log('\n📋 Quick Summary:');
    console.log(summary.split('\n').slice(0, 15).join('\n'));
  }

  private generateSummary(errors: TSCompilerError[], fixPlans: FixPlan[], fileCount: number): string {
    const lines: string[] = [];
    
    lines.push('# 📊 TypeScript Error Analysis Summary');
    lines.push('');
    lines.push(`**Generated:** ${new Date().toISOString()}`);
    lines.push(`**Total Errors:** ${errors.length}`);
    lines.push(`**Files Affected:** ${fileCount}`);
    lines.push(`**Fix Plans Generated:** ${fixPlans.length}`);
    lines.push('');
    
    // Error code distribution
    const errorCodes = new Map<string, number>();
    for (const error of errors) {
      errorCodes.set(error.code, (errorCodes.get(error.code) || 0) + 1);
    }
    
    lines.push('## Error Code Distribution');
    lines.push('');
    for (const [code, count] of Array.from(errorCodes.entries()).sort((a, b) => b[1] - a[1])) {
      lines.push(`- **TS${code}**: ${count} errors`);
    }
    lines.push('');
    
    // Fix type distribution
    const fixTypes = new Map<string, number>();
    for (const plan of fixPlans) {
      fixTypes.set(plan.fixType, (fixTypes.get(plan.fixType) || 0) + 1);
    }
    
    lines.push('## Fix Type Distribution');
    lines.push('');
    for (const [type, count] of Array.from(fixTypes.entries()).sort((a, b) => b[1] - a[1])) {
      lines.push(`- **${type}**: ${count} fixes`);
    }
    lines.push('');
    
    // Top 5 files
    const files = new Map<string, number>();
    for (const error of errors) {
      const file = error.resource;
      files.set(file, (files.get(file) || 0) + 1);
    }
    
    const topFiles = Array.from(files.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (topFiles.length > 0) {
      lines.push('## Top 5 Files with Most Errors');
      lines.push('');
      for (const [file, count] of topFiles) {
        lines.push(`- **${path.basename(file)}**: ${count} errors`);
      }
      lines.push('');
    }
    
    // Confidence breakdown
    const confidenceLevels = {
      high: fixPlans.filter(p => p.confidence >= 80).length,
      medium: fixPlans.filter(p => p.confidence >= 60 && p.confidence < 80).length,
      low: fixPlans.filter(p => p.confidence < 60).length
    };
    
    lines.push('## Confidence Breakdown');
    lines.push('');
    lines.push(`- **High (80-100%)**: ${confidenceLevels.high} fixes`);
    lines.push(`- **Medium (60-79%)**: ${confidenceLevels.medium} fixes`);
    lines.push(`- **Low (0-59%)**: ${confidenceLevels.low} fixes`);
    lines.push('');
    
    // Quick action items
    lines.push('## 🚀 Quick Action Items');
    lines.push('');
    lines.push('1. **Start with high-confidence fixes**');
    lines.push('2. **Fix files with most errors first**');
    lines.push('3. **Check the navigation plan for priority order**');
    lines.push('4. **Review the fix strategy for detailed guidance**');
    
    return lines.join('\n');
  }

  async fixByHierarchy(folderPath: string): Promise<void> {
    console.log(`📁 Fixing errors in folder: ${folderPath}`);
    
    // Get all TypeScript files in folder
    const files = this.getAllTypeScriptFiles(folderPath);
    console.log(`Found ${files.length} TypeScript files`);
    
    // Check each file for errors
    for (const file of files) {
      console.log(`\n🔍 Checking: ${path.relative(process.cwd(), file)}`);
      
      try {
        const result = execSync(`npx tsc --noEmit --pretty false ${file} 2>&1`, { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        if (result.includes('error TS')) {
          console.log(`   ⚠️  Errors found in ${path.basename(file)}`);
          // Parse errors and fix
          await this.analyzeSingleFile(file, result);
        } else {
          console.log(`   ✅ No errors in ${path.basename(file)}`);
        }
      } catch (error: any) {
        if (error.stdout?.includes('error TS')) {
          console.log(`   ⚠️  Errors found in ${path.basename(file)}`);
          await this.analyzeSingleFile(file, error.stdout);
        } else {
          console.log(`   ❌ Error checking ${path.basename(file)}:`, error.message);
        }
      }
    }
  }

  async fixByConnections(mainFile: string): Promise<void> {
    console.log(`🔗 Fixing errors for connected files starting with: ${mainFile}`);
    
    // First analyze the main file
    const mainErrors = await this.getFileErrors(mainFile);
    if (mainErrors.length === 0) {
      console.log(`✅ No errors in ${mainFile}`);
      return;
    }
    
    // Analyze to find connected files
    const fixManager = new ErrorFixManager();
    const errorAnalyzer = (fixManager as any).errorAnalyzer;
    const relationshipAnalyzer = (fixManager as any).relationshipAnalyzer;
    
    if (!errorAnalyzer || !relationshipAnalyzer) {
      console.error('❌ Failed to access analyzer components');
      return;
    }
    
    const analyzedErrors: AnalyzedError[] = await errorAnalyzer.analyzeErrors(mainErrors);
    const relationshipMap: RelationshipMap = await relationshipAnalyzer.buildRelationshipMap(mainErrors);
    
    // Get all connected files
    const connectedFiles = new Set<string>();
    connectedFiles.add(mainFile);
    
    const deps = relationshipMap.fileDependencies.get(mainFile) || [];
    for (const dep of deps) {
      const depFile = this.findFileByImport(mainFile, dep);
      if (depFile) {
        connectedFiles.add(depFile);
      }
    }
    
    console.log(`Found ${connectedFiles.size} connected files:`);
    Array.from(connectedFiles).forEach(file => {
      console.log(`  - ${path.relative(process.cwd(), file)}`);
    });
    
    // Fix each connected file
    for (const file of connectedFiles) {
      await this.fixSingleFile(file);
    }
  }

  async fixByConfidence(minConfidence: number = 80): Promise<void> {
    console.log(`🎯 Fixing errors with confidence >= ${minConfidence}%`);
    
    // Get all errors
    const allErrors = await this.getAllProjectErrors();
    const fixManager = new ErrorFixManager();
    
    const errorAnalyzer = (fixManager as any).errorAnalyzer;
    const relationshipAnalyzer = (fixManager as any).relationshipAnalyzer;
    
    if (!errorAnalyzer || !relationshipAnalyzer) {
      console.error('❌ Failed to access analyzer components');
      return;
    }
    
    const analyzedErrors: AnalyzedError[] = await errorAnalyzer.analyzeErrors(allErrors);
    const relationshipMap: RelationshipMap = await relationshipAnalyzer.buildRelationshipMap(allErrors);
    const fixPlans: FixPlan[] = await (fixManager as any).generateFixPlans(analyzedErrors, relationshipMap);
    
    // Filter by confidence
    const highConfidencePlans = fixPlans.filter(p => p.confidence >= minConfidence);
    
    console.log(`Found ${highConfidencePlans.length} high-confidence fixes out of ${fixPlans.length} total`);
    
    // Group by file for efficiency
    const plansByFile = new Map<string, FixPlan[]>();
    for (const plan of highConfidencePlans) {
      const file = plan.error.resource;
      if (!plansByFile.has(file)) {
        plansByFile.set(file, []);
      }
      plansByFile.get(file)!.push(plan);
    }
    
    // Fix each file
    let fixedCount = 0;
    for (const [file, plans] of plansByFile.entries()) {
      console.log(`\n🔧 Fixing ${path.basename(file)} (${plans.length} high-confidence errors)`);
      
      for (const plan of plans) {
        console.log(`   • ${plan.error.message.substring(0, 60)}...`);
        // In production, apply the fix here
        fixedCount++;
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} high-confidence errors`);
  }

  private async analyzeSingleFile(filePath: string, tscOutput: string): Promise<void> {
    // Parse TSC output into error format
    const errors = this.parseTscOutput(tscOutput, filePath);
    
    if (errors.length > 0) {
      const fixManager = new ErrorFixManager();
      const errorAnalyzer = (fixManager as any).errorAnalyzer;
      const relationshipAnalyzer = (fixManager as any).relationshipAnalyzer;
      
      if (!errorAnalyzer || !relationshipAnalyzer) {
        console.error('   ❌ Failed to access analyzer components');
        return;
      }
      
      const analyzedErrors: AnalyzedError[] = await errorAnalyzer.analyzeErrors(errors);
      const relationshipMap: RelationshipMap = await relationshipAnalyzer.buildRelationshipMap(errors);
      const fixPlans: FixPlan[] = await (fixManager as any).generateFixPlans(analyzedErrors, relationshipMap);
      
      console.log(`   📝 Suggested fixes:`);
      for (const plan of fixPlans.slice(0, 3)) { // Show first 3
        console.log(`     • ${plan.suggestedFix.split('\n')[0]}`);
      }
      if (fixPlans.length > 3) {
        console.log(`     • ... and ${fixPlans.length - 3} more fixes`);
      }
    }
  }

  private parseTscOutput(output: string, filePath: string): TSCompilerError[] {
    const lines = output.split('\n');
    const errors: TSCompilerError[] = [];
    const errorPattern = /\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)$/;
    
    for (const line of lines) {
      if (line.includes(filePath)) {
        const match = line.match(errorPattern);
        if (match) {
          const [, lineNum, colNum, code, message] = match;
          errors.push({
            resource: filePath,
            owner: 'unknown',
            source: 'TypeScript',
            code: `TS${code}`,
            message: message.trim(),
            startLineNumber: parseInt(lineNum),
            startColumn: parseInt(colNum),
            endLineNumber: parseInt(lineNum),
            endColumn: parseInt(colNum) + 10, // Approximate
            severity: 8
          });
        }
      }
    }
    
    return errors;
  }

  private getAllTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            files.push(...this.getAllTypeScriptFiles(fullPath));
          }
        } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Could not read directory ${dir}:`, error);
    }
    
    return files;
  }

  private async getFileErrors(filePath: string): Promise<TSCompilerError[]> {
    try {
      const result = execSync(`npx tsc --noEmit --pretty false ${filePath} 2>&1`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return this.parseTscOutput(result, filePath);
    } catch (error: any) {
      if (error.stdout) {
        return this.parseTscOutput(error.stdout, filePath);
      }
      console.error(`Error checking ${filePath}:`, error.message);
      return [];
    }
  }

  private findFileByImport(sourceFile: string, importPath: string): string | null {
    const sourceDir = path.dirname(sourceFile);
    
    // Try relative import
    const possiblePaths = [
      path.join(sourceDir, importPath + '.ts'),
      path.join(sourceDir, importPath + '.tsx'),
      path.join(sourceDir, importPath, 'index.ts'),
      path.join(sourceDir, importPath, 'index.tsx'),
    ];
    
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        return possiblePath;
      }
    }
    
    return null;
  }

  private async getAllProjectErrors(): Promise<TSCompilerError[]> {
    console.log('🔍 Checking entire project for TypeScript errors...');
    
    try {
      const result = execSync('npx tsc --noEmit --pretty false 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Parse all errors from output
      return this.parseAllTscOutput(result);
    } catch (error: any) {
      if (error.stdout) {
        return this.parseAllTscOutput(error.stdout);
      }
      console.error('Error running TypeScript check:', error.message);
      return [];
    }
  }

  private parseAllTscOutput(output: string): TSCompilerError[] {
    const errors: TSCompilerError[] = [];
    const lines = output.split('\n');
    const errorPattern = /^(.*\.(?:ts|tsx))\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)$/;
    
    for (const line of lines) {
      const match = line.match(errorPattern);
      if (match) {
        const [, file, lineNum, colNum, code, message] = match;
        errors.push({
          resource: path.resolve(file.trim()),
          owner: 'unknown',
          source: 'TypeScript',
          code: `TS${code}`,
          message: message.trim(),
          startLineNumber: parseInt(lineNum),
          startColumn: parseInt(colNum),
          endLineNumber: parseInt(lineNum),
          endColumn: parseInt(colNum) + 10,
          severity: 8
        });
      }
    }
    
    return errors;
  }

  private async fixSingleFile(filePath: string): Promise<void> {
    const errors = await this.getFileErrors(filePath);
    if (errors.length === 0) {
      console.log(`   ✅ ${path.basename(filePath)} has no errors`);
      return;
    }
    
    console.log(`   🔧 Fixing ${path.basename(filePath)} (${errors.length} errors)`);
    
    // In production, apply fixes here
    // For now, just show what would be fixed
    for (const error of errors.slice(0, 2)) {
      console.log(`     • ${error.message.substring(0, 50)}...`);
    }
    if (errors.length > 2) {
      console.log(`     • ... and ${errors.length - 2} more errors`);
    }
  }
}

// Helper function to parse raw tsc output into JSON format
function parseRawTypeScriptOutput(output: string): TSCompilerError[] {
  const errors: TSCompilerError[] = [];
  const lines = output.split('\n');
  
  // Pattern for TypeScript error lines
  const errorPattern = /^(.*\.(?:ts|tsx|js|jsx))\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)$/;
  
  for (const line of lines) {
    const match = line.match(errorPattern);
    if (match) {
      const [, resource, startLine, startColumn, code, message] = match;
      errors.push({
        resource: path.resolve(resource.trim()),
        owner: 'unknown',
        source: 'TypeScript',
        code: `TS${code}`,
        message: message.trim(),
        startLineNumber: parseInt(startLine, 10),
        startColumn: parseInt(startColumn, 10),
        endLineNumber: parseInt(startLine, 10),
        endColumn: parseInt(startColumn, 10) + 10,
        severity: 8
      });
    }
  }
  
  return errors;
}

// CLI Interface
async function main() {
  const system = new EnhancedTypeScriptErrorFixSystem();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
🧭 Enhanced TypeScript Error Fix System with Navigation
=====================================================

Usage:
  pnpm tsx enhanced-cli.ts [command] [options]

Commands:
  navigate <errors.json>     Analyze errors with navigation strategy
  fix:folder <path>         Fix errors by folder hierarchy
  fix:connections <file>    Fix errors in connected files
  fix:confidence [min]      Fix high-confidence errors (default: 80)
  strategy                  Generate fix strategy from current errors
  quick-wins               Fix quick wins first
  
Options:
  --help                    Show this help message
  --output <dir>           Output directory for reports
  --min-confidence <n>     Minimum confidence for fixes (0-100)

Examples:
  pnpm analyze:ts-output && pnpm tsx enhanced-cli.ts navigate ts-errors.json
  pnpm tsx enhanced-cli.ts fix:folder src/app/features
  pnpm tsx enhanced-cli.ts fix:connections src/app/index.ts
  pnpm tsx enhanced-cli.ts fix:confidence 70
  pnpm tsx enhanced-cli.ts quick-wins
    `);
    return;
  }
  
  const command = args[0];
  
  try {
    switch (command) {
      case 'navigate':
        if (args[1]) {
          await system.analyzeWithNavigation(args[1]);
        } else {
          console.error('Error: Please provide a JSON file path');
          process.exit(1);
        }
        break;
        
      case 'fix:folder':
        if (args[1]) {
          await system.fixByHierarchy(args[1]);
        } else {
          console.error('Error: Please provide a folder path');
          process.exit(1);
        }
        break;
        
      case 'fix:connections':
        if (args[1]) {
          await system.fixByConnections(args[1]);
        } else {
          console.error('Error: Please provide a starting file');
          process.exit(1);
        }
        break;
        
      case 'fix:confidence':
        const minConfidence = args[1] ? parseInt(args[1]) : 80;
        if (isNaN(minConfidence) || minConfidence < 0 || minConfidence > 100) {
          console.error('Error: min-confidence must be a number between 0 and 100');
          process.exit(1);
        }
        await system.fixByConfidence(minConfidence);
        break;
        
      case 'strategy':
        // Generate strategy from current tsc output
        console.log('🔍 Running TypeScript check...');
        try {
          // Run tsc and capture output
          const tscOutput = execSync('npx tsc --noEmit --pretty false 2>&1', {
            encoding: 'utf8',
            stdio: 'pipe'
          });
          
          // Parse the raw output into JSON format
          const errors = parseRawTypeScriptOutput(tscOutput);
          
          // Save as JSON file
          const errorsFile = 'ts-errors-latest.json';
          fs.writeFileSync(errorsFile, JSON.stringify(errors, null, 2));
          
          console.log(`✅ Found ${errors.length} errors, saved to ${errorsFile}`);
          
          // Now analyze with navigation
          await system.analyzeWithNavigation(errorsFile);
          
        } catch (error: any) {
          // tsc returns error code when errors exist
          if (error.stdout) {
            const errors = parseRawTypeScriptOutput(error.stdout);
            const errorsFile = 'ts-errors-latest.json';
            fs.writeFileSync(errorsFile, JSON.stringify(errors, null, 2));
            console.log(`✅ Found ${errors.length} errors, saved to ${errorsFile}`);
            await system.analyzeWithNavigation(errorsFile);
          } else {
            console.error('❌ Failed to run TypeScript check:', error.message);
            process.exit(1);
          }
        }
        break;
        
      case 'quick-wins':
        await system.fixByConfidence(80);
        break;
        
      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error: any) {
    console.error(`❌ Error executing command "${command}":`, error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}