// ApiAnalysisService.tsx
import { AxiosError, AxiosResponse } from "axios";
import { NotificationType } from "../components/support/NotificationContext";
import { sendNotification } from "../components/users/UserSlice";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import axiosInstance from "./axiosInstance";


const ANALYSIS_API_URL = endpoints.analysis;
class ApiAnalysisService {
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

  private async requestHandler<T>(
    request: () => Promise<AxiosResponse<T>>,
    errorMessage: string,
    successMessage: string,
    notificationId: string,
    notificationData: any = null
  ): Promise<AxiosResponse<T>> {
    try {
      const response = await request();

      // Handle headers or other response data if needed

      this.notify(
        notificationId,
        successMessage,
        notificationData,
        new Date(),
        "ClientSuccess" as NotificationType
      );

      return response;
    } catch (error: any) {
      handleApiError(error as AxiosError<unknown>, errorMessage);

      this.notify(
        notificationId,
        errorMessage,
        notificationData,
        new Date(),
        "ClientError"  as NotificationType
      );

      throw error;
    }
  }

  async performSentimentAnalysis(text: string): Promise<AxiosResponse<any>> {
    return await this.requestHandler(
      () => axiosInstance.post(`${ANALYSIS_API_URL}`, { text }),
      "Failed to perform sentiment analysis",
      "Sentiment analysis performed successfully",
      "PERFORM_SENTIMENT_ANALYSIS_ERROR",
      { text }
    );
  }
  
  async performDescriptiveAnalysis(text: string): Promise < AxiosResponse < any >> {
      return await this.requestHandler(
      () => axiosInstance.post(`${ANALYSIS_API_URL}/descriptive`, { text }),
      "Failed to perform descriptive analysis",
      "Descriptive analysis performed successfully",
      "PERFORM_DESCRIPTIVE_ANALYSIS_ERROR",
      { text }
    );
  }
  // Add more analysis methods as needed
}


export default ApiAnalysisService;
export const apiAnalysisService = new ApiAnalysisService(
  (id, message, data, date, type) => {
    // Implement the logic to send notifications here
    sendNotification(`Notification sent: ${message}`);
  }
);
