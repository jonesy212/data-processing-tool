// PluginInterface.tsx

interface DAppPlugin {
  name: string;
  description?: string; // Added

  // Method to initialize the plugin
  initialize: () => void | Promise<void>;

  // Method to execute actions
  execute?: (action: string, payload?: any) => any | Promise<any>;

  // Method to perform actions when the plugin is enabled
  enable: () => Promise<void>;

  // Method to perform actions when the plugin is disabled
  disable: () => void;

  // Method to handle configuration changes for the plugin
  updateConfig: (config: Record<string, any>) => void;

  // Method to handle user preferences related to the plugin
  updatePreferences: (preferences: Record<string, any>) => void;

  // Method to provide information about the plugin (metadata, version, etc.)
  getInfo: () => Record<string, any>;

 
  // Load and initialize plugins
  loadPlugins: () => any;
  
  // Enable collaboration
  enableRealtimeCollaboration?: () => void;
  // Enable chat
  enableChatFunctionality?: () => void;
}

export type { DAppPlugin };
