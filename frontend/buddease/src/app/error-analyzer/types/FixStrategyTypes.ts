// src/app/error-analyzer/types/FixStrategyTypes.ts
import { FixPlan } from '@/app/error-analyzer/types/ErrorAnalysisTypes';

export type FixStrategyTypeDef = 
  | 'import_fix'
  | 'type_alignment'
  | 'property_addition'
  | 'method_implementation'
  | 'circular_break'
  | 'interface_update'
  | 'generic_constraint'
  | 'type_guard'
  | 'null_check'
  | 'async_handling';

export interface ImportFixStrategy extends FixStrategyTypeDef {

  type: FixStrategyType;
  name: string;
  description: string;
  applicability: string[];
  confidenceScore: number;
  implementationSteps: string[];
  validationChecks: string[];
  risks: string[];
}

export interface ImportFixStrategy extends FixStrategy {
  type: 'import_fix';
  importType: 'named' | 'default' | 'namespace';
  modulePath: string;
  importName: string;
  alternativePaths: string[];
}

export interface TypeAlignmentStrategy extends FixStrategy {
  type: 'type_alignment';
  sourceType: string;
  targetType: string;
  conversionRequired: boolean;
  typeMapping: Record<string, string>;
}

export interface PropertyAdditionStrategy extends FixStrategy {
  type: 'property_addition';
  propertyName: string;
  targetType: string;
  inferredType: string;
  isOptional: boolean;
  defaultValue?: string;
}

export interface CircularBreakStrategy extends FixStrategy {
  type: 'circular_break';
  cycle: string[];
  breakPoints: string[];
  replacementTypes: string[];
}

export interface FixExecutionResult {
  success: boolean;
  fixId: string;
  strategy: FixStrategyType;
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