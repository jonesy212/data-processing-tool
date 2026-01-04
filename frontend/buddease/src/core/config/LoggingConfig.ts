LoggingConfig.ts
export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  transport: 'console' | 'remote' | 'both';
  remote?: {
    endpoint: string;
    batchSize: number;
    flushInterval: number;
  };
  context: {
    includeUser: boolean;
    includeSession: boolean;
    includeEnvironment: boolean;
  };
  retention: {
    maxAge: number;
    maxEntries: number;
  };
  filters?: {
    excludePatterns: string[];
    includeOnly: string[];
  };
}
