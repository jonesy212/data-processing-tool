import { CodingLanguageEnum, LanguageEnum } from "@/app/communications/LanguageEnum";
import { FileTypeEnum } from "@/app/documents/FileType";
import FormatEnum from "@/app/components/form/FormatEnum";
import { ContentManagementPhaseEnum } from "@/app/components/phases/ContentManagementPhase";
import { FeedbackPhaseEnum } from "@/app/components/phases/FeedbackPhase";
import { TaskPhaseEnum } from "@/app/components/phases/TaskProcess";
import { TenantManagementPhaseEnum } from "@/app/components/phases/TenantManagementPhase";
import { AnalysisTypeEnum } from "@/app/typings/AnalysisType";
import { SecurityFeatureEnum } from "@/app/server/security/SecurityFeatureEnum";
import { IdeaCreationPhaseEnum } from "@/app/users/userJourney/IdeaCreationPhase";
import { MessageType } from "@/app/generators/MessaageType";
import AnimationTypeEnum from "@/app/libraries/animations/AnimationLibrary";
import { BookmarkStatus, CalendarStatus, DataStatus, DevelopmentPhaseEnum, NotificationStatus, PriorityTypeEnum, PrivacySettingEnum, ProjectPhaseTypeEnum, StatusType, SubscriberTypeEnum, SubscriptionTypeEnum, TaskStatus, TeamStatus, TodoStatus } from '@/app/models/data/StatusType';
import { FilterState } from "@/app/state/redux/slices/FilterSlice";
import { DocumentTypeEnum } from "@/app/typings/documentTypes";
import { NotificationType } from "@/context/NotificationContext";

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
export type { ValidPriority }