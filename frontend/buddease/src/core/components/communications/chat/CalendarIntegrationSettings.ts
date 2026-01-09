CalendarIntegrationSettings.ts
// Supporting interfaces for your specific channels
interface CalendarIntegrationSettings {
  syncDirection: 'bidirectional' | 'one-way';
  updateExisting: boolean;
  addAs: 'event' | 'task' | 'reminder';
  visibility: 'default' | 'private' | 'public';
}

interface VoiceSettings {
  provider: 'twilio' | 'vonage' | 'custom';
  voice: 'male' | 'female' | 'custom';
  language: string;
  retryAttempts: number;
}

interface VideoSettings {
  autoJoin: boolean;
  enableVideo: boolean;
  enableAudio: boolean;
  recording: {
    enabled: boolean;
    requireConsent: boolean;
  };
}

interface ScreenShareSettings {
  quality: 'low' | 'medium' | 'high' | 'original';
  frameRate: number;
  includeAudio: boolean;
  requireApproval: boolean;
}



export type {
CalendarIntegrationSettings,
VoiceSettings,
VideoSettings,
ScreenShareSettings
}