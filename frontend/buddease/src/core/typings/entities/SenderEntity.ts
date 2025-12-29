// SenderEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';

// Define the actual SenderEntity interface
interface SenderEntity extends BaseDataEntity {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isOnline: boolean;
  lastSeen?: Date;
  status: 'active' | 'inactive' | 'away' | 'busy';
  permissions: string[];
  // Sender-specific fields
  canBroadcast?: boolean;
  canModerate?: boolean;
  isVerified?: boolean;
  reputation?: number;
}

// Sender-specific type parameters
type SenderK = SenderEntity;
type SenderMeta = DefaultMeta<SenderEntity, SenderK> & {
  deviceInfo?: {
    platform?: string;
    browser?: string;
    ipAddress?: string;
  };
  preferences?: {
    notifications?: boolean;
    soundEnabled?: boolean;
    theme?: string;
  };
  customFields?: Record<string, any>;
};
type SenderAttachment = Attachment;
type SenderExcludedFields = DefaultExcludedFields<SenderEntity> | "email" | "ipAddress";
type SenderIncludedFields = keyof SenderEntity;

// Sender parameters container
type SenderBaseParams = {
  T: SenderEntity;
  K: SenderK;
  Meta: SenderMeta;
  AttachmentType: SenderAttachment;
  ExcludedFields: SenderExcludedFields;
  IncludedFields: SenderIncludedFields;
};

export type {
    SenderAttachment, SenderBaseParams, SenderEntity, SenderExcludedFields,
    SenderIncludedFields, SenderK,
    SenderMeta
};

