// endpointManager.ts
import { EndpointConfigurations } from '@/app/config/EndpointConfig';
import { BasicChannels } from '@/app/notifications/NotificationChannelHelper'

// Import ALL configs
import { uiSettingsConfig } from '@/app/config/endpoints/uiSettingsConfig';
import { analyticsConfig } from '@/app/config/endpoints/analyticsConfig';
import { usersConfig } from '@/app/config/endpoints/usersConfig';
import { apiWebBaseConfig } from '@/app/config/endpoints/apiWebBaseConfig';
import { commentsConfig } from '@/app/config/endpoints/commentsConfig';
import { contentConfig } from '@/app/config/endpoints/contentConfig';
import { dataConfig } from '@/app/config/endpoints/dataConfig';
import { delegatesConfig } from '@/app/config/endpoints/delegatesConfig';
import { webConfig } from '@/app/config/endpoints/webConfig';
import { sortingConfig } from '@/app/config/endpoints/sortingConfig';
import { filteringConfig } from '@/app/config/endpoints/filteringConfig';
import { highlightsConfig } from '@/app/config/endpoints/highlightsConfig';
import { loggingConfig } from '@/app/config/endpoints/loggingConfig';
import { newsConfig } from '@/app/config/endpoints/newsConfig';
import { notesConfig } from '@/app/config/endpoints/notesConfig';
import { projectsConfig } from '@/app/config/endpoints/projectsConfig';
import { searchingConfig } from '@/app/config/endpoints/searchingConfig';
import { snapshotsConfig } from '@/app/config/endpoints/snapshotsConfig';
import { uiConfig } from '@/app/config/endpoints/uiConfig';
import { versionConfig } from '@/app/config/endpoints/versionConfig';
import { tasksConfig } from '@/app/config/endpoints/tasksConfig';
import { teamsConfig } from '@/app/config/endpoints/teamsConfig';
import { todosConfig } from '@/app/config/endpoints/todosConfig';
import { authConfig } from '@/app/config/endpoints/authConfig';
import { blogsConfig } from '@/app/config/endpoints/blogsConfig';
import { calendarConfig } from '@/app/config/endpoints/calendarConfig';
import { chatConfig } from '@/app/config/endpoints/chatConfig';
import { clientConfig } from '@/app/config/endpoints/clientConfig';
import { collaborationToolsConfig } from '@/app/config/endpoints/collaborationToolsConfig';
import { communicationConfig } from '@/app/config/endpoints/communicationConfig';
import { communityInteractionConfig } from '@/app/config/endpoints/communityInteractionConfig';
import { cryptoConfig } from '@/app/config/endpoints/cryptoConfig';
import { dataProvidersConfig } from '@/app/config/endpoints/dataProvidersConfig';
import { dexConfig } from '@/app/config/endpoints/dexConfig';
import { detailsConfig } from '@/app/config/endpoints/detailsConfig';
import { donationsConfig } from '@/app/config/endpoints/donationsConfig';
import { drawingConfig } from '@/app/config/endpoints/drawingConfig';
import { externalAuthConfig } from '@/app/config/endpoints/externalAuthConfig';
import { feedbackConfig } from '@/app/config/endpoints/feedbackConfig';
import { filesConfig } from '@/app/config/endpoints/filesConfig';
import { freelancersConfig } from '@/app/config/endpoints/freelancersConfig';
import { generatorsConfig } from '@/app/config/endpoints/generatorsConfig';
import { globalCollaborationConfig } from '@/app/config/endpoints/globalCollaborationConfig';
import { markerConfig } from '@/app/config/endpoints/markerConfig';
import { moderatorsConfig } from '@/app/config/endpoints/moderatorsConfig';
import { monetizationConfig } from '@/app/config/endpoints/monetizationConfig';
import { parameterCustomizationConfig } from '@/app/config/endpoints/parameterCustomizationConfig';
import { paymentConfig } from '@/app/config/endpoints/paymentConfig';
import { personasConfig } from '@/app/config/endpoints/personasConfig';
import { phasesConfig } from '@/app/config/endpoints/phasesConfig';
import { projectManagementConfig } from '@/app/config/endpoints/projectManagementConfig';
import { projectOwnerConfig } from '@/app/config/endpoints/projectOwnerConfig';
import { randomWalkConfig } from '@/app/config/endpoints/randomWalkConfig';
import { registrationConfig } from '@/app/config/endpoints/registrationConfig';
import { reportsConfig } from '@/app/config/endpoints/reportsConfig';
import { securityConfig } from '@/app/config/endpoints/securityConfig';
import { stateGovCitiesConfig } from '@/app/config/endpoints/stateGovCitiesConfig';
import { teamManagementConfig } from '@/app/config/endpoints/teamManagementConfig';
import { themeConfig } from '@/app/config/endpoints/themeConfig';
import { toolbarConfig } from '@/app/config/endpoints/toolbarConfig';
import { tradingConfig } from '@/app/config/endpoints/tradingConfig';
import { userManagementConfig } from '@/app/config/endpoints/userManagementConfig';
import { userRolesConfig } from '@/app/config/endpoints/userRolesConfig';
import { userRolesNFTConfig } from '@/app/config/endpoints/userRolesNFTConfig';
import { userSettingsConfig } from '@/app/config/endpoints/userSettingsConfig';
import { videosConfig } from '@/app/config/endpoints/videosConfig';
import { databaseConfig } from '@/app/config/endpoints/databaseConfig';
import { apiEndpointConfig } from '@/app/config/endpoints/apiEndpointConfig';
import { devConfig } from '@/app/config/endpoints/devConfig';
import { documentsConfig } from '@/app/config/endpoints/documentsConfig';
import { participantsConfig } from '@/app/config/endpoints/participantsConfig';
import { messagesConfig } from '@/app/config/endpoints/messagesConfig';
import { screenSharingConfig } from '@/app/config/endpoints/screenSharingConfig';
import { dataAnalysisConfig } from '@/app/config/endpoints/dataAnalysisConfig';
import { logsConfig } from '@/app/config/endpoints/logsConfig';
import { realtimeConfig } from '@/app/config/endpoints/realtimeConfig';
import { batchConfig } from '@/app/config/endpoints/batchConfig';

// Import notification channels config (new)
import { notificationsConfig } from '@/app/config/endpoints/notificationsConfig';
import { NotificationChannelManager } from '@/app/notifications/NotificationChannelManager'

import { WebhookSettings } from '@/app/settings/Reminder';

// ============================================================================
// TYPES
// ============================================================================

type EndpointGroup = keyof EndpointConfigurations;

interface EndpointManagerOptions {
  autoRegister?: boolean;
  logger?: {
    debug: (msg: string) => void;
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
  };
}

// ============================================================================
// ENDPOINT CONFIG MANAGER
// ============================================================================

class EndpointConfigManager {
  private configMap = new Map<EndpointGroup, any>();
  private notificationChannelManager: NotificationChannelManager;
  private logger: EndpointManagerOptions['logger'];
  
  constructor(options: EndpointManagerOptions = {}) {
    this.logger = options.logger || console;
    this.notificationChannelManager = new NotificationChannelManager();
    
    if (options.autoRegister !== false) {
      this.registerConfigs();
    }
  }
  
  /**
   * Register all endpoint configurations
   */
  registerConfigs() {
    this.logger?.info('Registering endpoint configurations...');
    
    // Core project management endpoints
    this.registerCoreConfigs();
    
    // Collaboration & communication endpoints
    this.registerCollaborationConfigs();
    
    // Crypto & trading endpoints
    this.registerCryptoConfigs();
    
    // Advanced features endpoints
    this.registerAdvancedConfigs();
    
    // Notification endpoints (new)
    this.registerNotificationConfigs();
    
    this.logger?.info(`Total endpoints registered: ${this.configMap.size}`);

    // notification configs
    this.configMap.set('notifications', notificationsConfig);
  }
  
  private registerCoreConfigs() {
    const coreConfigs = {
      teams: teamsConfig,
      users: usersConfig,
      projects: projectsConfig,
      tasks: tasksConfig,
      todos: todosConfig,
      phases: phasesConfig,
      data: dataConfig,
      documents: documentsConfig,
      delegates: delegatesConfig,
      notes: notesConfig,
      reports: reportsConfig,
    };
    
    Object.entries(coreConfigs).forEach(([key, config]) => {
      this.configMap.set(key as EndpointGroup, config);
    });
  }
  
  private registerCollaborationConfigs() {
    const collaborationConfigs = {
      chat: chatConfig,
      communication: communicationConfig,
      collaborationTools: collaborationToolsConfig,
      communityInteraction: communityInteractionConfig,
      realtime: realtimeConfig,
      messages: messagesConfig,
      participants: participantsConfig,
      screenSharing: screenSharingConfig,
      videoCall: { enabled: true, provider: 'jitsi' }, // Integrated from notifications
      audioCall: { enabled: true, provider: 'twilio' }, // Integrated from notifications
    };
    
    Object.entries(collaborationConfigs).forEach(([key, config]) => {
      this.configMap.set(key as EndpointGroup, config);
    });
  }
  
  private registerCryptoConfigs() {
    const cryptoConfigs = {
      crypto: cryptoConfig,
      trading: tradingConfig,
      dex: dexConfig,
      payment: paymentConfig,
      monetization: monetizationConfig,
      userRolesNFT: userRolesNFTConfig,
    };
    
    Object.entries(cryptoConfigs).forEach(([key, config]) => {
      this.configMap.set(key as EndpointGroup, config);
    });
    
    // Setup crypto notifications
    this.notificationChannelManager.setupCryptoNotifications();
  }
  
  private registerAdvancedConfigs() {
    const advancedConfigs = {
      analytics: analyticsConfig,
      dataAnalysis: dataAnalysisConfig,
      aiGenerators: generatorsConfig,
      search: searchingConfig,
      filtering: filteringConfig,
      sorting: sortingConfig,
      security: securityConfig,
      auth: authConfig,
      externalAuth: externalAuthConfig,
      userManagement: userManagementConfig,
      userSettings: userSettingsConfig,
      logs: logsConfig,
      batch: batchConfig,
      database: databaseConfig,
      apiConfig: apiEndpointConfig,
      web: webConfig,
      ui: uiConfig,
      uiSettings: uiSettingsConfig,
      theme: themeConfig,
      toolbar: toolbarConfig,
    };
    
    Object.entries(advancedConfigs).forEach(([key, config]) => {
      this.configMap.set(key as EndpointGroup, config);
    });
  }
  
  private registerNotificationConfigs() {
    // Register the notifications config
    this.configMap.set('notifications', notificationsConfig);
    
    // Configure notification channels for different features
    this.notificationChannelManager.setChannel('email', true);
    this.notificationChannelManager.setChannel('push', { enabled: true, sound: 'default' });
    this.notificationChannelManager.setChannel('inApp', { enabled: true });
    
    // Webhook based on environment
      const webhookConfig = this.getWebhookConfig();
        this.notificationChannelManager.setChannel('webhook', webhookConfig);
      
      // Add notification endpoints to config
      const channelConfig = this.notificationChannelManager.getChannelEndpointConfig();
      this.configMap.set('notificationChannels', channelConfig);
    }

  private getWebhookConfig(): boolean | WebhookSettings {
    const webhookUrl = process.env.WEBHOOK_URL || '';
    
    if (!webhookUrl?.trim()) {
      return false;
    }
    
    // Cast to the correct WebhookSettings type
    const webhookConfig: WebhookSettings = {
      enabled: true,
      url: webhookUrl.trim(), // Ensure it's a string, not undefined
      headers: {
        'Content-Type': 'application/json',
      },
      retryPolicy: {
        maxRetries: 3,
        retryInterval: 5000,
        backoffMultiplier: 2,
        backoffFactor: 2
      }
    };
    
    if (process.env.WEBHOOK_SECRET) {
      webhookConfig.headers!['Authorization'] = `Bearer ${process.env.WEBHOOK_SECRET}`;
    }
    
    return webhookConfig;
  }
  /**
   * Get all endpoint configurations
   */
  getEndpointConfigurations(): EndpointConfigurations {
    const configs: Partial<EndpointConfigurations> = {};
    this.configMap.forEach((value, key) => {
      configs[key] = value;
    });
    return configs as EndpointConfigurations;
  }
  
  /**
   * Get notification channel manager
   */
  getNotificationManager(): NotificationChannelManager {
    return this.notificationChannelManager;
  }
  
  /**
   * Add new endpoint group
   */
  addEndpointGroup<T extends EndpointGroup>(
    name: T,
    config: EndpointConfigurations[T]
  ): this {
    this.configMap.set(name, config);
    this.logger?.info(`Added endpoint group: ${name}`);
    return this;
  }
  
  /**
   * Remove endpoint group
   */
  removeEndpointGroup(name: EndpointGroup): boolean {
    const result = this.configMap.delete(name);
    if (result) {
      this.logger?.info(`Removed endpoint group: ${name}`);
    }
    return result;
  }
  
  /**
   * Get specific endpoint configuration
   */
  getEndpointGroup<T extends EndpointGroup>(name: T): EndpointConfigurations[T] | undefined {
    return this.configMap.get(name);
  }
  
  /**
   * Check if endpoint group exists
   */
  hasEndpointGroup(name: EndpointGroup): boolean {
    return this.configMap.has(name);
  }
  
  /**
   * List all endpoint groups
   */
  listEndpointGroups(): EndpointGroup[] {
    return Array.from(this.configMap.keys());
  }
  
  /**
   * List endpoint groups by category
   */
  listEndpointGroupsByCategory() {
    return {
      core: ['teams', 'users', 'projects', 'tasks', 'todos', 'phases', 'data', 'documents'],
      collaboration: ['chat', 'communication', 'collaborationTools', 'realtime', 'messages', 'videoCall', 'audioCall'],
      crypto: ['crypto', 'trading', 'dex', 'payment', 'monetization'],
      notifications: ['notifications', 'notificationChannels'],
      advanced: ['analytics', 'dataAnalysis', 'security', 'auth', 'userManagement', 'logs']
    };
  }
  
  /**
   * Get all configurations for export
   */
  getAllConfigs() {
    const allConfigs: Record<string, any> = {};
    this.configMap.forEach((value, key) => {
      allConfigs[key] = value;
    });
    return allConfigs;
  }
  

  initializeUserNotificationChannels(userPreferences?: any) {
  if (userPreferences?.notifications) {
    // Type-safe way to handle user preferences
    const notifications = userPreferences.notifications as Record<string, any>;
    
    Object.entries(notifications).forEach(([channel, settings]) => {
      // Check if it's a valid basic channel
      const basicChannels: BasicChannels[] = ['email', 'push', 'sms', 'inApp', 'webhook'];
      
      if (basicChannels.includes(channel as BasicChannels)) {
        const channelKey = channel as BasicChannels;
        
        if (typeof settings === 'boolean') {
          this.notificationChannelManager.setChannel(channelKey, settings);
        } else if (settings && typeof settings === 'object') {
          // Validate and sanitize settings based on channel type
          const sanitizedSettings = this.sanitizeChannelSettings(channelKey, settings);
          this.notificationChannelManager.setChannel(channelKey, sanitizedSettings);
        }
      } else if (channel === 'advanced' && settings && typeof settings === 'object') {
        // Handle advanced channels
        Object.entries(settings).forEach(([advancedChannel, advancedSettings]) => {
          if (advancedSettings && typeof advancedSettings === 'object') {
            this.setAdvancedChannelFromPreferences(advancedChannel, advancedSettings);
          }
        });
      }
    });
  }
  
  // Setup project notifications by default
  this.notificationChannelManager.setupProjectNotifications();
  
  return this.notificationChannelManager;
}

// Helper method to sanitize channel settings
private sanitizeChannelSettings(channel: BasicChannels, settings: any): any {
  switch(channel) {
    case 'email':
      return {
        enabled: settings.enabled !== false,
        subjectTemplate: settings.subjectTemplate,
        bodyTemplate: settings.bodyTemplate,
        cc: settings.cc || [],
        bcc: settings.bcc || []
      };
    case 'push':
      return {
        enabled: settings.enabled !== false,
        sound: settings.sound || 'default',
        badgeCount: settings.badgeCount || 0
      };
    case 'sms':
      return {
        enabled: settings.enabled !== false,
        provider: settings.provider || 'default',
        senderId: settings.senderId || ''
      };
    case 'inApp':
      return {
        enabled: settings.enabled !== false,
        displayDuration: settings.displayDuration || 5000,
        position: settings.position || 'top'
      };
    case 'webhook':
      return {
        enabled: settings.enabled !== false,
        url: settings.url || '', // Ensure URL is a string
        headers: settings.headers || {},
        retryPolicy: settings.retryPolicy || {
          maxRetries: 3,
          retryInterval: 5000
        }
      };
    default:
      return { enabled: settings.enabled !== false };
  }
}

// Helper method for advanced channels
  private setAdvancedChannelFromPreferences(channel: string, settings: any) {
    const advancedChannels = ['chat', 'calendar', 'audioCall', 'videoCall', 'screenShare'];
  
    if (advancedChannels.includes(channel)) {
      const sanitizedSettings = {
        enabled: settings.enabled !== false,
        ...settings
      };
    
      if (channel === 'chat') {
        this.notificationChannelManager.setChatSettings(sanitizedSettings);
      } else if (channel === 'calendar') {
        this.notificationChannelManager.setCalendarSettings(sanitizedSettings);
      } else if (channel === 'audioCall') {
        this.notificationChannelManager.setAudioCallSettings(sanitizedSettings);
      } else if (channel === 'videoCall') {
        this.notificationChannelManager.setVideoCallSettings(sanitizedSettings);
      } else if (channel === 'screenShare') {
        this.notificationChannelManager.setScreenShareSettings(sanitizedSettings);
      }
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Create singleton instance
const endpointManager = new EndpointConfigManager({
  autoRegister: true,
  logger: {
    debug: (msg) => console.debug(`[EndpointManager] ${msg}`),
    info: (msg) => console.log(`[EndpointManager] ${msg}`),
    warn: (msg) => console.warn(`[EndpointManager] ${msg}`),
    error: (msg) => console.error(`[EndpointManager] ${msg}`),
  }
});

// Export manager and configurations
export const endpointConfigurations = endpointManager.getEndpointConfigurations();
export const notificationChannelManager = endpointManager.getNotificationManager();

// Export individual configs for backward compatibility
export {
  endpointManager,
  uiSettingsConfig,
  analyticsConfig,
  usersConfig,
  apiWebBaseConfig,
  commentsConfig,
  contentConfig,
  dataConfig,
  delegatesConfig,
  webConfig,
  sortingConfig,
  filteringConfig,
  highlightsConfig,
  loggingConfig,
  newsConfig,
  notesConfig,
  projectsConfig,
  searchingConfig,
  snapshotsConfig,
  uiConfig,
  versionConfig,
  tasksConfig,
  teamsConfig,
  todosConfig,
  authConfig,
  blogsConfig,
  calendarConfig,
  chatConfig,
  clientConfig,
  collaborationToolsConfig,
  communicationConfig,
  communityInteractionConfig,
  cryptoConfig,
  dataProvidersConfig,
  dexConfig,
  detailsConfig,
  donationsConfig,
  drawingConfig,
  externalAuthConfig,
  feedbackConfig,
  filesConfig,
  freelancersConfig,
  generatorsConfig,
  globalCollaborationConfig,
  markerConfig,
  moderatorsConfig,
  monetizationConfig,
  parameterCustomizationConfig,
  paymentConfig,
  personasConfig,
  phasesConfig,
  projectManagementConfig,
  projectOwnerConfig,
  randomWalkConfig,
  registrationConfig,
  reportsConfig,
  securityConfig,
  stateGovCitiesConfig,
  teamManagementConfig,
  themeConfig,
  toolbarConfig,
  tradingConfig,
  userManagementConfig,
  userRolesConfig,
  userRolesNFTConfig,
  userSettingsConfig,
  videosConfig,
  databaseConfig,
  apiEndpointConfig,
  devConfig,
  documentsConfig,
  participantsConfig,
  messagesConfig,
  screenSharingConfig,
  dataAnalysisConfig,
  logsConfig,
  realtimeConfig,
  batchConfig,
};

// Export types
export type { EndpointGroup, EndpointManagerOptions };