ComprehensiveFrontendAnalyzer.ts
import { FrontendAnalysis } from '@/core/generators/corrections/analyzers/frontendAnalyzer';
import { ReactWebAnalyzer } from '@/core/generators/corrections/analyzers/ReactWebAnalyzer';
import { Correction } from '@/core/generators/corrections/CorrectionGenerator';
/**
 * Comprehensive Frontend Analyzer that combines both approaches
 */
export class ComprehensiveFrontendAnalyzer {
  private reactWebAnalyzer: ReactWebAnalyzer;

  constructor() {
    this.reactWebAnalyzer = new ReactWebAnalyzer();
  }

  /**
   * Main analysis method combining both approaches
   */
  async analyzeComprehensive(fileOrDirPath: string): Promise<{
    fileAnalysis: FrontendAnalysis[];
    reactAnalysis: Correction[];
    directoryAnalysis?: DirectoryAnalysis;
    configAnalysis: {
      nextJsConfig: Correction[];
      viteConfig: Correction[];
      dependencies: Correction[];
      buildConfig: Correction[];
    };
  }> {
    const results = {
      fileAnalysis: [] as FrontendAnalysis[],
      reactAnalysis: [] as Correction[],
      directoryAnalysis: undefined as DirectoryAnalysis | undefined,
      configAnalysis: {
        nextJsConfig: [] as Correction[],
        viteConfig: [] as Correction[],
        dependencies: [] as Correction[],
        buildConfig: [] as Correction[]
      }
    };

    try {
      // Check if path is file or directory
      const stats = await fs.promises.stat(fileOrDirPath);
      
      if (stats.isDirectory()) {
        // Analyze entire directory
        results.directoryAnalysis = await this.analyzeDirectoryStructure(fileOrDirPath);
        
        // Get all source files
        const sourceFiles = await this.getSourceFiles(fileOrDirPath);
        
        // Analyze each file with both approaches
        for (const file of sourceFiles) {
          const fileAnalysis = await this.analyzeSingleFile(file);
          const reactIssues = await this.analyzeReactSpecificPatterns(file);
          
          // Combine results
          results.fileAnalysis.push({
            ...fileAnalysis,
            reactIssues,
            reactPatterns: this.extractReactPatterns(reactIssues)
          });
        }
        
      } else {
        // Single file analysis
        const fileAnalysis = await this.analyzeSingleFile(fileOrDirPath);
        const reactIssues = await this.analyzeReactSpecificPatterns(fileOrDirPath);
        
        results.fileAnalysis.push({
          ...fileAnalysis,
          reactIssues,
          reactPatterns: this.extractReactPatterns(reactIssues)
        });
      }
      
      // Get React configuration analysis
      results.reactAnalysis = await this.reactWebAnalyzer.analyze();
      
      // Categorize React analysis
      results.configAnalysis = this.categorizeCorrections(results.reactAnalysis);
      
    } catch (error) {
      console.error('Comprehensive analysis failed:', error);
      // Add error to results
      results.fileAnalysis.push(this.createErrorAnalysis(fileOrDirPath, error));
    }
    
    return results;
  }

  /**
   * Analyze directory structure (enhanced version)
   */
  private async analyzeDirectoryStructure(dirPath: string): Promise<DirectoryAnalysis> {
    const result: DirectoryAnalysis = {
      totalFiles: 0,
      totalDirectories: 0,
      totalSize: 0,
      byExtension: {},
      byType: {},
      largestFiles: [],
      mostComplexFiles: []
    };

    const fileAnalyses: FrontendAnalysis[] = [];

    async function traverseDir(currentPath: string, depth: number, maxDepth = 10) {
      if (depth > maxDepth) return;

      try {
        const items = await fs.promises.readdir(currentPath, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(currentPath, item.name);
          
          if (item.isDirectory()) {
            // Skip node_modules and hidden directories
            if (item.name === 'node_modules' || item.name.startsWith('.')) {
              continue;
            }
            
            result.totalDirectories++;
            await traverseDir(fullPath, depth + 1, maxDepth);
            
          } else if (item.isFile()) {
            result.totalFiles++;
            
            const stats = await fs.promises.stat(fullPath);
            result.totalSize += stats.size;
            
            const ext = path.extname(item.name).toLowerCase();
            result.byExtension[ext] = (result.byExtension[ext] || 0) + 1;
            
            // Categorize by type
            const fileType = this.categorizeFileType(ext);
            result.byType[fileType] = (result.byType[fileType] || 0) + 1;
            
            // Analyze source files
            if (this.isSourceFile(ext)) {
              try {
                const analysis = await this.analyzeSingleFile(fullPath);
                fileAnalyses.push(analysis);
                
                // Track largest files
                result.largestFiles.push({ path: fullPath, size: stats.size });
                
                // Track most complex files
                const complexity = analysis.complexity.lines * analysis.complexity.depth;
                result.mostComplexFiles.push({ path: fullPath, complexity });
              } catch (error) {
                console.warn(`Could not analyze file ${fullPath}:`, error);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error traversing directory ${currentPath}:`, error);
      }
    }

    await traverseDir.call(this, dirPath, 0);

    // Sort and keep top 10
    result.largestFiles.sort((a, b) => b.size - a.size).splice(10);
    result.mostComplexFiles.sort((a, b) => b.complexity - a.complexity).splice(10);

    return result;
  }

  /**
   * Analyze single file (combines AST and pattern analysis)
   */
  private async analyzeSingleFile(filePath: string): Promise<FrontendAnalysis> {
    const result: FrontendAnalysis = {
      filePath,
      fileType: path.extname(filePath),
      fileSize: 0,
      imports: [],
      exports: [],
      components: [],
      hooks: [],
      dependencies: [],
      complexity: {
        lines: 0,
        functions: 0,
        classes: 0,
        depth: 0
      },
      errors: [],
      warnings: [],
      reactIssues: [],
      reactPatterns: []
    };

    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        result.errors.push(`File not found: ${filePath}`);
        return result;
      }

      // Get file stats
      const stats = await fs.promises.stat(filePath);
      result.fileSize = stats.size;

      // Read file content
      const content = await fs.promises.readFile(filePath, 'utf8');
      const lines = content.split('\n');
      result.complexity.lines = lines.length;

      // Check file type and analyze accordingly
      const ext = path.extname(filePath).toLowerCase();
      
      if (['.tsx', '.jsx', '.ts', '.js'].includes(ext)) {
        await this.analyzeJavaScriptFile(filePath, content, result);
        
        // Run React-specific pattern analysis
        const reactIssues = await this.analyzeReactSourceFileForPatterns(content, filePath);
        result.reactIssues = reactIssues;
        result.reactPatterns = this.extractReactPatterns(reactIssues);
        
      } else if (['.css', '.scss', '.sass', '.less'].includes(ext)) {
        await this.analyzeStyleFile(content, result);
      } else if (ext === '.json') {
        await this.analyzeJsonFile(content, result);
      } else {
        result.warnings.push(`File type ${ext} not fully supported for analysis`);
      }

      // Calculate additional metrics
      this.calculateComplexityMetrics(content, result);
      this.extractDependencies(content, result);

    } catch (error) {
      result.errors.push(`Error analyzing file: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }

  /**
   * Analyze JavaScript/TypeScript file using AST
   */
  private async analyzeJavaScriptFile(filePath: string, content: string, result: FrontendAnalysis) {
    try {
      // Parse the file with Babel
      const ast = parse(content, {
        sourceType: 'module',
        plugins: [
          'jsx',
          'typescript',
          'decorators-legacy',
          'classProperties',
          'dynamicImport'
        ]
      });

      // Track import statements
      traverse(ast, {
        ImportDeclaration(nodePath) {
          const importNode = nodePath.node;
          const importInfo = {
            source: importNode.source.value,
            specifiers: [],
            isDefault: false,
            isNamespace: false
          };

          importNode.specifiers.forEach(specifier => {
            if (specifier.type === 'ImportDefaultSpecifier') {
              importInfo.specifiers.push(specifier.local.name);
              importInfo.isDefault = true;
            } else if (specifier.type === 'ImportNamespaceSpecifier') {
              importInfo.specifiers.push(specifier.local.name);
              importInfo.isNamespace = true;
            } else if (specifier.type === 'ImportSpecifier') {
              importInfo.specifiers.push(specifier.local.name);
            }
          });

          result.imports.push(importInfo);
        },

        ExportDefaultDeclaration(nodePath) {
          result.exports.push({
            name: 'default',
            type: 'default'
          });
        },

        ExportNamedDeclaration(nodePath) {
          const exportNode = nodePath.node;
          if (exportNode.declaration) {
            if (exportNode.declaration.type === 'FunctionDeclaration' && exportNode.declaration.id) {
              result.exports.push({
                name: exportNode.declaration.id.name,
                type: 'named'
              });
            } else if (exportNode.declaration.type === 'ClassDeclaration' && exportNode.declaration.id) {
              result.exports.push({
                name: exportNode.declaration.id.name,
                type: 'named'
              });
            } else if (exportNode.declaration.type === 'VariableDeclaration') {
              exportNode.declaration.declarations.forEach(declaration => {
                if (declaration.id.type === 'Identifier') {
                  result.exports.push({
                    name: declaration.id.name,
                    type: 'named'
                  });
                }
              });
            }
          }
        },

        // Detect React components
        FunctionDeclaration(nodePath) {
          const funcNode = nodePath.node;
          if (funcNode.id && this.isComponentName(funcNode.id.name)) {
            this.analyzeComponent(funcNode, result, 'functional');
          }
        },

        VariableDeclaration(nodePath) {
          const varNode = nodePath.node;
          varNode.declarations.forEach(declaration => {
            if (declaration.init && 
                (declaration.init.type === 'ArrowFunctionExpression' || 
                 declaration.init.type === 'FunctionExpression') &&
                declaration.id.type === 'Identifier' &&
                this.isComponentName(declaration.id.name)) {
              this.analyzeComponent(declaration.init, result, 'functional');
            }
          });
        },

        ClassDeclaration(nodePath) {
          const classNode = nodePath.node;
          if (classNode.id && this.isComponentName(classNode.id.name)) {
            this.analyzeComponent(classNode, result, 'class');
          }
        },

        // Detect React hooks usage
        CallExpression(nodePath) {
          const callNode = nodePath.node;
          if (callNode.callee.type === 'Identifier') {
            const hookName = callNode.callee.name;
            if (this.isReactHook(hookName) && !result.hooks.includes(hookName)) {
              result.hooks.push(hookName);
            }
          }
        }
      });

    } catch (error) {
      result.errors.push(`Failed to parse JavaScript file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Analyze React source file for patterns
   */
  private async analyzeReactSourceFileForPatterns(content: string, filePath: string): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const lines = content.split('\n');
    
    const reactPatterns = [
      {
        pattern: /useState.*if.*\(|if.*useState|useEffect.*if.*\(|if.*useEffect/,
        type: 'error' as const,
        severity: 'critical' as const,
        message: 'React Hook called conditionally',
        fix: 'Move Hook outside of conditional logic'
      },
      {
        pattern: /useState.*\(.*\).*useState/,
        type: 'warning' as const,
        severity: 'high' as const,
        message: 'Multiple useState calls might indicate complex state',
        fix: 'Consider using useReducer for complex state'
      },
      {
        pattern: /useEffect.*\[\s*\]/,
        type: 'warning' as const,
        severity: 'medium' as const,
        message: 'Empty dependency array in useEffect',
        fix: 'Ensure empty dependency array is intentional'
      },
      {
        pattern: /<div.*onClick={.*}>/,
        type: 'suggestion' as const,
        severity: 'low' as const,
        message: 'Consider using <button> for clickable elements',
        fix: 'Replace div with button or add accessibility attributes'
      },
      {
        pattern: /key={index}/,
        type: 'warning' as const,
        severity: 'medium' as const,
        message: 'Using array index as React key',
        fix: 'Use unique stable IDs instead of array indices'
      }
    ];
    
    lines.forEach((line, index) => {
      for (const { pattern, type, severity, message, fix } of reactPatterns) {
        if (pattern.test(line)) {
          corrections.push({
            id: `react-pattern-${path.basename(filePath)}-${index}`,
            type,
            severity,
            message,
            file: filePath,
            code: line.trim(),
            fix,
            category: 'react-pattern',
            line: index + 1
          } as Correction);
        }
      }
    });
    
    return corrections;
  }

  /**
   * Analyze style file
   */
  private async analyzeStyleFile(content: string, result: FrontendAnalysis) {
    // Extract selectors
    const selectorRegex = /([^{}]+)\s*{/g;
    const selectors: string[] = [];
    let match;
    
    while ((match = selectorRegex.exec(content)) !== null) {
      selectors.push(match[1].trim());
    }
    
    result.warnings.push(`Found ${selectors.length} CSS selectors`);
  }

  /**
   * Analyze JSON file
   */
  private async analyzeJsonFile(content: string, result: FrontendAnalysis) {
    try {
      const json = JSON.parse(content);
      const keyCount = this.countKeys(json);
      result.warnings.push(`JSON structure: ${keyCount} keys`);
    } catch (error) {
      result.errors.push(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get all source files in directory
   */
  private async getSourceFiles(dirPath: string): Promise<string[]> {
    const sourceFiles: string[] = [];
    
    const traverse = async (currentPath: string) => {
      try {
        const items = await fs.promises.readdir(currentPath, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(currentPath, item.name);
          
          if (item.isDirectory() && !item.name.startsWith('.') && !item.name.includes('node_modules')) {
            await traverse(fullPath);
          } else if (item.isFile() && this.isSourceFile(item.name)) {
            sourceFiles.push(fullPath);
          }
        }
      } catch (error) {
        console.error(`Error traversing ${currentPath}:`, error);
      }
    };
    
    await traverse(dirPath);
    return sourceFiles;
  }

  /**
   * Check if file is a source file
   */
  private isSourceFile(filename: string): boolean {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.sass', '.less'];
    return extensions.some(ext => filename.endsWith(ext));
  }

  /**
   * Analyze React-specific patterns
   */
  private async analyzeReactSpecificPatterns(filePath: string): Promise<Correction[]> {
    if (!this.isSourceFile(filePath)) {
      return [];
    }
    
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      return this.analyzeReactSourceFileForPatterns(content, filePath);
    } catch (error) {
      console.error(`Error analyzing React patterns in ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Extract React patterns from corrections
   */
  private extractReactPatterns(corrections: Correction[]): Array<{
    pattern: string;
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    fix: string;
    line: number;
  }> {
    return corrections.map(correction => ({
      pattern: correction.code || '',
      type: correction.type,
      message: correction.message,
      fix: correction.fix || '',
      line: correction.line || 0
    }));
  }

  /**
   * Categorize file by extension
   */
  private categorizeFileType(extension: string): string {
    if (['.tsx', '.jsx'].includes(extension)) return 'React Component';
    if (['.ts', '.js'].includes(extension)) return 'JavaScript';
    if (['.css', '.scss', '.sass', '.less'].includes(extension)) return 'Stylesheet';
    if (['.json'].includes(extension)) return 'JSON';
    if (['.md', '.mdx'].includes(extension)) return 'Documentation';
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(extension)) return 'Image';
    return 'Other';
  }

  /**
   * Check if function name indicates a React component
   */
  private isComponentName(name: string): boolean {
    return /^[A-Z]/.test(name) || 
           name.endsWith('Component') || 
           name.includes('Container') || 
           name.includes('Page');
  }

  /**
   * Check if a function is a React hook
   */
  private isReactHook(name: string): boolean {
    return name.startsWith('use') && 
           name !== 'use' && 
           /^use[A-Z]/.test(name);
  }

  /**
   * Count keys in a JSON object
   */
  private countKeys(obj: any): number {
    if (typeof obj !== 'object' || obj === null) return 0;
    
    let count = 0;
    if (Array.isArray(obj)) {
      for (const item of obj) {
        count += this.countKeys(item);
      }
    } else {
      count += Object.keys(obj).length;
      for (const key in obj) {
        count += this.countKeys(obj[key]);
      }
    }
    
    return count;
  }

  /**
   * Calculate complexity metrics
   */
  private calculateComplexityMetrics(content: string, result: FrontendAnalysis) {
    const lines = content.split('\n');
    
    // Count functions and classes
    const functionRegex = /(function\s+\w+|const\s+\w+\s*=\s*(\([^)]*\)|\(\))\s*=>|async\s+function|\w+\s*\([^)]*\)\s*{)/g;
    const classRegex = /class\s+\w+/g;
    
    let functionCount = 0;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      functionCount++;
    }
    
    let classCount = 0;
    while ((match = classRegex.exec(content)) !== null) {
      classCount++;
    }
    
    // Calculate nesting depth
    let maxDepth = 0;
    let currentDepth = 0;
    
    for (const line of lines) {
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      
      currentDepth += openBraces - closeBraces;
      maxDepth = Math.max(maxDepth, currentDepth);
    }
    
    result.complexity = {
      lines: lines.length,
      functions: functionCount,
      classes: classCount,
      depth: maxDepth
    };
  }

  /**
   * Extract dependencies from content
   */
  private extractDependencies(content: string, result: FrontendAnalysis) {
    const importRegex = /import\s+(?:(?:\*\s+as\s+\w+|\{[^}]*\}|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
    const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
    
    const dependencies = new Set<string>();
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      dependencies.add(match[1]);
    }
    
    while ((match = requireRegex.exec(content)) !== null) {
      dependencies.add(match[1]);
    }
    
    result.dependencies = Array.from(dependencies);
  }

  /**
   * Analyze component from AST
   */
  private analyzeComponent(node: any, result: FrontendAnalysis, type: 'functional' | 'class' | 'unknown') {
    const componentName = node.id?.name || 'Anonymous';
    
    const component = {
      name: componentName,
      type,
      hasProps: false,
      hasState: false,
      lineCount: 0
    };

    // Check for props usage
    if (node.params && node.params.length > 0) {
      component.hasProps = true;
    }

    // Check for state usage
    if (type === 'functional') {
      if (result.hooks.some(hook => ['useState', 'useReducer', 'useContext'].includes(hook))) {
        component.hasState = true;
      }
    } else if (type === 'class') {
      component.hasState = true;
    }

    // Count lines
    if (node.loc) {
      component.lineCount = node.loc.end.line - node.loc.start.line;
    }

    result.components.push(component);
  }

  /**
   * Extract line number from file and code snippet
   */
  private extractLineNumber(filePath: string, codeSnippet: string): number {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(codeSnippet.trim())) {
          return i + 1;
        }
      }
    } catch {
      // Ignore errors
    }
    return 0;
  }

  /**
   * Categorize corrections
   */
  private categorizeCorrections(corrections: Correction[]): {
    nextJsConfig: Correction[];
    viteConfig: Correction[];
    dependencies: Correction[];
    buildConfig: Correction[];
  } {
    return {
      nextJsConfig: corrections.filter(c => c.file?.includes('next.config')),
      viteConfig: corrections.filter(c => c.file?.includes('vite.config')),
      dependencies: corrections.filter(c => c.file?.includes('package.json')),
      buildConfig: corrections.filter(c => c.category === 'compilation' || c.category === 'build')
    };
  }

  /**
   * Create error analysis for failed files
   */
  private createErrorAnalysis(filePath: string, error: any): FrontendAnalysis {
    return {
      filePath,
      fileType: path.extname(filePath),
      fileSize: 0,
      imports: [],
      exports: [],
      components: [],
      hooks: [],
      dependencies: [],
      complexity: {
        lines: 0,
        functions: 0,
        classes: 0,
        depth: 0
      },
      errors: [`Analysis failed: ${error instanceof Error ? error.message : String(error)}`],
      warnings: [],
      reactIssues: [],
      reactPatterns: []
    };
  }

  /**
   * Generate comprehensive report
   */
  async generateComprehensiveReport(fileOrDirPath: string): Promise<string> {
    const analysis = await this.analyzeComprehensive(fileOrDirPath);
    
    let report = '# 🎯 Comprehensive Frontend Analysis Report\n\n';
    
    // Summary Section
    report += '## 📊 Executive Summary\n\n';
    
    const totalComponents = analysis.fileAnalysis.flatMap(f => f.components).length;
    const totalIssues = analysis.reactAnalysis.length;
    const criticalIssues = analysis.reactAnalysis.filter(c => c.severity === 'critical').length;
    const highIssues = analysis.reactAnalysis.filter(c => c.severity === 'high').length;
    
    report += `- **Files Analyzed**: ${analysis.fileAnalysis.length}\n`;
    report += `- **Components Found**: ${totalComponents}\n`;
    report += `- **Total Issues**: ${totalIssues}\n`;
    report += `- **Critical Issues**: ${criticalIssues}\n`;
    report += `- **High Priority Issues**: ${highIssues}\n\n`;
    
    // File Analysis Details
    if (analysis.fileAnalysis.length > 0) {
      report += '## 📁 File Analysis Details\n\n';
      
      // Group by file type
      const byType: Record<string, number> = {};
      analysis.fileAnalysis.forEach(file => {
        const type = file.fileType;
        byType[type] = (byType[type] || 0) + 1;
      });
      
      report += '### Files by Type:\n';
      for (const [type, count] of Object.entries(byType)) {
        report += `- ${type}: ${count}\n`;
      }
      report += '\n';
      
      // Most complex files
      const mostComplex = [...analysis.fileAnalysis]
        .sort((a, b) => (b.complexity.lines * b.complexity.depth) - (a.complexity.lines * a.complexity.depth))
        .slice(0, 5);
      
      if (mostComplex.length > 0) {
        report += '### ⚠️ Most Complex Files (Attention Needed):\n';
        mostComplex.forEach(file => {
          const complexityScore = file.complexity.lines * file.complexity.depth;
          report += `- **${path.basename(file.filePath)}**\n`;
          report += `  - Lines: ${file.complexity.lines}\n`;
          report += `  - Depth: ${file.complexity.depth}\n`;
          report += `  - Components: ${file.components.length}\n`;
          report += `  - Complexity Score: ${complexityScore}\n`;
        });
        report += '\n';
      }
    }
    
    // React Issues
    if (analysis.reactAnalysis.length > 0) {
      report += '## ⚛️ React-Specific Issues\n\n';
      
      // Critical Issues
      const critical = analysis.reactAnalysis.filter(c => c.severity === 'critical');
      if (critical.length > 0) {
        report += '### 🔴 Critical Issues (Fix Immediately):\n';
        critical.forEach(issue => {
          report += `- **${issue.message}**\n`;
          report += `  - File: ${issue.file}\n`;
          if (issue.line) report += `  - Line: ${issue.line}\n`;
          if (issue.code) report += `  - Code: \`${issue.code.substring(0, 100)}${issue.code.length > 100 ? '...' : ''}\`\n`;
          report += `  - Fix: ${issue.fix}\n\n`;
        });
      }
      
      // High Issues
      const high = analysis.reactAnalysis.filter(c => c.severity === 'high');
      if (high.length > 0) {
        report += '### 🟠 High Priority Issues:\n';
        high.forEach(issue => {
          report += `- ${issue.message} (${issue.file})\n`;
        });
        report += '\n';
      }
      
      // Configuration Issues
      if (analysis.configAnalysis.nextJsConfig.length > 0) {
        report += '### ⚙️ Next.js Configuration Issues:\n';
        analysis.configAnalysis.nextJsConfig.forEach(issue => {
          report += `- ${issue.message}\n`;
        });
        report += '\n';
      }
      
      if (analysis.configAnalysis.viteConfig.length > 0) {
        report += '### ⚡ Vite Configuration Issues:\n';
        analysis.configAnalysis.viteConfig.forEach(issue => {
          report += `- ${issue.message}\n`;
        });
        report += '\n';
      }
    }
    
    // Directory Analysis
    if (analysis.directoryAnalysis) {
      report += '## 📂 Directory Structure Analysis\n\n';
      report += `- **Total Files**: ${analysis.directoryAnalysis.totalFiles}\n`;
      report += `- **Total Directories**: ${analysis.directoryAnalysis.totalDirectories}\n`;
      report += `- **Total Size**: ${formatFileSize(analysis.directoryAnalysis.totalSize)}\n\n`;
      
      // Largest files
      if (analysis.directoryAnalysis.largestFiles.length > 0) {
        report += '### 📈 Largest Files:\n';
        analysis.directoryAnalysis.largestFiles.forEach(file => {
          report += `- ${path.basename(file.path)}: ${formatFileSize(file.size)}\n`;
        });
        report += '\n';
      }
    }
    
    // Recommendations
    report += '## 🎯 Recommendations\n\n';
    
    const allIssues = [
      ...analysis.fileAnalysis.flatMap(f => f.reactIssues),
      ...analysis.reactAnalysis
    ];
    
    // Priority recommendations
    const hasCriticalIssues = allIssues.some(i => i.severity === 'critical');
    const hasHighIssues = allIssues.some(i => i.severity === 'high');
    
    if (hasCriticalIssues) {
      report += '### 🚨 Immediate Actions Required:\n';
      report += '1. Fix all critical React issues first\n';
      report += '2. Verify React and React DOM version alignment\n';
      report += '3. Check for conditional hook calls\n';
      report += '4. Ensure proper component lifecycle management\n\n';
    }
    
    if (hasHighIssues) {
      report += '### 📋 Recommended Improvements:\n';
      report += '1. Address high-priority React pattern violations\n';
      report += '2. Optimize component structure and complexity\n';
      report += '3. Review and update build configuration\n';
      report += '4. Implement proper error boundaries\n\n';
    }
    
    // Performance Recommendations
    const complexFiles = analysis.fileAnalysis.filter(f => 
      f.complexity.lines > 200 || f.complexity.depth > 5
    );
    
    if (complexFiles.length > 0) {
      report += '### 🚀 Performance Optimization Opportunities:\n';
      report += '1. Split complex components into smaller ones\n';
      report += '2. Implement lazy loading for large components\n';
      report += '3. Use React.memo for expensive re-renders\n';
      report += '4. Consider code splitting for large bundles\n\n';
    }
    
    // Footer
    report += '---\n';
    report += 'Report generated by ComprehensiveFrontendAnalyzer\n';
    report += `Generated at: ${new Date().toISOString()}\n`;
    
    return report;
  }

  /**
   * Export analysis results to JSON file
   */
  async exportAnalysisToJson(fileOrDirPath: string, outputPath: string): Promise<void> {
    const analysis = await this.analyzeComprehensive(fileOrDirPath);
    const jsonData = JSON.stringify(analysis, null, 2);
    
    await fs.promises.writeFile(outputPath, jsonData, 'utf8');
    console.log(`Analysis exported to: ${outputPath}`);
  }

  /**
   * Get quick health check
   */
  async getHealthCheck(fileOrDirPath: string): Promise<{
    status: 'healthy' | 'needs-attention' | 'critical';
    score: number;
    summary: string;
  }> {
    const analysis = await this.analyzeComprehensive(fileOrDirPath);
    
    let score = 100;
    let issues = 0;
    
    // Deduct points for issues
    analysis.reactAnalysis.forEach(issue => {
      switch (issue.severity) {
        case 'critical': score -= 20; issues += 3; break;
        case 'high': score -= 10; issues += 2; break;
        case 'medium': score -= 5; issues += 1; break;
        case 'low': score -= 2; break;
      }
    });
    
    // Check for complex files
    const complexFiles = analysis.fileAnalysis.filter(f => f.complexity.lines > 300);
    score -= complexFiles.length * 5;
    
    // Ensure score doesn't go below 0
    score = Math.max(0, score);
    
    let status: 'healthy' | 'needs-attention' | 'critical';
    if (score >= 80) {
      status = 'healthy';
    } else if (score >= 60) {
      status = 'needs-attention';
    } else {
      status = 'critical';
    }
    
    const summary = analysis.reactAnalysis.length === 0 
      ? 'No critical issues found. Codebase appears healthy.'
      : `Found ${analysis.reactAnalysis.length} issues that need attention.`;
    
    return {
      status,
      score: Math.round(score),
      summary
    };
  }
}

Export singleton instance for easy use
export const comprehensiveAnalyzer = new ComprehensiveFrontendAnalyzer();

Also export the original functions for backward compatibility
export {
    analyzeDirectory, analyzeFrontendStructure, buildDependencyMap, formatFileSize, generateAnalysisReport
} from './frontendAnalyzer';
