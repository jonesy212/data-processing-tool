// MessageEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes';
import { Message } from '@/app/generators/GenerateChatInterfaces';

// Define the actual MessageEntity interface
interface MessageEntity extends BaseDataEntity {
  id: string;
  content: string;
  type: NotificationType;
  timestamp: Date;
  senderId: string;
  receiverId?: string;
  channelId?: string;
  isRead: boolean;
  isDelivered: boolean;
  // Message-specific fields
  replyTo?: string; // Message ID this is replying to
  reactions?: Record<string, string[]>; // { 'like': ['user1', 'user2'] }
  metadata?: {
    contentType?: 'text' | 'image' | 'file' | 'system';
    fileSize?: number;
    mimeType?: string;
    encryptionKey?: string;
  };
  expiresAt?: Date; // For ephemeral messages
}

// Message-specific type parameters
type MessageK = MessageEntity;
type MessageMeta = DefaultMeta<MessageEntity, MessageK> & {
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  classification?: 'public' | 'private' | 'confidential';
  tags?: string[];
  customFields?: Record<string, any>;
};
type MessageAttachment = Attachment;
type MessageExcludedFields = DefaultExcludedFields<MessageEntity> | "metadata" | "encryptionKey";
type MessageIncludedFields = keyof MessageEntity;

// Message parameters container
type MessageBaseParams = {
  T: MessageEntity;
  K: MessageK;
  Meta: MessageMeta;
  AttachmentType: MessageAttachment;
  ExcludedFields: MessageExcludedFields;
  IncludedFields: MessageIncludedFields;
};
type AppMessage = Message<MessageEntity, MessageK, MessageMeta, MessageAttachment, MessageExcludedFields, MessageIncludedFields>
export type {
  AppMessage, MessageAttachment, MessageBaseParams, MessageEntity, MessageExcludedFields,
  MessageIncludedFields, MessageK,
  MessageMeta
};

