// responseTypes.ts
import { NestedEndpoints } from '@/core/api/ApiEndpoints';
import { SearchNotesResponse } from '@/core/api/ApiNote';
import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import { Attendee } from '@/core/components/calendar/Attendee';
import { Team } from '@/core/components/teams/Team';
import { DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { DataWithComment } from '@/core/dataIntegration/SafeParseData';
import { Attachment } from '@/core/documents/attachment/Attachment';
import HighlightEvent from '@/core/highlighting/screenFunctionality/HighlightEvent';
import { Exchange } from '@/core/models/cypto/Exchange';
import { Data } from '@/core/models/data/Data';
import { ExchangeData } from '@/core/models/data/ExchangeData';
import { Phase } from '@/core/models/phases/Phase';
import { Project } from '@/core/models/projects/Project';
import { Task } from '@/core/models/tasks/Task';
import { DataAnalysisResult } from '@/core/projects/DataAnalysisPhase/DataAnalysisResult';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { BaseDataEntity } from '@/core/snapshots/ValidationRule';
import { Settings } from '@/core/state/hybrid/SettingsManagerStore';
import BrowserCheckStore from '@/core/state/stores/BrowserCheckStore';
import { CalendarManagerStore } from '@/core/state/stores/CalendarManagerStore';
import { IconStore } from '@/core/state/stores/IconStore';
import { TaskManagerStore } from '@/core/state/stores/TaskStore';
import { TodoManagerStore } from '@/core/state/stores/TodoStore';
import { TrackerStore } from '@/core/state/stores/TrackerStore';
import { Todo } from '@/core/todos/Todo';
import { BaseResponseType } from '@/core/typings/baseResponseTypes';
import { User } from '@/core/users/User';

export interface TodoType {
  id: string;                  // Unique identifier for the todo
  title: string;               // Title of the todo
  description?: string;        // Optional description
  isCompleted: boolean;        // Status of the todo
  dueDate?: Date;              // Optional due date
  priority?: 'low' | 'medium' | 'high'; // Priority level
  tags?: string[];             // Tags associated with the todo
}



export interface TaskType {
  id: string;                  // Unique identifier for the task
  title: string;               // Title of the task
  description?: string;        // Optional description
  assignee?: string;           // User assigned to the task
  status: 'todo' | 'in-progress' | 'done'; // Status of the task
  dueDate?: Date;              // Optional due date
  priority?: 'low' | 'medium' | 'high'; // Priority level
  subtasks?: TodoType[];       // Subtasks associated with the task
  tags?: string[];             // Tags associated with the task
  relatedProjectId?: string;   // ID of the related project
}


export interface CalendarEventType {
  id: string;                      // Unique identifier for the calendar event
  title: string;                   // Title of the calendar event
  description?: string;            // Optional description of the event
  startDate: Date;                 // Start date and time of the event
  endDate: Date;                   // End date and time of the event
  location?: string;               // Optional location of the event
  attendees?: Attendee[];            // List of attendees (could be emails, names, or user IDs)
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly'; // Recurrence pattern
  reminders?: {                    // Optional reminders for the event
    type: 'email' | 'notification'; // Type of reminder
    timeBefore: number;            // Time before the event (in minutes)
  }[];
  isAllDay?: boolean;              // Indicates if the event lasts the entire day
  tags?: string[];                 // Tags associated with the event
  relatedTaskId?: string;          // If the event is related to a task, reference the task ID
}


export interface SnapshotStoreType<T> {
  id: string;                  // Unique identifier for the snapshot store
  name: string;                // Name of the snapshot store
  data: T[];                   // Array of snapshots
  createdAt: Date;             // Creation date of the snapshot store
  updatedAt?: Date;            // Last update date
  version?: string;            // Current version of the snapshot store
  metadata?: Record<string, any>; // Additional metadata
}



interface YourSettingsResponseType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Settings, YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  calendarEventTypes: CalendarEventType[];
  todoTypes: TodoType[];
  taskTypes: TaskType[];
  snapshotStoreTypes: SnapshotStoreType<T>[];
  appName: string;
  activePhase?: string;
}




type UserDataResponseType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> &
  BaseResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> &
  YourSettingsResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;


// Define the structure of YourResponseType based on the actual response from the backend

interface YourResponseType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
          BaseResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          DataWithComment<T>,
          SearchNotesResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  id?: string;
  forEach?: (arg0: (notification: Notification) => void) => void;
  length?: number;
  calendarEvents: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  todos: Todo<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  snapshotStores: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  pageNumber: number,
  
  currentPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  comment: string;
  excludedData?: ExcludedFields;
  
  // Root stores
  browserCheckStore: BrowserCheckStore;
  trackerStore: TrackerStore;
  todoStore: TodoManagerStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  taskManagerStore: TaskManagerStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  iconStore: IconStore;
  calendarStore: CalendarManagerStore;

  prototype?: any;
  browsers?: any;
  endpoints: NestedEndpoints;
  highlights: HighlightEvent[];

  data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  projectInfo?: {
    id: number;
    projectName: Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>["name"];
    description: Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>["description"];
    teamMembers: Team["members"];
    exchange: Exchange;
    communication: {
      audio: boolean;
      video: boolean;
      text: boolean;
    };
    collaborationOptions: {
      brainstorming: boolean;
      fileSharing: boolean;
      realTimeEditing: boolean;
    };
    metadata: {
      createdBy: string;
      createdAt: Date;
      updatedBy: string;
      updatedAt: Date;
    };
    exchangeData: ExchangeData[];
    averagePrice: number;
  };

  analysisResults?: string | DataAnalysisResult<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}
export type { UserDataResponseType, YourResponseType, YourSettingsResponseType };

