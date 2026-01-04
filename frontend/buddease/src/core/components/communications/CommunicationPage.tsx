// CommunicationPage.tsx
// Communication.tsx
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { AppEntity, AppExcludedFields, AppIncludedFields, AppK, AppMeta, AppAttachment } from '@/core/typings/entities/AppEntity';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { Message } from "@/core/generators/GenerateChatInterfaces";
import { TagsRecord } from '@/core/models/tracker/Tag';
import type { Tag } from '@/core/models/tracker/Tag';
import type { User } from "@/core/users/User";
import React from "react";

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
  tags?: string[] | TagsRecord<T>;
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
    participants: Sender<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
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
  sender: Sender<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  timestamp: Date;
}


const CommunicationPage: React.FC<CommunicationProps<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> = ({ message, sender, timestamp }) => {
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
