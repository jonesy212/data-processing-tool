// ChatRoom.ts
import ChatMessage from '@/app/components/communications/chat/ChatMessage'
import { User } from '@/app/users/User'
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from "@/app/documents/attachment/Attachment";

export interface ChatRoom<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>  {
  id: string;
  creatorId: string;
  // Define properties of ChatRoom here, including 'topics'
  topics: any[]; // Adjust 'any[]' to the actual type of 'topics'
  messages: ChatMessage[]; // Add 'messages' property
  users: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; // Add 'users' property
}
