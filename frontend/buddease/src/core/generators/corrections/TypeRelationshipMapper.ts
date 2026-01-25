// TypeRelationshipMapper.ts
import type { ApiMethod, InterfaceInfo } from '@/core/generators/ApiCodeGenerator';
import type { ProjectStructure } from '@/core/scripts/generateRoadmaps';
import path from 'path';

interface TypeNode {
  name: string;
  file: string;
  type: 'interface' | 'type' | 'class' | 'component' | 'props';
  extends?: string[];
  implements?: string[];
  properties: string[];
  methods: string[];
  dependencies: string[];
  depth: number;
}

interface TypeRelationship {
  source: string;
  target: string;
  relationship: 'extends' | 'implements' | 'uses' | 'composes' | 'references';
  strength: 'strong' | 'medium' | 'weak';
}

interface TypeHierarchy {
  root: TypeNode;
  children: TypeHierarchy[];
  depth: number;
}

export class TypeRelationshipMapper {
  private typeGraph: Map<string, TypeNode> = new Map();
  private relationships: TypeRelationship[] = [];
  private fileAssociations: Map<string, string[]> = new Map();

  async mapTypeRelationships(projectStructure: ProjectStructure): Promise<Map<string, TypeHierarchy>> {
    console.log('🔗 Mapping type relationships...');
  
    try {
      // Build initial type graph
      await this.buildTypeGraph(projectStructure);
    
      // Extract relationships
      this.extractInheritanceRelationships();
      this.extractCompositionRelationships();
      this.extractUsageRelationships();
    
      // Build hierarchies - ensure this returns a Map
      const hierarchies = this.buildTypeHierarchies();
    
      // Find associations
      this.findFileAssociations();
    
      return hierarchies; // This should be a Map<string, TypeHierarchy>
    } catch (error) {
      console.error('❌ Error mapping type relationships:', error);
      return new Map(); // Return empty Map on error
    }
  }

  private async buildTypeGraph(projectStructure: ProjectStructure): Promise<void> {
    const { interfaces, components, apis } = projectStructure;

    // Process interfaces and types
    interfaces.forEach(([name, iface]) => {
      const node: TypeNode = {
        name,
        file: iface.file,
        type: iface.type === 'type' ? 'type' : 'interface',
        properties: iface.properties ? iface.properties.map(p => p.name) : [],
        methods: [],
        dependencies: this.extractDependenciesFromInterface(iface),
        depth: 0
      };
      
      this.typeGraph.set(name, node);
    });

    // Process components
    components.forEach(([name, component]) => {
      const node: TypeNode = {
        name,
        file: component.file,
        type: 'component',
        properties: [],
        methods: [],
        dependencies: [component.propsType].filter(Boolean) as string[],
        depth: 0
      };
      
      this.typeGraph.set(name, node);
    });

    // Process APIs/services
    apis.forEach(([file, api]) => {
      api.methods.forEach(method => {
        const node: TypeNode = {
          name: method.name,
          file,
          type: 'class',
          properties: [],
          methods: [method.name],
          dependencies: this.extractDependenciesFromMethod(method),
          depth: 0
        };
        
        this.typeGraph.set(method.name, node);
      });
    });

    // Parse files to get extends/implements relationships
    await this.parseExtendedRelationships();
  }

  private extractDependenciesFromInterface(iface: InterfaceInfo): string[] {
    const dependencies: string[] = [];
    
    if (iface.properties) {
      iface.properties.forEach(prop => {
        // Extract type references from property types
        const typeRefs = this.extractTypeReferences(prop.type);
        dependencies.push(...typeRefs);
      });
    }
    
    if (iface.definition) {
      const typeRefs = this.extractTypeReferences(iface.definition);
      dependencies.push(...typeRefs);
    }
    
    return [...new Set(dependencies)]; // Remove duplicates
  }

  private extractDependenciesFromMethod(method: ApiMethod): string[] {
    const dependencies: string[] = [];
    
    // Extract from parameters
    method.parameters.forEach((param: string) => {
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
    const primitives = new Set(['string', 'number', 'boolean', 'any', 'void', 'null', 'undefined', 'Date', 'Array', 'Promise', 'Function']);
    
    let match;
    while ((match = typeRegex.exec(typeString)) !== null) {
      const typeName = match[0];
      if (!primitives.has(typeName) && this.typeGraph.has(typeName)) {
        references.push(typeName);
      }
    }
    
    return references;
  }

  private async parseExtendedRelationships(): Promise<void> {
    // This would parse actual source files to find extends/implements
    // For now, we'll use a simplified approach based on naming patterns
    
    for (const [typeName, node] of this.typeGraph) {
      if (node.type === 'interface' || node.type === 'type') {
        // Look for interfaces that might extend others based on naming
        const possibleParents = this.findPossibleParents(typeName);
        if (possibleParents.length > 0) {
          node.extends = possibleParents;
        }
      }
    }
  }

  private findPossibleParents(typeName: string): string[] {
    const parents: string[] = [];
    const baseName = typeName.replace(/Props$/, '').replace(/Interface$/, '').replace(/Type$/, '');
    
    // Common patterns for inheritance
    const patterns = [
      `I${baseName}`,
      `${baseName}Base`,
      `Base${baseName}`,
      `Abstract${baseName}`,
      `${baseName}Interface`
    ];
    
    patterns.forEach(pattern => {
      if (this.typeGraph.has(pattern) && pattern !== typeName) {
        parents.push(pattern);
      }
    });
    
    return parents;
  }

  private extractInheritanceRelationships(): void {
    for (const [typeName, node] of this.typeGraph) {
      if (node.extends) {
        node.extends.forEach(parentName => {
          if (this.typeGraph.has(parentName)) {
            this.relationships.push({
              source: typeName,
              target: parentName,
              relationship: 'extends',
              strength: 'strong'
            });
          }
        });
      }
    }
  }

  private extractCompositionRelationships(): void {
    for (const [typeName, node] of this.typeGraph) {
      node.dependencies.forEach(depName => {
        if (this.typeGraph.has(depName) && depName !== typeName) {
          this.relationships.push({
            source: typeName,
            target: depName,
            relationship: 'composes',
            strength: 'medium'
          });
        }
      });
    }
  }

  private extractUsageRelationships(): void {
    // Find components that use specific prop interfaces
    for (const [typeName, node] of this.typeGraph) {
      if (node.type === 'component' && node.dependencies.length > 0) {
        node.dependencies.forEach(depName => {
          if (this.typeGraph.has(depName)) {
            this.relationships.push({
              source: typeName,
              target: depName,
              relationship: 'uses',
              strength: 'strong'
            });
          }
        });
      }
    }
  }

  private buildTypeHierarchies(): Map<string, TypeHierarchy> {
    const hierarchies = new Map<string, TypeHierarchy>();
    const visited = new Set<string>();
    
    // Find root nodes (nodes that aren't extended by anyone)
    const rootNodes = this.findRootNodes();
    
    rootNodes.forEach(rootName => {
      const hierarchy = this.buildHierarchy(rootName, visited, 0);
      if (hierarchy) {
        hierarchies.set(rootName, hierarchy);
      }
    });
    
    // Handle orphaned nodes (circular dependencies or isolated nodes)
    this.typeGraph.forEach((node, name) => {
      if (!visited.has(name)) {
        const hierarchy: TypeHierarchy = {
          root: node,
          children: [],
          depth: 0
        };
        hierarchies.set(name, hierarchy);
      }
    });
    
    return hierarchies;
  }

  private findRootNodes(): string[] {
    const extendedNodes = new Set<string>();
    
    this.relationships.forEach(rel => {
      if (rel.relationship === 'extends') {
        extendedNodes.add(rel.target);
      }
    });
    
    const rootNodes: string[] = [];
    this.typeGraph.forEach((_, name) => {
      if (!extendedNodes.has(name)) {
        rootNodes.push(name);
      }
    });
    
    return rootNodes;
  }

  private buildHierarchy(typeName: string, visited: Set<string>, depth: number): TypeHierarchy | null {
    if (visited.has(typeName)) {
      return null; // Circular dependency detected
    }
    
    visited.add(typeName);
    const node = this.typeGraph.get(typeName);
    
    if (!node) {
      return null;
    }
    
    node.depth = depth;
    
    const hierarchy: TypeHierarchy = {
      root: node,
      children: [],
      depth
    };
    
    // Find children (types that extend this one)
    this.relationships.forEach(rel => {
      if (rel.relationship === 'extends' && rel.target === typeName) {
        const childHierarchy = this.buildHierarchy(rel.source, visited, depth + 1);
        if (childHierarchy) {
          hierarchy.children.push(childHierarchy);
        }
      }
    });
    
    return hierarchy;
  }

  private findFileAssociations(): void {
    // Group types by file and find associations between files
    const fileToTypes = new Map<string, string[]>();
    
    this.typeGraph.forEach((node, name) => {
      if (!fileToTypes.has(node.file)) {
        fileToTypes.set(node.file, []);
      }
      fileToTypes.get(node.file)!.push(name);
    });
    
    // Find relationships between files
    fileToTypes.forEach((types, file) => {
      const associatedFiles = new Set<string>();
      
      types.forEach(typeName => {
        const node = this.typeGraph.get(typeName);
        if (node) {
          // Find all types this type relates to
          this.relationships.forEach(rel => {
            if (rel.source === typeName || rel.target === typeName) {
              const otherType = rel.source === typeName ? rel.target : rel.source;
              const otherNode = this.typeGraph.get(otherType);
              if (otherNode && otherNode.file !== file) {
                associatedFiles.add(otherNode.file);
              }
            }
          });
        }
      });
      
      this.fileAssociations.set(file, Array.from(associatedFiles));
    });
  }

  getFileAssociations(): Map<string, string[]> {
    return this.fileAssociations;
  }

  findCircularDependencies(): string[] {
    const circular: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const dfs = (typeName: string): boolean => {
      if (recursionStack.has(typeName)) {
        circular.push(typeName);
        return true;
      }
      
      if (visited.has(typeName)) {
        return false;
      }
      
      visited.add(typeName);
      recursionStack.add(typeName);
      
      const node = this.typeGraph.get(typeName);
      if (node) {
        for (const dep of node.dependencies) {
          if (dfs(dep)) {
            return true;
          }
        }
      }
      
      recursionStack.delete(typeName);
      return false;
    };
    
    this.typeGraph.forEach((_, typeName) => {
      if (!visited.has(typeName)) {
        dfs(typeName);
      }
    });
    
    return [...new Set(circular)]; // Remove duplicates
  }

  findOrphanedTypes(): string[] {
    const orphaned: string[] = [];
    
    this.typeGraph.forEach((node, name) => {
      const hasIncoming = this.relationships.some(rel => 
        rel.target === name && rel.relationship !== 'uses'
      );
      
      const hasOutgoing = this.relationships.some(rel => 
        rel.source === name && rel.relationship !== 'uses'
      );
      
      if (!hasIncoming && !hasOutgoing && node.dependencies.length === 0) {
        orphaned.push(name);
      }
    });
    
    return orphaned;
  }

  generateTypeRelationshipsReport(hierarchies: Map<string, TypeHierarchy>): string {
    const lines: string[] = [];
    lines.push('# 🔗 Type Relationships & Hierarchies');
    lines.push('');
    
    lines.push('## Type Hierarchy');
    lines.push('');
    
    hierarchies.forEach((hierarchy, rootName) => {
      lines.push(`### ${rootName}`);
      lines.push(`**File:** ${hierarchy.root.file}`);
      lines.push(`**Type:** ${hierarchy.root.type}`);
      lines.push('');
      
      if (hierarchy.children.length > 0) {
        lines.push('**Extends:**');
        this.printHierarchy(hierarchy, lines, 1);
      } else {
        lines.push('*No children*');
      }
      
      lines.push('');
    });
    
    lines.push('## File Associations');
    lines.push('');
    
    this.fileAssociations.forEach((associations, file) => {
      if (associations.length > 0) {
        lines.push(`### ${path.basename(file)}`);
        lines.push('**Associated Files:**');
        associations.forEach(assocFile => {
          lines.push(`- ${path.basename(assocFile)}`);
        });
        lines.push('');
      }
    });
    
    // Find potential issues
    const circular = this.findCircularDependencies();
    const orphaned = this.findOrphanedTypes();
    
    if (circular.length > 0) {
      lines.push('## ⚠️ Circular Dependencies Detected');
      lines.push('');
      circular.forEach(type => {
        lines.push(`- ${type}`);
      });
      lines.push('');
    }
    
    if (orphaned.length > 0) {
      lines.push('## 🗑️ Orphaned Types (Consider Removing)');
      lines.push('');
      orphaned.forEach(type => {
        lines.push(`- ${type}`);
      });
    }
    
    return lines.join('\n');
  }

  private printHierarchy(hierarchy: TypeHierarchy, lines: string[], depth: number): void {
    const indent = '  '.repeat(depth);
    
    hierarchy.children.forEach(child => {
      lines.push(`${indent}- ${child.root.name} (${child.root.type})`);
      this.printHierarchy(child, lines, depth + 1);
    });
  }
}

export type { TypeHierarchy };
