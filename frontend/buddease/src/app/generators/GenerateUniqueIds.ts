import { K, Meta, T } from '@/app/components/models/data/dataStoreMethods';
import { NotificationTypeEnum } from "@/app/context/NotificationContext";
import { DocumentOptions } from "@/app/documents/DocumentOptions";
import { DataDetails } from '@/app/models/data/Data';
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { data } from '@/app/snapshots/SnapshotWithCriteria';
import { NotificationData } from "@/app/state/redux/slices/NofiticationsSlice";
import { getCurrentAppInfo } from "@/app/versions/VersionGenerator";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { useMeta } from "@/config/useMeta";
import {
    NotificationType,
    useNotification,
} from "@/context/NotificationContext";

const area = fetchUserAreaDimensions().toString()

const currentMeta: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = useMeta<T, K>(area)
const { versionNumber, appVersion } = getCurrentAppInfo();


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


  static generateId(prefix: string = 'snapshot'): string {
    return this.generateID(
      prefix.toUpperCase(),
      "auto_generated",
      NotificationTypeEnum.System
    );
  }
  static generateSnapshoItemID(arg0: string): string {
    return `${arg0}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  static generateEnhancedID(
    prefix: string,
    entityName: string,
    notificationType: NotificationTypeEnum,
    options?: {
      customId?: string;
      timestamp?: Date;
      includeRandom?: boolean;
      metadata?: Record<string, any>;
      // Your existing parameters
      id?: string;
      title?: string;
      chatThreadName?: string;
      chatMessageId?: string;
      chatThreadId?: string;
      dataDetails?: DataDetails<T, K>;
      generatorType?: string;
    }
  ): string {
    const timestamp = options?.timestamp || new Date();

    // Generate the ID using your existing logic
    const generatedId = this.generateID(
      prefix,
      entityName,
      notificationType,
      options?.customId || options?.id,
      options?.title,
      options?.chatThreadName,
      options?.chatMessageId,
      options?.chatThreadId,
      options?.dataDetails,
      options?.generatorType
    );


    // Notify the system about the ID generation
    this.notifyFormatted(
      generatedId,
      `Generated ID: ${generatedId}`,
      {
        prefix,
        entityName,
        notificationType,
        timestamp,
        metadata: options?.metadata,
        // Include all options for debugging
        generationOptions: options
      },
      timestamp,
      NotificationTypeEnum.GeneratedID,
      notificationType,
      options?.metadata ? {
        additionalOptions: [JSON.stringify({
          metadata: options.metadata,
          options: options
        })]
      } : undefined
    );
    return generatedId;
  }



  private static notifyFormatted(
    id: string,
    message: string,
    content: any,
    timestamp: Date,
    type: NotificationType,
    notificationType: NotificationType = NotificationTypeEnum.System,
    options?: {
      additionalOptions?: readonly string[] | string | number | any[] | undefined;
      additionalDocumentOptions?: DocumentOptions;
      additionalOptionsLabel?: string;
    },
    userName?: string
  ): void {
    notify(
      id,
      message,
      content,
      timestamp,
      type,
      notificationType,
      options,
      userName
    );
  }

  static generateVersionID(versionNumber: string): string {
    return this.generateID(
      "VER",
      `version_${versionNumber}`,
      NotificationTypeEnum.GeneratedID
    );
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
    type: NotificationType,
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
    notification: NotificationData<T, K, Meta<T, K>>,
    date: Date,
    notificationType: NotificationType,
    completionMessageLog: NotificationData<T, K, Meta<T, K>>,
    callback?: () => void
  ): string {
    const notificationID = `${notificationType}_${notification.message.id}_${date.getTime()}`;

    notify(
      notificationID,                        // id: string
      `Generated notification ID: ${notificationID}`, // content: string
      notification.message,                  // notificationMessage: NotificationMessages
      new Date(),                            // date: Date
      NotificationTypeEnum.GeneratedID,      // type: NotificationTypeEnum
      notificationType,                      // notificationType: NotificationType
      {                                      // options (optional)
        additionalOptions: [notificationID],
        additionalDocumentOptions: {
          documentId: notification.documentId,
          version: notification.version
        }
      },
      notification.userName
    );

    if (callback) callback();
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
    type: NotificationType,
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
    type: NotificationType,
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


  static generateNotificationIDFromMessage(message: string | null): string {
    if (!message) return `notification_${Date.now()}`;
    // Replace spaces and special chars to make a safe ID
    const sanitized = message
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    return `${sanitized}_${Date.now()}`;
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
    dataDetails?: DataDetails<T, K>,
    generatorType?: string,
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
      case NotificationTypeEnum.VersionID:
        return UniqueIDGenerator.generateVersionID(versionNumber);
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

const { latestVersion = createLatestVersion(), ...rest } = (data as Record<string, any>) || {};



// Dynamically set the FetchOptions using properties from the `area` object
const options: FetchOptions = {
  elementId: area.id, // Use `area.id` as the `elementId`
  listenForResize: true, // Set to true to listen for resize
  onChange: (dimensions) => {
    console.log(`Updated dimensions for area "${area.name}":`, dimensions);
  }
};
// Call the fetchUserAreaDimensions function using the dynamically created options
const areaDimensions = fetchUserAreaDimensions(options);

// Use `useMetadata` with appropriate type arguments for UnifiedMetaDataOptions
const currentMetadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> =
  useMetadata<T, K, Meta>({ area: 'phase-area' });




const videoDataDetails: DataDetails<T, K> = {
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
  label: label,
  latestVersion: latestVersion,
  currentMeta: currentMeta,
  currentMetadata: currentMetadata,
  date: new Date()
}; export default UniqueIDGenerator;

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
