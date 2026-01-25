// NotificationChannelHelperImpl.ts
import type { NotificationChannels } from '@/core/notifications/NotificationChannels';
import { BasicNotificationChannels, NotificationChannelHelper } from '@/core/notifications/NotificationChannelHelper';
    BasicNotificationChannels,
    NotificationChannelHelper,
    NotificationChannels
} from '@/core/notifications/NotificationChannels';


export class NotificationChannelHelperImpl implements NotificationChannelHelper {
  private channels: NotificationChannels;

  constructor(channels: NotificationChannels | BasicNotificationChannels) {
    this.channels = this.normalizeChannels(channels);
  }

  // ======================================
  // 🔹 Normalize channels
  // ======================================
  private normalizeChannels(
    input: NotificationChannels | BasicNotificationChannels
  ): NotificationChannels {
    // Case 1: already a complex structure
    if (typeof (input as NotificationChannels).email === "object") {
      return input as NotificationChannels;
    }

    // Case 2: flat booleans (BasicNotificationChannels)
    const basic = input as BasicNotificationChannels;

    return {
      email: { enabled: !!basic.email },
      push: { enabled: !!basic.push },
      sms: { enabled: !!basic.sms },
      inApp: { enabled: !!basic.inApp },
      webhook: { enabled: !!basic.webhook },

      advanced: {
        chat: { enabled: !!basic.chat },
        calendar: { enabled: !!basic.calendar },
        audioCall: { enabled: !!basic.audioCall },
        videoCall: { enabled: !!basic.videoCall },
        screenShare: { enabled: !!basic.screenShare }
      },

      deliveryStrategy: "all",
      retryPolicy: {
        maxRetries: 3,
        retryInterval: 5000
      },
      quietHours: {
        enabled: false,
        startTime: "22:00",
        endTime: "07:00",
        timeZone: "UTC",
        days: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday"
        ]
      }
    };
  }

  // ======================================
  // 🔹 Channel control methods
  // ======================================

  enableChannel(channel: keyof NotificationChannels | keyof NotificationChannels["advanced"]): void {
    this.setChannelEnabled(channel, true);
  }

  disableChannel(channel: keyof NotificationChannels | keyof NotificationChannels["advanced"]): void {
    this.setChannelEnabled(channel, false);
  }

  toggleChannel(channel: keyof NotificationChannels | keyof NotificationChannels["advanced"]): void {
    const current = this.isChannelActive(channel);
    this.setChannelEnabled(channel, !current);
  }

  isChannelActive(channel: keyof NotificationChannels | keyof NotificationChannels["advanced"]): boolean {
    const ch = (this.channels as any)[channel];
    if (ch?.enabled !== undefined) return ch.enabled;

    const advCh = (this.channels.advanced as any)[channel];
    return advCh?.enabled ?? false;
  }

  getActiveChannels(): string[] {
    const active: string[] = [];

    for (const key of Object.keys(this.channels)) {
      const ch = (this.channels as any)[key];
      if (ch?.enabled) active.push(key);
    }

    for (const key of Object.keys(this.channels.advanced)) {
      const ch = (this.channels.advanced as any)[key];
      if (ch?.enabled) active.push(`advanced:${key}`);
    }

    return active;
  }

  setChannelEnabled(channel: string, enabled: boolean): void {
    if ((this.channels as any)[channel]) {
      (this.channels as any)[channel].enabled = enabled;
    } else if ((this.channels.advanced as any)[channel]) {
      (this.channels.advanced as any)[channel].enabled = enabled;
    } else {
      console.warn(`Channel "${channel}" not found`);
    }
  }

  // ======================================
  // 🔹 Channel state getters
  // ======================================

  getChannels(): NotificationChannels {
    return this.channels;
  }
}
