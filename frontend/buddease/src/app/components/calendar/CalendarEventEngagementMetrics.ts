import { EngagementMetrics } from "../models/data/EventPriorityClassification";
import { WritableDraft } from "../state/redux/ReducerGenerator";

// CalendarEventEngagementMetrics.ts
interface CalendarEventEngagementMetrics extends WritableDraft<EngagementMetrics[]> {
    eventId: string; // ID of the event
    views: number; // Number of views
    clicks: number; // Number of clicks
    registrations: number; // Number of registrations
    // Add any additional engagement metrics as needed
  }
  
  export default CalendarEventEngagementMetrics;
  