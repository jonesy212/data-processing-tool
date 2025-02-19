interface DAppPlugin {
  // Add a 'name' property to the interface
  name: string;

  // Method to initialize the plugin
  initialize: () => void;

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

  // Add more methods as needed

  // Load and initialize plugins
  loadPlugins: () => any;
  
  // Enable collaboration
  enableRealtimeCollaboration?: () => void;
  // Enable chat
  enableChatFunctionality?: () => void;
}

export type { DAppPlugin };
