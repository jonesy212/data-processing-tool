// analyzers/RelationshipAnalyzer.ts

import { BaseAnalyzer } from './BaseAnalyzer';
import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import * as ts from 'typescript';
import * as fs from 'fs/promises';
import * as path from 'path';

interface TypeParameter {
  name: string;
  constraint?: string;
  default?: string;
}

interface RelationshipNode {
  name: string;
  file: string;
  type: 'interface' | 'class' | 'type';
  typeParameters: TypeParameter[];
  extends: string[];
  extendedBy: string[];
  references: string[];
  complexityScore: number;
  circular?: boolean;
  level: number; // Inheritance depth
}

interface RelationshipGraph {
  nodes: Map<string, RelationshipNode>;
  edges: Array<{
    from: string; 
    to: string; 
    type: 'extends' | 'implements' | 'generic' | 'constraint'
  }>;
}

export class RelationshipAnalyzer extends BaseAnalyzer {
  name = 'relationship';
  filePatterns = [
    '**/*.d.ts',
    '**/models/**/*.ts',
    '**/types/**/*.ts',
    '**/interfaces/**/*.ts',
    '**/core/**/*.ts',
    '!**/*.test.ts',
    '!**/*.spec.ts'
  ];
  
  private graph: RelationshipGraph = {
    nodes: new Map(),
    edges: []
  };
  
  private complexityThreshold = 4; // Flag types with score >= 4
  private genericThreshold = 4;    // Flag generics with >= 4 parameters

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const files = await this.getFiles(this.filePatterns);
    
    // Phase 1: Build relationship graph
    console.log(`🔍 Building relationship graph from ${files.length} files...`);
    await this.buildGraph(files);
    
    // Phase 2: Detect issues
    console.log(`📊 Analyzing ${this.graph.nodes.size} type definitions...`);
    corrections.push(...this.analyzeCircularDependencies());
    corrections.push(...this.analyzeComplexGenerics());
    corrections.push(...this.analyzeMissingConstraints());
    corrections.push(...this.analyzeUnusedTypeParameters());
    corrections.push(...this.analyzeDeepInheritance());
    corrections.push(...this.generateArchitectureReport());
    
    return corrections;
  }

  /**
   * Builds complete relationship graph from all files
   */
  private async buildGraph(files: string[]): Promise<void> {
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const sourceFile = ts.createSourceFile(
          file, 
          content, 
          ts.ScriptTarget.Latest, 
          true
        );
        this.scanNode(sourceFile, file);
      } catch (error) {
        console.warn(`⚠️  Could not parse ${file}:`, error);
      }
    }
    
    // Calculate complexity and inheritance levels
    this.calculateComplexityScores();
    this.calculateInheritanceLevels();
  }

  /**
   * Recursively scans TypeScript AST for type definitions
   */
  private scanNode(node: ts.Node, file: string): void {
    // Detect interfaces, classes, and type aliases
    if (ts.isInterfaceDeclaration(node) || 
        ts.isClassDeclaration(node) || 
        ts.isTypeAliasDeclaration(node)) {
      
      const name = node.name?.text || 'Anonymous';
      const typeParams = this.extractTypeParameters(node);
      const extendsList = this.extractExtendsList(node);
      
      const nodeData: RelationshipNode = {
        name,
        file,
        type: ts.isInterfaceDeclaration(node) ? 'interface' : 
              ts.isClassDeclaration(node) ? 'class' : 'type',
        typeParameters: typeParams,
        extends: extendsList,
        extendedBy: [],
        references: [],
        complexityScore: 0,
        circular: false,
        level: 0
      };
      
      const nodeId = `${file}:${name}`;
      this.graph.nodes.set(nodeId, nodeData);
      
      // Record edges for relationships
      extendsList.forEach(parent => {
        this.graph.edges.push({
          from: nodeId, 
          to: parent, 
          type: 'extends'
        });
      });
    }

    // Scan imports for reference relationships
    if (ts.isImportDeclaration(node)) {
      const module = node.moduleSpecifier.getText().replace(/['"]/g, '');
      this.scanImport(node, file, module);
    }
    
    ts.forEachChild(node, child => this.scanNode(child, file));
  }

  /**
   * Extracts type parameters from generic declarations
   */
  private extractTypeParameters(node: ts.Node): TypeParameter[] {
    const typeParams: TypeParameter[] = [];
    const typeParamsNode = (node as any).typeParameters;

    if (typeParamsNode && Array.isArray(typeParamsNode)) {
      typeParamsNode.forEach(param => {
        if (ts.isTypeParameterDeclaration(param)) {
          typeParams.push({
            name: param.name.text,
            constraint: param.constraint ? param.constraint.getText() : undefined,
            default: param.default ? param.default.getText() : undefined
          });
        }
      });
    }

    return typeParams;
  }

  /**
   * Extracts extends/implements clauses
   */
  private extractExtendsList(node: ts.Node): string[] {
    const extendsList: string[] = [];
    const heritage = (node as any).heritageClauses;

    if (heritage && Array.isArray(heritage)) {
      heritage.forEach(clause => {
        if (ts.isHeritageClause(clause)) {
          clause.types.forEach(type => {
            extendsList.push(type.getText());
          });
        }
      });
    }

    return extendsList;
  }

  /**
   * Scans imports to build reference graph
   */
  private scanImport(node: ts.ImportDeclaration, file: string, module: string): void {
    // Track references between files
    if (node.importClause?.namedBindings && 
        ts.isNamedImports(node.importClause.namedBindings)) {
      node.importClause.namedBindings.elements.forEach(specifier => {
        const importedName = specifier.name.text;
        this.graph.edges.push({
          from: file,
          to: `${module}:${importedName}`,
          type: 'constraint'
        });
      });
    }
  }

  /**
   * Calculates complexity scores for each node
   */
  private calculateComplexityScores(): void {
    this.graph.nodes.forEach((node, nodeId) => {
      let score = 0;

      // Type parameters complexity (2 points each)
      score += node.typeParameters.length * 2;

      // Generic constraints complexity (1 point each)
      node.typeParameters.forEach(param => {
        if (param.constraint) score += 1;
        if (param.default && param.default !== param.name) score += 1;
        if (param.constraint?.includes('extends')) score += 0.5;
      });

      // Inheritance complexity (1.5 points each)
      score += node.extends.length * 1.5;

      // Multi-extends bonus (difficult to reason about)
      if (node.extends.length > 2) score += 2;

      // Generic in extends (high complexity)
      node.extends.forEach(parent => {
        if (parent.includes('<')) score += 2;
      });

      // Circular reference multiplier
      if (node.circular) score *= 2;

      node.complexityScore = score;
    });
  }

  /**
   * Calculates inheritance depth levels
   */
  private calculateInheritanceLevels(): void {
    const calculateLevel = (nodeId: string, visited = new Set<string>()): number => {
      if (visited.has(nodeId)) return 0;
      visited.add(nodeId);

      const node = this.graph.nodes.get(nodeId);
      if (!node || node.extends.length === 0) return 0;

      const parentLevels = node.extends.map(parent => {
        // Find parent node
        const parentNode = Array.from(this.graph.nodes.values())
          .find(n => parent.includes(n.name));
        return parentNode ? calculateLevel(`${parentNode.file}:${parentNode.name}`, visited) + 1 : 0;
      });

      return Math.max(...parentLevels);
    };

    this.graph.nodes.forEach((node, nodeId) => {
      node.level = calculateLevel(nodeId);
    });
  }

  /**
   * Detects circular dependencies in type hierarchies
   */
  private analyzeCircularDependencies(): Correction[] {
    const corrections: Correction[] = [];
    const visited = new Set<string>();
    const stack = new Set<string>();

    const hasCycle = (nodeId: string, path: string[] = []): string[] | null => {
      if (stack.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        return path.slice(cycleStart).concat([nodeId]);
      }

      if (visited.has(nodeId)) return null;

      visited.add(nodeId);
      stack.add(nodeId);

      const node = this.graph.nodes.get(nodeId);
      if (node) {
        for (const parent of node.extends) {
          // Find parent node ID
          const parentNode = Array.from(this.graph.nodes.entries())
            .find(([id, n]) => parent.includes(n.name));
          
          if (parentNode) {
            const cycle = hasCycle(parentNode[0], [...path, nodeId]);
            if (cycle) return cycle;
          }
        }
      }

      stack.delete(nodeId);
      return null;
    };

    this.graph.nodes.forEach((node, nodeId) => {
      if (!visited.has(nodeId)) {
        const cycle = hasCycle(nodeId);
        if (cycle) {
          node.circular = true;
          corrections.push(this.createCorrection(
            `circular-${this.hashPath(nodeId)}`,
            'error',
            'critical',
            `Circular type dependency: ${cycle.join(' → ')}`,
            node.file,
            `interface ${node.name} extends ${node.extends[0]}`,
            'Break the cycle by extracting common types to a base interface',
            'relationship-circular',
            this.getLineNumber(node.file, node.name),
            `Circular chain: ${cycle.join(' → ')}`
          ));
        }
      }
    });

    return corrections;
  }

  /**
   * Analyzes overly complex generic types
   */
  private analyzeComplexGenerics(): Correction[] {
    const corrections: Correction[] = [];

    this.graph.nodes.forEach((node, nodeId) => {
      // Flag types with 4+ parameters
      if (node.typeParameters.length >= this.genericThreshold) {
        corrections.push(this.createCorrection(
          `complex-generics-${this.hashPath(nodeId)}`,
          'warning',
          node.typeParameters.length >= 6 ? 'high' : 'medium',
          `Overly complex generics: ${node.typeParameters.length} parameters`,
          node.file,
          this.extractGenericDeclaration(node),
          'Extract complex generic constraints to helper types or reduce parameter count',
          'relationship-complexity',
          this.getLineNumber(node.file, node.name),
          this.generateComplexityDetails(node)
        ));
      }

      // Check for redundant type parameters
      node.typeParameters.forEach((param, idx) => {
        if (param.constraint?.includes(' extends ') && param.default === param.name) {
          corrections.push(this.createCorrection(
            `redundant-param-${this.hashPath(nodeId)}-${idx}`,
            'suggestion',
            'low',
            `Redundant default: ${param.name} = ${param.name}`,
            node.file,
            `${param.name} extends ${param.constraint.split(' extends ')[1]} = ${param.name}`,
            'Remove default value when it matches the parameter name',
            'relationship-cleanup'
          ));
        }
      });
    });

    return corrections;
  }

  /**
   * Validates generic constraints
   */
  private analyzeMissingConstraints(): Correction[] {
    const corrections: Correction[] = [];

    this.graph.nodes.forEach((node, nodeId) => {
      node.typeParameters.forEach((param, idx) => {
        // Flag unconstrained type parameters (except in simple cases)
        if (!param.constraint && node.typeParameters.length > 1) {
          corrections.push(this.createCorrection(
            `unconstrained-param-${this.hashPath(nodeId)}-${idx}`,
            'suggestion',
            'medium',
            `Type parameter ${param.name} missing constraint`,
            node.file,
            param.name,
            `Add constraint: ${param.name} extends BaseType`,
            'relationship-constraints'
          ));
        }

        // Check for constraint violations
        node.extends.forEach(parent => {
          if (parent.includes('<') && parent.includes(param.name)) {
            const parentNode = Array.from(this.graph.nodes.values())
              .find(n => parent.includes(n.name));
            
            if (parentNode && !this.validateTypeArgument(parent, param)) {
              corrections.push(this.createCorrection(
                `constraint-violation-${this.hashPath(nodeId)}`,
                'error',
                'high',
                `Type argument violates constraint for ${param.name}`,
                node.file,
                `${node.name} extends ${parent}`,
                'Ensure type arguments satisfy the parent type constraints',
                'relationship-correctness'
              ));
            }
          }
        });
      });
    });

    return corrections;
  }

  /**
   * Finds unused type parameters
   */
  private analyzeUnusedTypeParameters(): Correction[] {
    const corrections: Correction[] = [];

    this.graph.nodes.forEach((node, nodeId) => {
      try {
        const content = fs.readFileSync(node.file, 'utf8');
        
        node.typeParameters.forEach((param, idx) => {
          // Count actual usage (excluding declarations)
          const usagePattern = new RegExp(`\\b${param.name}\\b`, 'g');
          const matches = content.match(usagePattern);
          const usageCount = matches ? matches.length : 0;
          
          // Subtract declarations and constraints
          const declarationCount = 
            (content.match(new RegExp(`${param.name}[:,]`, 'g')) || []).length +
            (content.match(new RegExp(`extends ${param.name}`, 'g')) || []).length;
          
          const actualUsage = usageCount - declarationCount;
          
          if (actualUsage <= 0 && node.typeParameters.length > 1) {
            corrections.push(this.createCorrection(
              `unused-param-${this.hashPath(nodeId)}-${idx}`,
              'warning',
              'low',
              `Unused type parameter: ${param.name}`,
              node.file,
              `${param.name}${param.constraint ? ` extends ${param.constraint}` : ''}${param.default ? ` = ${param.default}` : ''}`,
              'Remove unused type parameter or use it in the type body',
              'relationship-cleanup'
            ));
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    });

    return corrections;
  }

  /**
   * Flags deep inheritance hierarchies
   */
  private analyzeDeepInheritance(): Correction[] {
    const corrections: Correction[] = [];

    this.graph.nodes.forEach((node, nodeId) => {
      if (node.level >= 4) {
        corrections.push(this.createCorrection(
          `deep-inheritance-${this.hashPath(nodeId)}`,
          'suggestion',
          'medium',
          `Deep inheritance hierarchy: ${node.level} levels`,
          node.file,
          `${node.type} ${node.name} extends ${node.extends[0]}`,
          'Consider composition over deep inheritance chains',
          'relationship-architecture',
          this.getLineNumber(node.file, node.name),
          `Current depth: ${node.level}. Recommended max: 3.`
        ));
      }
    });

    return corrections;
  }

  /**
   * Generates comprehensive architecture report
   */
  private generateArchitectureReport(): Correction[] {
    const corrections: Correction[] = [];
    
    const totalNodes = this.graph.nodes.size;
    const totalEdges = this.graph.edges.length;
    const avgComplexity = Array.from(this.graph.nodes.values())
      .reduce((sum, node) => sum + node.complexityScore, 0) / totalNodes;
    const maxComplexity = Math.max(...Array.from(this.graph.nodes.values()).map(n => n.complexityScore));
    const circularCount = Array.from(this.graph.nodes.values()).filter(n => n.circular).length;
    const deepInheritanceCount = Array.from(this.graph.nodes.values()).filter(n => n.level >= 4).length;

    corrections.push(this.createCorrection(
      'relationship-summary',
      'info',
      circularCount > 0 ? 'critical' : avgComplexity > 4 ? 'high' : 'medium',
      `Relationship Analysis: ${totalNodes} types, ${totalEdges} relationships, ${circularCount} circular`,
      'project',
      this.generateSummarySnippet(totalNodes, totalEdges, avgComplexity, maxComplexity, circularCount, deepInheritanceCount),
      circularCount > 0 ? 'Resolve circular dependencies immediately' :
      avgComplexity > 4 ? 'Simplify type relationships to reduce complexity' :
      'Type relationship architecture is acceptable',
      'relationship-summary',
      1,
      this.generateDetailedReport(avgComplexity, maxComplexity, circularCount, deepInheritanceCount)
    ));

    return corrections;
  }

  // === Utility Methods ===

  private validateTypeArgument(parentType: string, param: TypeParameter): boolean {
    // Check if the type argument satisfies the constraint
    const constraint = param.constraint;
    if (!constraint) return true;

    // Simple validation - in production, resolve actual types
    const typeArgMatch = parentType.match(/<([^>]+)>/)?.[1];
    if (!typeArgMatch) return true;

    return typeArgMatch.includes(param.name) || constraint.includes('extends');
  }

  private extractGenericDeclaration(node: RelationshipNode): string {
    if (node.typeParameters.length === 0) {
      return `${node.type} ${node.name}`;
    }

    const params = node.typeParameters.map(p => 
      `${p.name}${p.constraint ? ` extends ${p.constraint}` : ''}${p.default ? ` = ${p.default}` : ''}`
    ).join(', ');

    return `${node.type} ${node.name}<${params}>`;
  }

  private generateComplexityDetails(node: RelationshipNode): string {
    let details = `${node.name} complexity breakdown:\n`;
    details += `• Type parameters: ${node.typeParameters.length} × 2 = ${node.typeParameters.length * 2}\n`;
    
    node.typeParameters.forEach((param, i) => {
      if (param.constraint) details += `• Constraint ${i}: +1\n`;
      if (param.default) details += `• Default ${i}: +1\n`;
    });
    
    details += `• Extends clauses: ${node.extends.length} × 1.5 = ${node.extends.length * 1.5}\n`;
    if (node.extends.length > 2) details += `• Multi-extends bonus: +2\n`;
    
    if (node.circular) details += `• Circular reference: ×2 multiplier\n`;
    
    details += `Total score: ${node.complexityScore}\n`;
    details += `Risk level: ${node.complexityScore >= 6 ? 'HIGH' : node.complexityScore >= 4 ? 'MEDIUM' : 'LOW'}`;
    
    return details;
  }

  private generateSummarySnippet(
    totalNodes: number, 
    totalEdges: number, 
    avgComplexity: number,
    maxComplexity: number, 
    circularCount: number,
    deepInheritanceCount: number
  ): string {
    return `// Relationship Summary:
// Total types: ${totalNodes}
// Total relationships: ${totalEdges}
// Average complexity: ${avgComplexity.toFixed(1)}
// Maximum complexity: ${maxComplexity}
// Circular dependencies: ${circularCount} ${circularCount > 0 ? '🚨' : '✅'}
// Deep inheritance (4+ levels): ${deepInheritanceCount}
// Complexity threshold: ${this.complexityThreshold}`;
  }

  private generateDetailedReport(
    avgComplexity: number,
    maxComplexity: number,
    circularCount: number,
    deepInheritanceCount: number
  ): string {
    let report = `Detailed Relationship Analysis:\n\n`;
    
    if (circularCount > 0) {
      report += `🚨 CRITICAL: Found ${circularCount} circular dependencies.\n`;
      report += `   Impact: Type resolution errors, slower compilation, potential runtime issues.\n`;
      report += `   Action: Run 'pnpm fix:relationships --pattern circular' to see fixes.\n\n`;
    }
    
    if (maxComplexity > 6) {
      report += `⚠️  High complexity types detected (score > 6).\n`;
      report += `   Action: Simplify generics with 'pnpm fix:relationships --simplify'\n\n`;
    }
    
    if (avgComplexity > 4) {
      report += `⚠️  Above-average complexity (${avgComplexity.toFixed(1)}).\n`;
      report += `   Consider reviewing generic constraints and inheritance patterns.\n\n`;
    }
    
    if (deepInheritanceCount > 0) {
      report += `⚠️  Deep inheritance detected: ${deepInheritanceCount} types with 4+ levels.\n`;
      report += `   Recommendation: Favor composition over deep inheritance.\n\n`;
    }
    
    if (circularCount === 0 && maxComplexity <= 6 && avgComplexity <= 4) {
      report += `✅ Relationship architecture is healthy.\n`;
      report += `   Minor optimizations possible but no critical issues.\n`;
    }
    
    return report;
  }

  // BaseAnalyzer utilities
  private extractCodeSnippet(content: string, pattern: RegExp | string, contextLines: number = 2): string {
    const lines = content.split('\n');
    const searchPattern = pattern instanceof RegExp ? pattern : new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const matchIndex = lines.findIndex(line => searchPattern.test(line));
    
    if (matchIndex === -1) return '// Pattern not found';
    
    const start = Math.max(0, matchIndex - contextLines);
    const end = Math.min(lines.length, matchIndex + contextLines + 1);
    
    return lines.slice(start, end).join('\n');
  }

  private getLineNumber(file: string, search: string): number {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      const index = lines.findIndex(line => line.includes(search));
      return index === -1 ? 1 : index + 1;
    } catch {
      return 1;
    }
  }

  private hashPath(path: string): string {
    return Buffer.from(path).toString('base64').slice(0, 10);
  }
}

// Export types for integration
export type { RelationshipNode, RelationshipGraph, TypeParameter };