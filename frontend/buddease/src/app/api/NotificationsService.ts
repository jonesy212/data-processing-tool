// NotificationsService.ts
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { NotificationData } from "../components/support/NofiticationsSlice";
import { endpoints } from "./ApiEndpoints";
// Define API base URL
const API_BASE_URL = endpoints.notifications;

// Define notification messages for API operations
interface ApiNotificationMessages {
  FETCH_NOTIFICATIONS_SUCCESS: string;
  FETCH_NOTIFICATIONS_ERROR: string;
}

class ApiNotificationsService {
  notify: (
    id: string,
    message: string,
    data: any,
    date: Date,
    type: NotificationType
  ) => void;
  notificationMessages: ApiNotificationMessages;

  constructor(
    notify: (
      id: string,
      message: string,
      data: any,
      date: Date,
      type: NotificationType
    ) => void
  ) {
    this.notify = notify;
    this.notificationMessages = {
      FETCH_NOTIFICATIONS_SUCCESS: "Notifications fetched successfully",
      FETCH_NOTIFICATIONS_ERROR: "Failed to fetch notifications",
      // Add more notification messages as needed
    };
  }

  async error(messageKey: keyof typeof NOTIFICATION_MESSAGES) {
    const errorMessage = this.resolveErrorMessage(messageKey);
    if (!errorMessage) {
      throw new Error(`Notification message key '${messageKey}' not found.`);
    }
  }

  private resolveErrorMessage(
    messageKey: keyof typeof NOTIFICATION_MESSAGES
  ): string {
    // Ensure messageKey is a string before splitting
    const messageKeyString = messageKey as string;

    // Resolve the error message by traversing the nested objects using the messageKey
    const keys = messageKeyString.split(".");
    let errorMessage: any = this.notificationMessages;
    for (const key of keys) {
      errorMessage = errorMessage[key];
      if (typeof errorMessage !== "object") {
        break;
      }
    }
    return errorMessage as string;
  }

  async fetchNotifications(): Promise<NotificationData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`);
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data: NotificationData[] = await response.json();
      data.forEach((notification: NotificationData) => {
        this.notify(
          notification.id,
          this.notificationMessages.FETCH_NOTIFICATIONS_SUCCESS,
          NOTIFICATION_MESSAGES.Fetch_Notification_Defaults
            .FETCH_NOTIFICATIONS_SUCCESS,
          new Date(),
          NotificationTypeEnum.Info
        );
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      this.notify(
        "fetchNotificationsError",
        this.notificationMessages.FETCH_NOTIFICATIONS_ERROR,
        NOTIFICATION_MESSAGES.Fetch_Notification_Defaults
          .FETCH_NOTIFICATIONS_ERROR,
        new Date(),
        NotificationTypeEnum.Error
      );
    }
    return []; // Return an empty array in case of error
  }


  async sendPhaseNotification(
    phase: string,
    projectId: string,
    userId: string
  ): Promise<void> {
    const message = `Project ${projectId} has entered ${phase} phase`;
    await this.sendNotification(
      message,
      userId,
      new Date(),
      NotificationTypeEnum.Info
    );
  }

  async sendCollaboratorNotification(
    action: string,
    projectId: string,
    userId: string
  ): Promise<void> {
    const message = `You have ${
      action === "join" ? "joined" : "left"
    } project ${projectId}`;
    await this.sendNotification(message, userId, new Date(), NotificationTypeEnum.Info);
  }

  async sendTaskAssignmentNotification(
    task: string,
    projectId: string,
    userId: string
  ): Promise<void> {
    const message = `You have been assigned task "${task}" in project ${projectId}`;
    await this.sendNotification(message, userId, new Date(), NotificationTypeEnum.Info);
  }

  async sendDeadlineReminder(
    deadline: string,
    projectId: string,
    userId: string
  ): Promise<void> {
    const message = `Deadline for project ${projectId}: ${deadline} is approaching`;
    await this.sendNotification(message, userId, new Date(), NotificationTypeEnum.Warning);
  }

  async sendFeedbackNotification(
    projectId: string,
    reviewerId: string,
    userId: string
  ): Promise<void> {
    const message = `Feedback provided on your work in project ${projectId} by user ${reviewerId}`;
    await this.sendNotification(message, userId, new Date(), NotificationTypeEnum.Info);
  }

  async sendCollaborationNotification(
    projectId: string,
    userId: string
  ): Promise<void> {
    const message = `Real-time collaboration ongoing on project ${projectId}`;
    await this.sendNotification(message, userId, new Date(), NotificationTypeEnum.Info);
  }

  async sendEventNotification(
    event: string,
    projectId: string,
    userId: string
  ): Promise<void> {
    const message = `Upcoming event: ${event} in project ${projectId}`;
    await this.sendNotification(message, userId, new Date(), NotificationTypeEnum.Info);
  }

  async sendAchievementNotification(
    achievement: string,
    userId: string
  ): Promise<void> {
    const message = `Congratulations! You have achieved ${achievement}`;
    await this.sendNotification(message, userId, new Date(), NotificationTypeEnum.Success);
  }

  async sendIntegrationNotification(
    integration: string,
    userId: string
  ): Promise<void> {
    const message = `Integration with ${integration} has been updated`;
    await this.sendNotification(message, userId, new Date(), NotificationTypeEnum.Info);
  }

  async sendMaintenanceNotification(
    maintenance: string,
    userId: string
  ): Promise<void> {
    const message = `Scheduled maintenance: ${maintenance}`;
    await this.sendNotification(message, userId, new Date(), NotificationTypeEnum.Info);
  }

  private async sendNotification(
    eventType: string,
    eventData: any,
    date: Date,
    type: NotificationTypeEnum
  ): Promise<void> {
    // Assuming implementation for sending notification
    this.notify(
      "newNotification",
      eventType,
      eventData,
      date,
      type
    );
  }


  // Define a getter method to access the sendNotification method
  public get sentNotification(): (
    eventType: string,
    eventData: any,
    date: Date,
    type: NotificationTypeEnum
  ) => Promise<void> {
    return async (
      eventType,
      eventData,
      date: Date,
      type: NotificationTypeEnum
    ) => {
      return this.sendNotification(
        eventType,
        eventData,
        new Date(),
        type
      );
    };
  }

  // Additional methods can be defined here

  // Add more methods for other notification-related operations
}

// Export an instance of the API service
const apiNotificationsService = new ApiNotificationsService(useNotification);
export default apiNotificationsService;
export { ApiNotificationsService };
