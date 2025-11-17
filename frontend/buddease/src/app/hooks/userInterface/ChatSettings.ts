// Define a type for chat settings

interface ChatSettings {
  realTimeChatEnabled: boolean;
  notificationEmailEnabled: boolean;
  enableEmojis: boolean;
  enableAudioChat: boolean;
  enableVideoChat: boolean;
  enableFileSharing: boolean;
  enableBlockchainCommunication: boolean;
  enableDecentralizedStorage: boolean;
  collaborationPreference1: string | undefined;
  collaborationPreference2: string | undefined;
  platforms: ('slack' | 'teams' | 'discord' | 'whatsapp')[];
  messageFormat: 'text' | 'rich' | 'interactive' | 'markdown';
  mentionUsers: boolean;
  channelId?: string;
  close?: () => void;
  // Add more settings as needed
}

export default ChatSettings;
