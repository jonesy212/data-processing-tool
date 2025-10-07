// responseTypes.ts
import { NestedEndpoints } from '@/app/api/endpointConfigurations';
import { SearchNotesResponse } from "@/app/api/ApiNote";

import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { CalendarManagerStore } from "@/app/state/stores/CalendarManagerStore";
import { SnapshotStoreUnion } from "@/app/snapshots/LocalStorageSnapshotStore";
import { Snapshot  } from "@/app/snapshots/Snapshot";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { Exchange } from "@/app/components/crypto/Exchange";
import { DataWithComment } from "@/app/dataIntegration";
import HighlightEvent from "@/app/highlighting/screenFunctionality";
import { ExchangeData } from "@/app/models/data/ExchangeData";
import { Task } from "@/app/models/tasks/Task";
import { Team } from "@/app/models/teams/Team";
import { Phase } from "@/app/models/phases/Phase";
import { DataAnalysisResult } from '@/app/projects/DataAnalysisPhase/DataAnalysisResult';
import { Project } from "@/app/models/projects/Project";
import BrowserCheckStore from "@/app/state/stores/BrowserCheckStore";
import { Attachment } from "@/app/features/support/SupportTicketComponent";
import { BaseDataEntity } from "@/app/snapshots/ValidationRule";
import { DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";
import { Attendee } from "@/app/calendar/Attendee";
import { IconStore } from "@/app/state/stores/IconStore";
import { Settings } from "@/app/state/stores/SettingsStore";
import { TaskManagerStore } from "@/app/state/stores/TaskStore ";
import { TodoManagerStore } from "@/app/state/stores/TodoStore";
import { TrackerStore } from "@/app/state/stores/TrackerStore";
import { Todo } from "@/app/todos/Todo";
import { User } from "@/app/users/User";

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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends Settings, YourResponseType<T, K, Meta, AttachmentType, ExcludedFields> {
  calendarEventTypes: CalendarEventType[];
  todoTypes: TodoType[];
  taskTypes: TaskType[];
  snapshotStoreTypes: SnapshotStoreType<T, K, Meta, AttachmentType, ExcludedFields>[];
}




type UserDataResponseType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> = User &
  BaseResponseType<T, K, Meta, AttachmentType, ExcludedFields> &
  YourSettingsResponseType<T, K, Meta, AttachmentType, ExcludedFields>;


// Define the structure of YourResponseType based on the actual response from the backend
interface YourResponseType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields>>,
          BaseResponseType<T, K, Meta, AttachmentType, ExcludedFields>,
          DataWithComment<T, K, Meta, AttachmentType, ExcludedFields>,
          SearchNotesResponse {
  id?: string;
  forEach?: (arg0: (notification: Notification<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => void;
  length?: number;
  calendarEvents: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  todos: Todo<T, K, Meta, AttachmentType, ExcludedFields>[];
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields>[];
  snapshotStores: SnapshotStore<SnapshotStoreUnion<T, K, Meta, AttachmentType, ExcludedFields>, K, Meta, AttachmentType, ExcludedFields>[];
  currentPhase: Phase | null;
  comment: string;
  excludedData?: ExcludedFields;
  
  // Root stores
  browserCheckStore: BrowserCheckStore;
  trackerStore: TrackerStore;
  todoStore: TodoManagerStore<T, K, Meta, AttachmentType, ExcludedFields>;
  taskManagerStore: TaskManagerStore<T, K, Meta, AttachmentType, ExcludedFields>;
  iconStore: IconStore;
  calendarStore: CalendarManagerStore;

  prototype?: any;
  browsers?: any;
  endpoints: NestedEndpoints;
  highlights: HighlightEvent[];

  data: Initialized<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  projectInfo?: {
    id: number;
    projectName: Project<T, K, Meta, AttachmentType, ExcludedFields>["name"];
    description: Project<T, K, Meta, AttachmentType, ExcludedFields>["description"];
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

  analysisResults?: string | DataAnalysisResult<T, K, Meta, AttachmentType, ExcludedFields>[];
}
export type { BaseResponseType, UserDataResponseType, YourResponseType, YourSettingsResponseType };

