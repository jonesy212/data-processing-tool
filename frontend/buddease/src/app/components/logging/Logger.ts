// Logger.ts
import { endpoints } from "@/app/api/ApiEndpoints";
import { LogData } from "@/app/components/models/LogData";
import { Task } from "@/app/components/models/tasks/Task";
import { NotificationData } from "@/app/components/support/NofiticationsSlice";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";

import useErrorHandling from "@/app/components/hooks/useErrorHandling";
import { DataDetails } from "@/app/components/models/data/Data";
import { team, Team } from "@/app/components/models/teams/Team";
import TeamData from "@/app/components/models/teams/TeamData";
import { useTeamManagerStore } from "@/app/components/state/stores/TeamStore";
import dotProp from "dot-prop";
const API_BASE_URL = endpoints.logging;

const { notify } = useNotification();

function createErrorNotificationContent(error: Error): any {
  // Extract relevant information from the error object
  const errorDetails = {
    errorMessage: error.message,
    errorStack: error.stack,
    // Add more fields as needed based on your requirements
  };

  return errorDetails;
}

const errorLogger = {
  error: (errorMessage: string, extraInfo: any) => {
    console.error(errorMessage, extraInfo);
    notify(
      "Error occurred",
      NOTIFICATION_MESSAGES.Logger.LOG_ERROR,
      {},
      new Date(),
      NotificationTypeEnum.Error
    );
  },
};


class Logger {
  static log(message: string) {
    console.log(message);
  }

  static error(errorMessage: string, extraInfo?: any) {
    console.error(errorMessage, extraInfo);
  }

  static info(message: string, extraInfo?: any) {
    // Log info message with optional extra information
    console.log("INFO:", message, extraInfo || "");
  }

  static logWithOptions(type: string, message: string, uniqueID: string) {
    // You can implement different logging mechanisms based on the type
    console.log(`[${type}] ${message} (ID: ${uniqueID})`);
  }

  static logSessionEvent(sessionID: string, event: string) {
    // Assuming 'endpoints' is imported from apiEndpoints.ts
    fetch(endpoints.logs.logSession as unknown as Request, {
      // Cast to unknown first, then to Request
      method: "POST",
      body: JSON.stringify({ sessionID, event }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to log session event");
        }
      })
      .catch((error: any) => {
        notify(
          "Error logging session event",
          NOTIFICATION_MESSAGES.Logger.LOG_ERROR,
          createErrorNotificationContent,
          new Date(),
          NotificationTypeEnum.LoggingError
        );
        console.error(error);
      });
  }

  static logError(errorMessage: string, user: string | null = null) {
    // Log the error message with user information if available
    const extraInfo = user ? { user } : {};
    errorLogger.error(errorMessage, extraInfo);
  }

  static logUserActivity(action: string, userId: string) {
    this.logWithOptions(
      "User Activity",
      `${action} (User ID: ${userId})`,
      userId
    );
  }

  static logCommunication(type: string, message: string, userId: string) {
    this.logWithOptions(
      "Communication",
      `${type}: ${message} (User ID: ${userId})`,
      userId
    );
  }

  static logProjectPhase(phase: string, projectId: string) {
    this.logWithOptions(
      "Project Phase",
      `${phase} (Project ID: ${projectId})`,
      projectId
    );
  }

  static logCommunityInteraction(action: string, userId: string) {
    this.logWithOptions(
      "Community Interaction",
      `${action} (User ID: ${userId})`,
      userId
    );
  }

  static logMonetizationEvent(event: string, projectId: string) {
    this.logWithOptions(
      "Monetization Event",
      `${event} (Project ID: ${projectId})`,
      projectId
    );
  }
}

// Extend Logger for audio logs

class AudioLogger extends Logger {
  static logAudio(
    message: string,
    uniqueID: string,
    audioID: string,
    duration: number
  ) {
    super.logWithOptions("Audio", message, uniqueID);
    this.logAudioEvent(uniqueID, audioID, duration);
  }
  private static logAudioEvent(
    uniqueID: string,
    audioID: string,
    duration: number
  ) {
    let logAudioEventUrl: string = ""; // Initialize with an empty string

    if (typeof endpoints.logs.logAudioEvent === "string") {
      logAudioEventUrl = endpoints.logs.logAudioEvent;
    } else if (typeof endpoints.logs.logAudioEvent === "function") {
      logAudioEventUrl = endpoints.logs.logAudioEvent();
    } else {
      // Handle the case when logAudioEvent is a nested object
      // For example: logAudioEventUrl = endpoints.logs.logAudioEvent.someNestedEndpoint;
      // or logAudioEventUrl = endpoints.logs.logAudioEvent.someNestedFunction();
    }

    fetch(logAudioEventUrl, {
      method: "POST",
      body: JSON.stringify({ uniqueID, audioID, duration }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to log audio event");
        }
      })
      .catch((error) => {
        notify(
          "Error logging audio event",
          NOTIFICATION_MESSAGES.Logger.LOG_ERROR,
          createErrorNotificationContent,
          new Date(),
          error
        );
      });
  }
}

class ConfigLogger {
  static async logConfigUpdate(configName: string, newValue: any) {
    try {
      const logUrl = this.getLogUrl("configUpdateEvent");

      const response = await fetch(logUrl, {
        method: "POST",
        body: JSON.stringify({ configName, newValue }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to log config update event");
      }
    } catch (error: any) {
      console.error("Error logging config update event:", error);
      // Handle the error using the provided error handling function or any other mechanism
      throw error; // Re-throw the error to propagate it further if needed
    }
  }

  private static getLogUrl(action: string): string {
    let logUrl = ""; // Initialize with an empty string

    // Determine the log URL based on the action
    // You can customize this logic based on your application's requirements
    // For now, let's assume a predefined log URL
    // Example: logUrl = endpoints.logs.logConfigEvent;

    return logUrl;
  }
}


class DexLogger extends Logger {
  static logDEXEvent(event: string, dexId: string) {
    this.logWithOptions("DEX Event", `${event} (DEX ID: ${dexId})`, dexId);
  }
}

class SearchLogger extends Logger {
  static logSearch(query: string, userId: string) {
    super.logWithOptions(
      "Search",
      `Search performed (Query: ${query}, User ID: ${userId})`,
      userId
    );
  }

  

  static logSearchResults(query: string, resultsCount: number, userId: string) {
    super.logWithOptions(
      "Search",
      `Search results received (Query: ${query}, Results Count: ${resultsCount}, User ID: ${userId})`,
      userId
    );
  }

  static logSearchError(query: string, errorMessage: string, userId: string) {
    super.logWithOptions(
      "Search",
      `Error performing search (Query: ${query}, Error: ${errorMessage}, User ID: ${userId})`,
      userId
    );
  }
  // Add more methods for other search-related events as needed
}

class TeamLogger {
  static async logTeamCreation(teamId: string, team: Team): Promise<void> {
    try {
      // Convert teamId to a number if necessary
      const numericTeamId = parseInt(teamId, 10);

      await this.logEvent("createTeam", "Creating team", numericTeamId, team);
      await this.logTeamEvent(teamId, "Team created", team);
    } catch (error) {
      console.error("Error logging team creation:", error);
      throw error;
    }
  }

  static async logTeamUpdate(
    teamId: string | number,
    updatedTeam: Team
  ): Promise<void> {
    try {
      await this.logEvent(
        "updateTeam",
        "Updating team",
        teamId as number,
        updatedTeam
      );
      await this.logTeamEvent(teamId as string, "Team updated", updatedTeam);
    } catch (error) {
      console.error("Error logging team update:", error);
      throw error;
    }
  }

  static async logTeamDeletion(teamId: number | string): Promise<void> {
    try {
      await this.logEvent("deleteTeam", "Deleting team", teamId as number);
      // Instantiate a Team object and pass it to logTeamEvent
      team;
      await this.logTeamEvent(
        teamId as string,
        "Team deleted",
        team,
        new Date()
      );
    } catch (error) {
      console.error("Error logging team deletion:", error);
      throw error;
    }
  }

  private static async logEvent(
    action: string,
    message: string,
    teamId: number,
    data?: any
  ): Promise<void> {
    try {
      const logUrl = this.getLogUrl(action);
      await fetch(logUrl, {
        method: "POST",
        body: JSON.stringify({ action, message, teamId, data }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error(`Error logging ${action} event:`, error);
      throw error;
    }
  }

  private static convertTeamId(teamId: string | number): number {
    // Check if teamId is already a number, if so, return it
    if (typeof teamId === "number") {
      return teamId;
    }

    // Attempt to parse teamId as a number
    const parsedTeamId = parseInt(teamId, 10);

    // Check if parsing was successful, if not, throw an error
    if (isNaN(parsedTeamId)) {
      throw new Error("Invalid teamId provided: " + teamId);
    }

    // Return the parsed teamId
    return parsedTeamId;
  }

  private static async logTeamEvent(
    teamId: string,
    message: string,
    team: Team,
    data?: any
  ): Promise<void> {
    try {
      // Convert teamId to a number using the utility method

      const teamData: TeamData | null = useTeamManagerStore().getTeamData(
        teamId,
        team
      );

      if (!teamData) {
        throw new Error("Team data is null");
      }

      // Ensure teamData is of type TeamData
      if (typeof teamData !== "object" || teamData === null) {
        throw new Error("Team data is not of type TeamData");
      }

      // Now that we've confirmed teamData is not null, we can assert its type as TeamData
      const teamDataTyped: TeamData = teamData!;
      const teamDataString = JSON.stringify(teamData);
      const teamDataStringLength = teamDataString.length;
      if (teamDataStringLength > 10000) {
        // Truncate the team data string to 10000 characters
        const truncatedTeamDataString = teamDataString.substring(0, 10000);
        // Assign truncated data to teamData
        // Note: You may need to assign to teamDataTyped instead of teamData
        teamDataTyped.data = truncatedTeamDataString;
      }

      const logUrl = this.getLogUrl("teamEvent");
      await fetch(logUrl, {
        method: "POST",
        body: JSON.stringify({ teamId, message, teamData, data }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error(`Error logging team event for team ${teamId}:`, error);
      throw error;
    }
  }

  private static getLogUrl(action: string): string {
    let logUrl = ""; // Initialize with an empty string

    if (typeof endpoints.logs.logEvent === "string") {
      logUrl = endpoints.logs.logEvent;
    } else if (typeof endpoints.logs.logEvent === "function") {
      logUrl = endpoints.logs.logEvent();
    } else {
      // Handle the case when logEvent is a nested object
      // For example: logUrl = endpoints.logs.logEvent.someNestedEndpoint;
      // or logUrl = endpoints.logs.logEvent.someNestedFunction();
    }

    return logUrl;
  }
}

class AnimationLogger {
  static async logAnimation(
    message: string,
    uniqueID: string,
    animationID: string,
    duration: number
  ) {
    const { handleError } = useErrorHandling(); // Accessing the handleError function from the useErrorHandling hook

    try {
      const logUrl = this.getLogUrl("animationEvent");

      const response = await fetch(logUrl, {
        method: "POST",
        body: JSON.stringify({ uniqueID, animationID, duration }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to log animation event");
      }
    } catch (error: any) {
      console.error("Error logging animation event:", error);
      handleError("Error logging animation event: " + error.message); // Handle the error using the provided error handling function

      // Log the error to the file using the FileLogger
      FileLogger.logFileError(
        "Error logging animation event: " + error.message
      );

      throw error; // Re-throw the error to propagate it further if needed
    }
  }

  static generateID(
    prefix: string,
    name: string,
    type: NotificationType,
    dataDetails?: DataDetails
  ): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    let id = `${prefix}_${name}_${timestamp}_${randomString}`;

    // Include additional details to make the ID more unique
    if (dataDetails) {
      // Concatenate data details to the ID
      id += `_${dataDetails.title}_${dataDetails.type}`;
    }

    return id;
  }

  private static getLogUrl(action: string): string {
    let logUrl = ""; // Initialize with an empty string

    if (typeof endpoints.logs.logEvent === "string") {
      logUrl = endpoints.logs.logEvent;
    } else if (typeof endpoints.logs.logEvent === "function") {
      logUrl = endpoints.logs.logEvent();
    } else {
      // Handle the case when logEvent is a nested object
      // For example: logUrl = endpoints.logs.logEvent.someNestedEndpoint;
      // logUrl = endpoints.logs.logEvent.someNestedFunction();
    }

    return logUrl;
  }

  static logAnimationStopped(
    uniqueID: string,
    animationID: string,
    startTime: number
  ) {
    const endTime = Date.now();
    const duration = endTime - startTime; // Calculate the duration of the animation

    AnimationLogger.logAnimation(
      "Animation stopped",
      uniqueID,
      animationID,
      duration
    );
  }
}

class DataLogger {
  static async log(message: string, data?: {} ): Promise<void> {
    const { handleError } = useErrorHandling(); // Accessing the handleError function from the useErrorHandling hook

    try {
      const logUrl = this.getLogUrl("dataEvent");

      const response = await fetch(logUrl, {
        method: "POST",
        body: JSON.stringify({ message }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to log data event");
      }
    } catch (error: any) {
      console.error("Error logging data event:", error);
      handleError("Error logging data event: " + error.message); // Handle the error using the provided error handling function

      // Log the error to the file using the FileLogger
      FileLogger.logFileError("Error logging data event: " + error.message);

      throw error; // Re-throw the error to propagate it further if needed
    }
  }

  private static getLogUrl(action: string): string {
    let logUrl = ""; // Initialize with an empty string

    const logEvent = dotProp.getProperty(endpoints, `logging.${action}`); // Access nested property using dot-prop

    if (typeof logEvent === "string") {
      logUrl = logEvent;
    } else if (typeof logEvent === "function") {
      logUrl = logEvent();
    } else {
      // Handle the case when logEvent is a nested object
      if (logEvent) {
        const logEventToFile = dotProp.getProperty(logEvent, "logEventToFile");
        if (typeof logEventToFile === "function") {
          logUrl = logEventToFile();
        }
      }
    }
    return logUrl;
  }
}

// Extend Logger for video logs
class VideoLogger extends Logger {
  static logVideo(
    message: string,
    uniqueID: string,
    videoID: string,
    duration: number
  ) {
    super.logWithOptions("Video", message, uniqueID);
    this.logVideoEvent(uniqueID, videoID, duration);
  }

  private static logVideoEvent(
    uniqueID: string,
    videoID: string,
    duration: number
  ) {
    let logVideoEventUrl: string;

    if (typeof endpoints.logs.logVideoEvent === "string") {
      // If it's a string, directly use the endpoint URL
      logVideoEventUrl = endpoints.logs.logVideoEvent;
    } else if (typeof endpoints.logs.logVideoEvent === "function") {
      // If it's a function, call it to get the endpoint URL
      logVideoEventUrl = endpoints.logs.logVideoEvent();
    } else {
      // Handle the case where it's neither a string nor a function
      throw new Error("Invalid log video event endpoint");
    }

    fetch(logVideoEventUrl, {
      method: "POST",
      body: JSON.stringify({ uniqueID, videoID, duration }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to log video event");
        }
      })
      .catch((error) => {
        notify(
          "Error logging video event.",
          NOTIFICATION_MESSAGES.Logger.LOG_ERROR,
          new Date(),
          error
        );
      });
  }
}

class ChannelLogger extends Logger {
  static logChannel(message: string, uniqueID: string, channelID: string) {
    super.logWithOptions("Channel", message, uniqueID);
    this.logChannelEvent(uniqueID, channelID);
  }

  private static logChannelEvent(uniqueID: string, channelID: string) {
    let logChannelEventUrl: string;

    if (typeof endpoints.logs.logChannelEvent === "string") {
      // If it's a string, directly use the endpoint URL
      logChannelEventUrl = endpoints.logs.logChannelEvent;
    } else if (typeof endpoints.logs.logChannelEvent === "function") {
      // If it's a function, call it to get the endpoint URL
      logChannelEventUrl = endpoints.logs.logChannelEvent();
    } else {
      // Handle the case where it's neither a string nor a function
      throw new Error("Invalid log channel event endpoint");
    }

    fetch(logChannelEventUrl, {
      method: "POST",
      body: JSON.stringify({ uniqueID, channelID }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to log channel event");
        }
      })
      .catch((error) => {
        notify(
          "Error logging channel event",
          NOTIFICATION_MESSAGES.Logger.LOG_ERROR,
          new Date(),
          error
        );
      });
  }
}



class ChatLogger extends Logger {
  static logChat(message: string, uniqueID: string, roomID: string) {
    super.logWithOptions("Chat", message, uniqueID);
    this.logChatEvent(uniqueID, roomID);
  }

  private static logChatEvent(uniqueID: string, roomID: string) {
    let logChatEventUrl: string;

    if (typeof endpoints.logs.logChatEvent === "string") {
      // If it's a string, directly use the endpoint URL
      logChatEventUrl = endpoints.logs.logChatEvent;
    } else if (typeof endpoints.logs.logChatEvent === "function") {
      // If it's a function, call it to get the endpoint URL
      logChatEventUrl = endpoints.logs.logChatEvent();
    } else {
      // Handle the case where it's neither a string nor a function
      throw new Error("Invalid log chat event endpoint");
    }

    fetch(logChatEventUrl, {
      method: "POST",
      body: JSON.stringify({ uniqueID, roomID }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to log chat event");
        }
      })
      .catch((error) => {
        notify(
          "Error logging chat event.",
          NOTIFICATION_MESSAGES.Logger.LOG_ERROR,
          new Date(),
          error
        );
      });
  }
}



class FormLogger {
  static async logFormEvent(eventType: string, formID: string, eventData: any) {
    const { handleError } = useErrorHandling(); // Accessing the handleError function from the useErrorHandling hook

    try {
      const logUrl = this.getLogUrl("formEvent");

      const response = await fetch(logUrl, {
        method: "POST",
        body: JSON.stringify({ eventType, formID, eventData }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to log form event");
      }
    } catch (error: any) {
      console.error("Error logging form event:", error);
      handleError("Error logging form event: " + error.message); // Handle the error using the provided error handling function

      // Log the error to the file using the FileLogger
      FileLogger.logFileError("Error logging form event: " + error.message);

      throw error; // Re-throw the error to propagate it further if needed
    }
  }

  private static getLogUrl(action: string): string {
    let logUrl = ""; // Initialize with an empty string

    if (typeof endpoints.logs.logEvent === "string") {
      logUrl = endpoints.logs.logEvent;
    } else if (typeof endpoints.logs.logEvent === "function") {
      logUrl = endpoints.logs.logEvent();
    } else {
      // Handle the case when logEvent is a nested object
      // For example: logUrl = endpoints.logs.logEvent.someNestedEndpoint;
      // logUrl = endpoints.logs.logEvent.someNestedFunction();
    }

    return logUrl;
  }
}

class CollaborationLogger extends Logger {
  static logCollaboration(
    message: string,
    uniqueID: string,
    collaborationID: string
  ) {
    super.logWithOptions("Collaboration", message, uniqueID);
    this.logCollaborationEvent(uniqueID, collaborationID);
  }

  private static logCollaborationEvent(
    uniqueID: string,
    collaborationID: string
  ) {
    let logCollaborationEventUrl: string;

    if (typeof endpoints.logs.logCollaborationEvent === "string") {
      // If it's a string, directly use the endpoint URL
      logCollaborationEventUrl = endpoints.logs.logCollaborationEvent;
    } else if (typeof endpoints.logs.logCollaborationEvent === "function") {
      // If it's a function, call it to get the endpoint URL
      logCollaborationEventUrl = endpoints.logs.logCollaborationEvent();
    } else {
      // Handle the case where it's neither a string nor a function
      throw new Error("Invalid log collaboration event endpoint");
    }

    fetch(logCollaborationEventUrl, {
      method: "POST",
      body: JSON.stringify({ uniqueID, collaborationID }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to log collaboration event");
        }
      })
      .catch((error) => {
        notify(
          "Error logging collaboration event.",
          NOTIFICATION_MESSAGES.Logger.LOG_ERROR,
          new Date(),
          error
        );
      });
  }
}

class ComponentLogger {
  static log(action: string, message: string, uniqueID: string) {
    Logger.logWithOptions("User", `${action} (${message})`, uniqueID);
  }
}


class DocumentLogger extends Logger {
  static logDocument(message: string, uniqueID: string, documentID: string) {
    super.logWithOptions("Document", message, uniqueID);
    this.logDocumentEvent(uniqueID, documentID);
  }

  private static logDocumentEvent(uniqueID: string, documentID: string) {
    let logDocumentEventUrl: string;

    if (typeof endpoints.logs.logDocumentEvent === "string") {
      // If it's a string, directly use the endpoint URL
      logDocumentEventUrl = endpoints.logs.logDocumentEvent;
    } else if (typeof endpoints.logs.logDocumentEvent === "function") {
      // If it's a function, call it to get the endpoint URL
      logDocumentEventUrl = endpoints.logs.logDocumentEvent();
    } else {
      // Handle the case where it's neither a string nor a function
      throw new Error("Invalid log document event endpoint");
    }

    fetch(logDocumentEventUrl, {
      method: "POST",
      body: JSON.stringify({ uniqueID, documentID }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to log document event");
        }
      })
      .catch((error) => {
        notify(
          "Error logging document event.",
          NOTIFICATION_MESSAGES.Logger.LOG_ERROR,
          new Date(),
          error
        );
      });
    // Log to file
    FileLogger.logToFile(
      `Document event logged: ${uniqueID}, ${documentID}`,
      "document_log.txt"
    );
  }
}

class FileLogger extends Logger {
  static logToFile(message: string, fileName: string) {
    console.log(`Logging to file ${fileName}: ${message}`);
    // Here you can implement the logic to write the message to the specified file
    // For demonstration purposes, we'll log to the console
  }

  static logDocumentToFile(message: string, fileName: string) {
    this.logToFile(message, fileName);
  }

  static logTaskToFile(message: string, fileName: string) {
    this.logToFile(message, fileName);
  }

  static logFileError(errorMessage: string) {
    this.logToFile(errorMessage, "error_log.txt");
  }
  // You can add more specific logging methods for different log types as needed

  static logEventToFile(logType: string, message: string, fileName: string) {
    switch (logType) {
      case "Document":
        this.logDocumentToFile(message, fileName);
        break;
      case "Task":
        this.logTaskToFile(message, fileName);
        break;
      // Add more cases for other log types if necessary
      default:
        this.logToFile(`[${logType}] ${message}`, fileName);
        break;
    }
  }
}

class TaskLogger extends Logger {
  static logTaskEvent(
    taskID: Task["id"],
    event: Task,
    completionMessage: string,
    type: string,
    notify: (message: string, type: string, date: Date, id: string) => void
  ) {
    // Assuming you want to log the completion message

    // Define the completionMessageLog using LogData interface
    const completionMessageLog: LogData & Partial<NotificationData> = {
      timestamp: new Date(), // Set the current timestamp
      level: "INFO", // Specify the log level, e.g., INFO, WARNING, ERROR
      message: completionMessage, // Use the completionMessage provided as the log message
      user: null, // Optional: Include user information if available, set to null for now
      createdAt: new Date(), // Ensure createdAt is always defined as a Date
      // Add additional fields as needed based on the LogData interface
    };

    if (completionMessageLog.createdAt) {
      const notifyCallback = () => {
        notify(
          "Success",
          NOTIFICATION_MESSAGES.Logger.LOG_INFO,
          new Date(),
          String(taskID)
        );
      };

      UniqueIDGenerator.generateNotificationID(
        {} as NotificationData,
        new Date(),
        NotificationTypeEnum.GeneratedID,
        completionMessageLog as NotificationData,
        notifyCallback // Pass the function to notify as an argument
      );
    }
    FileLogger.logToFile(
      `Task event logged: ${taskID}, ${completionMessage}`,
      "task_log.txt"
    );
  }

  static logTaskCompleted(
    existingTaskId: string,
    taskName: string,
    notify: (message: string, type: string, date: Date, id: string) => void
  ) {
    // Generate or retrieve the task ID
    const taskID = UniqueIDGenerator.generateTaskID(existingTaskId, taskName);

    // Additional logic specific to logging task completion
    const completionMessage = `Task ${taskID} has been completed.`;
    const event = {} as Task;
    // Log the completion event
    TaskLogger.logTaskEvent(
      taskID,
      event,
      completionMessage,
      NOTIFICATION_MESSAGES.Tasks.COMPLETED,
      notify
    );
  }

  static logTaskCreated(name: string, taskID: string) {
    super.logWithOptions(
      "Task Created",
      `Task ${taskID} created`, taskID);
    // Additional logic specific to logging task creation
  }

  static logTaskAssigned(taskID: string, assignedTo: string) {
    super.logWithOptions(
      "Task Assigned",
      `Task ${taskID} assigned to ${assignedTo}`,
      taskID
    );
    // Additional logic specific to logging task assignment
  }

  static logTaskUnassigned(taskID: string) {
    super.logWithOptions(
      "Task Unassigned",
      `Task ${taskID} unassigned`,
      taskID
    );
    // Additional logic specific to logging task unassignment
  }

  static logTaskReassigned(taskID: string, reassignedTo: string) {
    super.logWithOptions(
      "Task Reassigned",
      `Task ${taskID} reassigned to ${reassignedTo}`,
      taskID
    );
    // Additional logic specific to logging task reassignment
  }
  // Log to file

  // Add more methods as needed for other task-related events
}

class CalendarLogger extends Logger {
  static logCalendarEvent(message: string, uniqueID: string, eventID: string) {
    super.logWithOptions("Calendar", message, uniqueID);
    this.logCalendarEventEvent(uniqueID, eventID);
  }

  private static logCalendarEventEvent(uniqueID: string, eventID: string) {
    const logCalendarEventUrl =
      typeof endpoints.calendar.logCalendarEvent === "function"
        ? endpoints.calendar.logCalendarEvent(eventID) // Call the function with eventID to get the dynamic URL
        : endpoints.calendar.logCalendarEvent;

    if (logCalendarEventUrl) {
      // Check if the URL is defined
      fetch(String(logCalendarEventUrl), {
        method: "POST",
        body: JSON.stringify({ uniqueID, eventID }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to log calendar event");
          }
        })
        .catch((error) => {
          notify(
            "Error logging calendar event.",
            NOTIFICATION_MESSAGES.Logger.LOG_ERROR,
            new Date(),
            error
          );
        });
    } else {
      console.error("logCalendarEventUrl is not defined");
    }
  }
}

class TenantLogger extends Logger {
  static logUserRegistration(userId: string) {
    super.logWithOptions(
      "Tenant",
      `User registration (User ID: ${userId})`,
      userId
    );
  }

  static logUserLogin(userId: string) {
    super.logWithOptions("Tenant", `User login (User ID: ${userId})`, userId);
  }

  static logUserLogout(userId: string) {
    super.logWithOptions("Tenant", `User logout (User ID: ${userId})`, userId);
  }

  // Add more methods for other tenant-related events as needed
}

class AnalyticsLogger extends Logger {
  static logPageView(pageName: string, userId: string) {
    super.logWithOptions(
      "Analytics",
      `Page view: ${pageName} (User ID: ${userId})`,
      userId
    );
  }

  static logInteraction(featureName: string, userId: string) {
    super.logWithOptions(
      "Analytics",
      `User interaction: ${featureName} (User ID: ${userId})`,
      userId
    );
  }

  // Add more methods for other analytics-related events as needed
}

class PaymentLogger extends Logger {
  static logTransaction(transactionId: string, amount: number, userId: string) {
    super.logWithOptions(
      "Payment",
      `Transaction ${transactionId}: $${amount} (User ID: ${userId})`,
      userId
    );
  }

  static logSubscriptionRenewal(subscriptionId: string, userId: string) {
    super.logWithOptions(
      "Payment",
      `Subscription ${subscriptionId} renewed (User ID: ${userId})`,
      userId
    );
  }

  // Add more methods for other payment-related events as needed
}

class SecurityLogger extends Logger {
  static logLoginAttempt(userId: string, success: boolean) {
    super.logWithOptions(
      "Security",
      `Login attempt ${success ? "succeeded" : "failed"} (User ID: ${userId})`,
      userId
    );
  }

  static logSuspiciousActivity(userId: string, activity: string) {
    super.logWithOptions(
      "Security",
      `Suspicious activity detected: ${activity} (User ID: ${userId})`,
      userId
    );
  }

  // Add more methods for other security-related events as needed
}



class ContentLogger extends Logger {
  static logContentCreation(contentId: string, userId: string) {
    super.logWithOptions(
      "Content",
      `Content created (Content ID: ${contentId}, User ID: ${userId})`,
      userId
    );
  }

  static logContentDeletion(contentId: string, userId: string) {
    super.logWithOptions(
      "Content",
      `Content deleted (Content ID: ${contentId}, User ID: ${userId})`,
      userId
    );
  }

  // Add more methods for other content-related events as needed
}

class IntegrationLogger extends Logger {
  static logAPIRequest(requestId: string, endpoint: string) {
    super.logWithOptions(
      "Integration",
      `API request sent (Request ID: ${requestId}, Endpoint: ${endpoint})`,
      requestId
    );
  }

  static logAPIResponse(requestId: string, statusCode: number) {
    super.logWithOptions(
      "Integration",
      `API response received (Request ID: ${requestId}, Status Code: ${statusCode})`,
      requestId
    );
  }

  // Add more methods for other integration-related events as needed
}

class ErrorLogger extends Logger {
  static logError(errorMessage: string, errorDetails: any) {
    super.logWithOptions(
      "Error",
      `${errorMessage} (Details: ${JSON.stringify(errorDetails)})`,
      "N/A"
    );
  }

  // Add more methods for other error-related events as needed
}

class ExchangeLogger extends Logger {
  static logMessageSent(
    conversationId: string,
    messageId: string,
    userId: string
  ) {
    super.logWithOptions(
      "Exchange",
      `Message sent (Conversation ID: ${conversationId}, Message ID: ${messageId}, User ID: ${userId})`,
      userId
    );
  }

  static logMessageReceived(
    conversationId: string,
    messageId: string,
    userId: string
  ) {
    super.logWithOptions(
      "Exchange",
      `Message received (Conversation ID: ${conversationId}, Message ID: ${messageId}, User ID: ${userId})`,
      userId
    );
  }
}

class CommunityLogger extends Logger {
  static logPost(userId: string, postId: string) {
    super.logWithOptions(
      "Community",
      `User ${userId} posted (Post ID: ${postId})`,
      userId
    );
  }

  static logComment(userId: string, commentId: string) {
    super.logWithOptions(
      "Community",
      `User ${userId} commented (Comment ID: ${commentId})`,
      userId
    );
  }

  static logLike(userId: string, likedItemId: string) {
    super.logWithOptions(
      "Community",
      `User ${userId} liked (Item ID: ${likedItemId})`,
      userId
    );
  }

  // Add more methods for other community-related events as needed
}

class BugLogger extends Logger {
  static logBugCreation(bugId: string, bugDescription: string, userId: string) {
    super.logWithOptions(
      "Bug",
      `Bug created (Bug ID: ${bugId}, Description: ${bugDescription}, User ID: ${userId})`,
      userId
    );
  }

  static logBugUpdate(
    bugId: string,
    updatedDescription: string,
    userId: string
  ) {
    super.logWithOptions(
      "Bug",
      `Bug updated (Bug ID: ${bugId}, Updated Description: ${updatedDescription}, User ID: ${userId})`,
      userId
    );
  }

  static logBugResolution(bugId: string, resolution: string, userId: string) {
    super.logWithOptions(
      "Bug",
      `Bug resolved (Bug ID: ${bugId}, Resolution: ${resolution}, User ID: ${userId})`,
      userId
    );
  }

  static logBugAssignment(bugId: string, assignedTo: string, userId: string) {
    super.logWithOptions(
      "Bug",
      `Bug assigned (Bug ID: ${bugId}, Assigned To: ${assignedTo}, User ID: ${userId})`,
      userId
    );
  }

  static logBugClosure(bugId: string, userId: string) {
    super.logWithOptions(
      "Bug",
      `Bug closed (Bug ID: ${bugId}, User ID: ${userId})`,
      userId
    );
  }

  static logBugReopening(bugId: string, userId: string) {
    super.logWithOptions(
      "Bug",
      `Bug reopened (Bug ID: ${bugId}, User ID: ${userId})`,
      userId
    );
  }

  // Add more methods for other bug-related events as needed
}

export default Logger;

export {
  AnalyticsLogger,
  AnimationLogger,
  AudioLogger,
  BugLogger,
  CalendarLogger,
  ChannelLogger,
  ChatLogger,
  CollaborationLogger,
  CommunityLogger,
  ComponentLogger,
  ConfigLogger,
  ContentLogger,
  DataLogger,
  DexLogger,
  DocumentLogger,
  ErrorLogger,
  ExchangeLogger,
  FileLogger,
  FormLogger,
  IntegrationLogger,
  PaymentLogger,
  SearchLogger,
  SecurityLogger,
  TaskLogger,
  TeamLogger,
  TenantLogger,
  VideoLogger
};

