// NotificationsService.ts
import { endpoints } from "@/app/api/endpointConfigurations";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "@/app/context/NotificationContext";
import { Attachment } from '@/app/documents/attachment/Attachment';
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { NotificationData } from "@/app/state/redux/slices/NofiticationsSlice";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';

// Define API base URL
const API_BASE_URL = endpoints.notifications;

// Define notification messages for API operations
interface ApiNotificationMessages {
  FETCH_NOTIFICATIONS_SUCCESS: string;
  FETCH_NOTIFICATIONS_ERROR: string;
}

class ApiNotificationsService<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
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

  async fetchNotifications(): Promise<NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`);
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = await response.json();
      data.forEach((notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        this.notify(
          notification.id || "unknown-notification-id",
          this.notificationMessages.FETCH_NOTIFICATIONS_SUCCESS,
          NOTIFICATION_MESSAGES.Fetch_Notification_Defaults,
          new Date(),
          NotificationTypeEnum.INFO
        );
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      this.notify(
        "fetchNotificationsError",
        this.notificationMessages.FETCH_NOTIFICATIONS_ERROR,
        NOTIFICATION_MESSAGES.Fetch_Notification_Defaults,
        new Date(),
        NotificationTypeEnum.ERROR
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
      NotificationTypeEnum.INFO
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
    await this.sendNotification(message, userId, new Date(), NotificationTypeEnum.INFO);
  }

  async sendTaskAssignmentNotification(
    task: string,
    projectId: string,
    userId: string
  ): Promise<void> {
    const message = `You have been assigned task "${task}" in project ${projectId}`;
    await this.sendNotification(message, userId, new Date(), NotificationTypeEnum.INFO);
  }

  async sendDeadlineReminder(
    deadline: string,
    projectId: string,
    userId: string
  ): Promise<void> {
    const message = `Deadline for project ${projectId}: ${deadline} is approaching`;
    await this.sendNotification(message, userId, new Date(), NotificationTypeEnum.WARNING);
  }

  async sendFeedbackNotification(
    projectId: string,
    reviewerId: string,
    userId: string
  ): Promise<void> {
    const message = `Feedback provided on your work in project ${projectId} by user ${reviewerId}`;
    await this.sendNotification(message, userId, new Date(), NotificationTypeEnum.INFO);
  }

  async sendCollaborationNotification(
    projectId: string,
    userId: string
  ): Promise<void> {
    const message = `Real-time collaboration ongoing on project ${projectId}`;
    await this.sendNotification(message, userId, new Date(), NotificationTypeEnum.INFO);
  }

  async sendEventNotification(
    event: string,
    projectId: string,
    userId: string
  ): Promise<void> {
    const message = `Upcoming event: ${event} in project ${projectId}`;
    await this.sendNotification(message, userId, new Date(), NotificationTypeEnum.INFO);
  }

  async sendAchievementNotification(
    achievement: string,
    userId: string
  ): Promise<void> {
    const message = `Congratulations! You have achieved ${achievement}`;
    await this.sendNotification(message, userId, new Date(), NotificationTypeEnum.SUCCESS);
  }

  async sendIntegrationNotification(
    integration: string,
    userId: string
  ): Promise<void> {
    const message = `Integration with ${integration} has been updated`;
    await this.sendNotification(message, userId, new Date(), NotificationTypeEnum.INFO);
  }

  async sendMaintenanceNotification(
    maintenance: string,
    userId: string
  ): Promise<void> {
    const message = `Scheduled maintenance: ${maintenance}`;
    await this.sendNotification(message, userId, new Date(), NotificationTypeEnum.INFO);
  }

  private async sendNotification(
    eventType: string,
    eventData: any,
    date: Date,
    type: NotificationType
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
    type: NotificationType
  ) => Promise<void> {
    return async (
      eventType,
      eventData,
      date: Date,
      type: NotificationType
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
