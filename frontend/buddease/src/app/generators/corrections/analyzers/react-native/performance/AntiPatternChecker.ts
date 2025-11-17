// AntiPatternChecker.ts
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import { BaseAnalyzer } from '@/app/generators/corrections/analyzers/BaseAnalyzer'
import path from 'path';
import fs from 'fs';

export class AntiPatternChecker extends BaseAnalyzer {
  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    // Scan for common React/React Native anti-patterns
    const codeFiles = this.findCodeFiles();
    
    for (const filePath of codeFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileCorrections = this.checkForPerformanceAntiPatterns(content, filePath);
        corrections.push(...fileCorrections);
        
        // Check for additional anti-patterns
        const additionalCorrections = this.checkForCommonAntiPatterns(content, filePath);
        corrections.push(...additionalCorrections);
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    // Check for project-level anti-patterns
    const projectCorrections = this.checkProjectLevelAntiPatterns();
    corrections.push(...projectCorrections);

    return corrections;
  }

  checkForPerformanceAntiPatterns(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];
    const lineCount = content.split('\n').length;
    
    // Large component/file detection
    if (lineCount > 300) {
      corrections.push(this.createCorrection(
        `large-component-${path.basename(filePath)}`,
        'suggestion',
        'medium',
        'Large component file detected',
        filePath,
        `File has ${lineCount} lines`,
        'Consider splitting component into smaller, focused components',
        'performance'
      ));
    }

    // Complex render method with nested conditionals
    const renderMethodPattern = /render\(\)\s*\{[^}]*\{[^}]*\{/g;
    if (content.match(renderMethodPattern)) {
      corrections.push(this.createCorrection(
        `complex-render-${path.basename(filePath)}`,
        'warning',
        'medium',
        'Complex render method with nested conditionals',
        filePath,
        this.extractCodeSnippet(content, renderMethodPattern),
        'Simplify render method or extract conditional logic',
        'performance'
      ));
    }

    // Inline function definitions in render
    const inlineFunctionPattern = /(onPress|onClick|onChange)={\s*\([^)]*\)\s*=>/g;
    if (content.match(inlineFunctionPattern)) {
      corrections.push(this.createCorrection(
        `inline-function-${path.basename(filePath)}`,
        'warning',
        'medium',
        'Inline function definition in props',
        filePath,
        this.extractCodeSnippet(content, inlineFunctionPattern),
        'Define functions outside render method or use useCallback hook',
        'performance'
      ));
    }

    // Direct state mutation
    const stateMutationPattern = /this\.state\.[a-zA-Z_$][a-zA-Z0-9_$]*\s*=/g;
    if (content.match(stateMutationPattern)) {
      corrections.push(this.createCorrection(
        `state-mutation-${path.basename(filePath)}`,
        'error',
        'high',
        'Direct state mutation detected',
        filePath,
        this.extractCodeSnippet(content, stateMutationPattern),
        'Use setState or useState setter function to update state',
        'runtime'
      ));
    }

    // Missing keys in lists
    const listWithoutKeyPattern = /\.map\s*\(\s*\([^)]*\)\s*=>\s*<[^>]*?(?<!key=)[^>]*>/g;
    if (content.match(listWithoutKeyPattern)) {
      corrections.push(this.createCorrection(
        `missing-key-${path.basename(filePath)}`,
        'warning',
        'high',
        'Missing key prop in list rendering',
        filePath,
        this.extractCodeSnippet(content, listWithoutKeyPattern),
        'Add unique key prop to list items',
        'performance'
      ));
    }

    return corrections;
  }

  checkForCommonAntiPatterns(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];

    // Multiple useState hooks that could be combined
    const multipleUseStatePattern = /const\s+\[[^]]+\]\s*=\s*useState\(\)[\s\S]{0,200}const\s+\[[^]]+\]\s*=\s*useState\(\)/g;
    if (content.match(multipleUseStatePattern)) {
      corrections.push(this.createCorrection(
        `multiple-usestate-${path.basename(filePath)}`,
        'suggestion',
        'low',
        'Multiple useState hooks that could be combined',
        filePath,
        this.extractCodeSnippet(content, multipleUseStatePattern),
        'Consider combining related state into a single useReducer or object state',
        'performance'
      ));
    }

    // Missing dependency arrays in useEffect
    const useEffectNoDepsPattern = /useEffect\s*\(\s*\(\)\s*=>\s*\{[^}]*\}\s*\)\s*;?/g;
    if (content.match(useEffectNoDepsPattern)) {
      corrections.push(this.createCorrection(
        `useeffect-no-deps-${path.basename(filePath)}`,
        'warning',
        'medium',
        'useEffect without dependency array',
        filePath,
        this.extractCodeSnippet(content, useEffectNoDepsPattern),
        'Add dependency array to prevent unnecessary re-renders',
        'performance'
      ));
    }

    // Console.log in production code
    const consoleLogPattern = /console\.(log|warn|error|info)\(/g;
    const consoleMatches = content.match(consoleLogPattern);
    if (consoleMatches && consoleMatches.length > 3) {
      corrections.push(this.createCorrection(
        `console-log-${path.basename(filePath)}`,
        'suggestion',
        'low',
        'Multiple console statements in code',
        filePath,
        `Found ${consoleMatches.length} console statements`,
        'Remove console statements from production code',
        'performance'
      ));
    }

    // Deep object nesting in JSX
    const deepObjectPattern = /\{\s*[^{}]*\.[^{}]*\.[^{}]*\.[^{}]*[^{}]*\s*\}/g;
    if (content.match(deepObjectPattern)) {
      corrections.push(this.createCorrection(
        `deep-object-${path.basename(filePath)}`,
        'warning',
        'medium',
        'Deep object access in JSX',
        filePath,
        this.extractCodeSnippet(content, deepObjectPattern),
        'Extract complex object access before JSX rendering',
        'readability'
      ));
    }

    return corrections;
  }

  checkProjectLevelAntiPatterns(): Correction[] {
    const corrections: Correction[] = [];

    // Check for large node_modules
    const nodeModulesPath = path.resolve(process.cwd(), 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      try {
        const nodeModulesSize = this.getDirectorySize(nodeModulesPath);
        if (nodeModulesSize > 500 * 1024 * 1024) { // 500MB
          corrections.push(this.createCorrection(
            'large-node-modules',
            'suggestion',
            'low',
            'Large node_modules directory',
            'node_modules',
            `Size: ${(nodeModulesSize / 1024 / 1024).toFixed(2)}MB`,
            'Consider cleaning dependencies or using pnpm for better disk usage',
            'performance'
          ));
        }
      } catch {
        // Ignore size calculation errors
      }
    }

    // Check for multiple state management libraries
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        const stateLibraries = ['redux', 'mobx', 'recoil', 'zustand', '@reduxjs/toolkit'];
        const foundLibraries = stateLibraries.filter(lib => deps[lib]);
        
        if (foundLibraries.length > 1) {
          corrections.push(this.createCorrection(
            'multiple-state-libraries',
            'warning',
            'medium',
            'Multiple state management libraries detected',
            'package.json',
            `Found: ${foundLibraries.join(', ')}`,
            'Consider using a single state management solution',
            'structure'
          ));
        }
      } catch {
        // Ignore package.json parse errors
      }
    }

    return corrections;
  }

  private findCodeFiles(): string[] {
    const codeFiles: string[] = [];
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];
    const srcPath = path.resolve(process.cwd(), 'src');
    
    if (fs.existsSync(srcPath)) {
      this.findFilesRecursively(srcPath, extensions, codeFiles);
    }
    
    // Also check root directory for common React Native files
    const rootFiles = ['App.js', 'App.tsx', 'index.js', 'index.ts'];
    rootFiles.forEach(file => {
      const filePath = path.resolve(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        codeFiles.push(filePath);
      }
    });
    
    return codeFiles;
  }

  private findFilesRecursively(dir: string, extensions: string[], results: string[]): void {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules and other common directories
          if (!['node_modules', '.git', 'build', 'dist'].includes(item)) {
            this.findFilesRecursively(fullPath, extensions, results);
          }
        } else if (extensions.some(ext => item.endsWith(ext))) {
          results.push(fullPath);
        }
      }
    } catch {
      // Ignore directory read errors
    }
  }

  private getDirectorySize(dir: string): number {
    try {
      const items = fs.readdirSync(dir);
      let totalSize = 0;
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          totalSize += this.getDirectorySize(fullPath);
        } else {
          totalSize += stat.size;
        }
      }
      
      return totalSize;
    } catch {
      return 0;
    }
  }

  private extractCodeSnippet(content: string, pattern: RegExp, contextLines: number = 3): string {
    const lines = content.split('\n');
    let snippet = '';

    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        const start = Math.max(0, i - contextLines);
        const end = Math.min(lines.length, i + contextLines + 1);
        snippet = lines.slice(start, end).join('\n');
        break;
      }
    }

    return snippet.substring(0, 500);
  }
}