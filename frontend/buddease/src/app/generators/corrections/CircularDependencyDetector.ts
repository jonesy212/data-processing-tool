// CircularDependencyDetector.ts
import fs from 'fs';
import path from 'path';
import { ProjectStructure } from '@/app/scripts/generateRoadmaps'
import ApiMethod, { InterfaceInfo } from '@/app/generators/ApiCodeGenerator'


interface DependencyNode {
  name: string;
  file: string;
  dependencies: string[];
  type: 'interface' | 'type' | 'class' | 'component' | 'function';
}

interface CircularDependency {
  cycle: string[];
  files: string[];
  severity: 'high' | 'medium' | 'low';
  description: string;
}

export class CircularDependencyDetector {
  private dependencyGraph: Map<string, DependencyNode> = new Map();
  private visited: Set<string> = new Set();
  private recursionStack: Set<string> = new Set();
  private circularDependencies: CircularDependency[] = [];

  async detectCircularDependencies(projectStructure: ProjectStructure): Promise<string[]> {
    console.log('🔄 Detecting circular dependencies...');
    
    // Build dependency graph from project structure
    this.buildDependencyGraph(projectStructure);
    
    // Detect circular dependencies
    this.findCircularDependencies();
    
    // Return simple list of types involved in circular dependencies
    return this.circularDependencies.flatMap(circular => circular.cycle);
  }

  private buildDependencyGraph(projectStructure: ProjectStructure): void {
    const { interfaces, components, apis } = projectStructure;

    // Process interfaces and types
    interfaces.forEach(([name, iface]) => {
      const dependencies = this.extractDependenciesFromInterface(iface);
      this.dependencyGraph.set(name, {
        name,
        file: iface.file,
        dependencies,
        type: iface.type === 'type' ? 'type' : 'interface'
      });
    });

    // Process components
    components.forEach(([name, component]) => {
      const dependencies = [component.propsType].filter(Boolean) as string[];
      this.dependencyGraph.set(name, {
        name,
        file: component.file,
        dependencies,
        type: 'component'
      });
    });

    // Process APIs/services
    apis.forEach(([file, api]) => {
      api.methods.forEach(method => {
        const dependencies = this.extractDependenciesFromMethod(method);
        this.dependencyGraph.set(method.name, {
          name: method.name,
          file,
          dependencies,
          type: 'function'
        });
      });
    });

    // Parse files to find additional dependencies (imports, extends, implements)
    this.parseFileDependencies(projectStructure);
  }

  private extractDependenciesFromInterface(iface: InterfaceInfo): string[] {
    const dependencies: string[] = [];
    
    if (iface.properties) {
      iface.properties.forEach(prop => {
        const typeRefs = this.extractTypeReferences(prop.type);
        dependencies.push(...typeRefs);
      });
    }
    
    if (iface.definition) {
      const typeRefs = this.extractTypeReferences(iface.definition);
      dependencies.push(...typeRefs);
    }
    
    return [...new Set(dependencies)];
  }

  private extractDependenciesFromMethod(method: ApiMethod): string[] {
    const dependencies: string[] = [];
    
    // Extract from parameters
    method.parameters.forEach(param => {
      const typeRefs = this.extractTypeReferences(param);
      dependencies.push(...typeRefs);
    });
    
    // Extract from return type
    const returnTypeRefs = this.extractTypeReferences(method.returnType);
    dependencies.push(...returnTypeRefs);
    
    return [...new Set(dependencies)];
  }

  private extractTypeReferences(typeString: string): string[] {
    if (!typeString) return [];
    
    const references: string[] = [];
    
    // Match custom type references (not primitives)
    const typeRegex = /[A-Z][a-zA-Z0-9_$]*/g;
    const primitives = new Set([
      'string', 'number', 'boolean', 'any', 'void', 'null', 'undefined', 
      'Date', 'Array', 'Promise', 'Function', 'Object', 'Error', 'RegExp',
      'Map', 'Set', 'WeakMap', 'WeakSet'
    ]);
    
    let match;
    while ((match = typeRegex.exec(typeString)) !== null) {
      const typeName = match[0];
      if (!primitives.has(typeName) && this.dependencyGraph.has(typeName)) {
        references.push(typeName);
      }
    }
    
    return references;
  }

  private parseFileDependencies(projectStructure: ProjectStructure): void {
    // This would parse actual source files to find import statements
    // For now, we'll enhance with common patterns
    
    this.dependencyGraph.forEach((node, name) => {
      // Look for extends/implements relationships
      if (node.type === 'interface' || node.type === 'class') {
        const extendedTypes = this.findExtendedTypes(name);
        node.dependencies.push(...extendedTypes);
      }
      
      // Remove self-references and duplicates
      node.dependencies = node.dependencies.filter(dep => 
        dep !== name && this.dependencyGraph.has(dep)
      );
      node.dependencies = [...new Set(node.dependencies)];
    });
  }

  private findExtendedTypes(typeName: string): string[] {
    const extended: string[] = [];
    const baseName = typeName.replace(/Props$/, '').replace(/Interface$/, '').replace(/Type$/, '');
    
    // Common inheritance patterns
    const patterns = [
      `I${baseName}`,
      `${baseName}Base`,
      `Base${baseName}`,
      `Abstract${baseName}`,
      `${baseName}Interface`
    ];
    
    patterns.forEach(pattern => {
      if (this.dependencyGraph.has(pattern) && pattern !== typeName) {
        extended.push(pattern);
      }
    });
    
    return extended;
  }

  private findCircularDependencies(): void {
    this.visited.clear();
    this.recursionStack.clear();
    this.circularDependencies = [];
    
    // Perform DFS for each node to find cycles
    this.dependencyGraph.forEach((_, nodeName) => {
      if (!this.visited.has(nodeName)) {
        this.dfs(nodeName, []);
      }
    });
    
    // Remove duplicate cycles (same cycle starting from different nodes)
    this.removeDuplicateCycles();
    
    // Categorize severity
    this.categorizeCircularDependencies();
  }

  private dfs(nodeName: string, path: string[]): boolean {
    if (this.recursionStack.has(nodeName)) {
      // Found a cycle!
      const cycleStart = path.indexOf(nodeName);
      const cycle = path.slice(cycleStart);
      cycle.push(nodeName); // Complete the cycle
      
      this.circularDependencies.push({
        cycle,
        files: cycle.map(name => this.dependencyGraph.get(name)?.file || ''),
        severity: 'medium', // Temporary, will be categorized later
        description: this.generateCycleDescription(cycle)
      });
      
      return true;
    }
    
    if (this.visited.has(nodeName)) {
      return false;
    }
    
    this.visited.add(nodeName);
    this.recursionStack.add(nodeName);
    path.push(nodeName);
    
    const node = this.dependencyGraph.get(nodeName);
    if (node) {
      for (const dep of node.dependencies) {
        if (this.dependencyGraph.has(dep)) {
          this.dfs(dep, path);
        }
      }
    }
    
    path.pop();
    this.recursionStack.delete(nodeName);
    
    return false;
  }

  private removeDuplicateCycles(): void {
    const uniqueCycles = new Set<string>();
    const filtered: CircularDependency[] = [];
    
    this.circularDependencies.forEach(circular => {
      // Normalize cycle by sorting and stringifying to detect duplicates
      const normalized = [...circular.cycle].sort().join('->');
      
      if (!uniqueCycles.has(normalized)) {
        uniqueCycles.add(normalized);
        filtered.push(circular);
      }
    });
    
    this.circularDependencies = filtered;
  }

  private categorizeCircularDependencies(): void {
    this.circularDependencies.forEach(circular => {
      // Categorize based on cycle length and types involved
      if (circular.cycle.length <= 2) {
        circular.severity = 'high'; // Very tight coupling
      } else if (circular.cycle.length <= 4) {
        circular.severity = 'medium'; // Moderate coupling
      } else {
        circular.severity = 'low'; // Loose coupling, might be acceptable
      }
      
      // Upgrade severity if interfaces are involved (more problematic)
      const hasInterfaces = circular.cycle.some(name => {
        const node = this.dependencyGraph.get(name);
        return node?.type === 'interface' || node?.type === 'type';
      });
      
      if (hasInterfaces) {
        circular.severity = 'high';
      }
    });
  }

  private generateCycleDescription(cycle: string[]): string {
    const types = cycle.map(name => {
      const node = this.dependencyGraph.get(name);
      return node ? `${name} (${node.type})` : name;
    }).join(' → ');
    
    return `Circular dependency: ${types}`;
  }

  getCircularDependencyReport(): string {
    const lines: string[] = [];
    lines.push('# 🔄 Circular Dependencies Report');
    lines.push(`**Total Circular Dependencies Found:** ${this.circularDependencies.length}`);
    lines.push('');
    
    if (this.circularDependencies.length === 0) {
      lines.push('🎉 **No circular dependencies found!** Your codebase has good dependency management.');
      lines.push('');
      return lines.join('\n');
    }

    // Group by severity
    const highSeverity = this.circularDependencies.filter(c => c.severity === 'high');
    const mediumSeverity = this.circularDependencies.filter(c => c.severity === 'medium');
    const lowSeverity = this.circularDependencies.filter(c => c.severity === 'low');

    if (highSeverity.length > 0) {
      lines.push('## 🚨 High Severity Circular Dependencies');
      lines.push('');
      lines.push('These can cause "Excessive stack depth comparing types" errors and should be fixed immediately:');
      lines.push('');
      
      highSeverity.forEach((circular, index) => {
        lines.push(`### ${index + 1}. ${circular.description}`);
        lines.push('**Cycle:**');
        lines.push('```');
        lines.push(circular.cycle.join(' → '));
        lines.push('```');
        lines.push('**Files Involved:**');
        circular.files.forEach(file => {
          lines.push(`- ${file}`);
        });
        lines.push('');
        lines.push('**Suggested Fix:**');
        lines.push(this.generateFixSuggestion(circular));
        lines.push('---');
        lines.push('');
      });
    }

    if (mediumSeverity.length > 0) {
      lines.push('## ⚠️ Medium Severity Circular Dependencies');
      lines.push('');
      lines.push('Consider refactoring these to improve code structure:');
      lines.push('');
      
      mediumSeverity.forEach((circular, index) => {
        lines.push(`### ${index + 1}. ${circular.description}`);
        lines.push('**Cycle:**');
        lines.push('```');
        lines.push(circular.cycle.join(' → '));
        lines.push('```');
        lines.push('**Suggested Fix:**');
        lines.push(this.generateFixSuggestion(circular));
        lines.push('');
      });
    }

    if (lowSeverity.length > 0) {
      lines.push('## 💡 Low Severity Circular Dependencies');
      lines.push('');
      lines.push('These might be acceptable but could be improved:');
      lines.push('');
      
      lowSeverity.forEach((circular, index) => {
        lines.push(`### ${index + 1}. ${circular.description}`);
        lines.push('**Cycle:**');
        lines.push('```');
        lines.push(circular.cycle.join(' → '));
        lines.push('```');
        lines.push('');
      });
    }

    // Add general recommendations
    lines.push('## 🛠️ General Strategies for Fixing Circular Dependencies');
    lines.push('');
    lines.push('1. **Use Interface Segregation** - Break large interfaces into smaller, focused ones');
    lines.push('2. **Apply Dependency Inversion** - Depend on abstractions, not concretions');
    lines.push('3. **Introduce Intermediate Types** - Create mediator types to break direct cycles');
    lines.push('4. **Use Type Aliases Carefully** - Avoid complex recursive type aliases');
    lines.push('5. **Review Import Structure** - Ensure imports follow a clear hierarchy');
    lines.push('');

    return lines.join('\n');
  }

  private generateFixSuggestion(circular: CircularDependency): string {
    const cycle = circular.cycle;
    
    if (cycle.length === 2) {
      return `Break the direct dependency between ${cycle[0]} and ${cycle[1]} by introducing an interface or using dependency injection.`;
    }
    
    if (cycle.some(name => name.includes('Props'))) {
      return `Review component prop interfaces. Consider extracting shared types to a common location.`;
    }
    
    if (cycle.some(name => this.dependencyGraph.get(name)?.type === 'interface')) {
      return `Interface circular dependency detected. Extract common interface parts or use type composition.`;
    }
    
    return `Analyze the dependency chain and identify the weakest link to break. Consider creating intermediate abstractions.`;
  }

  // Utility method to get detailed analysis for CorrectionGenerator
  getDetailedCircularDependencies(): CircularDependency[] {
    return this.circularDependencies;
  }
}