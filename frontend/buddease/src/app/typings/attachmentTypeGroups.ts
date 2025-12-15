// attachmentTypeGroups.ts
import { AttachmentTypeEnum, NoteAttachment } from '@/app/documents/NoteData';
import { Attachment } from '@/app/documents/attachment/Attachment';

export type AttachmentTypes = Attachment | NoteAttachment | CalendarAttachment

// Calendar-specific attachments
type CalendarAttachment = Attachment & {
  type: 'icalendar' | 'meeting-minutes' | 'presentation' | 'attendee-list';
  eventId: string;
  duration?: number; // meeting duration in minutes
};

// If you plan to use these enums in filters, dropdowns, or categorization, you can define groupings:
export const AttachmentTypeGroups = {
  media: [
    AttachmentTypeEnum.IMAGE,
    AttachmentTypeEnum.VIDEO,
    AttachmentTypeEnum.AUDIO,
  ],
  documents: [
    AttachmentTypeEnum.DOCUMENT,
    AttachmentTypeEnum.SPREADSHEET,
    AttachmentTypeEnum.PDF,
  ],
  crypto: [
    AttachmentTypeEnum.WALLET_FILE,
    AttachmentTypeEnum.TRANSACTION_RECEIPT,
    AttachmentTypeEnum.SMART_CONTRACT,
  ],
  analytics: [
    AttachmentTypeEnum.REPORT,
    AttachmentTypeEnum.CHART,
    AttachmentTypeEnum.DATASET,
  ],
};
