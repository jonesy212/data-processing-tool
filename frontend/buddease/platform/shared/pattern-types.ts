// pattern-types.ts

// ========== CORE PATTERN TYPES ==========

export interface BasePatternAnalysis {
  patternName: string;
  patternType?: string; // For compatibility
  entityCount: number;
  totalUsages: number;
  files: string[];
  variations: Map<string, number>;
  compatibilityMatrix: Map<string, string[]>;
}

export interface CorrectionPatternAnalysis extends BasePatternAnalysis {
  patternType: string;
  occurrences: number;
  files: string[];
  examples: string[];
  complexityScore: number; // 1-10 scale
  fixEffort: 'low' | 'medium' | 'high';
  impact: 'performance' | 'maintainability' | 'readability' | 'security';
  testCoverage?: number;
  interchangeabilityScore?: number;
}


export interface PatternOccurrence {
  patternName: string;
  occurrences: number;
  files: string[];
  examples: string[];
  complexityScore: number; // 1-10 scale
  fixEffort: 'low' | 'medium' | 'high';
  impact: 'performance' | 'maintainability' | 'readability' | 'security';
}

export interface PatternTrend {
  pattern: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  change: number; // percentage change
  historicalData: Array<{ date: string; count: number }>;
}

export interface PatternDetectionResult {
  patternName: string;
  description: string;
  context: string;
  line: number;
  severity: 'low' | 'medium' | 'high';
}

export interface PatternCompatibility {
  canExecute: boolean;
  requiredAdapters: string[];
  testablePatterns: string[];
}

export interface EntityPatternAnalysis extends BasePatternAnalysis {
  patternName: string;
  entityCount: number;
  totalUsages: number;
  files: string[];
  variations: Map<string, number>;
  compatibilityMatrix: Map<string, string[]>;
}

// ========== COMPONENT-SPECIFIC PATTERN TYPES ==========

export interface ComponentPatternMetrics {
  destructuredProps: number;      // ({ prop1, prop2 }) => 
  typedProps: number;             // (props: Props) =>
  reactFC: number;                // React.FC<Props>
  regularFunction: number;        // function Component()
  arrowFunction: number;          // const Component = () =>
  interfaceAbove: number;         // interface above component
  inlineType: number;             // type in function signature
}

export interface ComponentPatternAnalysis {
  totalComponents: number;
  patterns: ComponentPatternMetrics;
}

// ========== UNIFIED PATTERN REPORT ==========

export interface UnifiedPatternReport {
  generated: Date;
  summary: {
    totalPatterns: number;
    totalIssues: number;
    filesAffected: number;
    mostCommonPattern: string;
    highestComplexityPattern: string;
  };
  
  patternAnalysis: {
    basePatterns: BasePatternAnalysis[];
    componentPatterns?: ComponentPatternAnalysis;
    occurrencePatterns: PatternOccurrence[];
  };
  
  recommendations: {
    technical: string[];
    quickWins: string[];
    standardization: string[];
  };
  
  metadata: {
    projectRoot: string;
    analysisDuration: number;
    entityDirectory?: string;
    config: Record<string, any>;
  };
}