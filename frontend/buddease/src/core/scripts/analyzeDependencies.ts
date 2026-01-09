analyzeDependencies.ts
scripts/analyzeDependencies.ts
import fs from 'fs';
import path from 'path';

interface DependencyGraph {
  extends: Map<string, string[]>;
  implements: Map<string, string[]>;
  circularDependencies: string[];
  inheritanceChains: string[][];
}

export class TypeScriptDependencyAnalyzer {
  async analyzeDependencies(srcDir: string = './src'): Promise<DependencyGraph> {
    console.log('🔗 Analyzing dependencies and inheritance...');
    
    const files = this.getTypeScriptFiles(srcDir);
    const extendsMap = new Map<string, string[]>();
    const implementsMap = new Map<string, string[]>();

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        this.analyzeDependenciesInFile(content, file, extendsMap, implementsMap);
      } catch (error) {
        console.warn(`⚠️ Could not read file: ${file}`);
      }
    }
    

    const circularDependencies = this.findCircularDependencies(extendsMap);
    const inheritanceChains = this.findLongInheritanceChains(extendsMap);

    return {
      extends: extendsMap,
      implements: implementsMap,
      circularDependencies,
      inheritanceChains
    };
  }

  private getTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];

    const readDirectory = (currentDir: string) => {
      try {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            // Skip node_modules and other common directories to avoid
            if (!['node_modules', 'dist', 'build', '.git'].includes(item)) {
              readDirectory(fullPath);
            }
          } else if (stat.isFile() && this.isTypeScriptFile(item)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not read directory: ${currentDir}`);
      }
    };

    readDirectory(dir);
    return files;
  }

  private isTypeScriptFile(filename: string): boolean {
    const tsExtensions = ['.ts', '.tsx'];
    const ext = path.extname(filename).toLowerCase();
    return tsExtensions.includes(ext);
  }

  private analyzeDependenciesInFile(
    content: string, 
    filePath: string, 
    extendsMap: Map<string, string[]>,
    implementsMap: Map<string, string[]>
  ): void {
    // Match class/interface extends
    const extendsRegex = /(?:class|interface)\s+(\w+)\s+extends\s+(\w+)/g;
    let match;
    while ((match = extendsRegex.exec(content)) !== null) {
      const [_, child, parent] = match;
      if (!extendsMap.has(child)) {
        extendsMap.set(child, []);
      }
      extendsMap.get(child)!.push(parent);
    }

    // Match class implements
    const implementsRegex = /class\s+(\w+)\s+implements\s+([^{]+){/g;
    while ((match = implementsRegex.exec(content)) !== null) {
      const [_, className, interfaces] = match;
      const interfaceList = interfaces.split(',').map(i => i.trim());
      
      if (!implementsMap.has(className)) {
        implementsMap.set(className, []);
      }
      implementsMap.get(className)!.push(...interfaceList);
    }
  }

  private findCircularDependencies(extendsMap: Map<string, string[]>): string[] {
    const circular: string[] = [];
    
    for (const [child, parents] of extendsMap.entries()) {
      for (const parent of parents) {
        if (this.hasCircularDependency(child, parent, extendsMap, new Set())) {
          circular.push(`${child} -> ${parent}`);
        }
      }
    }
    
    return circular;
  }

  private hasCircularDependency(
    current: string, 
    target: string, 
    extendsMap: Map<string, string[]>,
    visited: Set<string>
  ): boolean {
    if (current === target) return true;
    if (visited.has(current)) return false;
    
    visited.add(current);
    const parents = extendsMap.get(current) || [];
    
    for (const parent of parents) {
      if (this.hasCircularDependency(parent, target, extendsMap, visited)) {
        return true;
      }
    }
    
    return false;
  }

  private findLongInheritanceChains(extendsMap: Map<string, string[]>): string[][] {
    const chains: string[][] = [];
    
    for (const [child] of extendsMap.entries()) {
      const chain = this.getInheritanceChain(child, extendsMap);
      if (chain.length > 3) { // Chains longer than 3 might be problematic
        chains.push(chain);
      }
    }
    
    return chains;
  }

  private getInheritanceChain(
    start: string, 
    extendsMap: Map<string, string[]>,
    chain: string[] = []
  ): string[] {
    if (chain.includes(start)) return chain; // Prevent infinite loops
    
    chain.push(start);
    const parents = extendsMap.get(start) || [];
    
    for (const parent of parents) {
      return this.getInheritanceChain(parent, extendsMap, chain);
    }
    
    return chain;
  }

  generateDependencyReport(graph: DependencyGraph): string {
    const { extends: extendsMap, implements: implementsMap, circularDependencies, inheritanceChains } = graph;
    
    let output = `# TypeScript Dependency Analysis Report\n`;
    output += `**Generated**: ${new Date().toISOString()}\n\n`;

    // Extends relationships
    if (extendsMap.size > 0) {
      output += `## Inheritance (extends)\n`;
      for (const [child, parents] of extendsMap.entries()) {
        output += `- **${child}** extends: ${parents.join(', ')}\n`;
      }
      output += '\n';
    }

    // Implements relationships
    if (implementsMap.size > 0) {
      output += `## Implementation (implements)\n`;
      for (const [className, interfaces] of implementsMap.entries()) {
        output += `- **${className}** implements: ${interfaces.join(', ')}\n`;
      }
      output += '\n';
    }

    // Circular dependencies
    if (circularDependencies.length > 0) {
      output += `## ⚠️ Circular Dependencies Found\n`;
      circularDependencies.forEach(circular => {
        output += `- ${circular}\n`;
      });
      output += '\n';
    } else {
      output += `## ✅ No circular dependencies found\n\n`;
    }

    // Long inheritance chains
    if (inheritanceChains.length > 0) {
      output += `## 📏 Long Inheritance Chains (consider composition)\n`;
      inheritanceChains.forEach(chain => {
        output += `- ${chain.join(' -> ')}\n`;
      });
    }

    return output;
  }
}

// Run dependency analysis
async function analyzeDependencies() {
  const analyzer = new TypeScriptDependencyAnalyzer();
  const graph = await analyzer.analyzeDependencies();
  
  const report = analyzer.generateDependencyReport(graph);
  console.log(report);
  
  fs.writeFileSync('./dependency-analysis-report.md', report);
  console.log('📄 Dependency report saved to: dependency-analysis-report.md');
}