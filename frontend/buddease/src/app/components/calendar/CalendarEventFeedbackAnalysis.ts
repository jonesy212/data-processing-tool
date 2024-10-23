import { EventFeedbackAnalysis } from "../models/data/EventPriorityClassification";
import { WritableDraft } from "../state/redux/ReducerGenerator";

// CalendarEventFeedbackAnalysis.ts
interface CalendarEventFeedbackAnalysis extends WritableDraft<EventFeedbackAnalysis> {
  eventId: string; // ID of the event being analyzed
    feedback: string[]; // Array of feedback comments or messages
    sentimentAnalysis: EventSentimentAnalysis; // Sentiment analysis results for the feedback
  }
  
  // Define an interface for sentiment analysis results
  interface EventSentimentAnalysis {
    positive: number; // Number of positive sentiment comments
    neutral: number; // Number of neutral sentiment comments
    negative: number; // Number of negative sentiment comments
  }
  
  export default CalendarEventFeedbackAnalysis;
  