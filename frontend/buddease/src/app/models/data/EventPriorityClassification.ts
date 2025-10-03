import { PriorityTypeEnum } from "./StatusType";



export type EventTrendType = "Increasing" | "Decreasing" | "Stable" |  "Positive" | "Neutral" | "Negative"; 
// EventPriorityClassification.ts
interface EventPriorityClassification {
  eventId: string;
  priority: PriorityTypeEnum;
}

interface EventFeedbackAnalysis {
  eventId: string;
  feedback: string[];
  rating: number; // Rating out of 5 or any other scale
}

interface EventConflictDetectionResult {
  eventId: string;
  conflicts: string[]; // Array of conflicting event IDs
}

interface EventSuccessPrediction {
  eventId: string;
  successProbability: number; // Probability of success, e.g., between 0 and 1
}

interface EventEffectivenessEvaluation {
  eventId: string;
  effectivenessScore: number; // Effectiveness score, e.g., between 0 and 100
}

interface EventTrendDetectionResult {
  eventId: string;
  trend: EventTrendType
}

interface EventRoiAnalysis {
  eventId: string;
  roi: number; // Return on investment, e.g., percentage
}

interface OutcomeVariabilityPrediction {
  eventId: string;
  variabilityProbability: number; // Probability of outcome variability, e.g., between 0 and 1
}

interface EventRiskAssessment {
  eventId: string;
  riskLevel: "Low" | "Medium" | "High"; // Risk level assessment
}

interface EventContent {
  eventId: string;
  title: string;
  summary: string;
  content: string; // Content of the event
}

interface PersonalizedInvitation {

  userId: string; // ID of the user
  userName: string; // Name of the user
  invitationMessage: string; // Personalized invitation message for the user
  eventId: string;
  recipientEmail: string; // Email of the recipient
  message: string; // Invitation message
}

interface EngagementMetrics {
  eventId: string;
  metrics: Record<string, number>; // Engagement metrics, e.g., views, clicks, responses
}

interface ImpactPrediction {
  eventId: string;
    predictedImpact: number; // Predicted impact of the event, e.g., on sales, brand awareness
    confidenceScore: number; // Confidence score of the prediction between 0-1
}

interface FollowUpAction {
  eventId: string;
  action: string; // Description of the follow-up action
}

interface RecommendedOptimization {
  eventId: string;
  optimization: string; // Description of the recommended optimization
}

export type {
  EngagementMetrics,
  EventConflictDetectionResult,
  EventContent,
  EventEffectivenessEvaluation,
  EventFeedbackAnalysis,
  EventPriorityClassification,
  EventRiskAssessment,
  EventRoiAnalysis,
  EventSuccessPrediction,
  EventTrendDetectionResult,
  FollowUpAction,
  ImpactPrediction,
  OutcomeVariabilityPrediction,
  PersonalizedInvitation,
  RecommendedOptimization
};

