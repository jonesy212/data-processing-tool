import { NotificationTypeEnum } from "@/app/components/support/NotificationContext";
import { DataDetails } from "../components/models/data/Data";
import { NotificationData } from "../components/support/NofiticationsSlice";
import {
  NotificationType,
  useNotification,
} from "../components/support/NotificationContext";

// Extract notify function from useNotification hook
const { notify } = useNotification();

const USER_ID_PREFIX = "user_id";
export function generateUserID(userName: string) {
  const generatedID = UniqueIDGenerator.generateID(
    USER_ID_PREFIX,
    userName,
    NotificationTypeEnum.GeneratedID
  );
  return {
    [Symbol.iterator]: function* () {
      yield generatedID;
    },
  };
}

class UniqueIDGenerator {
  static notifyFormatted(
    id: string,
    message: string,
    content: any,
    timestamp: Date,
    type: NotificationType
  ) {
    notify(id, message, content, timestamp, type);
  }

  static generateNotificationID(
    notification: NotificationData,
    date: Date,
    notificationType: NotificationType,
    completionMessageLog: NotificationData,
    callback?: () => void
  ): string {
    const notificationID = `${notificationType}_${
      notification.message
    }_${date.getTime()}`;
    const message = `Generated notification ID: ${notificationID}`;
    const content = {
      notificationID: notificationID,
      notificationMessage: notification.message,
      date: date,
      type: notificationType,
      completionMessageLog: completionMessageLog,
      // Add more properties as needed
    };
    notify(notificationID, message, content, new Date(), notificationType);
    return notificationID;
  }

  static generateCalendarID(calendarName: string): string {
    const calendarId = UniqueIDGenerator.generateRoomID();
    const message = `Generated calendar ID: ${calendarId} for calendar ${calendarName}`;
    UniqueIDGenerator.notifyFormatted(
      calendarId,
      message,
      {},
      new Date(),
      NotificationTypeEnum.GeneratedID
    );
    return calendarId;
  }

  static generateChatID(): string {
    return UniqueIDGenerator.generateRoomID();
  }

  static generateRoomID(): string {
    const roomIdLength = 8;
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let roomId = "";
    for (let i = 0; i < roomIdLength; i++) {
      roomId += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return roomId;
  }

  static generateTaskID(taskId: string | undefined, taskName: string): string {
    if (!taskId) {
      taskId = UniqueIDGenerator.generateRoomID();
      const message = `Generated task ID for task ${taskId}: ${taskName}`;
      notify(taskId, message, {}, new Date(), NotificationTypeEnum.GeneratedID);
    }
    return taskId;
  }

  static generateTodoID(
    todoId: string,
    todoName: string,
    type: NotificationType
  ): string {
    const message = `Generated todo ID for todo ${todoId}: ${todoName}`;
    const content = {
      todoId: todoId,
      todoName: todoName,
      type: type,
    };

    UniqueIDGenerator.notifyFormatted(
      todoId || "",
      message,
      content,
      new Date(),
      NotificationTypeEnum.GeneratedID
    );
    const todoDetails: DataDetails = {
      id: todoId,
      title: todoName,
      description: type,
      startDate: new Date(),
      endDate: new Date(),
      status: "pending",
      isActive: true,
      tags: [],
      type: "",
      _id: "",
      analysisResults: [],
    };
    const todoDetailsString = JSON.stringify(todoDetails);
    return this.generateID(
      todoDetailsString,
      todoId || "",
      "todoName" as NotificationType
    );
  }

  static generateDocumentID(
    documentName: string,
    type: NotificationType
  ): string {
    const generatedID = `${documentName}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated document ID for ${documentName}: ${generatedID}`;
    const content = {
      documentName: documentName,
      generatedID: generatedID,
      timestamp: Date.now(),
      type: type,
    };
    this.notifyFormatted(
      generatedID,
      message,
      content,
      new Date(),
      NotificationTypeEnum.GeneratedID
    );
    return generatedID;
  }


  static generateVideoID(videoName: string, type: NotificationType): string { 
    const videoId = `${videoName}_${Date.now()}` 
    const message = `Generated video ID for ${videoName}: ${videoId}`
    let content = {
      videoName: videoName,
      generatedID: videoId,
      timestamp: Date.now(),
      type: type
    }
    this.notifyFormatted(
      videoId,
      message,
      content,
      new Date(),
      NotificationTypeEnum.GeneratedID
    );
    return videoId
  }
  static generateVersionNumber(): string {
    const versionNumberLength = 3;
    const characters = "0123456789";
    let versionNumber = "";
    for (let i = 0; i < versionNumberLength; i++) {
      versionNumber += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return versionNumber;
  }

  static generateAppVersion(): string {
    const appVersionLength = 5;
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let appVersion = "";
    for (let i = 0; i < appVersionLength; i++) {
      appVersion += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return appVersion;
  }

  static generateID(
    prefix: string,
    name: string,
    type: NotificationType,
    id?: string,
    title?: string,
    chatThreadName?: string,
    chatMessageId?: string,
    chatThreadId?: string,
    dataDetails?: DataDetails,
    generatorType?: string
  ): string {
    switch (type) {
      case NotificationTypeEnum.UserID:
        return UniqueIDGenerator.generateUserID(name);
      case NotificationTypeEnum.TeamID:
        return UniqueIDGenerator.generateTeamID(name);
      case NotificationTypeEnum.CustomID:
        return UniqueIDGenerator.generateCustomID(name, type);
      case NotificationTypeEnum.CalendarID:
        return UniqueIDGenerator.generateCalendarID(name);
      case NotificationTypeEnum.ProjectRevenueID:
        return UniqueIDGenerator.generateProjectID(name);
      case NotificationTypeEnum.AccountCreated:
        return UniqueIDGenerator.generateUserID(name);
      case NotificationTypeEnum.TeamJoinRequest:
        return UniqueIDGenerator.generateTeamID(name);
      case NotificationTypeEnum.GeneratedID:
        return UniqueIDGenerator.generateElementID(name);
      case NotificationTypeEnum.PhaseID:
        return UniqueIDGenerator.generatePhaseID(name);
      case NotificationTypeEnum.DocumentEditID:
        return UniqueIDGenerator.generateDocumentEditID(name);
      case NotificationTypeEnum.TaskBoardID:
        return UniqueIDGenerator.generateTaskBoardID();
      case NotificationTypeEnum.BrainstormingSessionID:
        return UniqueIDGenerator.generateBrainstormingSessionID();
      case NotificationTypeEnum.CommentID:
        return UniqueIDGenerator.generateCommentID(id || "", title || "");
      case NotificationTypeEnum.ContentID:
        return UniqueIDGenerator.generateContentID(id || "", title || "");
      case NotificationTypeEnum.MeetingID:
        return UniqueIDGenerator.generateMeetingID(name);
      case NotificationTypeEnum.ProductID:
        return UniqueIDGenerator.generateProductID();
      case NotificationTypeEnum.EventID:
        return UniqueIDGenerator.generateEventID();
      case NotificationTypeEnum.MessageID:
        return UniqueIDGenerator.generateMessageID();
      case NotificationTypeEnum.FileID:
        return UniqueIDGenerator.generateFileID();
      case NotificationTypeEnum.LocationID:
        return UniqueIDGenerator.generateLocationID();
      case NotificationTypeEnum.CouponCode:
        return UniqueIDGenerator.generateCouponCode();
      case NotificationTypeEnum.VideoID:
        return UniqueIDGenerator.generateVideoID(name, type);
      case NotificationTypeEnum.SurveyID:
        return UniqueIDGenerator.generateSurveyID();
      case NotificationTypeEnum.AnalyticsID:
        return UniqueIDGenerator.generateAnalyticsID();
      case NotificationTypeEnum.AppStructureID:
        return UniqueIDGenerator.generateAppStructureID();
      case NotificationTypeEnum.ChatMessageID:
        return UniqueIDGenerator.generateChatMessageID(
          String(chatThreadId)
        );
      case NotificationTypeEnum.ChatThreadID:
        return UniqueIDGenerator.generateChatThreadID(String(chatThreadName));
      default:
        // Use default generator logic
        const generatedID = `${prefix}_${name}_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 10)}`;
        return generatedID;
    }
  }

  static generateCustomID(name: string, type: NotificationType): string {
    return this.generateID(name, type, "custom" as NotificationType);
  }

  static generateCaelndarID(calendardId: string): string {
    return this.generateID(
      calendardId,
      NotificationTypeEnum.CalendarID,
      "cal" as NotificationType
    );
  }


  static generateChatMessageID(

    chatThreadId: string
  ): string {
    return this.generateID(
      "chatMessageId",
      NotificationTypeEnum.MessageID,
      chatThreadId as NotificationType
    );
  }

  static generateChatThreadID(chatThreadName: string): string {
    return this.generateID(
      chatThreadName,
      NotificationTypeEnum.MessageID,
      "chat_thread" as NotificationType
    );
  }

  static generateCommentID(id: string, title: string) {
    // Generate a unique ID using the provided parameters
    return UniqueIDGenerator.generateID(
      "comment",
      `${id}_${title}`, // Concatenate the id and title to ensure uniqueness
      "comment" as NotificationType
    );
  }
  static generateContentID(id: string, title: string) {
    return UniqueIDGenerator.generateID(
      id,
      NotificationTypeEnum.ContentID,
      title as NotificationType // Assuming title is of type NotificationType
    );
  }

  static generateDocumentEditID(documentName: string): string {
    return this.generateID(
      documentName,
      NotificationTypeEnum.DocumentEditID,
      "document_edit" as NotificationType
    );
  }

  static generateBrainstormingSessionID(): string {
    return this.generateID(
      "brainstorming_session",
      NotificationTypeEnum.BrainstormingSessionID,
      "brainstorming_session" as NotificationType
    );
  }

  static generateElementID(elementName: string): string {
    return this.generateID(
      elementName,
      NotificationTypeEnum.GeneratedID,
      "element" as NotificationType
    );
  }

  static generatePresentationID(presentationName: string): string {
    return this.generateID(
      presentationName,
      NotificationTypeEnum.PresentationID,
      "presentation" as NotificationType
    );
  }

  static generateProjectID(projectName: string): string {
    return this.generateID(
      projectName,
      NotificationTypeEnum.ProjectRevenueID,
      "proj" as NotificationType
    );
  }

  static generateTeamID(teamName: string): string {
    return this.generateID(
      teamName,
      NotificationTypeEnum.TeamJoinRequest,
      "team" as NotificationType
    );
  }

  static generateUserID(userName: string): string {
    return this.generateID(
      userName,
      NotificationTypeEnum.UserID,
      "user" as NotificationType
    );
  }

  // Add more specific ID generation methods as needed

  static generatePhaseID(phaseName: string): string {
    return this.generateID(
      phaseName,
      NotificationTypeEnum.PhaseID,
      "phase" as NotificationType
    );
  }
  static animationID(
    prefix: string,
    name: string,
    type: NotificationType
  ): string {
    const generatedID = `${prefix}_${name}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    return generatedID;
  }

  static generateDashboardID(): string {
    return UniqueIDGenerator.generateID(
      "dashboard",
      NotificationTypeEnum.GeneratedID,
      "dashboard" as NotificationType
    );
  }

  static generateAppStructureID(): string {
    return this.generateID(
      "app_structure",
      NotificationTypeEnum.AppStructureID,
      "app_structure" as NotificationType
    );
  }

  static generateSnapshotID(): string {
    // Generate a unique ID without requiring any arguments
    return this.generateID(
      "Snapshot", // Assuming "Snapshot" is a prefix for the generated ID
      NotificationTypeEnum.GeneratedID,
      "snapshot" as NotificationType
    );
  }

  static generateSnapshoItemID(id: string): string {
    return this.generateID(
      id,
      "SnapshotItem",
      NotificationTypeEnum.GeneratedID,
      "snapshot_item" as NotificationType
    );
  }

  static generateSessionID(): string {
    return this.generateID(
      "SessionID",
      "Session",
      NotificationTypeEnum.GeneratedID
    );
  }

  static generateOrderID(): string {
    return this.generateID(
      "OrderID",
      "Order",
      NotificationTypeEnum.GeneratedID
    );
  }

  static generateMeetingID(meetingName: string): string {
    return this.generateID(
      meetingName,
      NotificationTypeEnum.MeetingID,
      "meeting" as NotificationType
    );
  }

  static generateBlogPostID(blogName: string): string {
    // Generate a unique ID using a suitable strategy (e.g., UUID)
    // Here, we'll use a timestamp-based ID for simplicity
    return this.generateID(
      blogName,
      NotificationTypeEnum.BlogPostID,
      "blog" as NotificationType
    );
  }

  static generateProductID(): string {
    return this.generateID(
      "ProductID",
      "Product",
      NotificationTypeEnum.GeneratedID
    );
  }

  static generateEventID(): string {
    return this.generateID(
      "EventID",
      "Event",
      NotificationTypeEnum.GeneratedID
    );
  }

  static generateMessageID(): string {
    return this.generateID(
      "MessageID",
      "Message",
      NotificationTypeEnum.GeneratedID
    );
  }

  static generateFileID(): string {
    return this.generateID("FileID", "File", NotificationTypeEnum.GeneratedID);
  }

  static generateTaskBoardID(): string {
    return this.generateID(
      "TaskBoardID",
      "TaskBoard",
      NotificationTypeEnum.GeneratedID
    );
  }

  static generateLocationID(): string {
    return this.generateID(
      "LocationID",
      "Location",
      NotificationTypeEnum.GeneratedID
    );
  }

  static generateCouponCode(): string {
    return this.generateID(
      "CouponCode",
      "Coupon",
      NotificationTypeEnum.GeneratedID
    );
  }

  static generateSurveyID(): string {
    return this.generateID(
      "SurveyID",
      "Survey",
      NotificationTypeEnum.GeneratedID
    );
  }

  static generateAnalyticsID(): string {
    return this.generateID(
      "AnalyticsID",
      "Analytics",
      NotificationTypeEnum.GeneratedID
    );
  }

}



const videoDataDetails: DataDetails = {
  _id: "",
  id: "video1",
  title: "Video Title",
  description: "Video Description",
  status: "pending",
  isActive: false,
  tags: [],
  type: NotificationTypeEnum.GeneratedID,
  createdAt: new Date(),
  uploadedAt: new Date(),
  analysisResults: [],
};

export default UniqueIDGenerator;

const videoDetailsString = JSON.stringify(videoDataDetails);

// Generate unique ID using videoDataDetails with the prefix "video"
const uniqueVideoID = UniqueIDGenerator.generateID(
  "video",
  videoDetailsString,
  NotificationTypeEnum.GeneratedID,
  videoDataDetails as unknown as string
);

// Adjusted usage of generateID function
console.log(uniqueVideoID);
