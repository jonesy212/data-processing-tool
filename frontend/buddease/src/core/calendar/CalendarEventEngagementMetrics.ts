// CalendarEventEngagementMetrics.ts
import { EngagementMetrics } from "@/core/models/data/EventPriorityClassification";
import { WritableDraft } from "@/core/state/redux/ReducerGenerator";

interface CalendarEventEngagementMetrics extends WritableDraft<EngagementMetrics[]> {
    eventId: string; // ID of the event
    views: number; // Number of views
    clicks: number; // Number of clicks
    registrations: number; // Number of registrations
    // Add any additional engagement metrics as needed
  }
  
  export default CalendarEventEngagementMetrics;
  