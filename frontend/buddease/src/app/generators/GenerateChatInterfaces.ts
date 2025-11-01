// GenerateChatInterfaces.ts

import { ChatRoom } from '@/app/communications/ChatRoom';
import { Tag } from "@/app/models/tracker/Tag";
import { User, UserData } from "@/app/users/User";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Sender } from '@/app/components/communications/CommunicationPage';
import { Attachment } from "@/app/documents/attachment/Attachment";

interface Message<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  UserData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  id: string;
  sender?: Sender;
  senderId: string | undefined;
  channel: ChatRoom | undefined
  channelId: string | undefined;
  content: string;
  additionalData?: string;
  tags: string[] | Tag<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  userId?: number
  timestamp?: Date | string;
  text: string;
  isUserMessage?: boolean
  receiver: User | undefined;
  isOnline: boolean;
  lastSeen: string | Date;
  description?: string;
  createdAt: Date | undefined,
  updatedAt: Date | undefined,
  deletedAt: null,
  imageUrl: string,

  bio: string | null,
  website: string,
  location: string,
  coverImageUrl: string,
  following: User[],
  followers: User[],
  chatRooms: ChatRoom[],
  blockedUsers: User[],
  blockedBy: User[],
}



// Function to generate dynamic interfaces
const generateChatInterfaces = (entities: string[]) => {
  const interfaces: Record<string, any> = {};

  entities.forEach(entity => {
    switch (entity.toLowerCase()) {
      case 'user':
        interfaces[entity] = {
          id: 'string',
          username: 'string',
          // Add more user properties as needed
        };
        break;
      case 'channel':
        interfaces[entity] = {
          id: 'string',
          name: 'string',
          members: ['User'],
          // Add more channel properties as needed
        };
        break;
      case 'message':
        interfaces[entity] = {
          id: 'string',
          userId: 'string',
          channelId: 'string',
          content: 'string',
          timestamp: 'Date',
          // Add more message properties as needed
        };
        break;
      case 'conversation':
        interfaces[entity] = {
          id: 'string',
          participants: ['User'], // Assuming conversation involves multiple users
          // Add more conversation properties as needed
        };
        break;
      // Add more cases for other entities
    }
  });

  return interfaces;
};

export type { Message };

// Example usage
const generatedInterfaces = generateChatInterfaces(['User', 'Channel', 'Message']);
console.log(generatedInterfaces);
