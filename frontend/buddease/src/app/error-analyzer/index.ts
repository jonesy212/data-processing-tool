// src/app/error-analyzer/index.ts

// Value exports (classes, functions, etc.)
export { ErrorFixManager } from './ErrorFixManager';
export { TypeScriptErrorAnalyzer } from './TypeScriptErrorAnalyzer';
export { TypeRelationshipAnalyzer } from './TypeRelationshipAnalyzer';
export { FixPrioritizer } from './FixPrioritizer';
export { FixConfidenceCalculator } from './FixConfidenceCalculator';
export { CircularDependencyResolver } from './CircularDependencyResolver';
export { ImportSuggestionGenerator } from './ImportSuggestionGenerator';
export { FixVerifier } from './FixVerifier';
export { ProgressTracker } from './ProgressTracker';
export { ReportGenerator } from './ReportGenerator';
export { CodePatternDetector } from './utils/CodePatternDetector';
export { ASTParserUtils } from './utils/ASTParserUtils';
export { TypeScriptErrorFixSystem, analyzeErrorsFromJson, analyzeErrorsFromFile, main } from './TypeScriptErrorFixSystem';

// Type exports (interfaces, types, enums)
export type { TSCompilerError, FixPlan, RelationshipMap } from './ErrorFixManager';
export type { AnalyzedError } from './TypeScriptErrorAnalyzer';

// Wildcard exports (these are all types from those files)
export * from './types/ErrorAnalysisTypes';
export * from './types/FixStrategyTypes';