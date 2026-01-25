// generateRoadmaps.ts
import type { DomainStructure } from '@/core/config/appStructure/DomainStructure';
import type { ApiInfo, ComponentInfo, InterfaceInfo } from '@/core/generators/ApiCodeGenerator';
import PackageRecommendationGenerator from '@/core/generators/PackageRecommendationGenerator';
import type { PackageJson } from '@/core/scripts/generate-commands-doc';
import { ProjectTreeAnalyzer } from '@/core/scripts/generateTree';
import fs from 'fs';
import path from 'path';

interface ProjectStructure {
  name?: string;
  root?: string;
  interfaces: [string, InterfaceInfo][];
  components: [string, ComponentInfo][];
  apis: [string, ApiInfo][];
  totalFiles: number;
  files: string[];
  packageJson: PackageJson | null;

  // --- optional extras the scanner wants to write ---
  modules?: {
    name: string;
    path: string;
    type: string;
    dependencies: string[];
  }[];
  dependencies?: Record<string, any>;
  type?: string;
  version?: string;
}

/**
 * Generate two roadmap reports and package recommendations:
 * 1. Developer-focused: includes code snippets, interfaces, methods
 * 2. Non-technical: high-level feature summary, metrics
 * 3. Frontend packages: recommended dependencies for frontend
 * 4. Backend packages: recommended dependencies for backend
 */
export async function generateRoadmaps(
  userPrompt: string,
  outputDir: string = './roadmaps'
): Promise<{
  devFile: string;
  nonTechFile: string,  
  projectStructure: ProjectStructure;  
}> {
  const analyzer = new ProjectTreeAnalyzer();
  const projectStructure = await analyzer.analyzeProjectTree(); // async fetch

  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  let existingDependencies = new Set<string>();
  
  try {
    if (fs.existsSync(packageJsonPath)) {
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
      const packageJson: PackageJson = JSON.parse(packageJsonContent);
      
      existingDependencies = new Set([
        ...Object.keys(packageJson.dependencies || {}),
        ...Object.keys(packageJson.devDependencies || {})
      ]);
      
      console.log(`📦 Found ${existingDependencies.size} existing dependencies in package.json`);
    } else {
      console.log('⚠️ No package.json found, generating recommendations without existing dependencies');
    }
  } catch (error) {
    console.warn('⚠️ Could not read package.json, generating recommendations without existing dependencies:', error);
  }

  const devRoadmap = generateDevRoadmap(userPrompt, projectStructure);
  const nonTechRoadmap = generateNonTechRoadmap(userPrompt, projectStructure);
  
  // Generate package recommendations with existing dependencies
  const packageRecommendations = PackageRecommendationGenerator.generateFromProjectStructure(
    projectStructure, 
    existingDependencies
  );
  const frontendPackages = PackageRecommendationGenerator.generateFrontendPackageFile(packageRecommendations, existingDependencies);
  const backendPackages = PackageRecommendationGenerator.generateBackendPackageFile(packageRecommendations, existingDependencies);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const devFile = path.join(outputDir, 'dev-roadmap.md');
  const nonTechFile = path.join(outputDir, 'nontech-roadmap.md');
  const frontendPackagesFile = path.join(outputDir, 'frontend-packages.md');
  const backendPackagesFile = path.join(outputDir, 'backend-packages.md');

  fs.writeFileSync(devFile, devRoadmap, 'utf8');
  fs.writeFileSync(nonTechFile, nonTechRoadmap, 'utf8');
  fs.writeFileSync(frontendPackagesFile, frontendPackages, 'utf8');
  fs.writeFileSync(backendPackagesFile, backendPackages, 'utf8');

  console.log(`✅ Developer roadmap saved: ${devFile}`);
  console.log(`✅ Non-technical roadmap saved: ${nonTechFile}`);
  console.log(`✅ Frontend packages saved: ${frontendPackagesFile}`);
  console.log(`✅ Backend packages saved: ${backendPackagesFile}`);

  return { devFile, nonTechFile, projectStructure };
}

function categorizeProjectStructure(projectStructure: ProjectStructure): DomainStructure {
  const { interfaces, components, apis } = projectStructure;
  
  const domainStructure: DomainStructure = {
    frontend: { uiComponents: [], pages: [], hooks: [], frontendTypes: [], utils: [] },
    backend: { apiEndpoints: [], services: [], dataModels: [], types: [] },
    shared: { types: [], utils: [], constants: [] }
  };

  // Categorize components
  components.forEach(([name, comp]) => {
    const componentWithName = { ...comp, name };
    
    if (name.includes('Page') || name.includes('View') || comp.file.includes('/pages/')) {
      domainStructure.frontend.pages.push(componentWithName);
    } else if (name.includes('Hook') || name.includes('use') || comp.file.includes('/hooks/')) {
      domainStructure.frontend.hooks.push(componentWithName);
    } else if (comp.file.includes('/utils/') || comp.file.includes('/lib/')) {
      domainStructure.frontend.utils.push(componentWithName);
    } else {
      domainStructure.frontend.uiComponents.push(componentWithName);
    }
  });

  // Categorize interfaces
  interfaces.forEach(([name, iface]) => {
    if (name.match(/props|component|ui|form/i) || iface.file.includes('/components/')) {
      domainStructure.frontend.frontendTypes.push(iface);
    } else if (name.match(/api|request|response|dto|entity/i) || iface.file.includes('/api/')) {
      domainStructure.backend.dataModels.push(iface);
    } else if (iface.file.includes('/types/') || iface.file.includes('/interfaces/')) {
      domainStructure.shared.types.push(iface);
    } else {
      domainStructure.backend.types.push(iface);
    }
  });

  // Categorize APIs
  apis.forEach(([file, api]) => {
    if (file.includes('/api/') || file.includes('/routes/') || api.methods.some(m => 
      m.name.match(/get|post|put|delete|patch/i))) {
      domainStructure.backend.apiEndpoints.push(api);
    } else if (file.includes('/services/') || file.includes('/service/')) {
      domainStructure.backend.services.push(api);
    }
  });

  return domainStructure;
}

/**
 * Developer-focused roadmap
 * Includes interfaces, methods, suggested components and features
 */
function generateDevRoadmap(prompt: string, projectStructure: ProjectStructure): string {
  const domainStructure = categorizeProjectStructure(projectStructure);

  const lines: string[] = [];
  lines.push(`# Development Roadmap - Structured by Domain`);
  lines.push(`📋 User Prompt: ${prompt}`);
  lines.push(`🕒 Generated: ${new Date().toISOString()}`);

  // --- FRONTEND SECTION ---
  lines.push('\n## 🎨 Frontend Development');

  lines.push('\n### Pages & Views');
  domainStructure.frontend.pages.forEach((page, i) => {
    lines.push(`\n#### ${i + 1}. ${page.name}`);
    lines.push(`**Defined in:** ${page.file}`);
    lines.push(`**Props Type:** ${page.propsType ?? 'Not specified'}`);
    lines.push(`**Exports:** ${page.exports?.join(', ') ?? 'None'}`);
  });

  lines.push('\n### UI Components');
  domainStructure.frontend.uiComponents.forEach((comp, i) => {
    lines.push(`\n#### ${i + 1}. ${comp.name}`);
    lines.push(`**Defined in:** ${comp.file}`);
    lines.push(`**Props Type:** ${comp.propsType ?? 'Not specified'}`);
    lines.push(`**Exports:** ${comp.exports?.join(', ') ?? 'None'}`);
  });

  lines.push('\n### Custom Hooks');
  domainStructure.frontend.hooks.forEach((hook, i) => {
    lines.push(`\n#### ${i + 1}. ${hook.name}`);
    lines.push(`**Defined in:** ${hook.file}`);
    lines.push(`**Props Type:** ${hook.propsType ?? 'Not specified'}`);
    lines.push(`**Exports:** ${hook.exports?.join(', ') ?? 'None'}`);
  });

  // --- BACKEND SECTION ---
  lines.push('\n## 🔧 Backend Development');

  lines.push('\n### API Endpoints');
  domainStructure.backend.apiEndpoints.forEach((api, i) => {
    lines.push(`\n#### ${i + 1}. ${api.file}`);
    api.methods.forEach(method => {
      const asyncIndicator = method.isAsync ? 'async ' : '';
      lines.push(`- ${asyncIndicator}${method.name}(${method.parameters.join(', ')}): ${method.returnType}`);
    });
    lines.push(`**Exports:** ${api.exports?.join(', ') ?? 'None'}`);
  });

  lines.push('\n### Services & Business Logic');
  domainStructure.backend.services.forEach((service, i) => {
    lines.push(`\n#### ${i + 1}. ${service.file}`);
    service.methods.forEach(method => {
      const asyncIndicator = method.isAsync ? 'async ' : '';
      lines.push(`- ${asyncIndicator}${method.name}(${method.parameters.join(', ')}): ${method.returnType}`);
    });
    lines.push(`**Exports:** ${service.exports?.join(', ') ?? 'None'}`);
  });

  // --- SHARED SECTION ---
  lines.push('\n## 🔄 Shared Resources');
  
  lines.push('\n### Common Types & Interfaces');
  domainStructure.shared.types.forEach((type, i) => {
    lines.push(`\n#### ${i + 1}. ${type.name} (${type.type})`);
    lines.push(`**Defined in:** ${type.file}`);
    if (type.properties) {
      lines.push('**Properties:**');
      type.properties.forEach(prop => {
        lines.push(`- ${prop.name}${prop.optional ? '?' : ''}: ${prop.type}`);
      });
    } else if (type.definition) {
      lines.push(`**Definition:** \`${type.definition}\``);
    }
  });

  // --- ENHANCED PHASES ---
  lines.push('\n## 🚀 Implementation Phases');
  
  lines.push('\n### Phase 1: Foundation');
  lines.push('- Core data models & shared types');
  lines.push('- Essential API endpoints');
  lines.push('- Basic page structure');
  
  lines.push('\n### Phase 2: Frontend Development');
  lines.push('- Complete UI components');
  lines.push('- Page implementations');
  lines.push('- State management & hooks');
  
  lines.push('\n### Phase 3: Backend Services');
  lines.push('- Business logic services');
  lines.push('- Advanced API features');
  lines.push('- Data validation & error handling');
  
  lines.push('\n### Phase 4: Integration & Polish');
  lines.push('- Frontend-backend integration');
  lines.push('- Performance optimization');
  lines.push('- Advanced features (AI, analytics)');

  return lines.join('\n');
}

/**
 * Non-technical roadmap
 * High-level summary of features, counts, and suggested priorities
 */
function generateNonTechRoadmap(prompt: string, projectStructure: ProjectStructure): string {
  const domainStructure = categorizeProjectStructure(projectStructure);

  const lines: string[] = [];
  lines.push(`# Product Roadmap - Feature Overview`);
  lines.push(`📋 User Prompt: ${prompt}`);
  lines.push(`🕒 Generated: ${new Date().toISOString()}`);

  // --- EXECUTIVE SUMMARY ---
  lines.push(`\n## 📊 Executive Summary`);
  lines.push(`- **User Interfaces**: ${domainStructure.frontend.pages.length} pages, ${domainStructure.frontend.uiComponents.length} components`);
  lines.push(`- **Backend Services**: ${domainStructure.backend.apiEndpoints.length} API endpoints, ${domainStructure.backend.services.length} services`);
  lines.push(`- **Data Structures**: ${domainStructure.backend.dataModels.length + domainStructure.shared.types.length} models`);
  lines.push(`- **Interactive Features**: ${domainStructure.frontend.hooks.length} custom hooks`);

  // --- USER-FACING FEATURES ---
  lines.push('\n## 🖥️ User-Facing Features');
  
  lines.push('\n### Pages & Screens');
  domainStructure.frontend.pages.forEach((page) => {
    lines.push(`- ${page.name}`);
  });
  
  lines.push('\n### Interactive Components');
  domainStructure.frontend.uiComponents.forEach((comp) => {
    lines.push(`- ${comp.name}`);
  });

  // --- BACKEND CAPABILITIES ---
  lines.push('\n## ⚙️ System Capabilities');
  
  lines.push('\n### APIs & Integrations');
  domainStructure.backend.apiEndpoints.forEach((api) => {
    lines.push(`- ${api.file.replace(/.*\//, '')}: ${api.methods.length} operations`);
  });
  
  lines.push('\n### Business Logic');
  domainStructure.backend.services.forEach((service) => {
    lines.push(`- ${service.file.replace(/.*\//, '')}: ${service.methods.length} functions`);
  });

  // --- DATA STRUCTURES ---
  lines.push('\n## 🗄️ Data Models');
  
  lines.push('\n### Core Data Models');
  domainStructure.backend.dataModels.forEach((model) => {
    lines.push(`- ${model.name}`);
  });
  
  lines.push('\n### Shared Types');
  domainStructure.shared.types.forEach((type) => {
    lines.push(`- ${type.name}`);
  });

  // --- IMPLEMENTATION TIMELINE ---
  lines.push('\n## 📅 Implementation Timeline');
  
  lines.push('\n### Sprint 1-2: Core Foundation');
  lines.push('- Essential data structures');
  lines.push('- Basic user interface');
  lines.push('- Core API endpoints');
  
  lines.push('\n### Sprint 3-4: Feature Development');
  lines.push('- Complete user workflows');
  lines.push('- Advanced components');
  lines.push('- Service integrations');
  
  lines.push('\n### Sprint 5-6: Enhancement & Scale');
  lines.push('- Performance optimization');
  lines.push('- Advanced features');
  lines.push('- Analytics & monitoring');

  // --- PRIORITIES ---
  lines.push('\n## 🎯 Implementation Priorities');
  lines.push('1. Core data structures & API contracts');
  lines.push('2. Primary user interfaces & workflows');
  lines.push('3. Essential backend services & business logic');
  lines.push('4. System integration & data flow');
  lines.push('5. Advanced features & optimizations');

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

// 3️⃣ CLI entry point
// This ensures the file can be executed from the terminal
if (process.argv[1]?.includes('generateRoadmaps')) {
  const args: string[] = process.argv.slice(2);
  const prompt: string = args[0] || 'Project roadmap';
  const outputIndex: number = args.indexOf('--output');
  const outputDir: string = outputIndex !== -1 ? args[outputIndex + 1] : './roadmaps';

  generateRoadmaps(prompt, outputDir).catch(console.error);
}

export type { ProjectStructure };
