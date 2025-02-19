import { RecommendedOptimization } from "../models/data/EventPriorityClassification";

// CalendarEventOptimizationRecommendation.ts
interface CalendarEventOptimizationRecommendation extends RecommendedOptimization {
  eventId: string; // ID of the event for which the optimization recommendation is provided
  recommendation: string; // Description of the optimization recommendation
  priority: 'low' | 'medium' | 'high'; // Priority level of the recommendation
  // Add any additional properties related to optimization recommendations
}

export default CalendarEventOptimizationRecommendation;
