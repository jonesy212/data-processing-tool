// Logger.ts
import { endpoints } from "@/app/api/ApiEndpoints";
import { LogData } from "@/app/components/models/LogData";
import { Task } from "@/app/components/models/tasks/Task";
import { NotificationData } from "@/app/components/support/NofiticationsSlice";
import {
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";

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
  static log(type: string, message: string, uniqueID: string) {
    // You can implement different logging mechanisms based on the type
    console.log(`[${type}] ${message} (ID: ${uniqueID})`);
  }

  static logSessionEvent(sessionID: string, event: string) {
    // Assuming 'logs' is imported from apiEndpoints.ts
    fetch(endpoints.logs.logSession as "Request", {
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
          "'Error logging session event ",
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
    this.log("User Activity", `${action} (User ID: ${userId})`, userId);
  }

  static logCommunication(type: string, message: string, userId: string) {
    this.log(
      "Communication",
      `${type}: ${message} (User ID: ${userId})`,
      userId
    );
  }

  static logProjectPhase(phase: string, projectId: string) {
    this.log("Project Phase", `${phase} (Project ID: ${projectId})`, projectId);
  }

  static logCommunityInteraction(action: string, userId: string) {
    this.log("Community Interaction", `${action} (User ID: ${userId})`, userId);
  }

  static logMonetizationEvent(event: string, projectId: string) {
    this.log(
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
    super.log("Audio", message, uniqueID);
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


// Extend Logger for video logs
class VideoLogger extends Logger {
  static logVideo(
    message: string,
    uniqueID: string,
    videoID: string,
    duration: number
  ) {
    super.log("Video", message, uniqueID);
    this.logVideoEvent(uniqueID, videoID, duration);
  }
  
  private static logVideoEvent(
    uniqueID: string,
    videoID: string,
    duration: number
  ) {
 
    const logVideoEventUrl: string =
      typeof endpoints.logs.logVideoEvent === "function"
        ? endpoints.logs.logVideoEvent()
        : endpoints.logs.logVideoEvent;

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
    super.log("Channel", message, uniqueID);
    this.logChannelEvent(uniqueID, channelID);
  }

  private static logChannelEvent(uniqueID: string, channelID: string) {
    const logChannelEventUrl: string =
      typeof endpoints.logs.logChannelEvent === "function"
        ? endpoints.logs.logChannelEvent()
        : endpoints.logs.logChannelEvent;

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

class CollaborationLogger extends Logger {
  static logCollaboration(
    message: string,
    uniqueID: string,
    collaborationID: string
  ) {
    super.log("Collaboration", message, uniqueID);
    this.logCollaborationEvent(uniqueID, collaborationID);
  }

  private static logCollaborationEvent(
    uniqueID: string,
    collaborationID: string
  ) {
    const logCollaborationEventUrl: string =
      typeof endpoints.logs.logCollaborationEvent === "function"
        ? endpoints.logs.logCollaborationEvent()
        : endpoints.logs.logCollaborationEvent;

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

class DocumentLogger extends Logger {
  static logDocument(message: string, uniqueID: string, documentID: string) {
    super.log("Document", message, uniqueID);
    this.logDocumentEvent(uniqueID, documentID);
  }

  private static logDocumentEvent(uniqueID: string, documentID: string) {
    const logDocumentEventUrl: string =
      typeof endpoints.logs.logDocumentEvent === "function"
        ? endpoints.logs.logDocumentEvent()
        : endpoints.logs.logDocumentEvent;

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
      // Define a function to call notify with the appropriate arguments
      // const notifyCallback = () => {
      //   notify("Success",
      //     NOTIFICATION_MESSAGES.Logger.LOG_INFO,
      //     new Date(),
      //     String(taskID));
      // };

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

  static logTaskAssigned(taskID: string, assignedTo: string) {
    super.log(
      "Task Assigned",
      `Task ${taskID} assigned to ${assignedTo}`,
      taskID
    );
    // Additional logic specific to logging task assignment
  }

  static logTaskUnassigned(taskID: string) {
    super.log("Task Unassigned", `Task ${taskID} unassigned`, taskID);
    // Additional logic specific to logging task unassignment
  }

  static logTaskReassigned(taskID: string, reassignedTo: string) {
    super.log(
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
    super.log("Calendar", message, uniqueID);
    this.logCalendarEventEvent(uniqueID, eventID);
  }

  private static logCalendarEventEvent(uniqueID: string, eventID: string) {
    const logCalendarEventUrl =
      typeof endpoints.logs.logCalendarEvent === "function"
        ? endpoints.logs.logCalendarEvent()
        : endpoints.logs.logCalendarEvent;

    fetch(logCalendarEventUrl, {
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
  }
}

class TenantLogger extends Logger {
  static logUserRegistration(userId: string) {
    super.log("Tenant", `User registration (User ID: ${userId})`, userId);
  }

  static logUserLogin(userId: string) {
    super.log("Tenant", `User login (User ID: ${userId})`, userId);
  }

  static logUserLogout(userId: string) {
    super.log("Tenant", `User logout (User ID: ${userId})`, userId);
  }

  // Add more methods for other tenant-related events as needed
}

class AnalyticsLogger extends Logger {
  static logPageView(pageName: string, userId: string) {
    super.log(
      "Analytics",
      `Page view: ${pageName} (User ID: ${userId})`,
      userId
    );
  }

  static logInteraction(featureName: string, userId: string) {
    super.log(
      "Analytics",
      `User interaction: ${featureName} (User ID: ${userId})`,
      userId
    );
  }

  // Add more methods for other analytics-related events as needed
}

class PaymentLogger extends Logger {
  static logTransaction(transactionId: string, amount: number, userId: string) {
    super.log(
      "Payment",
      `Transaction ${transactionId}: $${amount} (User ID: ${userId})`,
      userId
    );
  }

  static logSubscriptionRenewal(subscriptionId: string, userId: string) {
    super.log(
      "Payment",
      `Subscription ${subscriptionId} renewed (User ID: ${userId})`,
      userId
    );
  }

  // Add more methods for other payment-related events as needed
}

class SecurityLogger extends Logger {
  static logLoginAttempt(userId: string, success: boolean) {
    super.log(
      "Security",
      `Login attempt ${success ? "succeeded" : "failed"} (User ID: ${userId})`,
      userId
    );
  }

  static logSuspiciousActivity(userId: string, activity: string) {
    super.log(
      "Security",
      `Suspicious activity detected: ${activity} (User ID: ${userId})`,
      userId
    );
  }

  // Add more methods for other security-related events as needed
}

class ContentLogger extends Logger {
  static logContentCreation(contentId: string, userId: string) {
    super.log(
      "Content",
      `Content created (Content ID: ${contentId}, User ID: ${userId})`,
      userId
    );
  }

  static logContentDeletion(contentId: string, userId: string) {
    super.log(
      "Content",
      `Content deleted (Content ID: ${contentId}, User ID: ${userId})`,
      userId
    );
  }

  // Add more methods for other content-related events as needed
}

class IntegrationLogger extends Logger {
  static logAPIRequest(requestId: string, endpoint: string) {
    super.log(
      "Integration",
      `API request sent (Request ID: ${requestId}, Endpoint: ${endpoint})`,
      requestId
    );
  }

  static logAPIResponse(requestId: string, statusCode: number) {
    super.log(
      "Integration",
      `API response received (Request ID: ${requestId}, Status Code: ${statusCode})`,
      requestId
    );
  }

  // Add more methods for other integration-related events as needed
}

class ErrorLogger extends Logger {
  static logError(errorMessage: string, errorDetails: any) {
    super.log(
      "Error",
      `${errorMessage} (Details: ${JSON.stringify(errorDetails)})`,
      "N/A"
    );
  }

  // Add more methods for other error-related events as needed
}

class CommunityLogger extends Logger {
  static logPost(userId: string, postId: string) {
    super.log(
      "Community",
      `User ${userId} posted (Post ID: ${postId})`,
      userId
    );
  }

  static logComment(userId: string, commentId: string) {
    super.log(
      "Community",
      `User ${userId} commented (Comment ID: ${commentId})`,
      userId
    );
  }

  static logLike(userId: string, likedItemId: string) {
    super.log(
      "Community",
      `User ${userId} liked (Item ID: ${likedItemId})`,
      userId
    );
  }

  // Add more methods for other community-related events as needed
}

export default Logger;

export {
  AnalyticsLogger,
  AudioLogger,
  CalendarLogger,
  ChannelLogger,
  CollaborationLogger,
  CommunityLogger,
  ContentLogger,
  DocumentLogger,
  ErrorLogger,
  IntegrationLogger,
  PaymentLogger,
  SecurityLogger,
  TaskLogger,
  TenantLogger,
  VideoLogger,
};
