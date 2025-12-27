// src/app/error-analyzer/CircularDependencyResolver.ts

import { TSCompilerError, FixPlan } from '@/app/error-analyzer/ErrorFixManager';
import { CircularBreakStrategy } from '@/app/error-analyzer/index';
import { RelationshipMap } from'@/app/error-analyzer/types/ErrorAnalysisTypes'
import fs from 'fs';
import path from 'path';

interface PropertyUsage {
  context: string;
  // Add other properties as needed
  propertyName?: string;
  type?: string;
  location?: string;
}

export class CircularDependencyResolver {
  private detectedCycles: Set<string>[] = [];
  private resolutionStrategies: CircularBreakStrategy[];

  constructor() {
    this.resolutionStrategies = this.buildResolutionStrategies();
  }

  async detectCircularDependencies(
    errors: TSCompilerError[],
    relationshipMap: RelationshipMap
  ): Promise<string[][]> {
    const cycles: string[][] = [];
    
    // Extract cycles from "Excessive stack depth" errors
    const circularErrors = errors.filter(e => 
      e.message.includes('Excessive stack depth')
    );
    
    for (const error of circularErrors) {
      const cycle = this.extractCycleFromError(error);
      if (cycle.length > 0) {
        cycles.push(cycle);
        this.detectedCycles.push(new Set(cycle));
      }
    }
    
    // Also detect cycles from type dependencies
    const typeCycles = this.detectTypeCycles(relationshipMap.typeDependencies);
    cycles.push(...typeCycles);
    
    return cycles;
  }

  async suggestFix(error: TSCompilerError, relationshipMap: RelationshipMap): Promise<string> {
    const cycles = await this.detectCircularDependencies([error], relationshipMap);
    
    if (cycles.length === 0) {
      return '// No circular dependency detected in this error';
    }
    
    const cycle = cycles[0]; // Take first cycle
    const strategies = this.findApplicableStrategies(cycle, relationshipMap);
    
    if (strategies.length === 0) {
      return this.generateGenericFix(cycle);
    }
    
    // Use the highest confidence strategy
    const bestStrategy = strategies.reduce((best, current) => 
      current.confidenceScore > best.confidenceScore ? current : best
    );
    
    return this.generateStrategyFix(bestStrategy, cycle);
  }

  async resolveCircularDependencies(
    fixPlans: FixPlan[],
    relationshipMap: RelationshipMap
  ): Promise<FixPlan[]> {
    const updatedPlans: FixPlan[] = [];
    
    for (const plan of fixPlans) {
      if (plan.fixType === 'circular_dependency') {
        const resolvedPlan = await this.resolveSingleCircularDependency(plan, relationshipMap);
        updatedPlans.push(resolvedPlan);
      } else {
        updatedPlans.push(plan);
      }
    }
    
    return updatedPlans;
  }

  private extractCycleFromError(error: TSCompilerError): string[] {
    const message = error.message;
    const cycle: string[] = [];
    
    // Try to extract type names from error message
    // Pattern: "Excessive stack depth comparing types 'TypeA<...>' and 'TypeB<...>'"
    const typePattern = /'([^<>]+)(?:<[^>]+>)?'/g;
    let match;
    
    while ((match = typePattern.exec(message)) !== null) {
      const typeName = match[1].trim();
      if (typeName && !cycle.includes(typeName)) {
        cycle.push(typeName);
      }
    }
    
    return cycle;
  }

  private detectTypeCycles(typeDependencies: Map<string, string[]>): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const dfs = (type: string, path: string[]): void => {
      if (recursionStack.has(type)) {
        // Found a cycle
        const startIndex = path.indexOf(type);
        if (startIndex !== -1) {
          const cycle = path.slice(startIndex);
          if (cycle.length > 1) {
            cycles.push([...cycle]);
          }
        }
        return;
      }
      
      if (visited.has(type)) {
        return;
      }
      
      visited.add(type);
      recursionStack.add(type);
      path.push(type);
      
      const dependencies = typeDependencies.get(type) || [];
      for (const dep of dependencies) {
        dfs(dep, path);
      }
      
      recursionStack.delete(type);
      path.pop();
    };
    
    for (const type of typeDependencies.keys()) {
      if (!visited.has(type)) {
        dfs(type, []);
      }
    }
    
    return cycles;
  }

  private findApplicableStrategies(
    cycle: string[],
    relationshipMap: RelationshipMap
  ): CircularBreakStrategy[] {
    const applicable: CircularBreakStrategy[] = [];
    
    for (const strategy of this.resolutionStrategies) {
      if (this.isStrategyApplicable(strategy, cycle, relationshipMap)) {
        applicable.push(strategy);
      }
    }
    
    return applicable;
  }

  private isStrategyApplicable(
    strategy: CircularBreakStrategy,
    cycle: string[],
    relationshipMap: RelationshipMap
  ): boolean {
    // Check if cycle matches strategy patterns
    for (const pattern of strategy.applicability) {
      if (pattern === 'interface_cycle' && this.isInterfaceCycle(cycle, relationshipMap)) {
        return true;
      }
      
      if (pattern === 'generic_cycle' && this.isGenericCycle(cycle)) {
        return true;
      }
      
      if (pattern === 'inheritance_cycle' && this.isInheritanceCycle(cycle, relationshipMap)) {
        return true;
      }
    }
    
    return false;
  }

  private isInterfaceCycle(cycle: string[], relationshipMap: RelationshipMap): boolean {
    return cycle.some(type => {
      const usages = relationshipMap.propertyUsages.get(type) || [];
      return usages.some((usage: PropertyUsage) => usage.context.includes('interface')); // ✅ ADD TYPE
    });
  }

  private isGenericCycle(cycle: string[]): boolean {
    // Check if any type in cycle uses generics
    return cycle.some(type => type.includes('<'));
  }

  private isInheritanceCycle(cycle: string[], relationshipMap: RelationshipMap): boolean {
    // Simplified check - in production, analyze extends/implements
    return cycle.length >= 3; // Inheritance cycles often involve multiple types
  }

  private generateGenericFix(cycle: string[]): string {
    const lines: string[] = [];
    
    lines.push('// Circular Dependency Fix');
    lines.push(`// Cycle detected: ${cycle.join(' -> ')}`);
    lines.push('');
    lines.push('// Common resolution strategies:');
    lines.push('// 1. Use type aliases instead of interfaces for one side');
    lines.push('// 2. Extract common properties to a base interface');
    lines.push('// 3. Use generics with constraints');
    lines.push('// 4. Use conditional types');
    lines.push('');
    lines.push('// Example: Break the cycle using type alias');
    lines.push(`type ${cycle[0]}Alias = Omit<${cycle[0]}, '${this.suggestPropertyToRemove(cycle[0])}'>;`);
    lines.push(`interface ${cycle[0]} {`);
    lines.push(`  // ... properties except circular reference`);
    lines.push(`}`);
    lines.push('');
    lines.push('// Then update references to use the alias where appropriate');
    
    return lines.join('\n');
  }

  private generateStrategyFix(strategy: CircularBreakStrategy, cycle: string[]): string {
    const lines: string[] = [];
    
    lines.push(`// ${strategy.name}`);
    lines.push(`// ${strategy.description}`);
    lines.push(`// Confidence: ${strategy.confidenceScore}%`);
    lines.push('');
    lines.push(`// Cycle: ${cycle.join(' -> ')}`);
    lines.push('');
    
    lines.push('// Implementation Steps:');
    for (let i = 0; i < strategy.implementationSteps.length; i++) {
      lines.push(`// ${i + 1}. ${strategy.implementationSteps[i]}`);
    }
    lines.push('');
    
    lines.push('// Code Fix:');
    switch (strategy.type) {
      case 'circular_break':
        lines.push(...this.generateCircularBreakCode(strategy, cycle));
        break;
      default:
        lines.push(...this.generateGenericFix(cycle).split('\n'));
    }
    
    lines.push('');
    lines.push('// Validation Checks:');
    for (const check of strategy.validationChecks) {
      lines.push(`// ✓ ${check}`);
    }
    
    lines.push('');
    lines.push('// Risks:');
    for (const risk of strategy.risks) {
      lines.push(`// ⚠️  ${risk}`);
    }
    
    return lines.join('\n');
  }

  private generateCircularBreakCode(strategy: CircularBreakStrategy, cycle: string[]): string[] {
    const lines: string[] = [];
    
    // Example implementation for breaking at first suggested point
    if (strategy.breakPoints.length > 0 && strategy.replacementTypes.length > 0) {
      const breakPoint = strategy.breakPoints[0];
      const replacement = strategy.replacementTypes[0];
      
      lines.push(`// Break at: ${breakPoint}`);
      lines.push(`// Replace with: ${replacement}`);
      lines.push('');
      
      lines.push(`// Before (circular):`);
      lines.push(`interface ${breakPoint} {`);
      lines.push(`  reference: ${cycle.find(t => t !== breakPoint)}; // Circular reference`);
      lines.push(`}`);
      lines.push('');
      
      lines.push(`// After (broken):`);
      lines.push(`type ${replacement} = {`);
      lines.push(`  reference: ${cycle.find(t => t !== breakPoint)}; // Now non-circular`);
      lines.push(`};`);
      lines.push('');
      
      lines.push(`// Update ${breakPoint} to use the type alias:`);
      lines.push(`interface ${breakPoint} {`);
      lines.push(`  reference: ${replacement};`);
      lines.push(`}`);
    }
    
    return lines;
  }

  private suggestPropertyToRemove(typeName: string): string {
    // Suggest a property that might be causing the circular reference
    const commonProperties = ['parent', 'children', 'reference', 'next', 'prev', 'owner'];
    return commonProperties.find(prop => 
      prop.length <= typeName.length
    ) || 'reference';
  }

  private buildResolutionStrategies(): CircularBreakStrategy[] {
    return [
      {
        type: 'circular_break',
        name: 'Interface to Type Alias Conversion',
        description: 'Convert one interface in the cycle to a type alias',
        applicability: ['interface_cycle'],
        confidenceScore: 85,
        implementationSteps: [
          'Identify the least complex interface in the cycle',
          'Convert it to a type alias using the same properties',
          'Update all references to use the type alias',
          'Verify no functionality is broken'
        ],
        validationChecks: [
          'Type alias maintains all necessary properties',
          'All usages compile correctly',
          'No runtime behavior changes'
        ],
        risks: ['May lose interface merging capabilities', 'Could affect type inference'],
        cycle: [],
        breakPoints: [],
        replacementTypes: []
      },
      {
        type: 'circular_break',
        name: 'Base Interface Extraction',
        description: 'Extract common properties to a base interface',
        applicability: ['interface_cycle', 'inheritance_cycle'],
        confidenceScore: 80,
        implementationSteps: [
          'Identify properties common to all types in cycle',
          'Create a base interface with these properties',
          'Make all types extend the base interface',
          'Remove circular references by using base interface'
        ],
        validationChecks: [
          'Base interface contains only shared properties',
          'All types correctly extend base interface',
          'Circular reference is eliminated'
        ],
        risks: ['May create overly broad base type', 'Could affect existing type guards'],
        cycle: [],
        breakPoints: [],
        replacementTypes: []
      },
      {
        type: 'circular_break',
        name: 'Generic Parameter Restructuring',
        description: 'Restructure generic parameters to break the cycle',
        applicability: ['generic_cycle'],
        confidenceScore: 75,
        implementationSteps: [
          'Analyze generic parameter dependencies',
          'Introduce intermediate generic type',
          'Restructure type parameters to remove direct circular dependency',
          'Update all generic instantiations'
        ],
        validationChecks: [
          'Generic constraints are preserved',
          'Type inference still works',
          'All usages compile with updated generics'
        ],
        risks: ['May increase type complexity', 'Could affect type inference in complex cases'],
        cycle: [],
        breakPoints: [],
        replacementTypes: []
      },
      {
        type: 'circular_break',
        name: 'Conditional Type Resolution',
        description: 'Use conditional types to resolve circular dependencies',
        applicability: ['generic_cycle', 'interface_cycle'],
        confidenceScore: 70,
        implementationSteps: [
          'Identify the circular reference point',
          'Create conditional type that resolves differently based on context',
          'Replace circular reference with conditional type',
          'Test with different type parameters'
        ],
        validationChecks: [
          'Conditional type resolves correctly in all cases',
          'No infinite type recursion',
          'Type safety is maintained'
        ],
        risks: ['Conditional types can be complex', 'May affect IDE type hints'],
        cycle: [],
        breakPoints: [],
        replacementTypes: []
      }
    ];
  }

  private async resolveSingleCircularDependency(
    plan: FixPlan,
    relationshipMap: RelationshipMap
  ): Promise<FixPlan> {
    const cycles = await this.detectCircularDependencies([plan.error], relationshipMap);
    
    if (cycles.length === 0) {
      return plan; // No cycle found, keep original plan
    }
    
    const cycle = cycles[0];
    const strategies = this.findApplicableStrategies(cycle, relationshipMap);
    
    if (strategies.length > 0) {
      const bestStrategy = strategies.reduce((best, current) => 
        current.confidenceScore > best.confidenceScore ? current : best
      );
      
      // Update fix plan with strategy-specific fix
      return {
        ...plan,
        suggestedFix: this.generateStrategyFix(bestStrategy, cycle),
        confidence: Math.min(100, plan.confidence + bestStrategy.confidenceScore * 0.5)
      };
    }
    
    return plan;
  }

  generateCycleReport(cycles: string[][]): string {
    const lines: string[] = [];
    
    lines.push('# Circular Dependency Analysis');
    lines.push('');
    lines.push(`**Total Cycles Detected:** ${cycles.length}`);
    lines.push('');
    
    if (cycles.length === 0) {
      lines.push('✅ No circular dependencies detected!');
      return lines.join('\n');
    }
    
    for (let i = 0; i < cycles.length; i++) {
      const cycle = cycles[i];
      lines.push(`## Cycle ${i + 1}`);
      lines.push('');
      lines.push('```typescript');
      lines.push(`// ${cycle.join(' → ')} → ${cycle[0]} // Completes the cycle`);
      lines.push('```');
      lines.push('');
      
      lines.push('**Suggested Break Points:**');
      const breakPoints = this.suggestBreakPoints(cycle);
      for (const point of breakPoints) {
        lines.push(`- ${point.type}: ${point.reason}`);
      }
      lines.push('');
    }
    
    lines.push('## Resolution Priority');
    lines.push('');
    lines.push('1. **Shortest cycles first** - Usually easier to fix');
    lines.push('2. **Interface cycles** - Can use type aliases');
    lines.push('3. **Generic cycles** - May require restructuring');
    lines.push('4. **Complex inheritance cycles** - May require architectural changes');
    lines.push('');
    
    return lines.join('\n');
  }

  private suggestBreakPoints(cycle: string[]): Array<{type: string, reason: string}> {
    const suggestions: Array<{type: string, reason: string}> = [];
    
    for (const type of cycle) {
      if (type.includes('Props')) {
        suggestions.push({
          type,
          reason: 'Props interface - consider making it a type alias'
        });
      } else if (type.includes('State')) {
        suggestions.push({
          type,
          reason: 'State type - consider using simpler representation'
        });
      } else if (type.length < 15) {
        suggestions.push({
          type,
          reason: 'Simple type - good candidate for conversion'
        });
      }
    }
    
    // If no specific suggestions, use the shortest type name
    if (suggestions.length === 0 && cycle.length > 0) {
      const shortest = cycle.reduce((a, b) => a.length < b.length ? a : b);
      suggestions.push({
        type: shortest,
        reason: 'Shortest type name - minimal impact when changed'
      });
    }
    
    return suggestions;
  }
}