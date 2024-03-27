// NotificationsService.ts
import { NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext";
import { NotificationData } from "../components/support/NofiticationsSlice";
import NOTIFICATION_MESSAGES from "../components/support/NotificationMessages";
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
    type: NotificationTypeEnum
  ) => void;
  notificationMessages: ApiNotificationMessages;

  constructor(
    notify: (
      id: string,
      message: string,
      data: any,
      date: Date,
      type: NotificationTypeEnum
    ) => void
  ) {
    this.notify = notify;
    this.notificationMessages = {
      FETCH_NOTIFICATIONS_SUCCESS: "Notifications fetched successfully",
      FETCH_NOTIFICATIONS_ERROR: "Failed to fetch notifications",
      // Add more notification messages as needed
    };
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

    



    
  async sendPhaseNotification(phase: string, projectId: string, userId: string): Promise<void> {
    const message = `Project ${projectId} has entered ${phase} phase`;
    await this.sendNotification(message, userId, NotificationTypeEnum.Info);
  }

  async sendCollaboratorNotification(action: string, projectId: string, userId: string): Promise<void> {
    const message = `You have ${action === 'join' ? 'joined' : 'left'} project ${projectId}`;
    await this.sendNotification(message, userId, NotificationTypeEnum.Info);
  }

  async sendTaskAssignmentNotification(task: string, projectId: string, userId: string): Promise<void> {
    const message = `You have been assigned task "${task}" in project ${projectId}`;
    await this.sendNotification(message, userId, NotificationTypeEnum.Info);
  }

  async sendDeadlineReminder(deadline: string, projectId: string, userId: string): Promise<void> {
    const message = `Deadline for project ${projectId}: ${deadline} is approaching`;
    await this.sendNotification(message, userId, NotificationTypeEnum.Warning);
  }

  async sendFeedbackNotification(projectId: string, reviewerId: string, userId: string): Promise<void> {
    const message = `Feedback provided on your work in project ${projectId} by user ${reviewerId}`;
    await this.sendNotification(message, userId, NotificationTypeEnum.Info);
  }

  async sendCollaborationNotification(projectId: string, userId: string): Promise<void> {
    const message = `Real-time collaboration ongoing on project ${projectId}`;
    await this.sendNotification(message, userId, NotificationTypeEnum.Info);
  }

  async sendEventNotification(event: string, projectId: string, userId: string): Promise<void> {
    const message = `Upcoming event: ${event} in project ${projectId}`;
    await this.sendNotification(message, userId, NotificationTypeEnum.Info);
  }

  async sendAchievementNotification(achievement: string, userId: string): Promise<void> {
    const message = `Congratulations! You have achieved ${achievement}`;
    await this.sendNotification(message, userId, NotificationTypeEnum.Success);
  }

  async sendIntegrationNotification(integration: string, userId: string): Promise<void> {
    const message = `Integration with ${integration} has been updated`;
    await this.sendNotification(message, userId, NotificationTypeEnum.Info);
  }

  async sendMaintenanceNotification(maintenance: string, userId: string): Promise<void> {
    const message = `Scheduled maintenance: ${maintenance}`;
    await this.sendNotification(message, userId, NotificationTypeEnum.Info);
  }

  private async sendNotification(message: string, userId: string, type: NotificationTypeEnum): Promise<void> {
      // Assuming implementation for sending notification to user with userId
      this.notify(
        "newNotification",
        message,
        {userId, message},
        new Date(),
        type
      );

  }

  // Add more methods for other notification-related operations

}

// Export an instance of the API service
const apiNotificationsService = new ApiNotificationsService(useNotification);
export default apiNotificationsService;
