import { NotificationTypeEnum } from "@/app/components/support/NotificationContext";
import LogData from "../components/models/LogData";
import { NotificationData } from "../components/support/NofiticationsSlice";
import {
    NotificationType,
    useNotification,
} from "../components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "../components/support/NotificationMessages";

const { notify } = useNotification();
// UniqueIDGenerator.ts


const notification: NotificationData = {
  id: 'unique-id',
  content: 'Notification content',
  updatedAt: new Date(),
  message: "",
  createdAt: new Date(),
  type: NotificationTypeEnum.AccountCreated,
  completionMessageLog: {} as LogData
};


    // Additional logic specific to logging task completion
    const completionMessage = `UniqueIDGenerator ${id} has been completed.`;

const completionMessageLog: LogData = {
  timestamp: new Date(), // Set the current timestamp
  level: "INFO", // Specify the log level, e.g., INFO, WARNING, ERROR
  message: completionMessage, // Use the completionMessage provided as the log message
  user: null, // Optional: Include user information if available, set to null for now
  // Add additional fields as needed based on the LogData interface
};
class UniqueIDGenerator {
  
  static generateNotificationID(
    notification: NotificationData,
    date: Date,
    type: NotificationType,
    completionMessageLog: NotificationData,
    notify: (message: string) => void // Pass notify function as a parameter
  ): string {
    const notificationID = `${type}_${notification.message}_${date.getTime()}`;
    notify(`Generated notification ID: ${notificationID}`);
    return notificationID;
  }

  static generateRoomId(): string {
    // Implement your room ID generation logic here
    // Example: Generate a random alphanumeric ID
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

  static generateTaskID(
    taskId: string,
    taskName: string,
    notify: (message: string, type: string, date: Date, id: string) => void
  ): string {
    // Check if taskId exists, if not, generate one
    if (!taskId) {
      taskId = UniqueIDGenerator.generateRoomId(); // Assuming you want to generate a room ID
      const message = `Generated task ID for task ${taskId}: ${taskName}`;
      notify(
        message,
        NOTIFICATION_MESSAGES.Generators.TASK_ID_GENERATED,
        new Date(),
        NotificationTypeEnum.GeneratedID
      );
    }
    return taskId;
  }

  static generateTodoID(todoId: string, todoName: string): string {
    const message = `Generated todo ID for todo ${todoId}: ${todoName}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.TODO_ID_GENERATED,
      new Date(),
      NotificationTypeEnum.GeneratedID
    );
    return this.generateID(todoId, todoName);
  }

  static generateID(folderName: string, fileName: string): string {
    const uniqueID = `${folderName}_${fileName}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated unique ID: ${uniqueID}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.GENERATE_UNIQUE_ID,
      new Date(),
      NotificationTypeEnum.GeneratedID
    );
    return uniqueID;
  }

  static generateProjectID(projectName: string): string {
    const projectID = `proj_${projectName}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated project ID: ${projectID}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.GENERATE_PROJECT_ID,
      new Date(),
      NotificationTypeEnum.GeneratedID
    );
    return projectID;
  }

  static generateUserID(userName: string): string {
    const userID = `user_${userName}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated user ID: ${userID}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.GENERATE_USER_ID,
      new Date(),
      NotificationTypeEnum.GeneratedID
    );
    return userID;
  }

  static generateTeamID(teamName: string): string {
    const teamID = `team_${teamName}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated team ID: ${teamID}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.GENERATE_TEAM_ID,
      new Date(),
      NotificationTypeEnum.GeneratedID
    );
    return teamID;
  }

  static generateElementID(elementName: string): string {
    const elementID = `${elementName}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated element ID: ${elementID}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.GENERATE_ELEMENT_ID,
      new Date(),
      NotificationTypeEnum.GeneratedID
    );
    return elementID;
  }

  static generateComponentID(componentName: string): string {
    const componentID = `${componentName}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated component ID: ${componentID}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.GENERATE_COMPONENT_ID,
      new Date(),
      NotificationTypeEnum.GeneratedID
    );
    return componentID;
  }
  static generateFunctionalityID(functionalityName: string): string {
    const functionalityID = `${functionalityName}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated functionality ID: ${functionalityID}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.GENERATE_FUNCTIONALITY_ID,
      new Date(),
      NotificationTypeEnum.GeneratedID
    );
    return functionalityID;
  }

  static generateCardID(cardName: string): string {
    const cardID = `${cardName}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated card ID: ${cardID}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.GENERATE_CARD_ID,
      new Date(),
      NotificationTypeEnum.GeneratedID
    );
    return cardID;
  }

  static generateTableID(tableName: string): string {
    const tableID = `${tableName}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated table ID: ${tableID}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.GENERATE_TABLE_ID,
      new Date(),
      NotificationTypeEnum.GeneratedID
    );
    return tableID;
  }

  static generateAudioChannelID(): string {
    const audioChannelID = `audio_channel_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated audio channel ID: ${audioChannelID}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.GENERATE_AUDIO_CHANNEL_ID,
      new Date(),
      NotificationTypeEnum.GeneratedID
    );
    return audioChannelID;
  }

  static generateVideoChannelID(): string {
    const videoChannelID = `video_channel_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated video channel ID: ${videoChannelID}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.GENERATE_VIDEO_CHANNEL_ID,
      new Date(),
      NotificationTypeEnum.GeneratedID
    );
    return videoChannelID;
  }

  static generateTextChannelID(): string {
    const textChannelID = `text_channel_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated text channel ID: ${textChannelID}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.GENERATE_TEXT_CHANNEL_ID,
      new Date(),
      NotificationTypeEnum.GeneratedID
    );
    return textChannelID;
  }
}

class PhaseIDGenerator {
  static generatePhaseID(phaseName: string): string {
    const phaseID = `${phaseName}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated phase ID: ${phaseID}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.GENERATE_PHASE_ID,
      new Date(),
      NotificationTypeEnum.PhaseID
    );
    return phaseID;
  }
}

class CollaborationIDGenerator {
  static generateDocumentEditID(documentName: string): string {
    const documentEditID = `document_edit_${documentName}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated document edit ID: ${documentEditID}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.GENERATE_DOCUMENT_ID,
      new Date(),
      NotificationTypeEnum.DocumentEditID
    );
    return documentEditID;
  }

  static generateTaskBoardID(): string {
    const taskBoardID = `task_board_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated task board ID: ${taskBoardID}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.GENERATE_TASKBOARD_ID,
      new Date(),
      NotificationTypeEnum.TaskBoardID
    );
    return taskBoardID;
  }

  static generateBrainstormingSessionID(): string {
    const brainstormingSessionID = `brainstorming_session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated brainstorming session ID: ${brainstormingSessionID}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.GENERATE_BRAINSTORMING_SESSION_ID,
      new Date(),
      NotificationTypeEnum.BrainstormingSessionID
    );
    return brainstormingSessionID;
  }
}

class UserRewardIDGenerator {
  static generateContributionID(userId: string): string {
    const contributionID = `contribution_${userId}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated contribution ID: ${contributionID}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.GENERATE_CONTRIBUTION_ID,
      new Date(),
      NotificationTypeEnum.ContributionID
    );
    return contributionID;
  }
}

class MonetizationIDGenerator {
  static generateProjectRevenueID(projectId: string): string {
    const projectRevenueID = `revenue_${projectId}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const message = `Generated project revenue ID: ${projectRevenueID}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.GENERATE_PROJECT_REVENUE_ID,
      new Date(),
      NotificationTypeEnum.ProjectRevenueID
    );
    return projectRevenueID;
  }
}
export default UniqueIDGenerator;
PhaseIDGenerator;
CollaborationIDGenerator;
UserRewardIDGenerator;
MonetizationIDGenerator;
