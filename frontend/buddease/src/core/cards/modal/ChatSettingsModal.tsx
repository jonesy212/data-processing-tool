// ChatSettingsModal.tsx
import { CryptoPreferences } from '@/core/config/UserPreferences';
import { CollaborationPreferences } from '@/core/interfaces/settings/CollaborationPreferences';
import type { GeneralNotificationTypes } from '@/core/notifications/NotificationChannels';
import { DocumentEditingPermissions } from '@/core/permissions/Permission';
import { PrivacySettings } from '@/core/settings/PrivacySettings';
import type { SecuritySettings } from '@/core/settings/SecuritySettings';

// Define the ChatSettingsModal type
type ChatSettingsModal = {
  close: () => void;
  isOpen: () => boolean;
  setNotificationPreferences: (
    preferences: NotificationPreferences
  ) => void;
  setAudioOptions: (
    options: AudioOptions,
    audioOptions: AudioOptions,
    roomId: string,
  ) => Promise<void>;
  setVideoOptions: (
    options: VideoOptions,
    videoOptions: VideoOptions,
    roomId: string
  ) => Promise<void>;
  setPrivacySettings: (
    videoId: string,
    selectedSettings: PrivacySettings,
    settings: PrivacySettings
  ) => void;
  setSecuritySettings: (
    selectedSettings: SecuritySettings,
    videoId: string,
    settings: SecuritySettings) => void;
  setDocumentEditingPermissions: (
    permissions: DocumentEditingPermissions[]
  ) => void;
  setCollaborationPreferences: (preferences: CollaborationPreferences) => void;
  // Other properties and methods specific to the modal
};

type CommonNotificationSettings = {
  email: boolean;
  sms: boolean;
  pushNotifications: boolean;
  desktopNotifications: boolean;
  emailFrequency: string; // Adjust type if needed (e.g., 'daily', 'weekly')
  smsFrequency: string; // Adjust type if needed (e.g., 'daily', 'weekly')
};

// Define related types
type NotificationPreferences = {
  mobile: CommonNotificationSettings;
  desktop: CommonNotificationSettings;
  tablet: CommonNotificationSettings; // Add tablet section
  
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean,
  desktopNotifications: boolean,
  enableNotifications: boolean;
  notificationSound: string;
  notificationVolume: number;
  notificationTypes?: GeneralNotificationTypes; // Use the appropriate type here
  customNotificationSettings: any;

  cryptoPreferences: CryptoPreferences,

};

type AudioOptions = {
  enableAudio: boolean;
  audioInputDevice: string;
  audioOutputDevice: string;
};

type VideoOptions = {
  id?: string
  enableVideo: boolean;
  videoInputDevice: string;
  // Other video-related options

}


export type { AudioOptions, ChatSettingsModal, NotificationPreferences, VideoOptions };

