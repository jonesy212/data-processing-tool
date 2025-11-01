import { SecuritySettings } from '@/app/settings/SecuritySettings'
import { CollaborationPreferences } from '@/app/interfaces/settings/CollaborationPreferences';
import { DocumentEditingPermissions } from '@/app/permissions/Permission';
import { GeneralNotificationTypes } from '@/app/notifications/NotificationChannels';
import { PrivacySettings } from '@/app/settings/PrivacySettings';
import { CryptoPreferences } from '@/app/config/UserPreferences';

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
  enableVideo: boolean;
  videoInputDevice: string;
  // Other video-related options

}


export type { AudioOptions, ChatSettingsModal, NotificationPreferences, VideoOptions };

