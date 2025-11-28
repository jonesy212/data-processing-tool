// generateTree.ts
// generateTree.ts - Complete Enhanced Version (ESM)

import { AnalysisReport } from '@/app/documents/Report';
import ApiMethod from '@/app/generators/ApiCodeGenerator';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProjectStructure } from '@/app/scripts/generateRoadmaps'
import { PackageJson } from '@/app/scripts/generate-commands-doc'

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


interface ProjectFile {
    content?: string;
    path?: string;
    // add other properties as needed
}

// === PROJECT TREE ANALYZER CLASS ===
export class ProjectTreeAnalyzer {
  private analysisCache: ProjectStructure | null = null;
  rootPath: string;
  fileCache: Map<string, string>;
  interfaceRegistry: Map<string, any>;
  componentRegistry: Map<string, any>;
  apiRegistry: Map<string, any>;
  packageJson: PackageJson;

  constructor(rootPath = '.') {
    this.rootPath = rootPath;
    this.fileCache = new Map();
    this.interfaceRegistry = new Map();
    this.componentRegistry = new Map();
    this.apiRegistry = new Map();
    this.packageJson = this.loadPackageJson();
  }



  private loadPackageJson(): PackageJson {
    try {
      const packageJsonPath = path.join(this.rootPath, 'package.json');
      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('Could not load package.json:', error);
      return {} as PackageJson;
    }
  }

  async analyzeProjectTree(): Promise<ProjectStructure> {
    // If already analyzed, return cached result
    if (this.analysisCache) {
      console.log('🔍 Returning cached project analysis...');
      return this.analysisCache;
    }
    
    console.log('🔍 Analyzing project structure...');
    await this.traverseDirectory(this.rootPath);
    
    const result = {
      interfaces: Array.from(this.interfaceRegistry.entries()),
      components: Array.from(this.componentRegistry.entries()),
      apis: Array.from(this.apiRegistry.entries()),
      files: [],
      totalFiles: this.fileCache.size,
      packageJson: this.packageJson
    };
    
    this.analysisCache = result;
    return result;
  }

  // Optional: method to clear cache if needed
  clearCache() {
    this.analysisCache = null;
  }

  getProjectStructure(): ProjectStructure {
    if (!this.analysisCache) {
      throw new Error('Project structure not analyzed yet. Call analyzeProjectTree() first.');
    }
    return this.analysisCache;
  }

  async traverseDirectory(dirPath: string, depth = 0): Promise<void> {
    try {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules' || item === 'dist') continue;

        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          await this.traverseDirectory(fullPath, depth + 1);
        } else {
          await this.analyzeFile(fullPath);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`⚠️ Could not read directory: ${dirPath}`, error.message);
      } else {
        console.warn(`⚠️ Could not read directory: ${dirPath}`, String(error));
      }
    }
  }

  async analyzeFile(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.ts', '.tsx', '.js', '.jsx', '.json'].includes(ext)) return;

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.fileCache.set(filePath, content);

      if (filePath.includes('interface') || filePath.includes('types')) this.extractInterfaces(filePath, content);
      if (filePath.includes('components') || filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) this.extractComponents(filePath, content);
      if (filePath.includes('api') || filePath.includes('services')) this.extractApis(filePath, content);

    } catch (error) {
      if (error instanceof Error) {
        console.warn(`⚠️ Could not read file: ${filePath}`, error.message);
      }
    }
  }

  extractInterfaces(filePath: string, content: string) {
    const interfaceRegex = /(?:interface|type)\s+(\w+)\s*(?:extends\s+[^{]+)?\s*{([^}]+)}/g;
    const typeAliasRegex = /type\s+(\w+)\s*=\s*([^;]+);/g;
    let match;

    while ((match = interfaceRegex.exec(content)) !== null) {
      const [, name, body] = match;
      const properties = this.extractProperties(body);
      this.interfaceRegistry.set(name, { file: filePath, name, properties, type: 'interface' });
    }

    while ((match = typeAliasRegex.exec(content)) !== null) {
      const [, name, definition] = match;
      this.interfaceRegistry.set(name, { file: filePath, name, definition: definition.trim(), type: 'type' });
    }
  }

  extractComponents(filePath: string, content: string) {
    const componentRegex = /(?:const|function)\s+(\w+)\s*(?:<[^>]*>)?\s*[=:]\s*(?:React\.)?(?:FC|FunctionComponent|Component)<([^>]+)>/g;
    const propsRegex = /interface\s+(\w+Props)\s*{([^}]+)}/g;
    let match;

    while ((match = componentRegex.exec(content)) !== null) {
      const [, componentName, propsType] = match;
      this.componentRegistry.set(componentName, { file: filePath, name: componentName, propsType: propsType.trim(), exports: this.extractExports(content) });
    }

    while ((match = propsRegex.exec(content)) !== null) {
      const [, propsName, body] = match;
      const properties = this.extractProperties(body);
      this.interfaceRegistry.set(propsName, { file: filePath, name: propsName, properties, type: 'props' });
    }
  }

  extractApis(filePath: string, content: string): void {
    // Focus on meaningful API patterns and exclude internal/compiler names
    const exportedFunctionRegex = /export\s+(?:async\s+)?(?:function\s+)([a-zA-Z_$][\w$]*)(?:\s*<\s*[^>]*\s*>)?\s*\(\s*([^)]*)\s*\)\s*(?::\s*([^{=>]+))?/g;
    const exportedConstRegex = /export\s+const\s+([a-zA-Z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\(\s*([^)]*)\s*\)|(\w+))\s*(?::\s*([^{=>]+))?\s*=>/g;
    const classMethodRegex = /(?:public|private|protected|readonly)?\s*(?:async\s+)?(\w+)\s*(?:\<\s*[^>]*\s*\>)?\s*\(\s*([^)]*)\s*\)\s*(?::\s*([^{]+))?\s*{/g;
    
    // Extended exclusion list for internal/compiler names and common JS methods
    const excludedNames = new Set([
      // Compiler/internal names
      '__awaiter', '__generator', '__exportStar', '__createBinding', '__values', 
      '__read', '__spread', '__spreadArrays', '__spreadArray', '__await', 
      '__asyncGenerator', '__asyncDelegator', '__asyncValues', '__makeTemplateObject',
      '__importStar', '__importDefault', '__classPrivateFieldGet', '__classPrivateFieldSet',
      '__classPrivateFieldIn',
      
      // JavaScript built-in methods
      'constructor', 'toString', 'valueOf', 'toLocaleString', 'hasOwnProperty',
      'isPrototypeOf', 'propertyIsEnumerable', 
      
      // Common utility/helper names that aren't APIs
      'adopt', 'fulfilled', 'rejected', 'step', 'verb', 'resolve', 'reject',
      'then', 'catch', 'finally', 'Promise', 'setTimeout', 'setInterval',
      
      // Array methods
      'map', 'filter', 'forEach', 'reduce', 'find', 'some', 'every', 'includes',
      'indexOf', 'slice', 'splice', 'push', 'pop', 'shift', 'unshift',
      
      // Object methods
      'keys', 'values', 'entries', 'assign', 'create', 'defineProperty',
      
      // Control flow
      'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'try',
      'throw', 'return', 'break', 'continue', 'debugger'
    ]);

    let match;
    const methods: ApiMethod[] = [];

    // Helper to check if a method name is meaningful
    const isMeaningfulMethod = (name: string): boolean => {
      if (!name || excludedNames.has(name)) return false;
      
      // Exclude very short names (likely internal)
      if (name.length < 3) return false;
      
      // Exclude names starting with underscore (typically private/internal)
      if (name.startsWith('_')) return false;
      
      // Include names that suggest API actions
      const apiPatterns = [/^get|set|fetch|create|update|delete|remove|add|find|search|list|handle/i];
      return apiPatterns.some(pattern => pattern.test(name));
    };

    // Exported functions
    while ((match = exportedFunctionRegex.exec(content)) !== null) {
      const [, methodName, params, returnType] = match;
      if (isMeaningfulMethod(methodName)) {
        methods.push({
          name: methodName,
          parameters: params ? [params.trim()] : [],
          returnType: returnType?.trim() || 'any',
          type: 'api',
          isAsync: match[0].includes('async')
        });
      }
    }

    // Exported const functions (arrow functions)
    while ((match = exportedConstRegex.exec(content)) !== null) {
      const [, methodName, arrowParams, singleParam, returnType] = match;
      if (isMeaningfulMethod(methodName)) {
        const params = arrowParams || singleParam || '';
        methods.push({
          name: methodName,
          parameters: params ? [params.trim()] : [],
          returnType: returnType?.trim() || 'any',
          type: 'api',
          isAsync: match[0].includes('async')
        });
      }
    }

    // Class methods - be more selective
    while ((match = classMethodRegex.exec(content)) !== null) {
      const [, methodName, params, returnType] = match;
      if (isMeaningfulMethod(methodName)) {
        methods.push({
          name: methodName,
          parameters: params ? [params.trim()] : [],
          returnType: returnType?.trim() || 'any',
          type: 'service',
          isAsync: match[0].includes('async')
        });
      }
    }

    if (methods.length > 0) {
      this.apiRegistry.set(filePath, {
        file: filePath,
        methods,
        exports: this.extractExports(content)
      });
    }
  }

  extractProperties(body: string) {
    const propRegex = /(\w+)(\?)?\s*:\s*([^;\n]+)/g;
    const properties = [];
    let match;

    while ((match = propRegex.exec(body)) !== null) {
      const [, name, optional, type] = match;
      properties.push({ name: name.trim(), type: type.trim(), optional: !!optional });
    }

    return properties;
  }

  extractExports(content: string) {
    const exportRegex = /export\s+(?:const|function|class|interface|type)\s+(\w+)/g;
    const exports = [];
    let match;
    while ((match = exportRegex.exec(content)) !== null) exports.push(match[1]);
    return exports;
  }

  findRelevantFiles(userPrompt: string) {
    const keywords = this.extractKeywords(userPrompt);
    const relevantFiles = new Map();

    for (const [filePath, content] of this.fileCache) {
      const relevanceScore = this.calculateRelevance(content, keywords);
      if (relevanceScore > 0) {
        relevantFiles.set(filePath, {
          content,
          relevanceScore,
          matchedKeywords: keywords.filter(keyword => content.toLowerCase().includes(keyword.toLowerCase()))
        });
      }
    }

    return Array.from(relevantFiles.entries())
      .sort((a, b) => b[1].relevanceScore - a[1].relevanceScore)
      .slice(0, 10);
  }

  extractKeywords(prompt: string) {
    const techKeywords = ['component', 'interface', 'props', 'state', 'hook', 'api', 'service', 'model', 'type', 'enum', 'function', 'class'];
    const words = prompt.toLowerCase().split(/\s+/).filter(w => w.length > 3).concat(techKeywords);
    return [...new Set(words)];
  }

  calculateRelevance(content: string, keywords: string[]) {
    const contentLower = content.toLowerCase();
    let score = 0;
    keywords.forEach(keyword => {
      const matches = contentLower.match(new RegExp(`\\b${keyword}\\b`, 'gi'));
      if (matches) score += matches.length;
    });
    return score;
  }

  async generateReport(userPrompt: string) {
    const analysis = await this.analyzeProjectTree(); // ✅ await here
    const relevantFiles = this.findRelevantFiles(userPrompt);
    return {
      userPrompt,
      timestamp: new Date().toISOString(),
      projectStructure: analysis,
      relevantFiles,
      suggestedComponents: this.suggestComponents(userPrompt),
      suggestedInterfaces: this.suggestInterfaces(userPrompt),
      suggestedApis: this.suggestApis(userPrompt)
    };
  }

  suggestComponents(userPrompt: string) {
    const suggestions = [];
    const keywords = this.extractKeywords(userPrompt);
    for (const [name, component] of this.componentRegistry) {
      if (keywords.some(k => name.toLowerCase().includes(k.toLowerCase()))) suggestions.push(component);
    }
    return suggestions;
  }

  suggestInterfaces(userPrompt: string) {
    const suggestions = [];
    const keywords = this.extractKeywords(userPrompt);
    for (const [name, interfaceInfo] of this.interfaceRegistry) {
      if (keywords.some(k => name.toLowerCase().includes(k.toLowerCase()))) suggestions.push(interfaceInfo);
    }
    return suggestions;
  }

  suggestApis(userPrompt: string) {
    const suggestions = [];
    const keywords = this.extractKeywords(userPrompt);
  
    for (const [filePath, apiInfo] of this.apiRegistry) {
      const relevantMethods = apiInfo.methods.filter((method: ApiMethod) =>
        keywords.some(k =>
          method.name.toLowerCase().includes(k.toLowerCase()) ||
          method.returnType.toLowerCase().includes(k.toLowerCase()) ||
          method.type.toLowerCase().includes(k.toLowerCase())
        )
      );
    
      // ✅ Added the missing logic to push to suggestions
      if (relevantMethods.length > 0) {
        suggestions.push({
          file: filePath,
          methods: relevantMethods,
          exports: apiInfo.exports
        });
      }
    }
  
    return suggestions;
  }
}

// === ORIGINAL TREE GENERATION ===
async function generateProjectTree(
  dirPath: string = '.', 
  prefix: string = '', 
  depth: number = 0, 
  maxDepth: number = 5
): Promise<string> {
  if (depth > maxDepth) return '';
  
  try {
    const items = fs.readdirSync(dirPath)
      .filter(item => !item.startsWith('.') && item !== 'node_modules' && item !== 'dist')
      .sort((a, b) => {
        // Directories first, then files
        const aPath = path.join(dirPath, a);
        const bPath = path.join(dirPath, b);
        const aIsDir = fs.statSync(aPath).isDirectory();
        const bIsDir = fs.statSync(bPath).isDirectory();
        
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
      });

    if (items.length === 0) return '';

    let tree = '';
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      const isLast = i === items.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const currentPrefix = prefix + connector;
      
      tree += currentPrefix + item + '\n';
      
      if (stat.isDirectory()) {
        const nextPrefix = prefix + (isLast ? '    ' : '│   ');
        const subtree = await generateProjectTree(fullPath, nextPrefix, depth + 1, maxDepth);
        tree += subtree;
      }
    }
    
    return tree;
  } catch (error) {
    console.warn(`⚠️ Could not read directory: ${dirPath}`, error);
    return '';
  }
}

function generateTextTree(tree: string): string {
  return `Project Tree\nGenerated: ${new Date().toISOString()}\n\n${tree}`;
}

function generateMarkdownTree(tree: string): string {
  return `# Project Tree\n\n**Generated**: ${new Date().toISOString()}\n\n\`\`\`\n${tree}\n\`\`\``;
}

// --- mappers.ts config ---
const mappersFile = path.resolve(__dirname, '../../server/repository/mappers.ts');

async function updateMappers(relevantNames: string[]) {
  const analyzer = new ProjectTreeAnalyzer(path.resolve(__dirname, '../../src'));
  
  await analyzer.analyzeProjectTree();
  
  const projectStructure = analyzer.getProjectStructure();
  
  
  const relevantFiles = Array.from(analyzer.interfaceRegistry.values())
    .filter(item => relevantNames.includes(item.name));

  const importStatements = relevantFiles
    .map(item => {
      const relativePath = path.relative(path.dirname(mappersFile), item.file)
        .replace(/\\/g, '/')
        .replace(/\.ts$/, '');
      return `import { ${item.name} } from '${relativePath.startsWith('.') ? relativePath : './' + relativePath}';`;
    })
    .join('\n');

  let existingContent = '';
  if (fs.existsSync(mappersFile)) {
    existingContent = fs.readFileSync(mappersFile, 'utf-8');
  } else {
    existingContent = '// AUTO-IMPORTS START\n// AUTO-IMPORTS END\n\n';
  }

  const updatedContent = existingContent.replace(
    /\/\/ AUTO-IMPORTS START[\s\S]*?\/\/ AUTO-IMPORTS END/,
    `// AUTO-IMPORTS START\n${importStatements}\n// AUTO-IMPORTS END`
  );

  fs.writeFileSync(mappersFile, updatedContent, 'utf-8');
  console.log('✅ mappers.ts imports updated automatically!');
}

// --- Hook into Analysis ---
async function generateAnalysisReportWithMappers(args: string[]) {
  const userPrompt = args[0];
  const outputIndex = args.indexOf('--output');
  const outputPath = outputIndex !== -1 ? args[outputIndex + 1] : null;

  const analyzer = new ProjectTreeAnalyzer();
  const report = await analyzer.generateReport(userPrompt);
  displayReport(report);

  // Update mappers automatically based on relevant interfaces
  const relevantNames = report.relevantFiles.map(([_, info]) => info.matchedKeywords).flat();
  await updateMappers(relevantNames);

  if (outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Analysis saved to: ${outputPath}`);
  }
}

// === MAIN FUNCTION ===
export async function main() {
  const args = process.argv.slice(2);
  const outputTypes = ['text', 'markdown', 'json'];
  const firstArg = args[0];

  if (!firstArg || outputTypes.includes(firstArg)) {
    await generateTreeOutput(args);
  } else {
    await generateAnalysisReportWithMappers(args);
  }
}

// === TREE OUTPUT ===
// === TREE OUTPUT ===
async function generateTreeOutput(args: string[]) {
  const outputType = args[0] || 'text';
  const outputIndex = args.indexOf('--output');
  const outputPath = outputIndex !== -1 ? args[outputIndex + 1] : null;

  console.log('🌳 Generating project tree...');
  const tree = await generateProjectTree();

  let content, extension;
  switch (outputType) {
    case 'markdown':
      content = generateMarkdownTree(tree);
      extension = 'md';
      break;
    case 'json':
      // Create a structured JSON object instead of a string with newlines
      const treeLines = tree.split('\n').filter(line => line.trim());
      const structuredTree = {
        generated: new Date().toISOString(),
        tree: {
          raw: tree, // The original tree string
          lines: treeLines, // Array of individual lines
          formatted: treeLines.map(line => ({
            level: (line.match(/│|└──|├──/g) || []).length,
            content: line.trim(),
            isDirectory: line.includes('└──') || line.includes('├──') ? 
              line.includes('.') ? false : true : false
          }))
        }
      };
      content = JSON.stringify(structuredTree, null, 2);
      extension = 'json';
      break;
    default:
      content = generateTextTree(tree);
      extension = 'txt';
  }

  const filename = outputPath || `project-tree.${extension}`;
  const dir = path.dirname(filename);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(filename, content);
  console.log(`✅ Project tree generated: ${filename}`);
}

// === ANALYSIS OUTPUT ===
async function generateAnalysisReport(args: string[]) {
  const userPrompt = args[0];
  const outputIndex = args.indexOf('--output');
  const outputPath = outputIndex !== -1 ? args[outputIndex + 1] : null;

  const analyzer = new ProjectTreeAnalyzer();
  const report = await analyzer.generateReport(userPrompt);
  
  displayReport(report);

  if (outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Analysis saved to: ${outputPath}`);
  }
}

// === DISPLAY FUNCTIONS ===
function displayReport(report: AnalysisReport) {
  console.log('='.repeat(80));
  console.log('📊 PROJECT ANALYSIS REPORT');
  console.log('='.repeat(80));
  console.log(`\n📝 User Prompt: ${report.userPrompt || 'No specific prompt provided'}`);
  console.log(`🕒 Analysis Time: ${report.timestamp}`);
  console.log(`📁 Total Files Analyzed: ${report.projectStructure.totalFiles}\n`);

  if (report.relevantFiles.length > 0) {
    console.log('🎯 RELEVANT FILES:');
    console.log('-'.repeat(40));
    report.relevantFiles.forEach(([filePath, info]: [string, any], index: number) => {
      console.log(`${index + 1}. ${filePath}`);
      console.log(`   Relevance Score: ${info.relevanceScore}`);
      console.log(`   Matched Keywords: ${info.matchedKeywords.join(', ')}`);
      console.log('');
    });
  }

  if (report.suggestedComponents.length > 0) {
    console.log('⚛️  SUGGESTED COMPONENTS:');
    console.log('-'.repeat(40));
    report.suggestedComponents.forEach((component: any, index: number) => {
      console.log(`${index + 1}. ${component.name}`);
      console.log(`   File: ${component.file}`);
      console.log(`   Props Type: ${component.propsType}`);
      console.log(`   Exports: ${component.exports.join(', ')}`);
      console.log('');
    });
  }

  if (report.suggestedInterfaces.length > 0) {
    console.log('📐 SUGGESTED INTERFACES:');
    console.log('-'.repeat(40));
    report.suggestedInterfaces.forEach((interfaceInfo: any, index: number) => {
      console.log(`${index + 1}. ${interfaceInfo.name} (${interfaceInfo.type})`);
      console.log(`   File: ${interfaceInfo.file}`);
      if (interfaceInfo.properties) {
        console.log('   Properties:');
        interfaceInfo.properties.forEach((prop: any) => {
          console.log(`     - ${prop.name}${prop.optional ? '?' : ''}: ${prop.type}`);
        });
      }
      console.log('');
    });
  }

  if (report.suggestedApis.length > 0) {
    console.log('🔌 SUGGESTED APIs/SERVICES:');
    console.log('-'.repeat(40));
    report.suggestedApis.forEach((api, index: number) => {
      console.log(`${index + 1}. ${api.file}`);
      console.log('   Methods:');
      api.methods.forEach((method: ApiMethod) => { 
        console.log(`     - ${method.name}(${method.parameters.join(', ')}): ${method.returnType}`);
      });
      console.log('');
    });
  }

  console.log('💡 POTENTIAL INTEGRATIONS:');
  console.log('-'.repeat(40));
  suggestPotentialIntegrations(report);
}

function suggestPotentialIntegrations(report: AnalysisReport) {
  const { userPrompt, projectStructure } = report;
  const integrations = [];

  // Only filter when the user prompt matches
  if (userPrompt?.toLowerCase().includes('crypto') || userPrompt?.toLowerCase().includes('nft')) {
    const cryptoFiles = projectStructure.apis.filter((item: [string, any]) => 
      item[0].toLowerCase().includes('crypto')
    );
    if (cryptoFiles.length > 0) integrations.push('💰 Crypto/NFT Integration: Available crypto services detected');
  }

  if (userPrompt?.toLowerCase().includes('real-time') || userPrompt?.toLowerCase().includes('live')) {
    const realtimeFiles = projectStructure.apis.filter((item: [string, any]) => 
      item[0].toLowerCase().includes('realtime')
    );
    if (realtimeFiles.length > 0) integrations.push('⚡ Real-time Features: WebSocket and real-time APIs available');
  }

  if (userPrompt?.toLowerCase().includes('collaboration') || userPrompt?.toLowerCase().includes('team')) {
    const collaborationFiles = projectStructure.components.filter((item: [string, any]) => 
      item[0].toLowerCase().includes('collaboration')
    );
    if (collaborationFiles.length > 0) integrations.push('👥 Collaboration Tools: Team and collaboration components available');
  }

  if (userPrompt?.toLowerCase().includes('ai') || userPrompt?.toLowerCase().includes('machine learning')) {
    const aiFiles = projectStructure.apis.filter((item: [string, any]) => 
      item[0].toLowerCase().includes('ai') || item[0].toLowerCase().includes('intelligence')
    );
    if (aiFiles.length > 0) integrations.push('🤖 AI/ML Capabilities: Intelligence and automation services available');
  }

  if (integrations.length === 0) {
    console.log('No specific integration patterns detected. Consider adding new services based on your requirements.');
  } else {
    integrations.forEach(i => console.log(`✅ ${i}`));
  }
}

// === RUN IF DIRECTLY CALLED ===
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch(console.error);
}

export { mappersFile };
export type { ProjectFile }

// === COMMANDS SECTION ===

// #NOTE - TypeScript Commands (.ts file) - USING TSX
// | **Output Type**   | **Command**                                              | **File Generated**    |
// | ----------------- | -------------------------------------------------------- | --------------------- |
// | 🧱 Text (default) | `tsx src/app/scripts/generateTree.ts text`              | `project-tree.txt`    |
// | 📘 Markdown       | `tsx src/app/scripts/generateTree.ts markdown`          | `project-tree.md`     |
// | 🧮 JSON           | `tsx src/app/scripts/generateTree.ts json`              | `project-tree.json`   |
// | ✨ Custom Path     | `tsx src/app/scripts/generateTree.ts text --output ./docs/my-tree.txt`  | `./docs/my-tree.txt`  |
// | ✨ Custom Path     | `tsx src/app/scripts/generateTree.ts markdown --output ./docs/my-tree.md` | `./docs/my-tree.md`   |
// | ✨ Custom Path     | `tsx src/app/scripts/generateTree.ts json --output ./docs/my-tree.json` | `./docs/my-tree.json` |

// # 🔍 ANALYSIS MODE - TypeScript
// # Basic analysis (console output only)
// tsx src/app/scripts/generateTree.ts "task management system with real-time collaboration"

// # Analysis with file output
// tsx src/app/scripts/generateTree.ts "crypto trading dashboard" --output ./analysis/crypto-analysis.json

// # Analysis with custom path
// tsx src/app/scripts/generateTree.ts "content management system" --output ./docs/feature-analysis.json

// # 🎯 ROADMAP GENERATION - TypeScript (NEW!)
// | **Command**                                              | **Files Generated**                                       |
// | -------------------------------------------------------- | --------------------------------------------------------- |
// | `tsx src/app/scripts/generateRoadmaps.ts "project name"` | `dev-roadmap.md`, `nontech-roadmap.md`, `frontend-packages.md`, `backend-packages.md` |
// | `tsx src/app/scripts/generateRoadmaps.ts "crypto dashboard" --output ./docs` | All 4 files in `./docs/` directory |
// | `tsx src/app/scripts/generateRoadmaps.ts "task app"`     | Complete project roadmap with package recommendations     |

// # 🎯 EXISTING TREE GENERATION - TypeScript!
// tsx src/app/scripts/generateTree.ts text
// tsx src/app/scripts/generateTree.ts markdown --output ./docs/structure.md
// tsx src/app/scripts/generateTree.ts json --output ./docs/tree.json

// # 🏗 BUILD & RUN COMMANDS (After compilation)
// | **Output Type**   | **Command**                                              | **File Generated**    |
// | ----------------- | -------------------------------------------------------- | --------------------- |
// | 🧱 Text (default) | `node dist/app/scripts/generateTree.js text`            | `project-tree.txt`    |
// | 📘 Markdown       | `node dist/app/scripts/generateTree.js markdown`        | `project-tree.md`     |
// | 🧮 JSON           | `node dist/app/scripts/generateTree.js json`            | `project-tree.json`   |
// | ✨ Custom Path     | `node dist/app/scripts/generateTree.js text --output ./docs/my-tree.txt`  | `./docs/my-tree.txt`  |
// | ✨ Custom Path     | `node dist/app/scripts/generateTree.js markdown --output ./docs/my-tree.md` | `./docs/my-tree.md`   |
// | ✨ Custom Path     | `node dist/app/scripts/generateTree.js json --output ./docs/my-tree.json` | `./docs/my-tree.json` |

// # 🔍 ANALYSIS MODE - Compiled JavaScript
// # Basic analysis (console output only)
// node dist/app/scripts/generateTree.js "task management system with real-time collaboration"

// # Analysis with file output
// node dist/app/scripts/generateTree.js "crypto trading dashboard" --output ./analysis/crypto-analysis.json

// # 🗺️ ROADMAP GENERATION - Compiled JavaScript (NEW!)
// | **Command**                                                   | **Files Generated**                                       |
// | ------------------------------------------------------------- | --------------------------------------------------------- |
// | `node dist/app/scripts/generateRoadmaps.js "project name"`    | `dev-roadmap.md`, `nontech-roadmap.md`, `frontend-packages.md`, `backend-packages.md` |
// | `node dist/app/scripts/generateRoadmaps.js "crypto dashboard" --output ./docs` | All 4 files in `./docs/` directory |
// | `node dist/app/scripts/generateRoadmaps.js "ecommerce app"`   | Complete roadmap with package setup guides                |

// # PNPM SCRIPTS (What you actually use)
// | **Script**        | **Command**                    | **Purpose**           |
// | ----------------- | ------------------------------ | --------------------- |
// | generate:tree     | `pnpm run generate:tree`       | Default tree gen      |
// | generate:tree:text| `pnpm run generate:tree:text`  | Text format           |
// | generate:tree:md  | `pnpm run generate:tree:markdown` | Markdown format     |
// | generate:tree:json| `pnpm run generate:tree:json`  | JSON format           |
// | generate:analysis | `pnpm run generate:analysis`   | Full analysis         |
// | generate:roadmaps | `pnpm run generate:roadmaps`   | NEW! Generate complete roadmaps with package recommendations |
// | generate:roadmaps:custom | `pnpm run generate:roadmaps -- "project name"` | Custom project roadmaps |

// # NEW ROADMAP GENERATION EXAMPLES
// # Generate complete project planning:
// pnpm run generate:roadmaps -- "crypto trading platform with real-time data"
// pnpm run generate:roadmaps -- "social media app with video uploads"
// pnpm run generate:roadmaps -- "ecommerce store with inventory management"

// # Output structure:
// 📁 roadmaps/ (or specified --output directory)
// ├── 🧩 dev-roadmap.md          (Technical implementation plan)
// ├── 📊 nontech-roadmap.md      (Product overview for stakeholders)
// ├── 🎨 frontend-packages.md    (Frontend dependencies & setup guide) - NEW!
// └── ⚙️ backend-packages.md     (Backend dependencies & setup guide) - NEW!
  
// #TODO – Automate Project Tree / File Changes on Git Push

// ❌ Remaining TODO Items
// | Category | Outstanding Task | Notes |
// |----------|------------------|-------|
// | UX Wizard | Build interactive scenario mode | In progress (design done) |
// | Exit UX | Add quit hook at startup | Implement code |
// | Docs Automation | Auto update tree on Git commit | Pending |
// | File Diffing | Track renamed/moved/deleted files | Pending |
// | Storage | Create project_docs/ folder | Standardize output |
// | Git Hook | pre-push or post-commit hook | TBD implementation |
// | Mode Decision | Full tree vs change log | We need config flag |
// | Format Sync | Ensure output consistency | Table + logs |
// | CI/CD | Optional pipeline automation | Later stage |

// ✅ Finalize interactive CLI user flow (we just outlined)
// 🛠 Implement quit handler + intro walk-through
// 📁 Create /project_docs convention folder
// 🔗 Add Git hook:
//   Minimal version = local pre-push script
//   Full version = CI bot commit
// 🌲 Add incremental change detection
// 🧪 QA test on real repo
// 📦 Add docs & README section