// generateTree.js - Complete Enhanced Version (ESM)

import fs from 'fs';
import path from 'path';

// === PROJECT TREE ANALYZER CLASS ===
export class ProjectTreeAnalyzer {
  constructor(rootPath = '.') {
    this.rootPath = rootPath;
    this.fileCache = new Map();
    this.interfaceRegistry = new Map();
    this.componentRegistry = new Map();
    this.apiRegistry = new Map();
  }

  async analyzeProjectTree() {
    console.log('🔍 Analyzing project structure...');
    await this.traverseDirectory(this.rootPath);
    return {
      interfaces: Array.from(this.interfaceRegistry.entries()),
      components: Array.from(this.componentRegistry.entries()),
      apis: Array.from(this.apiRegistry.entries()),
      totalFiles: this.fileCache.size,
    };
  }

  async traverseDirectory(dirPath, depth = 0) {
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
      console.warn(`⚠️ Could not read directory: ${dirPath}`, error.message);
    }
  }

  async analyzeFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.ts', '.tsx', '.js', '.jsx', '.json'].includes(ext)) return;

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.fileCache.set(filePath, content);

      if (filePath.includes('interface') || filePath.includes('types')) this.extractInterfaces(filePath, content);
      if (filePath.includes('components') || filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) this.extractComponents(filePath, content);
      if (filePath.includes('api') || filePath.includes('services')) this.extractApis(filePath, content);

    } catch (error) {
      console.warn(`⚠️ Could not read file: ${filePath}`, error.message);
    }
  }

  extractInterfaces(filePath, content) {
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

  extractComponents(filePath, content) {
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

  extractApis(filePath, content) {
    const apiMethodRegex = /(?:async\s+)?(\w+)\s*\(\s*([^)]*)\s*\)\s*:\s*Promise<([^>]+)>/g;
    const classMethodRegex = /(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\(\s*([^)]*)\s*\)\s*:\s*([^{]+){/g;
    let match;
    const methods = [];

    while ((match = apiMethodRegex.exec(content)) !== null) {
      const [, methodName, params, returnType] = match;
      methods.push({ name: methodName, params: params.trim(), returnType: returnType.trim(), type: 'api' });
    }

    while ((match = classMethodRegex.exec(content)) !== null) {
      const [, methodName, params, returnType] = match;
      methods.push({ name: methodName, params: params.trim(), returnType: returnType.trim(), type: 'service' });
    }

    if (methods.length > 0) this.apiRegistry.set(filePath, { file: filePath, methods, exports: this.extractExports(content) });
  }

  extractProperties(body) {
    const propRegex = /(\w+)(\?)?\s*:\s*([^;\n]+)/g;
    const properties = [];
    let match;

    while ((match = propRegex.exec(body)) !== null) {
      const [, name, optional, type] = match;
      properties.push({ name: name.trim(), type: type.trim(), optional: !!optional });
    }

    return properties;
  }

  extractExports(content) {
    const exportRegex = /export\s+(?:const|function|class|interface|type)\s+(\w+)/g;
    const exports = [];
    let match;
    while ((match = exportRegex.exec(content)) !== null) exports.push(match[1]);
    return exports;
  }

  findRelevantFiles(userPrompt) {
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

  extractKeywords(prompt) {
    const techKeywords = ['component', 'interface', 'props', 'state', 'hook', 'api', 'service', 'model', 'type', 'enum', 'function', 'class'];
    const words = prompt.toLowerCase().split(/\s+/).filter(w => w.length > 3).concat(techKeywords);
    return [...new Set(words)];
  }

  calculateRelevance(content, keywords) {
    const contentLower = content.toLowerCase();
    let score = 0;
    keywords.forEach(keyword => {
      const matches = contentLower.match(new RegExp(`\\b${keyword}\\b`, 'gi'));
      if (matches) score += matches.length;
    });
    return score;
  }

  async generateReport(userPrompt) {
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


  suggestComponents(userPrompt) {
    const suggestions = [];
    const keywords = this.extractKeywords(userPrompt);
    for (const [name, component] of this.componentRegistry) {
      if (keywords.some(k => name.toLowerCase().includes(k.toLowerCase()))) suggestions.push(component);
    }
    return suggestions;
  }

  suggestInterfaces(userPrompt) {
    const suggestions = [];
    const keywords = this.extractKeywords(userPrompt);
    for (const [name, interfaceInfo] of this.interfaceRegistry) {
      if (keywords.some(k => name.toLowerCase().includes(k.toLowerCase()))) suggestions.push(interfaceInfo);
    }
    return suggestions;
  }

  suggestApis(userPrompt) {
    const suggestions = [];
    const keywords = this.extractKeywords(userPrompt);
    for (const [filePath, apiInfo] of this.apiRegistry) {
      const relevantMethods = apiInfo.methods.filter(method => keywords.some(k =>
        method.name.toLowerCase().includes(k.toLowerCase()) ||
        method.returnType.toLowerCase().includes(k.toLowerCase())
      ));
      if (relevantMethods.length > 0) suggestions.push({ file: filePath, methods: relevantMethods, exports: apiInfo.exports });
    }
    return suggestions;
  }
}

// === ORIGINAL TREE GENERATION ===
async function generateProjectTree(dirPath = '.', prefix = '', depth = 0, maxDepth = 5) {
  if (depth > maxDepth) return '';
  const items = fs.readdirSync(dirPath).filter(item => !item.startsWith('.') && item !== 'node_modules' && item !== 'dist');
  let tree = '';
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    const connector = i === items.length - 1 ? '└── ' : '├── ';
    const newPrefix = prefix + (i === items.length - 1 ? '    ' : '│   ');
    tree += prefix + connector + item + '\n';
    if (stat.isDirectory()) tree += await generateProjectTree(fullPath, newPrefix, depth + 1, maxDepth);
  }
  return tree;
}

function generateTextTree(tree) {
  return `Project Tree\nGenerated: ${new Date().toISOString()}\n\n${tree}`;
}

function generateMarkdownTree(tree) {
  return `# Project Tree\n\n**Generated**: ${new Date().toISOString()}\n\n\`\`\`\n${tree}\n\`\`\``;
}

// --- mappers.ts config ---
const mappersFile = path.resolve(__dirname, '../src/app/server/repository/mappers.ts');

async function updateMappers(relevantNames: string[]) {
  const analyzer = new ProjectTreeAnalyzer(path.resolve(__dirname, '../src'));
  await analyzer.analyzeProjectTree();

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
async function generateTreeOutput(args) {
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
      content = JSON.stringify({ generated: new Date().toISOString(), tree }, null, 2);
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
async function generateAnalysisReport(args) {
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
function displayReport(report) {
  console.log('='.repeat(80));
  console.log('📊 PROJECT ANALYSIS REPORT');
  console.log('='.repeat(80));
  console.log(`\n📝 User Prompt: ${report.userPrompt || 'No specific prompt provided'}`);
  console.log(`🕒 Analysis Time: ${report.timestamp}`);
  console.log(`📁 Total Files Analyzed: ${report.projectStructure.totalFiles}\n`);

  if (report.relevantFiles.length > 0) {
    console.log('🎯 RELEVANT FILES:');
    console.log('-'.repeat(40));
    report.relevantFiles.forEach(([filePath, info], index) => {
      console.log(`${index + 1}. ${filePath}`);
      console.log(`   Relevance Score: ${info.relevanceScore}`);
      console.log(`   Matched Keywords: ${info.matchedKeywords.join(', ')}`);
      console.log('');
    });
  }

  if (report.suggestedComponents.length > 0) {
    console.log('⚛️  SUGGESTED COMPONENTS:');
    console.log('-'.repeat(40));
    report.suggestedComponents.forEach((component, index) => {
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
    report.suggestedInterfaces.forEach((interfaceInfo, index) => {
      console.log(`${index + 1}. ${interfaceInfo.name} (${interfaceInfo.type})`);
      console.log(`   File: ${interfaceInfo.file}`);
      if (interfaceInfo.properties) {
        console.log('   Properties:');
        interfaceInfo.properties.forEach(prop => {
          console.log(`     - ${prop.name}${prop.optional ? '?' : ''}: ${prop.type}`);
        });
      }
      console.log('');
    });
  }

  if (report.suggestedApis.length > 0) {
    console.log('🔌 SUGGESTED APIs/SERVICES:');
    console.log('-'.repeat(40));
    report.suggestedApis.forEach((api, index) => {
      console.log(`${index + 1}. ${api.file}`);
      console.log('   Methods:');
      api.methods.forEach(method => {
        console.log(`     - ${method.name}(${method.params}): ${method.returnType}`);
      });
      console.log('');
    });
  }

  console.log('💡 POTENTIAL INTEGRATIONS:');
  console.log('-'.repeat(40));
  suggestPotentialIntegrations(report);
}

function suggestPotentialIntegrations(report) {
  const { userPrompt, projectStructure } = report;
  const integrations = [];

  if (userPrompt?.toLowerCase().includes('crypto') || userPrompt?.toLowerCase().includes('nft')) {
    const cryptoFiles = Array.from(projectStructure.apis).filter(([file]) => file.toLowerCase().includes('crypto'));
    if (cryptoFiles.length > 0) integrations.push('💰 Crypto/NFT Integration: Available crypto services detected');
  }

  if (userPrompt?.toLowerCase().includes('real-time') || userPrompt?.toLowerCase().includes('live')) {
    const realtimeFiles = Array.from(projectStructure.apis).filter(([file]) => file.toLowerCase().includes('realtime'));
    if (realtimeFiles.length > 0) integrations.push('⚡ Real-time Features: WebSocket and real-time APIs available');
  }

  if (userPrompt?.toLowerCase().includes('collaboration') || userPrompt?.toLowerCase().includes('team')) {
    const collaborationFiles = Array.from(projectStructure.components).filter(([name]) => name.toLowerCase().includes('collaboration'));
    if (collaborationFiles.length > 0) integrations.push('👥 Collaboration Tools: Team and collaboration components available');
  }

  if (userPrompt?.toLowerCase().includes('ai') || userPrompt?.toLowerCase().includes('machine learning')) {
    const aiFiles = Array.from(projectStructure.apis).filter(([file]) => file.toLowerCase().includes('ai') || file.toLowerCase().includes('intelligence'));
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


// #NOTE
// | **Output Type**   | **Command**                                              | **File Generated**    |
// | ----------------- | -------------------------------------------------------- | --------------------- |
// | 🧱 Text (default) | `node generateTree.js text`                               | `project-tree.txt`    |
// | 📘 Markdown       | `node generateTree.js markdown`                           | `project-tree.md`     |
// | 🧮 JSON           | `node generateTree.js json`                               | `project-tree.json`   |
// | ✨ Custom Path     | `node generateTree.js text --output ./docs/my-tree.txt`    | `./docs/my-tree.txt`  |
// | ✨ Custom Path     | `node generateTree.js markdown --output ./docs/my-tree.md` | `./docs/my-tree.md`   |
// | ✨ Custom Path     | `node generateTree.js json --output ./docs/my-tree.json`   | `./docs/my-tree.json` |


// # 🔍 ANALYSIS MODE - New!
// # Basic analysis (console output only)
// node generateTree.js "task management system with real-time collaboration"

// # Analysis with file output
// node generateTree.js "crypto trading dashboard" --output ./analysis/crypto-analysis.json

// # Analysis with custom path
// node generateTree.js "content management system" --output ./docs/feature-analysis.json

// # 🎯 EXISTING TREE GENERATION - Unchanged!
// node generateTree.js text
// node generateTree.js markdown --output ./docs/structure.md
// node generateTree.js json --output ./docs/tree.json

// #TODO – Automate Project Tree / File Changes on Git Push


// ❌ Remaining TODO Items
// Category	Outstanding Task	Notes
// UX Wizard	Build interactive scenario mode	In progress (design done)
// Exit UX	Add quit hook at startup	Implement code
// Docs Automation	Auto update tree on Git commit	Pending
// File Diffing	Track renamed/moved/deleted files	Pending
// Storage	Create project_docs/ folder	Standardize output
// Git Hook	pre-push or post-commit hook	TBD implementation
// Mode Decision	Full tree vs change log	We need config flag
// Format Sync	Ensure output consistency	Table + logs
// CI/CD	Optional pipeline automation	Later stage
// Suggested next steps (order)

// ✅ Finalize interactive CLI user flow (we just outlined)

// 🛠 Implement quit handler + intro walk-through

// 📁 Create /project_docs convention folder

// 🔗 Add Git hook:

// Minimal version = local pre-push script

// Full version = CI bot commit

// 🌲 Add incremental change detection

// 🧪 QA test on real repo

// 📦 Add docs & README section