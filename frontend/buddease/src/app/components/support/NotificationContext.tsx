// NotificationContext.tsx
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { createContext, useContext } from "react";
import { DocumentTypeEnum } from "../documents/DocumentGenerator";
import { PriorityTypeEnum } from "../models/data/StatusType";
import { NotificationData } from "./NofiticationsSlice";
import NOTIFICATION_MESSAGES from "./NotificationMessages";
 


type CustomNotificationType = "RandomDismiss";

export enum NotificationTypeEnum {
  AccountCreated = "AccountCreated",
  AnalyticsID = "AnalyticsID",
  Announcement = "Announcement",
  AssignmentOperation = "AssignmentOperation",
  BrainstormingSessionID = "BrainstormingSessionID",
  ButtonClick = "ButtonClick",
  CalendarEvent = "CalendarEvent",
  CustomID = "CustomID",
  CalendarID = "CalendarID",
  ChatID = "ChatID",
  CalendarNotification = "CalendarNotification",
  ChatMention = "ChatMention",
  CommentID = "CommentID",
  ContentID = "ContentID",
  ContributionID = "ContributionID",
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
  
  EventID = "EventID",
  EventOccurred = "EventOccurred",
  EventReminder = "EventReminder",
  FileID = "FileID",
  GeneratedID = "GeneratedID",
  INFO = "INFO",
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
  OperationStart = "OperationStart",
  OperationError = "OperationError",
  OperationSuccess = "OperationSuccess",
  PageLoading = "PageLoading",
  PasswordChanged = "PasswordChanged",
  PaymentReceived = "PaymentReceived",
  ProfileUpdated = "ProfileUpdated",
  ProductID = "ProductID",
  PushNotification = "PushNotification",
  SnapshotDetails = "SnapshotDetails",
  Success = "Success",
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
  __FILE_PATH__ = 'filePath',
  

}

export interface NotificationContextProps {
  sendNotification: (
    type: NotificationType,
    userName?: string | number,
    sendComment?: string
  ) => void;
  addNotification: (notification: NotificationData) => void;
  notify: (
    id: string,
    message: string,
    content: any,
    date: Date,
    type: NotificationType
  ) => Promise<void>;

  notifications: NotificationData[];

  showMessage: (message: Message, type: NotificationType) => void;

  showMessageWithType: (message: string) => void;
  showSuccessNotification: (
    id: string,
    message: string,
    content: any,
    date?: Date | undefined,
    type?: NotificationType
  ) => void | Promise<void>;

  showErrorNotification: (
    id: string,
    message: string,
    content: any,
    date?: Date | undefined,
    type?: NotificationType
  ) => void | Promise<void>;
  actions?: {
    showSuccessNotification: (
      id: string,
      message: string,
      content: any,
      date?: Date | undefined,
      type?: NotificationType
    ) => void | Promise<void>;
    showErrorNotification: (
      id: string,
      message: string,
      content: any,
      date?: Date | undefined,
      type?: NotificationType
    ) => void | Promise<void>;
    dismiss?: (id: string) => void;
    dismissAll?: () => void;
  };
}







const DefaultNotificationContext: NotificationContextProps = {
  sendNotification: () => {},
  addNotification: () => {},
  notify: async () => {}, // Correct TypeScript type mismatches
  notifications: [], // Initialize notifications as an empty array
  showMessageWithType: () => { }, // Placeholder function
  showSuccessNotification: async () => { },
  showErrorNotification: async () => { },
  showMessage: (message: Message, type: NotificationType) => { },
};


// Modify NotificationContextProps interface
export interface NotificationContextProps {
  sendNotification: (
    type: NotificationType,
    userName?: string | number,
    sendComment?: string
  ) => void;
  addNotification: (notification: NotificationData) => void;
  notify: (
    id: string,
    message: string,
    content: any,
    // randomBytes?: BytesLike,
    date: Date,
    type: NotificationType
  ) => Promise<void>;
  notifications: NotificationData[];
  // Add more notification functions as needed
}

export const NotificationContext = createContext<NotificationContextProps>(
  DefaultNotificationContext
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const notificationStore = useContext(NotificationContext);

  const addNotification = (notification: NotificationData) => {
    notificationStore?.addNotification(notification);
  };

  const notify = (type: NotificationType, userName?: string | number, sendComment?: string) => {
    sendNotification(type, userName, sendComment);
  };

  const sendNotification = (
    type: NotificationType,
    userName?: string | number,
    sendComment?: string
  ) => {
    const message = generateNotificationMessage(type, userName);

    if (notificationStore) {
      const notification = {
        id: Date.now().toString(),
        content: message,
        date: new Date(),
      };
      notificationStore?.addNotification(
        notification as unknown as NotificationData
      );
      console.log(`Notification: ${message}`);
    } else {
      console.error("NotificationStore is undefined");
    }
  };

  const generateNotificationMessage = (
    type: NotificationType,
    userName?: string | number
  ): string => {
    // Access the centralized NOTIFICATION_MESSAGES
    const messages = (
      NOTIFICATION_MESSAGES as unknown as Record<string, Record<string, string>>
    )[type];

    if (messages) {
      const { DEFAULT } = messages as unknown as {
        DEFAULT: (userName: string) => string;
      };

      // Check if there's a custom message function
      if (typeof DEFAULT === "function") {
        return DEFAULT(userName as string);
      }

      // Return the default message
      return DEFAULT;
    } else {
      return "Unknown Notification Type";
    }
  };

  return (
    <NotificationContext.Provider
      value={notificationStore || DefaultNotificationContext}
    >
      {children}
    </NotificationContext.Provider>
  );
};


export const useNotification = (): NotificationContextProps => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  // Complete context with same properties and methods
  return {
    sendNotification: context.sendNotification,
    addNotification: context.addNotification,
    notify: context.notify,
    notifications: context.notifications || [],
    showMessageWithType: context.showMessageWithType,
    showSuccessNotification: context.showSuccessNotification,
    showErrorNotification: context.showErrorNotification,
    showMessage: context.showMessage,
    actions: {
      showSuccessNotification: context.showSuccessNotification,
      showErrorNotification: context.showErrorNotification,
      // Add other notification actions as needed
    },
  };
};
export type NotificationType =
  NotificationTypeEnum
  | DocumentTypeEnum
  | PriorityTypeEnum
  | CustomNotificationType;
export default DefaultNotificationContext