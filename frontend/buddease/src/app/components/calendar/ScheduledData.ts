import { Task } from '@/app/components/models/tasks/Task';
// ScheduledData.ts
import { BaseData, Data } from "../models/data/Data";
import { StatusType } from "../models/data/StatusType";
import { AllStatus } from "../state/stores/DetailsListStore";
import TodoImpl, { UserAssignee } from "../todos/Todo";


export interface Schedule {
  id?: string | number | undefined
  title?: string;
  description?: string | null;
  scheduledDate: Date | undefined;
  createdBy: string | undefined;
  status?: AllStatus | null;
  isRecurring?: boolean;
  [key: string]: any; // Add any additional shared scheduling fields
}

export interface ScheduledData<
  T extends BaseData<any>,
  K extends T = T,
  S = Task<T, K> | TodoImpl<any, any, any>
  > 
  extends Schedule, Data<T> {
  // Additional scheduling-specific properties
  priority?: "scheduled" | "completed" | "canceled" | "rescheduled"; // General status for scheduling;
  assignee?: UserAssignee | null;
  subtasks?: TodoImpl<any, any, any>[];
  additionalData?: any;
  isScheduled?: boolean;
}
    


  
// Define the interface for MeetingMetadata
export interface MeetingMetadata {
  createdAt: Date; // Timestamp when the meeting was created
  lastModifiedAt: Date; // Timestamp when the meeting was last modified
  createdBy: string; // ID or name of the user who created the meeting
  status: StatusType; // Status of the meeting
  isRecurring: boolean; // Flag indicating if the meeting is recurring
  recurrencePattern?: string; // Details about recurrence (e.g., "weekly on Mondays")
  meetingPlatform?: "zoom" | "teams" | "googleMeet" | "custom"; // Platform used for the meeting
  customMeetingPlatformDetails?: string; // Additional details for custom meeting platforms
  recordingUrl?: string; // URL for meeting recording if available
  notesUrl?: string; // URL for meeting notes if available
  // Add other metadata fields as necessary
}



// Function to dynamically create MeetingMetadata
function createMeetingMetadata(
  createdBy: string,
  status: StatusType,
  meetingPlatform: "zoom" | "teams" | "googleMeet" | "custom",
  options?: Partial<Omit<MeetingMetadata, 'createdBy' | 'status' | 'meetingPlatform'>>
): MeetingMetadata {
  return {
    createdAt: new Date(),
    lastModifiedAt: new Date(),
    createdBy,
    status,
    isRecurring: options?.isRecurring ?? false,
    recurrencePattern: options?.recurrencePattern,
    meetingPlatform,
    recordingUrl: options?.recordingUrl,
    notesUrl: options?.notesUrl,
  };
}



// Create dynamic meeting metadata
const dynamicMeetingMetadata = createMeetingMetadata(
  "user123", 
  StatusType.Scheduled, 
  "zoom", 
  {
    isRecurring: true,
    recurrencePattern: "weekly on Mondays",
    recordingUrl: "https://example.com/meeting/recording",
    notesUrl: "https://example.com/meeting/notes",
  }
);


  // Example usage
  const exampleMeetingMetadata: MeetingMetadata = {
    createdAt: new Date(),
    lastModifiedAt: new Date(),
    createdBy: "user123",
    status: StatusType.Scheduled,
    isRecurring: true,
    recurrencePattern: "weekly on Mondays",
    meetingPlatform: "zoom",
    recordingUrl: "https://example.com/meeting/recording",
    notesUrl: "https://example.com/meeting/notes",
  };

// ScheduledData typically represents any data that has been scheduled for a specific date and time, such as tasks, appointments, or events. It may include additional properties like the ID, the creator of the scheduled item, and any relevant details.


export { dynamicMeetingMetadata, exampleMeetingMetadata };

