CalendarEventTrendDetectionResult.ts
import type { EventTrendType } from "@/core/models/data/EventPriorityClassification";

interface CalendarEventTrendDetectionResult {
    eventId: string; // ID of the event
    trend: EventTrendType
    trendFactors: string[]; // Factors contributing to the detected trend
  }
  
  export default CalendarEventTrendDetectionResult;
  