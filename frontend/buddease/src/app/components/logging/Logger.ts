// Logger.ts
import { endpoints } from "@/app/api/ApiEndpoints";
import { BaseData } from '@/app/components/models/data/Data';
import { LogData } from "@/app/components/models/LogData";
import { Task } from "@/app/components/models/tasks/Task";
import { NotificationData } from "@/app/components/support/NofiticationsSlice";
import {
    NotificationType,
    NotificationTypeEnum,
    useNotification,
} from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import fs from 'fs';

import useErrorHandling from "@/app/components/hooks/useErrorHandling";
import { DataDetails } from "@/app/components/models/data/Data";
import { team, Team } from "@/app/components/models/teams/Team";
import TeamData from "@/app/components/models/teams/TeamData";
import { useTeamManagerStore } from "@/app/components/state/stores/TeamStore";

import { DefaultCalendarEvent } from '../actions/CalendarEventActions';
import { Theme } from '../libraries/ui/theme/Theme';
import { encryptData } from "../security/encryptedData";
import { Snapshot } from '@/app/components/snapshots/LocalStorageSnapshotStore';

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
  static log(logType: string, message: string, extraInfo?: any) {
    if (extraInfo) {
      console.log(`[${logType}] ${message}`, extraInfo);
    } else {
      console.log(`[${logType}] ${message}`);
    }
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

class ConfigLogger extends Logger {
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
  static logSearch(query: string, userId?: string) {
    const userIdMessage = userId ? `, User ID: ${userId}` : "";
    super.logWithOptions(
      "Search",
      `Search performed (Query: ${query}${userIdMessage})`,
      userId ? userId : "Unknown"
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

  static logSearchTimeout(query: string, userId: string) {
    super.logWithOptions(
      "Search",
      `Search timeout (Query: ${query}, User ID: ${userId})`,
      userId
    );
  }

  static logEmptySearchResults(query: string, userId: string) {
    super.logWithOptions(
      "Search",
      `No results found for search query (Query: ${query}, User ID: ${userId})`,
      userId
    );
  }

  // Add more methods for other search-related events as needed
}

class TeamLogger extends Logger {
  static async logTeamCreation(teamId: string, team: Team, storeId: number, color?: string | null,): Promise<void> {
    try {
      // Convert teamId to a number if necessary
      const numericTeamId = parseInt(teamId, 10);

      await this.logEvent("createTeam", "Creating team", numericTeamId, team);
      await this.logTeamEvent(teamId, "Team created", team, storeId, color);
    } catch (error) {
      console.error("Error logging team creation:", error);
      throw error;
    }
  }

  static async logTeamUpdate(
    teamId: string | number,
    updatedTeam: Team,
    storeId?: number,
    color?: string | null,
  ): Promise<void> {
    try {

      if (storeId !== undefined) {
        storeId = parseInt(storeId.toString(), 10);

        await this.logEvent(
          "updateTeam",
          "Updating team",
          teamId as number,
          updatedTeam
        );
        await this.logTeamEvent(teamId as string, "Team updated", updatedTeam, storeId, color);
      }
    } catch (error) {
      console.error("Error logging team update:", error);
      throw error;
    }
  }

  static async logTeamDeletion(
    teamId: number | string,
    color?: string | null,
    storeId?: number,
  ): Promise<void> {
    try {
      await this.logEvent("deleteTeam", "Deleting team", teamId as number);
      // Instantiate a Team object and pass it to logTeamEvent
      team;
      await this.logTeamEvent(
        teamId as string,
        "Team deleted",
        team,
        storeId,
        null,
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
    storeId?: number,
    color?: string | null,
    data?: any,
  ): Promise<void> {
    try {
      // Convert teamId to a number using the utility method

      if (storeId !== undefined && color !== undefined) {
        const teamData: TeamData<BaseTeamData, ExtendedTeamData, TeamMetadata> | null =
        (await useTeamManagerStore(storeId)).getTeamData(
          teamId,
          team,
          color
        )


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
      }
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


class UILogger extends Logger {
  static logInterfaceContentFetch(userId: string) {
    this.logWithOptions("UI", `Fetched interface content for user ID: ${userId}`, userId);
  }

  static logInterfaceSettingsUpdate(userId: string) {
    this.logWithOptions("UI", `Updated interface settings for user ID: ${userId}`, userId);
  }

  static logDashboardFetch(userId: string) {
    this.logWithOptions("UI", `Fetched user dashboard for user ID: ${userId}`, userId);
  }

  static logDashboardLayoutUpdate(userId: string) {
    this.logWithOptions("UI", `Updated user dashboard layout for user ID: ${userId}`, userId);
  }

  static logWidgetsFetch(userId: string) {
    this.logWithOptions("UI", `Fetched widgets for user ID: ${userId}`, userId);
  }

  static logWidgetCustomization(userId: string, widgetId: string) {
    this.logWithOptions("UI", `Customized widget ${widgetId} for user ID: ${userId}`, userId);
  }

  static logThemeFetch(userId: string) {
    this.logWithOptions("UI", `Fetched themes for user ID: ${userId}`, userId);
  }

  static logThemeSwitch(userId: string, themeId: string) {
    this.logWithOptions("UI", `Switched theme to ${themeId} for user ID: ${userId}`, userId);
  }

  static logPreferencesFetch(userId: string) {
    this.logWithOptions("UI", `Fetched preferences for user ID: ${userId}`, userId);
  }

  static logPreferencesUpdate(userId: string) {
    this.logWithOptions("UI", `Updated preferences for user ID: ${userId}`, userId);
  }

  static logNotificationFetch(userId: string) {
    this.logWithOptions("UI", `Fetched notifications for user ID: ${userId}`, userId);
  }

  static logNotificationMarkAsRead(userId: string, notificationId: string) {
    this.logWithOptions("UI", `Marked notification ${notificationId} as read for user ID: ${userId}`, userId);
  }

  static logAllNotificationsClear(userId: string) {
    this.logWithOptions("UI", `Cleared all notifications for user ID: ${userId}`, userId);
  }

  static logMessagesFetch(userId: string) {
    this.logWithOptions("UI", `Fetched messages for user ID: ${userId}`, userId);
  }

  static logMessageSent(userId: string) {
    this.logWithOptions("UI", `Sent message for user ID: ${userId}`, userId);
  }

  static logDarkModeToggle(userId: string) {
    this.logWithOptions("UI", `Toggled dark mode for user ID: ${userId}`, userId);
  }

  static logAvatarFetch(userId: string) {
    this.logWithOptions("UI", `Fetched avatar for user ID: ${userId}`, userId);
  }

  static logAvatarUpdate(userId: string) {
    this.logWithOptions("UI", `Updated avatar for user ID: ${userId}`, userId);
  }

  static logSettingsFetch(userId: string) {
    this.logWithOptions("UI", `Fetched settings for user ID: ${userId}`, userId);
  }

  static logSettingsUpdate(userId: string) {
    this.logWithOptions("UI", `Updated settings for user ID: ${userId}`, userId);
  }
}


class AnimationLogger extends Logger {
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

  static generateID<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    prefix: string,
    name: string,
    type: NotificationType,
    dataDetails?: DataDetails<T, K>
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

  // Using generateID with default K inferred as T
  static generateTrackerID(
    name: string,
    type: NotificationTypeEnum,
    id?: string
  ): string {
    return UniqueIDGenerator.generateID("TRK", name, type, id, NotificationTypeEnum.GeneratedID);
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

class DataLogger extends Logger {
  static async log(message: string, data?: {}): Promise<void> {
    const { handleError } = useErrorHandling(); // Accessing the handleError function from the useErrorHandling hook

    try {
      const logUrl = this.getLogUrl("dataEvent");

      const response = await fetch(logUrl, {
        method: "POST",
        body: JSON.stringify({ message, data }), // Include data in the log if provided
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

    const logEvent = endpoints.logging?.[action]; // Access nested property using optional chaining

    if (typeof logEvent === "string") {
      logUrl = logEvent;
    } else if (typeof logEvent === "function") {
      logUrl = logEvent();
    } else {
      // Handle the case when logEvent is a nested object
      if (logEvent) {
        const logEventToFile = logEvent.logEventToFile; // Access property directly
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
          "logEventError" + error.message,
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
          "logEventError" + error.message,
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
          "logEventError" + error.message,
          "Error logging chat event.",
          NOTIFICATION_MESSAGES.Logger.LOG_ERROR,
          new Date(),
          error
        );
      });
  }
}



class FormLogger extends Logger {
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
          "logCollaborationEventError" + error.message,
          "Error logging collaboration event.",
          NOTIFICATION_MESSAGES.Logger.LOG_ERROR,
          new Date(),
          error
        );
      });
  }
}

class ComponentLogger extends Logger {
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
          "logDocumentEventError" + error.message,
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

  static logDocumentEvent(uniqueID: string, documentID: string) {
    let logDocumentEventUrl: string;

    if (typeof endpoints.logs.logDocumentEvent === "string") {
      // If it's a string, directly use the endpoint URL
      logDocumentEventUrl = endpoints.logs.logDocumentEvent;
    }
    if (typeof endpoints.logs.logDocumentEvent === "function") {
      // If it's a function, call it to get the endpoint
      logDocumentEventUrl = endpoints.logs.logDocumentEvent();
    }
    else {
      // Handle the case where it's neither a string nor a function
      throw new Error("Invalid log document event endpoint");
    }
  }

  static logDocument(message: string, uniqueID: string, documentID: string) {
    super.logWithOptions("Document", message, uniqueID);
    this.logDocumentEvent(uniqueID, documentID);
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

class TaskLogger<
  T extends BaseData<any>, 
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> extends Logger {
  static logTaskEvent<
    DataType extends BaseData<DataType>, 
    KeyType extends DataType = DataType,
    MetaType extends StructuredMetadata<DataType, KeyType> = StructuredMetadata<DataType, KeyType>
  >(
    taskID: Task<DataType, KeyType, MetaType>["id"],
    event: Task<DataType, KeyType, MetaType>,
    completionMessage: string,
    type: string,
    notify: (message: string, type: string, date: Date, id: string) => void,
    meta: Map<string, Snapshot<DataType, KeyType, MetaType>> & BaseData<any, any, any>
  ) {
    // Assuming you want to log the completion message

    // Define the completionMessageLog using LogData interface
    const completionMessageLog: LogData<DataType, KeyType> & Partial<NotificationData> = {
      timestamp: new Date(), // Set the current timestamp
      level: "INFO", // Specify the log level, e.g., INFO, WARNING, ERROR
      message: completionMessage, // Use the completionMessage provided as the log message
      user: null, // Optional: Include user information if available, set to null for now
      createdAt: new Date(), // Ensure createdAt is always defined as a Date
      date: new Date(), // Ensure date is always defined as a Date
      sent: new Date(),
      isSent: true,
      isDelivered: true,
      responded: false,
      delivered: new Date(),

      opened: new Date(),
      clicked: new Date(),
      responseTime: new Date(),

      eventData: {} as DefaultCalendarEvent,
      topics: [],
      highlights: [],
      files: [],
      meta: meta
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
    type: NotificationTypeEnum,
    notify: (message: string, type: string, date: Date, id: string) => void,
  ) {
    // Generate or retrieve the task ID
    const taskID = UniqueIDGenerator.generateTaskID(existingTaskId, taskName, type);

    // Additional logic specific to logging task completion
    const completionMessage = `Task ${taskID} has been completed.`;
    const event = {} as Task<BaseData<any>, BaseData<any>, StructuredMetadata<BaseData<any>, BaseData<any>>>;

    const meta = new Map<string, Snapshot<BaseData<any>, BaseData<any>, StructuredMetadata<BaseData<any>, BaseData<any>>>>();

    // Log the completion event
    TaskLogger.logTaskEvent(
      taskID,
      event,
      completionMessage,
      NOTIFICATION_MESSAGES.Tasks.COMPLETED,
      notify,
      meta
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
            "logCalendarEvent failed: " + error.message,
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

class WebLogger extends Logger {
  static async logWebEvent(action: string, message: string, data?: any) {
    try {
      const logUrl = this.getLogUrl(action);

      const response = await fetch(logUrl, {
        method: "POST",
        body: JSON.stringify({ action, message, data }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to log web event");
      }
    } catch (error: any) {
      console.error("Error logging web event:", error);

      // Handle the error accordingly
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





class ContentLogger extends Logger {
  static logTaskCompletion(taskId: string, userId: string) {
    throw new Error('Method not implemented.');
  }
  static logContentCreation(title: string, contentId: string, userId: string) {
    super.logWithOptions(
      "Content",
      `${title} created (Content ID: ${contentId}, User ID: ${userId})`,
      userId
    );
  }

  static logContentUpdate(title: string, contentId: string, userId: string, changes: string, upsert = false) {
    super.logWithOptions(
      "Content",
      `${title} updated (Content ID: ${contentId}, User ID: ${userId}, Changes: ${changes})`,
      userId
    );
  }

  static logContentDeletion(title: string, contentId: string, userId: string) {
    super.logWithOptions(
      "Content",
      `Content deleted (Content ID: ${contentId}, User ID: ${userId})`,
      userId
    );
  }

  static logTaskCreation(taskId: string, title: string, contentId: string, userId: string) {
    super.logWithOptions(
      "Content",
      `Task created (Task ID: ${taskId}, Title: ${title}, Content ID: ${contentId}, User ID: ${userId})`,
      userId
    );
  }

  static logTaskUpdate(taskId: string, title: string, contentId: string, userId: string, changes: string) {
    super.logWithOptions(
      "Content",
      `Task updated (Task ID: ${taskId}, Title: ${title}, Content ID: ${contentId}, User ID: ${userId}, Changes: ${changes})`,
      userId
    );
  }

  static logTaskEditing(taskId: string, userId: string) {
    super.logWithOptions(
      "Content",
      `Task updated (Task ID: ${taskId}, User ID: ${userId})`,
      userId
    );
  }

  static logTaskAssignment(taskId: string, userId: string) {
    super.logWithOptions(
      "Content",
      `Task assigned (Task ID: ${taskId}, User ID: ${userId})`,
      userId
    );
  }


  static logTaskReassignment(taskId: string, oldUserId: string, newUserId: string) {
    super.logWithOptions(
      "Content",
      `Task reassigned (Task ID: ${taskId}, Old User ID: ${oldUserId}, New User ID: ${newUserId})`,
      newUserId
    );
  }


  static logTaskDeletion(taskId: string, title: string, userId: string, contentId?: string) {
    super.logWithOptions(
      "Content",
      `Task deleted (Task ID: ${taskId}, Title: ${title}, Content ID: ${contentId}, User ID: ${userId})`,
      userId
    );
  }
  static logEventToFile(logType: string, message: string, fileName: string) {
    fs.appendFileSync(fileName, JSON.stringify({
      event: logType,
      data: message,
      timestamp: new Date()
    }) + '\n');
  }

  static logContentCompletion(title: string, contentId: string, userId: string) {
    super.logWithOptions(
      "Content",
      `${title} completed (Content ID: ${contentId}, User ID: ${userId})`,
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

  static logExchangeEvent(
    conversationId: string,
    event: string,
    userId: string
  ) {
    super.logWithOptions(
      "Exchange",
      `Event received (Conversation ID: ${conversationId}, Event: ${event}, User ID: ${userId})`,
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

}


class SecurityLogger extends Logger {
  static async logLoginAttempt(userId: string, success: boolean) {
    try {
      // Encrypt the user ID before logging
      const encryptedUserId = encryptData(userId, `${process.env.ENCRYPTION_KEY}`);
      super.logWithOptions(
        "Security",
        `Login attempt ${success ? "succeeded" : "failed"} (Encrypted User ID: ${encryptedUserId})`,
        userId
      );
    } catch (error: any) {
      console.error("Error logging login attempt:", error);
      // Handle the error accordingly
      throw error;
    }
  }

  static async logSuspiciousActivity(userId: string, activity: string) {
    try {
      // Encrypt the user ID before logging
      const encryptedUserId = encryptData(userId, `${process.env.ENCRYPTION_KEY}`);
      super.logWithOptions(
        "Security",
        `Suspicious activity detected: ${activity} (Encrypted User ID: ${encryptedUserId})`,
        userId
      );
    } catch (error: any) {
      console.error("Error logging suspicious activity:", error);
      // Handle the error accordingly
      throw error;
    }
  }

  static async logSuccessfulLogin(userId: string) {
    try {
      // Encrypt the user ID before logging
      const encryptedUserId = encryptData(userId, `${process.env.ENCRYPTION_KEY}`);
      super.logWithOptions(
        "Security",
        `Successful login (Encrypted User ID: ${encryptedUserId})`,
        userId
      );
    } catch (error: any) {
      console.error("Error logging successful login:", error);
      // Handle the error accordingly
      throw error;
    }
  }
  // Add more methods for other bug-related events as needed
}


class AssignBaseStoreLogger extends Logger {
  static async sendAssignmentNotification(userId: string, todoId: string): Promise<void> {
    try {
      const message = `User ${userId} has been assigned to Todo ${todoId}`;
      await this.logEvent("sendNotification", message, todoId, { userId });
    } catch (error) {
      console.error("Error sending assignment notification:", error);
      throw error;
    }
  }

  static async logAssignmentActivity(userId: string, todoId: string): Promise<void> {
    try {
      const message = `User ${userId} assigned to Todo ${todoId}`;
      await this.logEvent("logActivity", message, todoId, { userId });
    } catch (error) {
      console.error("Error logging assignment activity:", error);
      throw error;
    }
  }

  private static async logEvent(action: string, message: string, todoId: string, data?: any): Promise<void> {
    try {
      const logUrl = this.getLogUrl(action);
      await fetch(logUrl, {
        method: "POST",
        body: JSON.stringify({ action, message, todoId, data }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error(`Error logging ${action} event:`, error);
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

  static async logErrorToService(error: Error): Promise<void> {
    try {
      // Example: Send error details to a remote logging service
      const response = await fetch("https://example.com/logError", {
        method: "POST",
        body: JSON.stringify({ error: error.message, stack: error.stack }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to log error to service");
      }
    } catch (error) {
      console.error("Error logging error to service:", error);
      throw error;
    }
  }
}


class SnapshotLogger extends Logger {
  static async logSnapshotCreation(snapshotId: string, snapshotData: any): Promise<void> {
    try {
      await this.logEvent("createSnapshot", "Creating snapshot", snapshotId, snapshotData);
    } catch (error) {
      console.error("Error logging snapshot creation:", error);
      throw error;
    }
  }

  static async logSnapshotOperation(snapshotId: string, operation: string, data: any): Promise<void> {
    try {
      await this.logEvent("performOperation", `Performing operation ${operation}`, snapshotId, data);
    } catch (error) {
      console.error("Error logging snapshot operation:", error);
      throw error;
    }
  }

  static async logSnapshotUpdate(snapshotId: string, updatedData: any): Promise<void> {
    try {
      await this.logEvent("updateSnapshot", "Updating snapshot", snapshotId, updatedData);
    } catch (error) {
      console.error("Error logging snapshot update:", error);
      throw error;
    }
  }

  static async logSnapshotDeletion(snapshotId: string): Promise<void> {
    try {
      await this.logEvent("deleteSnapshot", "Deleting snapshot", snapshotId);
    } catch (error) {
      console.error("Error logging snapshot deletion:", error);
      throw error;
    }
  }

  private static async logEvent(action: string, message: string, snapshotId: string, data?: any): Promise<void> {
    try {
      const logUrl = this.getLogUrl(action);
      await fetch(logUrl, {
        method: "POST",
        body: JSON.stringify({ action, message, snapshotId, data }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error(`Error logging ${action} event:`, error);
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

  static async logErrorToService(error: Error): Promise<void> {
    try {
      // Example: Send error details to a remote logging service
      const response = await fetch("https://example.com/logError", {
        method: "POST",
        body: JSON.stringify({ error: error.message, stack: error.stack }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to log error to service");
      }
    } catch (error) {
      console.error("Error logging error to service:", error);
      throw error;
    }
  }
}


class ThemeLogger extends Logger {
  static logThemeUpdate(themeName: string, newTheme: Partial<Theme>) {
    const message = `Theme updated: ${themeName}`;
    super.log("Theme Update", message, newTheme);
    this.logThemeEvent("update", themeName, newTheme);
  }

  static logThemeReset(themeName: string) {
    const message = `Theme reset: ${themeName}`;
    super.log("Theme Reset", message);
    this.logThemeEvent("reset", themeName);
  }

  static logThemeSwitch(oldThemeName: string, newThemeName: string) {
    const message = `Theme switched from ${oldThemeName} to ${newThemeName}`;
    super.log("Theme Switch", message);
    this.logThemeEvent("switch", oldThemeName, { newThemeName });
  }

  static logThemeError(errorMessage: string, themeName?: string, extraInfo?: any) {
    const message = themeName
      ? `Theme error in ${themeName}: ${errorMessage}`
      : `Theme error: ${errorMessage}`;
    super.error(message, extraInfo);
  }

  private static logThemeEvent(
    eventType: string,
    themeName: string,
    details?: Partial<Theme>
  ) {
    let logThemeEventUrl: string = "";

    if (typeof endpoints.logs.logThemeEvent === "string") {
      logThemeEventUrl = endpoints.logs.logThemeEvent;
    } else if (typeof endpoints.logs.logThemeEvent === "function") {
      logThemeEventUrl = endpoints.logs.logThemeEvent();
    } else {
      // Handle the case when logThemeEvent is a nested object
      // Example: logThemeEventUrl = endpoints.logs.logThemeEvent.someNestedEndpoint;
      // or logThemeEventUrl = endpoints.logs.logThemeEvent.someNestedFunction();
    }

    fetch(logThemeEventUrl, {
      method: "POST",
      body: JSON.stringify({ eventType, themeName, details }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to log theme event");
        }
      })
      .catch((error) => {
        notify(
          "Error logging theme event",
          NOTIFICATION_MESSAGES.Logger.LOG_ERROR,
          createErrorNotificationContent,
          new Date(),
          error
        );
        console.error(error);
      });
  }
}


export default Logger;

export {
    AnalyticsLogger,
    AnimationLogger, AssignBaseStoreLogger, AudioLogger,
    BugLogger,
    CalendarLogger,
    ChannelLogger,
    ChatLogger,
    CollaborationLogger,
    CommunityLogger,
    ComponentLogger,
    ConfigLogger,
    ContentLogger, createErrorNotificationContent, DataLogger,
    DexLogger,
    DocumentLogger, errorLogger, ErrorLogger,
    ExchangeLogger,
    FileLogger,
    FormLogger,
    IntegrationLogger,
    PaymentLogger,
    SearchLogger,
    SecurityLogger, SnapshotLogger, TaskLogger,
    TeamLogger,
    TenantLogger, ThemeLogger, UILogger, VideoLogger,
    WebLogger
};

