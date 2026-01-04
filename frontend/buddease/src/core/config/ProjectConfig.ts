ProjectConfig.ts
export interface ProjectConfig {
  projectName: string;
  projectPath: string;
  framework: 'nextjs' | 'react' | 'vue' | 'angular';
  database: 'postgresql' | 'mongodb' | 'sqlite' | 'mysql';
  packageManager: 'npm' | 'yarn' | 'pnpm';
  features: {
    authentication: boolean;
    database: boolean;
    api: boolean;
    testing: boolean;
    documentation: boolean;
  };
  dependencies: {
    required: string[];
    optional: string[];
    dev: string[];
  };
  databaseConfig?: DatabaseConfig;
  codeStructure: CodeStructureConfig;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  batchSize?: number
}

export interface CodeStructureConfig {
  architecture: 'mvc' | 'feature-based' | 'layer-based';
  includeExamples: boolean;
  generateTests: boolean;
  codingStandards: string[];
}