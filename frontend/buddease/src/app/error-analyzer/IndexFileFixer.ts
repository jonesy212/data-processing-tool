// src/app/error-analyzer/IndexFileFixer.ts
import fs from 'fs';
import path from 'path';
import { TSCompilerError } from '@/app/error-analyzer/ErrorFixManager';

export class IndexFileFixer {
  private projectRoot: string;
  
  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }
  
  analyzeIndexFiles(errors: TSCompilerError[]): {
    indexFiles: Array<{
      fullPath: string;
      displayPath: string;
      errorCount: number;
      errors: TSCompilerError[];
      priority: 'critical' | 'high' | 'medium' | 'low';
      parentFolder: string;
      errorTypes: string[];
    }>;
    recommendations: string[];
  } {
    const indexFiles = new Map<string, any>();
    
    // Group errors by index file
    for (const error of errors) {
      const filePath = error.resource;
      if (filePath.endsWith('index.tsx') || filePath.endsWith('index.ts')) {
        if (!indexFiles.has(filePath)) {
          const relativePath = path.relative(this.projectRoot, filePath);
          const parentFolder = path.basename(path.dirname(filePath));
          
          indexFiles.set(filePath, {
            fullPath: filePath,
            displayPath: this.formatDisplayPath(filePath),
            errorCount: 0,
            errors: [],
            priority: 'medium',
            parentFolder,
            errorTypes: new Set<string>()
          });
        }
        
        const fileInfo = indexFiles.get(filePath)!;
        fileInfo.errorCount++;
        fileInfo.errors.push(error);
        fileInfo.errorTypes.add(error.code);
      }
    }
    
    // Calculate priorities
    const indexFilesArray = Array.from(indexFiles.values()).map(fileInfo => {
      const priority = this.calculatePriority(fileInfo);
      return { ...fileInfo, priority, errorTypes: Array.from(fileInfo.errorTypes) };
    });
    
    // Sort by priority
    const sortedIndexFiles = indexFilesArray.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    // Generate specific recommendations
    const recommendations = this.generateSpecificRecommendations(sortedIndexFiles);
    
    return {
      indexFiles: sortedIndexFiles,
      recommendations
    };
  }
  
  private formatDisplayPath(filePath: string): string {
    const relativePath = path.relative(this.projectRoot, filePath);
    const parts = relativePath.split('/');
    
    if (parts.length <= 2) {
      return relativePath; // root or direct child
    }
    
    // Format: parent-folder/index.tsx (grandparent/parent-folder/index.tsx)
    const parent = parts[parts.length - 2];
    const grandparent = parts.length > 2 ? parts[parts.length - 3] : '';
    
    return grandparent 
      ? `${grandparent}/${parent}/index.tsx` 
      : `${parent}/index.tsx`;
  }
  
  private calculatePriority(fileInfo: any): 'critical' | 'high' | 'medium' | 'low' {
    const { fullPath, errorCount, parentFolder } = fileInfo;
    
    // Critical: Root index files or entry points
    if (fullPath.includes('/src/index.ts') || fullPath.includes('/src/index.tsx') ||
        fullPath.endsWith('/index.tsx') && parentFolder === 'src') {
      return 'critical';
    }
    
    // High: App entry points or main components
    if (parentFolder === 'app' || parentFolder === 'pages' || 
        parentFolder === 'components' && errorCount > 3) {
      return 'high';
    }
    
    // Medium: Everything else with errors
    if (errorCount > 0) {
      return 'medium';
    }
    
    return 'low';
  }
  
  private generateSpecificRecommendations(indexFiles: any[]): string[] {
    const recommendations: string[] = [];
    
    const criticalFiles = indexFiles.filter(f => f.priority === 'critical');
    const highFiles = indexFiles.filter(f => f.priority === 'high');
    
    if (criticalFiles.length > 0) {
      recommendations.push(`**Critical Index Files:** Fix these first - they're application entry points:`);
      criticalFiles.forEach(file => {
        recommendations.push(`  • ${file.displayPath} (${file.errorCount} errors)`);
      });
    }
    
    if (highFiles.length > 0) {
      recommendations.push(`**High Priority Index Files:** Fix these next:`);
      highFiles.slice(0, 3).forEach(file => {
        recommendations.push(`  • ${file.displayPath} (${file.errorCount} errors)`);
      });
    }
    
    // Batch fix recommendation for common error types
    const allErrorTypes = new Set<string>();
    indexFiles.forEach(f => f.errorTypes.forEach((t: string) => allErrorTypes.add(t)));
    
    if (allErrorTypes.size > 0) {
      const errorTypeCounts = new Map<string, number>();
      indexFiles.forEach(f => {
        f.errorTypes.forEach((t: string) => {
          errorTypeCounts.set(t, (errorTypeCounts.get(t) || 0) + 1);
        });
      });
      
      const mostCommon = Array.from(errorTypeCounts.entries())
        .sort((a, b) => b[1] - a[1])[0];
      
      if (mostCommon) {
        recommendations.push(`**Batch Fix:** ${mostCommon[1]} index files have TS${mostCommon[0]} errors`);
      }
    }
    
    return recommendations;
  }
  
  // Quick method to get just the problematic index files
  getProblematicIndexFiles(errors: TSCompilerError[]): string[] {
    const analysis = this.analyzeIndexFiles(errors);
    return analysis.indexFiles
      .filter(f => f.errorCount > 0)
      .map(f => f.displayPath);
  }
}