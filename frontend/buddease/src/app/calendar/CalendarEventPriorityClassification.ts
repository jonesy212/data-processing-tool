// CalendarEventPriorityClassification.ts
import { WritableDraft } from '@/app/state/redux/ReducerGenerator';
import { EventPriorityClassification } from "@/app/models/data/EventPriorityClassification";

interface CalendarEventPriorityClassification extends WritableDraft<EventPriorityClassification>{
    eventId: string; // ID of the event being classified
    priorityCategory: EventPriorityCategory; // Priority category of the event
    priorityScore: number; // Priority score assigned to the event
  }
  
  // Define an enum for priority categories
  enum EventPriorityCategory {
    Low = "Low",
    Medium = "Medium",
    High = "High",
  }
  
  export default CalendarEventPriorityClassification;
  