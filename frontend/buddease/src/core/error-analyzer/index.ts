// index.ts
src/app/error-analyzer/index.ts

// Value exports (classes, functions, etc.)
export { CircularDependencyResolver } from './CircularDependencyResolver';
export { ErrorFixManager } from './ErrorFixManager';
export { FixConfidenceCalculator } from './FixConfidenceCalculator';
export { FixPrioritizer } from './FixPrioritizer';
export { FixVerifier } from './FixVerifier';
export { ImportSuggestionGenerator } from './ImportSuggestionGenerator';
export { ProgressTracker } from './ProgressTracker';
export type { ReportGenerator } from './ReportGenerator';
export { TypeRelationshipAnalyzer } from './TypeRelationshipAnalyzer';
export type { TypeScriptErrorAnalyzer } from './TypeScriptErrorAnalyzer';
export { analyzeErrorsFromFile, analyzeErrorsFromJson, main, TypeScriptErrorFixSystem } from './TypeScriptErrorFixSystem';
export { ASTParserUtils } from './utils/ASTParserUtils';
export { CodePatternDetector } from './utils/CodePatternDetector';

Type exports (interfaces, types, enums)
export type { RelationshipMap } from '@/core/error-analyzer/types/ErrorAnalysisTypes';
export type { FixPlan, TSCompilerError } from './ErrorFixManager';
export type { AnalyzedError } from './TypeScriptErrorAnalyzer';

// Wildcard exports (these are all types from those files)
export * from './types/ErrorAnalysisTypes';
export * from './types/FixStrategyTypes';
