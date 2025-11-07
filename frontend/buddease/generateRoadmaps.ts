// generateRoadmaps.ts
import fs from 'fs';
import path from 'path';
import { ProjectTreeAnalyzer } from '@/app/scripts/generateTree'; // Import the analyzer


interface ProjectStructure {
  interfaces: [string, { 
    type: string; 
    file: string; 
    properties?: { name: string; type: string; optional?: boolean }[]; 
    definition?: string;
  }][];
  components: [string, { 
    file: string; 
    propsType?: string; 
    exports: string[];
  }][];
  apis: [string, { 
    methods: { name: string; params: string; returnType: string }[];
    exports: string[];
  }][];
}


/**
 * Generate two roadmap reports:
 * 1. Developer-focused: includes code snippets, interfaces, methods
 * 2. Non-technical: high-level feature summary, metrics
 */

export async function generateRoadmaps(
  userPrompt: string,
  outputDir: string = './roadmaps'
): Promise<{ devFile: string; nonTechFile: string }> {
  const analyzer = new ProjectTreeAnalyzer();
  const projectStructure = await analyzer.analyzeProjectTree(); // async fetch

  const devRoadmap = generateDevRoadmap(userPrompt, projectStructure);
  const nonTechRoadmap = generateNonTechRoadmap(userPrompt, projectStructure);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const devFile = path.join(outputDir, 'dev-roadmap.md');
  const nonTechFile = path.join(outputDir, 'nontech-roadmap.md');

  fs.writeFileSync(devFile, devRoadmap, 'utf8');
  fs.writeFileSync(nonTechFile, nonTechRoadmap, 'utf8');

  console.log(`✅ Developer roadmap saved: ${devFile}`);
  console.log(`✅ Non-technical roadmap saved: ${nonTechFile}`);

  return { devFile, nonTechFile };
}

/**
 * Developer-focused roadmap
 * Includes interfaces, methods, suggested components and features
 */


function generateDevRoadmap(prompt: string, projectStructure: ProjectStructure): string {
  const { interfaces, components, apis } = projectStructure;

  const lines: string[] = [];
  lines.push(`# Development Roadmap`);
  lines.push(`📋 User Prompt: ${prompt}`);
  lines.push(`🕒 Generated: ${new Date().toISOString()}`);

  // --- Interfaces ---
  lines.push('\n## Interfaces');
  interfaces.forEach(([name, iface], i) => {
    lines.push(`\n### ${i + 1}. ${name} (${iface.type})`);
    lines.push(`**Defined in:** ${iface.file}`);
    if (iface.properties) {
      lines.push('**Properties:**');
      iface.properties.forEach(prop => {
        lines.push(`- ${prop.name}${prop.optional ? '?' : ''}: ${prop.type}`);
      });
    } else if (iface.definition) {
      lines.push(`**Definition:** \`${iface.definition}\``);
    }
  });

  // --- Components ---
  lines.push('\n## Components');
  components.forEach(([name, comp], i) => {
    lines.push(`\n### ${i + 1}. ${name}`);
    lines.push(`**Defined in:** ${comp.file}`);
    lines.push(`**Props Type:** ${comp.propsType}`);
    lines.push(`**Exports:** ${comp.exports.join(', ')}`);
  });

  // --- APIs / Services ---
  lines.push('\n## APIs / Services');
  apis.forEach(([file, api], i) => {
    lines.push(`\n### ${i + 1}. ${file}`);
    api.methods.forEach(method => {
      lines.push(`- ${method.name}(${method.params}): ${method.returnType}`);
    });
    lines.push(`**Exports:** ${api.exports.join(', ')}`);
  });

  // --- Suggested Phases ---
  lines.push('\n## Suggested Phases');
  lines.push('### Phase 1: MVP');
  lines.push('- Core interfaces & components');
  lines.push('- Basic API/service integration');
  lines.push('\n### Phase 2: Advanced Features');
  lines.push('- Smart reminders / task dependencies');
  lines.push('- Crypto integrations (if applicable)');
  lines.push('\n### Phase 3: AI / Automation');
  lines.push('- Intelligent suggestions');
  lines.push('- Auto-escalation / analytics');

  return lines.join('\n');
}


/**
 * Non-technical roadmap
 * High-level summary of features, counts, and suggested priorities
 */
/**
 * Non-technical roadmap
 * High-level summary of features, counts, and suggested priorities
 */

function generateNonTechRoadmap(prompt: string, projectStructure: ProjectStructure): string {
  const { interfaces, components, apis } = projectStructure;

  const lines: string[] = [];
  lines.push(`# Product Roadmap`);
  lines.push(`📋 User Prompt: ${prompt}`);
  lines.push(`🕒 Generated: ${new Date().toISOString()}`);

  // --- Summary ---
  lines.push(`\n## Summary`);
  lines.push(`- Total Interfaces: ${interfaces.length}`);
  lines.push(`- Total Components: ${components.length}`);
  lines.push(`- Total API / Service Files: ${apis.length}`);

  // --- Key Features ---
  lines.push('\n## Key Features by Category');

  lines.push('\n### Interfaces / Data Structures');
  interfaces.forEach(([name, iface]: [string, { type: string }], i: number) => {
    lines.push(`- ${name} (${iface.type})`);
  });

  lines.push('\n### Components / UI Elements');
  components.forEach(([name]: [string, { file: string }]) => {
    lines.push(`- ${name}`);
  });

  lines.push('\n### APIs / Services');
  apis.forEach(([file, api]: [string, { methods: { name: string }[] }]) => {
    const methodList = api.methods.map((m: { name: string }) => m.name).join(', ');
    lines.push(`- ${file}: ${methodList}`);
  });

  // --- Priorities ---
  lines.push('\n## Suggested Implementation Priorities');
  lines.push('1. Core data structures & interfaces');
  lines.push('2. Primary UI components & workflows');
  lines.push('3. Essential APIs & backend services');
  lines.push('4. Advanced features (analytics, smart suggestions, crypto)');
  lines.push('5. AI / automation & optimization');

  // --- Breakdown ---
  lines.push('\n## Feature Breakdown for Review');
  lines.push(`- Interfaces: ${interfaces.length}`);
  lines.push(`- Components: ${components.length}`);
  lines.push(`- API / Services: ${apis.length}`);

  return lines.join('\n');
}

// Example CLI usage
if (process.argv[1]?.endsWith('generateRoadmaps.ts')) {
  const args: string[] = process.argv.slice(2);
  const prompt: string = args[0] || 'Project roadmap';
  const outputIndex: number = args.indexOf('--output');
  const outputDir: string = outputIndex !== -1 ? args[outputIndex + 1] : './roadmaps';

  generateRoadmaps(prompt, outputDir).catch(console.error);
}
/**
 * # NOTE
 * | **Output Type**          | **Command**                                                              | **File Generated**           |
 * | ------------------------ | ------------------------------------------------------------------------ | ---------------------------- |
 * | 🧱 Text / Markdown       | `npx ts-node generateRoadmaps.ts "crypto dashboard"`                     | `./roadmaps/dev-roadmap.md` |
 * | 🧱 Text / Markdown       | `npx ts-node generateRoadmaps.ts "crypto dashboard" --output ./docs`     | `./docs/dev-roadmap.md`     |
 * | 🧱 Non-technical version | Same commands, also generates `nontech-roadmap.md` alongside `dev-roadmap.md` |
 *
 * When compiled:
 * | **Run After Build**      | **Command**                                                   | **File Generated**           |
 * | ------------------------ | ------------------------------------------------------------- | ---------------------------- |
 * | 🧱 Text / Markdown       | `node dist/generateRoadmaps.js "crypto dashboard"`            | `./roadmaps/dev-roadmap.md` |
 * | 🧱 Text / Markdown       | `node dist/generateRoadmaps.js "crypto dashboard" --output ./docs` | `./docs/dev-roadmap.md`     |
 */


// 3️⃣ CLI entry point
// This ensures the file can be executed from the terminal
if (process.argv[1]?.includes('generateRoadmaps')) {
  const args: string[] = process.argv.slice(2);
  const prompt: string = args[0] || 'Project roadmap';
  const outputIndex: number = args.indexOf('--output');
  const outputDir: string = outputIndex !== -1 ? args[outputIndex + 1] : './roadmaps';

  generateRoadmaps(prompt, outputDir).catch(console.error);
}
