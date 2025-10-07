// ApiTrade.ts
import axiosInstance from "@/app/api/csrfToken";
import { endpoints } from "@/app/api/endpointConfigurations";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { NotificationType, NotificationTypeEnum, useNotification } from "@/context/NotificationContext";
import { AxiosError, AxiosResponse } from "axios";
import { observable } from "mobx";
import { handleApiError } from "./ApiLogs";

const API_BASE_URL = endpoints.apiConfig

const notificationContext = useNotification();

// Example values for the Message object
const generateUniqueID = UniqueIDGenerator.generateMessageID()

export const tradeApi = observable({
  notificationContext: {
   // Inside the tradeApi object
        notify: async (id: string, title: string, message: string, date: Date, type: string) => {
            try {
                // Access the notification context
                const notificationContext = useNotification();
  
                // Determine the NotificationType based on the provided type string
                let notificationType: NotificationType;
                switch (type) {
                    case "success":
                        notificationType = NotificationTypeEnum.APISuccess
                        break;
                    case "error":
                        notificationType = NotificationTypeEnum.ApiError;
                        break;
                    case "info":
                        notificationType = NotificationTypeEnum.INFO;
                        break;
                    default:
                        notificationType = NotificationTypeEnum.INFO; // Default to Info type if type is not recognized
                        break;
                }
          
                // Show the notification using the appropriate function from the notification context
                notificationContext.notify(id, title, message, date, notificationType);
            } catch (error) {
                console.error("Failed to show notification:", error);
            }
        }
  },

  getRecentTrades: async (): Promise<AxiosResponse> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(`${API_BASE_URL}/trades/recent`);
      return response;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to fetch recent trades");
      throw error;
    }
  },

  // Add more functions for other trade-related API requests as needed
});
