// Meeting.tsx
import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { Todo } from "@/core/todos/Todo";
import { UserData } from "@/core/users/User";

export interface Meeting<
  T extends BaseDataEntity, 
  K extends T, 
  Meta extends DefaultMeta<T, K>, 
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends UserData {
  id: number;
  title: string;
  date: Date;
  duration: number;
  description: string;
  participants: string[]; // This can be an array of user IDs or names
  eventId?: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>['id']
  assignedTo?: Todo<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>['assignedTo']
  
  organizer: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'postponed';
  meetingType: 'one-on-one' | 'team' | 'client' | 'board' | 'all-hands';
  location?: string;
  agenda?: string[];
  recordingUrl?: string;
  minutes?: string;
  // Add any other properties relevant to a meeting
}
