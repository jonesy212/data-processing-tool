correctionTypes.ts

export type CorrectionType =
  | 'error' | 'warning' | 'suggestion' | 'info'
  | 'types' | 'react' | 'sensitive_data' | 'missing_sanitization'
  | 'role_violation' | 'insecure_pattern' | 'type_error' | 'performance_issue'  
  | 'compilation' | 'runtime' | 'structure' | 'import'
  | 'compatibility' | 'imports' | 'import_error' | 'folder_analysis'
  | 'type_annotation' | 'performance' | 'structural'; 

export type CorrectionSeverity = 'low' | 'medium' | 'high' | 'critical' ;
export type CorrectionCategory = 
  | 'compilation' | 'runtime' | 'security' 
  | 'performance' | 'structure' | 'maintainability' 
  | 'compatibility' | 'readability' | 'dependencies' 
  | 'native-modules' | 'ios' | 'configuration' 
  | 'quality' | 'ui' | 'development' | 'deployment' 
  | 'linting' | 'import' | 'nextjs' | 'bundler'
  | 'formatting' | 'styling' | 'testing' | 'authentication'
  | 'database' | 'api' | 'mobile' | 'web3' | 'filesystem' 
  | 'general' | 'network' | 'platform' | 'types' | 'general' 
  | 'network' | 'platform' | 'react' | 'imports'
  | 'react-native' | 'function' | 'class' | 'education'
  | 'type_error' | 'scripts' | 'data' | 'dependency' | 'critical';

export interface CorrectionInput {
  id: string;
  type: CorrectionType;
  severity: CorrectionSeverity;
  title: string;
  file: string;
  codeSnippet: string;
  suggestion: string;
  message?: string;
  category: CorrectionCategory;
  line?: number;
  description?: string; // Optional - more detailed explanation
  code?: string; // Optional - code identifier
  fix?: string; // Optional - fix suggestion
  documentationLink?: string; // Optional - link to docs
}