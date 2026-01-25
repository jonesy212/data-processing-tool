// analyzers/TypeScriptInterfaceAnalyzer.ts
import { BaseAnalyzer } from './BaseAnalyzer';
import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import * as ts from 'typescript';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Analyzer for TypeScript interface inheritance issues
 * Detects circular dependencies, property mismatches, and redundant extensions
 */
export class TypeScriptInterfaceAnalyzer extends BaseAnalyzer {
  name = 'typescript-interfaces';
  filePatterns = ['**/*.ts', '**/*.tsx'];
  
  // Exclude test files and node_modules
  excludePatterns = ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**'];

  private interfaceRegistry = new Map<string, InterfaceInfo>();
  private inheritanceGraph = new InheritanceGraph();

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const files = await this.getFiles(this.filePatterns);
    
    // Phase 1: Build interface registry and inheritance graph
    for (const file of files) {
      await this.parseInterfaces(file);
    }

    // Phase 2: Detect circular dependencies
    const circularDeps = this.inheritanceGraph.findCircularDependencies();
    corrections.push(...this.createCircularDependencyCorrections(circularDeps));

    // Phase 3: Validate interface extensions
    const inheritanceErrors = this.validateInterfaceInheritance();
    corrections.push(...inheritanceErrors);

    // Phase 4: Detect redundant extensions (like extends A, B when B extends A)
    corrections.push(...this.detectRedundantExtensions());

    return corrections;
  }

  private async parseInterfaces(file: string): Promise<void> {
    const content = await fs.readFile(file, 'utf8');
    const sourceFile = ts.createSourceFile(
      file,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    this.visitNode(sourceFile, file);
  }

  private visitNode(node: ts.Node, file: string): void {
    if (ts.isInterfaceDeclaration(node)) {
      this.registerInterface(node, file);
    }

    ts.forEachChild(node, child => this.visitNode(child, file));
  }

  private registerInterface(node: ts.InterfaceDeclaration, file: string): Promise<void> {
    const interfaceName = node.name.text;
    const heritageClauses = node.heritageClauses || [];
    
    const interfaceInfo: InterfaceInfo = {
      name: interfaceName,
      file: file,
      extends: [],
      properties: [],
      line: node.getStart(),
      isRedundant: false
    };

    // Extract properties
    node.members.forEach(member => {
      if (ts.isPropertySignature(member)) {
        const propName = member.name.getText();
        const propType = member.type?.getText() || 'any';
        interfaceInfo.properties.push({ name: propName, type: propType });
      }
    });

    // Extract inheritance
    heritageClauses.forEach(clause => {
      if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
        clause.types.forEach(type => {
          const parentName = type.expression.getText();
          interfaceInfo.extends.push(parentName);
          
          // Add to inheritance graph
          this.inheritanceGraph.addEdge(interfaceName, parentName);
        });
      }
    });

    this.interfaceRegistry.set(interfaceName, interfaceInfo);
  }

  private validateInterfaceInheritance(): Correction[] {
    const corrections: Correction[] = [];

    for (const [name, info] of this.interfaceRegistry) {
      for (const parentName of info.extends) {
        const parent = this.interfaceRegistry.get(parentName);
        if (!parent) continue;

        // Check for property type mismatches
        const mismatches = this.findPropertyMismatches(info, parent);
        corrections.push(...mismatches);

        // Check for permissions array specifically (common issue)
        corrections.push(...this.validatePermissionsProperty(info, parent));
      }
    }

    return corrections;
  }

  private findPropertyMismatches(child: InterfaceInfo, parent: InterfaceInfo): Correction[] {
    const mismatches: Correction[] = [];

    for (const parentProp of parent.properties) {
      const childProp = child.properties.find(p => p.name === parentProp.name);
      if (!childProp) continue;

      // Check if types are compatible
      if (!this.areTypesCompatible(parentProp.type, childProp.type)) {
        mismatches.push(this.createCorrection(
          `interface-type-mismatch-${this.hashPath(child.file)}-${child.name}-${parentProp.name}`,
          'error' as CorrectionType,
          'critical' as CorrectionSeverity,
          `Type mismatch: ${child.name}.${parentProp.name}`,
          child.file,
          `// Parent ${parent.name}.${parentProp.name}: ${parentProp.type}\n// Child ${child.name}.${parentProp.name}: ${childProp.type}`,
          this.generateTypeFixSuggestion(parentProp, childProp, child.name),
          'interface-inheritance' as CorrectionCategory,
          child.line,
          `Property '${parentProp.name}' has incompatible types between ${parent.name} and ${child.name}`
        ));
      }
    }

    return mismatches;
  }

  private validatePermissionsProperty(info: InterfaceInfo, parent: InterfaceInfo): Correction[] {
    const corrections: Correction[] = [];

    const parentPermissions = parent.properties.find(p => p.name === 'permissions');
    if (!parentPermissions) return corrections;

    const childPermissions = info.properties.find(p => p.name === 'permissions');
    if (!childPermissions) return corrections;

    // Detect common permissions mismatch
    const isParentArray = parentPermissions.type.includes('Permission[]');
    const isChildDocumentPerms = childPermissions.type.includes('DocumentPermissions');

    if (isParentArray && isChildDocumentPerms) {
      corrections.push(this.createCorrection(
        `interface-permissions-mismatch-${this.hashPath(info.file)}-${info.name}`,
        'error' as CorrectionType,
        'critical' as CorrectionSeverity,
        `Permissions type mismatch in ${info.name}`,
        info.file,
        this.extractCodeSnippet(childPermissions.type),
        this.generatePermissionsFix(info.name, parent.name),
        'interface-inheritance' as CorrectionCategory,
        childPermissions.line || info.line
      ));
    }

    return corrections;
  }

  private areTypesCompatible(parentType: string, childType: string): boolean {
    // Simplified type compatibility check
    if (parentType === childType) return true;
    if (parentType.includes('any') || childType.includes('any')) return true;
    
    // Check for compatible array types
    if (parentType.includes('[]') && childType.includes('[]')) return true;
    
    // Check for union type compatibility
    if (parentType.includes('|') || childType.includes('|')) {
      return this.areUnionTypesCompatible(parentType, childType);
    }

    return false;
  }

  private areUnionTypesCompatible(parent: string, child: string): boolean {
    const parentTypes = parent.split('|').map(t => t.trim());
    const childTypes = child.split('|').map(t => t.trim());
    
    // Check if child is subset of parent
    return childTypes.every(ct => parentTypes.some(pt => pt === ct || ct === 'undefined'));
  }

  private generateTypeFixSuggestion(parentProp: PropertyInfo, childProp: PropertyInfo, childName: string): string {
    return `Change ${childName}.${parentProp.name} type from ${childProp.type} to ${parentProp.type}`;
  }

  private generatePermissionsFix(childName: string, parentName: string): string {
    return `// In ${childName}, change:\n` +
           `// permissions?: DocumentPermissions\n` +
           `// To:\n` +
           `// permissions?: Permission[]\n` +
           `// Or remove from ${childName} to inherit from ${parentName}`;
  }

  private detectRedundantExtensions(): Correction[] {
    const corrections: Correction[] = [];

    for (const [name, info] of this.interfaceRegistry) {
      if (info.extends.length <= 1) continue; // Nothing redundant with single parent

      // Check if any parent extends another parent
      for (let i = 0; i < info.extends.length; i++) {
        for (let j = i + 1; j < info.extends.length; j++) {
          const parent1 = info.extends[i];
          const parent2 = info.extends[j];

          if (this.inheritanceGraph.isAncestor(parent1, parent2)) {
            corrections.push(this.createRedundantExtensionCorrection(info, parent1, parent2));
          } else if (this.inheritanceGraph.isAncestor(parent2, parent1)) {
            corrections.push(this.createRedundantExtensionCorrection(info, parent2, parent1));
          }
        }
      }
    }

    return corrections;
  }

  private createRedundantExtensionCorrection(
    info: InterfaceInfo,
    ancestor: string,
    descendant: string
  ): Correction {
    return this.createCorrection(
      `interface-redundant-extension-${this.hashPath(info.file)}-${info.name}`,
      'warning' as CorrectionType,
      'medium' as CorrectionSeverity,
      `Redundant interface extension: ${info.name}`,
      info.file,
      this.extractCodeSnippet(info.file, `extends.*${descendant}.*${ancestor}`),
      this.generateRedundantExtensionFix(info.name, ancestor, descendant),
      'interface-inheritance' as CorrectionCategory,
      info.line,
      `${descendant} already extends ${ancestor}, no need to extend both`
    );
  }

  private generateRedundantExtensionFix(
    interfaceName: string,
    ancestor: string,
    descendant: string
  ): string {
    return `// In ${interfaceName}, change:\n` +
           `// extends ${descendant}, ${ancestor}\n` +
           `// To:\n` +
           `// extends ${descendant}\n` +
           `// (which already includes ${ancestor})`;
  }

  private createCircularDependencyCorrections(circularPaths: string[][]): Correction[] {
    return circularPaths.map(path => {
      const cycle = path.join(' → ');
      return this.createCorrection(
        `interface-circular-${this.hashPath(cycle)}`,
        'error' as CorrectionType,
        'critical' as CorrectionSeverity,
        `Circular interface dependency detected`,
        path[0],
        `// Circular path: ${cycle}`,
        this.generateCircularDependencyFix(path),
        'interface-circular' as CorrectionCategory,
        1,
        'Circular dependencies cause TypeScript compilation errors'
      );
    });
  }

  private generateCircularDependencyFix(path: string[]): string {
    const [first, ...rest] = path;
    return `// Break the cycle by:\n` +
           `// 1. Extracting common properties into a base interface\n` +
           `// 2. Using composition instead of inheritance\n` +
           `// 3. Consider: ${first} should not extend ${rest[rest.length - 1]}`;
  }

  // Helper methods
  private extractCodeSnippet(file: string, pattern: RegExp): string {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const match = content.match(pattern);
      return match ? match[0] : '// Not found';
    } catch {
      return '// Could not read file';
    }
  }

  private hashPath(input: string): string {
    return Buffer.from(input).toString('base64').slice(0, 10);
  }
}

/**
 * Graph structure to track interface inheritance relationships
 */
class InheritanceGraph {
  private adjacencyList = new Map<string, string[]>();
  private visited = new Set<string>();
  private recursionStack = new Set<string>();

  addEdge(from: string, to: string): void {
    if (!this.adjacencyList.has(from)) {
      this.adjacencyList.set(from, []);
    }
    this.adjacencyList.get(from)!.push(to);
  }

  isAncestor(ancestor: string, descendant: string): boolean {
    const visited = new Set<string>();
    return this.dfs(descendant, ancestor, visited);
  }

  private dfs(current: string, target: string, visited: Set<string>): boolean {
    if (current === target) return true;
    if (visited.has(current)) return false;
    
    visited.add(current);
    const neighbors = this.adjacencyList.get(current) || [];
    
    for (const neighbor of neighbors) {
      if (this.dfs(neighbor, target, visited)) return true;
    }
    
    return false;
  }

  findCircularDependencies(): string[][] {
    const circularPaths: string[][] = [];
    const visited = new Set<string>();
    
    for (const node of this.adjacencyList.keys()) {
      this.recursionStack.clear();
      const path = this.detectCycle(node, visited);
      if (path.length > 0) circularPaths.push(path);
    }
    
    return circularPaths;
  }

  private detectCycle(node: string, visited: Set<string>): string[] {
    if (this.recursionStack.has(node)) {
      return [node]; // Cycle detected
    }
    
    if (visited.has(node)) {
      return []; // Already visited, no cycle here
    }
    
    visited.add(node);
    this.recursionStack.add(node);
    
    const neighbors = this.adjacencyList.get(node) || [];
    for (const neighbor of neighbors) {
      const cycle = this.detectCycle(neighbor, visited);
      if (cycle.length > 0) {
        return [node, ...cycle];
      }
    }
    
    this.recursionStack.delete(node);
    return [];
  }
}

// Type definitions
interface InterfaceInfo {
  name: string;
  file: string;
  extends: string[];
  properties: PropertyInfo[];
  line: number;
  isRedundant: boolean;
}

interface PropertyInfo {
  name: string;
  type: string;
  line?: number;
}