import { InitializedData } from '@/app/components/snapshots/SnapshotStoreOptions';
import { NestedEndpoints } from "@/app/api/ApiEndpoints";
import { SearchNotesResponse } from "@/app/api/ApiNote";

import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { Exchange } from "../crypto/Exchange";
import { DataWithComment } from "../crypto/SafeParseData";
import HighlightEvent from "../documents/screenFunctionality/HighlightEvent";
import { BaseData } from "../models/data/Data";
import { K, T } from "../models/data/dataStoreMethods";
import { ExchangeData } from "../models/data/ExchangeData";
import { Task } from "../models/tasks/Task";
import { Team } from "../models/teams/Team";
import { Phase } from "../phases/Phase";
import { DataAnalysisResult } from '../projects/DataAnalysisPhase/DataAnalysisResult';
import { Project } from "../projects/Project";
import { ExcludedFields } from "../routing/Fields";
import  { Snapshot, SnapshotStoreUnion } from "../snapshots";
import SnapshotStore from "../snapshots/SnapshotStore";
import BrowserCheckStore from "../state/stores/BrowserCheckStore";
import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { CalendarManagerStore } from "@/app/components/state/stores/CalendarManagerStore";

import { IconStore } from "../state/stores/IconStore";
import { Settings } from "../state/stores/SettingsStore";
import { TaskManagerStore } from "../state/stores/TaskStore ";
import { TodoManagerStore } from "../state/stores/TodoStore";
import { TrackerStore } from "../state/stores/TrackerStore";
import { Todo } from "../todos/Todo";
import { User } from "../users/User";
import { Attendee } from "../calendar/Attendee";

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



interface BaseResponseType<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> {
  calendarEvents: CalendarEvent[];
  todos: Todo<T, K, Meta>[]; // Assuming Todo is a type/interface for todos
  tasks: Task<T, K, Meta>[];
  snapshotStores: SnapshotStore<SnapshotStoreUnion<T>, K>[];
  currentPhase: Phase | null;
  comment: string;
  securityStamp?: string | null | undefined;
  // Add any other shared properties
}


interface YourSettingsResponseType<
T extends BaseData<any>, 
K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
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
  T extends BaseData<any>, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> = User & BaseResponseType<T, K, Meta> & YourSettingsResponseType<T, K, Meta>


// Define the structure of YourResponseType based on the actual response from the backend
interface YourResponseType<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> extends Partial<Snapshot<T, K, Meta, never>>, 
  BaseResponseType<T, K, Meta>,
  DataWithComment<T>,
  SearchNotesResponse {
  id?: string;
  forEach?: (arg0: (notification: import("../support/NofiticationsSlice").NotificationData) => void) => void;
  length?: number;
  // pageNumber: number
  calendarEvents: CalendarEvent[]; // Assuming CalendarEvent is a type/interface for calendar events
  todos: Todo<T, K, Meta>[]; // Assuming Todo is a type/interface for todos
  tasks: Task<T, K, Meta>[]; // Assuming Task is a type/interface for tasks
  snapshotStores: SnapshotStore<SnapshotStoreUnion<T>, K>[]
  currentPhase: Phase | null; // Assuming a string representing the current project phase
  comment: string; // Additional comment field
  excludedData?: ExcludedFields<T, keyof T>; 
  // Add field from RootStores
  browserCheckStore: BrowserCheckStore;
  trackerStore: TrackerStore;
  todoStore: TodoManagerStore<T, K>;
  taskManagerStore: TaskManagerStore;
  iconStore: IconStore;
  calendarStore: CalendarManagerStore;
  prototype?: any;
  browsers?: any;
  endpoints: NestedEndpoints;
  highlights: HighlightEvent[];
  data: InitializedData<T>;
  projectInfo?: {
    id: number;
    projectName: Project["name"];
    description: Project["description"];
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
    // Additional properties
    metadata: {
      createdBy: string;
      createdAt: Date;
      updatedBy: string;
      updatedAt: Date;
    };
    exchangeData: ExchangeData[];
    averagePrice: number;
    
  };
  analysisResults?: string | DataAnalysisResult<T>[];
  // Add other properties if necessary
}

export type { BaseResponseType, UserDataResponseType, YourResponseType, YourSettingsResponseType };

