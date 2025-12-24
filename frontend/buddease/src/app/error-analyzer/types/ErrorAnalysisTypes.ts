// src/app/error-analyzer/types/ErrorAnalysisTypes.ts

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

export interface TypeHierarchy {
  root: TypeNode;
  children: TypeHierarchy[];
  depth: number;
}

export interface TypeNode {
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

export interface FixStrategy {
  type: FixPlan['fixType'];
  confidenceThresholds: {
    autoApply: number; // >= 85
    suggestApply: number; // 70-84
    manualReview: number; // < 70
  };
  validationSteps: string[];
  fallbackStrategies: string[];
}