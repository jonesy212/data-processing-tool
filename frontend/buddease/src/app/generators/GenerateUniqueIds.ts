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
  const generatedID = UniqueIDGenerator.generateID(USER_ID_PREFIX, userName, NotificationTypeEnum.GeneratedID);
  return {
    [Symbol.iterator]: function* () {
      yield generatedID;
    }
  };
}



class UniqueIDGenerator {
  static notifyFormatted(id: string, message: string, content: any, timestamp: Date, type: NotificationType) {
    notify(
      id,
      message,
      content,
      timestamp,
      type
    );
  }


  static generateNotificationID(
    notification: NotificationData,
    date: Date,
    type: NotificationType,
    completionMessageLog: NotificationData,
    callback?: () => void
  ): string {
    const notificationID = `${type}_${notification.message}_${date.getTime()}`;
    const message = `Generated notification ID: ${notificationID}`;
    const content = {
      notificationID: notificationID,
      notificationMessage: notification.message,
      date: date,
      type: type,
      completionMessageLog: completionMessageLog
      // Add more properties as needed
    };
    notify(
      notificationID,
      message,
      content,
      new Date(),
      type
    );
    return notificationID;
  }

  static generateRoomId(): string {
    const roomIdLength = 8;
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let roomId = "";
    for (let i = 0; i < roomIdLength; i++) {
      roomId += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return roomId;
  }

  static generateTaskID(
    taskId: string | undefined,
    taskName: string
  ): string {
    if (!taskId) {
      taskId = UniqueIDGenerator.generateRoomId();
      const message = `Generated task ID for task ${taskId}: ${taskName}`;
      notify(
        taskId,
        message,
        {},
        new Date(),
        NotificationTypeEnum.GeneratedID
      );
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
      type: type
    };

    UniqueIDGenerator.notifyFormatted(todoId || '', message, content, new Date(), NotificationTypeEnum.GeneratedID);
    const todoDetails: DataDetails = {
      id: todoId,
      title: todoName,
      description: type,
      startDate: new Date(),
      endDate: new Date(),
      status: "pending",
      isActive: true,
      tags: [],
      // Add more properties as needed
    }
    const todoDetailsString = JSON.stringify(todoDetails);
    return this.generateID(todoDetailsString, todoId || '', "todoName" as NotificationType);
  }

  static generateDocumentId(documentName: string, type: NotificationType): string {
    const generatedID = `${documentName}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const message = `Generated document ID for ${documentName}: ${generatedID}`;
    const content = {
      documentName: documentName,
      generatedID: generatedID,
      timestamp: Date.now(),
      type: type
    };
    this.notifyFormatted(generatedID, message, content, new Date(), NotificationTypeEnum.GeneratedID);
    return generatedID;
  }
  
  static generateID(prefix: string, name: string, type: NotificationType, dataDetails?: DataDetails): string {
    const generatedID = `${prefix}_${name}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    return generatedID;
  }

 

  static generateCustomID(name: string, type: NotificationType): string {
    return UniqueIDGenerator.generateID(name, type, "custom" as NotificationType);
  }

  static generateProjectID(projectName: string): string {
    return UniqueIDGenerator.generateID(projectName, NotificationTypeEnum.ProjectRevenueID, "proj" as NotificationType);
  }

  static generateUserID(userName: string): string {
    return UniqueIDGenerator.generateID(userName, NotificationTypeEnum.AccountCreated, "user" as NotificationType);
  }

  static generateTeamID(teamName: string): string {
    return UniqueIDGenerator.generateID(teamName, NotificationTypeEnum.TeamJoinRequest, "team" as NotificationType);
  }

  static generateElementID(elementName: string): string {
    return UniqueIDGenerator.generateID(elementName, NotificationTypeEnum.GeneratedID, "element" as NotificationType);
  }

  // Add more specific ID generation methods as needed

  static generatePhaseID(phaseName: string): string {
    return UniqueIDGenerator.generateID(phaseName, NotificationTypeEnum.PhaseID, "phase" as NotificationType);
  }

  static generateDocumentEditID(documentName: string): string {
    return UniqueIDGenerator.generateID(documentName, NotificationTypeEnum.DocumentEditID, "document_edit" as NotificationType);
  }

  static generateTaskBoardID(): string {
    return UniqueIDGenerator.generateID("task_board", NotificationTypeEnum.TaskBoardID, "task_board" as NotificationType);
  }

  static generateBrainstormingSessionID(): string {
    return UniqueIDGenerator.generateID("brainstorming_session", NotificationTypeEnum.BrainstormingSessionID, "brainstorming_session" as NotificationType);
  }






  static generateUserId(username: string): string {
    return this.generateID('UserID', `User_${username}`, NotificationTypeEnum.GeneratedID);
  }

  static generateSessionId(): string {
    return this.generateID('SessionID', 'Session', NotificationTypeEnum.GeneratedID);
  }

  static generateOrderId(): string {
    return this.generateID('OrderID', 'Order', NotificationTypeEnum.GeneratedID);
  }

  static generateProductId(): string {
    return this.generateID('ProductID', 'Product', NotificationTypeEnum.GeneratedID);
  }

  static generateEventId(): string {
    return this.generateID('EventID', 'Event', NotificationTypeEnum.GeneratedID);
  }

  static generateMessageId(): string {
    return this.generateID('MessageID', 'Message', NotificationTypeEnum.GeneratedID);
  }

  static generateFileId(): string {
    return this.generateID('FileID', 'File', NotificationTypeEnum.GeneratedID);
  }

  static generateTaskBoardId(): string {
    return this.generateID('TaskBoardID', 'TaskBoard', NotificationTypeEnum.GeneratedID);
  }

  static generateLocationId(): string {
    return this.generateID('LocationID', 'Location', NotificationTypeEnum.GeneratedID);
  }

  static generateCouponCode(): string {
    return this.generateID('CouponCode', 'Coupon', NotificationTypeEnum.GeneratedID);
  }

  static generateSurveyId(): string {
    return this.generateID('SurveyID', 'Survey', NotificationTypeEnum.GeneratedID);
  }

  static generateAnalyticsId(): string {
    return this.generateID('AnalyticsID', 'Analytics', NotificationTypeEnum.GeneratedID);
  }

}


const videoDataDetails: DataDetails = {
  id: 'video1',
  title: 'Video Title',
  description: 'Video Description',
  status: "pending",
  isActive: false,
  tags: []
};

export default UniqueIDGenerator



const videoDetailsString = JSON.stringify(videoDataDetails);

// Generate unique ID using videoDataDetails with the prefix "video"
const uniqueVideoID = UniqueIDGenerator.generateID("video", videoDetailsString, NotificationTypeEnum.GeneratedID, videoDataDetails);

// Adjusted usage of generateID function
console.log(uniqueVideoID);
