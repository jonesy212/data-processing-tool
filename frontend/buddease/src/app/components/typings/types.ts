import { NestedEndpoints } from "@/app/api/ApiEndpoints";
import { SearchNotesResponse } from "@/app/api/ApiNote";
import { InitializedData } from '@/app/components/snapshots/SnapshotStoreOptions';

import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { CalendarManagerStore } from "@/app/components/state/stores/CalendarManagerStore";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { Exchange } from "../crypto/Exchange";
import { DataWithComment } from "../crypto/SafeParseData";
import HighlightEvent from "../documents/screenFunctionality/HighlightEvent";
import { BaseData } from "../models/data/Data";
import { ExchangeData } from "../models/data/ExchangeData";
import { Task } from "../models/tasks/Task";
import { Team } from "../models/teams/Team";
import { Phase } from "../phases/Phase";
import { DataAnalysisResult } from '../projects/DataAnalysisPhase/DataAnalysisResult';
import { Project } from "../projects/Project";
import { ExcludedFields } from "../routing/Fields";
import { Snapshot, SnapshotStoreUnion } from "../snapshots";
import SnapshotStore from "../snapshots/SnapshotStore";
import BrowserCheckStore from "../state/stores/BrowserCheckStore";

import { Attendee } from "../calendar/Attendee";
import { IconStore } from "../state/stores/IconStore";
import { Settings } from "../state/stores/SettingsStore";
import { TaskManagerStore } from "../state/stores/TaskStore ";
import { TodoManagerStore } from "../state/stores/TodoStore";
import { TrackerStore } from "../state/stores/TrackerStore";
import { Todo } from "../todos/Todo";
import { User } from "../users/User";


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


interface YourSettingsResponseType<
T extends BaseDataEntity, 
K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> extends Settings, YourResponseType<T, K, Meta>
    //, 
// Omit<YourResponseType, 'calendarEvents' | 'todos' | 'tasks' | 'snapshotStores'> 
{
    // Additional properties specific to YourSettingsResponseType
    calendarEventTypes: CalendarEventType[];
    todoTypes: TodoType[];
    taskTypes: TaskType[];
    snapshotStoreTypes: SnapshotStoreType<T>[];
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
  forEach?: (arg0: (notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields>) => void) => void;
  length?: number;
  calendarEvents: CalendarEvent[];
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

  data: InitializedData<T, K, Meta, AttachmentType, ExcludedFields>;

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

