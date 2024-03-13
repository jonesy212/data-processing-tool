import { Data } from "../models/data/Data";

// ScheduledData.ts
export interface ScheduledData extends Data{
    id: string | number;
    title: string;
    description: string;
    scheduledDate: Date;
    createdBy: string;
    // Add other properties as needed
  }
  