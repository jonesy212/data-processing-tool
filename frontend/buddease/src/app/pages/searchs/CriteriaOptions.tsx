// CriteriaOptions.ts
import {CommunicationTypeEnum, CollaborationPhaseEnum,
  CollaborationToolEnum,
  ActivityLevelEnum,
  CreativityLevelEnum,
  CryptoAssetTypeEnum,
  EngagementTypeEnum,
  FeedbackTypeEnum,
  InnovationTypeEnum,
  InvestmentStrategyEnum,
  MarketTrendEnum,
  MilestoneStatusEnum,
  PerformanceStatusEnum,
  PhaseDurationEnum,
  TechnologyEnum} from './CriteriaEnums'
import { DataStatus, NotificationStatus, PriorityTypeEnum, ProjectPhaseTypeEnum, StatusType, TaskStatus, TeamStatus } from "@/app/components/models/data/StatusType";
import { FilterCriteria } from "./FilterCriteria";
import { SearchCriteria } from "@/app/components/routing/SearchCriteria";
import { UserRoleEnum } from "@/app/components/users/UserRoles";
import { LanguageEnum } from "@/app/components/communications/LanguageEnum";
import { DocumentTypeEnum } from "@/app/components/documents/DocumentGenerator";
import { FileTypeEnum } from "@/app/components/documents/FileType";
import AnimationTypeEnum from "@/app/components/libraries/animations/AnimationLibrary";
import { ContentManagementPhaseEnum } from "@/app/components/phases/ContentManagementPhase";
import { FeedbackPhaseEnum } from "@/app/components/phases/FeedbackPhase";
import { NotificationTypeEnum } from "@/app/components/support/NotificationContext";
import { MessageType } from "@/app/generators/MessaageType";


enum EffortLevelEnum {
    LOW = 'Low Effort',        // Tasks that require minimal time and resources
    MEDIUM = 'Medium Effort',  // Tasks that require a moderate amount of time and resources
    HIGH = 'High Effort',      // Tasks that require significant time and resources
    CRITICAL = 'Critical Effort' // Tasks that are complex and demanding, requiring immediate attention
  }
  
  
  
  // A mixed criteria type
  interface MixedCriteria extends SearchCriteria, FilterCriteria {
    description?: string | null;  // Added from FilterCriteria for search context
    priority?: string | PriorityTypeEnum | null;  // To allow filtering based on priority
    assignedUser?: string | null;  // To filter by the assigned user
    projectPhase?: ProjectPhaseTypeEnum | null;  // To filter/search by project phase
    teamStatus?: TeamStatus | null;  // To filter by team-related status
    startDate?: Date;  // For both filtering and searching
    endDate?: Date;  // For both filtering and searching
  }
  
  
  interface ExtendedMixedCriteria extends MixedCriteria {
    tags?: string[];  // To filter tasks by tags
    milestones?: string[];  // To filter tasks based on milestones
    userRole?: UserRoleEnum | null;  // To filter by user role
    userAvailability?: boolean;  // To check if users are available for tasks
    completionStatus?: boolean;  // To filter completed or pending tasks
    estimatedTime?: number;  // To filter based on estimated completion time
    effortLevel?: EffortLevelEnum | null;  // To filter by effort level
    clientName?: string | null;  // To filter projects by client
    budgetRange?: [number, number];  // To filter projects by budget range
    riskLevel?: PriorityTypeEnum | null;  // To filter based on risk levels
    dependencies?: string[];  // To filter based on task dependencies
  }
  
  
  
  interface ProjectManagementCriteria extends SearchCriteria, FilterCriteria {
    // Unique combinations for more specific use cases
    taskTimeframe?: {
      startDate?: Date;
      endDate?: Date;
    };
    projectStatus?: {
      status?: StatusType | null;
      teamStatus?: TeamStatus | null;
      projectPhase?: ProjectPhaseTypeEnum | null;
      taskStatus?: TaskStatus | null;
    };
    userAssignments?: {
      assignedUser?: string | null;
      userRole?: UserRoleEnum | null;
      userAvailability?: boolean;
    };
    notifications?: {
      notificationType?: NotificationTypeEnum | null;
      notificationStatus?: NotificationStatus | null;
      messageType?: MessageType | null;
    };
    dataManagement?: {
      documentType?: DocumentTypeEnum | null;
      fileType?: FileTypeEnum | null;
      dataStatus?: DataStatus | null;
      priorityType?: PriorityTypeEnum | null;
    };
    contentFilters?: {
      contentManagementType?: ContentManagementPhaseEnum | null;
      feedbackPhaseType?: FeedbackPhaseEnum | null;
      animationType?: AnimationTypeEnum | null;
      languageType?: LanguageEnum | null;
    };
  }
  


  interface CollaborationCriteria {
    communicationType?: CommunicationTypeEnum | null; // Type of communication (audio, video, text)
    collaborationPhase?: CollaborationPhaseEnum | null; // Phase of collaboration (brainstorming, execution, feedback)
    teamMembers?: string[] | null; // List of team members involved
    collaborationTools?: CollaborationToolEnum[] | null; // Tools used for collaboration (whiteboard, screen sharing, etc.)
  }
  
  interface ProjectPhaseCriteria {
    currentPhase?: ProjectPhaseTypeEnum | null; // Current phase of the project (ideation, development, launch)
    phaseDuration?: PhaseDurationEnum | null; // Duration of each phase (short, medium, long)
    milestoneStatus?: MilestoneStatusEnum | null; // Status of milestones within each phase
  }

  
  interface CryptoManagementCriteria {
    cryptoAssetType?: CryptoAssetTypeEnum | null; // Type of cryptocurrency (Bitcoin, Ethereum, etc.)
    investmentStrategy?: InvestmentStrategyEnum | null; // Type of investment strategy (long-term, short-term)
    marketTrends?: MarketTrendEnum[] | null; // Current trends in the cryptocurrency market
    portfolioPerformance?: PerformanceStatusEnum | null; // Performance status of the crypto portfolio (gaining, losing, stable)
  }

  
  interface UserEngagementCriteria {
    activityLevel?: ActivityLevelEnum | null; // Level of user activity (high, medium, low)
    engagementType?: EngagementTypeEnum | null; // Type of engagement (comments, posts, collaborations)
    communityFeedback?: FeedbackTypeEnum | null; // Type of feedback received from community (positive, negative)
  }

  interface InnovationCriteria {
    innovationType?: InnovationTypeEnum | null; // Type of innovation (disruptive, incremental)
    creativityLevel?: CreativityLevelEnum | null; // Level of creativity involved (high, medium, low)
    technologyUsed?: TechnologyEnum[] | null; // Technologies used for innovative solutions (AI, blockchain, etc.)
  }

  
  interface ProjectManagementComprehensiveCriteria extends 
  CollaborationCriteria, 
  ProjectPhaseCriteria, 
  CryptoManagementCriteria, 
  UserEngagementCriteria, 
  InnovationCriteria {
  // Additional criteria can be added here
}




export type {MixedCriteria,
  ProjectManagementCriteria}

// Example usage
const criteria: ProjectManagementComprehensiveCriteria = {
  communicationType: CommunicationTypeEnum.VIDEO,
  currentPhase: ProjectPhaseTypeEnum.Development,
  cryptoAssetType: CryptoAssetTypeEnum.BITCOIN,
  activityLevel: ActivityLevelEnum.HIGH,
  innovationType: InnovationTypeEnum.DISRUPTIVE,
};

