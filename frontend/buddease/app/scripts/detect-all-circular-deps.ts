// scripts/comprehensive-circular-detection.ts
import { TypeScriptDependencyAnalyzer } from '@/app/scripts/analyzeDependencies';
import { TypeScriptDuplicateAnalyzer } from '@/app/scripts/analyzeDuplicates';
import { generateRoadmaps } from '@/app/scripts/generateRoadmaps';
import { CircularDependency, CircularDependencyDetector } from '@/core/generators/corrections/CircularDependencyDetector';
import { ImportErrorSummaryGenerator } from '@/core/generators/corrections/ImportErrorSummary';
import { TypeRelationshipMapper } from '@/core/generators/corrections/TypeRelationshipMapper';
import { ImportReport } from '@/core/generators/corrections/reports/ImportReport';
import fs from 'fs';
import path from 'path';

interface ComprehensiveDetectionResult {
  compilerBased: any[];
  projectStructureBased: any[];
  importRelationshipBased: any[];
  typeHierarchyBased: any[];
  duplicateAnalysisBased: any[];
  dependencyAnalysisBased: any[];
  mergedResults: {
    cycles: Array<{
      type: string;
      cycle: string[];
      files: string[];
      severity: string;
      detectionMethod: string;
      confidence: number;
    }>;
    total: number;
    bySeverity: Record<string, number>;
    byDetectionMethod: Record<string, number>;
  };
}

class ComprehensiveCircularDetector {
  private importReport?: ImportReport;
  private typeMapper?: TypeRelationshipMapper;
  private duplicateAnalyzer?: TypeScriptDuplicateAnalyzer;
  private dependencyAnalyzer?: TypeScriptDependencyAnalyzer;
  private importErrorGenerator: ImportErrorSummaryGenerator;

  constructor() {
    this.importErrorGenerator = new ImportErrorSummaryGenerator();
  }


  private async useImportErrorSummaryGenerator(): Promise<CircularDependency[]> {
    try {
      // Use the detectCircularDependencies method directly
      const circularErrors = await this.importErrorGenerator.detectCircularDependencies();
      
      // Convert ImportError[] to CircularDependency[]
      return circularErrors.map(error => ({
        type: 'circular-import',
        file: error.filePath,
        message: error.importPath,
        severity: error.severity === 'high' ? 'high' : 
                 error.severity === 'medium' ? 'medium' : 'low',
        detectionMethod: 'import-error-summary',
        suggestedFix: error.suggestedFix,
        resolution: error.resolution
      }));
    } catch (error) {
      console.warn('⚠️ ImportErrorSummaryGenerator failed:', 
        error instanceof Error ? error.message : String(error));
      return [];
    }
  }
  async detectAllCircularDependencies(): Promise<ComprehensiveDetectionResult> {
    console.log('🚀 COMPREHENSIVE CIRCULAR DEPENDENCY DETECTION\n');
    console.log('Using 6 different detection strategies...\n');

    // Define the proper types for each array
    const results: ComprehensiveDetectionResult = {
      compilerBased: [],
      projectStructureBased: [],
      importRelationshipBased: [],
      typeHierarchyBased: [],
      duplicateAnalysisBased: [],
      dependencyAnalysisBased: [],
      mergedResults: {
        cycles: [],
        total: 0,
        bySeverity: {},
        byDetectionMethod: {}
      }
    };

    // STRATEGY 1: TypeScript Compiler Analysis (from fix-strategy)
    console.log('1️⃣ Strategy 1: TypeScript Compiler Error Analysis...');
    results.compilerBased = await this.runTypeScriptAnalysis();
    
    // STRATEGY 2: Project Structure Analysis
    console.log('\n2️⃣ Strategy 2: Project Structure Analysis...');
    results.projectStructureBased = await this.analyzeProjectStructure();
    
    // STRATEGY 3: Import Relationship Analysis
    console.log('\n3️⃣ Strategy 3: Import Relationship Analysis...');
    results.importRelationshipBased = await this.analyzeImportRelationships();
    
    // STRATEGY 4: Type Hierarchy Analysis
    console.log('\n4️⃣ Strategy 4: Type Hierarchy Analysis...');
    results.typeHierarchyBased = await this.analyzeTypeHierarchies();
    
    // STRATEGY 5: Duplicate Type Analysis
    console.log('\n5️⃣ Strategy 5: Duplicate Type Analysis...');
    results.duplicateAnalysisBased = await this.analyzeDuplicates();
    
    // STRATEGY 6: Dependency Graph Analysis
    console.log('\n6️⃣ Strategy 6: Dependency Graph Analysis...');
    results.dependencyAnalysisBased = await this.analyzeDependencies();

    // Merge all results
    results.mergedResults = this.mergeAllResults(results);
    
    return results;
  }

  private async runTypeScriptAnalysis(): Promise<any[]> {
    try {
      // Use the EnhancedFixStrategy from fix-strategy.ts
      const { EnhancedFixStrategy } = await import('@/app/error-analyzer/fix-strategy');
      const analyzer = new EnhancedFixStrategy();
      const analysis = await analyzer.analyzeTypeScriptErrors();
      
      // Extract circular dependency errors
      const circularErrors: any[] = []; // Explicitly type as any[]
      
      if (analysis.totalErrors > 0) {
        // Look for circular dependency patterns in errors
        analysis.topFiles.forEach(file => {
          file.errors.forEach(error => {
            if (error.message?.includes('circular') || 
                error.message?.includes('Maximum call stack') ||
                error.message?.includes('RangeError')) {
              circularErrors.push({
                type: 'compiler',
                file: file.path,
                message: error.message,
                severity: 'critical',
                detectionMethod: 'typescript-compiler'
              });
            }
          });
        });
      }
      
      return circularErrors;
    } catch (error) {
      // Type-safe error handling
      console.warn('⚠️ TypeScript analysis failed:', 
        error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  private async analyzeProjectStructure(): Promise<any[]> {
    try {
      // Get project structure from generateRoadmaps
      const roadmapResult = await generateRoadmaps(
        "Circular Dependency Analysis",
        "./temp-analysis"
      );
      
      if (!roadmapResult.projectStructure) {
        return [];
      }
      
      // Use CircularDependencyDetector
      const detector = new CircularDependencyDetector();
      const report = await detector.detectCircularDependencies(roadmapResult.projectStructure);
      
      // Extract circular dependencies from report
      const cycles = [];
      
      // Collect from all issue categories
      ['criticalIssues', 'highPriorityIssues', 'mediumPriorityIssues', 'lowPriorityIssues'].forEach(category => {
        if (report[category] && Array.isArray(report[category])) {
          report[category].forEach(issue => {
            cycles.push({
              type: 'project-structure',
              cycle: issue.cycle || [],
              files: issue.files || [],
              description: issue.description || 'Circular dependency detected',
              severity: issue.severity || 'medium',
              detectionMethod: 'project-structure'
            });
          });
        }
      });
      
      return cycles;
    } catch (error) {
      console.warn('⚠️ Project structure analysis failed:', error.message);
      return [];
    }
  }

  private async analyzeImportRelationships(): Promise<any[]> {
    try {
      // Use ImportReport to find circular imports
      const issues = []; // You'd need to get actual import issues from somewhere
      this.importReport = new ImportReport(issues);
      
      // Get relationships from ImportReport
      const relationships = this.importReport.getRelationships();
      
      // Find circular patterns in relationships
      const circularImports = this.findCircularImports(relationships);
      
      return circularImports.map(circular => ({
        type: 'import',
        cycle: [circular.source, circular.target],
        files: [circular.source, circular.target],
        description: `Circular import: ${path.basename(circular.source)} ↔ ${path.basename(circular.target)}`,
        severity: 'high',
        detectionMethod: 'import-relationships'
      }));
    } catch (error) {
      console.warn('⚠️ Import relationship analysis failed:', error.message);
      return [];
    }
  }

  private findCircularImports(relationships: any[]): any[] {
    const circular: any[] = [];
    
    for (let i = 0; i < relationships.length; i++) {
      for (let j = i + 1; j < relationships.length; j++) {
        const rel1 = relationships[i];
        const rel2 = relationships[j];
        
        if (rel1.source === rel2.target && rel1.target === rel2.source) {
          circular.push(rel1);
        }
      }
    }
    
    return circular;
  }

  private async analyzeTypeHierarchies(): Promise<any[]> {
    try {
      // Get project structure
      const roadmapResult = await generateRoadmaps(
        "Type Hierarchy Analysis",
        "./temp-type-analysis"
      );
      
      if (!roadmapResult.projectStructure) {
        return [];
      }
      
      // Use TypeRelationshipMapper
      this.typeMapper = new TypeRelationshipMapper();
      const hierarchies = await this.typeMapper.mapTypeRelationships(roadmapResult.projectStructure);
      
      // Find circular dependencies in type hierarchies
      const circularTypes = this.typeMapper.findCircularDependencies();
      
      return circularTypes.map(typeName => ({
        type: 'type-hierarchy',
        cycle: [typeName],
        files: [this.getFileForType(typeName, hierarchies)],
        description: `Circular type dependency: ${typeName}`,
        severity: 'critical',
        detectionMethod: 'type-hierarchy'
      }));
    } catch (error) {
      console.warn('⚠️ Type hierarchy analysis failed:', error.message);
      return [];
    }
  }

  private getFileForType(typeName: string, hierarchies: Map<string, any>): string {
    // Find the file containing this type
    for (const [root, hierarchy] of hierarchies) {
      const found = this.searchHierarchy(hierarchy, typeName);
      if (found) {
        return found.file;
      }
    }
    return 'unknown';
  }

  private searchHierarchy(hierarchy: any, typeName: string): any {
    if (hierarchy.root.name === typeName) {
      return hierarchy.root;
    }
    
    for (const child of hierarchy.children) {
      const found = this.searchHierarchy(child, typeName);
      if (found) {
        return found;
      }
    }
    
    return null;
  }

  private async analyzeDuplicates(): Promise<any[]> {
    try {
      this.duplicateAnalyzer = new TypeScriptDuplicateAnalyzer();
      const report = await this.duplicateAnalyzer.analyzeProject();
      
      // Convert duplicate findings to circular dependency suspects
      const suspects = [];
      
      // If the same type name appears in multiple files, it could cause circular issues
      const { interfaces, types, classes, enums } = report.duplicates;
      
      [interfaces, types, classes, enums].forEach(map => {
        map.forEach((files, name) => {
          if (files.length > 1) {
            suspects.push({
              type: 'duplicate',
              cycle: [name],
              files: files,
              description: `Duplicate ${name} found in ${files.length} files - could cause circular references`,
              severity: 'medium',
              detectionMethod: 'duplicate-analysis'
            });
          }
        });
      });
      
      return suspects;
    } catch (error) {
      console.warn('⚠️ Duplicate analysis failed:', error.message);
      return [];
    }
  }

  private async analyzeDependencies(): Promise<any[]> {
    try {
      this.dependencyAnalyzer = new TypeScriptDependencyAnalyzer();
      const graph = await this.dependencyAnalyzer.analyzeDependencies();
      
      // Extract circular dependencies from dependency graph
      const cycles = graph.circularDependencies.map(circular => ({
        type: 'dependency-graph',
        cycle: circular.split(' -> '),
        files: this.findFilesForTypes(circular.split(' -> ')),
        description: `Circular dependency in inheritance: ${circular}`,
        severity: 'high',
        detectionMethod: 'dependency-graph'
      }));
      
      return cycles;
    } catch (error) {
      console.warn('⚠️ Dependency analysis failed:', error.message);
      return [];
    }
  }

  private findFilesForTypes(typeNames: string[]): string[] {
    // This would need actual implementation to map types to files
    // For now, return placeholders
    return typeNames.map(name => `src/types/${name}.ts`);
  }

  private mergeAllResults(results: any): any {
    const allCycles = [
      ...results.compilerBased,
      ...results.projectStructureBased,
      ...results.importRelationshipBased,
      ...results.typeHierarchyBased,
      ...results.duplicateAnalysisBased,
      ...results.dependencyAnalysisBased
    ];

    // Deduplicate cycles
    const uniqueCycles = this.deduplicateCycles(allCycles);
    
    // Calculate statistics
    const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
    const byDetectionMethod = {};
    
    uniqueCycles.forEach(cycle => {
      bySeverity[cycle.severity] = (bySeverity[cycle.severity] || 0) + 1;
      byDetectionMethod[cycle.detectionMethod] = (byDetectionMethod[cycle.detectionMethod] || 0) + 1;
    });

    return {
      cycles: uniqueCycles,
      total: uniqueCycles.length,
      bySeverity,
      byDetectionMethod
    };
  }

  private deduplicateCycles(cycles: any[]): any[] {
    const seen = new Set<string>();
    const unique: any[] = [];
    
    cycles.forEach(cycle => {
      // Create a normalized key for comparison
      const key = JSON.stringify({
        cycle: cycle.cycle.sort(),
        type: cycle.type,
        files: cycle.files.sort()
      });
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(cycle);
      }
    });
    
    return unique;
  }

  async generateComprehensiveReport(results: ComprehensiveDetectionResult): Promise<string> {
    const { mergedResults } = results;
    
    const lines: string[] = [];
    
    lines.push('# 🚨 COMPREHENSIVE CIRCULAR DEPENDENCY ANALYSIS REPORT');
    lines.push('');
    lines.push(`**Generated:** ${new Date().toISOString()}`);
    lines.push(`**Total Unique Circular Dependencies Found:** ${mergedResults.total}`);
    lines.push('');
    
    lines.push('## 📊 Detection Overview');
    lines.push('');
    lines.push('### Detection Methods Used:');
    lines.push('| Method | Count |');
    lines.push('|--------|-------|');
    
    Object.entries(mergedResults.byDetectionMethod).forEach(([method, count]) => {
      lines.push(`| ${method} | ${count} |`);
    });
    
    lines.push('');
    lines.push('### Severity Breakdown:');
    lines.push('| Severity | Count |');
    lines.push('|----------|-------|');
    
    Object.entries(mergedResults.bySeverity).forEach(([severity, count]) => {
      lines.push(`| ${severity} | ${count} |`);
    });
    
    lines.push('');
    lines.push('## 🔍 Detailed Findings by Detection Method');
    lines.push('');
    
    // Group by detection method
    const byMethod = new Map();
    mergedResults.cycles.forEach(cycle => {
      if (!byMethod.has(cycle.detectionMethod)) {
        byMethod.set(cycle.detectionMethod, []);
      }
      byMethod.get(cycle.detectionMethod).push(cycle);
    });
    
    byMethod.forEach((cycles, method) => {
      lines.push(`### ${method.toUpperCase()}`);
      lines.push('');
      
      cycles.forEach((cycle, index) => {
        lines.push(`**${index + 1}. ${cycle.description}**`);
        lines.push(`- **Type:** ${cycle.type}`);
        lines.push(`- **Severity:** ${cycle.severity}`);
        lines.push(`- **Files:**`);
        cycle.files.forEach(file => {
          lines.push(`  - ${path.relative(process.cwd(), file) || file}`);
        });
        lines.push('');
      });
    });
    
    lines.push('## 🛠️ Action Plan');
    lines.push('');
    lines.push('### Phase 1: Critical Issues (Day 1)');
    lines.push('1. Fix all compiler-detected circular dependencies first');
    lines.push('2. Resolve critical type hierarchy cycles');
    lines.push('3. Address high-severity import cycles');
    lines.push('');
    lines.push('### Phase 2: Structural Issues (Week 1)');
    lines.push('1. Break circular inheritance chains');
    lines.push('2. Fix duplicate type definitions');
    lines.push('3. Refactor problematic import patterns');
    lines.push('');
    lines.push('### Phase 3: Prevention (Ongoing)');
    lines.push('1. Add circular dependency detection to CI/CD');
    lines.push('2. Review new type definitions');
    lines.push('3. Regular dependency audits');
    
    return lines.join('\n');
  }

  async saveAllData(results: ComprehensiveDetectionResult): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = `reports/comprehensive-circular-${timestamp}`;
    
    fs.mkdirSync(outputDir, { recursive: true });
    
    // Save comprehensive report
    const report = await this.generateComprehensiveReport(results);
    fs.writeFileSync(path.join(outputDir, '01-comprehensive-report.md'), report);
    
    // Save raw results
    fs.writeFileSync(
      path.join(outputDir, '02-raw-results.json'),
      JSON.stringify(results, null, 2)
    );
    
    // Save merged results
    fs.writeFileSync(
      path.join(outputDir, '03-merged-cycles.json'),
      JSON.stringify(results.mergedResults, null, 2)
    );
    
    console.log(`📊 Reports saved to: ${outputDir}/`);
  }
}

// Run the comprehensive detector
async function main() {
  console.log('🚀 Starting Comprehensive Circular Dependency Detection');
  console.log('========================================================\n');
  
  const detector = new ComprehensiveCircularDetector();
  
  try {
    const results = await detector.detectAllCircularDependencies();
    
    console.log('\n🎯 DETECTION COMPLETE');
    console.log('====================');
    console.log(`Total Unique Circular Dependencies: ${results.mergedResults.total}`);
    console.log('');
    console.log('Detection Methods Results:');
    console.log('--------------------------');
    Object.entries(results.mergedResults.byDetectionMethod).forEach(([method, count]) => {
      console.log(`${method}: ${count}`);
    });
    
    console.log('');
    console.log('Severity Breakdown:');
    console.log('-------------------');
    Object.entries(results.mergedResults.bySeverity).forEach(([severity, count]) => {
      console.log(`${severity}: ${count}`);
    });
    
    // Save all data
    await detector.saveAllData(results);
    
    // Generate quick action plan
    console.log('\n🚀 QUICK ACTION PLAN');
    console.log('===================');
    
    const criticalIssues = results.mergedResults.cycles.filter(c => c.severity === 'critical');
    if (criticalIssues.length > 0) {
      console.log(`1. Fix ${criticalIssues.length} CRITICAL issues (blocking compilation):`);
      criticalIssues.slice(0, 3).forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue.description}`);
      });
    }
    
    const highIssues = results.mergedResults.cycles.filter(c => c.severity === 'high');
    if (highIssues.length > 0) {
      console.log(`2. Fix ${highIssues.length} HIGH priority issues:`);
      highIssues.slice(0, 2).forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue.description}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Comprehensive detection failed:', error);
  }
}

if (require.main === module) {
  main();
}

export { ComprehensiveCircularDetector, main };
