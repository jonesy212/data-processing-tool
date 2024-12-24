import { NotificationTypeEnum } from "@/app/components/support/NotificationContext";
import { DataDetails } from "../components/models/data/Data";
import { NotificationData } from "../components/support/NofiticationsSlice";
import {
  NotificationType,
  useNotification,
} from "../components/support/NotificationContext";
import { K, Meta, T } from "../components/models/data/dataStoreMethods";

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
  static generateSnapshoItemID(arg0: string): string {
    return `${arg0}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }
  
  static notifyFormatted(
    id: string,
    message: string,
    content: any,
    timestamp: Date,
    type: NotificationType
  ) {
    notify(id, message, content, timestamp, type);
  }

  static generateSnapshotID(): string {
    return UniqueIDGenerator.generateID(
      "SNP",
      "snapshot_id",
      NotificationTypeEnum.GeneratedID
    );
  }

  static generateTrackerID(
    name: string,
    type: NotificationTypeEnum,
    id?: string,
  ): string {
    return UniqueIDGenerator.generateID(
      "TRK",
      name,
      type,
      id,
      NotificationTypeEnum.GeneratedID
    );
  }

  // New static method for generating snapshot data key
  static generateSnapshotDataKey(documentId: string, userId: string): string {
    // Generate a unique key for snapshot data using documentId and userId
    return `documents.${userId}.${documentId}`;
  }

  // New static method for generating a snapshot ID with a category
  static generateSnapshotIDWithCategory(category: string): string {
    const timestamp = Date.now(); // Get the current timestamp
    const uniqueID = UniqueIDGenerator.generateID(
      "SNP", 
      category, 
      NotificationTypeEnum.GeneratedID
    );

    // Combine the category and unique ID with a timestamp for uniqueness
    return `${category}_${uniqueID}_${timestamp}`;
  }

  static generateNotificationID(
    notification: NotificationData,
    date: Date,
    notificationType: NotificationType,
    completionMessageLog: NotificationData,
    callback?: () => void
  ): string {
    const notificationID = `${notificationType}_${notification.message
      }_${date.getTime()}`;
    const message = `Generated notification ID: ${notificationID}`;
    const content = {
      notificationID: notificationID,
      notificationMessage: notification.message,
      date: date,
      type: notificationType,
      completionMessageLog: completionMessageLog,
    };
    notify(notificationID, message, content, new Date(), notificationType);
    return notificationID;
  }

  static generateUserID(name: string): string {
    return `user_${name}`;
  }

  static generateTeamID(name: string): string {
    return `team_${name}`;
  }



  static generateTaskID(
    name: string,
    title: string,
    type: NotificationTypeEnum): string {
    return `task_${name}_${type}`;
  }

  static generateCustomID(name: string, type: NotificationTypeEnum): string {
    return `custom_${name}_${type}`;
  }

  static generateCalendarID(name: string): string {
    return `calendar_${name}`;
  }

  static generateProjectID(name: string): string {
    return `project_${name}`;
  }

  static generateElementID(name: string): string {
    return `element_${name}`;
  }

  static generatePhaseID(name: string): string {
    return `phase_${name}`;
  }

  static generateDocumentEditID(name: string): string {
    return `document_${name}`;
  }

  static generateDocumentID(
    name: string,
    type: NotificationTypeEnum,
  ): string {
    return `document_${name}_${type}`;
  }

  static generateTaskBoardID(): string {
    return `taskboard_${Date.now()}`;
  }

  static generateBrainstormingSessionID(): string {
    return `brainstorm_${Date.now()}`;
  }

  static generateCommentID(id: string, title: string): string {
    return `comment_${id}_${title}`;
  }

  static generateContentID(id: string, title: string): string {
    return `content_${id}_${title}`;
  }

  static generateMeetingID(name: string): string {
    return `meeting_${name}`;
  }

  static generateProductID(): string {
    return `product_${Date.now()}`;
  }

  static generateEventID(): string {
    return `event_${Date.now()}`;
  }

  static generateMessageID(): string {
    return `message_${Date.now()}`;
  }

  static generateFileID(): string {
    return `file_${Date.now()}`;
  }

  static generateLocationID(): string {
    return `location_${Date.now()}`;
  }


  static generatePresentationID(
    prefix: string,
    name: string,
    type: NotificationTypeEnum,
    id?: string,
    title?: string,
    notificationType?: NotificationType,
    dataDetails?: DataDetails<any, any>
  ): string {
    const generatedID = `${prefix || 'presentation'}_${name}_${type}_${Date.now()}`;

    // Optionally append additional data if provided
    if (id) {
      return `${generatedID}_${id}`;
    }
    if (title) {
      return `${generatedID}_${title}`;
    }
    // You can also use dataDetails if needed for the ID generation
    return generatedID;
  }

  static generateCouponCode(): string {
    return `coupon_${Date.now()}`;
  }

  static generateVideoID(name: string, type: NotificationTypeEnum): string {
    return `video_${name}_${type}`;
  }

  static generateSurveyID(): string {
    return `survey_${Date.now()}`;
  }

  static generateAnalyticsID(): string {
    return `analytics_${Date.now()}`;
  }

  static generateAppStructureID(): string {
    return `app_${Date.now()}`;
  }

  static generateChatMessageID(chatThreadId: string): string {
    return `chatMessage_${chatThreadId}`;
  }

  static generateChatThreadID(chatThreadName: string): string {
    return `chatThread_${chatThreadName}`;
  }

  // Static method to generate a unique payment ID
  static generatePaymentId(): string {
    const prefix = 'payment';
    const timestamp = Date.now(); // Get current timestamp in milliseconds
    const randomComponent = Math.floor(Math.random() * 1000000); // Generate a random number between 0 and 999999

    // Construct the payment ID by combining the prefix, timestamp, and random component
    return `${prefix}_${timestamp}_${randomComponent}`;
  }


  static generateParentID(name: string): string {
    return `parent_${name}`;
  }

  static generateChildID(name: string, index: number): string {
    return `child_${name}_${index}`;
  }

  static generateAddChildID(parentID: string, childName: string): string {
    return `add_child_${parentID}_${childName}`;
  }

  static generateRemoveChildID(parentID: string, childName: string): string {
    return `remove_child_${parentID}_${childName}`;
  }

  static generateGetChildrenID(parentID: string): string {
    return `get_children_${parentID}`;
  }

  static generateHasChildrenID(parentID: string): string {
    return `has_children_${parentID}`;
  }


  static generateSnapshotByID(snapshotID: string): string {
    return `snapshot_${snapshotID}`;
  }

  // Method for handling snapshot logic
  static handleSnapshot(snapshotID: string): string {
    // Example logic for handling snapshot
    return `handled_snapshot_${snapshotID}`;
  }

  // Method for mapping snapshots
  static mapSnapshots(snapshotList: string[]): string[] {
    return snapshotList.map((snapshotID) => `mapped_${snapshotID}`);
  }

  // Method for clearing snapshot failures
  static clearSnapshotFailure(snapshotID: string): string {
    // Example logic for clearing snapshot failure
    return `cleared_failure_${snapshotID}`;
  }

  static generateAppVersion(): string {
    const major = Math.floor(Math.random() * 10);
    const minor = Math.floor(Math.random() * 10);
    const patch = Math.floor(Math.random() * 10);
    return `${major}.${minor}.${patch}`;
  }

  static generateID(
    prefix: string,
    name: string,
    type: NotificationTypeEnum,
    id?: string,
    title?: string,
    chatThreadName?: string,
    chatMessageId?: string,
    chatThreadId?: string,
    dataDetails?: DataDetails<T, K<T>>,
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
      case NotificationTypeEnum.SnapshotID:
        return UniqueIDGenerator.generateSnapshotID();
      case NotificationTypeEnum.AppVersion:
        return UniqueIDGenerator.generateAppVersion();
      case NotificationTypeEnum.PresentationID:
        return UniqueIDGenerator.generatePresentationID(
          prefix,
          name,
          type,
          id,
          title,
          type,
          dataDetails,
        );

      case NotificationTypeEnum.ChatMessageID:
        return UniqueIDGenerator.generateChatMessageID(
          String(chatThreadId)
        );
      case NotificationTypeEnum.ChatThreadID:
        return UniqueIDGenerator.generateChatThreadID(String(chatThreadName));
      default:
        return `${prefix}_${name}_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 10)}`;
    }
  }

  static generateVersionNumber(): string {
    // Use timestamp and possibly randomization for a unique version number
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000); // Optional random suffix
    return `ver_${timestamp}_${randomSuffix}`;
  }
  
  static generateIDForCache(categoryName?: string, userName?: string): string {
    // Use category name if provided; otherwise, fallback to userName
    const baseID = categoryName ? `category_${categoryName}` : userName ? `user_${userName}` : `default_id`;
    return `${baseID}_${Date.now()}`;
  }
}


const videoDataDetails: DataDetails<T, K<T>> = {
  _id: "",
  id: "video1",
  title: "Video Title",
  description: "Video Description",
  status: "pending",
  isActive: false,
  tags: {},
  type: NotificationTypeEnum.GeneratedID,
  createdAt: new Date(),
  uploadedAt: new Date(),
  analysisResults: [],
  updatedAt: undefined,
  createdBy: "",
};export default UniqueIDGenerator;

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
