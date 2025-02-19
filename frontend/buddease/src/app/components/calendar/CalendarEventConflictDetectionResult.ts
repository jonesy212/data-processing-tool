import { EventConflictDetectionResult } from "../models/data/EventPriorityClassification";

// CalendarEventConflictDetectionResult.ts
interface CalendarEventConflictDetectionResult extends EventConflictDetectionResult {
    eventId: string; // ID of the event being checked for conflicts
    conflictingEvents: ConflictingEvent[]; // Array of conflicting events
  }
  
  interface ConflictingEvent {
    eventId: string; // ID of the conflicting event
    conflictingEventTitle: string; // Title of the conflicting event
    conflictingEventStart: Date; // Start time of the conflicting event
    conflictingEventEnd: Date; // End time of the conflicting event
  }
  
export default CalendarEventConflictDetectionResult;
  
