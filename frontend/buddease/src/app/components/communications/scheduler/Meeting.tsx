// Meeting.tsx
import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { Todo } from "@/app/todos/Todo";
import { UserData } from "@/app/users/User";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';

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
  assignedTo?: Todo<T, K>['assignedTo']
  
  organizer: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'postponed';
  meetingType: 'one-on-one' | 'team' | 'client' | 'board' | 'all-hands';
  location?: string;
  agenda?: string[];
  recordingUrl?: string;
  minutes?: string;
  // Add any other properties relevant to a meeting
}
