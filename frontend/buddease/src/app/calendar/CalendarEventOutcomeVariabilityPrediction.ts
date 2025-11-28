// CalendarEventOutcomeVariabilityPrediction.ts
import { OutcomeVariabilityPrediction } from "@/app/models/data/EventPriorityClassification";

interface CalendarEventOutcomeVariabilityPrediction extends OutcomeVariabilityPrediction {
    eventId: string; // ID of the event
    outcomeVariability: number; // Outcome variability predicted for the event
    // Add any additional properties or methods as needed
  }
  
  export default CalendarEventOutcomeVariabilityPrediction;
  