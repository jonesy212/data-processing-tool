utils/frontendAnalyzer.ts

import { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import fs from 'fs';
import path from 'path';


export interface ImportInfo {
  source: string;
  specifiers: string[];
  isDefault: boolean;
  isNamespace: boolean;
}

// Import the ReactWebAnalyzer or integrate its logic
export interface FrontendAnalysis {
  filePath: string;
  fileType: string;
  fileSize: number;
  imports: ImportInfo[];
  exports: Array<{
    name: string;
    type: 'default' | 'named' | 'namespace';
  }>;
  components: Array<{
    name: string;
    type: 'functional' | 'class' | 'unknown';
    hasProps: boolean;
    hasState: boolean;
    lineCount: number;
  }>;
  hooks: string[];
  dependencies: string[];
  complexity: {
    lines: number;
    functions: number;
    classes: number;
    depth: number;
  };
  errors: string[];
  warnings: string[];
  // ADD: React-specific analysis results
  reactIssues: Correction[]; // From ReactWebAnalyzer
  reactPatterns: Array<{
    pattern: string;
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    fix: string;
    line: number;
  }>;
}

export interface DirectoryAnalysis {
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
  byExtension: Record<string, number>;
  byType: Record<string, number>;
  largestFiles: Array<{ path: string; size: number }>;
  mostComplexFiles: Array<{ path: string; complexity: number }>;
}

export interface DependencyMap {
  [filePath: string]: {
    imports: string[];
    exports: string[];
    dependsOn: string[];
    dependedBy: string[];
  };
}


/**
 * Analyzes a single frontend file (TSX, TS, JSX, JS)
 */
export async function analyzeFrontendStructure(filePath: string): Promise<FrontendAnalysis> {
  const result: FrontendAnalysis = {
    filePath,
    fileType: path.extname(filePath),
    fileSize: 0,
    imports: [],
    exports: [],
    components: [],
    hooks: [],
    dependencies: [],
    reactIssues: [], 
    reactPatterns: [],
    complexity: {
      lines: 0,
      functions: 0,
      classes: 0,
      depth: 0
    },
    errors: [],
    warnings: []
  };

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      result.errors.push(`File not found: ${filePath}`);
      return result;
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    result.fileSize = stats.size;

    // Read file content
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    result.complexity.lines = lines.length;

    // Check file type and analyze accordingly
    const ext = path.extname(filePath).toLowerCase();
    
    if (['.tsx', '.jsx', '.ts', '.js'].includes(ext)) {
      await analyzeJavaScriptFile(filePath, content, result);
    } else if (['.css', '.scss', '.sass', '.less'].includes(ext)) {
      await analyzeStyleFile(content, result);
    } else if (ext === '.json') {
      await analyzeJsonFile(content, result);
    } else {
      // For other file types, just do basic analysis
      result.warnings.push(`File type ${ext} not fully supported for analysis`);
    }

    // Calculate additional metrics
    calculateComplexityMetrics(content, result);
    extractDependencies(content, result);

  } catch (error) {
    result.errors.push(`Error analyzing file: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Analyzes a JavaScript/TypeScript file using Babel
 */
async function analyzeJavaScriptFile(filePath: string, content: string, result: FrontendAnalysis) {
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
        // FIX: Explicitly type the importInfo object
        const importInfo: {
          source: string;
          specifiers: string[];  // Explicitly type as string array
          isDefault: boolean;
          isNamespace: boolean;
        } = {
          source: importNode.source.value,
          specifiers: [],  // Now correctly typed as string[]
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
          // Handle declarations like export function, export class
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

        // Handle export { name } from 'module'
        if (exportNode.specifiers) {
          exportNode.specifiers.forEach(specifier => {
            if (specifier.exported.type === 'Identifier') {
              result.exports.push({
                name: specifier.exported.name,
                type: 'named'
              });
            }
          });
        }
      },

      ExportAllDeclaration(nodePath) {
        result.exports.push({
          name: '*',
          type: 'namespace'
        });
      },

      // Detect React components
      FunctionDeclaration(nodePath) {
        const funcNode = nodePath.node;
        if (funcNode.id && isComponentName(funcNode.id.name)) {
          analyzeComponent(funcNode, result, 'functional');
        }
      },

      VariableDeclaration(nodePath) {
        const varNode = nodePath.node;
        varNode.declarations.forEach(declaration => {
          if (declaration.init && 
              (declaration.init.type === 'ArrowFunctionExpression' || 
               declaration.init.type === 'FunctionExpression') &&
              declaration.id.type === 'Identifier' &&
              isComponentName(declaration.id.name)) {
            analyzeComponent(declaration.init, result, 'functional');
          }
        });
      },

      ClassDeclaration(nodePath) {
        const classNode = nodePath.node;
        if (classNode.id && isComponentName(classNode.id.name)) {
          analyzeComponent(classNode, result, 'class');
        }
      },

      // Detect React hooks usage
      CallExpression(nodePath) {
        const callNode = nodePath.node;
        if (callNode.callee.type === 'Identifier') {
          const hookName = callNode.callee.name;
          if (isReactHook(hookName) && !result.hooks.includes(hookName)) {
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
 * Analyzes a style file (CSS, SCSS, etc.)
 */
async function analyzeStyleFile(content: string, result: FrontendAnalysis) {
  // Extract selectors
  const selectorRegex = /([^{}]+)\s*{/g;
  const selectors: string[] = [];
  let match;
  
  while ((match = selectorRegex.exec(content)) !== null) {
    selectors.push(match[1].trim());
  }
  
  // Count rules
  const ruleRegex = /([^:]+):\s*([^;]+);/g;
  const rules: string[] = [];
  
  while ((match = ruleRegex.exec(content)) !== null) {
    rules.push(`${match[1].trim()}: ${match[2].trim()}`);
  }
  
  // Extract variables
  const variableRegex = /--([\w-]+):\s*([^;]+);/g;
  const variables: string[] = [];
  
  while ((match = variableRegex.exec(content)) !== null) {
    variables.push(`--${match[1]}: ${match[2]}`);
  }
  
  // Add to analysis
  result.warnings.push(`Found ${selectors.length} selectors, ${rules.length} rules, ${variables.length} CSS variables`);
  
  // Store in a custom property
  (result as any).styleMetrics = {
    selectors,
    rules,
    variables
  };
}

/**
 * Analyzes a JSON file
 */
async function analyzeJsonFile(content: string, result: FrontendAnalysis) {
  try {
    const json = JSON.parse(content);
    
    // Analyze JSON structure
    const keyCount = countKeys(json);
    const depth = calculateDepth(json);
    
    result.warnings.push(`JSON structure: ${keyCount} keys, depth ${depth}`);
    
    // Store in a custom property
    (result as any).jsonMetrics = {
      keyCount,
      depth,
      type: Array.isArray(json) ? 'array' : 'object'
    };
  } catch (error) {
    result.errors.push(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Analyzes a component from AST
 */
function analyzeComponent(node: any, result: FrontendAnalysis, type: 'functional' | 'class' | 'unknown') {
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

  // Check for state usage (React hooks or class state)
  if (type === 'functional') {
    // Check for useState, useReducer, etc.
    if (result.hooks.some(hook => ['useState', 'useReducer', 'useContext'].includes(hook))) {
      component.hasState = true;
    }
  } else if (type === 'class') {
    // Check for this.state in class components
    component.hasState = true; // Assume class components have state
  }

  // Count lines (approximate)
  if (node.loc) {
    component.lineCount = node.loc.end.line - node.loc.start.line;
  }

  result.components.push(component);
}

/**
 * Calculate complexity metrics
 */
function calculateComplexityMetrics(content: string, result: FrontendAnalysis) {
  const lines = content.split('\n');
  
  // Count functions and classes (simple regex approach)
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
  
  // Calculate nesting depth (approximate)
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
function extractDependencies(content: string, result: FrontendAnalysis) {
  // Extract import statements (simple regex)
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
 * Check if a function name indicates a React component
 */
function isComponentName(name: string): boolean {
  // React components typically start with uppercase
  return /^[A-Z]/.test(name) || 
         name.endsWith('Component') || 
         name.includes('Container') || 
         name.includes('Page');
}

/**
 * Check if a function is a React hook
 */
function isReactHook(name: string): boolean {
  return name.startsWith('use') && 
         name !== 'use' && 
         /^use[A-Z]/.test(name);
}

/**
 * Count keys in a JSON object
 */
function countKeys(obj: any): number {
  if (typeof obj !== 'object' || obj === null) return 0;
  
  let count = 0;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      count += countKeys(item);
    }
  } else {
    count += Object.keys(obj).length;
    for (const key in obj) {
      count += countKeys(obj[key]);
    }
  }
  
  return count;
}

/**
 * Calculate depth of a JSON object
 */
function calculateDepth(obj: any, currentDepth = 0): number {
  if (typeof obj !== 'object' || obj === null) return currentDepth;
  
  let maxDepth = currentDepth;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      maxDepth = Math.max(maxDepth, calculateDepth(item, currentDepth + 1));
    }
  } else {
    for (const key in obj) {
      maxDepth = Math.max(maxDepth, calculateDepth(obj[key], currentDepth + 1));
    }
  }
  
  return maxDepth;
}

/**
 * Analyzes an entire directory
 */
export async function analyzeDirectory(directoryPath: string, maxDepth = 5): Promise<DirectoryAnalysis> {
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

  async function traverseDir(currentPath: string, depth: number) {
    if (depth > maxDepth) return;

    try {
      const items = fs.readdirSync(currentPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item.name);
        
        if (item.isDirectory()) {
          result.totalDirectories++;
          await traverseDir(fullPath, depth + 1);
        } else if (item.isFile()) {
          result.totalFiles++;
          
          const stats = fs.statSync(fullPath);
          result.totalSize += stats.size;
          
          const ext = path.extname(item.name).toLowerCase();
          result.byExtension[ext] = (result.byExtension[ext] || 0) + 1;
          
          // Categorize by type
          const fileType = categorizeFileType(ext);
          result.byType[fileType] = (result.byType[fileType] || 0) + 1;
          
          // Analyze file if it's a source file
          if (isSourceFile(ext)) {
            const analysis = await analyzeFrontendStructure(fullPath);
            fileAnalyses.push(analysis);
            
            // Track largest files
            result.largestFiles.push({ path: fullPath, size: stats.size });
            
            // Track most complex files
            const complexity = analysis.complexity.lines * analysis.complexity.depth;
            result.mostComplexFiles.push({ path: fullPath, complexity });
          }
        }
      }
    } catch (error) {
      console.error(`Error traversing directory ${currentPath}:`, error);
    }
  }

  await traverseDir(directoryPath, 0);

  // Sort and keep top 10
  result.largestFiles.sort((a, b) => b.size - a.size).splice(10);
  result.mostComplexFiles.sort((a, b) => b.complexity - a.complexity).splice(10);

  return result;
}

/**
 * Categorize file by extension
 */
function categorizeFileType(extension: string): string {
  if (['.tsx', '.jsx'].includes(extension)) return 'React Component';
  if (['.ts', '.js'].includes(extension)) return 'JavaScript';
  if (['.css', '.scss', '.sass', '.less'].includes(extension)) return 'Stylesheet';
  if (['.json'].includes(extension)) return 'JSON';
  if (['.md', '.mdx'].includes(extension)) return 'Documentation';
  if (['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(extension)) return 'Image';
  return 'Other';
}

/**
 * Check if file is a source file that should be analyzed
 */
function isSourceFile(extension: string): boolean {
  return ['.tsx', '.jsx', '.ts', '.js', '.css', '.scss', '.sass', '.less'].includes(extension);
}

/**
 * Builds a dependency map for the entire project
 */
export async function buildDependencyMap(directoryPath: string): Promise<DependencyMap> {
  const dependencyMap: DependencyMap = {};
  
  async function processFile(filePath: string) {
    if (!isSourceFile(path.extname(filePath))) return;
    
    const analysis = await analyzeFrontendStructure(filePath);
    
    dependencyMap[filePath] = {
      imports: analysis.imports.map(imp => imp.source),
      exports: analysis.exports.map(exp => exp.name),
      dependsOn: [],
      dependedBy: []
    };
  }
  
  async function traverseDir(currentPath: string) {
    try {
      const items = fs.readdirSync(currentPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item.name);
        
        if (item.isDirectory()) {
          await traverseDir(fullPath);
        } else if (item.isFile()) {
          await processFile(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error building dependency map:`, error);
    }
  }
  
  await traverseDir(directoryPath);
  
  // Calculate dependencies
  for (const [filePath, data] of Object.entries(dependencyMap)) {
    for (const importSource of data.imports) {
      // Find which file this import refers to
      for (const [otherFilePath, otherData] of Object.entries(dependencyMap)) {
        const fileName = path.basename(otherFilePath, path.extname(otherFilePath));
        if (importSource.includes(fileName) || otherData.exports.includes(importSource)) {
          data.dependsOn.push(otherFilePath);
          otherData.dependedBy.push(filePath);
        }
      }
    }
  }
  
  return dependencyMap;
}

/**
 * Generate a report from analysis
 */
export function generateAnalysisReport(analysis: FrontendAnalysis | DirectoryAnalysis): string {
  let report = '# Frontend Analysis Report\n\n';
  
  if ('filePath' in analysis) {
    // Single file analysis
    const fileAnalysis = analysis as FrontendAnalysis;
    
    report += `## File: ${fileAnalysis.filePath}\n`;
    report += `- Type: ${fileAnalysis.fileType}\n`;
    report += `- Size: ${formatFileSize(fileAnalysis.fileSize)}\n`;
    report += `- Lines: ${fileAnalysis.complexity.lines}\n\n`;
    
    if (fileAnalysis.imports.length > 0) {
      report += '### Imports\n';
      fileAnalysis.imports.forEach(imp => {
        report += `- ${imp.source}: ${imp.specifiers.join(', ')}\n`;
      });
      report += '\n';
    }
    
    if (fileAnalysis.components.length > 0) {
      report += '### Components\n';
      fileAnalysis.components.forEach(comp => {
        report += `- ${comp.name} (${comp.type}): ${comp.lineCount} lines\n`;
      });
      report += '\n';
    }
    
    if (fileAnalysis.errors.length > 0) {
      report += '### Errors\n';
      fileAnalysis.errors.forEach(error => {
        report += `- ❌ ${error}\n`;
      });
      report += '\n';
    }
    
  } else {
    // Directory analysis
    const dirAnalysis = analysis as DirectoryAnalysis;
    
    report += `## Directory Analysis\n`;
    report += `- Total Files: ${dirAnalysis.totalFiles}\n`;
    report += `- Total Directories: ${dirAnalysis.totalDirectories}\n`;
    report += `- Total Size: ${formatFileSize(dirAnalysis.totalSize)}\n\n`;
    
    if (Object.keys(dirAnalysis.byType).length > 0) {
      report += '### Files by Type\n';
      for (const [type, count] of Object.entries(dirAnalysis.byType)) {
        report += `- ${type}: ${count}\n`;
      }
      report += '\n';
    }
    
    if (dirAnalysis.largestFiles.length > 0) {
      report += '### Largest Files\n';
      dirAnalysis.largestFiles.forEach(file => {
        report += `- ${file.path}: ${formatFileSize(file.size)}\n`;
      });
      report += '\n';
    }
  }
  
  return report;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}