// NotificationContext.ts
import { NotificationPosition, PriorityTypeEnum } from "@/app/components/models/data/StatusType";
import { DocumentTypeEnum } from "@/server/DocumentGenerator";
import { NotificationData } from "@/app/components/support/NofiticationsSlice";
import { createContext, ReactNode, useContext } from 'react';
import NotificationStore from '../components/state/stores/NotificationStore';
import { Message } from "@/app/generators/GenerateChatInterfaces";

interface NotificationProviderProps {
  children: ReactNode;
}


interface NotificationOptions {
  dataId?: string;
  error?: string;
}

interface NotificationContextProps {
  notify: (
    id: string,
    message: string,
    notificationOptions: NotificationOptions,
    date: Date,
    type: NotificationTypeEnum,
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
  | NotificationTypeEnum
  | DocumentTypeEnum
  | PriorityTypeEnum
  | CustomNotificationType;

enum NotificationTypeEnum {
  WELCOME = "Welcome",
  INVALID_CREDENTIALS = "InvalidCredentials",
  TEAM_JOIN_REQUEST = "TeamJoinRequest",
  TEAM_JOIN_APPROVED = "TeamJoinApproved",
  PAYMENT_RECEIVED = "PaymentReceived",
  SYSTEM_UPDATE_IN_PROGRESS = "SystemUpdateInProgress",

  ADD_PARTICIPANT = "ADD_PARTICIPANT",
  AccountCreated = "AccountCreated",
  AppVersion = "AppVersion",
  AnalyticsID = "AnalyticsID",
  Announcement = "Announcement",
  ApiClientError = "ApiClientError",
  AssignmentOperation = "AssignmentOperation",
  AssignmentOperationSuccess = "AssignmentOperationSuccess",
  BlogPostID = "BlogPostID",
  BrainstormingSessionID = "BrainstormingSessionID",
  ButtonClick = "ButtonClick",
  CalendarEvent = "CalendarEvent",
  CustomID = "CustomID",
  CalendarID = "CalendarID",
  ChatID = "ChatID",
  CalendarNotification = "CalendarNotification",
  ChatMention = "ChatMention",
  ChatMessageID = "ChatMessageID",
  ChatThreadID = "ChatThreadID",
  CommentID = "CommentID",
  ContentID = "ContentID",
  ContributionID = "ContributionID",
  VideoID = "VideoID",
  ContentItem = "ContentItem",
  CouponCode = "CouponCode",
  CreationSuccess = "CreationSuccess",
  CustomNotification1 = "CustomNotification1",
  CustomNotification2 = "CustomNotification2",
  DataLimitApproaching = "DataLimitApproaching",
  DataLoading = "DataLoading",
  Dismiss = "Dismiss",
  DocumentEditID = "DocumentEditID",
  Error = "Error",
  ApiError = "ApiError",
  EventID = "EventID",
  EventOccurred = "EventOccurred",
  EventReminder = "EventReminder",
  AppStructureID = "AppStructureID",
  SnapshotID = "SnapshotID",
  FileID = "FileID",
  GeneratedID = "GeneratedID",
  GetStoreSuccess = "GetStoreSuccess",
  LocationID = "LocationID",
  MeetingID = "MeetingId",
  PhaseID = "PhaseID",
  PresentationID = "PresentationID",
  ProjectRevenueID = "ProjectRevenueID",
  IdeationBrainstorming = "Ideation:Brainstorming",
  Info = "Info",
  InvalidCredentials = "InvalidCredentials",
  LoggingError = "LoggingError",
  LoggingInfo = "LoggingInfo",
  LoggingWarning = "LoggingWarning",
  LowDiskSpace = "LowDiskSpace",
  MessageID = "MessageID",
  Milestone = "Milestone",
  NewChatMessage = "NewChatMessage",
  NewFeatureAvailable = "NewFeatureAvailable",
  NewNotification = "NewNotification",
  OperationError = "OperationError",
  OperationStart = "OperationStart",
  OperationSuccess = "OperationSuccess",
  OperationUpdate = "OperationUpdate",
  APISuccess = "APISuccess",
  APIError ="APIError",
  PageLoading = "PageLoading",
  PasswordChanged = "PasswordChanged",
  PaymentReceived = "PaymentReceived",
  ProfileUpdated = "ProfileUpdated",
  ArticleUpdated = "ArticleUpdated",
  ProductID = "ProductID",
  PushNotification = "PushNotification",
  SnapshotDetails = "SnapshotDetails",
  Snapshot = "Snapshot",
  Success = "Success",
  DisplaySuccess ="DisplaySuccess",
  SurveyID = "SurveyID",
  System = "System",
  SystemUpdateInProgress = "SystemUpdateInProgress",
  TaskLogged = "TaskLogged",
  TaskBoardID = "TaskBoardID",
  TeamJoinApproved = "TeamJoinApproved",
  TeamJoinRequest = "TeamJoinRequest",
  TeamID = "TeamID",
  TeamLoading = "TeamLoading",
  Test = "Test",
  Unsubscribed = "Unsubscribed",
  VersionID = "VersionID",
  UserID = "UserID",
  Warning = "Warning",
  Welcome = "Welcome",
  Configuration = "Configuration",
  // Example of injecting build-time configuration
  __FILE_PATH__ = "filePath",
}

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
    showInfoNotification: store.showInfoNotification,
 
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
export type { NotificationContextProps, NotificationContextType, NotificationType };