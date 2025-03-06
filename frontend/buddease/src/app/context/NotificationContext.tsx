// NotificationContext.ts
import * as React from 'react';
import { createContext, ReactNode, useContext } from 'react';
import NotificationStore from '../components/state/stores/NotificationStore';

interface NotificationProviderProps {
  children: ReactNode;
}
 
type CustomNotificationType = "RandomDismiss";

export enum NotificationTypeEnum {
  AccountCreated = "AccountCreated",
  AnalyticsID = "AnalyticsID",
  Announcement = "Announcement",
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
  FileID = "FileID",
  GeneratedID = "GeneratedID",
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
  OperationStart = "OperationStart",
  OperationError = "OperationError",
  OperationSuccess = "OperationSuccess",
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
  SystemUpdateInProgress = "SystemUpdateInProgress",
  TaskLogged = "TaskLogged",
  TaskBoardID = "TaskBoardID",
  TeamJoinApproved = "TeamJoinApproved",
  TeamJoinRequest = "TeamJoinRequest",
  TeamID = "TeamID",
  TeamLoading = "TeamLoading",
  Test = "Test",
  Unsubscribed = "Unsubscribed",
  UserID = "UserID",
  Warning = "Warning",
  Welcome = "Welcome",
  Configuration = "Configuration",
  // Example of injecting build-time configuration
  __FILE_PATH__ = "filePath",
}

type NotificationContextType = Pick<NotificationContextProps, "notify">;

const NotificationContext = createContext<NotificationStore | undefined>(undefined);

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const notificationStore = new NotificationStore();
  return (
    <NotificationContext.Provider value={notificationStore}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationStore = (): NotificationStore => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationStore must be used within a NotificationProvider');
  }
  return context;
};
 
export { NotificationTypeEnum }