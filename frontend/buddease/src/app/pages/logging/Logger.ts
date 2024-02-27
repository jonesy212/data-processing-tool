// Logger.ts
import { endpoints } from "@/app/api/ApiEndpoints";
import LogData from "@/app/components/models/LogData";
import { Task } from "@/app/components/models/tasks/Task";
import { NotificationData } from '@/app/components/support/NofiticationsSlice';
import { NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
const { notify } = useNotification();



const errorLogger = {
  error: (errorMessage: string, extraInfo: any) => {
    console.error(errorMessage, extraInfo);
    notify(
      "Error occurred",
      NOTIFICATION_MESSAGES.Logger.LOG_ERROR,
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
    fetch(endpoints.logs.logSession, {
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
      .catch((error:any) => {
        notify(
          "'Error logging session event ",
          NOTIFICATION_MESSAGES.Logger.LOG_ERROR,
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
    fetch(endpoints.logs.logAudioEvent, {
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
    // Additional video logging logic specific to the project management app
    fetch(endpoints.logs.logVideoEvent, {
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

// Extend Logger for communication channels logs
class ChannelLogger extends Logger {
  static logChannel(message: string, uniqueID: string, channelID: string) {
    super.log("Channel", message, uniqueID);
    this.logChannelEvent(uniqueID, channelID);
  }

  private static logChannelEvent(uniqueID: string, channelID: string) {
    fetch(endpoints.logs.logChannelEvent, {
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
    fetch(endpoints.logs.logCollaborationEvent, {
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
    fetch(endpoints.logs.logDocumentEvent, {
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
        console.error("Error logging document event:", error);
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
      const notifyCallback = () => {
        notify("Success", NOTIFICATION_MESSAGES.Logger.LOG_INFO, new Date(), String(taskID));
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
    const taskID = UniqueIDGenerator.generateTaskID(
      existingTaskId,
      taskName,
      notify
    );

    // Additional logic specific to logging task completion
    const completionMessage = `Task ${taskID} has been completed.`;
    const event = {} as  Task
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
    fetch(endpoints.logs.logCalendarEvent, {
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

export default Logger;

export {
  AudioLogger,
  CalendarLogger,
  ChannelLogger,
  CollaborationLogger,
  DocumentLogger,
  TaskLogger,
  VideoLogger
};

