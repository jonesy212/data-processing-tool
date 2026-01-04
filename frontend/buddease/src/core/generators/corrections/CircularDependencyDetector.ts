// CircularDependencyDetector.ts
import type { InterfaceInfo } from '@/core/generators/ApiCodeGenerator';
import type ApiMethod from '@/core/generators/ApiCodeGenerator';
import UniqueIDGenerator from "@/core/generators/GenerateUniqueIds";
import type { ProjectStructure } from '@/core/scripts/generateRoadmaps';
import fs from 'fs';
import path from 'path';

interface DependencyNode {
  name: string;
  file: string;
  dependencies: string[];
  type: 'interface' | 'type' | 'class' | 'component' | 'function';
  extends?: string[];
  properties?: Array<{name: string, type: string}>;
  generics?: string[];
}

export interface CircularDependency {
  id: string;
  cycle: string[];
  files: string[];
  severity: 'high' | 'medium' | 'low' | 'critical';
  description: string;
  type: 'import' | 'type' | 'generic' | 'inheritance';
  impact: 'compilation' | 'runtime' | 'performance' | 'maintenance';
  rootCauseFile: string;
  rootCauseLine?: number;
  suggestedFixes: string[];
  complexity: number; // 1-10 scale
  priority: number; // Calculated priority score
  folder: string;
  fileName: string;
}

interface OrganizedReport {
  circularDependencies: string[];
  summary: {
    total: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    byImpact: Record<string, number>;
    byFolder: Record<string, number>;
  };
  criticalIssues: CircularDependency[];
  highPriorityIssues: CircularDependency[];
  mediumPriorityIssues: CircularDependency[];
  lowPriorityIssues: CircularDependency[];
  folderBreakdown: Record<string, CircularDependency[]>;
  fileBreakdown: Record<string, CircularDependency[]>;
  quickFixes: Array<{
    action: string;
    files: string[];
    estimatedTime: string;
    priority: number;
  }>;
  detailedAnalysis: Array<{
    folder: string;
    issues: number;
    criticalIssues: number;
    files: string[];
  }>;
}


type QuickFix = {
  action: string;
  files: string[];
  estimatedTime: string;
  priority: number;
};


export class CircularDependencyDetector {
  private dependencyGraph: Map<string, DependencyNode> = new Map();
  private visited: Set<string> = new Set();
  private recursionStack: Set<string> = new Set();
  private circularDependencies: CircularDependency[] = [];

  async detectCircularDependencies(projectStructure: ProjectStructure): Promise<OrganizedReport> {
    console.log('🔄 Detecting circular dependencies...');
    
    // Build enhanced dependency graph
    await this.buildEnhancedDependencyGraph(projectStructure);
    
    // Detect all types of circular dependencies
    this.findImportCircularDependencies();
    await this.findTypeCircularDependencies();
    await this.findGenericCircularDependencies();
    await this.findInheritanceCircularDependencies();
    
    // Filter out excessive stack depth issues
    const excessiveStackIssues = await this.findExcessiveStackDepthIssues();
    this.circularDependencies.push(...excessiveStackIssues);
    
    // Calculate priorities and organize
    this.calculatePriorities();
    this.analyzeRootCauses();
 
    console.log(`🌀 Found ${this.circularDependencies.length} circular dependencies`);
    
    // Return simple list of types involved in circular dependencies
    return this.generateOrganizedReport();
  }



  private calculatePriorities(): void {
    this.circularDependencies.forEach(issue => {
      // Calculate priority score (0-100)
      let score = 0;
      
      // Severity weighting
      const severityWeights = {
        critical: 40,
        high: 30,
        medium: 15,
        low: 5
      };
      score += severityWeights[issue.severity];
      
      // Impact weighting
      const impactWeights = {
        compilation: 25, // Blocking compilation is highest priority
        runtime: 20,
        performance: 15,
        maintenance: 5
      };
      score += impactWeights[issue.impact];
      
      // Complexity weighting (more complex = higher priority)
      score += issue.complexity;
      
      // Number of files involved (more files = higher priority)
      score += Math.min(issue.files.length * 5, 20);
      
      // Type-level issues are usually more critical
      if (issue.type === 'type' || issue.type === 'generic') {
        score += 10;
      }
      
      issue.priority = Math.min(100, Math.max(1, score));
    });
    
    // Sort by priority (highest first)
    this.circularDependencies.sort((a, b) => b.priority - a.priority);
  }

  private analyzeRootCauses(): void {
    this.circularDependencies.forEach(issue => {
      // Find the likely root cause file (usually the one with the most dependencies)
      let rootCauseFile = issue.files[0];
      let maxDependencies = 0;
      
      for (const file of issue.files) {
        const dependencies = this.countFileDependencies(file);
        if (dependencies > maxDependencies) {
          maxDependencies = dependencies;
          rootCauseFile = file;
        }
      }
      
      issue.rootCauseFile = rootCauseFile;
      issue.folder = path.dirname(rootCauseFile);
      issue.fileName = path.basename(rootCauseFile);
      
      // Generate suggested fixes based on type
      issue.suggestedFixes = this.generateSuggestedFixes(issue);
    });
  }

  private countFileDependencies(filePath: string): number {
    let count = 0;
    this.dependencyGraph.forEach(node => {
      if (node.file === filePath) {
        count += node.dependencies.length;
      }
    });
    return count;
  }

private generateSuggestedFixes(issue: CircularDependency): string[] {
  const fixes: string[] = [];
  
  switch (issue.type) {
    case 'type':
      const problematicProperty = this.findProblematicProperty(issue.cycle); // Pass cycle array
      fixes.push(
        '🔧 **Use Omit/Exclude to break the cycle:**',
        `   Replace circular reference with: Omit<${issue.cycle[0]}, '${problematicProperty}'>`,
        '',
        '🔧 **Extract common interface:**',
        `   Create Base${issue.cycle[0]} interface without the circular property`,
        '',
        '🔧 **Use type guards:**',
        `   Replace with discriminated union or type predicate`
      );
      break;
      
    case 'generic':
      fixes.push(
        '🔧 **Simplify generic constraints:**',
        `   Change from: T extends SomeType<T>`,
        `   To: T extends SomeType<Omit<T, keyof SomeType>>`,
        '',
        '🔧 **Use conditional types:**',
        `   Implement with: T extends infer U ? ProcessedType<U> : never`
      );
      break;
      
    case 'inheritance':
      fixes.push(
        '🔧 **Convert to composition:**',
        `   Replace inheritance with has-a relationship`,
        '',
        '🔧 **Extract interface:**',
        `   Create shared interface and implement separately`
      );
      break;
      
    case 'import':
      fixes.push(
        '🔧 **Create barrel file:**',
        `   Add index.ts to export from ${issue.folder}`,
        '',
        '🔧 **Use dependency injection:**',
        `   Pass dependencies as parameters instead of importing`,
        '',
        '🔧 **Extract to shared module:**',
        `   Move shared code to ${path.join(issue.folder, 'shared')}`
      );
      break;
  }
  
  return fixes;
}
  
  private findProblematicProperty(cycle: string[]): string {
    // Try to identify which property is causing the circular reference
    for (const typeName of cycle) {
      const node = this.dependencyGraph.get(typeName);
      if (node && node.properties) {
        for (const prop of node.properties) {
          // Check if this property references another type in the cycle
          const referencesOtherType = cycle.some(otherType => 
            otherType !== typeName && prop.type.includes(otherType)
          );
          
          if (referencesOtherType) {
            return prop.name;
          }
          
          // Also check for self-references
          if (prop.type.includes(typeName)) {
            return prop.name;
          }
        }
      }
    }
    
    // Fallback: look for any property that might be problematic
    for (const typeName of cycle) {
      const node = this.dependencyGraph.get(typeName);
      if (node && node.properties && node.properties.length > 0) {
        return node.properties[0].name;
      }
    }
    
    // Default fallback
    return 'circularProperty';
  }


  private findProblematicPropertyWithContext(cycle: string[]): {
    propertyName: string;
    typeName: string;
    propertyType: string;
    isSelfReference: boolean;
  } {
    for (const typeName of cycle) {
      const node = this.dependencyGraph.get(typeName);
      if (node && node.properties) {
        for (const prop of node.properties) {
          // Check for references to other types in the cycle
          const referencedTypes = cycle.filter(otherType =>
            otherType !== typeName && prop.type.includes(otherType)
          );
        
          if (referencedTypes.length > 0) {
            return {
              propertyName: prop.name,
              typeName,
              propertyType: prop.type,
              isSelfReference: false
            };
          }
        
          // Check for self-reference
          if (prop.type.includes(typeName)) {
            return {
              propertyName: prop.name,
              typeName,
              propertyType: prop.type,
              isSelfReference: true
            };
          }
        }
      }
    }
  
    // Return default values if nothing found
    return {
      propertyName: 'circularProperty',
      typeName: cycle[0] || 'UnknownType',
      propertyType: 'unknown',
      isSelfReference: false
    };
  }

  private generateOrganizedReport(): OrganizedReport {
    const organized: OrganizedReport = {
      circularDependencies: [],
      summary: {
        total: this.circularDependencies.length,
        bySeverity: {},
        byType: {},
        byImpact: {},
        byFolder: {}
      },
      criticalIssues: [],
      highPriorityIssues: [],
      mediumPriorityIssues: [],
      lowPriorityIssues: [],
      folderBreakdown: {},
      fileBreakdown: {},
      quickFixes: [],
      detailedAnalysis: []
    };

    // Categorize by severity
    this.circularDependencies.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          organized.criticalIssues.push(issue);
          break;
        case 'high':
          organized.highPriorityIssues.push(issue);
          break;
        case 'medium':
          organized.mediumPriorityIssues.push(issue);
          break;
        case 'low':
          organized.lowPriorityIssues.push(issue);
          break;
      }
      
      // Update summary counts
      organized.summary.bySeverity[issue.severity] = 
        (organized.summary.bySeverity[issue.severity] || 0) + 1;
      organized.summary.byType[issue.type] = 
        (organized.summary.byType[issue.type] || 0) + 1;
      organized.summary.byImpact[issue.impact] = 
        (organized.summary.byImpact[issue.impact] || 0) + 1;
      organized.summary.byFolder[issue.folder] = 
        (organized.summary.byFolder[issue.folder] || 0) + 1;
      
      // Organize by folder
      if (!organized.folderBreakdown[issue.folder]) {
        organized.folderBreakdown[issue.folder] = [];
      }
      organized.folderBreakdown[issue.folder].push(issue);
      
      // Organize by file
      const fileKey = `${issue.folder}/${issue.fileName}`;
      if (!organized.fileBreakdown[fileKey]) {
        organized.fileBreakdown[fileKey] = [];
      }
      organized.fileBreakdown[fileKey].push(issue);
    });

    // Generate quick fixes
    organized.quickFixes = this.generateQuickFixes(organized);
    
    // Generate detailed analysis
    organized.detailedAnalysis = this.generateDetailedAnalysis(organized);

    return organized;
  }

  private generateQuickFixes(report: OrganizedReport): Array<{
    action: string;
    files: string[];
    estimatedTime: string;
    priority: number;
  }> {
    const quickFixes: QuickFix[] = [];
    
    // Group fixes by folder and type
    const folderGroups = new Map<string, CircularDependency[]>();
    
    report.criticalIssues.forEach(issue => {
      if (!folderGroups.has(issue.folder)) {
        folderGroups.set(issue.folder, []);
      }
      folderGroups.get(issue.folder)!.push(issue);
    });
    
    folderGroups.forEach((issues, folder) => {
      // Check if all issues in folder are of the same type
      const typeCounts: Record<string, number> = {};
      issues.forEach(issue => {
        typeCounts[issue.type] = (typeCounts[issue.type] || 0) + 1;
      });
      
      const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0];
      
      quickFixes.push({
        action: `Fix ${dominantType} circular dependencies in ${path.basename(folder)}`,
        files: [...new Set(issues.map(i => i.rootCauseFile))],
        estimatedTime: issues.length <= 3 ? '15-30 minutes' : '1-2 hours',
        priority: issues.reduce((sum, issue) => sum + issue.priority, 0) / issues.length
      });
    });
    
    // Sort by priority
    quickFixes.sort((a, b) => b.priority - a.priority);
    
    return quickFixes;
  }

  private generateDetailedAnalysis(report: OrganizedReport): Array<{
    folder: string;
    issues: number;
    criticalIssues: number;
    files: string[];
  }> {
    const analysis: Array<{
      folder: string;
      issues: number;
      criticalIssues: number;
      files: string[];
    }> = [];
    
    Object.entries(report.folderBreakdown).forEach(([folder, issues]) => {
      const criticalCount = issues.filter(i => i.severity === 'critical').length;
      const uniqueFiles = [...new Set(issues.map(i => i.rootCauseFile))];
      
      analysis.push({
        folder,
        issues: issues.length,
        criticalIssues: criticalCount,
        files: uniqueFiles
      });
    });
    
    // Sort by critical issues first, then total issues
    analysis.sort((a, b) => {
      if (b.criticalIssues !== a.criticalIssues) {
        return b.criticalIssues - a.criticalIssues;
      }
      return b.issues - a.issues;
    });
    
    return analysis;
  }
 
  generateHumanReadableReport(organized: OrganizedReport): string {
    const lines: string[] = [];
    
    lines.push('🚨 CIRCULAR DEPENDENCY ANALYSIS REPORT');
    lines.push('======================================\n');
    
    // Executive Summary
    lines.push('📊 EXECUTIVE SUMMARY');
    lines.push('────────────────────');
    lines.push(`Total Issues: ${organized.summary.total}`);
    lines.push(`Critical: ${organized.summary.bySeverity.critical || 0} | ` +
               `High: ${organized.summary.bySeverity.high || 0} | ` +
               `Medium: ${organized.summary.bySeverity.medium || 0} | ` +
               `Low: ${organized.summary.bySeverity.low || 0}`);
    lines.push('');
    
    // Most Problematic Folders
    lines.push('📁 MOST PROBLEMATIC FOLDERS (Top 5)');
    lines.push('───────────────────────────────────');
    organized.detailedAnalysis.slice(0, 5).forEach((analysis, index) => {
      lines.push(`${index + 1}. ${path.basename(analysis.folder)}`);
      lines.push(`   📍 ${analysis.folder}`);
      lines.push(`   ⚠️  Issues: ${analysis.issues} (${analysis.criticalIssues} critical)`);
      lines.push(`   📄 Files: ${analysis.files.length}`);
      lines.push('');
    });
    
    // QUICK FIXES - Actionable Items
    lines.push('🔧 QUICK FIXES (Start Here)');
    lines.push('───────────────────────────');
    organized.quickFixes.slice(0, 5).forEach((fix, index) => {
      lines.push(`## ${index + 1}. ${fix.action}`);
      lines.push(`⏱️  Estimated Time: ${fix.estimatedTime}`);
      lines.push(`📊 Priority Score: ${Math.round(fix.priority)}/100`);
      lines.push(`📄 Files to Modify:`);
      fix.files.forEach(file => {
        const relativePath = path.relative(process.cwd(), file);
        lines.push(`   • ${relativePath}`);
      });
      lines.push('');
    });
    
    // CRITICAL ISSUES - Detailed Breakdown
    if (organized.criticalIssues.length > 0) {
      lines.push('🚨 CRITICAL ISSUES - Blocking Compilation');
      lines.push('─────────────────────────────────────────');
      
      organized.criticalIssues.forEach((issue, index) => {
        lines.push(`### ${index + 1}. ${issue.description}`);
        lines.push(`📍 **Location:** ${path.relative(process.cwd(), issue.rootCauseFile)}`);
        lines.push(`📊 **Priority:** ${issue.priority}/100`);
        lines.push(`🎯 **Type:** ${issue.type.toUpperCase()} | **Impact:** ${issue.impact.toUpperCase()}`);
        lines.push('');
        lines.push('🔄 **Dependency Cycle:**');
        lines.push('```');
        lines.push(issue.cycle.join(' → '));
        lines.push('```');
        lines.push('');
        lines.push('🔧 **Suggested Fixes:**');
        issue.suggestedFixes.forEach(fix => {
          lines.push(fix);
        });
        lines.push('---\n');
      });
    }
    
    // FOLDER-BY-FOLDER ANALYSIS
    lines.push('📁 FOLDER-BY-FOLDER ANALYSIS');
    lines.push('────────────────────────────');
    
    organized.detailedAnalysis.forEach(analysis => {
      lines.push(`### ${path.basename(analysis.folder)}`);
      lines.push(`📊 Total Issues: ${analysis.issues} (${analysis.criticalIssues} critical)`);
      lines.push(`📄 Affected Files: ${analysis.files.length}`);
      
      const folderIssues = organized.folderBreakdown[analysis.folder];
      if (folderIssues && folderIssues.length > 0) {
        lines.push('');
        lines.push('🔍 **Key Issues in this folder:**');
        folderIssues.slice(0, 3).forEach(issue => {
          lines.push(`• ${issue.description}`);
          lines.push(`  ↳ ${path.basename(issue.rootCauseFile)} - ${issue.type}`);
        });
      }
      lines.push('');
    });
    
    // ACTION PLAN
    lines.push('📋 RECOMMENDED ACTION PLAN');
    lines.push('─────────────────────────');
    lines.push('');
    lines.push('## Phase 1: Immediate Fixes (Day 1)');
    lines.push('1. Start with the Quick Fixes section above');
    lines.push('2. Focus on critical issues that block compilation');
    lines.push('3. Fix one folder at a time');
    lines.push('');
    lines.push('## Phase 2: High Priority (Week 1)');
    lines.push('1. Address all high-severity type-level dependencies');
    lines.push('2. Review inheritance chains deeper than 3 levels');
    lines.push('3. Fix generic type constraints with self-references');
    lines.push('');
    lines.push('## Phase 3: Prevention (Ongoing)');
    lines.push('1. Add circular dependency detection to CI/CD');
    lines.push('2. Review new type definitions for circular references');
    lines.push('3. Regular dependency audits');
    
    return lines.join('\n');
  }

  generateJSONReport(organized: OrganizedReport): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: organized.summary,
      quickFixes: organized.quickFixes,
      criticalIssues: organized.criticalIssues.map(issue => ({
        id: issue.id,
        description: issue.description,
        priority: issue.priority,
        rootCauseFile: path.relative(process.cwd(), issue.rootCauseFile),
        type: issue.type,
        impact: issue.impact,
        suggestedFixes: issue.suggestedFixes
      })),
      folderAnalysis: organized.detailedAnalysis,
      fileAnalysis: Object.entries(organized.fileBreakdown).map(([file, issues]) => ({
        file,
        issues: issues.length,
        criticalIssues: issues.filter(i => i.severity === 'critical').length,
        types: [...new Set(issues.map(i => i.type))]
      }))
    }, null, 2);
  }

  // Helper methods for detection (simplified for brevity)
  private async findInheritanceCircularDependencies(): Promise<void> {
    // Look for circular inheritance (A extends B, B extends A)
    for (const [typeName, node] of this.dependencyGraph) {
      if (node.extends && node.extends.length > 0) {
        for (const parent of node.extends) {
          const parentNode = this.dependencyGraph.get(parent);
          if (parentNode && parentNode.extends && parentNode.extends.includes(typeName)) {
            this.circularDependencies.push({
              id: `inheritance-${typeName}-${parent}`,
              cycle: [typeName, parent],
              files: [node.file, parentNode.file],
              severity: 'high',
              description: `Circular inheritance: ${typeName} extends ${parent}`,
              type: 'inheritance',
              impact: 'compilation',
              rootCauseFile: node.file,
              suggestedFixes: [],
              complexity: 7,
              priority: 0,
              folder: '',
              fileName: ''
            });
          }
        }
      }
    }
  }


  private async buildEnhancedDependencyGraph(projectStructure: ProjectStructure): Promise<void> {
    const { interfaces, components, apis } = projectStructure;

    // Process interfaces and types with more detailed analysis
    for (const [name, iface] of interfaces) {
      const dependencies = this.extractDependenciesFromInterface(iface);
      const extendsTypes = this.extractExtendsFromInterface(iface);
      const properties = iface.properties || [];
      
      this.dependencyGraph.set(name, {
        name,
        file: iface.file,
        dependencies: [...dependencies, ...extendsTypes],
        type: iface.type === 'type' ? 'type' : 'interface',
        extends: extendsTypes,
        properties,
        generics: this.extractGenerics(iface.definition || '')
      });
    }

    // Process components
    components.forEach(([name, component]) => {
      const dependencies = [component.propsType].filter(Boolean) as string[];
      this.dependencyGraph.set(name, {
        name,
        file: component.file,
        dependencies,
        type: 'component'
      });
    });

    // Process APIs/services
    apis.forEach(([file, api]) => {
      api.methods.forEach(method => {
        const dependencies = this.extractDependenciesFromMethod(method);
        this.dependencyGraph.set(method.name, {
          name: method.name,
          file,
          dependencies,
          type: 'function'
        });
      });
    });

    // Enhanced: Parse actual source files to find type references
    await this.parseSourceFilesForTypeDependencies();
  }

    private extractExtendsFromInterface(iface: InterfaceInfo): string[] {
    const extendsTypes: string[] = [];
    
    if (iface.definition) {
      // Look for extends clause in type/interface definition
      const extendsMatch = iface.definition.match(/extends\s+([^{<]+)/);
      if (extendsMatch) {
        const extendedType = extendsMatch[1].trim();
        extendsTypes.push(extendedType.split('<')[0]); // Remove generics if present
      }
    }
    
    return extendsTypes;
  }


  private extractGenerics(typeDefinition: string): string[] {
    const generics: string[] = [];
    
    // Extract generic type parameters
    const genericMatch = typeDefinition.match(/<([^>]+)>/);
    if (genericMatch) {
      const genericParams = genericMatch[1].split(',').map(p => p.trim());
      generics.push(...genericParams);
    }
    
    return generics;
  }



  private async parseSourceFilesForTypeDependencies(): Promise<void> {
    // Read all TypeScript files to find type references
    const tsFiles = this.getTypeScriptFiles(process.cwd());
    
    for (const file of tsFiles) {
      try {
        const content = await fs.promises.readFile(file, 'utf8');
        this.parseFileForTypeDependencies(file, content);
      } catch (error) {
        console.warn(`⚠️ Could not parse file: ${file}`, error);
      }
    }
  }


  private getTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];
    
    const scanDirectory = (currentDir: string) => {
      try {
        const items = fs.readdirSync(currentDir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(currentDir, item.name);
          
          if (item.isDirectory()) {
            if (!item.name.includes('node_modules') && 
                !item.name.startsWith('.') && 
                item.name !== 'dist' && 
                item.name !== 'build') {
              scanDirectory(fullPath);
            }
          } else if (item.isFile() && 
                    (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not scan directory: ${currentDir}`, error);
      }
    };
    
    scanDirectory(dir);
    return files;
  }


   private parseFileForTypeDependencies(file: string, content: string): void {
    const lines = content.split('\n');
    
    // Look for interface/type definitions
    lines.forEach(line => {
      // Match interface definitions
      const interfaceMatch = line.match(/(?:interface|type)\s+(\w+)/);
      if (interfaceMatch) {
        const typeName = interfaceMatch[1];
        
        // Look for circular references in properties
        const propertyMatches = line.matchAll(/(\w+)\s*:\s*([^;]+)/g);
        for (const match of propertyMatches) {
          const propertyType = match[2];
          
          // Check if property type references the containing type
          if (propertyType.includes(typeName) && !this.dependencyGraph.has(typeName)) {
            // Add to graph if not already there
            this.dependencyGraph.set(typeName, {
              name: typeName,
              file,
              dependencies: [],
              type: line.includes('interface') ? 'interface' : 'type'
            });
            
            // Extract referenced types from property
            const referencedTypes = this.extractTypeReferences(propertyType);
            const node = this.dependencyGraph.get(typeName);
            if (node) {
              node.dependencies.push(...referencedTypes);
            }
          }
        }
      }
      
      // Match generic type parameters with constraints
      const genericMatch = line.match(/type\s+\w+\s*<([^>]+)>\s*=/);
      if (genericMatch) {
        const genericParams = genericMatch[1];
        
        // Check for recursive generic constraints (like T extends SomeType<T>)
        if (genericParams.includes('extends')) {
          const constraintMatch = genericParams.match(/(\w+)\s+extends\s+([^,>]+)/);
          if (constraintMatch) {
            const genericName = constraintMatch[1];
            const constraint = constraintMatch[2];
            
            if (constraint.includes(genericName)) {
              // Self-referential generic constraint
              const node: DependencyNode = {
                name: genericName,
                file,
                dependencies: [genericName], // Self-reference
                type: 'type',
                generics: [genericParams]
              };
              
              this.dependencyGraph.set(genericName, node);
            }
          }
        }
      }
    });
  }

  private findImportCircularDependencies(): void {
    this.visited.clear();
    this.recursionStack.clear();
    
    // Perform DFS for each node to find cycles
    this.dependencyGraph.forEach((_, nodeName) => {
      if (!this.visited.has(nodeName)) {
        this.dfs(nodeName, [], 'import'); // Already has the third argument
      }
    });
    
    this.removeDuplicateCycles();
  }

  private async findTypeCircularDependencies(): Promise<void> {
    // Look for type-level circular dependencies (A references B, B references A)
    for (const [typeName, node] of this.dependencyGraph) {
      for (const dep of node.dependencies) {
        const depNode = this.dependencyGraph.get(dep);
        if (depNode && depNode.dependencies.includes(typeName)) {
          // Found a type-level circular dependency
          const issue = this.createCircularDependency({
            type: 'type',
            cycle: [typeName, dep],
            files: [node.file, depNode.file],
            description: `Type-level circular dependency: ${typeName} ↔ ${dep}`,
            severity: 'high',
            impact: 'compilation',
            complexity: 6 // Moderate complexity for type-level circular dependency
          });
          this.circularDependencies.push(issue);
        }
      }
    }
  }


private async findGenericCircularDependencies(): Promise<void> {
  // Look for circular dependencies in generic types
  for (const [typeName, node] of this.dependencyGraph) {
    if (node.generics && node.generics.length > 0) {
      for (const generic of node.generics) {
        // Check for self-referential generics (like T extends SomeType<T>)
        if (generic.includes(typeName)) {
          const issue = this.createCircularDependency({
            type: 'generic',
            cycle: [typeName],
            files: [node.file],
            description: `Self-referential generic type: ${typeName}<${generic}>`,
            severity: 'critical',
            impact: 'compilation',
            complexity: 8 // High complexity for recursive generics
          });
          this.circularDependencies.push(issue);
        }
        
        // Check for mutual generic dependencies (A<T extends B<U>>, B<U extends A<T>>)
        const match = generic.match(/(\w+)\s+extends\s+([^,>]+)/);
        if (match) {
          const [, genericParam, constraint] = match;
          const constraintNode = this.dependencyGraph.get(constraint.split('<')[0]);
          if (constraintNode && constraintNode.generics) {
            // Check if the constraint also references back to this type
            const hasCircularConstraint = constraintNode.generics.some(otherGeneric => 
              otherGeneric.includes(typeName)
            );
            if (hasCircularConstraint) {
              const issue = this.createCircularDependency({
                type: 'generic',
                cycle: [typeName, constraint.split('<')[0]],
                files: [node.file, constraintNode.file],
                description: `Mutual generic dependency: ${typeName}<${generic}> ↔ ${constraint}`,
                severity: 'critical',
                impact: 'compilation',
                complexity: 9
              });
              this.circularDependencies.push(issue);
            }
          }
        }
      }
    }
  }
}

  private async findExcessiveStackDepthIssues(): Promise<CircularDependency[]> {
    const excessiveStackIssues: CircularDependency[] = [];
    
    // Look for patterns that cause "Excessive stack depth" errors
    for (const [typeName, node] of this.dependencyGraph) {
      // Check for complex recursive types
      if (this.isComplexRecursiveType(typeName, node)) {
        const issue = this.createCircularDependency({
          type: 'type',
          cycle: [typeName],
          files: [node.file],
          description: `Complex recursive type that may cause "Excessive stack depth" errors: ${typeName}`,
          severity: 'high',
          impact: 'compilation',
          complexity: 8 // High complexity for recursive types
        });
        excessiveStackIssues.push(issue);
      }
      
      // Check for deep inheritance chains
      const inheritanceDepth = this.calculateInheritanceDepth(typeName);
      if (inheritanceDepth > 5) {
        const issue = this.createCircularDependency({
          type: 'inheritance',
          cycle: [typeName],
          files: [node.file],
          description: `Deep inheritance chain (depth: ${inheritanceDepth}) that may cause "Excessive stack depth" errors: ${typeName}`,
          severity: 'medium',
          impact: 'compilation',
          complexity: Math.min(10, inheritanceDepth * 2) // Scale complexity with depth
        });
        excessiveStackIssues.push(issue);
      }
      
      // Check for self-referential generic constraints
      if (this.hasSelfReferentialGenerics(typeName, node)) {
        const issue = this.createCircularDependency({
          type: 'generic',
          cycle: [typeName],
          files: [node.file],
          description: `Self-referential generic constraints that may cause "Excessive stack depth" errors: ${typeName}`,
          severity: 'critical',
          impact: 'compilation',
          complexity: 9
        });
        excessiveStackIssues.push(issue);
      }
      
      // Check for circular type references within the same type
      if (this.hasCircularProperties(typeName, node)) {
        const issue = this.createCircularDependency({
          type: 'type',
          cycle: [typeName],
          files: [node.file],
          description: `Circular property references within type that may cause "Excessive stack depth" errors: ${typeName}`,
          severity: 'high',
          impact: 'compilation',
          complexity: 7
        });
        excessiveStackIssues.push(issue);
      }
    }
    
    return excessiveStackIssues;
  }

  // Helper method to check for self-referential generics
  private hasSelfReferentialGenerics(typeName: string, node: DependencyNode): boolean {
    if (!node.generics || node.generics.length === 0) return false;
    
    // Check if any generic constraint references itself
    return node.generics.some(generic => {
      // Pattern: T extends Something<T> or T extends SomeType<T, ...>
      const selfRefPattern = new RegExp(`\\b${typeName}\\s+extends\\s+.*\\b${typeName}\\b`, 'i');
      return selfRefPattern.test(generic);
    });
  }

  // Helper method to check for circular properties
  private hasCircularProperties(typeName: string, node: DependencyNode): boolean {
    if (!node.properties || node.properties.length === 0) return false;
    
    // Check if any property type references the containing type
    return node.properties.some(prop => {
      return prop.type.includes(typeName);
    });
  }

  private isComplexRecursiveType(typeName: string, node: DependencyNode): boolean {
    // Check if this type has properties that reference itself through complex paths
    const visited = new Set<string>();
    return this.hasComplexSelfReference(typeName, node, visited, 0);
  }

  private hasComplexSelfReference(
    currentType: string, 
    node: DependencyNode, 
    visited: Set<string>, 
    depth: number
  ): boolean {
    if (depth > 3) return true; // Too deep, likely complex recursion
    if (visited.has(currentType)) return true; // Already visited, circular
    
    visited.add(currentType);
    
    // Check all dependencies for self-reference
    for (const dep of node.dependencies) {
      const depNode = this.dependencyGraph.get(dep);
      if (depNode) {
        // Check if dependency eventually references back to the original type
        if (depNode.dependencies.includes(currentType) || 
            this.hasComplexSelfReference(dep, depNode, new Set([...visited]), depth + 1)) {
          return true;
        }
      }
    }
    
    return false;
  }

  private calculateInheritanceDepth(typeName: string, visited: Set<string> = new Set()): number {
    if (visited.has(typeName)) return 0; // Circular, break recursion
    
    visited.add(typeName);
    const node = this.dependencyGraph.get(typeName);
    if (!node) return 0;
    
    let maxDepth = 0;
    
    if (node.extends && node.extends.length > 0) {
      for (const parent of node.extends) {
        const depth = this.calculateInheritanceDepth(parent, new Set([...visited])) + 1;
        maxDepth = Math.max(maxDepth, depth);
      }
    }
    
    return maxDepth;
  }


  private extractDependenciesFromInterface(iface: InterfaceInfo): string[] {
    const dependencies: string[] = [];
    
    if (iface.properties) {
      iface.properties.forEach(prop => {
        const typeRefs = this.extractTypeReferences(prop.type);
        dependencies.push(...typeRefs);
      });
    }
    
    if (iface.definition) {
      const typeRefs = this.extractTypeReferences(iface.definition);
      dependencies.push(...typeRefs);
    }
    
    return [...new Set(dependencies)];
  }

private extractDependenciesFromMethod(method: ApiMethod): string[] {
    const dependencies: string[] = [];
    
    // Extract from parameters
    method.parameters.forEach((param: ApiParameter) => {
      const typeRefs = this.extractTypeReferences(param);
      dependencies.push(...typeRefs);
    });
    
    // Extract from return type
    const returnTypeRefs = this.extractTypeReferences(method.returnType);
    dependencies.push(...returnTypeRefs);
    
    return [...new Set(dependencies)];
}

  private extractTypeReferences(typeString: string): string[] {
    if (!typeString) return [];
    
    const references: string[] = [];
    
    // Match custom type references (not primitives)
    const typeRegex = /[A-Z][a-zA-Z0-9_$]*/g;
    const primitives = new Set([
      'string', 'number', 'boolean', 'any', 'void', 'null', 'undefined', 
      'Date', 'Array', 'Promise', 'Function', 'Object', 'Error', 'RegExp',
      'Map', 'Set', 'WeakMap', 'WeakSet'
    ]);
    
    let match;
    while ((match = typeRegex.exec(typeString)) !== null) {
      const typeName = match[0];
      if (!primitives.has(typeName) && this.dependencyGraph.has(typeName)) {
        references.push(typeName);
      }
    }
    
    return references;
  }

  private parseFileDependencies(projectStructure: ProjectStructure): void {
    // This would parse actual source files to find import statements
    // For now, we'll enhance with common patterns
    
    this.dependencyGraph.forEach((node, name) => {
      // Look for extends/implements relationships
      if (node.type === 'interface' || node.type === 'class') {
        const extendedTypes = this.findExtendedTypes(name);
        node.dependencies.push(...extendedTypes);
      }
      
      // Remove self-references and duplicates
      node.dependencies = node.dependencies.filter(dep => 
        dep !== name && this.dependencyGraph.has(dep)
      );
      node.dependencies = [...new Set(node.dependencies)];
    });
  }

  private findExtendedTypes(typeName: string): string[] {
    const extended: string[] = [];
    const baseName = typeName.replace(/Props$/, '').replace(/Interface$/, '').replace(/Type$/, '');
    
    // Common inheritance patterns
    const patterns = [
      `I${baseName}`,
      `${baseName}Base`,
      `Base${baseName}`,
      `Abstract${baseName}`,
      `${baseName}Interface`
    ];
    
    patterns.forEach(pattern => {
      if (this.dependencyGraph.has(pattern) && pattern !== typeName) {
        extended.push(pattern);
      }
    });
    
    return extended;
  }

  private findCircularDependencies(): void {
    this.visited.clear();
    this.recursionStack.clear();
    this.circularDependencies = [];
    
    // Perform DFS for each node to find cycles
    this.dependencyGraph.forEach((_, nodeName) => {
      if (!this.visited.has(nodeName)) {
        this.dfs(nodeName, [], 'import'); // Add the third argument
      }
    });
    
    // Remove duplicate cycles (same cycle starting from different nodes)
    this.removeDuplicateCycles();
    
    // Categorize severity
    this.categorizeCircularDependencies();
  }

private dfs(nodeName: string, path: string[], detectionType: 'import' | 'type'): boolean {
  if (this.recursionStack.has(nodeName)) {
    // Found a cycle!
    const cycleStart = path.indexOf(nodeName);
    const cycle = path.slice(cycleStart);
    cycle.push(nodeName); // Complete the cycle
    
    // Get files for each node in the cycle
    const files: string[] = [];
    const validCycle: string[] = [];
    
    for (const name of cycle) {
      const node = this.dependencyGraph.get(name);
      if (node && node.file) {
        files.push(node.file);
        validCycle.push(name);
      }
    }
    
    // Only create a dependency if we have valid files
    if (files.length > 0 && validCycle.length > 0) {
      const dependency = this.createCircularDependency({
        type: detectionType,
        cycle: validCycle,
        files,
        description: this.generateCycleDescription(validCycle)
      });
      
      this.circularDependencies.push(dependency);
    }
    
    return true;
  }
  
  if (this.visited.has(nodeName)) {
    return false;
  }
  
  this.visited.add(nodeName);
  this.recursionStack.add(nodeName);
  path.push(nodeName);
  
  const node = this.dependencyGraph.get(nodeName);
  if (node) {
    for (const dep of node.dependencies) {
      if (this.dependencyGraph.has(dep)) {
        this.dfs(dep, path, detectionType);
      }
    }
  }
  
  path.pop();
  this.recursionStack.delete(nodeName);
  
  return false;
}

// Enhanced createCircularDependency method
private createCircularDependency(
  data: {
    type: 'import' | 'type' | 'generic' | 'inheritance';
    cycle: string[];
    files: string[];
    description: string;
    severity?: 'critical' | 'high' | 'medium' | 'low';
    impact?: 'compilation' | 'runtime' | 'performance' | 'maintenance';
    complexity?: number;
  }
): CircularDependency {
  const {
    type,
    cycle,
    files,
    description,
    severity = 'medium',
    impact = 'maintenance',
    complexity = cycle.length * 2
  } = data;
  
  // Generate ID using your UniqueIDGenerator
  const id = UniqueIDGenerator.generateCircularDependencyID(type, cycle, {
    customSuffix: files.length > 0 ? path.basename(files[0], '.ts') : '',
    includeTimestamp: true,
    includeRandom: true
  });
  
  // Determine final severity and impact
  let finalSeverity = severity;
  let finalImpact = impact;
  
  if (type === 'type' || type === 'generic') {
    finalSeverity = 'critical';
    finalImpact = 'compilation';
  } else if (type === 'inheritance') {
    finalSeverity = 'high';
    finalImpact = 'runtime';
  } else if (cycle.length <= 2 && severity === 'medium') {
    finalSeverity = 'high';
    finalImpact = 'performance';
  }
  
  // Calculate final complexity
  let finalComplexity = complexity;
  if (type === 'type' || type === 'generic') finalComplexity += 5;
  if (type === 'inheritance') finalComplexity += 3;
  if (files.length > 2) finalComplexity += 2;
  
  const rootCauseFile = files[0] || '';
  
  return {
    id,
    cycle,
    files,
    severity: finalSeverity,
    description,
    type,
    impact: finalImpact,
    rootCauseFile,
    rootCauseLine: this.findRootCauseLine(rootCauseFile, cycle),
    suggestedFixes: this.generateSuggestedFixesForType(type, cycle),
    complexity: finalComplexity,
    priority: 0, // Will be calculated later
    folder: rootCauseFile ? path.dirname(rootCauseFile) : '',
    fileName: rootCauseFile ? path.basename(rootCauseFile) : ''
  };
}



private findRootCauseLine(file: string, cycle: string[]): number | undefined {
  if (!file || !fs.existsSync(file) || cycle.length === 0) {
    return undefined;
  }

  try {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    // Strategy 1: Look for type/interface definitions that are part of the cycle
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip comments and empty lines
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine === '') {
        continue;
      }
      
      // Look for type/interface definitions that match our cycle
      for (const typeName of cycle) {
        // Match: interface TypeName, type TypeName =, class TypeName
        const typePattern = new RegExp(`(?:interface|type|class)\\s+${typeName}\\b`);
        if (typePattern.test(line)) {
          return i + 1; // Convert to 1-based line numbers
        }
        
        // Also check for generic types that might be causing the issue
        if (line.includes(`<${typeName}`) || line.includes(`${typeName}>`)) {
          return i + 1;
        }
      }
    }
    
    // Strategy 2: Look for properties that reference other types in the cycle
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Skip comments
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
        continue;
      }
      
      // Look for property declarations that reference cycle types
      for (const typeName of cycle) {
        // Match property declarations like: property: TypeName
        const propertyPattern = new RegExp(`\\w+\\s*:\\s*.*${typeName}\\b`);
        if (propertyPattern.test(line)) {
          // Make sure this isn't in a comment
          const lineBeforeComment = line.split('//')[0];
          if (lineBeforeComment.includes(typeName)) {
            return i + 1;
          }
        }
        
        // Match extends/implements with cycle types
        const extendsPattern = new RegExp(`extends\\s+.*${typeName}\\b`);
        const implementsPattern = new RegExp(`implements\\s+.*${typeName}\\b`);
        if (extendsPattern.test(line) || implementsPattern.test(line)) {
          return i + 1;
        }
      }
    }
    
    // Strategy 3: Look for import statements that import cycle types
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('import')) {
        for (const typeName of cycle) {
          // Match: import { TypeName } or import type { TypeName }
          if (new RegExp(`import.*{.*${typeName}.*}`).test(line)) {
            return i + 1;
          }
        }
      }
    }
    
    // Strategy 4: Find the first occurrence of any cycle type in the file
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineBeforeComment = line.split('//')[0]; // Ignore inline comments
      
      for (const typeName of cycle) {
        if (lineBeforeComment.includes(typeName)) {
          // Make sure it's not in a string literal
          const inString = this.isInsideStringLiteral(line, typeName);
          if (!inString) {
            return i + 1;
          }
        }
      }
    }
    
  } catch (error) {
    console.warn(`⚠️ Could not read file to find root cause line: ${file}`, error);
  }
  
  return undefined;
}

private isInsideStringLiteral(line: string, searchText: string): boolean {
  const index = line.indexOf(searchText);
  if (index === -1) return false;
  
  // Count quotes before the search text
  const beforeText = line.substring(0, index);
  const singleQuotes = (beforeText.match(/'/g) || []).length;
  const doubleQuotes = (beforeText.match(/"/g) || []).length;
  const backticks = (beforeText.match(/`/g) || []).length;
  
  // If there's an odd number of any quote type before the text, it's inside a string
  return (singleQuotes % 2 === 1) || (doubleQuotes % 2 === 1) || (backticks % 2 === 1);
}

// Enhanced version that provides more context
private findRootCauseLineWithContext(file: string, cycle: string[]): {
  line: number;
  context: string;
  type: 'definition' | 'property' | 'import' | 'generic' | 'extends' | 'unknown';
} | undefined {
  if (!file || !fs.existsSync(file) || cycle.length === 0) {
    return undefined;
  }

  try {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    // Try different patterns in order of importance
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine === '') {
        continue;
      }
      
      for (const typeName of cycle) {
        // Pattern 1: Type/interface/class definition (most important)
        const definitionPattern = new RegExp(`(interface|type|class)\\s+${typeName}\\b`);
        const definitionMatch = line.match(definitionPattern);
        if (definitionMatch) {
          return {
            line: i + 1,
            context: line.trim(),
            type: 'definition'
          };
        }
        
        // Pattern 2: Generic type usage with this type
        const genericPattern = new RegExp(`<.*${typeName}.*>`);
        if (genericPattern.test(line) && !this.isInsideStringLiteral(line, typeName)) {
          return {
            line: i + 1,
            context: line.trim(),
            type: 'generic'
          };
        }
        
        // Pattern 3: Property declaration with this type
        const propertyPattern = new RegExp(`\\b(\\w+)\\s*:\\s*.*${typeName}\\b`);
        const propertyMatch = line.match(propertyPattern);
        if (propertyMatch && !this.isInsideStringLiteral(line, typeName)) {
          return {
            line: i + 1,
            context: line.trim(),
            type: 'property'
          };
        }
        
        // Pattern 4: Extends/implements with this type
        if ((line.includes('extends') || line.includes('implements')) && 
            line.includes(typeName) && 
            !this.isInsideStringLiteral(line, typeName)) {
          return {
            line: i + 1,
            context: line.trim(),
            type: 'extends'
          };
        }
        
        // Pattern 5: Import statement with this type
        if (line.includes('import') && line.includes(typeName)) {
          return {
            line: i + 1,
            context: line.trim(),
            type: 'import'
          };
        }
      }
    }
    
    // Fallback: First occurrence of any cycle type
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineBeforeComment = line.split('//')[0];
      
      for (const typeName of cycle) {
        if (lineBeforeComment.includes(typeName) && !this.isInsideStringLiteral(line, typeName)) {
          return {
            line: i + 1,
            context: line.trim(),
            type: 'unknown'
          };
        }
      }
    }
    
  } catch (error) {
    console.warn(`⚠️ Could not analyze file for root cause: ${file}`, error);
  }
  
  return undefined;
}

private generateSuggestedFixesForType(
  type: 'import' | 'type' | 'generic' | 'inheritance',
  cycle: string[]
): string[] {
  switch (type) {
    case 'type':
      const propertyInfo = this.findProblematicPropertyWithContext(cycle);
      const omits = cycle.map(typeName => 
        `Omit<${typeName}, '${propertyInfo.propertyName}'>`
      ).join(' | ');
      
      return [
        `🔧 **Use Omit to exclude problematic property:**`,
        `   Replace ${propertyInfo.typeName} with ${omits}`,
        '',
        `🔧 **Extract common properties to base interface:**`,
        `   interface Base${propertyInfo.typeName} {`,
        `     // Properties without circular reference`,
        `   }`,
        '',
        `🔧 **Convert to discriminated union:**`,
        `   type ${propertyInfo.typeName} = ${cycle.map(t => `{ type: '${t.toLowerCase()}' } & Omit<${t}, 'type'>`).join(' | ')}`,
        '',
        `🔧 **Use type guards:**`,
        `   function is${propertyInfo.typeName}(obj: any): obj is ${propertyInfo.typeName} {`,
        `     return !('${propertyInfo.propertyName}' in obj);`,
        `   }`
      ];
      
    case 'import':
      const folderPath = this.getCommonFolder(cycle);
      return [
        `🔧 **Create barrel file:**`,
        `   Create ${folderPath}/index.ts with:`,
        `   export * from './${cycle[0]}';`,
        `   export * from './${cycle[1] || 'other'};`,
        '',
        `🔧 **Use dependency injection:**`,
        `   Pass ${cycle[0]} as parameter instead of importing`,
        '',
        `🔧 **Extract to shared module:**`,
        `   Move shared code to ${folderPath}/shared/`,
        '',
        `🔧 **Lazy load imports:**`,
        `   import type { ${cycle[0]} } from './${cycle[0]}'; // Type-only import`
      ];
      
    case 'generic':
      return [
        `🔧 **Simplify generic constraints:**`,
        `   Change: T extends SomeType<T>`,
        `   To: T extends SomeType<Omit<T, keyof SomeType>>`,
        '',
        `🔧 **Use conditional types:**`,
        `   type Processed<T> = T extends infer U ? { [K in keyof U]: Processed<U[K]> } : never`,
        '',
        `🔧 **Create type helper:**`,
        `   type BreakRecursion<T> = {`,
        `     [K in keyof T]: K extends 'circular' ? never : T[K]`,
        `   }`
      ];
      
    case 'inheritance':
      const inheritanceChain = cycle.join(' → ');
      return [
        `🔧 **Convert to composition:**`,
        `   Replace: class ${cycle[0]} extends ${cycle[1]}`,
        `   With: class ${cycle[0]} { private ${cycle[1].toLowerCase()}: ${cycle[1]}; }`,
        '',
        `🔧 **Extract interface:**`,
        `   interface I${cycle[0]} { /* shared methods */ }`,
        `   class ${cycle[0]} implements I${cycle[0]} {}`,
        `   class ${cycle[1]} implements I${cycle[0]} {}`,
        '',
        `🔧 **Use mixins:**`,
        `   function With${cycle[0]}<T extends Constructor>(Base: T) {`,
        `     return class extends Base { /* ${cycle[0]} functionality */ }`,
        `   }`
      ];
      
    default:
      return [
        '🔧 **General approach:**',
        '1. Identify the weakest link in the cycle',
        '2. Break the dependency at that point',
        '3. Consider if the types should be merged',
        '4. Review if the circular dependency is necessary'
      ];
  }
}

// Helper method to get common folder
private getCommonFolder(cycle: string[]): string {
  if (cycle.length === 0) return '';
  
  const files = cycle
    .map(typeName => this.dependencyGraph.get(typeName)?.file)
    .filter(Boolean) as string[];
  
  if (files.length === 0) return '';
  
  // Find common path prefix
  let commonPath = path.dirname(files[0]);
  for (const file of files.slice(1)) {
    const dir = path.dirname(file);
    while (!dir.startsWith(commonPath) && commonPath !== '') {
      commonPath = path.dirname(commonPath);
    }
  }
  
  return commonPath;
}

  private removeDuplicateCycles(): void {
    const uniqueCycles = new Set<string>();
    const filtered: CircularDependency[] = [];
    
    this.circularDependencies.forEach(circular => {
      // Normalize cycle by sorting and stringifying to detect duplicates
      const normalized = [...circular.cycle].sort().join('->');
      
      if (!uniqueCycles.has(normalized)) {
        uniqueCycles.add(normalized);
        filtered.push(circular);
      }
    });
    
    this.circularDependencies = filtered;
  }

  private categorizeCircularDependencies(): void {
    this.circularDependencies.forEach(circular => {
      // Categorize based on cycle length and types involved
      if (circular.cycle.length <= 2) {
        circular.severity = 'high'; // Very tight coupling
      } else if (circular.cycle.length <= 4) {
        circular.severity = 'medium'; // Moderate coupling
      } else {
        circular.severity = 'low'; // Loose coupling, might be acceptable
      }
      
      // Upgrade severity if interfaces are involved (more problematic)
      const hasInterfaces = circular.cycle.some(name => {
        const node = this.dependencyGraph.get(name);
        return node?.type === 'interface' || node?.type === 'type';
      });
      
      if (hasInterfaces) {
        circular.severity = 'high';
      }
    });
  }

  private generateCycleDescription(cycle: string[]): string {
    const types = cycle.map(name => {
      const node = this.dependencyGraph.get(name);
      return node ? `${name} (${node.type})` : name;
    }).join(' → ');
    
    return `Circular dependency: ${types}`;
  }

    getCircularDependencyReport(): string {
    const lines: string[] = [];
    lines.push('# 🔄 Circular Dependencies Report');
    lines.push(`**Total Circular Dependencies Found:** ${this.circularDependencies.length}`);
    lines.push('');
    
    if (this.circularDependencies.length === 0) {
      lines.push('🎉 **No circular dependencies found!** Your codebase has good dependency management.');
      lines.push('');
      return lines.join('\n');
    }

    // Group by type
    const importCircular = this.circularDependencies.filter(c => c.type === 'import');
    const typeCircular = this.circularDependencies.filter(c => c.type === 'type');
    const genericCircular = this.circularDependencies.filter(c => c.type === 'generic');
    
    // Report Type-level circular dependencies (these cause "Excessive stack depth")
    if (typeCircular.length > 0) {
      lines.push('## 🚨 TYPE-LEVEL Circular Dependencies');
      lines.push('**These cause "Excessive stack depth comparing types" errors in TypeScript:**');
      lines.push('');
      
      typeCircular.forEach((circular, index) => {
        lines.push(`### ${index + 1}. ${circular.description}`);
        lines.push('**Cycle:**');
        lines.push('```');
        lines.push(circular.cycle.join(' → '));
        lines.push('```');
        lines.push('**Files Involved:**');
        circular.files.forEach(file => {
          lines.push(`- ${file}`);
        });
        lines.push('');
        lines.push('**Suggested Fix:**');
        lines.push('Break the circular type reference using one of:');
        lines.push('1. Use `Omit<T, keyof Self>` to exclude self-referential properties');
        lines.push('2. Extract shared properties to a base interface');
        lines.push('3. Use type guards or discriminated unions');
        lines.push('---');
        lines.push('');
      });
    }
    
    // Report Generic-level circular dependencies
    if (genericCircular.length > 0) {
      lines.push('## ⚠️ GENERIC-LEVEL Circular Dependencies');
      lines.push('');
      
      genericCircular.forEach((circular, index) => {
        lines.push(`### ${index + 1}. ${circular.description}`);
        lines.push('**Fix:** Simplify generic constraints or use conditional types');
        lines.push('');
      });
    }
    
    // Report Import-level circular dependencies
    if (importCircular.length > 0) {
      lines.push('## 📁 IMPORT-LEVEL Circular Dependencies');
      lines.push('');
      
      importCircular.forEach((circular, index) => {
        lines.push(`### ${index + 1}. ${circular.description}`);
        lines.push('**Fix:** Restructure imports or use dependency injection');
        lines.push('');
      });
    }

    return lines.join('\n');
  }

  // Enhanced detection for TypeScript errors
  public getTypeScriptCircularIssues(): string[] {
    const issues: string[] = [];
    
    this.circularDependencies.forEach(circular => {
      if (circular.type === 'type' || circular.type === 'generic') {
        issues.push(`TypeScript Circular: ${circular.description}`);
      }
    });
    
    return issues;
  }

  private generateFixSuggestion(circular: CircularDependency): string {
    const cycle = circular.cycle;
    
    if (cycle.length === 2) {
      return `Break the direct dependency between ${cycle[0]} and ${cycle[1]} by introducing an interface or using dependency injection.`;
    }
    
    if (cycle.some(name => name.includes('Props'))) {
      return `Review component prop interfaces. Consider extracting shared types to a common location.`;
    }
    
    if (cycle.some(name => this.dependencyGraph.get(name)?.type === 'interface')) {
      return `Interface circular dependency detected. Extract common interface parts or use type composition.`;
    }
    
    return `Analyze the dependency chain and identify the weakest link to break. Consider creating intermediate abstractions.`;
  }

  // Utility method to get detailed analysis for CorrectionGenerator
  getDetailedCircularDependencies(): CircularDependency[] {
    return this.circularDependencies;
  }

 private generateUniqueIdForIssue(issue: Partial<CircularDependency>): string {
    return UniqueIDGenerator.generateEnhancedCircularDependencyID(issue, {
      includeSeverity: true,
      includeComplexity: true
    });
  }
}