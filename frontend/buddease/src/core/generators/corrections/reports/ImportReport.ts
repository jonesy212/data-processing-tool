// ImportReport.ts
import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import type { ImportFix, ParsedImport } from '@/core/generators/corrections/ImportFixServicies';
import fs from 'fs';
import path from 'path';

export interface ImportAnalysis {
  filePath: string;
  totalImports: number;
  externalImports: number;
  internalImports: number;
  deepImports: number; // imports with 3+ levels of ../
  relativeImports: number;
  absoluteImports: number;
  wildcardImports: number;
  unusedImports: string[];
  
  invalidPaths: string[];  // Array of strings
  summary: ImportSummary;
  duplicateImports: string[];
  errors: string[];
  importLines: string[];
  issues: string[];
  bundleImpact: 'low' | 'medium' | 'high'; // estimated impact on bundle size
  imports: ParsedImport[];
  suggestedFixes: ImportFix[];
  circularImports: string[]
}


interface ImportSummary {
  total: number;
  external: number;
  internal: number;
  deep: number;
  issues: number;
  errorCount: number;
  unusedCount: number;
  duplicateCount: number;
  invalidPathCount: number;
  typeScriptErrorCount: number;
  healthScore?: number; // Optional if not always needed
  typeOnlyImports?: number; // Optional if not always needed
  sideEffectImports?: number; // Optional if not always needed
  heuristicErrorCount?: number;
  fixableCount?: number
}

export interface ImportRelationship {
  source: string;
  target: string;
  type: 'internal' | 'external' | 'third-party';
  frequency: number;
}

export interface BundleImpactAnalysis {
  heavyLibraries: Array<{ name: string; estimatedSize: string; usage: number }>;
  duplicateLibraries: Array<{ name: string; versions: string[]; files: string[] }>;
  treeShakeable: Array<{ library: string; currentUsage: string; potentialSavings: string }>;
}

export class ImportReport {
  private issues: Correction[];
  private importFixes: ImportFix[];
  private importAnalysis: Map<string, ImportAnalysis>;
  private relationships: ImportRelationship[];

  constructor(issues: Correction[], importFixes: ImportFix[] = []) {
    this.issues = issues;
    this.importFixes = importFixes;
    this.importAnalysis = new Map();
    this.relationships = [];
    
    this.analyzeImports();
    this.buildRelationshipGraph();
  }

  private analyzeImports(): void {
    // Extract import-related issues
    const importIssues = this.issues.filter(issue => 
      issue.category === 'imports' || 
      issue.message?.includes('import') ||
      issue.file?.includes('import')
    );

    // Group by file
    const issuesByFile = new Map<string, Correction[]>();
    importIssues.forEach(issue => {
      if (!issuesByFile.has(issue.file)) {
        issuesByFile.set(issue.file, []);
      }
      issuesByFile.get(issue.file)!.push(issue);
    });

    // Analyze each file
    issuesByFile.forEach((fileIssues, filePath) => {
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const analysis = this.analyzeFileImports(content, filePath, fileIssues);
          this.importAnalysis.set(filePath, analysis);
        } catch (error) {
          console.warn(`⚠️ Could not analyze imports for ${filePath}:`, error);
        }
      }
    });
  }

  private analyzeFileImports(content: string, filePath: string, issues: Correction[]): ImportAnalysis {
    const lines = content.split('\n');
    const importLines = lines.filter(line => line.trim().startsWith('import'));
    
    // Parse individual imports for detailed analysis
    const parsedImports: ParsedImport[] = this.parseImportLines(importLines);
    
    const analysis: ImportAnalysis = {
      filePath,
      totalImports: importLines.length,
      externalImports: 0,
      internalImports: 0,
      deepImports: 0,
      relativeImports: 0,
      absoluteImports: 0,
      wildcardImports: 0,
      unusedImports: [],
      duplicateImports: [],
      importLines,
      issues: [],
      bundleImpact: 'low',
      errors: [],
      imports: parsedImports,
      suggestedFixes: [],
      invalidPaths: [],
      summary: {
        total: 0,
        external: 0,
        internal: 0,
        deep: 0,
        issues: 0,
        errorCount: 0,
        unusedCount: 0,
        duplicateCount: 0,
        invalidPathCount: 0,
        typeScriptErrorCount: 0,
        heuristicErrorCount: 0,
        fixableCount: 0
      },
      circularImports: []
    };

    // KEEP THE ORIGINAL ANALYSIS LOGIC for counting imports
    // Analyze each import line
    importLines.forEach(line => {
      // Count import types
      if (line.includes('from') && line.includes("'")) {
        const importPath = this.extractImportPath(line);
        
        if (this.isExternalImport(importPath)) {
          analysis.externalImports++;
        } else {
          analysis.internalImports++;
        }

        if (this.isRelativeImport(importPath)) {
          analysis.relativeImports++;
          if (this.isDeepImport(importPath)) {
            analysis.deepImports++;
          }
        } else if (this.isAbsoluteImport(importPath)) {
          analysis.absoluteImports++;
        }

        if (line.includes('* as') || line.includes('* from')) {
          analysis.wildcardImports++;
        }
      }
    });

    // FIX 1: Convert number counts to string arrays
    const unusedImportCount = issues.filter(issue => 
      issue.message?.includes('unused import') || 
      issue.message?.includes('never used')
    ).length;
    analysis.unusedImports = unusedImportCount > 0 
      ? [`${unusedImportCount} unused imports detected`] 
      : [];

    const duplicateImportCount = issues.filter(issue => 
      issue.message?.includes('duplicate import') || 
      issue.message?.includes('already imported')
    ).length;
    analysis.duplicateImports = duplicateImportCount > 0
      ? [`${duplicateImportCount} duplicate imports detected`]
      : [];

    // Extract specific issues
    analysis.issues = issues.map(issue => issue.message).filter(Boolean) as string[];

    // FIX 2: Handle severity comparison properly
    analysis.errors = issues
      .filter(issue => 
        issue.severity === 'high' || 
        issue.message?.toLowerCase().includes('error') ||
        issue.message?.toLowerCase().includes('cannot find')
      )
      .map(issue => issue.message)
      .filter(Boolean) as string[];
    
    // Find suggested fixes for this file
    analysis.suggestedFixes = this.importFixes.filter(fix => fix.filePath === filePath);

    // Calculate bundle impact
    analysis.bundleImpact = this.calculateBundleImpact(analysis);

    return analysis;
  }

  private parseImportLines(importLines: string[]): ParsedImport[] {
    return importLines.map((line, index) => {
      const importPath = this.extractImportPath(line);
      
      // Parse imports using existing logic from ImportFixerService
      const parsedImport: ParsedImport = {
        fullLine: line,
        importPath: importPath,
        namedImports: [],
        defaultImport: undefined,
        isTypeOnly: line.includes('import type'),
        lineNumber: index + 1
      };

      // Extract named imports
      const namedMatch = line.match(/{([^}]*)}/);
      if (namedMatch) {
        parsedImport.namedImports = namedMatch[1]
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }

      // Extract default import
      const defaultMatch = line.match(/import\s+([^{}\s]+)(?:\s+from|\s*,|\s*;)/);
      if (defaultMatch && !line.includes('{')) {
        parsedImport.defaultImport = defaultMatch[1];
      }

      return parsedImport;
    });
  }

  private extractImportPath(importLine: string): string {
    const match = importLine.match(/from\s+['"]([^'"]+)['"]/);
    return match ? match[1] : '';
  }

  private isExternalImport(importPath: string): boolean {
    return !importPath.startsWith('.') && 
           !importPath.startsWith('@/') && 
           !importPath.startsWith('~/');
  }

  private isRelativeImport(importPath: string): boolean {
    return importPath.startsWith('.');
  }

  private isAbsoluteImport(importPath: string): boolean {
    return importPath.startsWith('@/') || importPath.startsWith('~/');
  }

  private isDeepImport(importPath: string): boolean {
    // Count ../ segments for depth analysis
    const depth = (importPath.match(/\.\.\//g) || []).length;
    return depth >= 3;
  }

  private calculateBundleImpact(analysis: ImportAnalysis): 'low' | 'medium' | 'high' {
      let score = 0;
      
      if (analysis.externalImports > 10) score += 2;
      if (analysis.wildcardImports > 5) score += 2;
      if (analysis.deepImports > 3) score += 1;
      if (analysis.unusedImports.length > 5) score += 1; // Use .length

      if (score >= 4) return 'high';
      if (score >= 2) return 'medium';
      return 'low';
  }

  private buildRelationshipGraph(): void {
    this.importAnalysis.forEach((analysis, filePath) => {
      analysis.importLines.forEach(importLine => {
        const importPath = this.extractImportPath(importLine);
        if (importPath && !this.isExternalImport(importPath)) {
          // Resolve the actual target file path
          let targetPath = importPath;
          if (this.isRelativeImport(importPath)) {
            targetPath = path.resolve(path.dirname(filePath), importPath);
          }

          this.relationships.push({
            source: filePath,
            target: targetPath,
            type: this.isExternalImport(importPath) ? 'external' : 'internal',
            frequency: 1
          });
        }
      });
    });

    // Consolidate duplicates
    const consolidated = new Map<string, ImportRelationship>();
    this.relationships.forEach(rel => {
      const key = `${rel.source}->${rel.target}`;
      if (consolidated.has(key)) {
        consolidated.get(key)!.frequency++;
      } else {
        consolidated.set(key, rel);
      }
    });

    this.relationships = Array.from(consolidated.values());
  }

async generateImportReport(outputPath?: string): Promise<string> {
  const analysisArray = Array.from(this.importAnalysis.values());
  const totalFiles = analysisArray.length;
  const totalImports = analysisArray.reduce((sum, a) => sum + a.totalImports, 0);
  const fixRecommendations = this.generateImportFixRecommendations();

  const totalUnusedImports = analysisArray.reduce(
    (sum, a) => sum + a.unusedImports.length,
    0
  );

  const totalDuplicateImports = analysisArray.reduce(
    (sum, a) => sum + a.duplicateImports.length,
    0
  );

  const FILE_COL_WIDTH = 47;
  const TOTAL_COL_WIDTH = 13;
  const ISSUES_COL_WIDTH = 8;
  const IMPACT_COL_WIDTH = 13;

  const pad = (
    value: string | number,
    width: number,
    align: 'left' | 'right' = 'left'
  ): string =>
    align === 'right'
      ? String(value).padStart(width, ' ')
      : String(value).padEnd(width, ' ');

  const issuesTable = [
    '## 🚨 Import Issues by File',
    '',
    `${pad('File', FILE_COL_WIDTH)}  ${pad('Total Imports', TOTAL_COL_WIDTH, 'right')}   ${pad('Issues', ISSUES_COL_WIDTH, 'right')}   ${pad('Bundle Impact', IMPACT_COL_WIDTH)}`,
    `${'-'.repeat(FILE_COL_WIDTH)}  ${'-'.repeat(TOTAL_COL_WIDTH)}   ${'-'.repeat(ISSUES_COL_WIDTH)}   ${'-'.repeat(IMPACT_COL_WIDTH)}`,
    ...analysisArray
      .filter(a => a.issues.length > 0 || a.unusedImports.length > 0)
      .sort((a, b) => b.issues.length - a.issues.length)
      .map(a =>
        `${pad(
          path.relative(process.cwd(), a.filePath),
          FILE_COL_WIDTH
        )}  ${pad(a.totalImports, TOTAL_COL_WIDTH, 'right')}   ${pad(a.issues.length, ISSUES_COL_WIDTH, 'right')}   ${pad(a.bundleImpact, IMPACT_COL_WIDTH)}`
      ),
    ''
  ];

  const report = [
    '# 📦 Import Analysis Report',
    '',
    `**Generated:** ${new Date().toISOString()}`,
    `**Files Analyzed:** ${totalFiles}`,
    `**Total Imports:** ${totalImports}`,
    `**Import Fixes Needed:** ${this.importFixes.length}`,
    '',
    '## 📊 Import Summary',
    '',
    '### Import Distribution',
    `- **External Imports:** ${analysisArray.reduce((s, a) => s + a.externalImports, 0)}`,
    `- **Internal Imports:** ${analysisArray.reduce((s, a) => s + a.internalImports, 0)}`,
    `- **Relative Imports:** ${analysisArray.reduce((s, a) => s + a.relativeImports, 0)}`,
    `- **Absolute Imports:** ${analysisArray.reduce((s, a) => s + a.absoluteImports, 0)}`,
    `- **Wildcard Imports:** ${analysisArray.reduce((s, a) => s + a.wildcardImports, 0)}`,
    `- **Deep Imports (3+ levels):** ${analysisArray.reduce((s, a) => s + a.deepImports, 0)}`,
    '',
    '### Issues Summary',
    `- **Unused Imports:** ${totalUnusedImports}`,
    `- **Duplicate Imports:** ${totalDuplicateImports}`,
    `- **Files with High Bundle Impact:** ${analysisArray.filter(a => a.bundleImpact === 'high').length}`,
    '',
    ...issuesTable,
    '## 🔧 Recommended Import Fixes',
    '',
    ...(fixRecommendations.length > 0
      ? fixRecommendations
      : ['No import fixes are required at this time.']),
    '',
    '## 📈 Bundle Impact Analysis',
    '',
    ...this.generateBundleImpactAnalysis(),
    '',
    '## 🔗 Import Relationships',
    '',
    ...this.generateRelationshipAnalysis(),
    '',
    '## 🛠️ Quick Import Fixes',
    '',
    ...this.generateQuickImportFixes()
  ].join('\n');

  if (outputPath) {
    const fullPath = path.resolve(process.cwd(), outputPath);
    await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.promises.writeFile(fullPath, report, 'utf8');
    console.log(`📦 Import report saved to: ${fullPath}`);
  }

  return report;
}

  
  private generateImportFixRecommendations(): string[] {
    const recommendations: string[] = [];
    const analysisArray = Array.from(this.importAnalysis.values());

    // Deep imports recommendation
    const deepImportFiles = analysisArray.filter(a => a.deepImports > 0);
    if (deepImportFiles.length > 0) {
      recommendations.push(
        '### Deep Relative Imports',
        `Found ${deepImportFiles.length} files with deep relative imports (3+ levels of ../)`,
        '**Recommendation:** Set up path aliases in your TypeScript config',
        '```json',
        '{',
        '  "compilerOptions": {',
        '    "paths": {',
        '      "@/*": ["./src/*"],',
        '      "@/components/*": ["./src/app/components/*"]',
        '    }',
        '  }',
        '}',
        '```',
        ''
      );
    }

    // Wildcard imports recommendation
    const wildcardFiles = analysisArray.filter(a => a.wildcardImports > 0);
    if (wildcardFiles.length > 0) {
      recommendations.push(
        '### Wildcard Imports',
        `Found ${wildcardFiles.length} files using wildcard imports`,
        '**Recommendation:** Use named imports for better tree shaking',
        '```typescript',
        '// Instead of:',
        'import * as React from "react";',
        '// Use:',
        'import { useState, useEffect } from "react";',
        '```',
        ''
      );
    }

    // Unused imports recommendation
    const unusedImportFiles = analysisArray.filter(a => a.unusedImports.length > 0); // Use .length
    if (unusedImportFiles.length > 0) {
      const totalUnusedCount = unusedImportFiles.reduce((sum, a) => sum + a.unusedImports.length, 0); // Use .length
      recommendations.push(
        '### Unused Imports',
        `Found ${totalUnusedCount} unused imports across ${unusedImportFiles.length} files`,
        '**Recommendation:** Run ESLint with --fix or use IDE auto-import features',
        '```bash',
        'npx eslint --fix src/',
        '# or configure your IDE to organize imports on save',
        '```',
        ''
      );
    }

    return recommendations.flat();
  }

  private generateBundleImpactAnalysis(): string[] {
    const analysisArray = Array.from(this.importAnalysis.values());
    const highImpactFiles = analysisArray.filter(a => a.bundleImpact === 'high');
    
    if (highImpactFiles.length === 0) {
      return ['✅ No high bundle impact files detected.'];
    }

    return [
      `**High Bundle Impact Files:** ${highImpactFiles.length}`,
      '',
      '| File | External Imports | Wildcard Imports | Deep Imports |',
      '|------|------------------|------------------|--------------|',
      ...highImpactFiles.map(analysis => 
        `| ${path.relative(process.cwd(), analysis.filePath)} | ${analysis.externalImports} | ${analysis.wildcardImports} | ${analysis.deepImports} |`
      ),
      '',
      '**Recommendations:**',
      '- Use dynamic imports for heavy libraries',
      '- Implement code splitting for large components',
      '- Audit third-party library usage',
      '- Consider lighter alternatives for heavy dependencies'
    ];
  }

  private generateRelationshipAnalysis(): string[] {
    const internalRelationships = this.relationships.filter(r => r.type === 'internal');
    const externalRelationships = this.relationships.filter(r => r.type === 'external');
    
    // Find circular dependency patterns
    const circularCandidates = this.findCircularCandidates();

    return [
      `**Internal Dependencies:** ${internalRelationships.length}`,
      `**External Dependencies:** ${externalRelationships.length}`,
      `**Circular Dependency Candidates:** ${circularCandidates.length}`,
      '',
      '### Most Used Internal Dependencies',
      ...internalRelationships
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10)
        .map(rel => `- ${path.relative(process.cwd(), rel.source)} → ${path.relative(process.cwd(), rel.target)} (${rel.frequency}x)`),
      '',
      '### External Dependencies Frequency',
      ...this.analyzeExternalDependencies()
        .slice(0, 10)
        .map(([lib, count]) => `- ${lib}: ${count} imports`)
    ];
  }

  private findCircularCandidates(): string[] {
    const candidates: string[] = [];
    
    this.relationships.forEach(rel1 => {
      this.relationships.forEach(rel2 => {
        if (rel1.source === rel2.target && rel1.target === rel2.source) {
          const pair = `${rel1.source} <-> ${rel1.target}`;
          if (!candidates.includes(pair)) {
            candidates.push(pair);
          }
        }
      });
    });

    return candidates;
  }

  private analyzeExternalDependencies(): [string, number][] {
    const externalCounts = new Map<string, number>();
    
    this.relationships
      .filter(rel => rel.type === 'external')
      .forEach(rel => {
        const lib = rel.target.split('/')[0]; // Get package name
        externalCounts.set(lib, (externalCounts.get(lib) || 0) + rel.frequency);
      });

    return Array.from(externalCounts.entries()).sort((a, b) => b[1] - a[1]);
  }

  private generateQuickImportFixes(): string[] {
    if (this.importFixes.length === 0) {
      return ['✅ No import fixes needed.'];
    }

    return [
      '### Auto-fixable Import Issues',
      '',
      'These imports can be fixed automatically using the ImportFixerService:',
      '',
      ...this.importFixes.map((fix, index) => [
        `#### ${index + 1}. ${fix.missingTypes.join(', ')}`,
        `**File:** ${path.relative(process.cwd(), fix.filePath)}`,
        `**Current:** ${fix.originalLine || 'MISSING'}`,
        `**Fixed:** ${fix.newLine}`,
        ''
      ]).flat()
    ];
  }

  /** Push a pre-built analysis into the report (external tooling) */
  public addAnalysis(analysis: ImportAnalysis): void {
    this.importAnalysis.set(analysis.filePath, analysis);
  }

  async generateVisualImportReport(outputPath?: string): Promise<string> {
    const analysisArray = Array.from(this.importAnalysis.values());
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Import Analysis Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .impact-high { border-left: 4px solid #dc3545; }
        .impact-medium { border-left: 4px solid #ffc107; }
        .impact-low { border-left: 4px solid #20c997; }
        .chart-container { margin: 30px 0; background: white; padding: 20px; border-radius: 8px; }
        .file-list { max-height: 400px; overflow-y: auto; margin: 20px 0; }
        .file-item { padding: 10px; border-bottom: 1px solid #eee; }
    </style>
</head>
<body>
    <h1>📦 Import Analysis Report</h1>
    
    <div class="metric-grid">
        <div class="metric-card">
            <h3>Files Analyzed</h3>
            <p style="font-size: 2em;">${analysisArray.length}</p>
        </div>
        <div class="metric-card">
            <h3>Total Imports</h3>
            <p style="font-size: 2em;">${analysisArray.reduce((sum, a) => sum + a.totalImports, 0)}</p>
        </div>
        <div class="metric-card">
            <h3>Import Fixes</h3>
            <p style="font-size: 2em;">${this.importFixes.length}</p>
        </div>
        <div class="metric-card">
            <h3>High Impact</h3>
            <p style="font-size: 2em;">${analysisArray.filter(a => a.bundleImpact === 'high').length}</p>
        </div>
    </div>

    <div class="chart-container">
        <canvas id="importChart" width="400" height="200"></canvas>
    </div>

    <h2>Files with Import Issues</h2>
    <div class="file-list">
        ${analysisArray
          .filter(a => a.issues.length > 0)
          .map(analysis => `
            <div class="file-item impact-${analysis.bundleImpact}">
                <strong>${path.relative(process.cwd(), analysis.filePath)}</strong><br>
                <small>Imports: ${analysis.totalImports} | Issues: ${analysis.issues.length} | Impact: ${analysis.bundleImpact}</small>
            </div>
          `).join('')}
    </div>

    <script>
        const ctx = document.getElementById('importChart').getContext('2d');
        const importData = {
            external: ${analysisArray.reduce((sum, a) => sum + a.externalImports, 0)},
            internal: ${analysisArray.reduce((sum, a) => sum + a.internalImports, 0)},
            relative: ${analysisArray.reduce((sum, a) => sum + a.relativeImports, 0)},
            absolute: ${analysisArray.reduce((sum, a) => sum + a.absoluteImports, 0)},
            wildcard: ${analysisArray.reduce((sum, a) => sum + a.wildcardImports, 0)}
        };
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['External', 'Internal', 'Relative', 'Absolute', 'Wildcard'],
                datasets: [{
                    data: [importData.external, importData.internal, importData.relative, importData.absolute, importData.wildcard],
                    backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Import Type Distribution'
                    }
                }
            }
        });
    </script>
</body>
</html>
    `.trim();

    if (outputPath) {
      const fullPath = path.resolve(process.cwd(), outputPath);
      await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.promises.writeFile(fullPath, html, 'utf8');
      console.log(`📦 Visual import report saved to: ${fullPath}`);
    }

    return html;
  }

  getImportAnalysis(): Map<string, ImportAnalysis> {
    return this.importAnalysis;
  }

  getRelationships(): ImportRelationship[] {
    return this.relationships;
  }

  getFilesWithHighBundleImpact(): string[] {
    return Array.from(this.importAnalysis.entries())
      .filter(([_, analysis]) => analysis.bundleImpact === 'high')
      .map(([filePath]) => filePath);
  }

  async saveImportData(outputPath: string): Promise<void> {
    const importData = {
      generated: new Date().toISOString(),
      summary: {
        totalFiles: this.importAnalysis.size,
        totalImports: Array.from(this.importAnalysis.values()).reduce((sum, a) => sum + a.totalImports, 0),
        filesWithIssues: Array.from(this.importAnalysis.values()).filter(a => a.issues.length > 0).length,
        importFixes: this.importFixes.length
      },
      files: Object.fromEntries(this.importAnalysis),
      relationships: this.relationships,
      fixes: this.importFixes
    };

    const fullPath = path.resolve(process.cwd(), outputPath);
    await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.promises.writeFile(fullPath, JSON.stringify(importData, null, 2), 'utf8');
    console.log(`💾 Import data saved to: ${fullPath}`);
  }

}