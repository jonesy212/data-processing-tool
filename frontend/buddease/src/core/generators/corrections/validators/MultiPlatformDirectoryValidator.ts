// MultiPlatformDirectoryValidator.ts

import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import { BaseAnalyzer } from '@/core/generators/corrections/analyzers/BaseAnalyzer';
import { fromDatabase, toDatabase } from '@/core/server/repository/mappers';
import AppTreeService from "@/core/services/AppTreeService";
import { FileTreeService } from '@/core/services/FileTreeService';
import type { FileTreeNode  } from '@/core/services/FileTreeService';
import { snapshotConfig } from '@/core/snapshots/snapshotContainerUtils';
import type { CorrectionCategory, CorrectionSeverity, CorrectionType } from '@/core/typings/correctionTypes';
import fs from 'fs';
import path from 'path';

export class MultiPlatformDirectoryValidator extends BaseAnalyzer {
  private projectRoot: string;
  private appTreeService: InstanceType<typeof AppTreeService>; 
  private fileTreeService: FileTreeService;
  private cache: Map<string, any> = new Map();

  // REPLACED: Hardcoded paths with dynamic pattern detection
  private directoryPatterns: DirectoryPatterns = {
    typePatterns: [
      { pattern: /types?\.(ts|d\.ts)$/, category: 'core-types' },
      { pattern: /typings?\/.*\.(ts|d\.ts)$/, category: 'centralized-types' },
      { pattern: /interfaces?\/.*\.(ts|d\.ts)$/, category: 'interface-types' },
      { pattern: /models?\/.*\.(ts|d\.ts)$/, category: 'model-types' }
    ],
    utilityPatterns: [
      { pattern: /utils?\/.*\.(ts|js)$/, category: 'utility-files' },
      { pattern: /hooks?\/.*\.(ts|js)$/, category: 'hook-files' },
      { pattern: /helpers?\/.*\.(ts|js)$/, category: 'helper-files' }
    ],
    componentPatterns: [
      { pattern: /components?\/.*\.(tsx|jsx|ts|js)$/, category: 'component-files' },
      { pattern: /(ui|elements)\/.*\.(tsx|jsx)$/, category: 'ui-component-files' }
    ],
    platformPatterns: [
      { pattern: /platform\/(android|ios|web|tablet|shared)/, category: 'platform-directories' },
      { pattern: /\.(gradle|xcodeproj|pbxproj)$/, category: 'platform-build-files' }
    ]
  };

  constructor(projectRoot: string = '.') {
    super();
    this.projectRoot = path.resolve(projectRoot);
    this.appTreeService = AppTreeService; 
    this.fileTreeService = new FileTreeService();
  }

  async analyze(): Promise<Correction[]> {
    const cacheKey = `analysis-${this.projectRoot}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const corrections: Correction[] = [];
    
    try {
      // Generate file tree first for dynamic analysis
      const fileTree = this.fileTreeService.generateFileTree(this.projectRoot);
      
      // Dynamically analyze project structure patterns
      const projectPatterns = await this.analyzeProjectPatterns(fileTree);
      
      // Use dynamic configuration based on detected patterns
      const projectConfig = this.getDynamicProjectConfig(projectPatterns);
      
      // Get tree statistics
      const treeStats = FileTreeService.getTreeStats(fileTree);
      
      // Use mapper utilities for data processing
      const analysisData = await this.getOptimizedAnalysisData(fileTree, treeStats);
      
      // Analyze structure with dynamic pattern matching
      const structureCorrections = await this.analyzeProjectStructureDynamic(
        analysisData, 
        fileTree,
        projectConfig,
        projectPatterns
      );
      
      corrections.push(...structureCorrections);
      
      // Platform validation using dynamic patterns
      const platformCorrections = await this.validatePlatformStructureDynamic(fileTree, projectPatterns);
      corrections.push(...platformCorrections);
      
      // Critical directories based on dynamic analysis
      const criticalCorrections = this.validateCriticalDirectoriesDynamic(fileTree, treeStats, projectPatterns);
      corrections.push(...criticalCorrections);
      
      // Cache the results
      this.cache.set(cacheKey, corrections);
      
    } catch (error) {
      console.error('Error analyzing project structure:', error);
      corrections.push(...await this.fallbackDynamicValidation());
    }

    return corrections;
  }

  // NEW: Dynamic pattern analysis
  private async analyzeProjectPatterns(fileTree: FileTreeNode): Promise<ProjectPatterns> {
    const patterns: ProjectPatterns = {
      typeLocations: new Map(),
      utilityLocations: new Map(),
      componentLocations: new Map(),
      platformLocations: new Map(),
      frameworkPatterns: new Set(),
      architecturePatterns: new Set()
    };

    // Analyze file tree for patterns
    this.analyzeTreeForPatterns(fileTree, patterns);

    // Detect framework and architecture patterns
    this.detectFrameworkPatterns(patterns);
    this.detectArchitecturePatterns(patterns);

    return patterns;
  }

  private analyzeTreeForPatterns(node: FileTreeNode, patterns: ProjectPatterns, currentPath: string = ''): void {
    const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
    
    // Check each pattern category
    this.checkPatternsAgainstPath(fullPath, patterns);
    
    // Recursively analyze children
    if (node.children && node.type === 'directory') {
      node.children.forEach(child => {
        this.analyzeTreeForPatterns(child, patterns, fullPath);
      });
    }
  }

  private checkPatternsAgainstPath(filePath: string, patterns: ProjectPatterns): void {
    // Check type patterns
    this.directoryPatterns.typePatterns.forEach(({ pattern, category }) => {
      if (pattern.test(filePath)) {
        const dir = path.dirname(filePath);
        patterns.typeLocations.set(category, dir);
      }
    });

    // Check utility patterns
    this.directoryPatterns.utilityPatterns.forEach(({ pattern, category }) => {
      if (pattern.test(filePath)) {
        const dir = path.dirname(filePath);
        patterns.utilityLocations.set(category, dir);
      }
    });

    // Check component patterns
    this.directoryPatterns.componentPatterns.forEach(({ pattern, category }) => {
      if (pattern.test(filePath)) {
        const dir = path.dirname(filePath);
        patterns.componentLocations.set(category, dir);
      }
    });

    // Check platform patterns
    this.directoryPatterns.platformPatterns.forEach(({ pattern, category }) => {
      if (pattern.test(filePath)) {
        const dir = path.dirname(filePath);
        patterns.platformLocations.set(category, dir);
      }
    });
  }

  private detectFrameworkPatterns(patterns: ProjectPatterns): void {
    if (patterns.typeLocations.has('centralized-types') || 
        Array.from(patterns.componentLocations.values()).some(loc => loc.includes('app/'))) {
      patterns.frameworkPatterns.add('nextjs');
    }

    // Detect React
    if (patterns.componentLocations.size > 0) {
      patterns.frameworkPatterns.add('react');
    }

    // Detect TypeScript
    if (patterns.typeLocations.size > 0) {
      patterns.frameworkPatterns.add('typescript');
    }
  }

  private detectArchitecturePatterns(patterns: ProjectPatterns): void {
    // Feature-based architecture
    if (Array.from(patterns.componentLocations.values()).some(loc => loc.includes('/features/'))) {
      patterns.architecturePatterns.add('feature-based');
    }

    // Layer-based architecture
    if (patterns.typeLocations.size > 0 && patterns.utilityLocations.size > 0) {
      patterns.architecturePatterns.add('layer-based');
    }

    // Multi-platform architecture
    if (patterns.platformLocations.size > 0) {
      patterns.architecturePatterns.add('multi-platform');
    }
  }

  // UPDATED: Dynamic configuration based on patterns
  private getDynamicProjectConfig(patterns: ProjectPatterns) {
    const baseConfig = {
      ...snapshotConfig,
      projectRoot: this.projectRoot,
      ignorePatterns: FileTreeService['IGNORE'] || [
        'node_modules', '.git', 'dist', 'build', '.next', 
        '.DS_Store', 'coverage', '.env', '*.log'
      ]
    };

    // Add dynamic configuration based on detected patterns
    return {
      ...baseConfig,
      patterns: {
        framework: Array.from(patterns.frameworkPatterns),
        architecture: Array.from(patterns.architecturePatterns),
        typeLocations: Object.fromEntries(patterns.typeLocations),
        utilityLocations: Object.fromEntries(patterns.utilityLocations),
        componentLocations: Object.fromEntries(patterns.componentLocations),
        platformLocations: Object.fromEntries(patterns.platformLocations)
      }
    };
  }

  // UPDATED: Dynamic structure analysis
  private async analyzeProjectStructureDynamic(
    analysisData: any, 
    fileTree: FileTreeNode,
    config: any,
    patterns: ProjectPatterns
  ): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    const allDirectories = FileTreeService.filterByType(fileTree, 'directory');
    const existingDirs = new Set(allDirectories.map(dir => dir.path.replace(this.projectRoot + path.sep, '')));
    
    // Get expected directories using dynamic pattern matching
    const expectedDirs = this.getExpectedDirectoriesDynamic(patterns, existingDirs);
    
    const dirChecks = expectedDirs.map(async (dir) => {
      const fullPath = path.join(this.projectRoot, dir);
      
      if (!fs.existsSync(fullPath)) {
        const severity = this.calculateDynamicSeverity(dir, patterns);
        
        return this.createCorrection(
          `missing-dir-${this.hashPath(dir)}`,
          'warning' as CorrectionType,
          severity,
          `Missing directory: ${dir}`,
          dir,
          this.generateDynamicSuggestion(dir, patterns),
          `Create ${dir} directory to maintain project consistency`,
          'structure' as CorrectionCategory
        );
      }
      return null;
    });

    const results = await Promise.all(dirChecks);
    return results.filter(Boolean) as Correction[];
  }

  // NEW: Dynamic directory expectations
  private getExpectedDirectoriesDynamic(patterns: ProjectPatterns, existingDirs: Set<string>): string[] {
    const expectedDirs: Set<string> = new Set();

    // Add directories based on type patterns
    if (patterns.typeLocations.size > 0) {
      expectedDirs.add(this.getCommonParentPath(Array.from(patterns.typeLocations.values())) || 'src/app/typings');
    }

    // Add directories based on utility patterns
    if (patterns.utilityLocations.size > 0) {
      expectedDirs.add(this.getCommonParentPath(Array.from(patterns.utilityLocations.values())) || 'src/utils');
    }

    // Add directories based on component patterns
    if (patterns.componentLocations.size > 0) {
      expectedDirs.add(this.getCommonParentPath(Array.from(patterns.componentLocations.values())) || 'src/app/components');
    }

    // Add platform directories if multi-platform detected
    if (patterns.architecturePatterns.has('multi-platform')) {
      expectedDirs.add('platform');
      ['android', 'ios', 'web', 'tablet', 'shared'].forEach(platform => {
        expectedDirs.add(`platform/${platform}`);
      });
    }

    // Add framework-specific directories
    if (patterns.frameworkPatterns.has('nextjs')) {
      expectedDirs.add('src/app/api');
      expectedDirs.add('public');
    }

    return Array.from(expectedDirs).sort();
  }

  // NEW: Find common parent path for related files
  private getCommonParentPath(paths: string[]): string | null {
    if (paths.length === 0) return null;
    if (paths.length === 1) return paths[0];

    const pathArrays = paths.map(p => p.split('/'));
    const minLength = Math.min(...pathArrays.map(arr => arr.length));
    
    let commonPath: string[] = [];
    for (let i = 0; i < minLength; i++) {
      const segment = pathArrays[0][i];
      if (pathArrays.every(arr => arr[i] === segment)) {
        commonPath.push(segment);
      } else {
        break;
      }
    }
    
    return commonPath.length > 0 ? commonPath.join('/') : null;
  }

  // UPDATED: Dynamic platform validation
  private async validatePlatformStructureDynamic(
    fileTree: FileTreeNode, 
    patterns: ProjectPatterns
  ): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    if (patterns.architecturePatterns.has('multi-platform')) {
      const platformDirs = FileTreeService.filterByType(fileTree, 'directory')
        .filter(dir => dir.path.includes('platform'));
      
      if (platformDirs.length > 0) {
        const platformRoot = path.join(this.projectRoot, 'platform');
        const platformSubdirs = fs.existsSync(platformRoot) 
          ? fs.readdirSync(platformRoot, { withFileTypes: true })
              .filter(dirent => dirent.isDirectory())
              .map(dirent => dirent.name)
          : [];
        
        const recommendedPlatforms = ['android', 'ios', 'web', 'tablet', 'shared'];
        recommendedPlatforms.forEach(platform => {
          if (!platformSubdirs.includes(platform)) {
            corrections.push(this.createCorrection(
              `platform-missing-${platform}`,
              'info' as CorrectionType,
              'low' as CorrectionSeverity,
              `Consider adding platform/${platform} for ${platform} support`,
              `platform/${platform}`,
              `// Platform directory for ${platform} specific code`,
              `mkdir platform/${platform}`,
              'structure' as CorrectionCategory
            ));
          }
        });
      }
    }
    
    return corrections;
  }

  // UPDATED: Dynamic critical directories
  private validateCriticalDirectoriesDynamic(
    fileTree: FileTreeNode, 
    treeStats: any,
    patterns: ProjectPatterns
  ): Correction[] {
    const corrections: Correction[] = [];
    
    const criticalDirs = this.getDynamicCriticalDirectories(treeStats, patterns);
    
    criticalDirs.forEach(({ path: dirPath, priority }) => {
      const fullPath = path.join(this.projectRoot, dirPath);
      if (!fs.existsSync(fullPath)) {
        corrections.push(this.createCorrection(
          `critical-missing-${this.hashPath(dirPath)}`,
          'error' as CorrectionType,
          priority,
          `Missing critical directory: ${dirPath}`,
          dirPath,
          `// Essential directory for ${patterns.frameworkPatterns.has('nextjs') ? 'Next.js' : 'project'} structure`,
          `Create ${dirPath} immediately`,
          'structure' as CorrectionCategory
        ));
      }
    });
    
    return corrections;
  }

  private getDynamicCriticalDirectories(
    treeStats: any,
    patterns: ProjectPatterns
  ): Array<{ path: string; priority: CorrectionSeverity }> {
    const critical: Array<{ path: string; priority: CorrectionSeverity }> = [
      { path: 'src', priority: 'high' as CorrectionSeverity },
    ];
    
    // Framework-specific critical directories
    if (patterns.frameworkPatterns.has('nextjs')) {
      critical.push({ path: 'src/app', priority: 'high' as CorrectionSeverity });
      critical.push({ path: 'public', priority: 'medium' as CorrectionSeverity });
    }
    
    critical.push({ path: 'package.json', priority: 'high' as CorrectionSeverity });
    
    return critical;
  }

  // UPDATED: Dynamic severity calculation
  private calculateDynamicSeverity(dir: string, patterns: ProjectPatterns): CorrectionSeverity {
    // Critical for framework-specific directories
    if (patterns.frameworkPatterns.has('nextjs') && dir === 'src/app') return 'high';
    if (dir === 'src') return 'high';
    
    // Medium for pattern-consistent directories
    if (patterns.typeLocations.size > 0 && dir.includes('types')) return 'medium';
    if (patterns.utilityLocations.size > 0 && dir.includes('utils')) return 'medium';
    
    return 'low';
  }

  // UPDATED: Dynamic suggestions
  private generateDynamicSuggestion(dir: string, patterns: ProjectPatterns): string {
    const framework = patterns.frameworkPatterns.has('nextjs') ? 'Next.js' : 
                     patterns.frameworkPatterns.has('react') ? 'React' : 'project';
    
    return `// Suggested ${framework} directory: ${dir}\n` +
           `// Based on detected patterns: ${Array.from(patterns.architecturePatterns).join(', ')}`;
  }

  // KEEPING: Existing optimized methods (unchanged)
  private async getOptimizedAnalysisData(fileTree: FileTreeNode, treeStats: any) {
    const rawAnalysis = await this.appTreeService.analyzeProject();
    const processedData = toDatabase({
      ...rawAnalysis,
      treeStats,
      timestamp: new Date()
    });
    return fromDatabase(processedData);
  }

  private hashPath(filePath: string): string {
    return Buffer.from(filePath).toString('base64').slice(0, 10);
  }

  private async fallbackDynamicValidation(): Promise<Correction[]> {
    const essentialDirs = ['src', 'package.json'];
    const corrections: Correction[] = [];
    
    essentialDirs.forEach(dir => {
      if (!fs.existsSync(path.join(this.projectRoot, dir))) {
        corrections.push(this.createCorrection(
          `essential-missing-${dir}`,
          'error' as CorrectionType,
          'high' as CorrectionSeverity,
          `Missing essential: ${dir}`,
          dir,
          `// Project requires ${dir}`,
          `Create ${dir}`,
          'structure' as CorrectionCategory
        ));
      }
    });
    
    return corrections;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// NEW: Dynamic pattern interfaces
interface DirectoryPatterns {
  typePatterns: PatternRule[];
  utilityPatterns: PatternRule[];
  componentPatterns: PatternRule[];
  platformPatterns: PatternRule[];
}

interface PatternRule {
  pattern: RegExp;
  category: string;
}

interface ProjectPatterns {
  typeLocations: Map<string, string>;
  utilityLocations: Map<string, string>;
  componentLocations: Map<string, string>;
  platformLocations: Map<string, string>;
  frameworkPatterns: Set<string>;
  architecturePatterns: Set<string>;
}