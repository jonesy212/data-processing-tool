#!/usr/bin/env tsx
// find-error-hotspots.ts - Find where most TypeScript errors are

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface ErrorHotspot {
  folder: string;
  errorCount: number;
  files: string[];
  fileCount: number;
  errorCodes: Map<string, number>;
  percentage: number;
}

interface FileErrorStats {
  file: string;
  errorCount: number;
  errorCodes: string[];
  firstError: string;
}

class ErrorHotspotFinder {
  private projectRoot: string;
  private ignorePatterns = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    '.cache',
    'coverage'
  ];

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  async findHotspots(): Promise<ErrorHotspot[]> {
    console.log('🔥 FINDING ERROR HOTSPOTS');
    console.log('='.repeat(60));
    
    // Get all TypeScript errors
    const allErrors = await this.getAllTypeScriptErrors();
    
    if (allErrors.length === 0) {
      console.log('🎉 No TypeScript errors found!');
      return [];
    }
    
    console.log(`📊 Found ${allErrors.length} total TypeScript errors\n`);
    
    // Group errors by folder
    const folderStats = this.groupErrorsByFolder(allErrors);
    
    // Sort by error count
    const sortedFolders = Array.from(folderStats.entries())
      .sort((a, b) => b[1].errors.length - a[1].errors.length);
    
    // Calculate percentages
    const hotspots: ErrorHotspot[] = sortedFolders.map(([folder, stats]) => {
      const percentage = Math.round((stats.errors.length / allErrors.length) * 100);
      
      // Get unique files in this folder
      const uniqueFiles = Array.from(new Set(stats.errors.map(e => e.file)));
      
      // Count error codes
      const errorCodes = new Map<string, number>();
      stats.errors.forEach(error => {
        errorCodes.set(error.code, (errorCodes.get(error.code) || 0) + 1);
      });
      
      return {
        folder,
        errorCount: stats.errors.length,
        files: uniqueFiles,
        fileCount: uniqueFiles.length,
        errorCodes,
        percentage
      };
    });
    
    return hotspots;
  }

  private async getAllTypeScriptErrors(): Promise<FileErrorStats[]> {
    console.log('🔍 Scanning for TypeScript errors...');
    
    try {
      const output = execSync('npx tsc --noEmit --skipLibCheck 2>&1', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      return this.parseTscOutput(output);
      
    } catch (error: any) {
      if (error.stdout) {
        return this.parseTscOutput(error.stdout.toString());
      }
      console.error('❌ Failed to get TypeScript errors:', error.message);
      return [];
    }
  }

  private parseTscOutput(output: string): FileErrorStats[] {
    const lines = output.split('\n');
    const errors: Array<{ file: string; code: string; message: string }> = [];
    
    // Parse error lines like: src/app/file.ts(10,5): error TS2304: Cannot find name 'x'
    const errorPattern = /^(.*?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/;
    
    lines.forEach(line => {
      const match = line.match(errorPattern);
      if (match) {
        const [, file, , , code, message] = match;
        // Skip node_modules errors (even with skipLibCheck some might slip through)
        if (!file.includes('node_modules')) {
          errors.push({ file: path.resolve(file), code, message });
        }
      }
    });
    
    // Group by file
    const files = new Map<string, FileErrorStats>();
    
    errors.forEach(error => {
      const file = error.file;
      if (!files.has(file)) {
        files.set(file, {
          file,
          errorCount: 0,
          errorCodes: [],
          firstError: error.message
        });
      }
      
      const stats = files.get(file)!;
      stats.errorCount++;
      if (!stats.errorCodes.includes(error.code)) {
        stats.errorCodes.push(error.code);
      }
    });
    
    return Array.from(files.values());
  }

  private groupErrorsByFolder(errors: FileErrorStats[]): Map<string, { errors: FileErrorStats[] }> {
    const folderMap = new Map<string, { errors: FileErrorStats[] }>();
    
    errors.forEach(error => {
      const folder = this.getFolderFromFile(error.file);
      
      if (!folderMap.has(folder)) {
        folderMap.set(folder, { errors: [] });
      }
      
      folderMap.get(folder)!.errors.push(error);
    });
    
    return folderMap;
  }

  private getFolderFromFile(filePath: string): string {
    const relativePath = path.relative(this.projectRoot, filePath);
    const parts = relativePath.split(path.sep);
    
    // Get first 2-3 levels of folder structure
    if (parts.length >= 3) {
      return parts.slice(0, 3).join('/');
    } else if (parts.length === 2) {
      return parts.join('/');
    } else {
      return parts[0] || 'root';
    }
  }

  async generateReport(hotspots: ErrorHotspot[]): Promise<void> {
    console.log('\n📊 ERROR HOTSPOT REPORT');
    console.log('='.repeat(60));
    
    if (hotspots.length === 0) {
      console.log('🎉 No error hotspots found!');
      return;
    }
    
    const totalErrors = hotspots.reduce((sum, spot) => sum + spot.errorCount, 0);
    
    console.log(`📈 Total Errors: ${totalErrors}`);
    console.log(`📁 Top 10 Hotspots:`);
    console.log('');
    
    // Print top hotspots
    hotspots.slice(0, 10).forEach((spot, index) => {
      const barLength = 30;
      const filled = Math.round((spot.percentage / 100) * barLength);
      const empty = barLength - filled;
      
      console.log(`${index + 1}. ${spot.folder}`);
      console.log(`   📊 Errors: ${spot.errorCount} (${spot.percentage}% of total)`);
      console.log(`   📁 Files: ${spot.fileCount} files affected`);
      console.log(`   [${'█'.repeat(filled)}${'░'.repeat(empty)}] ${spot.percentage}%`);
      
      // Show top error codes
      const topCodes = Array.from(spot.errorCodes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      if (topCodes.length > 0) {
        console.log(`   🔍 Top error codes: ${topCodes.map(([code, count]) => `${code}(${count})`).join(', ')}`);
      }
      
      // Show sample files
      if (spot.files.length > 0) {
        const sampleFiles = spot.files.slice(0, 2);
        console.log(`   📄 Sample: ${sampleFiles.map(f => path.basename(f)).join(', ')}`);
      }
      
      console.log('');
    });
    
    // Generate recommendations
    console.log('🎯 RECOMMENDED FIX ORDER:');
    console.log('');
    
    hotspots.slice(0, 5).forEach((spot, index) => {
      console.log(`${index + 1}. Fix ${spot.folder}`);
      console.log(`   Command: npx tsc --noEmit ${spot.files.slice(0, 3).join(' ')} 2>&1 | head -20`);
      
      // Specific recommendations based on error codes
      const codes = Array.from(spot.errorCodes.keys());
      if (codes.includes('TS2304') || codes.includes('TS2307')) {
        console.log(`   🔧 Focus: Missing imports - run import fixer first`);
      }
      if (codes.includes('TS2322') || codes.includes('TS2345')) {
        console.log(`   🔧 Focus: Type mismatches - check type definitions`);
      }
      if (codes.includes('TS1005') || codes.includes('TS1128')) {
        console.log(`   🔧 Focus: Syntax errors - check for missing brackets/semicolons`);
      }
      
      console.log('');
    });
    
    // Save detailed report
    await this.saveDetailedReport(hotspots);
  }

  private async saveDetailedReport(hotspots: ErrorHotspot[]): Promise<void> {
    const reportDir = path.join(this.projectRoot, 'reports', 'error-analysis');
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `hotspots-${timestamp}.json`);
    
    const report = {
      generated: new Date().toISOString(),
      totalErrors: hotspots.reduce((sum, spot) => sum + spot.errorCount, 0),
      totalHotspots: hotspots.length,
      hotspots: hotspots.map(spot => ({
        ...spot,
        errorCodes: Object.fromEntries(spot.errorCodes)
      })),
      recommendations: this.generateDetailedRecommendations(hotspots)
    };
    
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`📄 Detailed report saved: ${reportFile}`);
    
    // Also create a markdown summary
    const mdFile = path.join(reportDir, `hotspots-${timestamp}.md`);
    await this.saveMarkdownReport(hotspots, mdFile);
  }

  private generateDetailedRecommendations(hotspots: ErrorHotspot[]): string[] {
    const recommendations: string[] = [];
    
    // Top hotspot
    if (hotspots.length > 0) {
      const top = hotspots[0];
      recommendations.push(`Start with ${top.folder} - ${top.errorCount} errors (${top.percentage}% of total)`);
    }
    
    // Check for import issues
    const hasImportErrors = hotspots.some(spot => 
      Array.from(spot.errorCodes.keys()).some(code => 
        code === 'TS2304' || code === 'TS2307'
      )
    );
    
    if (hasImportErrors) {
      recommendations.push('Run import fixer: pnpm fix:types --dry-run');
    }
    
    // Check for syntax errors
    const hasSyntaxErrors = hotspots.some(spot =>
      Array.from(spot.errorCodes.keys()).some(code =>
        code === 'TS1005' || code === 'TS1128'
      )
    );
    
    if (hasSyntaxErrors) {
      recommendations.push('Fix syntax errors first (TS1005, TS1128) - they block other fixes');
    }
    
    // Folder-based recommendations
    hotspots.slice(0, 3).forEach(spot => {
      if (spot.folder.includes('core') || spot.folder.includes('app')) {
        recommendations.push(`Fix ${spot.folder} early - core functionality affects other areas`);
      }
    });
    
    return recommendations;
  }

  private async saveMarkdownReport(hotspots: ErrorHotspot[], filePath: string): Promise<void> {
    const lines: string[] = [];
    
    lines.push('# 🔥 TypeScript Error Hotspot Report');
    lines.push('');
    lines.push(`**Generated:** ${new Date().toISOString()}`);
    lines.push('');
    
    const totalErrors = hotspots.reduce((sum, spot) => sum + spot.errorCount, 0);
    lines.push(`## 📊 Summary`);
    lines.push('');
    lines.push(`- **Total Errors:** ${totalErrors}`);
    lines.push(`- **Hotspots Found:** ${hotspots.length}`);
    lines.push(`- **Files Affected:** ${new Set(hotspots.flatMap(spot => spot.files)).size}`);
    lines.push('');
    
    lines.push('## 🎯 Top 10 Error Hotspots');
    lines.push('');
    lines.push('| Rank | Folder | Errors | % | Files | Top Error Codes |');
    lines.push('|------|--------|--------|---|-------|----------------|');
    
    hotspots.slice(0, 10).forEach((spot, index) => {
      const topCodes = Array.from(spot.errorCodes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([code]) => code)
        .join(', ');
      
      lines.push(`| ${index + 1} | ${spot.folder} | ${spot.errorCount} | ${spot.percentage}% | ${spot.fileCount} | ${topCodes} |`);
    });
    
    lines.push('');
    lines.push('## 🚀 Fix Priority');
    lines.push('');
    lines.push('1. **Fix core functionality first** - These block everything else');
    lines.push('2. **Fix syntax errors (TS1005, TS1128)** - Must be fixed before anything else');
    lines.push('3. **Fix missing imports (TS2304, TS2307)** - Use auto-fixer where possible');
    lines.push('4. **Fix type mismatches (TS2322, TS2345)** - May require manual review');
    lines.push('');
    
    lines.push('## 📋 Action Items');
    lines.push('');
    
    hotspots.slice(0, 5).forEach((spot, index) => {
      lines.push(`### ${index + 1}. ${spot.folder}`);
      lines.push(`**Errors:** ${spot.errorCount} (${spot.percentage}% of total)`);
      lines.push('');
      lines.push('**Commands to run:**');
      lines.push('```bash');
      lines.push(`# Check errors in this folder`);
      lines.push(`npx tsc --noEmit ${spot.files.slice(0, 3).join(' ')} 2>&1 | head -20`);
      lines.push('');
      
      // Add specific commands based on error types
      const codes = Array.from(spot.errorCodes.keys());
      if (codes.includes('TS2304') || codes.includes('TS2307')) {
        lines.push('# Fix missing imports');
        lines.push('pnpm fix:types --dry-run');
        lines.push('');
      }
      
      lines.push('```');
      lines.push('');
    });
    
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`📝 Markdown report saved: ${filePath}`);
  }
}

// Main execution
async function main() {
  const finder = new ErrorHotspotFinder();
  
  console.log('🔥 FINDING TYPESCRIPT ERROR HOTSPOTS');
  console.log('='.repeat(60));
  
  const hotspots = await finder.findHotspots();
  await finder.generateReport(hotspots);
  
  // If no hotspots, check if there are any errors at all
  if (hotspots.length === 0) {
    console.log('\n🔍 Checking for any TypeScript errors...');
    try {
      execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'inherit' });
    } catch {
      // Errors will be shown by tsc
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
