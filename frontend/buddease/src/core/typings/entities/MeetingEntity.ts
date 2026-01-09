MeetingEntity.ts
import type { BaseEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';

// Define the actual MeetingEntity interface
interface MeetingEntity extends BaseEntity {
  
  title: string;
  description: string;
  date: Date;
  duration: number; // in minutes
  participants: string[]; // User IDs
  organizer: string; // User ID
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'postponed';
  meetingType: 'one-on-one' | 'team' | 'client' | 'board' | 'all-hands';
  
  agenda?: string[];
  location?: string;
  recurrence?: {
    pattern: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: Date;
    exceptions?: Date[];
  };
  resources?: string[]; // Document IDs, link IDs, etc.
  recordingUrl?: string;
  minutes?: string; // Meeting minutes content
  actionItems?: string[]; // Action item IDs or descriptions
}

Meeting-specific type parameters
type MeetingK = MeetingEntity;
type MeetingMeta = DefaultMeta<MeetingEntity, MeetingK> & {
  timezone?: string;
  requiredAttendees?: string[];
  optionalAttendees?: string[];
  preparationMaterials?: string[];
  customFields?: Record<string, any>;
};
type MeetingAttachment = Attachment;
type MeetingExcludedFields = DefaultExcludedFields<MeetingEntity> | "participants" | "organizer" | "recordingUrl";
type MeetingIncludedFields = keyof MeetingEntity;

// Meeting parameters container
type MeetingBaseParams = {
  T: MeetingEntity;
  K: MeetingK;
  Meta: MeetingMeta;
  AttachmentType: MeetingAttachment;
  ExcludedFields: MeetingExcludedFields;
  IncludedFields: MeetingIncludedFields;
};

export type {
    MeetingAttachment, MeetingBaseParams, MeetingEntity, MeetingExcludedFields,
    MeetingIncludedFields, MeetingK,
    MeetingMeta
};

