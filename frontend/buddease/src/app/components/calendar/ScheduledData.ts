import { Data } from "../models/data/Data";

// ScheduledData.ts
export interface ScheduledData extends Data{
    id: string | number;
    title: string;
    description: string;
    scheduledDate: Date
    createdBy: string;
    // Add other properties as needed
  }
  

// ScheduledData typically represents any data that has been scheduled for a specific date and time, such as tasks, appointments, or events. It may include additional properties like the ID, the creator of the scheduled item, and any relevant details.