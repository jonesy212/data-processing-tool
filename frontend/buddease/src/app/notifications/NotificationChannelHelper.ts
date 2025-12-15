// NotificationChannelHelper.ts - Fixed Version
import { NotificationChannels } from '@/app/notifications/NotificationChannels'

type BasicChannels = 'email' | 'push' | 'sms' | 'inApp' | 'webhook';
type AdvancedChannelKeys = 'chat' | 'calendar' | 'audioCall' | 'videoCall' | 'screenShare';
type AllChannels = BasicChannels | `advanced.${AdvancedChannelKeys}`;

// Type guard to check if a value is a valid NotificationChannels value
const isNotificationChannelValue = (
  value: any
): value is 
  | boolean 
  | NotificationChannels['email']
  | NotificationChannels['push']
  | NotificationChannels['sms']
  | NotificationChannels['inApp']
  | NotificationChannels['webhook'] => {
  return (
    typeof value === 'boolean' ||
    (value && typeof value === 'object' && 'enabled' in value)
  );
};

class NotificationChannelHelper {
  // Type-safe advanced channels
  static readonly ADVANCED_CHANNELS: AdvancedChannelKeys[] = [
    'chat', 'calendar', 'audioCall', 'videoCall', 'screenShare'
  ];

  static readonly BASIC_CHANNELS: BasicChannels[] = [
    'email', 'push', 'sms', 'inApp', 'webhook'
  ];

  // Check if advanced channel is enabled
  static isAdvancedEnabled(channels: NotificationChannels, channel: AdvancedChannelKeys): boolean {
    return channels.advanced?.[channel]?.enabled ?? false;
  }

  // Get advanced settings with proper typing
  static getAdvancedSettings<K extends AdvancedChannelKeys>(
    channels: NotificationChannels, 
    channel: K
  ): Extract<NonNullable<NotificationChannels['advanced']>[K], { enabled: boolean }> | undefined {
    const settings = channels.advanced?.[channel];
    return settings?.enabled ? settings as any : undefined;
  }

  // Check if basic channel is enabled
  static isBasicEnabled(channels: NotificationChannels, channel: BasicChannels): boolean {
    const setting = channels[channel];
    
    if (typeof setting === 'boolean') {
      return setting;
    }
    
    if (setting && typeof setting === 'object') {
      // Type guard to check if it has enabled property
      const obj = setting as any;
      return obj.enabled !== false;
    }
    
    return false;
  }

  // Get basic settings with proper typing
  static getBasicSettings<K extends BasicChannels>(
    channels: NotificationChannels, 
    channel: K
  ): Extract<NotificationChannels[K], object> | undefined {
    const setting = channels[channel];
    
    if (setting && typeof setting === 'object') {
      return setting as Extract<NotificationChannels[K], object>;
    }
    
    return undefined;
  }

  // Get all enabled channels
  static getEnabledChannels(channels: NotificationChannels): AllChannels[] {
    const enabled: AllChannels[] = [];

    // Basic channels
    this.BASIC_CHANNELS.forEach(channel => {
      if (this.isBasicEnabled(channels, channel)) {
        enabled.push(channel);
      }
    });

    // Advanced channels
    this.ADVANCED_CHANNELS.forEach(channel => {
      if (this.isAdvancedEnabled(channels, channel)) {
        enabled.push(`advanced.${channel}` as AllChannels);
      }
    });

    return enabled;
  }

  // Get default settings (type-safe)
  static getDefaultSettings<K extends BasicChannels | AdvancedChannelKeys>(
    channel: K
  ): any {
    const defaults = {
      email: { enabled: true, templates: 'default', priority: 'normal' },
      push: { enabled: true, priority: 'normal', ttl: 3600 },
      sms: { enabled: true, provider: 'default', priority: 'normal' },
      inApp: { enabled: true, sound: true, popupAlerts: true },
      webhook: { enabled: true, url: '' },
      chat: { enabled: true, platforms: ['slack'], messageFormat: 'text' },
      calendar: { enabled: true, sync: true, reminders: true },
      audioCall: { enabled: true, maxDuration: 3600 },
      videoCall: { enabled: true, maxDuration: 3600, quality: 'hd' },
      screenShare: { enabled: true, annotations: true },
    };

    return defaults[channel as keyof typeof defaults] || { enabled: true };
  }

  // Merge two channel configurations (FIXED VERSION)
  static mergeChannels(
    base: NotificationChannels,
    overrides: Partial<NotificationChannels>
  ): NotificationChannels {
    const merged: NotificationChannels = { ...base };

    // Merge basic channels with type-safe assignment
    this.BASIC_CHANNELS.forEach(channel => {
      const overrideValue = overrides[channel];
      if (overrideValue !== undefined) {
        // Type-safe assignment using a type assertion
        (merged as any)[channel] = overrideValue;
      }
    });

    // Merge advanced channels
    if (overrides.advanced) {
      if (!merged.advanced) {
        merged.advanced = {};
      }
      
      Object.entries(overrides.advanced).forEach(([key, value]) => {
        if (value !== undefined) {
          (merged.advanced as any)[key] = value;
        }
      });
    }

    // Merge global settings
    if (overrides.deliveryStrategy) {
      merged.deliveryStrategy = overrides.deliveryStrategy;
    }
    if (overrides.retryPolicy) {
      merged.retryPolicy = overrides.retryPolicy;
    }
    if (overrides.quietHours) {
      merged.quietHours = overrides.quietHours;
    }

    return merged;
  }

  // Alternative: Type-safe merge with validation
  static mergeChannelsSafe(
    base: NotificationChannels,
    overrides: Partial<NotificationChannels>
  ): NotificationChannels {
    const merged = { ...base } as any;

    // Handle basic channels with type-safe approach
    this.BASIC_CHANNELS.forEach(channel => {
      if (overrides[channel] !== undefined) {
        // Validate and assign
        const overrideValue = overrides[channel];
        if (isNotificationChannelValue(overrideValue)) {
          merged[channel] = overrideValue;
        }
      }
    });

    // Handle advanced
    if (overrides.advanced) {
      if (!merged.advanced) merged.advanced = {};
      
      Object.entries(overrides.advanced).forEach(([key, value]) => {
        if (value && typeof value === 'object' && 'enabled' in value) {
          merged.advanced[key] = value;
        }
      });
    }

    // Handle global settings
    const globalKeys = ['deliveryStrategy', 'retryPolicy', 'quietHours'] as const;
    globalKeys.forEach(key => {
      if (overrides[key]) {
        merged[key] = overrides[key];
      }
    });

    return merged as NotificationChannels;
  }

  // Convert NotificationChannels to a simple enabled/disabled map
  static toEnabledMap(channels: NotificationChannels): Record<string, boolean> {
    const map: Record<string, boolean> = {};
    
    // Basic channels
    this.BASIC_CHANNELS.forEach(channel => {
      map[channel] = this.isBasicEnabled(channels, channel);
    });

    // Advanced channels
    this.ADVANCED_CHANNELS.forEach(channel => {
      map[`advanced.${channel}`] = this.isAdvancedEnabled(channels, channel);
    });

    return map;
  }

  // Validate channel configuration
  static validateConfig(channels: NotificationChannels): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields for enabled channels
    this.BASIC_CHANNELS.forEach(channel => {
      if (this.isBasicEnabled(channels, channel)) {
        const settings = this.getBasicSettings(channels, channel);
        if (settings && this.hasMissingBasicSettings(channel, settings)) {
          errors.push(`Missing required settings for ${channel}`);
        }
      }
    });

    this.ADVANCED_CHANNELS.forEach(channel => {
      if (this.isAdvancedEnabled(channels, channel)) {
        const settings = this.getAdvancedSettings(channels, channel);
        if (settings && this.hasMissingAdvancedSettings(channel, settings)) {
          errors.push(`Missing required settings for advanced.${channel}`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private static hasMissingBasicSettings(
    channel: BasicChannels,
    settings: any
  ): boolean {
    const requirements: Partial<Record<BasicChannels, string[]>> = {
      webhook: ['url'] // webhook requires URL when enabled
    };

    const required = requirements[channel] || [];
    return required.some(field => !settings[field]);
  }

  private static hasMissingAdvancedSettings(
    channel: AdvancedChannelKeys,
    settings: any
  ): boolean {
    const requirements: Partial<Record<AdvancedChannelKeys, string[]>> = {
      chat: ['platform'],
      calendar: ['calendarType'],
      audioCall: ['provider'],
      videoCall: ['provider'],
      screenShare: ['provider']
    };

    const required = requirements[channel] || [];
    return required.some(field => !settings[field]);
  }

  // Upgrade basic boolean settings to full settings
  static upgradeBasicSettings(channels: NotificationChannels): NotificationChannels {
    const upgraded = { ...channels } as any;

    this.BASIC_CHANNELS.forEach(channel => {
      const current = channels[channel];
      
      if (current === true) {
        // Convert boolean true to default settings
        upgraded[channel] = this.getDefaultSettings(channel);
      } else if (typeof current === 'object' && current !== null) {
        // Ensure enabled is set - FIXED SPREAD OPERATOR
        const currentObj = current as Record<string, any>;
        if (!('enabled' in currentObj)) {
          // Create a new object with enabled property
          upgraded[channel] = { 
            ...(currentObj as object), // Type assertion to object
            enabled: true 
          };
        }
      }
    });

    // Ensure advanced exists
    if (!upgraded.advanced) {
      upgraded.advanced = {};
    }

    return upgraded as NotificationChannels;
  }
  // Get channel configuration for a specific notification type
  static getConfigForNotificationType(
    channels: NotificationChannels,
    type: 'urgent' | 'normal' | 'low' | 'crypto' | 'collaboration'
  ): { channels: AllChannels[]; strategy: 'all' | 'sequential' | 'priority' } {
    const enabledChannels = this.getEnabledChannels(channels);
    
    const configs: Record<string, { channels: AllChannels[]; strategy: 'all' | 'sequential' | 'priority' }> = {
      urgent: {
        channels: enabledChannels.filter(ch => 
          !ch.startsWith('advanced.calendar') && 
          !ch.startsWith('advanced.screenShare')
        ),
        strategy: 'all'
      },
      normal: {
        channels: enabledChannels,
        strategy: (channels.deliveryStrategy as 'all' | 'sequential' | 'priority') || 'sequential'
      },
      low: {
        channels: enabledChannels.filter(ch => 
          ch === 'email' || ch.startsWith('advanced.calendar')
        ),
        strategy: 'sequential'
      },
      crypto: {
        channels: enabledChannels.filter(ch => 
          ch === 'push' || ch === 'inApp' || ch.startsWith('advanced.chat')
        ),
        strategy: 'priority'
      },
      collaboration: {
        channels: enabledChannels.filter(ch => 
          ch.startsWith('advanced.videoCall') || 
          ch.startsWith('advanced.audioCall') ||
          ch.startsWith('advanced.screenShare')
        ),
        strategy: 'all'
      }
    };

    return configs[type] || { channels: enabledChannels, strategy: 'sequential' };
  }
}

export { 
  NotificationChannelHelper, 
  type BasicChannels, 
  type AdvancedChannelKeys, 
  type AllChannels 
};