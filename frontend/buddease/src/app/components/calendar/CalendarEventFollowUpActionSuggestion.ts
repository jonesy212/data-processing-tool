import { FollowUpAction } from "../models/data/EventPriorityClassification";

// CalendarEventFollowUpActionSuggestion.ts
interface CalendarEventFollowUpActionSuggestion extends FollowUpAction {
    eventId: string; // ID of the event for which the follow-up action is suggested
    suggestion: string; // Description of the suggested follow-up action
    priority: 'low' | 'medium' | 'high'; // Priority level of the suggested action
    // Add any additional properties related to follow-up action suggestions
  }
  
  export default CalendarEventFollowUpActionSuggestion;
  