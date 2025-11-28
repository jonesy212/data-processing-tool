// NotificationChannelHelper.ts
import { NotificationChannels } from '@/app/notifications/NotificationChannels'
import { AxiosError } from 'axios';

// Define which channels are in advanced vs basic - CORRECTED
type BasicChannels = 'email' | 'push' | 'sms' | 'inApp' | 'webhook';
type AdvancedChannels = 'chat' | 'calendar' | 'audioCall' | 'videoCall' | 'screenShare';
type AllChannels = BasicChannels | `advanced.${AdvancedChannels}`; // Use dot notation for nested

// Helper functions for easy migration
class NotificationChannelHelper {
  // Check if it's a basic channel
  static isAdvancedEnabled(channels: NotificationChannels, channel: AdvancedChannels): boolean {
    return channels.advanced?.[channel]?.enabled ?? false;
  }

  // Get advanced settings with proper typing
  static getAdvancedSettings<T>(channels: NotificationChannels, channel: AdvancedChannels): T | undefined {
    return channels.advanced?.[channel] as T | undefined;
  }

  // Basic channel methods
  static isBasicEnabled(channels: NotificationChannels, channel: BasicChannels): boolean {
    const channelSetting = channels[channel];
    if (typeof channelSetting === 'boolean') {
      return channelSetting;
    }
    return (channelSetting as any)?.enabled ?? false;
  }

  static getBasicSettings<T>(channels: NotificationChannels, channel: BasicChannels): T | undefined {
    const channelSetting = channels[channel];
    if (typeof channelSetting === 'object' && channelSetting !== null) {
      return channelSetting as T;
    }
    return undefined;
  }

  // Universal methods with proper type handling
  static isChannelEnabled(channels: NotificationChannels, channel: AllChannels): boolean {
    if (this.isBasicChannel(channel)) {
      return this.isBasicEnabled(channels, channel);
    } else {
      const advancedChannel = this.extractAdvancedChannel(channel);
      return advancedChannel ? this.isAdvancedEnabled(channels, advancedChannel) : false;
    }
  }

  static getChannelSettings<T>(channels: NotificationChannels, channel: AllChannels): T | undefined {
    if (this.isBasicChannel(channel)) {
      return this.getBasicSettings(channels, channel);
    } else {
      const advancedChannel = this.extractAdvancedChannel(channel);
      return advancedChannel ? this.getAdvancedSettings(channels, advancedChannel) : undefined;
    }
  }

  // Private helper methods with correct types
  private static isBasicChannel(channel: AllChannels): channel is BasicChannels {
    return ['email', 'push', 'sms', 'inApp', 'webhook'].includes(channel as BasicChannels);
  }

  private static extractAdvancedChannel(channel: AllChannels): AdvancedChannels | null {
    if (channel.startsWith('advanced.')) {
      return channel.replace('advanced.', '') as AdvancedChannels;
    }
    return null;
  }

  // Convert simple settings to advanced (migration path)
  static upgradeToAdvanced(channels: NotificationChannels): NotificationChannels {
    const upgraded: NotificationChannels = { ...channels };
    
    // Ensure advanced property exists
    if (!upgraded.advanced) {
      upgraded.advanced = {};
    }

    (Object.keys(channels) as Array<BasicChannels>).forEach(key => {
      if (typeof channels[key] === 'boolean' && channels[key] === true) {
        // Only convert basic channels that can have advanced settings
        if (this.canHaveAdvancedSettings(key)) {
          (upgraded.advanced as any)[key] = this.getDefaultAdvancedSettings(key);
        }
      }
    });

    return upgraded;
  }

  // NEW: Get all enabled channels
  static getEnabledChannels(channels: NotificationChannels): AllChannels[] {
    const enabled: AllChannels[] = [];

    // Check basic channels
    (['email', 'push', 'sms', 'inApp', 'webhook'] as BasicChannels[]).forEach(channel => {
      if (this.isBasicEnabled(channels, channel)) {
        enabled.push(channel);
      }
    });

    // Check advanced channels
    if (channels.advanced) {
      (['chat', 'calendar', 'audioCall', 'videoCall', 'screenShare'] as AdvancedChannels[]).forEach(channel => {
        if (this.isAdvancedEnabled(channels, channel)) {
          enabled.push(`advanced.${channel}` as AllChannels);
        }
      });
    }

    return enabled;
  }

  // Default settings with proper typing
  private static getDefaultAdvancedSettings(channel: BasicChannels | AdvancedChannels): any {
    const defaults = {
      // Basic channels with advanced settings
      email: { enabled: true, templates: 'default', priority: 'normal' },
      push: { enabled: true, priority: 'normal', ttl: 3600 },
      sms: { enabled: true, provider: 'default', priority: 'normal' },
      inApp: { enabled: true, sound: true, popupAlerts: true },
      webhook: { enabled: true, url: '' },
      
      // Advanced channels
      chat: { enabled: true, platforms: ['slack'], messageFormat: 'text' },
      calendar: { enabled: true, sync: true, reminders: true },
      audioCall: { enabled: true, maxDuration: 3600 },
      videoCall: { enabled: true, maxDuration: 3600, quality: 'hd' },
      screenShare: { enabled: true, annotations: true },
    };
    
    return defaults[channel] || { enabled: true };
  }

  private static canHaveAdvancedSettings(channel: BasicChannels): boolean {
    return ['email', 'push', 'sms', 'inApp', 'webhook'].includes(channel);
  }
}

export { NotificationChannelHelper, type BasicChannels, type AdvancedChannels, type AllChannels }