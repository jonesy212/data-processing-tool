// ErrorAnalysisTypes.ts
import type { FixStrategyTypeDef } from '@/core/error-analyzer/types/FixStrategyTypes';
import type { FixPlan } from '@/core/error-analyzer/ErrorFixManager'

// ========== SHARED INTERFACES ==========
export interface SharedErrorLocation {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export interface SharedResourceInfo {
  resource: string;
  owner: string;
  source: string;
}

export interface SharedPriority {
  priority: 'critical' | 'high' | 'medium' | 'low';
  priorityScore: number;
}


export interface SharedTypeInfo {
  name: string;
  file: string;
  type: 'interface' | 'type' | 'class' | 'component' | 'props';
}

export interface SharedUsageInfo {
  file: string;
  line: number;
}


// ========== EXISTING INTERFACES (UPDATED) ==========
export interface TSCompilerError extends 
  SharedResourceInfo,
  SharedErrorLocation {
  code: string;
  severity: number;
  message: string;
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

export interface AnalyzedError {
  error: TSCompilerError;
  pattern: string;
  missingIdentifier?: string;
  expectedType?: string;
  actualType?: string;
  propertyName?: string;
  relatedFile?: string;
  suggestions: string[];
  complexity: 'simple' | 'medium' | 'complex';
}

export interface RelationshipMap {
  propertyUsages: Map<string, Array<{
    file: string;
    line: number;
    context: string;
    type: string;
  }>>;
  methodUsages: Map<string, Array<{
    file: string;
    line: number;
    signature: string;
    returnType: string;
  }>>;
  typeDependencies: Map<string, string[]>; // type -> dependent types
  fileDependencies: Map<string, string[]>; // file -> imported files
}


export interface TypeHierarchy {
  root: TypeNode;
  children: TypeHierarchy[];
  depth: number;
}

export interface TypeNode extends 
  SharedTypeInfo {
  extends?: string[];
  implements?: string[];
  properties: string[];
  methods: string[];
  dependencies: string[];
  depth: number;
}

export interface TypeRelationship {
  source: string;
  target: string;
  relationship: 'extends' | 'implements' | 'uses' | 'composes' | 'references';
  strength: 'strong' | 'medium' | 'weak';
}

export interface ErrorPattern {
  code: string;
  pattern: RegExp;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  suggestedFix: string;
}

export interface ConfidenceFactors {
  patternMatch: number; // 0-30
  contextClarity: number; // 0-25
  relationshipComplexity: number; // 0-20
  fixClarity: number; // 0-15
  validationEase: number; // 0-10
  total: number; // 0-100
}


export interface ValidationStep {
  step: string;
  action: string;
  timeout: number;
}

export interface FallbackStrategy {
  type: string;
  description: string;
}

// Shared strategy properties
export interface StrategyCore {
  confidenceThresholds: {
    autoApply: number;
    suggestApply: number;
    manualReview: number;
  };
  validationSteps: ValidationStep[];
  fallbackStrategies: FallbackStrategy[];
}


export interface FixStrategy extends StrategyCore {
  type: FixStrategyTypeDef;
}

