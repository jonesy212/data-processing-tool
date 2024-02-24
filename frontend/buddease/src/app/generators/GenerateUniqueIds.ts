import { Notification } from "../components/support/NofiticationsSlice";
import {
  NotificationType,
  useNotification,
} from "../components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "../components/support/NotificationMessages";

const { notify } = useNotification();
// UniqueIDGenerator.ts
class UniqueIDGenerator {
  static generateNotificationID(
    notification: Notification,
    date: Date,
    type: NotificationType,
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

  static generateTaskID(taskId: string, taskName: string): string {
    const message = `Generated task ID for task ${taskId}: ${taskName}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.TASK_ID_GENERATED,
      new Date(),
      "GeneratedID"
    );
    return this.generateID(taskId, taskName);
  }

  static generateTodoID(todoId: string, todoName: string): string {
    const message = `Generated todo ID for todo ${todoId}: ${todoName}`;
    notify(
      message,
      NOTIFICATION_MESSAGES.Generators.TODO_ID_GENERATED,
      new Date(),
      "GeneratedID"
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
      "GeneratedID"
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
      "GeneratedID"
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
      "GeneratedID"
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
      "GeneratedID"
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
      "GeneratedID"
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
      "GeneratedID"
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
      "GeneratedID"
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
      "GeneratedID"
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
      "GeneratedID"
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
      "GeneratedID"
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
      "GeneratedID"
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
      "GeneratedID"
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
      "PhaseID"
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
      "DocumentEditID"
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
      "TaskBoardID"
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
      "BrainstormingSessionID"
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
      "ContributionID"
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
      "ProjectRevenueID"
    );
    return projectRevenueID;
  }
}
export default UniqueIDGenerator;
PhaseIDGenerator;
CollaborationIDGenerator;
UserRewardIDGenerator;
MonetizationIDGenerator;
