// src/app/error-analyzer/ErrorFixManager.ts
import { CircularDependencyResolver } from '@/core/error-analyzer/CircularDependencyResolver';
import { FixConfidenceCalculator } from '@/core/error-analyzer/FixConfidenceCalculator';
import { FixPrioritizer } from '@/core/error-analyzer/FixPrioritizer';
import { FixVerifier } from '@/core/error-analyzer/FixVerifier';
import { ImportSuggestionGenerator } from '@/core/error-analyzer/ImportSuggestionGenerator';
import { ProgressTracker } from '@/core/error-analyzer/ProgressTracker';
import { ReportGenerator } from '@/core/error-analyzer/ReportGenerator';
import { TypeRelationshipAnalyzer } from '@/core/error-analyzer/TypeRelationshipAnalyzer';
import { RelationshipMap } from '@/core/error-analyzer/types/ErrorAnalysisTypes';
import { TypeScriptErrorAnalyzer } from '@/core/error-analyzer/TypeScriptErrorAnalyzer';

export interface TSCompilerError {
  resource: string;
  owner: string;
  code: string;
  severity: number;
  message: string;
  source: string;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  relatedInformation?: Array<{
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    message: string;
    resource: string;
  }>;
  origin?: string;
}

export interface FixPlan {
  id: string;
  error: TSCompilerError;
  fixType: 'missing_import' | 'type_mismatch' | 'missing_property' | 'circular_dependency' | 'method_redefinition';
  confidence: number; // 0-100
  priority: 'critical' | 'high' | 'medium' | 'low';
  suggestedFix: string;
  affectedFiles: string[];
  validationRules: string[];
  requiresManualReview: boolean;
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
    errors: any[],
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
        error: any,
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
        const requiresManualReview = confidenceScore < 70 || fixType === 'circular_dependency';

        return {
            id: `${error.resource}-${error.startLineNumber}-${error.code}`,
            error,
            fixType,
            confidence: confidenceScore, // Use the total score here
            priority: this.determinePriority(error, confidenceScore),
            suggestedFix,
            affectedFiles,
            validationRules,
            requiresManualReview
        };
    }

  private determineFixType(error: any): FixPlan['fixType'] {
    switch (error.code) {
      case '2304': // Cannot find name
        return 'missing_import';
      case '2322': // Type mismatch
        return 'type_mismatch';
      case '2741': // Missing property
        return 'missing_property';
      case '2321': // Excessive stack depth (circular)
        return 'circular_dependency';
      default:
        return 'type_mismatch';
    }
  }

  private determinePriority(error: any, confidence: number): FixPlan['priority'] {
    if (error.code === '2304' && confidence > 80) {
      return 'high'; // Easy fixes for missing names
    }
    if (error.code === '2321') {
      return 'critical'; // Circular dependencies are critical
    }
    if (error.severity === 8) { // Error severity
      return 'high';
    }
    return confidence > 60 ? 'medium' : 'low';
  }

  private async getSuggestedFix(
    error: any,
    fixType: FixPlan['fixType'],
    relationshipMap: RelationshipMap
  ): Promise<string> {
    switch (fixType) {
      case 'missing_import':
        return this.importSuggester.suggestImport(error, relationshipMap);
      case 'type_mismatch':
        return this.suggestTypeFix(error, relationshipMap);
      case 'missing_property':
        return this.suggestPropertyFix(error, relationshipMap);
      case 'circular_dependency':
        return this.circularDependencyResolver.suggestFix(error, relationshipMap);
      default:
        return '// Manual fix required - analyze error pattern';
    }
  }

  private findAffectedFiles(error: any, relationshipMap: RelationshipMap): string[] {
    const affectedFiles = new Set<string>();
    affectedFiles.add(error.resource);

    // Find where this property/method is used elsewhere
    const errorText = error.message;
    const propertyMatch = errorText.match(/Cannot find name '(\w+)'/);
    
    if (propertyMatch) {
      const propertyName = propertyMatch[1];
      const usages = relationshipMap.propertyUsages.get(propertyName) || [];
      usages.forEach(usage => affectedFiles.add(usage.file));
    }

    return Array.from(affectedFiles);
  }

  private generateValidationRules(error: any, fixType: FixPlan['fixType']): string[] {
    const rules: string[] = [];
    
    rules.push(`Fix ${error.code}: ${error.message.substring(0, 100)}`);
    
    if (fixType === 'missing_import') {
      rules.push('Validate import path exists');
      rules.push('Check if module exports the required item');
      rules.push('Verify import statement syntax');
    }
    
    if (fixType === 'type_mismatch') {
      rules.push('Check type compatibility');
      rules.push('Verify function signatures match');
      rules.push('Ensure return types align');
    }
    
    return rules;
  }

  private async suggestTypeFix(error: any, relationshipMap: RelationshipMap): Promise<string> {
    const message = error.message;
    
    if (message.includes('is not assignable to type')) {
      const [actualType, expectedType] = this.extractTypesFromMessage(message);
      
      return `// Type mismatch fix:
// Actual: ${actualType}
// Expected: ${expectedType}

// Option 1: Update the actual type to match expected
// Option 2: Update the interface/type definition
// Option 3: Add type assertion with caution

// Recommended: Check related type definitions in:
${this.getRelatedTypeFiles(expectedType, relationshipMap).join('\n')}`;
    }
    
    return '// Analyze type mismatch and adjust types accordingly';
  }

  private async suggestPropertyFix(error: any, relationshipMap: RelationshipMap): Promise<string> {
    const message = error.message;
    const propertyMatch = message.match(/Property '(\w+)' is missing/);
    
    if (propertyMatch) {
      const propertyName = propertyMatch[1];
      const typeMatch = message.match(/in type '([^']+)'/);
      
      if (typeMatch) {
        const typeName = typeMatch[1];
        
        return `// Missing property fix:
// Property: ${propertyName}
// Required in type: ${typeName}

// Add to interface/type:
interface ${typeName} {
  ${propertyName}: /* appropriate type */;
  // ... existing properties
}

// Or update the object to include the property:
const obj: ${typeName} = {
  ${propertyName}: /* value */,
  // ... other properties
};`;
      }
    }
    
    return '// Add missing property to object or interface';
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