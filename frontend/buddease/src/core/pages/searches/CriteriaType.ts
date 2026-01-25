// CriteriaType.ts
import { CodingLanguageEnum, LanguageEnum } from "@/core/communications/LanguageEnum";
import FormatEnum from "@/core/components/form/FormatEnum";
import { ContentManagementPhaseEnum } from "@/core/components/phases/ContentManagementPhase";
import { FeedbackPhaseEnum } from "@/core/components/phases/FeedbackPhase";
import { TaskPhaseEnum } from "@/core/components/phases/TaskProcess";
import { TenantManagementPhaseEnum } from "@/core/components/phases/TenantManagementPhase";
import { FileTypeEnum } from "@/core/documents/FileType";
import type { NotificationType } from '@/core/features/support/UnifiedNotificationTypes';
import { MessageType } from "@/core/generators/MessaageType";
import AnimationTypeEnum from "@/core/libraries/animations/AnimationLibrary";
import { BookmarkStatus, CalendarStatus, DataStatus, DevelopmentPhaseEnum, NotificationStatus, PriorityTypeEnum, PrivacySettingEnum, ProjectPhaseTypeEnum, StatusType, SubscriberTypeEnum, SubscriptionTypeEnum, TaskStatus, TeamStatus, TodoStatus } from '@/core/models/data/StatusType';
import { SecurityFeatureEnum } from "@/core/server/security/SecurityFeatureEnum";
import type { FilterState } from "@/core/state/redux/slices/FilterSlice";
import { AnalysisTypeEnum } from "@/core/typings/AnalysisType";
import { DocumentTypeEnum } from "@/core/typings/documentTypes";
import { IdeaCreationPhaseEnum } from "@/core/users/userJourney/IdeaCreationPhase";

export type PriorityValue = string | PriorityTypeEnum | null | undefined;
// -------------------
// Priority Types
// -------------------
type ValidPriority = "low" | "medium" | "high" | "scheduled" | "completed";

// Define CriteriaType incorporating FilterCriteria
export type CriteriaType = {
  startDate?: Date;
  filterBy?: string;
  value?: string
  endDate?: Date;
  limit?: number
  offset?: number;
  status?: StatusType | null;
  priority?: PriorityValue
  assignedUser?: string | null;
  notificationType?: NotificationType | null;
  todoStatus?: TodoStatus | null;
  taskStatus?: TaskStatus | null;
  teamStatus?: TeamStatus | null;
  dataStatus?: DataStatus | null;
  calendarStatus?: CalendarStatus | null;
  notificationStatus?: NotificationStatus | null;
  bookmarkStatus?: BookmarkStatus | null;
  priorityType?: PriorityTypeEnum | null;
  projectPhase?: ProjectPhaseTypeEnum | null;
  developmentPhase?: DevelopmentPhaseEnum | null;
  subscriberType?: SubscriberTypeEnum | null;
  subscriptionType?: SubscriptionTypeEnum | null;
  analysisType?: AnalysisTypeEnum | null;
  documentType?: DocumentTypeEnum | null;
  fileType?: FileTypeEnum | null;
  tenantType?: TenantManagementPhaseEnum | null;
  ideaCreationPhaseType?: IdeaCreationPhaseEnum | null;
  securityFeatureType?: SecurityFeatureEnum | null;
  feedbackPhaseType?: FeedbackPhaseEnum | null;
  contentManagementType?: ContentManagementPhaseEnum | null;
  taskPhaseType?: TaskPhaseEnum | null;
  animationType?: AnimationTypeEnum | null;
  languageType?: LanguageEnum | null;
  codingLanguageType?: CodingLanguageEnum | null;
  formatType?: FormatEnum | null;
  privacySettingsType?: PrivacySettingEnum | null;
  messageType?: MessageType | null;
  tableName?: string
    // Add more filter criteria as needed
};
  


function hasCriteriaProperties(snapshot: any): snapshot is FilterState {
    return (
      'startDate' in snapshot &&
      'endDate' in snapshot &&
      'status' in snapshot &&
      'priority' in snapshot &&
      'assignedUser' in snapshot &&
      'notificationType' in snapshot &&
      'todoStatus' in snapshot &&
      'taskStatus' in snapshot &&
      'teamStatus' in snapshot &&
      'dataStatus' in snapshot &&
      'calendarStatus' in snapshot &&
      'notificationStatus' in snapshot &&
      'bookmarkStatus' in snapshot &&
      'priorityType' in snapshot &&
      'projectPhase' in snapshot &&
      'developmentPhase' in snapshot &&
      'subscriberType' in snapshot &&
      'subscriptionType' in snapshot &&
      'analysisType' in snapshot &&
      'documentType' in snapshot &&
      'fileType' in snapshot &&
      'tenantType' in snapshot &&
      'ideaCreationPhaseType' in snapshot &&
      'securityFeatureType' in snapshot &&
      'feedbackPhaseType' in snapshot &&
      'contentManagementType' in snapshot &&
      'taskPhaseType' in snapshot &&
      'animationType' in snapshot &&
      'languageType' in snapshot &&
      'codingLanguageType' in snapshot &&
      'formatType' in snapshot &&
      'privacySettingsType' in snapshot &&
        'messageType' in snapshot &&
    'userRole' in snapshot &&
    'projectStatus' in snapshot &&
    'milestone' in snapshot &&
    'budgetStatus' in snapshot &&
    'resourceAllocation' in snapshot
    );
  }
  
  export { hasCriteriaProperties };
export type { ValidPriority };

