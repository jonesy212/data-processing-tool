// ChatRoomEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';

// Define the actual ChatRoomEntity interface
interface ChatRoomEntity extends BaseDataEntity {
  id: string;
  name: string;
  description?: string;
  type: 'direct' | 'group' | 'channel' | 'broadcast';
  participants: string[]; // User/Sender IDs
  adminIds: string[];
  isActive: boolean;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActivity?: Date;
  // Chat room specific fields
  messageCount: number;
  unreadCount: number;
  settings: {
    allowReactions: boolean;
    allowFiles: boolean;
    allowEditing: boolean;
    slowMode?: number; // seconds between messages
    maxParticipants?: number;
  };
  pinnedMessages?: string[]; // Message IDs
}

// ChatRoom-specific type parameters
type ChatRoomK = ChatRoomEntity;
type ChatRoomMeta = DefaultMeta<ChatRoomEntity, ChatRoomK> & {
  topic?: string;
  category?: string;
  tags?: string[];
  customFields?: Record<string, any>;
};
type ChatRoomAttachment = Attachment;
type ChatRoomExcludedFields = DefaultExcludedFields<ChatRoomEntity> | "participants" | "adminIds" | "pinnedMessages";
type ChatRoomIncludedFields = keyof ChatRoomEntity;

// ChatRoom parameters container
type ChatRoomBaseParams = {
  T: ChatRoomEntity;
  K: ChatRoomK;
  Meta: ChatRoomMeta;
  AttachmentType: ChatRoomAttachment;
  ExcludedFields: ChatRoomExcludedFields;
  IncludedFields: ChatRoomIncludedFields;
};

export type {
  ChatRoomAttachment, ChatRoomBaseParams, ChatRoomEntity, ChatRoomExcludedFields,
  ChatRoomIncludedFields, ChatRoomK,
  ChatRoomMeta
};

