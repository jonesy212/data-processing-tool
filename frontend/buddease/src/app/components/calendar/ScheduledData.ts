// ScheduledData.ts
import { Data } from "../models/data/Data";
import { AllStatus } from "../state/stores/DetailsListStore";
import TodoImpl from "../todos/Todo";


export interface Schedule {
  id?: string | number | undefined
  title?: string;
  description?: string | null;
  scheduledDate: Date | undefined;
  createdBy?: string | undefined;
  status?: AllStatus | null;
  isRecurring?: boolean;
  [key: string]: any; // Add any additional shared scheduling fields
}

export interface ScheduledData extends Schedule, Data {
  // Additional scheduling-specific properties
  priority?: "scheduled" | "completed" | "canceled" | "rescheduled"; // General status for scheduling;
  assignee?: UserAssignee | null;
  subtasks?: TodoImpl<any, any, any>[];
  additionalData?: any;
}
    


    
  // Define the interface for MeetingMetadata
  export interface MeetingMetadata {
    createdAt: Date; // Timestamp when the meeting was created
    lastModifiedAt: Date; // Timestamp when the meeting was last modified
    createdBy: string; // ID or name of the user who created the meeting
    status: "scheduled" | "completed" | "canceled" | "rescheduled"; // Status of the meeting
    isRecurring: boolean; // Flag indicating if the meeting is recurring
    recurrencePattern?: string; // Details about recurrence (e.g., "weekly on Mondays")
    meetingPlatform?: "zoom" | "teams" | "googleMeet" | "custom"; // Platform used for the meeting
    customMeetingPlatformDetails?: string; // Additional details for custom meeting platforms
    recordingUrl?: string; // URL for meeting recording if available
    notesUrl?: string; // URL for meeting notes if available
    // Add other metadata fields as necessary
  }


  // Example usage
  const meetingMetadata: MeetingMetadata = {
    createdAt: new Date(),
    lastModifiedAt: new Date(),
    createdBy: "user123",
    status: "scheduled",
    isRecurring: true,
    recurrencePattern: "weekly on Mondays",
    meetingPlatform: "zoom",
    recordingUrl: "https://example.com/meeting/recording",
    notesUrl: "https://example.com/meeting/notes",
  };
// ScheduledData typically represents any data that has been scheduled for a specific date and time, such as tasks, appointments, or events. It may include additional properties like the ID, the creator of the scheduled item, and any relevant details.


