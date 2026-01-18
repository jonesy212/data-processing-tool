// ErrorFixManager.ts
import { CircularDependencyResolver } from '@/core/error-analyzer/CircularDependencyResolver';
import { FixConfidenceCalculator } from '@/core/error-analyzer/FixConfidenceCalculator';
import { FixPrioritizer } from '@/core/error-analyzer/FixPrioritizer';
import { FixVerifier } from '@/core/error-analyzer/FixVerifier';
import { ImportSuggestionGenerator } from '@/core/error-analyzer/ImportSuggestionGenerator';
import { ProgressTracker } from '@/core/error-analyzer/ProgressTracker';
import { ReportGenerator } from '@/core/error-analyzer/ReportGenerator';
import { TypeRelationshipAnalyzer } from '@/core/error-analyzer/TypeRelationshipAnalyzer';
import type { 
  RelationshipMap, 
  TSCompilerError as SharedTSCompilerError,
  ConfidenceFactors,
  AnalyzedError
} from '@/core/error-analyzer/types/ErrorAnalysisTypes';
import type { FixStrategyTypeDef } from '@/core/error-analyzer/types/FixStrategyTypes';
import { TypeScriptErrorAnalyzer } from '@/core/error-analyzer/TypeScriptErrorAnalyzer';

export interface SharedConfidence {
  confidence: number; // 0-100
}

// Update FixPlan to use the unified FixStrategyTypeDef
export interface FixPlan extends SharedConfidence {
  id: string;
  error: TSCompilerError;
  fixType: FixStrategyTypeDef; // Updated to use unified type
  confidence: number; // 0-100
  priority: 'critical' | 'high' | 'medium' | 'low';
  suggestedFix: string;
  affectedFiles: string[];
  validationRules: string[];
  requiresManualReview: boolean;
  // Optional fields for compatibility
  complexity?: 'simple' | 'medium' | 'complex';
  confidenceFactors?: ConfidenceFactors;
}

export class ErrorFixManager {
  private errorAnalyzer: TypeScriptErrorAnalyzer;
  private relationshipAnalyzer: TypeRelationshipAnalyzer;
  private prioritizer: FixPrioritizer;
  private confidenceCalculator: FixConfidenceCalculator;
  private circularDependencyResolver: CircularDependencyResolver;
  private importSuggester: ImportSuggestionGenerator;
  private fixVerifier: FixVerifier;
  private progressTracker: ProgressTracker;
  private reportGenerator: ReportGenerator;

  constructor() {
    this.errorAnalyzer = new TypeScriptErrorAnalyzer();
    this.relationshipAnalyzer = new TypeRelationshipAnalyzer();
    this.prioritizer = new FixPrioritizer();
    this.confidenceCalculator = new FixConfidenceCalculator();
    this.circularDependencyResolver = new CircularDependencyResolver();
    this.importSuggester = new ImportSuggestionGenerator();
    this.fixVerifier = new FixVerifier();
    this.progressTracker = new ProgressTracker();
    this.reportGenerator = new ReportGenerator();
  }

  async analyzeAndFix(errors: TSCompilerError[]): Promise<void> {
    console.log('🔍 Starting TypeScript error analysis...');
    
    // Step 1: Analyze errors
    const analyzedErrors = await this.errorAnalyzer.analyzeErrors(errors);
    
    // Step 2: Build relationship map
    const relationshipMap = await this.relationshipAnalyzer.buildRelationshipMap(errors);
    
    // Step 3: Generate fix plans
    const fixPlans = await this.generateFixPlans(analyzedErrors, relationshipMap);
    
    // Step 4: Prioritize fixes
    const prioritizedPlans = this.prioritizer.prioritize(fixPlans);
    
    // Step 5: Verify fixes
    const verifiedPlans = await this.fixVerifier.verifyPlans(prioritizedPlans);
    
    // Step 6: Generate reports
    await this.reportGenerator.generateReports(verifiedPlans, relationshipMap);
    
    // Step 7: Track progress
    this.progressTracker.trackAnalysis(verifiedPlans);
    
    console.log('✅ Analysis complete!');
  }

  private async generateFixPlans(
    errors: AnalyzedError[],
    relationshipMap: RelationshipMap
  ): Promise<FixPlan[]> {
    const fixPlans: FixPlan[] = [];

    for (const error of errors) {
      const fixPlan = await this.createFixPlan(error, relationshipMap);
      fixPlans.push(fixPlan);
    }

    return fixPlans;
  }
    
  private async createFixPlan(
    error: AnalyzedError,
    relationshipMap: RelationshipMap
  ): Promise<FixPlan> {
    // Determine fix type based on error code
    const fixType = this.determineFixType(error);
    
    // Calculate confidence based on error pattern and relationships
    const confidenceFactors = this.confidenceCalculator.calculateConfidence(error, relationshipMap);
    const confidenceScore = confidenceFactors.total; // Get the total score
    
    // Get suggested fix
    const suggestedFix = await this.getSuggestedFix(error, fixType, relationshipMap);
    
    // Find affected files through relationships
    const affectedFiles = this.findAffectedFiles(error, relationshipMap);
    
    // Generate validation rules
    const validationRules = this.generateValidationRules(error, fixType);
    
    // Determine if manual review is needed
    const requiresManualReview = confidenceScore < 70 || fixType === 'circular_dependency' || fixType === 'circular_break';

    return {
      id: `${error.error.resource}-${error.error.startLineNumber}-${error.error.code}`,
      error: error.error,
      fixType,
      confidence: confidenceScore,
      priority: this.determinePriority(error, confidenceScore),
      suggestedFix,
      affectedFiles,
      validationRules,
      requiresManualReview,
      complexity: error.complexity,
      confidenceFactors: confidenceFactors
    };
  }

  private determineFixType(error: AnalyzedError): FixStrategyTypeDef {
    switch (error.error.code) {
      case '2304': // Cannot find name
        return 'missing_import';
      case '2322': // Type mismatch
        return 'type_mismatch';
      case '2741': // Missing property
        return 'missing_property';
      case '2321': // Excessive stack depth (circular)
      case '2452': // Circular constraint
        return 'circular_dependency';
      case '2420': // Class incorrectly implements interface
        return 'interface_update';
      case '2532': // Object is possibly undefined
        return 'null_check';
      default:
        // Map to new fix types if available
        if (error.pattern.includes('missing import')) {
          return 'missing_import';
        } else if (error.pattern.includes('type mismatch')) {
          return 'type_mismatch';
        } else if (error.pattern.includes('missing property')) {
          return 'missing_property';
        } else if (error.pattern.includes('circular')) {
          return 'circular_dependency';
        }
        return 'type_mismatch';
    }
  }

  private determinePriority(error: AnalyzedError, confidence: number): FixPlan['priority'] {
    if (error.error.code === '2304' && confidence > 80) {
      return 'high'; // Easy fixes for missing names
    }
    if (error.error.code === '2321' || error.error.code === '2452') {
      return 'critical'; // Circular dependencies are critical
    }
    if (error.error.severity === 8) { // Error severity
      return 'high';
    }
    
    // Use complexity from AnalyzedError if available
    if (error.complexity === 'complex') {
      return 'high';
    } else if (error.complexity === 'medium') {
      return 'medium';
    }
    
    return confidence > 60 ? 'medium' : 'low';
  }

  private async getSuggestedFix(
    error: AnalyzedError,
    fixType: FixStrategyTypeDef,
    relationshipMap: RelationshipMap
  ): Promise<string> {
    switch (fixType) {
      case 'missing_import':
      case 'import_fix':
        return this.importSuggester.suggestImport(error, relationshipMap);
      case 'type_mismatch':
      case 'type_alignment':
        return this.suggestTypeFix(error, relationshipMap);
      case 'missing_property':
      case 'property_addition':
        return this.suggestPropertyFix(error, relationshipMap);
      case 'circular_dependency':
      case 'circular_break':
        return this.circularDependencyResolver.suggestFix(error, relationshipMap);
      case 'null_check':
        return this.suggestNullCheckFix(error);
      case 'interface_update':
        return this.suggestInterfaceUpdateFix(error);
      default:
        return '// Manual fix required - analyze error pattern';
    }
  }

  private findAffectedFiles(error: AnalyzedError, relationshipMap: RelationshipMap): string[] {
    const affectedFiles = new Set<string>();
    affectedFiles.add(error.error.resource);

    // Find where this property/method is used elsewhere
    const errorText = error.error.message;
    const propertyMatch = errorText.match(/Cannot find name '(\w+)'/);
    
    if (propertyMatch) {
      const propertyName = propertyMatch[1];
      const usages = relationshipMap.propertyUsages.get(propertyName) || [];
      usages.forEach(usage => affectedFiles.add(usage.file));
    }

    // Check for missing identifier from AnalyzedError
    if (error.missingIdentifier) {
      const usages = relationshipMap.propertyUsages.get(error.missingIdentifier) || [];
      usages.forEach(usage => affectedFiles.add(usage.file));
    }

    return Array.from(affectedFiles);
  }

  private generateValidationRules(error: AnalyzedError, fixType: FixStrategyTypeDef): string[] {
    const rules: string[] = [];
    
    rules.push(`Fix ${error.error.code}: ${error.error.message.substring(0, 100)}`);
    
    if (fixType === 'missing_import' || fixType === 'import_fix') {
      rules.push('Validate import path exists');
      rules.push('Check if module exports the required item');
      rules.push('Verify import statement syntax');
    }
    
    if (fixType === 'type_mismatch' || fixType === 'type_alignment') {
      rules.push('Check type compatibility');
      rules.push('Verify function signatures match');
      rules.push('Ensure return types align');
    }
    
    if (fixType === 'circular_dependency' || fixType === 'circular_break') {
      rules.push('Identify the circular reference chain');
      rules.push('Break dependency without breaking functionality');
      rules.push('Test that the fix resolves the circular reference');
    }
    
    return rules;
  }

  private async suggestTypeFix(error: AnalyzedError, relationshipMap: RelationshipMap): Promise<string> {
    const message = error.error.message;
    
    if (message.includes('is not assignable to type')) {
      const [actualType, expectedType] = this.extractTypesFromMessage(message);
      
      return `// Type mismatch fix:
Actual: ${actualType}
Expected: ${expectedType}

Option 1: Update the actual type to match expected
Option 2: Update the interface/type definition
Option 3: Add type assertion with caution

Recommended: Check related type definitions in:
${this.getRelatedTypeFiles(expectedType, relationshipMap).join('\n')}`;
    }
    
    return '// Analyze type mismatch and adjust types accordingly';
  }

  private async suggestPropertyFix(error: AnalyzedError, relationshipMap: RelationshipMap): Promise<string> {
    const message = error.error.message;
    const propertyMatch = message.match(/Property '(\w+)' is missing/);
    
    if (propertyMatch) {
      const propertyName = propertyMatch[1];
      const typeMatch = message.match(/in type '([^']+)'/);
      
      if (typeMatch) {
        const typeName = typeMatch[1];
        
        return `// Missing property fix:
Property: ${propertyName}
Required in type: ${typeName}

Add to interface/type:
interface ${typeName} {
  ${propertyName}: /* appropriate type */;
  // ... existing properties
}

Or update the object to include the property:
const obj: ${typeName} = {
  ${propertyName}: /* value */,
  // ... other properties
};`;
      }
    }
    
    // Use missingIdentifier from AnalyzedError if available
    if (error.missingIdentifier && error.expectedType) {
      return `// Missing property fix:
Property: ${error.missingIdentifier}
Expected type: ${error.expectedType}

Add property to the appropriate interface or type definition.`;
    }
    
    return '// Add missing property to object or interface';
  }

  private suggestNullCheckFix(error: AnalyzedError): string {
    return `// Null check fix for: ${error.error.message}

Option 1: Add optional chaining
\`\`\`typescript
value?.property
\`\`\`

Option 2: Add null check
\`\`\`typescript
if (value !== null && value !== undefined) {
  // use value
}
\`\`\`

Option 3: Use nullish coalescing
\`\`\`typescript
const safeValue = value ?? defaultValue;
\`\`\``;
  }

  private suggestInterfaceUpdateFix(error: AnalyzedError): string {
    return `// Interface update fix for: ${error.error.message}

Check the interface implementation and ensure:
1. All required properties are implemented
2. Method signatures match exactly
3. Return types are compatible

Consider using \`implements\` keyword and updating the class accordingly:
\`\`\`typescript
class MyClass implements MyInterface {
  // Implement all required members
}
\`\`\``;
  }

  private extractTypesFromMessage(message: string): [string, string] {
    const typeMatch = message.match(/Type '([^']+)' is not assignable to type '([^']+)'/);
    if (typeMatch) {
      return [typeMatch[1], typeMatch[2]];
    }
    return ['unknown', 'unknown'];
  }

  private getRelatedTypeFiles(typeName: string, relationshipMap: RelationshipMap): string[] {
    const files: string[] = [];
    
    // Find files where this type is defined or used
    for (const [file, imports] of relationshipMap.fileDependencies.entries()) {
      if (imports.some(imp => imp.includes(typeName))) {
        files.push(`- ${file}`);
      }
    }
    
    return files.length > 0 ? files : ['- Search for type definition in project'];
  }
}

// Export helper functions
export async function analyzeTypeScriptErrors(errors: TSCompilerError[]): Promise<FixPlan[]> {
  const manager = new ErrorFixManager();
  await manager.analyzeAndFix(errors);
  
  // In a real implementation, you'd return the actual fix plans
  // For now, return a placeholder
  return errors.map(error => ({
    id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    error,
    fixType: 'type_mismatch',
    confidence: 0,
    priority: 'medium',
    suggestedFix: 'Analysis in progress',
    affectedFiles: [error.resource],
    validationRules: [],
    requiresManualReview: true
  }));
}

export async function generateFixReport(fixPlans: FixPlan[]): Promise<string> {
  const report: string[] = [];
  
  report.push('# TypeScript Error Fix Report');
  report.push(`**Generated:** ${new Date().toISOString()}`);
  report.push(`**Total Fix Plans:** ${fixPlans.length}`);
  report.push('');
  
  // Group by priority
  const byPriority = {
    critical: fixPlans.filter(p => p.priority === 'critical'),
    high: fixPlans.filter(p => p.priority === 'high'),
    medium: fixPlans.filter(p => p.priority === 'medium'),
    low: fixPlans.filter(p => p.priority === 'low')
  };
  
  report.push('## Priority Distribution:');
  report.push(`- Critical: ${byPriority.critical.length}`);
  report.push(`- High: ${byPriority.high.length}`);
  report.push(`- Medium: ${byPriority.medium.length}`);
  report.push(`- Low: ${byPriority.low.length}`);
  report.push('');
  
  // Most common fix types
  const fixTypeCounts = new Map<FixStrategyTypeDef, number>();
  fixPlans.forEach(plan => {
    fixTypeCounts.set(plan.fixType, (fixTypeCounts.get(plan.fixType) || 0) + 1);
  });
  
  report.push('## Fix Types Required:');
  for (const [fixType, count] of fixTypeCounts.entries()) {
    report.push(`- ${fixType}: ${count}`);
  }
  
  return report.join('\n');
}