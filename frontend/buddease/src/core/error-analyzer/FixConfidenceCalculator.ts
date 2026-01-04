// src/app/error-analyzer/FixConfidenceCalculator.ts

import type { ConfidenceFactors, FixPlan, TSCompilerError } from '@/core/error-analyzer/index';
import type { RelationshipMap } from '@/core/error-analyzer/types/ErrorAnalysisTypes';
import { getUsageData, analyzeTypeContext, isMethodUsage } from '@/core/generators/corrections/analyzers/UsageAnalyzer'

export class FixConfidenceCalculator {
  private readonly confidenceThresholds = {
    autoApply: 85,
    suggestApply: 70,
    manualReview: 0
  };

  calculateConfidence(error: TSCompilerError, relationshipMap: RelationshipMap): ConfidenceFactors {
    const factors: ConfidenceFactors = {
      patternMatch: 0,
      contextClarity: 0,
      relationshipComplexity: 0,
      fixClarity: 0,
      validationEase: 0,
      total: 0
    };

    // Calculate pattern match score (0-30)
    factors.patternMatch = this.calculatePatternMatchScore(error);
    
    // Calculate context clarity score (0-25)
    factors.contextClarity = this.calculateContextClarityScore(error, relationshipMap);
    
    // Calculate relationship complexity score (0-20, inverted)
    factors.relationshipComplexity = this.calculateRelationshipComplexityScore(error, relationshipMap);
    
    // Calculate fix clarity score (0-15)
    factors.fixClarity = this.calculateFixClarityScore(error);
    
    // Calculate validation ease score (0-10)
    factors.validationEase = this.calculateValidationEaseScore(error);
    
    // Calculate total
    factors.total = factors.patternMatch + factors.contextClarity + 
                   (20 - factors.relationshipComplexity) + // Invert complexity
                   factors.fixClarity + factors.validationEase;
    
    return factors;
  }

  calculateForFixPlan(plan: FixPlan, relationshipMap: RelationshipMap): number {
    const factors = this.calculateConfidence(plan.error, relationshipMap);
    
    // Adjust based on fix plan specifics
    let adjustedConfidence = factors.total;
    
    // Adjust for fix type
    adjustedConfidence *= this.getFixTypeMultiplier(plan.fixType);
    
    // Adjust for affected files
    if (plan.affectedFiles.length > 3) {
      adjustedConfidence *= 0.9; // Slightly reduce confidence for many affected files
    }
    
    // Adjust for validation rules
    if (plan.validationRules.length > 0) {
      adjustedConfidence += plan.validationRules.length * 2; // More validation = higher confidence
    }
    
    // Cap at 100
    return Math.min(100, Math.max(0, Math.round(adjustedConfidence)));
  }

  shouldAutoApply(confidence: number): boolean {
    return confidence >= this.confidenceThresholds.autoApply;
  }

  shouldSuggestApply(confidence: number): boolean {
    return confidence >= this.confidenceThresholds.suggestApply && 
           confidence < this.confidenceThresholds.autoApply;
  }

  requiresManualReview(confidence: number): boolean {
    return confidence < this.confidenceThresholds.suggestApply;
  }

  getConfidenceLevel(confidence: number): string {
    if (confidence >= 90) return 'very-high';
    if (confidence >= 80) return 'high';
    if (confidence >= 70) return 'medium-high';
    if (confidence >= 60) return 'medium';
    if (confidence >= 50) return 'medium-low';
    if (confidence >= 40) return 'low';
    return 'very-low';
  }

  private calculatePatternMatchScore(error: TSCompilerError): number {
    const message = error.message;
    let score = 15; // Base score
    
    // Clear patterns get higher scores
    if (message.includes("Cannot find name '")) {
      const identifier = message.match(/Cannot find name '([^']+)'/)?.[1];
      if (identifier && this.isValidIdentifier(identifier)) {
        score += 10;
      }
    }
    
    if (message.includes("Property '") && message.includes("is missing")) {
      score += 8;
    }
    
    if (message.includes("is not assignable to type")) {
      score += 7;
    }
    
    if (message.includes("Excessive stack depth")) {
      score -= 5; // Complex pattern
    }
    
    // Ambiguous patterns get lower scores
    if (message.includes("implicitly has type")) {
      score -= 3;
    }
    
    return Math.max(0, Math.min(30, score));
  }

  private calculateContextClarityScore(error: TSCompilerError, relationshipMap: RelationshipMap): number {
    let score = 10; // Base score
    
    const file = error.resource;
    const line = error.startLineNumber;
    
    // Check for related information
    if (error.relatedInformation && error.relatedInformation.length > 0) {
      score += 5;
    }
    
    // Check if identifier has clear usages
    const identifier = this.extractIdentifier(error.message);
    if (identifier) {
      const propertyUsages = relationshipMap.propertyUsages.get(identifier) || [];
      const methodUsages = relationshipMap.methodUsages.get(identifier) || [];
      const allUsages = [...propertyUsages, ...methodUsages];
      
      if (allUsages.length > 0) {
        score += 5;
        
        try {
          // Use the imported analyzeTypeContext function
          const { hasTypeContext } = analyzeTypeContext(allUsages);
          
          if (hasTypeContext) {
            score += 3;
          }
        } catch (error) {
          console.warn('Failed to analyze type context:', error);
        }
      }
    }
    
    // Check file dependencies
    const dependencies = relationshipMap.fileDependencies.get(file) || [];
    if (dependencies.length > 0) {
      score += 2;
    }
    
    return Math.max(0, Math.min(25, score));
  }

  private calculateRelationshipComplexityScore(error: TSCompilerError, relationshipMap: RelationshipMap): number {
    let complexity = 5; // Base complexity
    
    const file = error.resource;
    
    // File with many dependencies is more complex
    const fileDependencies = relationshipMap.fileDependencies.get(file) || [];
    complexity += Math.min(5, fileDependencies.length / 2);
    
    // Check for circular dependency errors
    if (error.message.includes("Excessive stack depth")) {
      complexity += 8;
    }
    
    // Complex type relationships
    if (error.message.includes("comparing types") && error.message.includes("and")) {
      complexity += 4;
    }
    
    // Check if error involves multiple types
    const typeMatches = error.message.match(/type '([^']+)'/g);
    if (typeMatches && typeMatches.length > 1) {
      complexity += 3;
    }
    
    // Generic types add complexity
    if (error.message.includes("<") && error.message.includes(">")) {
      complexity += 2;
    }
    
    return Math.max(0, Math.min(20, complexity));
  }

  private calculateFixClarityScore(error: TSCompilerError): number {
    let score = 5; // Base score
    
    const message = error.message;
    
    // Clear fixes get higher scores
    if (message.includes("Cannot find name")) {
      score += 6; // Usually just add import
    }
    
    if (message.includes("Property") && message.includes("is missing")) {
      score += 5; // Usually just add property
    }
    
    if (message.includes("is not assignable")) {
      score += 4; // Usually type adjustment
    }
    
    // Complex fixes get lower scores
    if (message.includes("Excessive stack depth")) {
      score -= 3; // Complex fix required
    }
    
    if (message.includes("implicitly has type")) {
      score -= 2; // May require type annotations
    }
    
    // Clear error codes
    const clearErrorCodes = ['2304', '2741', '2339'];
    if (clearErrorCodes.includes(error.code)) {
      score += 2;
    }
    
    return Math.max(0, Math.min(15, score));
  }

  private calculateValidationEaseScore(error: TSCompilerError): number {
    let score = 3; // Base score
    
    // Errors that are easy to validate
    if (error.code === '2304') { // Cannot find name
      score += 4; // Just check if identifier exists
    }
    
    if (error.code === '2741') { // Missing property
      score += 3; // Check if property exists in type
    }
    
    // Hard to validate errors
    if (error.code === '2321') { // Excessive stack depth
      score -= 2; // Complex validation
    }
    
    if (error.message.includes("implicitly has type")) {
      score += 1; // Type inference validation
    }
    
    // Has related information for validation
    if (error.relatedInformation && error.relatedInformation.length > 0) {
      score += 2;
    }
    
    return Math.max(0, Math.min(10, score));
  }

  private getFixTypeMultiplier(fixType: string): number {
    const multipliers: Record<string, number> = {
      'missing_import': 1.1, // Usually straightforward
      'missing_property': 1.05, // Usually straightforward
      'type_mismatch': 1.0, // Standard
      'method_redefinition': 0.95, // May have side effects
      'circular_dependency': 0.8 // Complex
    };
    
    return multipliers[fixType] || 1.0;
  }

  private extractIdentifier(message: string): string | null {
    const patterns = [
      /Cannot find name '([^']+)'/,
      /Property '([^']+)'/,
      /'([^']+)' is not assignable/,
      /implicitly has type '([^']+)'/
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  private isValidIdentifier(identifier: string): boolean {
    // Basic identifier validation
    if (!identifier || identifier.length === 0) return false;
    
    // Check for common valid patterns
    const validPattern = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
    if (!validPattern.test(identifier)) return false;
    
    // Check for TypeScript keywords
    const keywords = [
      'any', 'unknown', 'never', 'void', 'null', 'undefined',
      'number', 'string', 'boolean', 'symbol', 'object'
    ];
    
    return !keywords.includes(identifier.toLowerCase());
  }

  generateConfidenceReport(factors: ConfidenceFactors, plan: FixPlan): string {
    const lines: string[] = [];
    
    lines.push('# Confidence Analysis');
    lines.push('');
    lines.push(`**Total Confidence:** ${factors.total.toFixed(1)}%`);
    lines.push(`**Level:** ${this.getConfidenceLevel(factors.total)}`);
    lines.push('');
    
    lines.push('## Factor Breakdown');
    lines.push('');
    lines.push('| Factor | Score | Max | % |');
    lines.push('|--------|-------|-----|---|');
    lines.push(`| Pattern Match | ${factors.patternMatch.toFixed(1)} | 30 | ${((factors.patternMatch/30)*100).toFixed(0)}% |`);
    lines.push(`| Context Clarity | ${factors.contextClarity.toFixed(1)} | 25 | ${((factors.contextClarity/25)*100).toFixed(0)}% |`);
    lines.push(`| Relationship Complexity | ${factors.relationshipComplexity.toFixed(1)} | 20 | ${((factors.relationshipComplexity/20)*100).toFixed(0)}% |`);
    lines.push(`| Fix Clarity | ${factors.fixClarity.toFixed(1)} | 15 | ${((factors.fixClarity/15)*100).toFixed(0)}% |`);
    lines.push(`| Validation Ease | ${factors.validationEase.toFixed(1)} | 10 | ${((factors.validationEase/10)*100).toFixed(0)}% |`);
    lines.push('');
    
    lines.push('## Recommendations');
    lines.push('');
    
    if (this.shouldAutoApply(factors.total)) {
      lines.push('🟢 **Auto-apply recommended** - High confidence fix');
    } else if (this.shouldSuggestApply(factors.total)) {
      lines.push('🟡 **Suggested fix** - Good confidence, review suggested');
    } else {
      lines.push('🔴 **Manual review required** - Low confidence fix');
    }
    
    lines.push('');
    lines.push('### Areas for Improvement:');
    
    if (factors.patternMatch < 15) {
      lines.push('- Error pattern is ambiguous');
    }
    
    if (factors.contextClarity < 12) {
      lines.push('- Context is unclear');
    }
    
    if (factors.relationshipComplexity > 10) {
      lines.push('- Complex relationships involved');
    }
    
    if (factors.fixClarity < 8) {
      lines.push('- Fix approach is unclear');
    }
    
    return lines.join('\n');
  }
}
