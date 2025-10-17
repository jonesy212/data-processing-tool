// NotificationChannelHelperImpl.ts
import { NotificationChannels } from '@/app/settings/NotificationChannels';
import { NotificationChannelHelper } from '@/app/settings/NotificationChannelHelper'

export class NotificationChannelHelperImpl implements NotificationChannelHelper {
  private channels: NotificationChannels;

  constructor(channels: NotificationChannels) {
    this.channels = channels;
  }

  // Enable a channel
  enableChannel(channel: keyof NotificationChannels): void {
    this.channels[channel] = true;
  }

  // Disable a channel
  disableChannel(channel: keyof NotificationChannels): void {
    this.channels[channel] = false;
  }

  // Toggle channel
  toggleChannel(channel: keyof NotificationChannels): void {
    this.channels[channel] = !this.channels[channel];
  }

  // Check if a channel is active
  isChannelActive(channel: keyof NotificationChannels): boolean {
    return this.channels[channel];
  }

  // Get all active channels
  getActiveChannels(): (keyof NotificationChannels)[] {
    return Object.keys(this.channels).filter(
      (key) => this.channels[key as keyof NotificationChannels]
    ) as (keyof NotificationChannels)[];
  }

  // Get current channel state
  getChannels(): NotificationChannels {
    return this.channels;
  }
}
