import { MessageType } from "@/app/generators/MessaageType";
import { CodingLanguageEnum, LanguageEnum } from "../../components/communications/LanguageEnum";
import { DocumentTypeEnum } from "../../components/documents/DocumentGenerator";
import { FileTypeEnum } from "../../components/documents/FileType";
import FormatEnum from "../../components/form/FormatEnum";
import AnimationTypeEnum from "../../components/libraries/animations/AnimationLibrary";
import { BookmarkStatus, CalendarStatus, DataStatus, DevelopmentPhaseEnum, NotificationStatus, PriorityTypeEnum, PrivacySettingEnum, ProjectPhaseTypeEnum, StatusType, SubscriberTypeEnum, SubscriptionTypeEnum, TaskStatus, TeamStatus, TodoStatus } from "../../components/models/data/StatusType";
import { ContentManagementPhaseEnum } from "../../components/phases/ContentManagementPhase";
import { FeedbackPhaseEnum } from "../../components/phases/FeedbackPhase";
import { TaskPhaseEnum } from "../../components/phases/TaskProcess";
import { TenantManagementPhaseEnum } from "../../components/phases/TenantManagementPhase";
import { AnalysisTypeEnum } from "../../components/projects/DataAnalysisPhase/AnalysisType";
import { SecurityFeatureEnum } from "../../components/security/SecurityFeatureEnum";
import { NotificationTypeEnum } from "../../components/support/NotificationContext";
import { IdeaCreationPhaseEnum } from "../../components/users/userJourney/IdeaCreationPhase";
import { FilterState } from "@/app/components/state/redux/slices/FilterSlice";

// CriteriaType.ts
// Define CriteriaType incorporating FilterCriteria
export type CriteriaType = {
    startDate?: Date;
    filterBy?: string;
    value?: string
    endDate?: Date;
    status?: StatusType | null;
    priority?: PriorityTypeEnum | null;
    assignedUser?: string | null;
    notificationType?: NotificationTypeEnum | null;
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
  
  export {hasCriteriaProperties}