import { Data } from "../../models/data/Data";
import { DataStatus } from "../../models/data/StatusType";
import { Phase } from "../../phases/Phase";
import { Snapshot } from "../../snapshots";
import { AllStatus } from "../../state/stores/DetailsListStore";
import { AnalysisTypeEnum } from "./AnalysisType";

// DataAnalysisResult.ts
export interface DataAnalysisResult extends Data {
  id: string | number; // Unique identifier for the data analysis result
  title: string; // Title of the data analysis result
  insights: string[]; // Array of insights gained from the data analysis
  analysisType: AnalysisTypeEnum | undefined;
  analysisDate: Date;
  results: string[];
  result: number
  description: string
  status: AllStatus
  createdAt: Date,
  updatedAt: Date | undefined,
  sentiment: number,
  recommendations: string[]; // Array of recommendations based on the analysis
  sentimentAnalysis: boolean;
  metrics: {
    // Object containing various metrics related to the analysis
    accuracy: number; // Accuracy metric
    precision: number; // Precision metric
    recall: number; // Recall metric
    f1Score: number; // F1 Score metric
    // Add more specific metrics as needed
  };
  visualizations: {
    // Object containing visualizations generated from the analysis
    charts: string[]; // Array of URLs or file paths to charts/graphs
    diagrams: string[]; // Array of URLs or file paths to diagrams
    // Add more visualization types as needed
  };
      // Additional analysis types based on the description provided:
  communityImpact: boolean; // Analysis to measure the impact on the community
  globalCollaboration: boolean; // Analysis to evaluate global collaboration effectiveness
  solutionQuality: boolean; // Analysis to assess the quality of solutions generated
  unityPromotion: boolean; // Analysis to measure the promotion of unity among users
  humanityBenefit: boolean; // Analysis to quantify the benefit to humanity

  conclusions: string; // Summary of conclusions drawn from the analysis
  futureSteps: string[]; // Array of future steps or actions to be taken based on the analysis
  // Add more properties as necessary
}
