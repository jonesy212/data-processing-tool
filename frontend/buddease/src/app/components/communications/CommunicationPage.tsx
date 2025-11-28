// CommunicationPage.tsx
// Communication.tsx
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { User } from "@/app/users/User";
import { Tag } from '@/app/models/tracker/Tag';
import React from "react";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';

// Fix the Sender type with the correct role type
interface Sender<
  T extends BaseDataEntity, 
  K extends T, 
  Meta extends DefaultMeta<T, K>, 
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>  extends Partial<User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  id?: string | number;
  tags: Tag<T>[];
  isUserMessage: boolean;
  tier: string;
  createdAt: string;
  updatedAt: string;
}


interface Communication<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
    id: string;
    messages: Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    participants: Sender[];
}


interface CommunicationProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  message: Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  sender: Sender;
  timestamp: Date;
}


const CommunicationPage: React.FC<CommunicationProps> = ({ message, sender, timestamp }) => {
  return (
    <div className="communication">
      <div className="communication-sender">{sender.username}</div>
      <div className="communication-message">{message.content}</div>
      <div className="communication-timestamp">{timestamp.toLocaleString()}</div>
    </div>
  );
};

export default CommunicationPage;
export type { Communication, Sender };
