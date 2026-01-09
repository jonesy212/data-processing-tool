#!/usr/bin/env tsx
src/core/error-analyzer/fix-strategy.ts

import type { SharedErrorLocation, SharedPriority } from '@/core/error-analyzer/types/ErrorAnalysisTypes';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Define types
interface TypeScriptError extends 
  SharedErrorLocation {
  resource: string;
  code: string;
  message: string;
  severity: number;
  source: string;
}

export interface FolderStats extends 
  SharedPriority {
  path: string;
  name: string;
  errorCount: number;
  fileCount: number;
  subfolders: FolderStats[];
  errorsByType: Map<string, number>;
}

interface FileStats extends 
  SharedPriority {
  path: string;
  name: string;
  folder: string;
  errorCount: number;
  errors: TypeScriptError[];
  errorTypes: Set<string>;
}

interface ErrorAnalysis {
  totalErrors: number;
  totalFiles: number;
  folderBreakdown: FolderStats[];
  topFiles: FileStats[];
  errorCodeDistribution: Map<string, number>;
  folderTree: string;
  recommendations: string[];
}



#TODO: Added optional shared interfaces at the bottom for future use:

// SharedWithRelatedInfo: For related error information

// SharedWithDependencies: For dependency info

SharedWithProperties: For property/method info


========== SHARED INTERFACES (if needed elsewhere) ==========
interface SharedWithRelatedInfo {
  relatedInformation?: Array<{
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    message: string;
    resource: string;
  }>;
}

interface SharedWithDependencies {
  extends?: string[];
  implements?: string[];
  dependencies: string[];
}

interface SharedWithProperties {
  properties: string[];
  methods: string[];
}


class EnhancedFixStrategy {
  private projectRoot: string;
  
  constructor() {
    this.projectRoot = process.cwd();
  }

  async analyzeTypeScriptErrors(): Promise<ErrorAnalysis> {
    console.log('🔍 Running TypeScript check...');
    
    let errors: TypeScriptError[] = [];
    let tscOutput = '';
    
    try {
      tscOutput = execSync('npx tsc --noEmit --skipLibCheck --skipDefaultLibCheck 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe'
      }).toString();
      
      errors = this.parseTypeScriptErrors(tscOutput);
      
    } catch (error: any) {
      console.error('TypeScript command failed:', error.message);
      
      // Capture the error output
      const errorOutput = error.stdout?.toString() || error.message || '';
      console.log('Error output (first 500 chars):', errorOutput.substring(0, 500));
      
      errors = this.parseTypeScriptErrors(errorOutput);
      
      // If still no errors but we got a crash, add a generic error
      if (errors.length === 0) {
        errors.push({
          resource: 'TypeScript Compiler',
          code: '9999',
          message: `TypeScript crashed: ${error.message.split('\n')[0]}`,
          startLineNumber: 0,
          startColumn: 0,
          endLineNumber: 0,
          endColumn: 0,
          severity: 8,
          source: 'TypeScript'
        });
      }
    }
    
    console.log(`Found ${errors.length} errors`);
    
    if (errors.length === 0) {
      console.log('✅ No TypeScript errors found!');
      console.log('📊 Generating empty analysis report...');
      
      return {
        totalErrors: 0,
        totalFiles: 0,
        folderBreakdown: [],
        topFiles: [],
        errorCodeDistribution: new Map(),
        folderTree: 'No errors found - project is clean! ✅',
        recommendations: ['🎉 No TypeScript errors to fix!', 'Keep up the good work!']
      };
    }
    
    console.log(`📊 Found ${errors.length} errors across ${new Set(errors.map(e => e.resource)).size} files`);
    
    // Analyze folder structure
    const analysis = this.analyzeFolderStructure(errors);
    
    // Generate reports
    await this.generateReports(analysis, errors);
    
    return analysis;
  }

  private determinePriority(score: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score >= 90) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }
  
  private analyzeFolderStructure(errors: TypeScriptError[]): ErrorAnalysis {
    // Group errors by file
    const errorsByFile = new Map<string, TypeScriptError[]>();
    for (const error of errors) {
      const file = path.resolve(error.resource);
      if (!errorsByFile.has(file)) {
        errorsByFile.set(file, []);
      }
      errorsByFile.get(file)!.push(error);
    }
    
    // Create folder hierarchy
    const rootFolder: FolderStats = {
      path: this.projectRoot,
      name: 'project-root',
      errorCount: 0,
      fileCount: 0,
      subfolders: [],
      errorsByType: new Map(),
      priorityScore: 0,
      priority: 'medium'
    };
    
    const folderMap = new Map<string, FolderStats>();
    folderMap.set(this.projectRoot, rootFolder);
    
    // Process each file
    const fileStats: FileStats[] = [];
    
    
  for (const [filePath, fileErrors] of errorsByFile.entries()) {
    const folderPath = path.dirname(filePath);
    const fileName = path.basename(filePath);
    
    // Create or get folder stats
    let folder = folderMap.get(folderPath);
    if (!folder) {
      folder = this.createFolderStats(folderPath);
      folderMap.set(folderPath, folder);
      
      // Ensure parent folders exist
      this.ensureParentFolders(folderPath, folderMap);
    }
    
    // Update folder stats
    folder.errorCount += fileErrors.length;
    folder.fileCount += 1;
    
    // Update error type distribution
    for (const error of fileErrors) {
      const count = folder.errorsByType.get(error.code) || 0;
      folder.errorsByType.set(error.code, count + 1);
    }
    
    // Calculate priority based on error count/severity
    const priorityScore = this.calculateFilePriority(filePath, fileErrors);
    const priority = this.determinePriority(priorityScore); // Add this helper method
    
    // Create file stats
    const fileStat: FileStats = {
      path: filePath,
      name: fileName,
      folder: folderPath,
      errorCount: fileErrors.length,
      errors: fileErrors,
      errorTypes: new Set(fileErrors.map(e => e.code)),
      priorityScore: priorityScore,
      priority: priority // Use the calculated priority
    };
    
    fileStats.push(fileStat);
  }
    
    // Build folder tree
    const folderTree = this.buildFolderTree(rootFolder, folderMap);
    
    // Calculate priority scores for folders
    for (const folder of folderMap.values()) {
      folder.priorityScore = this.calculateFolderPriority(folder);
    }
    
    // Get top files
    const topFiles = fileStats
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 20);
    
    // Error code distribution
    const errorCodeDistribution = new Map<string, number>();
    for (const error of errors) {
      const count = errorCodeDistribution.get(error.code) || 0;
      errorCodeDistribution.set(error.code, count + 1);
    }
    
    // Get all folders sorted by priority
    const allFolders = Array.from(folderMap.values())
      .filter(f => f.errorCount > 0)
      .sort((a, b) => b.priorityScore - a.priorityScore);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(allFolders, topFiles, errors.length, errorCodeDistribution);
    
    return {
      totalErrors: errors.length,
      totalFiles: errorsByFile.size,
      folderBreakdown: allFolders,
      topFiles,
      errorCodeDistribution,
      folderTree,
      recommendations
    };
  }
  
  private createFolderStats(folderPath: string): FolderStats {
    const relativePath = path.relative(this.projectRoot, folderPath);
    const folderName = relativePath || 'project-root';
 
    return {
      path: folderPath,
      name: folderName,
      errorCount: 0,
      fileCount: 0,
      subfolders: [],
      errorsByType: new Map(),
      priorityScore: 0,
      priority: 'low' as const 
    };
  }
  
  private ensureParentFolders(folderPath: string, folderMap: Map<string, FolderStats>): void {
    let currentPath = folderPath;
    
    while (currentPath !== this.projectRoot) {
      const parentPath = path.dirname(currentPath);
      
      if (!folderMap.has(parentPath)) {
        const parentFolder = this.createFolderStats(parentPath);
        folderMap.set(parentPath, parentFolder);
      }
      
      // Link parent-child relationship
      const parent = folderMap.get(parentPath)!;
      const child = folderMap.get(currentPath)!;
      
      if (!parent.subfolders.includes(child)) {
        parent.subfolders.push(child);
      }
      
      currentPath = parentPath;
    }
  }
  
  private calculateFilePriority(filePath: string, errors: TypeScriptError[]): number {
    let score = 0;
    
    // Base on error count
    score += errors.length * 10;
    
    // Adjust by error types
    const criticalErrors = ['2321', '2304', '2741']; // circular, missing name, missing property
    const criticalCount = errors.filter(e => criticalErrors.includes(e.code)).length;
    score += criticalCount * 20;
    
    // Adjust by file location
    const relativePath = path.relative(this.projectRoot, filePath);
    if (relativePath.includes('src/app/') || relativePath.includes('src/components/')) {
      score += 30; // Core application files
    } else if (relativePath.includes('src/')) {
      score += 20; // Source files
    } else if (relativePath.includes('test/') || relativePath.includes('__tests__/')) {
      score -= 10; // Test files less critical
    }
    
    // Adjust by file name
    const fileName = path.basename(filePath);
    if (fileName.includes('index.') || fileName.includes('main.') || fileName.includes('App.')) {
      score += 25; // Entry points are critical
    }
    
    return score;
  }
  
  private calculateFolderPriority(folder: FolderStats): number {
    let score = 0;
    
    // Base on error count
    score += folder.errorCount * 5;
    
    // Files per error ratio (higher = more spread out)
    if (folder.fileCount > 0) {
      const errorsPerFile = folder.errorCount / folder.fileCount;
      if (errorsPerFile > 3) {
        score += 20; // High density - fix this folder first
      }
    }
    
    // Critical errors bonus
    const criticalCodes = ['2321', '2304', '2741'];
    let criticalCount = 0;
    for (const [code, count] of folder.errorsByType.entries()) {
      if (criticalCodes.includes(code)) {
        criticalCount += count;
      }
    }
    score += criticalCount * 15;
    
    // Folder location
    if (folder.name.includes('app/') || folder.name.includes('components/')) {
      score += 40; // Core folders
    } else if (folder.name.includes('src/')) {
      score += 25; // Source folders
    }
    
    return score;
  }
  
  private buildFolderTree(rootFolder: FolderStats, folderMap: Map<string, FolderStats>): string {
    const lines: string[] = [];
    
    const buildTree = (folder: FolderStats, depth: number, prefix: string = ''): void => {
      const indent = '  '.repeat(depth);
      const hasErrors = folder.errorCount > 0;
      const errorIndicator = hasErrors ? ` (❌ ${folder.errorCount} errors)` : ' (✅ clean)';
      const folderName = folder.name === 'project-root' ? '📁 project' : `📁 ${folder.name.split('/').pop()}`;
      
      lines.push(`${indent}${prefix}${folderName}${errorIndicator}`);
      
      if (hasErrors && folder.fileCount > 0) {
        lines.push(`${indent}  📄 ${folder.fileCount} file(s) with errors`);
        
        // Show top error types
        const topErrorTypes = Array.from(folder.errorsByType.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);
        
        if (topErrorTypes.length > 0) {
          lines.push(`${indent}  🎯 Top errors: ${topErrorTypes.map(([code, count]) => `TS${code}:${count}`).join(', ')}`);
        }
      }
      
      // Sort subfolders by priority
      const sortedSubfolders = [...folder.subfolders]
        .filter(f => f.errorCount > 0)
        .sort((a, b) => b.priorityScore - a.priorityScore);
      
      for (let i = 0; i < sortedSubfolders.length; i++) {
        const isLast = i === sortedSubfolders.length - 1;
        const childPrefix = isLast ? '└── ' : '├── ';
        buildTree(sortedSubfolders[i], depth + 1, childPrefix);
      }
    };
    
    buildTree(rootFolder, 0);
    return lines.join('\n');
  }
  
  private generateRecommendations(
    folders: FolderStats[],
    topFiles: FileStats[],
    totalErrors: number,
    errorCodeDistribution: Map<string, number>
  ): string[] {
    const recommendations: string[] = [];
    
    // Quick wins
    const quickWinFiles = topFiles.filter(f => f.errorCount <= 3).slice(0, 5);
    if (quickWinFiles.length > 0) {
      recommendations.push(`**Quick Wins:** Fix these files first (1-3 errors each): ${
        quickWinFiles.map(f => f.name).join(', ')
      }`);
    }
    
    // Focus folders
    const topFolders = folders.slice(0, 3);
    if (topFolders.length > 0) {
      recommendations.push(`**Focus Folders:** Start with these high-priority folders: ${
        topFolders.map(f => f.name.split('/').pop()).join(', ')
      }`);
    }
    
    // Error type focus - FIXED: Use the passed errorCodeDistribution parameter
    const mostCommonError = Array.from(errorCodeDistribution.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    if (mostCommonError) {
      const [code, count] = mostCommonError;
      recommendations.push(`**Batch Fix:** Fix all TS${code} errors (${count} occurrences)`);
    }
    
    // Folder strategy
    if (folders.length > 5) {
      recommendations.push(`**Folder Strategy:** Fix folders one by one, starting with highest error density`);
    }
    
    return recommendations;
  }
  
  private async generateReports(analysis: ErrorAnalysis, errors: TypeScriptError[]): Promise<void> {
    // Create descriptive output directory
    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0];
    const formattedTime = date.toTimeString().split(' ')[0].replace(/:/g, '-');
    const outputDir = `reports/ts-analysis-${formattedDate}_${formattedTime}_${analysis.totalErrors}E_${analysis.totalFiles}F`;
    
    fs.mkdirSync(outputDir, { recursive: true });
    
    // Generate comprehensive report
    const report = this.generateComprehensiveReport(analysis);
    fs.writeFileSync(path.join(outputDir, '01-comprehensive-analysis.md'), report);
    
    // Generate folder visualization
    const folderViz = this.generateFolderVisualization(analysis);
    fs.writeFileSync(path.join(outputDir, '02-folder-visualization.md'), folderViz);
    
    // Generate actionable plan
    const actionPlan = this.generateActionPlan(analysis);
    fs.writeFileSync(path.join(outputDir, '03-action-plan.md'), actionPlan);
    
    // Save raw data for UI
    const uiData = this.prepareUIData(analysis);
    fs.writeFileSync(path.join(outputDir, '04-ui-data.json'), JSON.stringify(uiData, null, 2));
    
    // Save errors for reference
    fs.writeFileSync(
      path.join(outputDir, '05-raw-errors.json'),
      JSON.stringify(errors, null, 2)
    );
    
    // Create README
    const readme = this.createReadme(analysis, outputDir);
    fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
    
    console.log('\n📊 ========== TYPE SCRIPT ERROR ANALYSIS ==========');
    console.log(`📈 Total Errors: ${analysis.totalErrors}`);
    console.log(`📁 Files Affected: ${analysis.totalFiles}`);
    console.log(`🎯 Overall Priority Score: ${this.calculateOverallPriority(analysis)}/100`);
    console.log(`📂 Reports saved to: ${outputDir}`);
    
    console.log('\n📋 ========== TOP 5 FILES TO FIX ==========');
    for (const file of analysis.topFiles.slice(0, 5)) {
      console.log(`  ${file.name} (${file.errorCount} errors, score: ${file.priorityScore})`);
    }
    
    console.log('\n📁 ========== TOP 3 FOLDERS ==========');
    for (const folder of analysis.folderBreakdown.slice(0, 3)) {
      console.log(`  ${folder.name.split('/').pop() || 'root'}: ${folder.errorCount} errors across ${folder.fileCount} files`);
    }
    
    console.log('\n🚀 ========== RECOMMENDATIONS ==========');
    for (const rec of analysis.recommendations.slice(0, 3)) {
      console.log(`  • ${rec.replace('**', '').replace('**', '')}`);
    }
    
    console.log(`\n📄 Quick overview: ${outputDir}/01-comprehensive-analysis.md`);
    console.log(`🎨 UI-ready data: ${outputDir}/04-ui-data.json`);
  }
  
  private generateComprehensiveReport(analysis: ErrorAnalysis): string {
    const lines: string[] = [];
    
    lines.push('# 📊 Comprehensive TypeScript Error Analysis');
    lines.push('');
    lines.push(`**Generated:** ${new Date().toISOString()}`);
    lines.push(`**Total Errors:** ${analysis.totalErrors}`);
    lines.push(`**Files Affected:** ${analysis.totalFiles}`);
    lines.push(`**Overall Priority Score:** ${this.calculateOverallPriority(analysis)}/100`);
    lines.push('');
    
    // Error code distribution
    lines.push('## 📈 Error Code Distribution');
    lines.push('');
    lines.push('| Error Code | Count | Description |');
    lines.push('|------------|-------|-------------|');
    
    const sortedCodes = Array.from(analysis.errorCodeDistribution.entries())
      .sort((a, b) => b[1] - a[1]);
    
    for (const [code, count] of sortedCodes) {
      const description = this.getErrorDescription(code);
      lines.push(`| TS${code} | ${count} | ${description} |`);
    }
    lines.push('');
    
    // Top files
    lines.push('## 🎯 Top Priority Files');
    lines.push('');
    lines.push('| File | Errors | Priority | Location |');
    lines.push('|------|--------|----------|----------|');
    
    for (const file of analysis.topFiles.slice(0, 15)) {
      const relativePath = path.relative(this.projectRoot, file.path);
      lines.push(`| ${file.name} | ${file.errorCount} | ${file.priorityScore} | ${relativePath} |`);
    }
    lines.push('');
    
    // Folder breakdown
    lines.push('## 📁 Folder Breakdown');
    lines.push('');
    lines.push('| Folder | Errors | Files | Priority | Top Error |');
    lines.push('|--------|--------|-------|----------|-----------|');
    
    for (const folder of analysis.folderBreakdown.slice(0, 10)) {
      const folderName = folder.name.split('/').pop() || 'root';
      const topError = Array.from(folder.errorsByType.entries())
        .sort((a, b) => b[1] - a[1])[0];
      const topErrorStr = topError ? `TS${topError[0]}:${topError[1]}` : 'none';
      
      lines.push(`| ${folderName} | ${folder.errorCount} | ${folder.fileCount} | ${folder.priorityScore} | ${topErrorStr} |`);
    }
    lines.push('');
    
    // Folder tree
    lines.push('## 🌳 Folder Tree Visualization');
    lines.push('');
    lines.push('```');
    lines.push(analysis.folderTree);
    lines.push('```');
    lines.push('');
    
    // Recommendations
    lines.push('## 🚀 Recommendations');
    lines.push('');
    for (const rec of analysis.recommendations) {
      lines.push(`- ${rec.replace('**', '').replace('**', '')}`);
    }
    lines.push('');
    
    return lines.join('\n');
  }
  
  private generateFolderVisualization(analysis: ErrorAnalysis): string {
    const lines: string[] = [];
    
    lines.push('# 🎨 Folder Structure Visualization');
    lines.push('');
    lines.push('## 📊 Heat Map by Error Density');
    lines.push('');
    
    // Create ASCII heat map
    for (const folder of analysis.folderBreakdown.slice(0, 8)) {
      const density = folder.fileCount > 0 ? folder.errorCount / folder.fileCount : 0;
      const heatLevel = Math.min(5, Math.ceil(density));
      const heatBar = '█'.repeat(heatLevel) + '░'.repeat(5 - heatLevel);
      const folderName = folder.name.split('/').pop() || 'root';
      
      lines.push(`${folderName.padEnd(30)} ${heatBar} ${folder.errorCount} errors in ${folder.fileCount} files`);
    }
    lines.push('');
    
    return lines.join('\n');
  }
  
  private generateActionPlan(analysis: ErrorAnalysis): string {
    const lines: string[] = [];
    
    lines.push('# 🚀 TypeScript Error Fix Action Plan');
    lines.push('');
    
    // Phase 1: Quick wins (30 minutes)
    const quickWins = analysis.topFiles.filter(f => f.errorCount <= 3).slice(0, 8);
    lines.push('## 🏆 Phase 1: Quick Wins (30 minutes)');
    lines.push('');
    lines.push('**Goal:** Fix 8 files with 1-3 errors each');
    lines.push('');
    for (const file of quickWins) {
      lines.push(`- [ ] **${file.name}** (${file.errorCount} errors)`);
      lines.push(`  - Location: ${path.relative(this.projectRoot, file.path)}`);
      lines.push(`  - Error types: ${Array.from(file.errorTypes).map(c => `TS${c}`).join(', ')}`);
    }
    lines.push('');
    
    // Phase 2: Focus folder (1 hour)
    const focusFolder = analysis.folderBreakdown[0];
    if (focusFolder) {
      lines.push('## 🎯 Phase 2: Focus Folder (1 hour)');
      lines.push('');
      lines.push(`**Goal:** Fix all errors in ${focusFolder.name.split('/').pop()}`);
      lines.push(`**Statistics:** ${focusFolder.errorCount} errors across ${focusFolder.fileCount} files`);
      lines.push('');
      lines.push('**Top error types in this folder:**');
      const topErrors = Array.from(focusFolder.errorsByType.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      for (const [code, count] of topErrors) {
        lines.push(`- TS${code}: ${count} occurrences - ${this.getErrorDescription(code)}`);
      }
    }
    lines.push('');
    
    // Progress tracking
    lines.push('## 📈 Progress Tracking');
    lines.push('');
    lines.push('After each phase:');
    lines.push('1. Run `pnpm type-check` to verify fixes');
    lines.push('2. Update progress in your tracking system');
    lines.push('3. Check remaining errors with `pnpm analyze:ts-quick`');
    lines.push('');
    
    return lines.join('\n');
  }
  
  private prepareUIData(analysis: ErrorAnalysis): any {
    return {
      metadata: {
        generated: new Date().toISOString(),
        totalErrors: analysis.totalErrors,
        totalFiles: analysis.totalFiles,
        overallPriority: this.calculateOverallPriority(analysis)
      },
      summary: {
        topFiles: analysis.topFiles.slice(0, 10).map(f => ({
          name: f.name,
          path: f.path,
          errorCount: f.errorCount,
          priorityScore: f.priorityScore,
          relativePath: path.relative(this.projectRoot, f.path),
          errorTypes: Array.from(f.errorTypes)
        })),
        topFolders: analysis.folderBreakdown.slice(0, 5).map(f => ({
          name: f.name.split('/').pop() || 'root',
          fullPath: f.name,
          errorCount: f.errorCount,
          fileCount: f.fileCount,
          priorityScore: f.priorityScore,
          topErrors: Array.from(f.errorsByType.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([code, count]) => ({ code: `TS${code}`, count }))
        })),
        errorDistribution: Array.from(analysis.errorCodeDistribution.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([code, count]) => ({
            code: `TS${code}`,
            count,
            description: this.getErrorDescription(code)
          }))
      },
      recommendations: analysis.recommendations
    };
  }
  
  private createReadme(analysis: ErrorAnalysis, outputDir: string): string {
    return `# 📋 TypeScript Error Analysis Reports

## 📊 Summary
- **Total Errors:** ${analysis.totalErrors}
- **Files Affected:** ${analysis.totalFiles}
- **Generated:** ${new Date().toISOString()}
- **Directory:** ${path.basename(outputDir)}

## 📁 File Overview

### 01-comprehensive-analysis.md
Complete analysis with error distribution, top files, folder breakdown, and recommendations.

### 02-folder-visualization.md
Visual heat map and folder structure visualization.

### 03-action-plan.md
Step-by-step action plan with phases and progress tracking.

### 04-ui-data.json
Structured data ready for UI display with metadata, summaries, and visualizations.

### 05-raw-errors.json
Raw TypeScript errors in JSON format for reference.

## 🎯 Key Findings
1. **Top Error Code:** ${Array.from(analysis.errorCodeDistribution.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
2. **Most Problematic Folder:** ${analysis.folderBreakdown[0]?.name.split('/').pop() || 'N/A'}
3. **Highest Priority File:** ${analysis.topFiles[0]?.name || 'N/A'}

## 🚀 Quick Start
1. Review \`01-comprehensive-analysis.md\` for overview
2. Follow \`03-action-plan.md\` for step-by-step fixes
3. Use \`04-ui-data.json\` for UI integration
`;
  }
  
  private calculateOverallPriority(analysis: ErrorAnalysis): number {
    const folderPriority = analysis.folderBreakdown.reduce((sum, f) => sum + f.priorityScore, 0);
    const filePriority = analysis.topFiles.reduce((sum, f) => sum + f.priorityScore, 0);
    
    return Math.min(100, Math.round((folderPriority + filePriority) / 100));
  }
  
    // In EnhancedFixStrategy class, update getErrorDescription method:
    private getErrorDescription(code: string): string {
    const descriptions: Record<string, string> = {
        '1002': 'Expected ","',
        '1003': "Expected identifier", 
        '1005': "Expected ','",
        '1109': 'Expression expected',
        '1110': 'Type expected',
        '1128': 'Declaration or statement expected',
        '1135': 'Argument expression expected',
        '1136': 'Property assignment expected',
        '1146': 'JSX element expected',
        '1161': 'Unterminated template literal',
        '1434': 'Invalid JSX expression',
        '2304': 'Cannot find name',
        '2322': 'Type mismatch',
        '2741': 'Missing property',
        '2321': 'Circular dependency',
        '2339': 'Property does not exist',
        '2345': 'Argument mismatch',
        '2451': 'Cannot redeclare',
        '2554': 'Parameters mismatch',
        '2769': 'No overload matches',
        '2792': 'Cannot find module',
        '2809': 'Missing type argument'
    };
    
    return descriptions[code] || `TS${code} - Check TypeScript documentation`;
  }
  
  private parseTypeScriptErrors(output: string): TypeScriptError[] {
    const errors: TypeScriptError[] = [];
    const lines = output.split('\n');
    
    const errorPattern = /^(.*\.(?:ts|tsx))\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)$/;
    
    // Check for stack overflow errors
    const stackOverflowPatterns = [
      'Maximum call stack size exceeded',
      'RangeError',
      'isTypeReferenceWithGenericArguments',
      'getRelationKey'
    ];
    
    let hasStackOverflow = false;
    let suspectedFile = 'unknown';
    
    for (const line of lines) {
      // Check for stack overflow
      if (stackOverflowPatterns.some(pattern => line.includes(pattern))) {
        hasStackOverflow = true;
      }
      
      // Try to extract file path from stack trace
      const fileMatch = line.match(/at\s+.*\((.*\.tsx?):/);
      if (fileMatch && !fileMatch[1].includes('node_modules')) {
        suspectedFile = fileMatch[1];
      }
      
      // Parse regular TypeScript errors
      const match = line.match(errorPattern);
      if (match) {
        const [, resource, startLine, startColumn, code, message] = match;
        errors.push({
          resource: path.resolve(resource.trim()),
          code,
          message: message.trim(),
          startLineNumber: parseInt(startLine, 10),
          startColumn: parseInt(startColumn, 10),
          endLineNumber: parseInt(startLine, 10),
          endColumn: parseInt(startColumn, 10) + 10,
          severity: 8,
          source: 'TypeScript'
        });
      }
    }
    
    // Add stack overflow as an error
    if (hasStackOverflow) {
      errors.push({
        resource: suspectedFile !== 'unknown' ? suspectedFile : 'TypeScript Compiler',
        code: '2321',
        message: 'CRITICAL: TypeScript stack overflow - Circular type dependency detected',
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1,
        severity: 8,
        source: 'TypeScript'
      });
      
      console.error('⚠️ Detected TypeScript stack overflow!');
      console.error('This indicates circular type dependencies in your code.');
      if (suspectedFile !== 'unknown') {
        console.error(`📄 Suspected file: ${suspectedFile}`);
      }
    }
    
    return errors;
  }
}

Main execution
async function main() {
  const analyzer = new EnhancedFixStrategy();
  const analysis = await analyzer.analyzeTypeScriptErrors();
  
  // You can use this analysis object to display in UI
  return analysis;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { EnhancedFixStrategy };
