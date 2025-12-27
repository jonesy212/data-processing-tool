// LogData.tsx
import { NestedEndpoints } from '@/app/api/ApiEndpoints';
import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import CustomFile from "@/app/documents/File";
import { Highlight } from "@/app/documents/NoteData";
import type { Snapshot } from '@/app/snapshots/Snapshot';;
import { BaseData } from "@/app/models/data/Data";

interface LogData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  date: Date | string | number;
  timestamp: Date | number;
  level: string;
  message: string;
  user?: string | null;
  content?: string;
  createdAt?: Date | string;
  endpoint?: NestedEndpoints | string;
  method?: string;
  status?: string;
  response?: any;
  sent: Date;
  isSent: boolean;
  isDelivered: boolean;
  delivered: Date | null;
  opened: Date | null;
  clicked: Date | null;
  responded: boolean | null;
  responseTime: Date | null;
  topics: string[] | undefined;
  highlights: Highlight[];
  eventData: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  files: CustomFile<T>[];
  meta: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null;
}

export type { LogData };
