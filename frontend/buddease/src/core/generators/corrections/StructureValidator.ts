// StructureValidator.ts
import type { ApiInfo, ComponentInfo, InterfaceInfo } from '@/core/generators/ApiCodeGenerator';
import { BaseAnalyzer } from '@/core/generators/corrections/analyzers/BaseAnalyzer';
import { PackageJsonAnalyzer } from '@/core/generators/corrections/analyzers/react-native/errors/PackageJsonAnalyzer';
import { ConfigurationValidator } from '@/core/generators/corrections/validators/ConfigurationValidator';
import { FileStructureValidator } from '@/core/generators/corrections/validators/FileStructureValidator';
import { MultiPlatformDirectoryValidator } from '@/core/generators/corrections/validators/MultiPlatformDirectoryValidator';
import { PackageJsonValidator } from '@/core/generators/corrections/validators/PackageJsonValidator';
import type { ProjectStructure } from '@/core/scripts/generateRoadmaps';

import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import type { PackageJson } from '@/core/scripts/generate-commands-doc';

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


export class StructureValidator extends BaseAnalyzer {
  private projectRoot: string;
  private directoryValidator: MultiPlatformDirectoryValidator;
  private packageJsonValidator: PackageJsonValidator;
  private fileStructureValidator: FileStructureValidator;
  private configurationValidator: ConfigurationValidator;

  constructor(projectRoot: string = '.') {
    super();
    this.projectRoot = path.resolve(projectRoot);
    this.directoryValidator = new MultiPlatformDirectoryValidator(projectRoot);
    this.packageJsonValidator = new PackageJsonValidator(projectRoot);
    this.fileStructureValidator = new FileStructureValidator(projectRoot);
    this.configurationValidator = new ConfigurationValidator(projectRoot);

  }


  async analyze(): Promise<Correction[]> {
    console.log('🏗️  Validating multi-platform project structure...');
    
    const corrections: Correction[] = [];
    
    // Run all validation checks using the separate validators
    corrections.push(...await this.directoryValidator.analyze());
    corrections.push(...await this.packageJsonValidator.analyze());
    corrections.push(...await this.fileStructureValidator.analyze());
    corrections.push(...await this.configurationValidator.analyze());
    
    return corrections;
  }


  private async getProjectStructure(): Promise<ProjectStructure> {
    console.log('📁 Scanning project structure...');

    try {

      const [files, packageJsonAnalyzer] = await Promise.all([
        this.scanProjectFiles(),
        this.readPackageJson()
      ]);

      const [interfaces, components, apis] = await Promise.all([
        this.extractInterfaces(files),
        this.extractComponents(files),
        this.extractApis(files)
      ]);


      const packageJsonData = packageJsonAnalyzer ?
        this.extractPackageJsonData(packageJsonAnalyzer) :
        null;

      // Log platform-specific insights
      if (packageJsonData) {
        this.logPlatformInsights(packageJsonData, components.length, interfaces.length);
      }

      return {
        files,
        interfaces,
        components,
        apis,
        totalFiles: files.length,
        packageJson: packageJsonData
      };
    } catch (error) {
      console.error('❌ Failed to scan project structure:', error);
      throw new Error(`Project structure scan failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private extractPackageJsonData(analyzer: PackageJsonAnalyzer): PackageJson {
    // This depends on your PackageJsonAnalyzer implementation
    return {
      name: analyzer.getName(), // or analyzer.name if it's a property
      version: analyzer.getVersion(), // or analyzer.version
      dependencies: analyzer.getDependencies(), // or analyzer.dependencies
      devDependencies: analyzer.getDevDependencies(), // or analyzer.devDependencies
      scripts: analyzer.getScripts(), // or analyzer.scripts
      // Add other required properties with default values or from the analyzer
      description: analyzer.getDescription?.() || '',
      keywords: analyzer.getKeywords?.() || [],
      // ... other properties
    };
  }


  private logPlatformInsights(pkg: PackageJson, componentCount: number, interfaceCount: number): void {
    console.log(`📊 ${pkg.name} v${pkg.version}`);
    console.log(`🏗️  Architecture: ${componentCount} components, ${interfaceCount} interfaces`);

    // Detect platform features from dependencies
    const features = [];
    if (pkg.dependencies?.['socket.io']) features.push('Real-time Communication');
    if (pkg.dependencies?.['web3'] || pkg.dependencies?.['ethers']) features.push('Crypto/Web3');
    if (pkg.dependencies?.['react-router-dom']) features.push('SPA Routing');
    if (pkg.workspaces) features.push('Monorepo Structure');

    if (features.length > 0) {
      console.log(`🎯 Detected features: ${features.join(', ')}`);
    }
  }


  private async scanProjectFiles(): Promise<string[]> {
    const files: string[] = [];
    const scanDirs = ['src', 'app', 'components', 'pages', 'utils', 'hooks', 'types'];

    const scanDirectory = async (dir: string): Promise<void> => {
      try {
        if (!fs.existsSync(dir)) return;

        const items = await fs.promises.readdir(dir, { withFileTypes: true });

        for (const item of items) {
          const fullPath = path.join(dir, item.name);

          if (item.isDirectory()) {
            // Skip node_modules and other irrelevant directories
            if (!this.shouldSkipDirectory(item.name)) {
              await scanDirectory(fullPath);
            }
          } else if (item.isFile() && this.isRelevantSourceFile(item.name)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Could not scan directory ${dir}:`, error);
      }
    };

    // Scan specified directories
    for (const dir of scanDirs) {
      const fullPath = path.resolve(process.cwd(), dir);
      await scanDirectory(fullPath);
    }

    // Also scan root directory for config files
    const rootItems = await fs.promises.readdir(process.cwd(), { withFileTypes: true });
    for (const item of rootItems) {
      if (item.isFile() && this.isRelevantConfigFile(item.name)) {
        files.push(path.resolve(process.cwd(), item.name));
      }
    }

    console.log(`📄 Found ${files.length} relevant files`);
    return files;
  }

  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = [
      'node_modules', '.git', '.next', 'dist', 'build',
      'coverage', '.cache', '.vscode', '.idea'
    ];
    return skipDirs.includes(dirName) || dirName.startsWith('.');
  }

  private isRelevantSourceFile(filename: string): boolean {
    const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.d.ts'];
    const extension = path.extname(filename).toLowerCase();

    return sourceExtensions.includes(extension) &&
      !filename.includes('.test.') &&
      !filename.includes('.spec.') &&
      !filename.includes('.stories.') &&
      !filename.includes('.config.');
  }

  private isRelevantConfigFile(filename: string): boolean {
    const configFiles = [
      'package.json', 'tsconfig.json', 'next.config.js', 'vite.config.js',
      'webpack.config.js', 'metro.config.js', 'babel.config.js'
    ];
    return configFiles.includes(filename);
  }

  private async extractInterfaces(files: string[]): Promise<[string, InterfaceInfo][]> {
    const interfaces: [string, InterfaceInfo][] = [];

    for (const file of files) {
      if (file.match(/\.(ts|tsx)$/)) {
        try {
          const content = await fs.promises.readFile(file, 'utf8');
          const fileInterfaces = this.parseInterfacesFromContent(content, file);
          interfaces.push(...fileInterfaces);
        } catch (error) {
          console.warn(`Could not read file for interface extraction: ${file}`, error);
        }
      }
    }

    console.log(`📊 Found ${interfaces.length} interfaces`);
    return interfaces;
  }

  private parseInterfacesFromContent(content: string, filePath: string): [string, InterfaceInfo][] {
    const interfaces: [string, InterfaceInfo][] = [];

    // Pattern for interfaces
    const interfacePattern = /(?:export\s+)?interface\s+(\w+)\s*(?:extends\s+([^{]+))?\s*{([^}]*)}/g;

    // Pattern for type aliases
    const typePattern = /(?:export\s+)?type\s+(\w+)\s*=\s*([^;]+);/g;

    let match;

    // Extract interfaces
    while ((match = interfacePattern.exec(content)) !== null) {
      const interfaceName = match[1];
      const extendsClause = match[2]?.trim();
      const interfaceBody = match[3];

      interfaces.push([interfaceName, {
        name: interfaceName,
        file: filePath,
        properties: this.extractProperties(interfaceBody),
        extends: extendsClause ? this.parseExtends(extendsClause) : [],
        type: 'interface'
      }]);
    }

    // Extract type aliases
    while ((match = typePattern.exec(content)) !== null) {
      const typeName = match[1];
      const typeDefinition = match[2];

      interfaces.push([typeName, {
        name: typeName,
        file: filePath,
        properties: this.extractTypeProperties(typeDefinition),
        extends: [],
        type: 'type'
      }]);
    }

    return interfaces;
  }

  private extractProperties(interfaceBody: string): Array<{ name: string; type: string; optional: boolean }> {
    const properties: Array<{ name: string; type: string; optional: boolean }> = [];
    const lines = interfaceBody.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;

      // Match property patterns: name: type, name?: type, readonly name: type
      const propertyPattern = /(?:readonly\s+)?(\w+)(\?)?\s*:\s*([^;,\n]+)/;
      const match = trimmed.match(propertyPattern);

      if (match) {
        properties.push({
          name: match[1],
          optional: !!match[2],
          type: match[3].trim()
        });
      }
    }

    return properties;
  }

  private extractTypeProperties(typeDefinition: string): Array<{ name: string; type: string; optional: boolean }> {
    const properties: Array<{ name: string; type: string; optional: boolean }> = [];

    // Check if it's an object type
    if (typeDefinition.trim().startsWith('{') && typeDefinition.trim().endsWith('}')) {
      const body = typeDefinition.substring(1, typeDefinition.length - 1);
      return this.extractProperties(body);
    }

    return properties;
  }

  private parseExtends(extendsClause: string): string[] {
    // Split by commas and ampersands for multiple extends
    return extendsClause.split(/,\s*|\s+&\s+/).map(ext => ext.trim()).filter(Boolean);
  }

  private async extractComponents(files: string[]): Promise<[string, ComponentInfo][]> {
    const components: [string, ComponentInfo][] = [];

    for (const file of files) {
      if (file.match(/\.(tsx|jsx)$/)) {
        try {
          const content = await fs.promises.readFile(file, 'utf8');
          const fileComponents = this.parseComponentsFromContent(content, file);
          components.push(...fileComponents);
        } catch (error) {
          console.warn(`Could not read file for component extraction: ${file}`, error);
        }
      }
    }

    console.log(`⚛️  Found ${components.length} components`);
    return components;
  }

  private parseComponentsFromContent(content: string, filePath: string): [string, ComponentInfo][] {
    const components: [string, ComponentInfo][] = [];

    // Pattern for function components (arrow and regular)
    const functionComponentPatterns = [
      /(?:export\s+)?const\s+(\w+)\s*:\s*React\.FC<.*?>\s*=\s*\(([^)]*)\)\s*=>/g,
      /(?:export\s+)?const\s+(\w+)\s*=\s*(?:\(([^)]*)\)\s*=>|\(([^)]*)\):\s*JSX\.Element)/g,
      /(?:export\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*(?::\s*JSX\.Element)?\s*{/g
    ];

    // Pattern for class components
    const classComponentPattern = /(?:export\s+)?class\s+(\w+)\s+extends\s+React\.Component<([^,>]+)/g;

    for (const pattern of functionComponentPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const componentName = match[1];
        const propsParam = match[2] || match[3] || '';

        if (componentName && componentName[0] === componentName[0].toUpperCase()) {
          const componentInfo: ComponentInfo = {
            name: componentName,
            file: filePath,
            type: 'function',
            hasProps: this.detectPropsUsage(content, componentName) || propsParam.length > 0,
            propsType: this.extractPropsType(content, componentName),
            exports: this.extractExports(content, componentName)
          };

          components.push([componentName, componentInfo]);
        }
      }
    }

    // Class components
    let match;
    while ((match = classComponentPattern.exec(content)) !== null) {
      const componentName = match[1];
      const componentInfo: ComponentInfo = {
        name: componentName,
        file: filePath,
        type: 'class',
        hasProps: content.includes('this.props'),
        propsType: this.extractClassPropsType(content, componentName),
        exports: this.extractExports(content, componentName)
      };

      components.push([componentName, componentInfo]);
    }

    return components;
  }

  private detectPropsUsage(content: string, componentName: string): boolean {
    const propsPatterns = [
      /props\s*[\.:]/,
      new RegExp(`${componentName}\\.propTypes`, 'i'),
      /interface.*Props/,
      /type.*Props/
    ];

    return propsPatterns.some(pattern => pattern.test(content));
  }

  private extractPropsType(content: string, componentName: string): string | undefined {
    const patterns = [
      new RegExp(`interface\\s+(${componentName}Props)\\s*{`),
      new RegExp(`type\\s+(${componentName}Props)\\s*=`),
      /React\.FC<([^>]+)>/,
      /:\s*React\.FC<([^>]+)>/
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private extractClassPropsType(content: string, componentName: string): string | undefined {
    const pattern = new RegExp(`class\\s+${componentName}\\s+extends\\s+React\\.Component<([^,>]+)`);
    const match = content.match(pattern);
    return match ? match[1].trim() : undefined;
  }

  private async extractApis(files: string[]): Promise<[string, ApiInfo][]> {
    const apis: [string, ApiInfo][] = [];

    for (const file of files) {
      if (file.includes('api') || file.includes('service') || file.includes('utils')) {
        try {
          const content = await fs.promises.readFile(file, 'utf8');
          const fileApis = this.parseApisFromContent(content, file);
          apis.push(...fileApis);
        } catch (error) {
          console.warn(`Could not read file for API extraction: ${file}`, error);
        }
      }
    }

    console.log(`🔌 Found ${apis.length} API/services`);
    return apis;
  }

  private parseApisFromContent(content: string, filePath: string): [string, ApiInfo][] {
    const apis: [string, ApiInfo][] = [];

    // Pattern for API functions (fetch, axios, etc.)
    const apiPatterns = [
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*(?::\s*([^{]+))?\s*{[\s\S]*?(?:fetch|axios|\.get|\.post|\.put|\.delete)/g,
      /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*(?::\s*([^{]+))?\s*=>\s*{[\s\S]*?(?:fetch|axios|\.get|\.post|\.put|\.delete)/g
    ];

    for (const pattern of apiPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const apiName = match[1];
        const parameters = match[2] || '';
        const returnType = match[3] || 'void';
        const isAsync = content.includes(`async ${apiName}`) || content.includes(`async function ${apiName}`) || content.includes(`const ${apiName} = async`);

        const apiInfo: ApiInfo = {
          name: apiName,
          file: filePath,
          type: 'function',
          methods: [{
            name: apiName,
            parameters: this.parseParameters(parameters),
            returnType: returnType.trim(),
            type: 'api',
            isAsync
          }],
          exports: this.extractExports(content, apiName)
        };

        apis.push([apiName, apiInfo]);
      }
    }

    return apis;
  }

  // Helper methods for parsing
  private parseParameters(parameters: string): string[] {
    if (!parameters.trim()) return [];

    return parameters.split(',')
      .map(param => param.trim())
      .filter(param => param.length > 0)
      .map(param => {
        // Extract parameter name (remove type annotations and default values)
        const paramMatch = param.match(/^([^:=\s]+)/);
        return paramMatch ? paramMatch[1] : param;
      });
  }

  private extractExports(content: string, entityName: string): string[] {
    const exports: string[] = [];

    // Check for export statements
    const exportPatterns = [
      new RegExp(`export\\s+(?:const|function|class|interface|type)\\s+${entityName}`, 'g'),
      new RegExp(`export\\s*\\{[^}]*\\b${entityName}\\b[^}]*\\}`, 'g'),
      new RegExp(`export\\s+default\\s+${entityName}`, 'g')
    ];

    exportPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        exports.push(entityName);
      }
    });

    return exports;
  }

  private detectHttpMethod(content: string, apiName: string): string {
    const methodPatterns = {
      get: new RegExp(`${apiName}[\\s\\S]*?\\.get\\(`),
      post: new RegExp(`${apiName}[\\s\\S]*?\\.post\\(`),
      put: new RegExp(`${apiName}[\\s\\S]*?\\.put\\(`),
      delete: new RegExp(`${apiName}[\\s\\S]*?\\.delete\\(`)
    };

    for (const [method, pattern] of Object.entries(methodPatterns)) {
      if (pattern.test(content)) {
        return method;
      }
    }

    return 'unknown';
  }

  private async readPackageJson(): Promise<PackageJsonAnalyzer> {
    try {
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const content = await fs.promises.readFile(packageJsonPath, 'utf8');
        const packageData = JSON.parse(content);

        // Create a new PackageJsonAnalyzer instance
        const analyzer = new PackageJsonAnalyzer();

        // If you need to pass the package data to the analyzer, you might need to modify PackageJsonAnalyzer
        // For example, add a method like analyzer.setPackageData(packageData)

        return analyzer;
      }
    } catch (error) {
      console.warn('Could not read package.json:', error);
    }

    // Return a new PackageJsonAnalyzer instance even if file doesn't exist
    return new PackageJsonAnalyzer();
  }


  public async getPackageJsonData(): Promise<PackageJson | null> {
    try {
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const content = await fs.promises.readFile(packageJsonPath, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn('Could not read package.json:', error);
    }
    return null;
  }

  private async analyzePackageJson(): Promise<Correction[]> {
    const analyzer = new PackageJsonAnalyzer();
    return await analyzer.analyze();
  }

  async validateStructure(projectStructure: ProjectStructure): Promise<Correction[]> {
    console.log('🏗️  Validating multi-platform project structure...');

    // ⭐ Collect all corrections here
    const corrections: Correction[] = [];

    // Build the analysis object once
    const analysis: ProjectStructureAnalysis =
      this.createCorrectionProjectStructureAnalysis(projectStructure);

    // Run each validator exactly once
    corrections.push(...this.findUnusedProps(analysis));
    corrections.push(...this.findMissingProps(analysis));
    corrections.push(...this.findNamingInconsistencies(analysis));
    corrections.push(...await this.validateFileStructure(analysis));
    corrections.push(...await this.findImportIssues(analysis));
    corrections.push(...this.findSecurityIssues(analysis));
    corrections.push(...this.findPerformanceIssues(analysis));
    corrections.push(...await this.validateDirectories(analysis));
    corrections.push(...await this.analyzePackageJson());
    corrections.push(...await this.analyze());

    // ⭐ Deduplicate corrections by ID + file
    return this.removeDuplicateCorrections(corrections);
  }

  private removeDuplicateCorrections(corrections: Correction[]): Correction[] {
    const seen = new Set<string>();

    return corrections.filter((c) => {
      const key = `${c.id}::${c.file || ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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
        this.createCorrection(
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
        this.createCorrection(
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
          this.createCorrection(
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


  private createStructureCorrection(id: string, file: string, context: any = {}): Correction {
      return {
          id: `${id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: context.type || 'warning',
          severity: context.severity || 'medium',
          file,
          message: context.message || `Structure issue: ${id}`, // Use your existing message system
          code: context.code || '',
          fix: context.fix || '',
          category: 'structure',
          timestamp: new Date().toISOString()
      };
  }

  private async validateDirectories(analysis: ProjectStructureAnalysis): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const expectedDirs = ['src/components', 'src/utils', 'src/hooks'];

    expectedDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        corrections.push(this.createStructureCorrection(
          `missing-directory-${dir.replace(/\//g, '-')}`,
          dir,
          {
            directoryPath: dir,
            code: `// Expected directory: ${dir}`,
            fix: `Create the ${dir} directory structure`
          }
        ));
      }
    });

    return corrections;
  }

  private hasDependency(packageJson: any, dependency: string): boolean {
    return !!(
      (packageJson.dependencies && packageJson.dependencies[dependency]) ||
      (packageJson.peerDependencies && packageJson.peerDependencies[dependency]) ||
      (packageJson.devDependencies && packageJson.devDependencies[dependency])
    );
  }

  private async validateConfigurationFiles(analysis: ProjectStructureAnalysis): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    const configFiles = ['.gitignore', '.eslintrc.js', '.prettierrc'];
    
    configFiles.forEach(configFile => {
        if (!fs.existsSync(configFile)) {
            corrections.push(this.createStructureCorrection(
                `missing-config-${configFile.replace(/\./g, '-')}`,
                configFile,
                {
                    configFile,
                    code: `// Missing configuration: ${configFile}`,
                    fix: `Create ${configFile} with appropriate settings`
                }
            ));
        }
    });

    return corrections;
}


  private async validatePackageJson(analysis: ProjectStructureAnalysis): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const packageJsonPath = './package.json';

    if (!fs.existsSync(packageJsonPath)) {
      corrections.push(this.createStructureCorrection(
        'missing-package-json',
        packageJsonPath,
        {
          code: '// package.json file missing',
          fix: 'Initialize project with npm init or create package.json manually'
        }
      ));
      return corrections;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Check for React Native Reanimated
      if (!this.hasDependency(packageJson, 'react-native-reanimated')) {
        corrections.push(this.createStructureCorrection(
          'package-json-missing-react-native-reanimated',
          packageJsonPath,
          {
            code: '// Add react-native-reanimated to dependencies',
            fix: 'npm install react-native-reanimated'
          }
        ));
      }

      // Check for build scripts
      if (!packageJson.scripts?.build) {
        corrections.push(this.createStructureCorrection(
          'package-json-missing-build',
          packageJsonPath,
          {
            code: '// Build script missing in package.json',
            fix: 'Add "build": "your-build-command" to package.json scripts'
          }
        ));
      }

    } catch (error) {
      corrections.push(this.createStructureCorrection(
        'package-json-invalid',
        packageJsonPath,
        {
          code: '// Invalid package.json format',
          fix: 'Fix JSON syntax errors in package.json'
        }
      ));
    }

    return corrections;
  }

}