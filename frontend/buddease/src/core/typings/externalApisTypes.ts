externalApisTypes.ts
export interface ExternalReference {
  id: string;
  source: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface ExternalApiConfig {
  name: string;
  description: string;
  documentation: string;
  baseURL?: string;
  authentication?: {
    type: 'oauth2' | 'api_key' | 'bearer_token';
    required: boolean;
  };
}

export interface SyncStatus {
  lastSync: Date;
  success: boolean;
  changes: number;
  externalReferences: ExternalReference[];
}