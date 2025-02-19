import {
  CodingLanguageEnum,
  LanguageEnum,
} from "@/app/components/communications/LanguageEnum";
import { DocumentTypeEnum } from "@/app/components/documents/DocumentGenerator";
import { FileTypeEnum } from "@/app/components/documents/FileType";
import FormatEnum from "@/app/components/form/FormatEnum";
import AnimationTypeEnum from "@/app/components/libraries/animations/AnimationLibrary";
import {
  BookmarkStatus,
  CalendarStatus,
  DataStatus,
  DevelopmentPhaseEnum,
  NotificationStatus,
  PriorityTypeEnum,
  PrivacySettingEnum,
  ProjectPhaseTypeEnum,
  StatusType,
  SubscriberTypeEnum,
  SubscriptionTypeEnum,
  TaskStatus,
  TeamStatus,
  TodoStatus,
} from "@/app/components/models/data/StatusType";
import { ContentManagementPhaseEnum } from "@/app/components/phases/ContentManagementPhase";
import { FeedbackPhaseEnum } from "@/app/components/phases/FeedbackPhase";
import { TaskPhaseEnum } from "@/app/components/phases/TaskProcess";
import { TenantManagementPhaseEnum } from "@/app/components/phases/TenantManagementPhase";
import { AnalysisTypeEnum } from "@/app/components/projects/DataAnalysisPhase/AnalysisType";
import { SecurityFeatureEnum } from "@/app/components/security/SecurityFeatureEnum";
import { NotificationTypeEnum } from "@/app/components/support/NotificationContext";
import { IdeaCreationPhaseEnum } from "@/app/components/users/userJourney/IdeaCreationPhase";
import { MessageType } from "@/app/generators/MessaageType";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FilterState extends Timestamped, StatusTrackable {
  startDate?: Date;
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
  documentType?: DocumentTypeEnum | string | null;
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
}

const initialState: FilterState = {};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    updateStartDate: (state, action: PayloadAction<Date>) => {
      state.startDate = action.payload;
    },
    updateEndDate: (state, action: PayloadAction<Date>) => {
      state.endDate = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<StatusType | null>) => {
      state.status = action.payload;
    },
    setPriorityFilter: (state, action: PayloadAction<PriorityTypeEnum | null>) => {
      state.priority = action.payload;
    },
    setAssignedUserFilter: (state, action: PayloadAction<string | null>) => {
      state.assignedUser = action.payload;
    },
    setNotificationTypeFilter: (state, action: PayloadAction<NotificationTypeEnum | null>) => {
      state.notificationType = action.payload;
    },
    setTodoStatusFilter: (state, action: PayloadAction<TodoStatus | null>) => {
      state.todoStatus = action.payload;
    },
    setTaskStatusFilter: (state, action: PayloadAction<TaskStatus | null>) => {
      state.taskStatus = action.payload;
    },
    setTeamStatusFilter: (state, action: PayloadAction<TeamStatus | null>) => {
      state.teamStatus = action.payload;
    },
    setDataStatusFilter: (state, action: PayloadAction<DataStatus | null>) => {
      state.dataStatus = action.payload;
    },
    setCalendarStatusFilter: (state, action: PayloadAction<CalendarStatus | null>) => {
      state.calendarStatus = action.payload;
    },
    setNotificationStatusFilter: (state, action: PayloadAction<NotificationStatus | null>) => {
      state.notificationStatus = action.payload;
    },
    setBookmarkStatusFilter: (state, action: PayloadAction<BookmarkStatus | null>) => {
      state.bookmarkStatus = action.payload;
    },
    setPriorityTypeFilter: (state, action: PayloadAction<PriorityTypeEnum | null>) => {
      state.priorityType = action.payload;
    },
    setProjectPhaseFilter: (state, action: PayloadAction<ProjectPhaseTypeEnum | null>) => {
      state.projectPhase = action.payload;
    },
    setDevelopmentPhaseFilter: (state, action: PayloadAction<DevelopmentPhaseEnum | null>) => {
      state.developmentPhase = action.payload;
    },
    setSubscriberTypeFilter: (state, action: PayloadAction<SubscriberTypeEnum | null>) => {
      state.subscriberType = action.payload;
    },
    setSubscriptionTypeFilter: (state, action: PayloadAction<SubscriptionTypeEnum | null>) => {
      state.subscriptionType = action.payload;
    },
    setPriorityTypeEFilter: (state, action: PayloadAction<PriorityTypeEnum | null>) => {
      state.priorityType = action.payload;
    },
    setAnalysisTypeFilter: (state, action: PayloadAction<AnalysisTypeEnum | null>) => {
      state.analysisType = action.payload;
    },
    setDocumentTypeFilter: (state, action: PayloadAction<DocumentTypeEnum | null>) => {
      state.documentType = action.payload;
    },
    setFileTypeFilter: (state, action: PayloadAction<FileTypeEnum | null>) => {
      state.fileType = action.payload;
    },
    setTenantTypeFilter: (state, action: PayloadAction<TenantManagementPhaseEnum | null>) => {
      state.tenantType = action.payload;
    },
    setIdeaCreationPhaseTypeFilter: (state, action: PayloadAction<IdeaCreationPhaseEnum | null>) => {
      state.ideaCreationPhaseType = action.payload;
    },
    setSecurityFeatureTypeFilter: (state, action: PayloadAction<SecurityFeatureEnum | null>) => {
      state.securityFeatureType = action.payload;
    },
    setFeedbackPhaseTypeFilter: (state, action: PayloadAction<FeedbackPhaseEnum | null>) => {
      state.feedbackPhaseType = action.payload;
    },
    setContentManagementTypeFilter: (state, action: PayloadAction<ContentManagementPhaseEnum | null>) => {
      state.contentManagementType = action.payload;
    },
    setTaskPhaseTypeFilter: (state, action: PayloadAction<TaskPhaseEnum | null>) => {
      state.taskPhaseType = action.payload;
    },
    setAnimationTypeFilter: (state, action: PayloadAction<AnimationTypeEnum | null>) => {
      state.animationType = action.payload;
    },
    setLanguageTypeFilter: (state, action: PayloadAction<LanguageEnum | null>) => {
      state.languageType = action.payload;
    },
    setCodingLanguageTypeFilter: (state, action: PayloadAction<CodingLanguageEnum | null>) => {
      state.codingLanguageType = action.payload;
    },
    setFormatTypeFilter: (state, action: PayloadAction<FormatEnum | null>) => {
      state.formatType = action.payload;
    },
    setPrivacySettingsTypeFilter: (state, action: PayloadAction<PrivacySettingEnum | null>) => {
      state.privacySettingsType = action.payload;
    },
    setMessageTypeFilter: (state, action: PayloadAction<MessageType | null>) => {
      state.messageType = action.payload;
    },
    // Add more reducer functions for additional filters as needed
  },
});

export const {
  updateStartDate,
  updateEndDate,
  setStatusFilter,
  setPriorityFilter,
  setAssignedUserFilter,
  setNotificationTypeFilter,
  setTodoStatusFilter,
  setTaskStatusFilter,
  setTeamStatusFilter,
  setDataStatusFilter,
  setCalendarStatusFilter,
  setNotificationStatusFilter,
  setBookmarkStatusFilter,
  setPriorityTypeFilter,
  setProjectPhaseFilter,
  setDevelopmentPhaseFilter,
  setSubscriberTypeFilter,
  setSubscriptionTypeFilter,
  setPriorityTypeEFilter,
  setAnalysisTypeFilter,
  setDocumentTypeFilter,
  setFileTypeFilter,
  setTenantTypeFilter,
  setIdeaCreationPhaseTypeFilter,
  setSecurityFeatureTypeFilter,
  setFeedbackPhaseTypeFilter,
  setContentManagementTypeFilter,
  setTaskPhaseTypeFilter,
  setAnimationTypeFilter,
  setLanguageTypeFilter,
  setCodingLanguageTypeFilter,
  setFormatTypeFilter,
  setPrivacySettingsTypeFilter,
  setMessageTypeFilter,
} = filterSlice.actions;

export default filterSlice.reducer;
export type { FilterState };
