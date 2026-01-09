ChatEntity.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';

// Define the actual ChatEntity interface
interface ChatEntity extends BaseDataEntity {
  id: string;
  title: string;
  participants: string[]; // User/Sender IDs
  messages: string[]; // Message IDs
  type: 'direct' | 'group' | 'channel';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
  // Chat-specific fields
  unreadCount?: number;
  isMuted?: boolean;
  isPinned?: boolean;
}

Chat-specific type parameters
type ChatK = ChatEntity;
type ChatMeta = DefaultMeta<ChatEntity, ChatK> & {
  settings?: {
    allowReactions?: boolean;
    allowFiles?: boolean;
    allowEditing?: boolean;
  };
  customFields?: Record<string, any>;
};
type ChatAttachment = Attachment;
type ChatExcludedFields = DefaultExcludedFields<ChatEntity> | "participants" | "messages";
type ChatIncludedFields = keyof ChatEntity;

// Chat parameters container
type ChatBaseParams = {
  T: ChatEntity;
  K: ChatK;
  Meta: ChatMeta;
  AttachmentType: ChatAttachment;
  ExcludedFields: ChatExcludedFields;
  IncludedFields: ChatIncludedFields;
};

export type {
    ChatAttachment, ChatBaseParams, ChatEntity, ChatExcludedFields,
    ChatIncludedFields, ChatK,
    ChatMeta
};

