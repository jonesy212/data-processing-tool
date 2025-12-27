// src/app/error-analyzer/ImportSuggestionGenerator.ts

import { TSCompilerError } from '@/app/error-analyzer/ErrorFixManager';
import { RelationshipMap } from'@/app/error-analyzer/types/ErrorAnalysisTypes'
import { ImportFixStrategy } from '@/app/error-analyzer/index';
import fs from 'fs';
import path from 'path';

export class ImportSuggestionGenerator {
  private projectRoot: string;
  private knownExports: Map<string, string[]>; // file -> exported names
  private importPatterns: Map<string, string[]>; // identifier -> possible import paths

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.knownExports = new Map();
    this.importPatterns = new Map();
    this.initializeKnownExports();
  }

  async suggestImport(error: TSCompilerError, relationshipMap: RelationshipMap): Promise<string> {
    const identifier = this.extractIdentifier(error.message);
    if (!identifier) {
      return '// Could not extract identifier from error message';
    }

    const filePath = error.resource;
    const suggestions = await this.findImportSuggestions(identifier, filePath, relationshipMap);

    if (suggestions.length === 0) {
      return this.generateNotFoundFix(identifier, filePath);
    }

    // Choose best suggestion
    const bestSuggestion = this.chooseBestSuggestion(suggestions, filePath);
    return this.generateImportFix(bestSuggestion, identifier, filePath);
  }

  async findImportSuggestions(
    identifier: string,
    filePath: string,
    relationshipMap: RelationshipMap
  ): Promise<ImportFixStrategy[]> {
    const suggestions: ImportFixStrategy[] = [];

    // 1. Check if identifier exists in project
    const projectSuggestions = await this.findInProject(identifier, filePath);
    suggestions.push(...projectSuggestions);

    // 2. Check relationship map for usages
    const usageSuggestions = this.findFromUsages(identifier, relationshipMap);
    suggestions.push(...usageSuggestions);

    // 3. Check common libraries and patterns
    const librarySuggestions = this.findInCommonLibraries(identifier);
    suggestions.push(...librarySuggestions);

    // 4. Check file dependencies
    const dependencySuggestions = this.findInDependencies(filePath, identifier, relationshipMap);
    suggestions.push(...dependencySuggestions);

    return suggestions;
  }

  private async findInProject(identifier: string, currentFile: string): Promise<ImportFixStrategy[]> {
    const suggestions: ImportFixStrategy[] = [];

    // Check known exports
    for (const [file, exports] of this.knownExports.entries()) {
      if (exports.includes(identifier) && file !== currentFile) {
        suggestions.push({
          type: 'import_fix',
          name: `Import from ${path.relative(path.dirname(currentFile), file)}`,
          description: `Import ${identifier} from local file`,
          applicability: ['local_module'],
          confidenceScore: 90,
          implementationSteps: [
            `Add import statement for ${identifier}`,
            `Verify the export exists in ${file}`,
            `Update usage if necessary`
          ],
          validationChecks: [
            `File ${file} exports ${identifier}`,
            'Import path is correct',
            'No naming conflicts'
          ],
          risks: ['May create circular dependencies'],
          importType: 'named',
          modulePath: this.getRelativeImportPath(currentFile, file),
          importName: identifier,
          alternativePaths: []
        });
      }
    }

    // Search file system for identifier
    const foundFiles = await this.searchFilesForIdentifier(identifier);
    for (const file of foundFiles) {
      if (file !== currentFile) {
        suggestions.push({
          type: 'import_fix',
          name: `Import from found file ${path.basename(file)}`,
          description: `Found ${identifier} in ${file}`,
          applicability: ['found_in_project'],
          confidenceScore: 70,
          implementationSteps: [
            `Check if ${identifier} is exported from ${file}`,
            `Add appropriate import`,
            `Verify import works`
          ],
          validationChecks: [
            `Identifier is exported from ${file}`,
            'Import syntax is correct'
          ],
          risks: ['File may not export the identifier'],
          importType: 'named',
          modulePath: this.getRelativeImportPath(currentFile, file),
          importName: identifier,
          alternativePaths: []
        });
      }
    }

    return suggestions;
  }

  private findFromUsages(identifier: string, relationshipMap: RelationshipMap): ImportFixStrategy[] {
    const suggestions: ImportFixStrategy[] = [];
    const usages = relationshipMap.propertyUsages.get(identifier) || 
                   relationshipMap.methodUsages.get(identifier);

    if (!usages || usages.length === 0) {
      return suggestions;
    }

    // Group usages by file
    const files = new Set(usages.map(u => u.file));
    
    for (const file of files) {
      // Check if this file exports the identifier
      const exports = this.knownExports.get(file) || [];
      if (exports.includes(identifier)) {
        suggestions.push({
          type: 'import_fix',
          name: `Import from usage file ${path.basename(file)}`,
          description: `${identifier} is used in ${path.basename(file)}`,
          applicability: ['used_in_project'],
          confidenceScore: 85,
          implementationSteps: [
            `Import ${identifier} from ${file}`,
            `Verify the usage context matches`
          ],
          validationChecks: [
            `File ${file} exports ${identifier}`,
            'Usage patterns are consistent'
          ],
          risks: ['Usage may be different context'],
          importType: 'named',
          modulePath: this.getRelativeImportPath(process.cwd(), file),
          importName: identifier,
          alternativePaths: []
        });
      }
    }

    return suggestions;
  }

  private findInCommonLibraries(identifier: string): ImportFixStrategy[] {
    const suggestions: ImportFixStrategy[] = [];
    const commonLibraries = this.getCommonLibraryPatterns();

    for (const [library, patterns] of commonLibraries.entries()) {
      if (patterns.includes(identifier)) {
        suggestions.push({
          type: 'import_fix',
          name: `Import from ${library}`,
          description: `${identifier} is commonly exported from ${library}`,
          applicability: ['common_library'],
          confidenceScore: 80,
          implementationSteps: [
            `Install ${library} if not already installed`,
            `Add import statement`,
            `Verify the export exists in the library version`
          ],
          validationChecks: [
            `${library} is installed`,
            `Library exports ${identifier}`,
            'Version compatibility'
          ],
          risks: ['Library version may not export identifier'],
          importType: 'named',
          modulePath: library,
          importName: identifier,
          alternativePaths: this.getAlternativeLibraryPaths(library, identifier)
        });
      }
    }

    // Check React patterns
    if (this.isReactIdentifier(identifier)) {
      suggestions.push({
        type: 'import_fix',
        name: 'Import from React',
        description: `${identifier} appears to be a React-related identifier`,
        applicability: ['react_pattern'],
        confidenceScore: 75,
        implementationSteps: [
          'Check if it needs import from react',
          'Or from react-dom if DOM related',
          'Or from @types/react if type definition'
        ],
        validationChecks: [
          'React is installed',
          'Correct React import source',
          'Type definitions available'
        ],
        risks: ['May be custom React component, not library export'],
        importType: 'named',
        modulePath: 'react',
        importName: identifier,
        alternativePaths: ['react-dom', '@types/react', 'react-native']
      });
    }

    return suggestions;
  }

  private findInDependencies(
    currentFile: string,
    identifier: string,
    relationshipMap: RelationshipMap
  ): ImportFixStrategy[] {
    const suggestions: ImportFixStrategy[] = [];
    const dependencies = relationshipMap.fileDependencies.get(currentFile) || [];

    for (const dep of dependencies) {
      // Check if dependency file exports the identifier
      const exports = this.knownExports.get(dep) || [];
      if (exports.includes(identifier)) {
        suggestions.push({
          type: 'import_fix',
          name: `Import from dependency ${path.basename(dep)}`,
          description: `File already imports from ${dep}`,
          applicability: ['existing_dependency'],
          confidenceScore: 95,
          implementationSteps: [
            `Add ${identifier} to existing import from ${dep}`,
            `Or create new import if needed`
          ],
          validationChecks: [
            `Dependency ${dep} exports ${identifier}`,
            'Import statement syntax is correct'
          ],
          risks: ['Minimal - already importing from this file'],
          importType: 'named',
          modulePath: this.getRelativeImportPath(currentFile, dep),
          importName: identifier,
          alternativePaths: []
        });
      }
    }

    return suggestions;
  }

  private chooseBestSuggestion(suggestions: ImportFixStrategy[], currentFile: string): ImportFixStrategy {
    if (suggestions.length === 0) {
      throw new Error('No suggestions available');
    }

    // Sort by confidence score
    suggestions.sort((a, b) => b.confidenceScore - a.confidenceScore);

    // Prefer suggestions from existing dependencies
    const existingDependency = suggestions.find(s => 
      s.applicability.includes('existing_dependency')
    );
    if (existingDependency) {
      return existingDependency;
    }

    // Prefer local project suggestions over libraries
    const localSuggestion = suggestions.find(s => 
      s.applicability.includes('local_module') || 
      s.applicability.includes('used_in_project')
    );
    if (localSuggestion) {
      return localSuggestion;
    }

    // Return highest confidence suggestion
    return suggestions[0];
  }

  private generateImportFix(strategy: ImportFixStrategy, identifier: string, currentFile: string): string {
    const lines: string[] = [];

    lines.push(`// Import suggestion for: ${identifier}`);
    lines.push(`// Confidence: ${strategy.confidenceScore}%`);
    lines.push(`// Source: ${strategy.name}`);
    lines.push('');

    switch (strategy.importType) {
      case 'named':
        lines.push(`import { ${identifier} } from '${strategy.modulePath}';`);
        break;
      case 'default':
        lines.push(`import ${identifier} from '${strategy.modulePath}';`);
        break;
      case 'namespace':
        lines.push(`import * as ${this.getNamespaceName(identifier)} from '${strategy.modulePath}';`);
        lines.push(`// Use as: ${this.getNamespaceName(identifier)}.${identifier}`);
        break;
    }

    lines.push('');
    lines.push('// Alternative import paths:');
    if (strategy.alternativePaths.length > 0) {
      for (const altPath of strategy.alternativePaths) {
        lines.push(`// import { ${identifier} } from '${altPath}';`);
      }
    } else {
      lines.push('// No alternatives found');
    }

    lines.push('');
    lines.push('// Steps:');
    for (let i = 0; i < strategy.implementationSteps.length; i++) {
      lines.push(`// ${i + 1}. ${strategy.implementationSteps[i]}`);
    }

    lines.push('');
    lines.push('// Validation:');
    for (const check of strategy.validationChecks) {
      lines.push(`// ✓ ${check}`);
    }

    lines.push('');
    lines.push('// Risks:');
    for (const risk of strategy.risks) {
      lines.push(`// ⚠️  ${risk}`);
    }

    return lines.join('\n');
  }

  private generateNotFoundFix(identifier: string, currentFile: string): string {
    const lines: string[] = [];

    lines.push(`// Could not find import source for: ${identifier}`);
    lines.push('// Possible solutions:');
    lines.push('');
    lines.push('// 1. Define it locally in this file:');
    lines.push(`const ${identifier} = /* definition */;`);
    lines.push('');
    lines.push('// 2. Check for typos or different naming:');
    lines.push('// Common variations:');
    lines.push(`// - ${identifier.toLowerCase()}`);
    lines.push(`// - ${identifier}Props`);
    lines.push(`// - ${identifier}Type`);
    lines.push(`// - use${identifier.charAt(0).toUpperCase() + identifier.slice(1)}`);
    lines.push('');
    lines.push('// 3. Check if it should be imported from:');
    lines.push('// - A parent component');
    lines.push('// - A utility file');
    lines.push('// - A context/provider');
    lines.push('');
    lines.push('// 4. Search the project for definition:');
    lines.push('// grep -r "export.*' + identifier + '" src/');
    lines.push('// find src -name "*.ts*" -exec grep -l "' + identifier + '" {} \\;');

    return lines.join('\n');
  }

  private async searchFilesForIdentifier(identifier: string): Promise<string[]> {
    const foundFiles: string[] = [];
    const searchDir = path.join(this.projectRoot, 'src');

    if (!fs.existsSync(searchDir)) {
      return foundFiles;
    }

    // Simple file search - in production, use more sophisticated search
    try {
      const files = await this.getAllTypeScriptFiles(searchDir);
      
      for (const file of files) {
        try {
          const content = await fs.promises.readFile(file, 'utf8');
          
          // Look for exports
          const exportRegex = new RegExp(`export\\s+(?:const|let|var|function|class|interface|type)\\s+${identifier}\\b`, 'g');
          if (exportRegex.test(content)) {
            foundFiles.push(file);
          }
          
          // Look for declarations
          const declRegex = new RegExp(`(?:const|let|var|function|class|interface|type)\\s+${identifier}\\b`, 'g');
          if (declRegex.test(content)) {
            foundFiles.push(file);
          }
        } catch {
          // Skip files that can't be read
        }
      }
    } catch {
      // Ignore search errors
    }

    return foundFiles;
  }

  private async getAllTypeScriptFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            files.push(...await this.getAllTypeScriptFiles(fullPath));
          }
        } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch {
      // Ignore directory errors
    }

    return files;
  }

  private initializeKnownExports(): void {
    // In production, this would parse the project to build a map of exports
    // For now, initialize empty - will be populated as files are analyzed
  }

  private getRelativeImportPath(fromFile: string, toFile: string): string {
    const fromDir = path.dirname(fromFile);
    const toDir = path.dirname(toFile);
    
    let relativePath = path.relative(fromDir, toFile).replace(/\.(ts|tsx)$/, '');
    
    // Ensure path starts with ./
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    
    // Remove index from path
    relativePath = relativePath.replace(/\/index$/, '');
    
    return relativePath;
  }

  private getCommonLibraryPatterns(): Map<string, string[]> {
    return new Map([
      ['react', ['useState', 'useEffect', 'useContext', 'useReducer', 'useCallback', 'useMemo', 'useRef']],
      ['react-dom', ['render', 'createPortal', 'findDOMNode']],
      ['@types/react', ['ReactNode', 'ComponentType', 'FC', 'PropsWithChildren']],
      ['lodash', ['debounce', 'throttle', 'cloneDeep', 'isEmpty', 'isEqual']],
      ['date-fns', ['format', 'parse', 'differenceInDays', 'addDays']],
      ['axios', ['get', 'post', 'put', 'delete', 'create']],
      ['classnames', ['default']]
    ]);
  }

  private getAlternativeLibraryPaths(library: string, identifier: string): string[] {
    const alternatives: Record<string, string[]> = {
      'react': ['react-dom', '@types/react'],
      'react-dom': ['react'],
      'lodash': ['lodash-es', 'lodash/fp'],
      'date-fns': ['moment', 'dayjs']
    };
    
    return alternatives[library] || [];
  }

  private isReactIdentifier(identifier: string): boolean {
    const reactPatterns = [
      /^use[A-Z]/,
      /^[A-Z][a-zA-Z]*$/,
      /Props$/,
      /State$/,
      /Context$/,
      /Provider$/,
      /Consumer$/
    ];
    
    return reactPatterns.some(pattern => pattern.test(identifier));
  }

  private getNamespaceName(identifier: string): string {
    // Convert identifier to namespace name
    if (identifier.match(/^[A-Z]/)) {
      return identifier.toLowerCase();
    }
    return identifier;
  }

  private extractIdentifier(message: string): string | null {
    const patterns = [
      /Cannot find name ['"]([^'"]+)['"]/,
      /'([^']+)' is not exported/,
      /Module ['"][^'"]+['"] has no exported member ['"]([^'"]+)['"]/
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  async analyzeImportPatterns(filePath: string): Promise<void> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      
      // Extract exports
      const exportMatches = content.match(/export\s+(?:const|let|var|function|class|interface|type)\s+(\w+)/g);
      if (exportMatches) {
        const exports = exportMatches.map(match => {
          const nameMatch = match.match(/\s+(\w+)$/);
          return nameMatch ? nameMatch[1] : '';
        }).filter(Boolean);
        
        this.knownExports.set(filePath, exports);
      }
      
      // Extract imports to build patterns
      const importMatches = content.match(/import\s+(?:.*?from\s+)?['"]([^'"]+)['"]/g);
      if (importMatches) {
        for (const match of importMatches) {
          const importMatch = match.match(/import\s+(?:{[^}]+}|\* as \w+|\w+)\s+from\s+['"]([^'"]+)['"]/);
          if (importMatch) {
            const importPath = importMatch[1];
            // Store import patterns for future reference
            if (!this.importPatterns.has(importPath)) {
              this.importPatterns.set(importPath, []);
            }
          }
        }
      }
    } catch {
      // Ignore file read errors
    }
  }

  generateImportAnalysisReport(): string {
    const lines: string[] = [];
    
    lines.push('# Import Analysis');
    lines.push('');
    lines.push(`**Files analyzed:** ${this.knownExports.size}`);
    lines.push(`**Import patterns:** ${this.importPatterns.size}`);
    lines.push('');
    
    lines.push('## Known Exports by File:');
    for (const [file, exports] of this.knownExports.entries()) {
      if (exports.length > 0) {
        lines.push(`### ${path.relative(this.projectRoot, file)}`);
        lines.push(`**Exports:** ${exports.length} items`);
        lines.push(exports.join(', '));
        lines.push('');
      }
    }
    
    lines.push('## Common Import Patterns:');
    for (const [pattern, files] of this.importPatterns.entries()) {
      lines.push(`- \`${pattern}\`: ${files.length} references`);
    }
    
    return lines.join('\n');
  }
}