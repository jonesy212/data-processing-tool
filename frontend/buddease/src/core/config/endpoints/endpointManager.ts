endpointManager.ts
import { EndpointConfigurations } from '@/core/config/EndpointConfig';
import { BasicChannels } from '@/core/notifications/NotificationChannelHelper';

// Import ALL configs
import { analyticsConfig } from '@/core/config/endpoints/analyticsConfig';
import { apiEndpointConfig } from '@/core/config/endpoints/apiEndpointConfig';
import { apiWebBaseConfig } from '@/core/config/endpoints/apiWebBaseConfig';
import { authConfig } from '@/core/config/endpoints/authConfig';
import { batchConfig } from '@/core/config/endpoints/batchConfig';
import { blogsConfig } from '@/core/config/endpoints/blogsConfig';
import { calendarConfig } from '@/core/config/endpoints/calendarConfig';
import { chatConfig } from '@/core/config/endpoints/chatConfig';
import { clientConfig } from '@/core/config/endpoints/clientConfig';
import { collaborationToolsConfig } from '@/core/config/endpoints/collaborationToolsConfig';
import { commentsConfig } from '@/core/config/endpoints/commentsConfig';
import { communicationConfig } from '@/core/config/endpoints/communicationConfig';
import { communityInteractionConfig } from '@/core/config/endpoints/communityInteractionConfig';
import { contentConfig } from '@/core/config/endpoints/contentConfig';
import { cryptoConfig } from '@/core/config/endpoints/cryptoConfig';
import { dataAnalysisConfig } from '@/core/config/endpoints/dataAnalysisConfig';
import { databaseConfig } from '@/core/config/endpoints/databaseConfig';
import { dataConfig } from '@/core/config/endpoints/dataConfig';
import { dataProvidersConfig } from '@/core/config/endpoints/dataProvidersConfig';
import { delegatesConfig } from '@/core/config/endpoints/delegatesConfig';
import { detailsConfig } from '@/core/config/endpoints/detailsConfig';
import { devConfig } from '@/core/config/endpoints/devConfig';
import { dexConfig } from '@/core/config/endpoints/dexConfig';
import { documentsConfig } from '@/core/config/endpoints/documentsConfig';
import { donationsConfig } from '@/core/config/endpoints/donationsConfig';
import { drawingConfig } from '@/core/config/endpoints/drawingConfig';
import { externalAuthConfig } from '@/core/config/endpoints/externalAuthConfig';
import { feedbackConfig } from '@/core/config/endpoints/feedbackConfig';
import { filesConfig } from '@/core/config/endpoints/filesConfig';
import { filteringConfig } from '@/core/config/endpoints/filteringConfig';
import { freelancersConfig } from '@/core/config/endpoints/freelancersConfig';
import { generatorsConfig } from '@/core/config/endpoints/generatorsConfig';
import { globalCollaborationConfig } from '@/core/config/endpoints/globalCollaborationConfig';
import { highlightsConfig } from '@/core/config/endpoints/highlightsConfig';
import { loggingConfig } from '@/core/config/endpoints/loggingConfig';
import { logsConfig } from '@/core/config/endpoints/logsConfig';
import { markerConfig } from '@/core/config/endpoints/markerConfig';
import { messagesConfig } from '@/core/config/endpoints/messagesConfig';
import { moderatorsConfig } from '@/core/config/endpoints/moderatorsConfig';
import { monetizationConfig } from '@/core/config/endpoints/monetizationConfig';
import { newsConfig } from '@/core/config/endpoints/newsConfig';
import { notesConfig } from '@/core/config/endpoints/notesConfig';
import { parameterCustomizationConfig } from '@/core/config/endpoints/parameterCustomizationConfig';
import { participantsConfig } from '@/core/config/endpoints/participantsConfig';
import { paymentConfig } from '@/core/config/endpoints/paymentConfig';
import { personasConfig } from '@/core/config/endpoints/personasConfig';
import { phasesConfig } from '@/core/config/endpoints/phasesConfig';
import { projectManagementConfig } from '@/core/config/endpoints/projectManagementConfig';
import { projectOwnerConfig } from '@/core/config/endpoints/projectOwnerConfig';
import { projectsConfig } from '@/core/config/endpoints/projectsConfig';
import { randomWalkConfig } from '@/core/config/endpoints/randomWalkConfig';
import { realtimeConfig } from '@/core/config/endpoints/realtimeConfig';
import { registrationConfig } from '@/core/config/endpoints/registrationConfig';
import { reportsConfig } from '@/core/config/endpoints/reportsConfig';
import { screenSharingConfig } from '@/core/config/endpoints/screenSharingConfig';
import { searchingConfig } from '@/core/config/endpoints/searchingConfig';
import { securityConfig } from '@/core/config/endpoints/securityConfig';
import { snapshotsConfig } from '@/core/config/endpoints/snapshotsConfig';
import { sortingConfig } from '@/core/config/endpoints/sortingConfig';
import { stateGovCitiesConfig } from '@/core/config/endpoints/stateGovCitiesConfig';
import { tasksConfig } from '@/core/config/endpoints/tasksConfig';
import { teamManagementConfig } from '@/core/config/endpoints/teamManagementConfig';
import { teamsConfig } from '@/core/config/endpoints/teamsConfig';
import { themeConfig } from '@/core/config/endpoints/themeConfig';
import { todosConfig } from '@/core/config/endpoints/todosConfig';
import { toolbarConfig } from '@/core/config/endpoints/toolbarConfig';
import { tradingConfig } from '@/core/config/endpoints/tradingConfig';
import { uiConfig } from '@/core/config/endpoints/uiConfig';
import { uiSettingsConfig } from '@/core/config/endpoints/uiSettingsConfig';
import { userManagementConfig } from '@/core/config/endpoints/userManagementConfig';
import { userRolesConfig } from '@/core/config/endpoints/userRolesConfig';
import { userRolesNFTConfig } from '@/core/config/endpoints/userRolesNFTConfig';
import { usersConfig } from '@/core/config/endpoints/usersConfig';
import { userSettingsConfig } from '@/core/config/endpoints/userSettingsConfig';
import { versionConfig } from '@/core/config/endpoints/versionConfig';
import { videosConfig } from '@/core/config/endpoints/videosConfig';
import { webConfig } from '@/core/config/endpoints/webConfig';

// Import notification channels config (new)
import { notificationsConfig } from '@/core/config/endpoints/notificationsConfig';
import { NotificationChannelManager } from '@/core/notifications/NotificationChannelManager';

import { WebhookSettings } from '@/core/settings/Reminder';

============================================================================
TYPES
============================================================================

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

============================================================================
ENDPOINT CONFIG MANAGER
============================================================================

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

Helper method to sanitize channel settings
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

Helper method for advanced channels
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

============================================================================
EXPORTS
============================================================================

Create singleton instance
const endpointManager = new EndpointConfigManager({
  autoRegister: true,
  logger: {
    debug: (msg) => console.debug(`[EndpointManager] ${msg}`),
    info: (msg) => console.log(`[EndpointManager] ${msg}`),
    warn: (msg) => console.warn(`[EndpointManager] ${msg}`),
    error: (msg) => console.error(`[EndpointManager] ${msg}`),
  }
});

Export manager and configurations
export const endpointConfigurations = endpointManager.getEndpointConfigurations();
export const notificationChannelManager = endpointManager.getNotificationManager();

Export individual configs for backward compatibility
export {
    analyticsConfig, apiEndpointConfig, apiWebBaseConfig, authConfig, batchConfig, blogsConfig,
    calendarConfig,
    chatConfig,
    clientConfig,
    collaborationToolsConfig, commentsConfig, communicationConfig,
    communityInteractionConfig, contentConfig, cryptoConfig, dataAnalysisConfig, databaseConfig, dataConfig, dataProvidersConfig, delegatesConfig, detailsConfig, devConfig, dexConfig, documentsConfig, donationsConfig,
    drawingConfig, endpointManager, externalAuthConfig,
    feedbackConfig,
    filesConfig, filteringConfig, freelancersConfig,
    generatorsConfig,
    globalCollaborationConfig, highlightsConfig,
    loggingConfig, logsConfig, markerConfig, messagesConfig, moderatorsConfig,
    monetizationConfig, newsConfig,
    notesConfig, parameterCustomizationConfig, participantsConfig, paymentConfig,
    personasConfig,
    phasesConfig,
    projectManagementConfig,
    projectOwnerConfig, projectsConfig, randomWalkConfig, realtimeConfig, registrationConfig,
    reportsConfig, screenSharingConfig, searchingConfig, securityConfig, snapshotsConfig, sortingConfig, stateGovCitiesConfig, tasksConfig, teamManagementConfig, teamsConfig, themeConfig, todosConfig, toolbarConfig,
    tradingConfig, uiConfig, uiSettingsConfig, userManagementConfig,
    userRolesConfig,
    userRolesNFTConfig, usersConfig, userSettingsConfig, versionConfig, videosConfig, webConfig
};

Export types
    export type { EndpointGroup, EndpointManagerOptions };
