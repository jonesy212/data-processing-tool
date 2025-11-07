// pluginTypes.ts
export interface AppPlugin {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  config?: Record<string, any>;
  dependencies?: string[];
  loadOrder?: number;
}

export interface PluginConfig {
  id: string;
  name: string;
  description?: string;
  version: string;
  author?: string;
  enabled: boolean;
  settings: {
    autoLoad: boolean;
    loadOrder: number;
    dependencies: string[];
    permissions: string[];
  };
  configSchema?: Record<string, any>;
  metadata?: Record<string, any>;
}