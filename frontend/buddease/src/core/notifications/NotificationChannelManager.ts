// NotificationChannelManager.ts
import type { BasicChannels } from '@/core/notifications/NotificationChannelHelper';
import type { Project } from '@/core/models/projects/Project';
import type { NotificationChannels, NotificationEndpointConfig } from '@/core/notifications/NotificationChannels';
import type { EmailSettings, PushNotificationSettings } from '@/core/settings/Reminder';

export interface ChannelSettings {
  enabled: boolean;
  priority?: number;
  fallbackOrder?: number;
}


export interface SmsSettings extends ChannelSettings {
  provider?: string;
  senderId?: string;
  template?: string;
}

export interface InAppSettings extends ChannelSettings {
  displayDuration?: number;
  position?: 'top' | 'bottom' | 'center';
}

export interface WebhookSettings extends ChannelSettings {
  url: string;
  headers?: Record<string, string>;
  retryCount?: number;
}

// Advanced channel interfaces
export interface ChatSettings extends ChannelSettings {
  platform: 'slack' | 'teams' | 'discord';
  channelId: string;
  botToken?: string;
}

export interface CalendarIntegrationSettings extends ChannelSettings {
  calendarType: 'google' | 'outlook' | 'ical';
  eventDuration?: number;
  reminders?: boolean;
}

export interface VoiceSettings extends ChannelSettings {
  provider: 'twilio' | 'vonage' | 'custom';
  voiceType?: string;
  language?: string;
  maxParticipants?: number;
}

export interface VideoSettings extends ChannelSettings {
  provider: 'zoom' | 'teams' | 'jitsi';
  recordingEnabled?: boolean;
  maxParticipants?: number;
}

export interface ScreenShareSettings extends ChannelSettings {
  provider: 'zoom' | 'teams' | 'custom' | 'jitsi';
  maxParticipants?: number;
  allowControl: boolean;
  maxParticipants?: number;
}


export interface QuietHours {
  start: string; // "22:00"
  end: string; // "08:00"
  timezone: string;
}



type AdvancedChannelConfigMap = {
  chat: { enabled: boolean } & ChatSettings;
  calendar: { enabled: boolean } & CalendarIntegrationSettings;
  audioCall: { enabled: boolean } & VoiceSettings;
  videoCall: { enabled: boolean } & VideoSettings;
  screenShare: { enabled: boolean } & ScreenShareSettings;
};


export class NotificationChannelManager {
  private channels: Partial<NotificationChannels> = {};
  private endpointConfig: NotificationEndpointConfig = {} as NotificationEndpointConfig;  // Initialize as empty object

  constructor(initialConfig?: Partial<NotificationChannels>) {
    if (initialConfig) {
      this.channels = initialConfig;
    }
    this.updateEndpointConfig(); // Initialize endpoint config
  }

  // Enable/disable basic channels
  setChannel<K extends BasicChannels>(
    channel: K,
    enabled: boolean | (K extends 'email' ? EmailSettings :
      K extends 'push' ? PushNotificationSettings :
      K extends 'sms' ? SmsSettings :
      K extends 'inApp' ? InAppSettings :
      K extends 'webhook' ? WebhookSettings : never)
  ) {
    // Use type guards for safe assignment
    if (channel === 'email') {
      this.channels.email = enabled as boolean | EmailSettings;
    } else if (channel === 'push') {
      this.channels.push = enabled as boolean | PushNotificationSettings;
    } else if (channel === 'sms') {
      this.channels.sms = enabled as boolean | SmsSettings;
    } else if (channel === 'inApp') {
      this.channels.inApp = enabled as boolean | InAppSettings;
    } else if (channel === 'webhook') {
      this.channels.webhook = enabled as boolean | WebhookSettings;
    }

    this.updateEndpointConfig();
  }



  // ========== ADVANCED CHANNEL METHODS (TYPE-SAFE) ==========
  setChatSettings(config: { enabled: boolean } & ChatSettings) {
    this.setAdvancedChannel('chat', config);
  }

  setCalendarSettings(config: { enabled: boolean } & CalendarIntegrationSettings) {
    this.setAdvancedChannel('calendar', config);
  }

  setAudioCallSettings(config: { enabled: boolean } & VoiceSettings) {
    this.setAdvancedChannel('audioCall', config);
  }

  setVideoCallSettings(config: { enabled: boolean } & VideoSettings) {
    this.setAdvancedChannel('videoCall', config);
  }

  setScreenShareSettings(config: { enabled: boolean } & ScreenShareSettings) {
    this.setAdvancedChannel('screenShare', config);
  }


  // ========== ADVANCED CHANNEL METHODS ==========
  // Overload signatures for setAdvancedChannel
  setAdvancedChannel(channel: 'chat', config: { enabled: boolean } & ChatSettings): void;
  setAdvancedChannel(channel: 'calendar', config: { enabled: boolean } & CalendarIntegrationSettings): void;
  setAdvancedChannel(channel: 'audioCall', config: { enabled: boolean } & VoiceSettings): void;
  setAdvancedChannel(channel: 'videoCall', config: { enabled: boolean } & VideoSettings): void;
  setAdvancedChannel(channel: 'screenShare', config: { enabled: boolean } & ScreenShareSettings): void;


 setAdvancedChannel<K extends keyof AdvancedChannelConfigMap>(
    channel: K,
    config: AdvancedChannelConfigMap[K]
  ) {
    if (!this.channels.advanced) this.channels.advanced = {};
    this.channels.advanced[channel] = config;
    this.updateEndpointConfig();
  }
  
  // Check if any channel is enabled
  isAnyChannelEnabled(): boolean {
    const basicChannels: BasicChannels[] = ['email', 'push', 'sms', 'inApp', 'webhook'];

    // Check basic channels
    for (const channel of basicChannels) {
      if (this.isChannelEnabled(channel as BasicChannels)) {
        return true;
      }
    }

    // Check advanced channels
    if (this.channels.advanced) {
      const advancedKeys = Object.keys(this.channels.advanced) as AdvancedChannels[];
      for (const channel of advancedKeys) {
        const config = this.channels.advanced[channel];
        if (config && config.enabled) {
          return true;
        }
      }
    }

    return false;
  }


  // Helper method to check if a basic channel is enabled
  private isChannelEnabled(channel: BasicChannels): boolean {
    const settings = this.channels[channel];
    if (typeof settings === 'boolean') {
      return settings;
    }
    if (settings && typeof settings === 'object') {
      return settings.enabled !== false;
    }
    return false;
  }

  setupCryptoNotifications() {
    if (!this.channels.crypto) {
      this.channels.crypto = {
        id: 'crypto_1',           // string id for the crypto
        name: 'Bitcoin',           // display name
        symbol: 'BTC',             // ticker symbol
        currentPrice: 0,           // default current price
        priceChange24h: 0,         // default 24h change
        marketCap: 0               // default market cap
      };
    }

    this.channels.crypto.cryptoAlerts = {
      enabled: true,
      priority: 1,
      fallbackOrder: ['push', 'inApp', 'email']
    };

    this.channels.crypto.tradeExecutions = {
      enabled: true,
      priority: 1
    };

    this.channels.crypto.portfolioUpdates = {
      enabled: false,
      priority: 3
    };

    // Setup crypto-specific chat
    this.setAdvancedChannel('chat', {
      enabled: true,
      platform: 'discord',
      channelId: 'crypto-trading-alerts',
      username: 'Crypto Bot'
    });

    this.updateEndpointConfig();
  }

  // Project notifications setup
  setupProjectNotifications() {
    // Initialize project if undefined
    if (!this.channels.project) {
      this.channels.project = {
        id: 'project_1',
        name: 'My Project',
        description: 'Project Description',
        members: [],
        leader: '',
        budget: '',
        phase: '',
        phases: [],
      
        tasks: [],                 // default empty
        startDate: new Date(),     // default now
        endDate: new Date(),       // default now
        isActive: true,            // default
        phaseUpdates: { enabled: false, priority: 0 },
        taskAssignments: { enabled: false, priority: 0 },
        collaborationRequests: { enabled: false, priority: 0 },
        // add any other required fields with default values
      } as Project<any, any, any, any, any, any>; // cast if needed
    }

    const projectChannel = this.channels.project; // TS now knows it exists

    projectChannel.phaseUpdates = {
      enabled: true,
      priority: 2
    };

    projectChannel.taskAssignments = {
      enabled: true,
      priority: 2
    };

    projectChannel.collaborationRequests = {
      enabled: true,
      priority: 1
    };

    // Setup collaboration tools
    this.setAdvancedChannel('videoCall', {
      enabled: true,
      provider: 'jitsi',
      recordingEnabled: true,
      maxParticipants: 25
    });

    this.setAdvancedChannel('screenShare', {
      enabled: true,
      provider: 'jitsi',
      maxParticipants: 10,
      allowControl: true
    });

    this.updateEndpointConfig();
  }

  // Get all enabled channels
  getEnabledChannels(): string[] {
    const enabled: string[] = [];

    // Basic channels
    const basicChannels: BasicChannels[] = ['email', 'push', 'sms', 'inApp', 'webhook'];
    basicChannels.forEach(channel => {
      if (this.isChannelEnabled(channel)) {
        enabled.push(channel);
      }
    });

    // Advanced channels
    if (this.channels.advanced) {
      Object.entries(this.channels.advanced).forEach(([key, config]) => {
        if (config?.enabled) {
          enabled.push(key);
        }
      });
    }

    // Crypto channels
    if (this.channels.crypto) {
      Object.entries(this.channels.crypto).forEach(([key, config]) => {
        if (config?.enabled) {
          enabled.push(`crypto.${key}`);
        }
      });
    }

    // Project channels
    if (this.channels.project) {
      Object.entries(this.channels.project).forEach(([key, config]) => {
        if (config?.enabled) {
          enabled.push(`project.${key}`);
        }
      });
    }

    return enabled;
  }

  // Get channel configuration for UI
  getChannelConfigForUI() {
    return {
      basic: this.getBasicChannelConfig(),
      advanced: this.channels.advanced,
      crypto: this.channels.crypto,
      project: this.channels.project,
      global: {
        deliveryStrategy: this.channels.deliveryStrategy,
        retryPolicy: this.channels.retryPolicy,
        quietHours: this.channels.quietHours
      }
    };
  }

  // Update user preferences
  updateUserPreferences(preferences: NotificationChannels['userPreferences']) {
    this.channels.userPreferences = {
      ...this.channels.userPreferences,
      ...preferences
    };
  }

  // Private methods

  private updateEndpointConfig() {
    const config: NotificationEndpointConfig = {};

    // Basic channels
    const basicChannels: BasicChannels[] = ['email', 'push', 'sms', 'inApp', 'webhook'];
    basicChannels.forEach(channel => {
      const settings = this.channels[channel];
      if (settings && this.isChannelEnabled(channel)) {
        config[channel] = typeof settings === 'boolean' ? {} : settings;
      }
    });

    // Advanced channels
    if (this.channels.advanced) {
      Object.entries(this.channels.advanced).forEach(([key, configValue]: [string, any]) => {
        if (configValue?.enabled) {
          const { enabled, ...settings } = configValue;
          config[key as keyof NotificationEndpointConfig] = settings;
        }
      });
    }

    // Global settings
    config.deliveryStrategy = this.channels.deliveryStrategy;
    config.retryPolicy = this.channels.retryPolicy;
    config.quietHours = this.channels.quietHours;

    this.endpointConfig = config;
  }

  getChannelEndpointConfig(): NotificationEndpointConfig {
    return this.endpointConfig;
  }

  private getBasicChannelConfig() {
    const config: Record<string, any> = {};
    const basicChannels: BasicChannels[] = ['email', 'push', 'sms', 'inApp', 'webhook'];

    basicChannels.forEach(channel => {
      const settings = this.channels[channel];
      if (settings) {
        config[channel] = typeof settings === 'boolean' ?
          { enabled: settings } : settings;
      }
    });

    return config;
  }
}



export const notificationChannelHelper = {
  // This integrates with your EndpointConfigManager
  registerNotificationEndpoints(endpointManager: any) {
    const channelManager = new NotificationChannelManager();

    // Configure channels based on your app's needs
    channelManager.setChannel('email', true);
    channelManager.setChannel('push', { enabled: true, sound: 'default' });

    // Configure advanced channels for your crypto and collaboration features
    channelManager.setAdvancedChannel('chat', {
      enabled: true,
      platform: 'slack',
      channelId: 'crypto-alerts',
      botToken: process.env.SLACK_BOT_TOKEN
    });

    channelManager.setAdvancedChannel('videoCall', {
      enabled: true,
      provider: 'zoom',
      recordingEnabled: true
    });

    // Get config and register with your endpoint manager
    const channelConfig = channelManager.getChannelEndpointConfig();
    endpointManager.addEndpointGroup('notifications', channelConfig);
  },

  // Type-safe helper for processing channels
  processChannelConfig(channels: NotificationChannels) {
    const channelData: Record<string, any> = {};

    // Process basic channels
    const basicChannels: BasicChannels[] = ['email', 'push', 'sms', 'inApp', 'webhook'];
    basicChannels.forEach(channel => {
      const settings = channels[channel];
      if (settings) {
        channelData[`${channel}Settings`] =
          typeof settings === 'boolean' ? { enabled: settings } : settings;
      }
    });

    // Process advanced channels
    if (channels.advanced) {
      Object.entries(channels.advanced).forEach(([key, config]) => {
        if (config && config.enabled) {
          channelData[`${key}Settings`] = config;
        }
      });
    }

    return channelData;
  }


};