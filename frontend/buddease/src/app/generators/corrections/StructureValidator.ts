// StructureValidator.ts
import { ApiInfo, ComponentInfo, InterfaceInfo } from '@/app/generators/ApiCodeGenerator'
import SecureFieldManager from "@/app/server/security/SecureFieldManager";
import { ProjectStructure } from '@/app/scripts/generateRoadmaps'
import { Correction } from '@/app/generators/corrections/CorrectionGenerator'
import fs from 'fs';
import path from 'path';!

export class StructureValidator {
  async validateStructure(projectStructure: ProjectStructure): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    // Check for props defined but not used
    corrections.push(...this.findUnusedProps(projectStructure));
    
    // Check for missing props in components
    corrections.push(...this.findMissingProps(projectStructure));
    
    // Check for inconsistent naming
    corrections.push(...this.findNamingInconsistencies(projectStructure));
    
    // Check for file structure issues
    corrections.push(...await this.validateFileStructure());
    
    // Check for import/export issues
    corrections.push(...await this.findImportIssues(projectStructure));
    
    // Check for security structure issues
    corrections.push(...this.findSecurityIssues(projectStructure));
    
    // Check for performance anti-patterns
    corrections.push(...this.findPerformanceIssues(projectStructure));
    
    return corrections;
  }

  private findUnusedProps(projectStructure: ProjectStructure): Correction[] {
    const corrections: Correction[] = [];
    const { interfaces, components } = projectStructure;

    // Create a map of all prop interfaces
    const propInterfaces = new Map();
    interfaces.forEach(([name, iface]) => {
      if (name.endsWith('Props')) {
        propInterfaces.set(name, iface);
      }
    });

    // Check which prop interfaces are actually used by components
    components.forEach(([compName, component]) => {
      if (component.propsType && propInterfaces.has(component.propsType)) {
        propInterfaces.delete(component.propsType); // This one is used
      }
    });

    // Remaining prop interfaces are unused
    propInterfaces.forEach((iface, name) => {
      corrections.push({
        id: `unused-props-${name}`,
        type: 'warning',
        severity: 'low',
        file: iface.file,
        message: `Props interface '${name}' is defined but not used by any component`,
        code: `interface ${name} { /* ... */ }`,
        fix: `Remove unused interface or connect to a component`,
        category: 'structure'
      });
    });

    return corrections;
  }

  private findMissingProps(projectStructure: ProjectStructure): Correction[] {
    const corrections: Correction[] = [];
    const { components, interfaces } = projectStructure;

    components.forEach(([compName, component]) => {
      // Check if component has props but no props interface
      if (component.hasProps && !component.propsType) {
        corrections.push({
          id: `missing-props-interface-${compName}`,
          type: 'warning',
          severity: 'medium',
          file: component.file,
          message: `Component '${compName}' uses props but has no TypeScript interface`,
          code: `const ${compName} = (props) => { ... }`,
          fix: `Create a props interface: interface ${compName}Props { ... }`,
          category: 'structure'
        });
      }

      // Check if props interface exists but has issues
      if (component.propsType) {
        const propsInterface = interfaces.find(([name]) => name === component.propsType);
        if (propsInterface) {
          const [, iface] = propsInterface;
          
          // Check for empty props interfaces
        if (!iface.properties || iface.properties.length === 0) {
            corrections.push({
              id: `empty-props-interface-${compName}`,
              type: 'warning',
              severity: 'low',
              file: iface.file,
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
                file: component.file,
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
            file: component.file,
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

  private findNamingInconsistencies(projectStructure: ProjectStructure): Correction[] {
    const corrections: Correction[] = [];
    const { components, interfaces, files } = projectStructure;

    // Check component naming consistency
    const componentNames = new Set<string>();
    components.forEach(([name, component]) => {
      // Check PascalCase for components
      if (!this.isPascalCase(name)) {
        corrections.push({
          id: `component-naming-${name}`,
          type: 'suggestion',
          severity: 'low',
          file: component.file,
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
          file: component.file,
          message: `Duplicate component name detected: '${name}'`,
          code: name,
          fix: `Use unique names for components to avoid conflicts`,
          category: 'structure'
        });
      }
      componentNames.add(lowerName);
    });

    // Check interface naming consistency
    interfaces.forEach(([name, iface]) => {
      // Props interfaces should end with 'Props'
      if (name.includes('Props') && !name.endsWith('Props')) {
        corrections.push({
          id: `props-interface-naming-${name}`,
          type: 'suggestion',
          severity: 'low',
          file: iface.file,
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
          file: iface.file,
          message: `Interface name '${name}' should use PascalCase`,
          code: name,
          fix: `Rename to PascalCase: ${this.toPascalCase(name)}`,
          category: 'structure'
        });
      }
    });

    // Check file naming consistency
    files.forEach(file => {
      const fileName = path.basename(file);
      
      // Component files should use PascalCase
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

      // Test files should follow naming convention
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

  private async validateFileStructure(): Promise<Correction[]> {
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

  private async findImportIssues(projectStructure: ProjectStructure): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const { files } = projectStructure;

    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          const content = await fs.promises.readFile(file, 'utf8');
          const importIssues = this.analyzeImports(content, file);
          corrections.push(...importIssues);
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }

    return corrections;
  }

  private analyzeImports(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for relative imports that are too deep
      const relativeImportMatch = line.match(/from ['"](\.\.\/){3,}/);
      if (relativeImportMatch) {
        corrections.push({
          id: `deep-relative-import-${filePath}-${index}`,
          type: 'warning',
          severity: 'medium',
          file: filePath,
          line: index + 1,
          message: 'Deep relative import detected',
          code: line.trim(),
          fix: 'Consider using absolute imports or barrel exports',
          category: 'structure'
        });
      }

      // Check for circular import patterns
      if (line.includes('import') && line.includes('from')) {
        const importMatch = line.match(/from ['"]([^'"]+)['"]/);
        if (importMatch) {
          const importPath = importMatch[1];
          // This is a simplified check - in reality you'd need dependency graph analysis
          if (importPath.startsWith('..') && importPath.includes('/components/')) {
            corrections.push({
              id: `potential-circular-import-${filePath}-${index}`,
              type: 'warning',
              severity: 'low',
              file: filePath,
              line: index + 1,
              message: 'Potential circular import pattern detected',
              code: line.trim(),
              fix: 'Review component dependencies to avoid circular imports',
              category: 'structure'
            });
          }
        }
      }
    });

    return corrections;
  }

  private findSecurityIssues(projectStructure: ProjectStructure): Correction[] {
    const corrections: Correction[] = [];
    const { components } = projectStructure;

    components.forEach(([name, component]) => {
      // Check for potential XSS vulnerabilities
      if (component.file.includes('Component') && this.usesDangerousMethods(component)) {
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
          file: component.file,
          message: `Potential hardcoded secret in component '${name}'`,
          code: `Check component code for API keys, tokens, etc.`,
          fix: 'Move secrets to environment variables or secure storage',
          category: 'security'
        });
      }
    });

    return corrections;
  }

  private findPerformanceIssues(projectStructure: ProjectStructure): Correction[] {
    const corrections: Correction[] = [];
    const { components } = projectStructure;

    components.forEach(([name, component]) => {
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
          file: component.file,
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
// Helper methods implementation
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
    .replace(/(^\w|-\w)/g, match => match.replace('-', '').toUpperCase())
    // Handle snake_case: my_component -> MyComponent
    .replace(/(^\w|_\w)/g, match => match.replace('_', '').toUpperCase())
    // Handle camelCase: myComponent -> MyComponent
    .replace(/^\w/, match => match.toUpperCase())
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