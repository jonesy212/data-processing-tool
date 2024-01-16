import { CollaborationPreferences } from "../../interfaces/settings/CollaborationPreferences";

// Define the ChatSettingsModal type
type ChatSettingsModal = {
  close: () => void;
  isOpen: () => boolean;
  setNotificationPreferences: (preferences: NotificationPreferences) => void;
  setAudioOptions: (options: AudioOptions) => void;
  setVideoOptions: (options: VideoOptions) => void;
  setDocumentEditingPermissions: (
    permissions: DocumentEditingPermissions
  ) => void;
  setCollaborationPreferences: (preferences: CollaborationPreferences) => void;
  // Other properties and methods specific to the modal
};

// Define related types
type NotificationPreferences = {
  enableNotifications: boolean;
  notificationSound: string;
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

