import { CollaborationPreferences } from "../../interfaces/settings/CollaborationPreferences";
import { PrivacySettings } from "../../settings/PrivacySettings";

// Define the ChatSettingsModal type
type ChatSettingsModal = {
  close: () => void;
  isOpen: () => boolean;
  setNotificationPreferences: (preferences: NotificationPreferences) => void;
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

// Define related types
type NotificationPreferences = {
  mobile: boolean,
  desktop: boolean,
  emailNotifications: boolean;
  pushNotifications: boolean;
  enableNotifications: boolean;
  notificationSound: string;
  notificationVolume: number;
  sms: boolean;
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
};

type DocumentEditingPermissions = {
  canEdit: boolean;
  canComment: boolean;
  // Other permissions
};





export type {
  AudioOptions, ChatSettingsModal, DocumentEditingPermissions, NotificationPreferences, VideoOptions
};

