// DataAnalysisResult.ts
import { Attachment } from "@/app/documents/attachment/Attachment";
import { PriorityTypeEnum } from "@/app/models/data/StatusType";
import { Phase } from '@/app/models/phases/Phase';
import { SnapshotStoreReference } from '@/app/snapshots/SnapshotStore';
import { AllStatus } from "@/app/state/stores/DetailsListStore";
import { AnalysisTypeEnum } from "@/app/typings/AnalysisType";
import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import SnapshotStore from '@/app/snapshots/SnapshotStore'

export interface DataAnalysisResult<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T 
> {
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
  phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  priority: PriorityTypeEnum;
  snapshotStores?: SnapshotStoreReference<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | Map<number, SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
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
