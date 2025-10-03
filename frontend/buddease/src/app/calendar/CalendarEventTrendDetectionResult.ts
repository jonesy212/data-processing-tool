import { EventTrendType } from "@/app/components/models/data/EventPriorityClassification";

// CalendarEventTrendDetectionResult.ts
interface CalendarEventTrendDetectionResult {
    eventId: string; // ID of the event
    trend: EventTrendType
    trendFactors: string[]; // Factors contributing to the detected trend
  }
  
  export default CalendarEventTrendDetectionResult;
  