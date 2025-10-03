// NotificationContext.ts
import {
    AnalyticsNotificationTypes,
    AppNotificationTypes,
    AuthNotificationTypes, BaseNotificationTypes,
    CalendarNotificationTypes,
    ChatNotificationTypes,
    ContentNotificationTypes,
    CustomNotificationTypes,
    OnboardingNotificationTypes,
    OperationNotificationTypes,
    PaymentNotificationTypes,
    PhaseNotificationTypes,
    TeamNotificationTypes
} from '@/app/features/support/NotificationTypes';
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { NotificationPosition, PriorityTypeEnum } from "@/app/models/data/StatusType";
import { NotificationData } from "@/app/state/redux/slices/NofiticationsSlice";
import NotificationStore from '@/app/state/stores/NotificationStore';
import {
    DocumentTypeEnum
} from "@/app/typings/documents";
import { createContext, useContext } from 'react';


interface NotificationOptions {
  dataId?: string;
  error?: string;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextProps {
  notify: (
    id: string,
    message: string,
    notificationOptions: NotificationOptions,
    date: Date,
    type: NotificationType,
    position: NotificationPosition
  ) => void;
  setDuration: (duration: number) => void;
  setNotifications: (notifications: Notification[]) => void;
  
  showNotification: (title: string, message: string | Message, content?: any) => void;
  showSuccessNotification: (title: string, message: string | Message, content?: any) => void;
  showErrorNotification: (title: string, message: string | Message, content?: any) => void;
  showInfoNotification: (title: string, message: string | Message, content?: any) => void;
  addNotification: (notification: NotificationData<any>) => void;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  dismissNotification: (notificationId: string) => void;
}
 
type CustomNotificationType = "RandomDismiss";

type NotificationType =
  | (typeof NotificationTypeEnum)[keyof typeof NotificationTypeEnum] 
  | DocumentTypeEnum
  | PriorityTypeEnum
  | CustomNotificationType;

// In NotificationContext.ts - compatibility layer
const NotificationTypeEnum = {
  // App types
  APP_VERSION: AppNotificationTypes.APP_VERSION,
  APP_STRUCTURE_ID: AppNotificationTypes.APP_STRUCTURE_ID,
  CUSTOM_ID: AppNotificationTypes.CUSTOM_ID,
  GENERATED_ID: AppNotificationTypes.GENERATED_ID,
  LOCATION_ID: AppNotificationTypes.LOCATION_ID,
  PHASE_ID: AppNotificationTypes.PHASE_ID,
  PRESENTATION_ID: AppNotificationTypes.PRESENTATION_ID,
  PROJECT_REVENUE_ID: AppNotificationTypes.PROJECT_REVENUE_ID,
  VERSION_ID: AppNotificationTypes.VERSION_ID,
  USER_ID: AppNotificationTypes.USER_ID,
  TASK_BOARD_ID: AppNotificationTypes.TASK_BOARD_ID,
  BRAINSTORMING_SESSION_ID: AppNotificationTypes.BRAINSTORMING_SESSION_ID,

  // Analytics types
  ANALYTICS_ID: AnalyticsNotificationTypes.ANALYTICS_ID,
  LOGGING_ERROR: AnalyticsNotificationTypes.LOGGING_ERROR,
  LOGGING_INFO: AnalyticsNotificationTypes.LOGGING_INFO,
  LOGGING_WARNING: AnalyticsNotificationTypes.LOGGING_WARNING,
  BUTTON_CLICK: AnalyticsNotificationTypes.BUTTON_CLICK,
  TASK_LOGGED: AnalyticsNotificationTypes.TASK_LOGGED,

  // Base types
  ERROR: BaseNotificationTypes.ERROR,
  WARNING: BaseNotificationTypes.WARNING,
  INFO: BaseNotificationTypes.INFO,
  SUCCESS: BaseNotificationTypes.SUCCESS,
  DATA_LOADING: BaseNotificationTypes.DATA_LOADING,
  PAGE_LOADING: BaseNotificationTypes.PAGE_LOADING,
  SYSTEM_UPDATE_IN_PROGRESS: BaseNotificationTypes.SYSTEM_UPDATE_IN_PROGRESS,
  LOW_DISK_SPACE: BaseNotificationTypes.LOW_DISK_SPACE,
  DATA_LIMIT_APPROACHING: BaseNotificationTypes.DATA_LIMIT_APPROACHING,
  NEW_FEATURE_AVAILABLE: BaseNotificationTypes.NEW_FEATURE_AVAILABLE,
  SYSTEM: BaseNotificationTypes.SYSTEM,
  CONFIGURATION: BaseNotificationTypes.CONFIGURATION,
  TEST: BaseNotificationTypes.TEST,
  DISMISS: BaseNotificationTypes.DISMISS,

  // Auth types
  WELCOME: AuthNotificationTypes.WELCOME,
  ACCOUNT_CREATED: AuthNotificationTypes.ACCOUNT_CREATED,
  INVALID_CREDENTIALS: AuthNotificationTypes.INVALID_CREDENTIALS,
  PASSWORD_CHANGED: AuthNotificationTypes.PASSWORD_CHANGED,
  PROFILE_UPDATED: AuthNotificationTypes.PROFILE_UPDATED,


  // Chat types
  NEW_CHAT_MESSAGE: ChatNotificationTypes.NEW_CHAT_MESSAGE,
  CHAT_MENTION: ChatNotificationTypes.CHAT_MENTION,
  CHAT_ID: ChatNotificationTypes.CHAT_ID,
  CHAT_MESSAGE_ID: ChatNotificationTypes.CHAT_MESSAGE_ID,
  CHAT_THREAD_ID: ChatNotificationTypes.CHAT_THREAD_ID,

  // Calendar types
  CALENDAR_EVENT: CalendarNotificationTypes.CALENDAR_EVENT,
  CALENDAR_ID: CalendarNotificationTypes.CALENDAR_ID,
  CALENDAR_NOTIFICATION: CalendarNotificationTypes.CALENDAR_NOTIFICATION,
  EVENT_ID: CalendarNotificationTypes.EVENT_ID,
  EVENT_OCCURRED: CalendarNotificationTypes.EVENT_OCCURRED,
  EVENT_REMINDER: CalendarNotificationTypes.EVENT_REMINDER,
  MEETING_ID: CalendarNotificationTypes.MEETING_ID,


  // Content types
  CONTENT_ID: ContentNotificationTypes.CONTENT_ID,
  CONTENT_ITEM: ContentNotificationTypes.CONTENT_ITEM,
  VIDEO_ID: ContentNotificationTypes.VIDEO_ID,
  BLOG_POST_ID: ContentNotificationTypes.BLOG_POST_ID,
  COMMENT_ID: ContentNotificationTypes.COMMENT_ID,
  FILE_ID: ContentNotificationTypes.FILE_ID,
  ARTICLE_UPDATED: ContentNotificationTypes.ARTICLE_UPDATED,
  PRODUCT_ID: ContentNotificationTypes.PRODUCT_ID,
  SURVEY_ID: ContentNotificationTypes.SURVEY_ID,
  SNAPSHOT: ContentNotificationTypes.SNAPSHOT,
  SNAPSHOT_ID: ContentNotificationTypes.SNAPSHOT_ID,
  SNAPSHOT_DETAILS: ContentNotificationTypes.SNAPSHOT_DETAILS,

  // Course Development Phases 
  COURSE_DEVELOPMENT_PLANNING_START: PhaseNotificationTypes.COURSE_DEVELOPMENT_PLANNING_START,
  COURSE_DEVELOPMENT_PLANNING_COMPLETE: PhaseNotificationTypes.COURSE_DEVELOPMENT_PLANNING_COMPLETE,
  COURSE_DEVELOPMENT_SETUP_START: PhaseNotificationTypes.COURSE_DEVELOPMENT_SETUP_START,
  COURSE_DEVELOPMENT_SETUP_COMPLETE: PhaseNotificationTypes.COURSE_DEVELOPMENT_SETUP_COMPLETE,
  COURSE_DEVELOPMENT_LEARNING_START: PhaseNotificationTypes.COURSE_DEVELOPMENT_LEARNING_START,
  COURSE_DEVELOPMENT_LEARNING_COMPLETE: PhaseNotificationTypes.COURSE_DEVELOPMENT_LEARNING_COMPLETE,

  // Custom types
  CUSTOM_NOTIFICATION_1: CustomNotificationTypes.CUSTOM_NOTIFICATION_1,
  CUSTOM_NOTIFICATION_2: CustomNotificationTypes.CUSTOM_NOTIFICATION_2,
  ANNOUNCEMENT: CustomNotificationTypes.ANNOUNCEMENT,
  NEW_NOTIFICATION: CustomNotificationTypes.NEW_NOTIFICATION,
  PUSH_NOTIFICATION: CustomNotificationTypes.PUSH_NOTIFICATION,
  UNSUBSCRIBED: CustomNotificationTypes.UNSUBSCRIBED,
  MILESTONE: CustomNotificationTypes.MILESTONE,
  CONTRIBUTION_ID: CustomNotificationTypes.CONTRIBUTION_ID,
  IDEATION_BRAINSTORMING: CustomNotificationTypes.IDEATION_BRAINSTORMING,
  DOCUMENT_EDIT_ID: CustomNotificationTypes.DOCUMENT_EDIT_ID,
  API_CLIENT_ERROR: CustomNotificationTypes.API_CLIENT_ERROR,
  __FILE_PATH__: CustomNotificationTypes.__FILE_PATH__,

  // Data Analysis Sub-Phases
  DATA_ANALYSIS_DEFINE_OBJECTIVE_START: PhaseNotificationTypes.DATA_ANALYSIS_DEFINE_OBJECTIVE_START,
  DATA_ANALYSIS_DEFINE_OBJECTIVE_COMPLETE: PhaseNotificationTypes.DATA_ANALYSIS_DEFINE_OBJECTIVE_COMPLETE,
  DATA_ANALYSIS_DATA_COLLECTION_START: PhaseNotificationTypes.DATA_ANALYSIS_DATA_COLLECTION_START,
  DATA_ANALYSIS_DATA_COLLECTION_COMPLETE: PhaseNotificationTypes.DATA_ANALYSIS_DATA_COLLECTION_COMPLETE,
  DATA_ANALYSIS_CLEAN_DATA_START: PhaseNotificationTypes.DATA_ANALYSIS_CLEAN_DATA_START,
  DATA_ANALYSIS_CLEAN_DATA_COMPLETE: PhaseNotificationTypes.DATA_ANALYSIS_CLEAN_DATA_COMPLETE,
  DATA_ANALYSIS_DATA_ANALYSIS_START: PhaseNotificationTypes.DATA_ANALYSIS_DATA_ANALYSIS_START,
  DATA_ANALYSIS_DATA_ANALYSIS_COMPLETE: PhaseNotificationTypes.DATA_ANALYSIS_DATA_ANALYSIS_COMPLETE,
  DATA_ANALYSIS_DATA_VISUALIZATION_START: PhaseNotificationTypes.DATA_ANALYSIS_DATA_VISUALIZATION_START,
  DATA_ANALYSIS_DATA_VISUALIZATION_COMPLETE: PhaseNotificationTypes.DATA_ANALYSIS_DATA_VISUALIZATION_COMPLETE,
  DATA_ANALYSIS_TRANSFORM_INSIGHTS_START: PhaseNotificationTypes.DATA_ANALYSIS_TRANSFORM_INSIGHTS_START,
  DATA_ANALYSIS_TRANSFORM_INSIGHTS_COMPLETE: PhaseNotificationTypes.DATA_ANALYSIS_TRANSFORM_INSIGHTS_COMPLETE,

  // Operation types
  OPERATION_SUCCESS: OperationNotificationTypes.OPERATION_SUCCESS,
  OPERATION_ERROR: OperationNotificationTypes.OPERATION_ERROR,
  OPERATION_START: OperationNotificationTypes.OPERATION_START,
  OPERATION_UPDATE: OperationNotificationTypes.OPERATION_UPDATE,
  ASSIGNMENT_OPERATION: OperationNotificationTypes.ASSIGNMENT_OPERATION,
  ASSIGNMENT_OPERATION_SUCCESS: OperationNotificationTypes.ASSIGNMENT_OPERATION_SUCCESS,
  CREATION_SUCCESS: OperationNotificationTypes.CREATION_SUCCESS,
  GET_STORE_SUCCESS: OperationNotificationTypes.GET_STORE_SUCCESS,
  API_SUCCESS: OperationNotificationTypes.API_SUCCESS,
  API_ERROR: OperationNotificationTypes.API_ERROR,
  DISPLAY_SUCCESS: OperationNotificationTypes.DISPLAY_SUCCESS,

  // Payment types
  PAYMENT_RECEIVED: PaymentNotificationTypes.PAYMENT_RECEIVED,
  COUPON_CODE: PaymentNotificationTypes.COUPON_CODE,
  
  //Phase Development Phases
  TRADING_ENTHUSIAST_PROFILE_START: PhaseNotificationTypes.TRADING_ENTHUSIAST_PROFILE_START,
  TRADING_ENTHUSIAST_PROFILE_COMPLETE: PhaseNotificationTypes.TRADING_ENTHUSIAST_PROFILE_COMPLETE,
  TRADING_FOLLOW_TRADERS_START: PhaseNotificationTypes.TRADING_FOLLOW_TRADERS_START,
  TRADING_FOLLOW_TRADERS_COMPLETE: PhaseNotificationTypes.TRADING_FOLLOW_TRADERS_COMPLETE,
  TRADING_DO_YOUR_OWN_RESEARCH_START: PhaseNotificationTypes.TRADING_DO_YOUR_OWN_RESEARCH_START,
  TRADING_DO_YOUR_OWN_RESEARCH_COMPLETE: PhaseNotificationTypes.TRADING_DO_YOUR_OWN_RESEARCH_COMPLETE,
  TRADING_PARTICIPATE_CALLS_CONFERENCES_START: PhaseNotificationTypes.TRADING_PARTICIPATE_CALLS_CONFERENCES_START,
  TRADING_PARTICIPATE_CALLS_CONFERENCES_COMPLETE: PhaseNotificationTypes.TRADING_PARTICIPATE_CALLS_CONFERENCES_COMPLETE,
  TRADING_ADD_CONTENT_START: PhaseNotificationTypes.TRADING_ADD_CONTENT_START,
  TRADING_ADD_CONTENT_COMPLETE: PhaseNotificationTypes.TRADING_ADD_CONTENT_COMPLETE,

  TRADING_VERIFICATION_START: PhaseNotificationTypes.TRADING_VERIFICATION_START,
  TRADING_VERIFICATION_COMPLETE: PhaseNotificationTypes.TRADING_VERIFICATION_COMPLETE,
  TRADING_RISK_ASSESSMENT_START: PhaseNotificationTypes.TRADING_RISK_ASSESSMENT_START,
  TRADING_RISK_ASSESSMENT_COMPLETE: PhaseNotificationTypes.TRADING_RISK_ASSESSMENT_COMPLETE,
  TRADING_TRADER_TYPE_SELECTION_START: PhaseNotificationTypes.TRADING_TRADER_TYPE_SELECTION_START,
  TRADING_TRADER_TYPE_SELECTION_COMPLETE: PhaseNotificationTypes.TRADING_TRADER_TYPE_SELECTION_COMPLETE,
  TRADING_PROFESSIONAL_TRADER_PROFILE_START: PhaseNotificationTypes.TRADING_PROFESSIONAL_TRADER_PROFILE_START,
  TRADING_PROFESSIONAL_TRADER_PROFILE_COMPLETE: PhaseNotificationTypes.TRADING_PROFESSIONAL_TRADER_PROFILE_COMPLETE,
  TRADING_PROFESSIONAL_TRADER_DASHBOARD_START: PhaseNotificationTypes.TRADING_PROFESSIONAL_TRADER_DASHBOARD_START,
  TRADING_PROFESSIONAL_TRADER_DASHBOARD_COMPLETE: PhaseNotificationTypes.TRADING_PROFESSIONAL_TRADER_DASHBOARD_COMPLETE,
  TRADING_PROFESSIONAL_TRADER_CALLS_START: PhaseNotificationTypes.TRADING_PROFESSIONAL_TRADER_CALLS_START,
  TRADING_PROFESSIONAL_TRADER_CALLS_COMPLETE: PhaseNotificationTypes.TRADING_PROFESSIONAL_TRADER_CALLS_COMPLETE,
  TRADING_PROFESSIONAL_TRADER_CONTENT_MANAGEMENT_START: PhaseNotificationTypes.TRADING_PROFESSIONAL_TRADER_CONTENT_MANAGEMENT_START,
  TRADING_PROFESSIONAL_TRADER_CONTENT_MANAGEMENT_COMPLETE: PhaseNotificationTypes.TRADING_PROFESSIONAL_TRADER_CONTENT_MANAGEMENT_COMPLETE,
  TRADING_BASIC_INFO_START: PhaseNotificationTypes.TRADING_BASIC_INFO_START,
  TRADING_BASIC_INFO_COMPLETE: PhaseNotificationTypes.TRADING_BASIC_INFO_COMPLETE,
  TRADING_ASSETS_START: PhaseNotificationTypes.TRADING_ASSETS_START,
  TRADING_ASSETS_COMPLETE: PhaseNotificationTypes.TRADING_ASSETS_COMPLETE,
  TRADING_PREFERENCES_START: PhaseNotificationTypes.TRADING_PREFERENCES_START,
  TRADING_PREFERENCES_COMPLETE: PhaseNotificationTypes.TRADING_PREFERENCES_COMPLETE,
  TRADING_REVIEW_START: PhaseNotificationTypes.TRADING_REVIEW_START,
  TRADING_REVIEW_COMPLETE: PhaseNotificationTypes.TRADING_REVIEW_COMPLETE,
  TRADING_SUMMARY_START: PhaseNotificationTypes.TRADING_SUMMARY_START,
  TRADING_SUMMARY_COMPLETE: PhaseNotificationTypes.TRADING_SUMMARY_COMPLETE,
  TRADING_CONFIRMATION_START: PhaseNotificationTypes.TRADING_CONFIRMATION_START,
  TRADING_CONFIRMATION_COMPLETE: PhaseNotificationTypes.TRADING_CONFIRMATION_COMPLETE,


  // Project Phases 
  PROJECT_PHASE_1_START: PhaseNotificationTypes.PROJECT_PHASE_1_START,
  PROJECT_PHASE_1_COMPLETE: PhaseNotificationTypes.PROJECT_PHASE_1_COMPLETE,
  PROJECT_PHASE_2_START: PhaseNotificationTypes.PROJECT_PHASE_2_START,
  PROJECT_PHASE_2_COMPLETE: PhaseNotificationTypes.PROJECT_PHASE_2_COMPLETE,
  PROJECT_PHASE_3_START: PhaseNotificationTypes.PROJECT_PHASE_3_START,
  PROJECT_PHASE_3_COMPLETE: PhaseNotificationTypes.PROJECT_PHASE_3_COMPLETE,
  
  // Onboarding types
  PROFILE_SETUP: OnboardingNotificationTypes.PROFILE_SETUP,



  TASK_MANAGEMENT_LAUNCH_START: PhaseNotificationTypes.TASK_MANAGEMENT_LAUNCH_START,
  TASK_MANAGEMENT_LAUNCH_COMPLETE: PhaseNotificationTypes.TASK_MANAGEMENT_LAUNCH_COMPLETE,
  TASK_MANAGEMENT_DATA_ANALYSIS_START: PhaseNotificationTypes.TASK_MANAGEMENT_DATA_ANALYSIS_START,
  TASK_MANAGEMENT_DATA_ANALYSIS_COMPLETE: PhaseNotificationTypes.TASK_MANAGEMENT_DATA_ANALYSIS_COMPLETE,
  TASK_MANAGEMENT_PLANNING_START: PhaseNotificationTypes.TASK_MANAGEMENT_PLANNING_START,
  TASK_MANAGEMENT_PLANNING_COMPLETE: PhaseNotificationTypes.TASK_MANAGEMENT_PLANNING_COMPLETE,
  TASK_MANAGEMENT_EXECUTION_START: PhaseNotificationTypes.TASK_MANAGEMENT_EXECUTION_START,
  TASK_MANAGEMENT_EXECUTION_COMPLETE: PhaseNotificationTypes.TASK_MANAGEMENT_EXECUTION_COMPLETE,
  TASK_MANAGEMENT_TESTING_START: PhaseNotificationTypes.TASK_MANAGEMENT_TESTING_START,
  TASK_MANAGEMENT_TESTING_COMPLETE: PhaseNotificationTypes.TASK_MANAGEMENT_TESTING_COMPLETE,
  TASK_MANAGEMENT_COMPLETION_START: PhaseNotificationTypes.TASK_MANAGEMENT_COMPLETION_START,
  TASK_MANAGEMENT_COMPLETION_COMPLETE: PhaseNotificationTypes.TASK_MANAGEMENT_COMPLETION_COMPLETE,

  // Team Building Phases 
  TEAM_BUILDING_REQUIREMENTS_GATHERING_START: PhaseNotificationTypes.TEAM_BUILDING_REQUIREMENTS_GATHERING_START,
  TEAM_BUILDING_REQUIREMENTS_GATHERING_COMPLETE: PhaseNotificationTypes.TEAM_BUILDING_REQUIREMENTS_GATHERING_COMPLETE,
  TEAM_BUILDING_CONCEPT_VALIDATION_START: PhaseNotificationTypes.TEAM_BUILDING_CONCEPT_VALIDATION_START,
  TEAM_BUILDING_CONCEPT_VALIDATION_COMPLETE: PhaseNotificationTypes.TEAM_BUILDING_CONCEPT_VALIDATION_COMPLETE,

  // Team types
  TEAM_JOIN_REQUEST: TeamNotificationTypes.TEAM_JOIN_REQUEST,
  TEAM_JOIN_APPROVED: TeamNotificationTypes.TEAM_JOIN_APPROVED,
  TEAM_LOADING: TeamNotificationTypes.TEAM_LOADING,
  TEAM_ID: TeamNotificationTypes.TEAM_ID,
  ADD_PARTICIPANT: TeamNotificationTypes.ADD_PARTICIPANT,

// Post Launch Activities Phases 
POST_LAUNCH_REFACTORING_REBRANDING_START: PhaseNotificationTypes.POST_LAUNCH_REFACTORING_REBRANDING_START,
POST_LAUNCH_REFACTORING_REBRANDING_COMPLETE: PhaseNotificationTypes.POST_LAUNCH_REFACTORING_REBRANDING_COMPLETE,
POST_LAUNCH_COLLABORATION_SETTINGS_START: PhaseNotificationTypes.POST_LAUNCH_COLLABORATION_SETTINGS_START,
POST_LAUNCH_COLLABORATION_SETTINGS_COMPLETE: PhaseNotificationTypes.POST_LAUNCH_COLLABORATION_SETTINGS_COMPLETE,

// Idea Lifecycle Phases 
IDEA_LIFECYCLE_CONCEPT_DEVELOPMENT_START: PhaseNotificationTypes.IDEA_LIFECYCLE_CONCEPT_DEVELOPMENT_START,
IDEA_LIFECYCLE_CONCEPT_DEVELOPMENT_COMPLETE: PhaseNotificationTypes.IDEA_LIFECYCLE_CONCEPT_DEVELOPMENT_COMPLETE,
IDEA_LIFECYCLE_IDEA_VALIDATION_START: PhaseNotificationTypes.IDEA_LIFECYCLE_IDEA_VALIDATION_START,
IDEA_LIFECYCLE_IDEA_VALIDATION_COMPLETE: PhaseNotificationTypes.IDEA_LIFECYCLE_IDEA_VALIDATION_COMPLETE,
IDEA_LIFECYCLE_PROOF_OF_CONCEPT_START: PhaseNotificationTypes.IDEA_LIFECYCLE_PROOF_OF_CONCEPT_START,
IDEA_LIFECYCLE_PROOF_OF_CONCEPT_COMPLETE: PhaseNotificationTypes.IDEA_LIFECYCLE_PROOF_OF_CONCEPT_COMPLETE,

} as const;

type NotificationContextType = Pick<NotificationContextProps, "notify">;

const NotificationContext = createContext<NotificationStore | null>(null);

const useNotification = () => {
  const store = useNotificationStore();
  return {
    notify: store.notify,
    addNotification: store.addNotification,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
    showNotification: store.showNotification,
    showSuccessNotification: store.showSuccessNotification,
    showErrorNotification: store.showErrorNotification,
    showInfoNotification: store.showInfoNotification
    
  };
};


export const useNotificationStore = (): NotificationStore => {
  const context = useContext(NotificationContext);
  if (context === null) {
    throw new Error('useNotificationStore must be used within a NotificationProvider');
  }
  return context;
};
 
export { NotificationTypeEnum, useNotification };
export type { NotificationContextProps, NotificationContextType, NotificationOptions, NotificationType };
