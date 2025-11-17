// StructureValidator.ts
import { ApiInfo, ComponentInfo, InterfaceInfo } from '@/app/generators/ApiCodeGenerator'
import SecureFieldManager from "@/app/server/security/SecureFieldManager";
import { ProjectStructure } from '@/app/scripts/generateRoadmaps'
import { Correction } from '@/app/generators/corrections/CorrectionGenerator'
import { ConfigFileAnalyzer } from '@/app/generators/corrections/analyzers/react-native/config/ConfigFileAnalyzer';
import { BaseAnalyzer } from '@/app/generators/corrections/analyzers/BaseAnalyzer'

import fs from 'fs';
import path from 'path';

interface ComponentAnalysis {
  name: string;
  component: ComponentInfo;
}

interface InterfaceAnalysis {
  name: string;
  interface: InterfaceInfo;
}

interface ProjectStructureAnalysis {
  projectStructure: ProjectStructure;
  componentAnalyses: ComponentAnalysis[];
  interfaceAnalyses: InterfaceAnalysis[];
}


export class StructureValidator {

  private readonly helper = new (class extends BaseAnalyzer {
    analyze = async () => [];   
  })();
  
  async validateStructure(projectStructure: ProjectStructure): Promise<Correction[]> {
    const corrections: Correction[] = [];

    // Create the comprehensive analysis object
    const analysis: ProjectStructureAnalysis = this.createCorrectionProjectStructureAnalysis(projectStructure);

    // Check for props defined but not used
    corrections.push(...this.findUnusedProps(analysis));

    // Check for missing props in components
    corrections.push(...this.findMissingProps(analysis));

    // Check for inconsistent naming
    corrections.push(...this.findNamingInconsistencies(analysis));

    // Check for file structure issues
    corrections.push(...await this.validateFileStructure(analysis));

    // Check for import/export issues
    corrections.push(...await this.findImportIssues(analysis));

    // Check for security structure issues
    corrections.push(...this.findSecurityIssues(analysis));

    // Check for performance anti-patterns
    corrections.push(...this.findPerformanceIssues(analysis));

    return corrections;
  }

  private createCorrectionProjectStructureAnalysis(projectStructure: ProjectStructure): ProjectStructureAnalysis {
    return {
      projectStructure,
      componentAnalyses: projectStructure.components.map(
        ([name, component]) => ({ name, component })
      ),
      interfaceAnalyses: projectStructure.interfaces.map(
        ([name, interfaceInfo]) => ({ name, interface: interfaceInfo })
      )
    };
  }

  private findUnusedProps(analysis: ProjectStructureAnalysis): Correction[] {
    const corrections: Correction[] = [];
    const { componentAnalyses, interfaceAnalyses } = analysis;

    // Create a map of all prop interfaces
    const propInterfaces = new Map<string, InterfaceInfo>();
    interfaceAnalyses.forEach(({ name, interface: iface }) => {
      if (name.endsWith('Props')) {
        propInterfaces.set(name, iface);
      }
    });

    // Check which prop interfaces are actually used by components
    componentAnalyses.forEach(({ name: compName, component }) => {
      if (component.propsType && propInterfaces.has(component.propsType)) {
        propInterfaces.delete(component.propsType); // This one is used
      }
    });

    // Remaining prop interfaces are unused
    propInterfaces.forEach((iface: InterfaceInfo, name: string) => {
      corrections.push({
        id: `unused-props-${name}`,
        type: 'warning',
        severity: 'low',
        file: iface.file || 'unknown',
        message: `Props interface '${name}' is defined but not used by any component`,
        code: `interface ${name} { /* ... */ }`,
        fix: `Remove unused interface or connect to a component`,
        category: 'structure'
      });
    });

    return corrections;
  }

  private findMissingProps(analysis: ProjectStructureAnalysis): Correction[] {
    const corrections: Correction[] = [];
    const { componentAnalyses, interfaceAnalyses } = analysis;

    componentAnalyses.forEach(({ name: compName, component }) => {
      // Check if component has props but no props interface
      if (component.hasProps && !component.propsType) {
        corrections.push({
          id: `missing-props-interface-${compName}`,
          type: 'warning',
          severity: 'medium',
          file: component.file || 'unknown',
          message: `Component '${compName}' uses props but has no TypeScript interface`,
          code: `const ${compName} = (props) => { ... }`,
          fix: `Create a props interface: interface ${compName}Props { ... }`,
          category: 'structure'
        });
      }

      // Check if props interface exists but has issues
      if (component.propsType) {
        const propsInterface = interfaceAnalyses.find(({ name }) => name === component.propsType);
        if (propsInterface) {
          const { interface: iface } = propsInterface;

          // Check for empty props interfaces
          if (!iface.properties || iface.properties.length === 0) {
            corrections.push({
              id: `empty-props-interface-${compName}`,
              type: 'warning',
              severity: 'low',
              file: iface.file || 'unknown',
              message: `Props interface '${component.propsType}' is empty`,
              code: `interface ${component.propsType} {}`,
              fix: `Add properties to the interface or remove if not needed`,
              category: 'structure'
            });
          }

          // Check for optional props without default values
          iface.properties?.forEach(prop => {
            if (prop.optional && !this.hasDefaultValue(component, prop.name)) {
              corrections.push({
                id: `optional-prop-no-default-${compName}-${prop.name}`,
                type: 'suggestion',
                severity: 'low',
                file: component.file || 'unknown',
                message: `Optional prop '${prop.name}' has no default value in component '${compName}'`,
                code: `${prop.name}${prop.optional ? '?' : ''}: ${prop.type}`,
                fix: `Add default value: const ${prop.name} = props.${prop.name} || defaultValue;`,
                category: 'structure'
              });
            }
          });
        } else {
          // Props interface referenced but doesn't exist
          corrections.push({
            id: `missing-props-definition-${compName}`,
            type: 'error',
            severity: 'high',
            file: component.file || 'unknown',
            message: `Component '${compName}' references missing props interface '${component.propsType}'`,
            code: `interface ${component.propsType} { /* not found */ }`,
            fix: `Create the missing interface or fix the reference`,
            category: 'structure'
          });
        }
      }
    });

    return corrections;
  }

  private findNamingInconsistencies(analysis: ProjectStructureAnalysis): Correction[] {
    const corrections: Correction[] = [];
    const { componentAnalyses, interfaceAnalyses, projectStructure } = analysis;

    // Check component naming consistency
    const componentNames = new Set<string>();
    componentAnalyses.forEach(({ name, component }) => {
      // Check PascalCase for components
      if (!this.isPascalCase(name)) {
        corrections.push({
          id: `component-naming-${name}`,
          type: 'suggestion',
          severity: 'low',
          file: component.file || 'unknown',
          message: `Component name '${name}' should use PascalCase`,
          code: name,
          fix: `Rename to PascalCase: ${this.toPascalCase(name)}`,
          category: 'structure'
        });
      }

      // Check for duplicate component names (case-insensitive)
      const lowerName = name.toLowerCase();
      if (componentNames.has(lowerName)) {
        corrections.push({
          id: `duplicate-component-${name}`,
          type: 'warning',
          severity: 'medium',
          file: component.file || 'unknown',
          message: `Duplicate component name detected: '${name}'`,
          code: name,
          fix: `Use unique names for components to avoid conflicts`,
          category: 'structure'
        });
      }
      componentNames.add(lowerName);
    });

    // Check interface naming consistency
    interfaceAnalyses.forEach(({ name, interface: iface }) => {
      // Props interfaces should end with 'Props'
      if (name.includes('Props') && !name.endsWith('Props')) {
        corrections.push({
          id: `props-interface-naming-${name}`,
          type: 'suggestion',
          severity: 'low',
          file: iface.file || 'unknown',
          message: `Props interface '${name}' should end with 'Props'`,
          code: `interface ${name} { ... }`,
          fix: `Rename to: ${name.replace(/Props.*$/, 'Props')}`,
          category: 'structure'
        });
      }

      // Check PascalCase for interfaces
      if (!this.isPascalCase(name)) {
        corrections.push({
          id: `interface-naming-${name}`,
          type: 'suggestion',
          severity: 'low',
          file: iface.file || 'unknown',
          message: `Interface name '${name}' should use PascalCase`,
          code: name,
          fix: `Rename to PascalCase: ${this.toPascalCase(name)}`,
          category: 'structure'
        });
      }
    });

    // Check file naming consistency using the original files array
    projectStructure.files.forEach((file: string) => {
      const fileName = path.basename(file);
      
      if (fileName.match(/\.(tsx|jsx)$/) && !this.isPascalCase(fileName.replace(/\.(tsx|jsx)$/, ''))) {
        corrections.push({
          id: `file-naming-${fileName}`,
          type: 'suggestion',
          severity: 'low',
          file: file,
          message: `Component file '${fileName}' should use PascalCase`,
          code: fileName,
          fix: `Rename file to PascalCase`,
          category: 'structure'
        });
      }

      if (fileName.includes('.test.') || fileName.includes('.spec.')) {
        const baseName = fileName.split('.')[0];
        const sourceFile = file.replace(/\.(test|spec)\.(tsx|ts|jsx|js)$/, '.$2');
        if (!fs.existsSync(sourceFile)) {
          corrections.push({
            id: `orphaned-test-file-${fileName}`,
            type: 'warning',
            severity: 'medium',
            file: file,
            message: `Test file '${fileName}' has no corresponding source file`,
            code: fileName,
            fix: `Create corresponding source file or remove test file`,
            category: 'structure'
          });
        }
      }
    });

    return corrections;
  }

  private analyzeImports(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];

    /* ---- deep relative -------------------------------------------------- */
    const deepRelative = /^import.*['"]\.\.\/\.\.\/\.\./gm;
    if (deepRelative.test(content)) {
      corrections.push(
        this.helper.createCorrection(
          `deep-relative-import-${filePath}`,
          'warning',
          'medium',
          'Deep relative import path detected',
          filePath,
          deepRelative.exec(content)?.[0] ?? '',
          'Use absolute imports or barrel exports',
          'maintainability'
        )
      );
    }

    /* ---- missing extension ---------------------------------------------- */
    const noExt = /^import\s+.*?\s+from\s+['"]\.\/[^'"]+(?<!\.tsx?)(?<!\.jsx?)['"]/gm;
    if (noExt.test(content)) {
      corrections.push(
        this.helper.createCorrection(
          `missing-extension-${filePath}`,
          'suggestion',
          'low',
          'Import missing file extension',
          filePath,
          noExt.exec(content)?.[0] ?? '',
          'Add .ts / .tsx / .js / .jsx extension',
          'compilation'
        )
      );
    }

    /* ---- duplicate imports ---------------------------------------------- */
    const imports = Array.from(content.matchAll(/^import\s+.*?\s+from\s+['"]([^'"]+)['"]/gm));
    const seen = new Set<string>();
    imports.forEach(([line, module]) => {
      if (seen.has(module)) {
        corrections.push(
          this.helper.createCorrection(
            `duplicate-import-module-${filePath}`,
            'suggestion',
            'low',
            `Multiple imports from same module: ${module}`,
            filePath,
            line,
            'Combine into a single import statement',
            'readability'
          )
        );
      }
      seen.add(module);
    });

    return corrections;
  }

  private async validateFileStructure(analysis: ProjectStructureAnalysis): Promise<Correction[]> {
    const corrections: Correction[] = [];

    const expectedDirs = [
      'src/components',
      'src/hooks',
      'src/utils',
      'src/types',
      'src/services',
      'src/pages'
    ];

    for (const dir of expectedDirs) {
      const dirPath = path.resolve(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        corrections.push({
          id: `missing-directory-${dir}`,
          type: 'suggestion',
          severity: 'low',
          file: dir,
          message: `Expected directory not found: ${dir}`,
          code: `Directory: ${dir}`,
          fix: `Create the ${dir} directory for better organization`,
          category: 'structure'
        });
      }
    }

    // Check for index files in key directories
    const directoriesWithIndex = ['src/components', 'src/hooks', 'src/utils'];
    for (const dir of directoriesWithIndex) {
      const indexPath = path.resolve(process.cwd(), dir, 'index.ts');
      if (!fs.existsSync(indexPath)) {
        corrections.push({
          id: `missing-index-file-${dir}`,
          type: 'suggestion',
          severity: 'low',
          file: `${dir}/index.ts`,
          message: `No index file found in ${dir}`,
          code: `Directory: ${dir}`,
          fix: `Create index.ts in ${dir} for cleaner imports`,
          category: 'structure'
        });
      }
    }

    return corrections;
  }

  private async findImportIssues(analysis: ProjectStructureAnalysis): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const { projectStructure } = analysis;

    for (const file of projectStructure.files) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          const content = await fs.promises.readFile(file, 'utf8');
          const importIssues = this.analyzeImports(content, file);
          corrections.push(...importIssues);
        } catch (error) {
          console.warn(`Could not read file for import analysis: ${file}`, error);
        }
      }
    }

    return corrections;
  }

  private findSecurityIssues(analysis: ProjectStructureAnalysis): Correction[] {
    const corrections: Correction[] = [];
    const { componentAnalyses } = analysis;

    componentAnalyses.forEach(({ name, component }) => {
      // Check for potential XSS vulnerabilities
      if (component.file && component.file.includes('Component') && this.usesDangerousMethods(component)) {
        corrections.push({
          id: `security-xss-risk-${name}`,
          type: 'warning',
          severity: 'high',
          file: component.file,
          message: `Component '${name}' may have XSS vulnerability`,
          code: `Component: ${name}`,
          fix: 'Use proper sanitization for user input and avoid innerHTML',
          category: 'security'
        });
      }

      // Check for hardcoded secrets (basic pattern matching)
      if (this.hasHardcodedSecrets(component)) {
        corrections.push({
          id: `security-hardcoded-secret-${name}`,
          type: 'error',
          severity: 'critical',
          file: component.file || 'unknown',
          message: `Potential hardcoded secret in component '${name}'`,
          code: `Check component code for API keys, tokens, etc.`,
          fix: 'Move secrets to environment variables or secure storage',
          category: 'security'
        });
      }
    });

    return corrections;
  }

  private findPerformanceIssues(analysis: ProjectStructureAnalysis): Correction[] {
    const corrections: Correction[] = [];
    const { componentAnalyses } = analysis;

    componentAnalyses.forEach(({ name, component }) => {
      // Check for large components that might need splitting
      if (component.file && this.isLargeComponent(component)) {
        corrections.push({
          id: `performance-large-component-${name}`,
          type: 'suggestion',
          severity: 'medium',
          file: component.file,
          message: `Component '${name}' is large and might impact performance`,
          code: `Component size: Large`,
          fix: 'Consider splitting into smaller, focused components',
          category: 'performance'
        });
      }

      // Check for potential memory leaks
      if (this.hasMemoryLeakPatterns(component)) {
        corrections.push({
          id: `performance-memory-leak-${name}`,
          type: 'warning',
          severity: 'high',
          file: component.file || 'unknown',
          message: `Component '${name}' may have memory leak patterns`,
          code: `Check for event listeners, timeouts, subscriptions`,
          fix: 'Ensure proper cleanup in useEffect return functions',
          category: 'performance'
        });
      }
    });

    return corrections;
  }

  // Helper methods
  private hasDefaultValue(component: ComponentInfo, propName: string): boolean {
    if (!component.file) return false;

    try {
      const content = fs.readFileSync(component.file, 'utf8');

      // Pattern 1: Default parameters in function component
      const defaultParamPattern = new RegExp(`(?:const|function)\\s+${component.name}\\s*=\\s*\\([^)]*\\b${propName}\\s*=\\s*([^,)]+)`, 's');
      if (defaultParamPattern.test(content)) {
        return true;
      }

      // Pattern 2: Default value assignment in function body
      const defaultAssignmentPattern = new RegExp(`(?:const|let|var)\\s+${propName}\\s*=\\s*props\\.${propName}\\s*\\|\\|\\s*([^;]+)`, 's');
      if (defaultAssignmentPattern.test(content)) {
        return true;
      }

      // Pattern 3: Destructuring with default value
      const destructuringPattern = new RegExp(`const\\s*\\{[^}]*\\b${propName}\\s*=\\s*([^,}]+)[^}]*\\}\\s*=\\s*props`, 's');
      if (destructuringPattern.test(content)) {
        return true;
      }

      // Pattern 4: Using nullish coalescing or logical OR
      const coalescingPattern = new RegExp(`(?:props\\.${propName}|${propName})\\s*[\\?\\|]\\|?\\s*([^\\s);]+)`, 's');
      if (coalescingPattern.test(content)) {
        return true;
      }

      return false;
    } catch (error) {
      console.warn(`Could not read component file ${component.file}:`, error);
      return false;
    }
  }

  private isPascalCase(str: string): boolean {
    // PascalCase: Starts with capital letter, contains only alphanumeric characters
    // Allows for multiple words (each starting with capital)
    return /^[A-Z][A-Za-z0-9]*(?:[A-Z][A-Za-z0-9]*)*$/.test(str);
  }

  private toPascalCase(str: string): string {
    return str
      // Handle kebab-case: my-component -> MyComponent
      .replace(/(^\w|-\w)/g, (match: string) => match.replace('-', '').toUpperCase())
      // Handle snake_case: my_component -> MyComponent
      .replace(/(^\w|_\w)/g, (match: string) => match.replace('_', '').toUpperCase())
      // Handle camelCase: myComponent -> MyComponent
      .replace(/^\w/, (match: string) => match.toUpperCase())
      // Remove any remaining non-alphanumeric characters
      .replace(/[^a-zA-Z0-9]/g, '');
  }

  private usesDangerousMethods(component: ComponentInfo): boolean {
    if (!component.file) return false;

    try {
      const content = fs.readFileSync(component.file, 'utf8');

      // Pattern 1: Direct innerHTML usage
      if (content.includes('.innerHTML') && !content.includes('// safe') && !content.includes('/* safe */')) {
        return true;
      }

      // Pattern 2: dangerouslySetInnerHTML in React
      if (content.includes('dangerouslySetInnerHTML') && !this.hasSanitization(content)) {
        return true;
      }

      // Pattern 3: eval() function usage
      if (content.includes('eval(') && !content.includes('// safe-eval')) {
        return true;
      }

      // Pattern 4: document.write usage
      if (content.includes('document.write(')) {
        return true;
      }

      // Pattern 5: Unsafe string concatenation in HTML
      const unsafeHtmlPattern = /<[^>]*>\s*\+\s*[^<]+\s*\+\s*<\/[^>]*>/g;
      if (unsafeHtmlPattern.test(content)) {
        return true;
      }

      // Pattern 6: Using user input directly in HTML attributes without encoding
      const unsafeAttributePattern = /<[^>]+\s+(?:href|src|action)=["']?\{[^}]*\}[^>]*>/g;
      if (unsafeAttributePattern.test(content)) {
        return true;
      }

      return false;
    } catch (error) {
      console.warn(`Could not read component file ${component.file}:`, error);
      return false;
    }
  }

  private hasSanitization(content: string): boolean {
    // Check if content uses any sanitization libraries or methods
    const sanitizationPatterns = [
      /DOMPurify\.sanitize/,
      /xss\.filter/,
      /sanitize-html/,
      /escapeHtml/,
      /encodeURIComponent/,
      /\.replace\([^)]*<[^>]*>/g,
      /\/\/\s*sanitized/,
      /\/\*\s*sanitized\s*\*\//
    ];

    return sanitizationPatterns.some(pattern => pattern.test(content));
  }

  private hasHardcodedSecrets(component: ComponentInfo): boolean {
    if (!component.file) return false;

    try {
      const content = fs.readFileSync(component.file, 'utf8');

      // Pattern 1: API keys and tokens
      const apiKeyPatterns = [
        /\b(?:api[_-]?key|api[_-]?token|access[_-]?token|secret[_-]?key)\s*[:=]\s*["']([^"']{10,})["']/gi,
        /\b(?:password|pwd|secret)\s*[:=]\s*["']([^"']{5,})["']/gi,
        /\b[A-Za-z0-9]{32,}\b/g, // Long random strings (potential secrets)
        /\b(?:sk_|pk_)[A-Za-z0-9]+\b/g, // Stripe-like keys
        /\b(?:ghp_|github_pat_)[A-Za-z0-9]+\b/g // GitHub tokens
      ];

      for (const pattern of apiKeyPatterns) {
        if (pattern.test(content)) {
          return true;
        }
      }

      // Pattern 2: Database connection strings
      const dbConnectionPattern = /(?:mongodb|postgres|mysql|redis):\/\/[^"'\s]+/gi;
      if (dbConnectionPattern.test(content)) {
        return true;
      }

      // Pattern 3: OAuth credentials
      const oauthPattern = /(?:client_id|client_secret)\s*[:=]\s*["'][^"']{10,}["']/gi;
      if (oauthPattern.test(content)) {
        return true;
      }

      // Pattern 4: JWT secrets
      const jwtPattern = /(?:jwt[_-]?secret|jwt[_-]?key)\s*[:=]\s*["'][^"']{10,}["']/gi;
      if (jwtPattern.test(content)) {
        return true;
      }

      return false;
    } catch (error) {
      console.warn(`Could not read component file ${component.file}:`, error);
      return false;
    }
  }

  private isLargeComponent(component: ComponentInfo): boolean {
    if (!component.file) return false;

    try {
      const content = fs.readFileSync(component.file, 'utf8');
      const lines = content.split('\n').filter(line => line.trim().length > 0);

      // Consider component large if it has more than 150 lines of code
      if (lines.length > 150) {
        return true;
      }

      // Check for complex JSX structures (multiple nested levels)
      const jsxDepth = this.calculateJSXDepth(content);
      if (jsxDepth > 5) {
        return true;
      }

      // Check for too many useState/useEffect hooks (indicating complex state)
      const stateHooks = (content.match(/useState\(/g) || []).length;
      const effectHooks = (content.match(/useEffect\(/g) || []).length;
      if (stateHooks + effectHooks > 8) {
        return true;
      }

      return false;
    } catch (error) {
      console.warn(`Could not read component file ${component.file}:`, error);
      return false;
    }
  }

  private calculateJSXDepth(content: string): number {
    let maxDepth = 0;
    let currentDepth = 0;
    let inJsx = false;

    for (let i = 0; i < content.length; i++) {
      if (content[i] === '<' && content[i + 1] !== '!' && !content.substring(i, i + 4).includes('<!--')) {
        // Check if it's a closing tag
        if (content[i + 1] === '/') {
          currentDepth--;
        } else {
          // Opening tag - check if it's self-closing
          const tagEnd = content.indexOf('>', i);
          if (tagEnd !== -1) {
            const tagContent = content.substring(i, tagEnd + 1);
            if (!tagContent.endsWith('/>') && !tagContent.includes('</')) {
              currentDepth++;
              maxDepth = Math.max(maxDepth, currentDepth);
            }
          }
        }
      }
    }

    return maxDepth;
  }

  private hasMemoryLeakPatterns(component: ComponentInfo): boolean {
    if (!component.file) return false;

    try {
      const content = fs.readFileSync(component.file, 'utf8');

      // Pattern 1: Event listeners without cleanup
      const eventListenerPattern = /\.addEventListener\([^)]+\)(?![\s\S]*?\.removeEventListener\([^)]+\))/g;
      if (eventListenerPattern.test(content)) {
        return true;
      }

      // Pattern 2: setInterval/setTimeout without clearInterval/clearTimeout
      const intervalPattern = /setInterval\([^)]+\)(?![\s\S]*?clearInterval\([^)]+\))/g;
      const timeoutPattern = /setTimeout\([^)]+\)(?![\s\S]*?clearTimeout\([^)]+\))/g;
      if (intervalPattern.test(content) || timeoutPattern.test(content)) {
        return true;
      }

      // Pattern 3: WebSocket without close
      const websocketPattern = /new WebSocket\([^)]+\)(?![\s\S]*?\.close\([^)]*\))/g;
      if (websocketPattern.test(content)) {
        return true;
      }

      // Pattern 4: Subscription patterns without unsubscribe
      const subscriptionPatterns = [
        /\.subscribe\([^)]+\)(?![\s\S]*?\.unsubscribe\([^)]*\))/g,
        /addListener\([^)]+\)(?![\s\S]*?removeListener\([^)]+\))/g,
        /on\([^)]+\)(?![\s\S]*?off\([^)]+\))/g
      ];

      for (const pattern of subscriptionPatterns) {
        if (pattern.test(content)) {
          return true;
        }
      }

      // Pattern 5: useEffect without cleanup function
      const useEffectPattern = /useEffect\(\s*\(\s*\)\s*=>\s*\{[^}]*\}(?![\s\S]*?return\s*\([^)]*\)\s*=>)/g;
      if (useEffectPattern.test(content)) {
        return true;
      }

      // Pattern 6: Creating objects in render without proper cleanup
      const objectCreationPattern = /new\s+([A-Z][A-Za-z0-9]*)\s*\([^)]*\)/g;
      const objectCreations = content.match(objectCreationPattern) || [];
      if (objectCreations.length > 2) {
        return true;
      }

      return false;
    } catch (error) {
      console.warn(`Could not read component file ${component.file}:`, error);
      return false;
    }
  }
}