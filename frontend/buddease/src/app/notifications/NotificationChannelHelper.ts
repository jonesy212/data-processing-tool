import { NotificationChannels } from '@/app/notifications/NotificationChannels'

// Helper functions for easy migration
class NotificationChannelHelper {
  static isAdvancedEnabled(channels: NotificationChannels, channel: keyof NotificationChannels): boolean {
    if (typeof channels[channel] === 'boolean') {
      return channels[channel] as boolean;
    }
    return false;
  }

  static getAdvancedSettings<T>(channels: NotificationChannels, channel: keyof NotificationChannels): T | undefined {
    return channels.advanced?.[channel] as T;
  }

  // Convert simple settings to advanced (migration path)
  static upgradeToAdvanced(channels: NotificationChannels): NotificationChannels {
    const advanced: any = {};
    
    (Object.keys(channels) as Array<keyof NotificationChannels>).forEach(key => {
      if (typeof channels[key] === 'boolean' && channels[key] === true) {
        advanced[key] = this.getDefaultAdvancedSettings(key);
      }
    });

    return {
      ...channels,
      advanced
    };
  }

  private static getDefaultAdvancedSettings(channel: keyof NotificationChannels): any {
    const defaults = {
      email: { templates: 'default', priority: 'normal' },
      push: { priority: 'normal', ttl: 3600 },
      chat: { platforms: ['slack'], messageFormat: 'text' },
      // ... defaults for other channels
    };
    return defaults[channel];
  }
}

export { NotificationChannelHelper }