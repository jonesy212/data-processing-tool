// src/app/error-analyzer/types/FixStrategyTypes.ts
import { FixPlan } from '@/app/error-analyzer/types/ErrorAnalysisTypes';
import { StrategyCore } from '@/app/error-analyzer/types/ErrorAnalysisTypes';

// Create a unified type that includes ALL fix types from both FixPlan and your new ones
export type FixStrategyTypeDef = 
  | 'missing_import'  
  | 'type_mismatch'
  | 'missing_property'   
  | 'circular_dependency'
  | 'method_redefinition'
  | 'import_fix'   
  | 'type_alignment'  
  | 'property_addition'  
  | 'circular_break'  
  | 'method_implementation'
  | 'interface_update'   
  | 'generic_constraint' 
  | 'type_guard'   
  | 'null_check'   
  | 'async_handling';    

// Update BaseFixStrategy to use the unified type
// In FixStrategyTypes.ts


// Base fix strategy with additional properties
export interface BaseFixStrategy extends StrategyCore {
  type: FixStrategyTypeDef;
  name: string;
  description: string;
  applicability: string[];
  confidenceScore: number;
  implementationSteps: string[];
  validationChecks: string[];
  risks: string[];
}

// Now create your specific strategy interfaces
export interface ImportFixStrategy extends BaseFixStrategy {
  type: 'import_fix' | 'missing_import'; // Include both possibilities
  importType: 'named' | 'default' | 'namespace';
  modulePath: string;
  importName: string;
  alternativePaths: string[];
}

export interface TypeAlignmentStrategy extends BaseFixStrategy {
  type: 'type_alignment' | 'type_mismatch'; // Include both possibilities
  sourceType: string;
  targetType: string;
  conversionRequired: boolean;
  typeMapping: Record<string, string>;
}

export interface PropertyAdditionStrategy extends BaseFixStrategy {
  type: 'property_addition' | 'missing_property'; // Include both possibilities
  propertyName: string;
  targetType: string;
  inferredType: string;
  isOptional: boolean;
  defaultValue?: string;
}

export interface CircularBreakStrategy extends BaseFixStrategy {
  type: 'circular_break' | 'circular_dependency'; // Include both possibilities
  cycle: string[];
  breakPoints: string[];
  replacementTypes: string[];
}

export interface FixExecutionResult {
  success: boolean;
  fixId: string;
  strategy: FixStrategyTypeDef;
  appliedChanges: AppliedChange[];
  validationResults: ValidationResult[];
  confidenceAfter: number;
  timeTaken: number;
}

export interface AppliedChange {
  file: string;
  line: number;
  before: string;
  after: string;
  description: string;
}

export interface ValidationResult {
  check: string;
  passed: boolean;
  message: string;
  details?: string;
}

export interface FixPrioritizationRule {
  name: string;
  condition: (plan: FixPlan) => boolean;
  weight: number;
  description: string;
}

export interface PrioritizationContext {
  fileComplexity: Map<string, number>;
  typeUsageFrequency: Map<string, number>;
  errorDensity: Map<string, number>;
  projectStructure: any;
}

// Optional: Helper type to map old types to new types
export type FixTypeMapping = {
  'missing_import': 'import_fix';
  'type_mismatch': 'type_alignment';
  'missing_property': 'property_addition';
  'circular_dependency': 'circular_break';
  'method_redefinition': 'method_implementation';
};

// Optional: Helper function to convert old fix types to new ones
export function mapToNewFixType(oldType: keyof FixTypeMapping): FixStrategyTypeDef {
  const mapping: FixTypeMapping = {
    'missing_import': 'import_fix',
    'type_mismatch': 'type_alignment',
    'missing_property': 'property_addition',
    'circular_dependency': 'circular_break',
    'method_redefinition': 'method_implementation'
  };
  return mapping[oldType];
}