import { NotificationChannels } from '@/app/notifications/NotificationChannels'

// Define which channels are in advanced vs basic
type BasicChannels = 'email' | 'push' | 'sms' | 'inApp' | 'webhook';
type AdvancedChannels = 'chat' | 'calendar' | 'audioCall' | 'videoCall' | 'screenShare';
type AllChannels = BasicChannels | AdvancedChannels;

// Helper functions for easy migration
class NotificationChannelHelper {
  // Keep your existing method signature but fix the logic
  static isAdvancedEnabled(channels: NotificationChannels, channel: keyof NotificationChannels): boolean {
    // Check if it's a basic channel with boolean value
    if (this.isBasicChannel(channel) && typeof channels[channel] === 'boolean') {
      return channels[channel] as boolean;
    }
    
    // Check if it's an advanced channel
    if (this.isAdvancedChannel(channel)) {
      return channels.advanced?.[channel]?.enabled ?? false;
    }
    
    return false;
  }

  // Keep your existing method signature but fix the logic
  static getAdvancedSettings<T>(channels: NotificationChannels, channel: keyof NotificationChannels): T | undefined {
    // For basic channels, return their settings if they exist
    if (this.isBasicChannel(channel)) {
      const channelSetting = channels[channel];
      if (typeof channelSetting === 'object' && channelSetting !== null) {
        return channelSetting as T;
      }
      return undefined;
    }
    
    // For advanced channels, return from advanced object
    if (this.isAdvancedChannel(channel)) {
      return channels.advanced?.[channel] as T;
    }
    
    return undefined;
  }

  // Convert simple settings to advanced (migration path)
  static upgradeToAdvanced(channels: NotificationChannels): NotificationChannels {
    const advanced: any = {};
    
    (Object.keys(channels) as Array<keyof NotificationChannels>).forEach(key => {
      if (typeof channels[key] === 'boolean' && channels[key] === true) {
        // Only convert basic channels that can have advanced settings
        if (this.isBasicChannel(key) && this.hasAdvancedSettings(key)) {
          advanced[key] = this.getDefaultAdvancedSettings(key);
        }
      }
    });

    return {
      ...channels,
      advanced: {
        ...channels.advanced,
        ...advanced
      }
    };
  }

  // NEW: Additional helper methods for better type safety
  static isBasicEnabled(channels: NotificationChannels, channel: BasicChannels): boolean {
    const channelSetting = channels[channel];
    if (typeof channelSetting === 'boolean') {
      return channelSetting;
    }
    return channelSetting !== undefined;
  }

  static getBasicSettings<T>(channels: NotificationChannels, channel: BasicChannels): T | undefined {
    const channelSetting = channels[channel];
    if (typeof channelSetting === 'object' && channelSetting !== null) {
      return channelSetting as T;
    }
    return undefined;
  }

  // Universal methods that work with any channel type
  static isChannelEnabled(channels: NotificationChannels, channel: AllChannels): boolean {
    if (this.isBasicChannel(channel)) {
      return this.isBasicEnabled(channels, channel);
    } else {
      return this.isAdvancedEnabled(channels, channel);
    }
  }

  static getChannelSettings<T>(channels: NotificationChannels, channel: AllChannels): T | undefined {
    if (this.isBasicChannel(channel)) {
      return this.getBasicSettings(channels, channel);
    } else {
      return this.getAdvancedSettings(channels, channel);
    }
  }

  // Private helper methods
  private static isBasicChannel(channel: keyof NotificationChannels): channel is BasicChannels {
    return ['email', 'push', 'sms', 'inApp', 'webhook'].includes(channel);
  }

  private static isAdvancedChannel(channel: keyof NotificationChannels): channel is AdvancedChannels {
    return ['chat', 'calendar', 'audioCall', 'videoCall', 'screenShare'].includes(channel);
  }

  private static hasAdvancedSettings(channel: BasicChannels): boolean {
    // Define which basic channels can have advanced settings
    return ['email', 'push', 'sms'].includes(channel);
  }

  private static getDefaultAdvancedSettings(channel: keyof NotificationChannels): any {
    const defaults = {
      // Basic channels with advanced settings
      email: { enabled: true, templates: 'default', priority: 'normal' },
      push: { enabled: true, priority: 'normal', ttl: 3600 },
      sms: { enabled: true, provider: 'default', priority: 'normal' },
      
      // Advanced channels (these should already have enabled property)
      chat: { enabled: true, platforms: ['slack'], messageFormat: 'text' },
      calendar: { enabled: true, sync: true, reminders: true },
      audioCall: { enabled: true, maxDuration: 3600 },
      videoCall: { enabled: true, maxDuration: 3600, quality: 'hd' },
      screenShare: { enabled: true, annotations: true },
      
      // Basic channels that don't typically have advanced settings
      inApp: { enabled: true, sound: true, popupAlerts: true },
      webhook: { enabled: true, url: '' },
    };
    
    return defaults[channel] || { enabled: true };
  }
}

export { NotificationChannelHelper, type BasicChannels, type AdvancedChannels, type AllChannels }