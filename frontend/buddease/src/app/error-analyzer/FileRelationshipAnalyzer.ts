// src/app/error-analyzer/FileRelationshipAnalyzer.ts
import { TSCompilerError, FixPlan, RelationshipMap } from '@/app/error-analyzer/ErrorFixManager';
import fs from 'fs';
import path from 'path';

export interface FileRelationship {
  file: string;
  dependencies: string[];
  dependents: string[];
  errorCount: number;
  fixPlans: FixPlan[];
  priorityScore: number;
  complexity: 'low' | 'medium' | 'high';
}

export interface FixGroup {
  name: string;
  files: string[];
  errors: TSCompilerError[];
  fixPlans: FixPlan[];
  priority: number;
  description: string;
}

export class FileRelationshipAnalyzer {
  constructor(private projectRoot: string = process.cwd()) {}

  async analyzeRelationships(
    fixPlans: FixPlan[],
    relationshipMap: RelationshipMap
  ): Promise<Map<string, FileRelationship>> {
    const fileRelationships = new Map<string, FileRelationship>();

    // First pass: collect all files and their errors
    for (const plan of fixPlans) {
      const file = plan.error.resource;
      if (!fileRelationships.has(file)) {
        fileRelationships.set(file, {
          file,
          dependencies: [],
          dependents: [],
          errorCount: 0,
          fixPlans: [],
          priorityScore: 0,
          complexity: 'low'
        });
      }
      
      const relation = fileRelationships.get(file)!;
      relation.errorCount++;
      relation.fixPlans.push(plan);
    }

    // Second pass: analyze dependencies from relationship map
    for (const [file, relation] of fileRelationships.entries()) {
      // Get dependencies from relationship map
      const deps = relationshipMap.fileDependencies.get(file) || [];
      relation.dependencies = deps;
      
      // Find dependents (files that depend on this one)
      const dependents: string[] = [];
      for (const [otherFile, otherDeps] of relationshipMap.fileDependencies.entries()) {
        if (otherDeps.some(dep => dep.includes(path.basename(file, '.ts')))) {
          dependents.push(otherFile);
        }
      }
      relation.dependents = dependents;
      
      // Calculate priority score
      relation.priorityScore = this.calculatePriorityScore(relation);
      relation.complexity = this.determineComplexity(relation);
    }

    return fileRelationships;
  }

  async groupByHierarchy(fileRelationships: Map<string, FileRelationship>): Promise<FixGroup[]> {
    const groups: FixGroup[] = [];
    const visited = new Set<string>();

    for (const [file, relation] of fileRelationships.entries()) {
      if (visited.has(file)) continue;

      const folder = path.dirname(file);
      const folderName = path.relative(this.projectRoot, folder) || 'root';
      
      // Find all files in the same folder
      const folderFiles = Array.from(fileRelationships.keys())
        .filter(f => path.dirname(f) === folder && !visited.has(f));

      if (folderFiles.length > 0) {
        const groupErrors: TSCompilerError[] = [];
        const groupFixPlans: FixPlan[] = [];
        
        for (const folderFile of folderFiles) {
          const folderRelation = fileRelationships.get(folderFile)!;
          groupFixPlans.push(...folderRelation.fixPlans);
          groupErrors.push(...folderRelation.fixPlans.map(p => p.error));
          visited.add(folderFile);
        }

        groups.push({
          name: folderName,
          files: folderFiles,
          errors: groupErrors,
          fixPlans: groupFixPlans,
          priority: this.calculateGroupPriority(groupFixPlans),
          description: `${folderFiles.length} files with ${groupErrors.length} errors`
        });
      }
    }

    // Sort by priority (descending)
    return groups.sort((a, b) => b.priority - a.priority);
  }

  async groupByConnections(fileRelationships: Map<string, FileRelationship>): Promise<FixGroup[]> {
    const connectionGroups: FixGroup[] = [];
    const visited = new Set<string>();

    // Group by shared dependencies
    const dependencyClusters = this.findDependencyClusters(fileRelationships);

    for (const cluster of dependencyClusters) {
      const clusterFiles = Array.from(new Set(cluster.flat()));
      const clusterRelations = clusterFiles
        .map(f => fileRelationships.get(f))
        .filter((r): r is FileRelationship => r !== undefined);

      const groupErrors: TSCompilerError[] = [];
      const groupFixPlans: FixPlan[] = [];
      
      for (const relation of clusterRelations) {
        groupFixPlans.push(...relation.fixPlans);
        groupErrors.push(...relation.fixPlans.map(p => p.error));
        visited.add(relation.file);
      }

      if (clusterRelations.length > 0) {
        connectionGroups.push({
          name: `Shared Dependencies (${clusterRelations.length} files)`,
          files: clusterFiles,
          errors: groupErrors,
          fixPlans: groupFixPlans,
          priority: this.calculateGroupPriority(groupFixPlans),
          description: `Files sharing dependencies: ${clusterFiles.map(f => path.basename(f)).join(', ')}`
        });
      }
    }

    return connectionGroups.sort((a, b) => b.priority - a.priority);
  }

  async groupByConfidence(fixPlans: FixPlan[]): Promise<FixGroup[]> {
    const confidenceGroups: FixGroup[] = [
      { name: 'High Confidence (80-100%)', files: [], errors: [], fixPlans: [], priority: 0, description: '' },
      { name: 'Medium Confidence (60-79%)', files: [], errors: [], fixPlans: [], priority: 0, description: '' },
      { name: 'Low Confidence (0-59%)', files: [], errors: [], fixPlans: [], priority: 0, description: '' }
    ];

    for (const plan of fixPlans) {
      let groupIndex: number;
      if (plan.confidence >= 80) groupIndex = 0;
      else if (plan.confidence >= 60) groupIndex = 1;
      else groupIndex = 2;

      const group = confidenceGroups[groupIndex];
      group.fixPlans.push(plan);
      group.errors.push(plan.error);
      if (!group.files.includes(plan.error.resource)) {
        group.files.push(plan.error.resource);
      }
    }

    // Calculate priorities and descriptions
    for (const group of confidenceGroups) {
      group.priority = this.calculateGroupPriority(group.fixPlans);
      group.description = `${group.files.length} files with ${group.errors.length} errors`;
    }

    return confidenceGroups;
  }

  async generateFixStrategy(
    fileRelationships: Map<string, FileRelationship>,
    fixPlans: FixPlan[]
  ): Promise<string> {
    const lines: string[] = [];
    
    lines.push('# 🎯 TypeScript Error Fix Strategy');
    lines.push('');
    lines.push(`**Generated:** ${new Date().toISOString()}`);
    lines.push(`**Total Files with Errors:** ${fileRelationships.size}`);
    lines.push(`**Total Fixes Needed:** ${fixPlans.length}`);
    lines.push('');

    // 1. Group by hierarchy
    lines.push('## 📁 Folder Hierarchy Strategy');
    lines.push('');
    const hierarchyGroups = await this.groupByHierarchy(fileRelationships);
    
    for (const group of hierarchyGroups.slice(0, 10)) {
      lines.push(`### ${group.name}`);
      lines.push(`**Priority:** ${group.priority}/100`);
      lines.push(`**Files:** ${group.files.length}`);
      lines.push(`**Errors:** ${group.errors.length}`);
      lines.push('');
    }
    if (hierarchyGroups.length > 10) {
      lines.push(`... and ${hierarchyGroups.length - 10} more folder groups`);
      lines.push('');
    }

    // 2. Group by connections
    lines.push('## 🔗 Shared Dependencies Strategy');
    lines.push('');
    const connectionGroups = await this.groupByConnections(fileRelationships);
    
    for (const group of connectionGroups.slice(0, 5)) {
      lines.push(`### ${group.name}`);
      lines.push(`**Files:** ${group.files.map(f => path.basename(f)).join(', ')}`);
      lines.push(`**Priority:** ${group.priority}/100`);
      lines.push(`**Description:** ${group.description}`);
      lines.push('');
    }

    // 3. Group by confidence
    lines.push('## 🎯 Confidence-Based Strategy');
    lines.push('');
    const confidenceGroups = await this.groupByConfidence(fixPlans);
    
    for (const group of confidenceGroups) {
      if (group.fixPlans.length > 0) {
        lines.push(`### ${group.name}`);
        lines.push(`**Files:** ${group.files.length}`);
        lines.push(`**Fixes:** ${group.fixPlans.length}`);
        lines.push(`**Priority Score:** ${group.priority}`);
        lines.push('');
      }
    }

    // 4. Top priority files
    lines.push('## 🚨 Top Priority Files (Fix First)');
    lines.push('');
    const topFiles = Array.from(fileRelationships.values())
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 10);
    
    for (const file of topFiles) {
      lines.push(`### ${path.basename(file.file)}`);
      lines.push(`**Folder:** ${path.dirname(file.file)}`);
      lines.push(`**Priority Score:** ${file.priorityScore}`);
      lines.push(`**Errors:** ${file.errorCount}`);
      lines.push(`**Dependencies:** ${file.dependencies.length}`);
      lines.push(`**Dependents:** ${file.dependents.length}`);
      lines.push('');
    }

    // 5. Recommended workflow
    lines.push('## 📋 Recommended Workflow');
    lines.push('');
    lines.push('### Phase 1: Quick Wins (1-2 hours)');
    lines.push('1. Fix all high-confidence errors (80%+)');
    lines.push('2. Fix shared utility files first');
    lines.push('3. Verify no new errors introduced');
    lines.push('');
    lines.push('### Phase 2: Folder Focus (3-4 hours)');
    lines.push('1. Pick one high-priority folder');
    lines.push('2. Fix all errors in that folder');
    lines.push('3. Move to next folder');
    lines.push('');
    lines.push('### Phase 3: Complex Issues (time as needed)');
    lines.push('1. Fix circular dependencies');
    lines.push('2. Fix complex type relationships');
    lines.push('3. Manual review for low-confidence fixes');
    lines.push('');
    lines.push('### Phase 4: Final Polish (1 hour)');
    lines.push('1. Run full type check');
    lines.push('2. Fix any remaining edge cases');
    lines.push('3. Update documentation');

    return lines.join('\n');
  }

  private calculatePriorityScore(relation: FileRelationship): number {
    let score = 0;
    
    // Base on error count
    score += relation.errorCount * 10;
    
    // Impact: more dependents = higher priority
    score += relation.dependents.length * 15;
    
    // Complexity: more dependencies = higher priority
    score += relation.dependencies.length * 5;
    
    // Critical errors get bonus
    const criticalErrors = relation.fixPlans.filter(p => 
      p.priority === 'critical' || p.fixType === 'circular_dependency'
    ).length;
    score += criticalErrors * 25;
    
    // High confidence fixes are easier
    const highConfidence = relation.fixPlans.filter(p => p.confidence >= 80).length;
    score += highConfidence * 8; // Bonus for quick wins
    
    return Math.min(100, score);
  }

  private determineComplexity(relation: FileRelationship): 'low' | 'medium' | 'high' {
    const totalComplexity = 
      relation.dependencies.length * 1 +
      relation.dependents.length * 2 +
      relation.errorCount * 3;
    
    if (totalComplexity > 30) return 'high';
    if (totalComplexity > 15) return 'medium';
    return 'low';
  }

  private calculateGroupPriority(fixPlans: FixPlan[]): number {
    if (fixPlans.length === 0) return 0;
    
    const avgConfidence = fixPlans.reduce((sum, p) => sum + p.confidence, 0) / fixPlans.length;
    const criticalCount = fixPlans.filter(p => p.priority === 'critical').length;
    const highCount = fixPlans.filter(p => p.priority === 'high').length;
    
    return Math.min(100, 
      avgConfidence * 0.6 + 
      criticalCount * 20 + 
      highCount * 10
    );
  }

  private findDependencyClusters(
    fileRelationships: Map<string, FileRelationship>
  ): string[][] {
    const clusters: string[][] = [];
    const visited = new Set<string>();

    for (const [file, relation] of fileRelationships.entries()) {
      if (visited.has(file)) continue;

      const cluster = this.findConnectedFiles(file, fileRelationships, new Set());
      if (cluster.size > 1) {
        clusters.push(Array.from(cluster));
        cluster.forEach(f => visited.add(f));
      }
    }

    return clusters;
  }

  private findConnectedFiles(
    file: string,
    fileRelationships: Map<string, FileRelationship>,
    visited: Set<string>
  ): Set<string> {
    if (visited.has(file)) return visited;
    
    visited.add(file);
    const relation = fileRelationships.get(file);
    if (!relation) return visited;

    // Follow dependencies
    for (const dep of relation.dependencies) {
      const depFile = this.findFileByDependency(dep, fileRelationships);
      if (depFile) {
        this.findConnectedFiles(depFile, fileRelationships, visited);
      }
    }

    // Follow dependents
    for (const dependent of relation.dependents) {
      this.findConnectedFiles(dependent, fileRelationships, visited);
    }

    return visited;
  }

  private findFileByDependency(
    dep: string,
    fileRelationships: Map<string, FileRelationship>
  ): string | null {
    for (const file of fileRelationships.keys()) {
      if (file.includes(dep.replace('./', '').replace('../', ''))) {
        return file;
      }
    }
    return null;
  }

  async generateNavigationPlan(
    fileRelationships: Map<string, FileRelationship>,
    fixPlans: FixPlan[]
  ): Promise<string> {
    const lines: string[] = [];
    
    lines.push('# 🗺️ TypeScript Error Navigation Plan');
    lines.push('');
    lines.push('## 📊 Quick Stats');
    lines.push(`- **Total Files:** ${fileRelationships.size}`);
    lines.push(`- **Total Errors:** ${fixPlans.length}`);
    lines.push(`- **High Priority:** ${fixPlans.filter(p => p.priority === 'critical' || p.priority === 'high').length}`);
    lines.push(`- **Quick Wins:** ${fixPlans.filter(p => p.confidence >= 80).length}`);
    lines.push('');

    // Create fix sessions
    lines.push('## ⏰ Fix Sessions');
    lines.push('');

    // Session 1: Quick Wins (1 hour)
    lines.push('### Session 1: Quick Wins (1 hour)');
    const quickWins = fixPlans
      .filter(p => p.confidence >= 80 && !p.requiresManualReview)
      .slice(0, 10);
    
    lines.push(`**Goal:** Fix ${Math.min(10, quickWins.length)} high-confidence errors`);
    lines.push('**Files to fix:**');
    const quickWinFiles = new Set(quickWins.map(p => p.error.resource));
    quickWinFiles.forEach(file => {
      const errorsInFile = quickWins.filter(p => p.error.resource === file).length;
      lines.push(`- ${path.basename(file)} (${errorsInFile} errors)`);
    });
    lines.push('');

    // Session 2: Folder Focus (2 hours)
    lines.push('### Session 2: Folder Focus (2 hours)');
    const hierarchyGroups = await this.groupByHierarchy(fileRelationships);
    const topFolder = hierarchyGroups[0];
    if (topFolder) {
      lines.push(`**Goal:** Fix all errors in ${topFolder.name}`);
      lines.push(`**Files:** ${topFolder.files.map(f => path.basename(f)).join(', ')}`);
      lines.push(`**Total Errors:** ${topFolder.errors.length}`);
      lines.push('');
    }

    // Session 3: Shared Dependencies (2 hours)
    lines.push('### Session 3: Shared Dependencies (2 hours)');
    const connectionGroups = await this.groupByConnections(fileRelationships);
    const topConnection = connectionGroups[0];
    if (topConnection) {
      lines.push(`**Goal:** Fix interconnected files`);
      lines.push(`**Files:** ${topConnection.files.slice(0, 5).map(f => path.basename(f)).join(', ')}`);
      lines.push(`**Total Errors:** ${topConnection.errors.length}`);
      lines.push('');
    }

    // Command shortcuts
    lines.push('## 🚀 Quick Commands');
    lines.push('');
    lines.push('```bash');
    lines.push('# Start with quick wins');
    lines.push('pnpm fix:quick-wins');
    lines.push('');
    lines.push('# Focus on a folder');
    lines.push(`pnpm fix:folder "${topFolder?.name || 'src/app'}"`);
    lines.push('');
    lines.push('# Fix shared dependencies');
    lines.push('pnpm fix:connections');
    lines.push('');
    lines.push('# Track progress');
    lines.push('pnpm track:progress');
    lines.push('```');

    return lines.join('\n');
  }
}