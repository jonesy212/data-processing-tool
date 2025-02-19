// EventContentAnalysis.tsx

import { processAutoGPTOutputWithSpaCy } from "../../intelligence/AutoGPTSpaCyIntegration";
import axiosInstance from "../../security/csrfToken";
import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';

// Define a class or interface for content analysis
export interface ScheduleOptimization {
  eventId: string;
  suggestedStartTime: Date;
  suggestedEndTime: Date;
  recommendedDuration: number; // Duration in minutes
  alternativeTimes: { startTime: Date; endTime: Date }[]; // Array of alternative time slots
  // Add more properties as needed
}

export interface EventImpactAnalysis {
  id: string;
  eventName: string;
  impactLevel: string;
  insights: string[];
  // Add more properties as needed
}

export interface EventContentValidationResults {
  isValid: boolean;
  validationErrors: string[];
  // Add more properties as needed
}


export class EventContentAnalysis {
  constructor(public result: string) {}
}

// Function to perform content analysis on calendar event
export const performContentAnalysis = async (
  event: CalendarEvent
): Promise<EventContentAnalysis> => {
  try {
    // Step 1: Fetch event content
    const eventContent = await fetchEventContent(event);

    // Step 2: Analyze content
    const analysisResult = await analyzeContent(eventContent);

    // Step 3: Display analysis result
    console.log("Analysis Result:", analysisResult);
    // Display the analysis result in the user interface or log it for inspection.
    return new EventContentAnalysis(analysisResult);
  } catch (error) {
    // Handle errors
    console.error("Error performing content analysis:", error);
    throw error;
  }
};

// Function to fetch content of the calendar event
const fetchEventContent = async (event: CalendarEvent): Promise<string> => {
  try {
    // Example: Fetch event content from backend using event ID
    const response = await axiosInstance.get(
      `/api/calendar-events/${event.id}/content`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching event content:", error);
    throw error;
  }
};

// Function to analyze event content

// Function to analyze event content using spaCy integration
const analyzeContent = async (content: string): Promise<string> => {
  try {
    // Process content with spaCy for enhanced analysis
    const enhancedAnalysis = await processAutoGPTOutputWithSpaCy(content);

    // Return the enhanced analysis result
    return enhancedAnalysis || "Unable to perform enhanced content analysis";
  } catch (error) {
    console.error("Error analyzing content with spaCy integration:", error);
    throw error;
  }
};
