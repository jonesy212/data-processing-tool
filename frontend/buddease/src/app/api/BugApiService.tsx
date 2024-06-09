BugApiService

import axiosInstance from './axiosInstance'; // Assuming you have an axios instance configured
import { endpoints } from './endpoints'; // Assuming you have defined endpoints
import { handleApiError } from './errorHandler'; // Assuming you have an error handler function
import { ClientNotificationMessages, NOTIFICATION_MESSAGES } from './notificationMessages'; // Assuming you have notification messages defined
import { NotificationType } from './types'; // Assuming you have defined NotificationType

const API_BASE_URL = endpoints.client;

class BugApiService {
  notify: (
    id: string,
    message: string,
    data: any,
    date: Date,
    type: NotificationType
  ) => void;

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
  }

  private async requestHandler(
    request: () => Promise<AxiosResponse>,
    errorMessage: string,
    successMessageId: keyof ClientNotificationMessages,
    errorMessageId: string,
    notificationData: any = null
  ): Promise<AxiosResponse> {
    try {
      const response: AxiosResponse = await request();

      if (successMessageId) {
        const successMessage = clientNotificationMessages[successMessageId];
        this.notify(
          successMessageId,
          successMessage,
          notificationData,
          new Date(),
          "ClientSuccess" as NotificationType
        );
      }

      return response;
    } catch (error: any) {
      handleApiError(error as AxiosError<unknown>, errorMessage);

      if (errorMessageId) {
        const errorMessage =
          {} as ClientNotificationMessages[keyof ClientNotificationMessages];
        this.notify(
          errorMessageId,
          errorMessage,
          notificationData,
          new Date(),
          "ClientError" as NotificationType
        );
      }
      throw error;
    }
  }

  async fetchBugs(): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.get(`${API_BASE_URL}/bugs`),
      "FetchBugsError",
      "Failed to fetch bugs" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Bug.FETCH_BUGS_ERROR
    );
  }

  // Add more methods for handling bug-related API requests

  // Example method:
  async createBug(bugData: any): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`${API_BASE_URL}/bugs`, bugData),
      "CreateBugError",
      "Failed to create bug" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Bug.CREATE_BUG_ERROR
    );
  }
}

export default BugApiService;
