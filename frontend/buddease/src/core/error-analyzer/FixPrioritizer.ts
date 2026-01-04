// src/app/error-analyzer/FixPrioritizer.ts

import type { FixPlan } from '@/core/error-analyzer/ErrorFixManager';
import type { FixPrioritizationRule, PrioritizationContext } from '@/core/error-analyzer/index';

export class FixPrioritizer {
  private prioritizationRules: FixPrioritizationRule[];
  private context: PrioritizationContext;

  constructor(context?: Partial<PrioritizationContext>) {
    this.context = this.buildContext(context);
    this.prioritizationRules = this.buildPrioritizationRules();
  }

  prioritize(fixPlans: FixPlan[]): FixPlan[] {
    if (fixPlans.length === 0) return [];

    // Calculate priority score for each fix
    const scoredPlans = fixPlans.map(plan => ({
      plan,
      score: this.calculatePriorityScore(plan)
    }));

    // Sort by score (descending)
    scoredPlans.sort((a, b) => b.score - a.score);

    // Assign priority levels
    const prioritizedPlans = scoredPlans.map(({ plan }, index) => ({
      ...plan,
      priority: this.assignPriorityLevel(plan, index, scoredPlans.length)
    }));

    return prioritizedPlans;
  }

  prioritizeByFile(fixPlans: FixPlan[]): Map<string, FixPlan[]> {
    const prioritized = this.prioritize(fixPlans);
    const grouped = new Map<string, FixPlan[]>();

    for (const plan of prioritized) {
      const file = plan.error.resource;
      if (!grouped.has(file)) {
        grouped.set(file, []);
      }
      grouped.get(file)!.push(plan);
    }

    return grouped;
  }

  prioritizeByType(fixPlans: FixPlan[]): Map<string, FixPlan[]> {
    const prioritized = this.prioritize(fixPlans);
    const grouped = new Map<string, FixPlan[]>();

    for (const plan of prioritized) {
      const fixType = plan.fixType;
      if (!grouped.has(fixType)) {
        grouped.set(fixType, []);
      }
      grouped.get(fixType)!.push(plan);
    }

    return grouped;
  }

  prioritizeByConfidence(fixPlans: FixPlan[]): Map<string, FixPlan[]> {
    const prioritized = this.prioritize(fixPlans);
    const grouped = new Map<string, FixPlan[]>();

    for (const plan of prioritized) {
      let confidenceLevel: string;
      if (plan.confidence >= 80) {
        confidenceLevel = 'high';
      } else if (plan.confidence >= 60) {
        confidenceLevel = 'medium';
      } else {
        confidenceLevel = 'low';
      }

      if (!grouped.has(confidenceLevel)) {
        grouped.set(confidenceLevel, []);
      }
      grouped.get(confidenceLevel)!.push(plan);
    }

    return grouped;
  }

  generateFixOrder(fixPlans: FixPlan[], strategy: 'efficiency' | 'safety' | 'impact'): FixPlan[] {
    const prioritized = this.prioritize(fixPlans);

    switch (strategy) {
      case 'efficiency':
        // Fix easiest/highest confidence first
        return prioritized.sort((a, b) => b.confidence - a.confidence);
      
      case 'safety':
        // Fix by file to minimize context switching
        return this.groupByFileAndSort(prioritized);
      
      case 'impact':
        // Fix errors that block many other fixes first
        return this.sortByImpact(prioritized);
      
      default:
        return prioritized;
    }
  }

  private calculatePriorityScore(plan: FixPlan): number {
    let score = 0;

    // Apply each prioritization rule
    for (const rule of this.prioritizationRules) {
      if (rule.condition(plan)) {
        score += rule.weight;
      }
    }

    // Adjust based on confidence
    score += plan.confidence * 0.5;

    // Adjust based on relationship complexity
    const fileComplexity = this.context.fileComplexity.get(plan.error.resource) || 1;
    score -= (fileComplexity - 1) * 10; // Penalize complex files

    return Math.max(0, Math.min(100, score));
  }

  private assignPriorityLevel(plan: FixPlan, index: number, total: number): FixPlan['priority'] {
    const percentile = (index / total) * 100;

    if (percentile <= 20) return 'critical';
    if (percentile <= 50) return 'high';
    if (percentile <= 80) return 'medium';
    return 'low';
  }

  private buildContext(partialContext?: Partial<PrioritizationContext>): PrioritizationContext {
    return {
      fileComplexity: partialContext?.fileComplexity || new Map(),
      typeUsageFrequency: partialContext?.typeUsageFrequency || new Map(),
      errorDensity: partialContext?.errorDensity || new Map(),
      projectStructure: partialContext?.projectStructure || {}
    };
  }

  private buildPrioritizationRules(): FixPrioritizationRule[] {
    return [
      {
        name: 'critical_error_code',
        condition: (plan) => plan.error.code === '2321', // Excessive stack depth
        weight: 50,
        description: 'Circular dependencies are critical'
      },
      {
        name: 'high_severity',
        condition: (plan) => plan.error.severity === 8,
        weight: 30,
        description: 'High severity errors get priority'
      },
      {
        name: 'multiple_affected_files',
        condition: (plan) => plan.affectedFiles.length > 1,
        weight: 25,
        description: 'Fixes affecting multiple files are more important'
      },
      {
        name: 'blocking_import',
        condition: (plan) => plan.fixType === 'missing_import' && plan.confidence > 70,
        weight: 20,
        description: 'Missing imports often block compilation'
      },
      {
        name: 'common_pattern',
        condition: (plan) => {
          const commonPatterns = ['Cannot find name', 'Property.*is missing', 'is not assignable'];
          return commonPatterns.some(pattern => plan.error.message.includes(pattern));
        },
        weight: 15,
        description: 'Common patterns are easier to fix'
      },
      {
        name: 'low_complexity',
        condition: (plan) => {
          const message = plan.error.message;
          return message.length < 100 && !message.includes('Excessive stack depth');
        },
        weight: 10,
        description: 'Simple errors are quick wins'
      },
      {
        name: 'type_mismatch',
        condition: (plan) => plan.fixType === 'type_mismatch',
        weight: 5,
        description: 'Type mismatches are important but not critical'
      }
    ];
  }

  private groupByFileAndSort(plans: FixPlan[]): FixPlan[] {
    const grouped = new Map<string, FixPlan[]>();
    
    for (const plan of plans) {
      const file = plan.error.resource;
      if (!grouped.has(file)) {
        grouped.set(file, []);
      }
      grouped.get(file)!.push(plan);
    }

    // Sort files by number of errors (descending)
    const sortedFiles = Array.from(grouped.entries())
      .sort((a, b) => b[1].length - a[1].length);

    // Flatten back to array
    return sortedFiles.flatMap(([, filePlans]) => filePlans);
  }

  private sortByImpact(plans: FixPlan[]): FixPlan[] {
    // Calculate impact score based on affected files and confidence
    const scoredPlans = plans.map(plan => ({
      plan,
      impactScore: this.calculateImpactScore(plan)
    }));

    scoredPlans.sort((a, b) => b.impactScore - a.impactScore);
    return scoredPlans.map(({ plan }) => plan);
  }

  private calculateImpactScore(plan: FixPlan): number {
    let score = 0;
    
    // Base score from affected files
    score += plan.affectedFiles.length * 10;
    
    // Adjust for confidence
    score += plan.confidence * 0.3;
    
    // Adjust for error code impact
    const impactByCode: Record<string, number> = {
      '2321': 50, // Circular dependency
      '2304': 30, // Cannot find name
      '2741': 25, // Missing property
      '2322': 20, // Type mismatch
      '2503': 15, // Cannot find namespace
    };
    
    score += impactByCode[plan.error.code] || 10;
    
    return score;
  }

  generatePrioritizationReport(plans: FixPlan[]): string {
    const prioritized = this.prioritize(plans);
    
    const lines: string[] = [];
    lines.push('# Fix Prioritization Report');
    lines.push('');
    lines.push(`**Total Fixes:** ${prioritized.length}`);
    lines.push('');
    
    // Summary by priority
    const priorityCounts = new Map<string, number>();
    for (const plan of prioritized) {
      priorityCounts.set(plan.priority, (priorityCounts.get(plan.priority) || 0) + 1);
    }
    
    lines.push('## Priority Distribution');
    for (const [priority, count] of priorityCounts.entries()) {
      lines.push(`- **${priority}**: ${count} fixes`);
    }
    lines.push('');
    
    // Top 10 highest priority fixes
    const topFixes = prioritized.slice(0, 10);
    lines.push('## Top 10 Priority Fixes');
    lines.push('');
    
    for (let i = 0; i < topFixes.length; i++) {
      const plan = topFixes[i];
      lines.push(`### ${i + 1}. ${plan.error.message.substring(0, 80)}...`);
      lines.push(`**File:** ${plan.error.resource}`);
      lines.push(`**Line:** ${plan.error.startLineNumber}`);
      lines.push(`**Priority:** ${plan.priority}`);
      lines.push(`**Confidence:** ${plan.confidence}%`);
      lines.push('');
    }
    
    // Recommendations
    lines.push('## 💡 Fix Strategy Recommendations');
    lines.push('');
    
    const criticalCount = priorityCounts.get('critical') || 0;
    const highCount = priorityCounts.get('high') || 0;
    
    if (criticalCount > 0) {
      lines.push('🚨 **Start with critical fixes** - These are blocking issues:');
      lines.push(`   - ${criticalCount} critical fixes need immediate attention`);
      lines.push('');
    }
    
    if (highCount > 0) {
      lines.push('⚠️ **Then handle high priority fixes** - Important but not blocking:');
      lines.push(`   - ${highCount} high priority fixes should be addressed soon`);
      lines.push('');
    }
    
    lines.push('📋 **Recommended workflow:**');
    lines.push('1. Fix critical errors first');
    lines.push('2. Work file by file for efficiency');
    lines.push('3. Group related type fixes together');
    lines.push('4. Test after each major group of fixes');
    
    return lines.join('\n');
  }
}