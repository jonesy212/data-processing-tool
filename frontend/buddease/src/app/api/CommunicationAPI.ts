// CommunicationAPI.ts
import { NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';
import { AxiosError } from 'axios';
import { handleApiError } from './ApiLogs';
import axiosInstance from './axiosInstance';



interface CommunicationNotificationMessage {
    SEND_MESSAGE_SUCCESS: string;
    SEND_MESSAGE_ERROR: string;
    // Add more notification messages as needed
  }
  
  const apiNotificationMessages: CommunicationNotificationMessage = {
    SEND_MESSAGE_SUCCESS: 'Message sent successfully.',
    SEND_MESSAGE_ERROR: 'Failed to send message. Please try again later.',
    // Add more notification messages here
  };
  
class CommunicationAPI {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

    
  private handleCommunicationApiErrorAndNotify = (
    error: AxiosError<unknown>,
    errorMessage: string,
    errorMessageId: keyof CommunicationNotificationMessage
  ) => {
    handleApiError(error, errorMessage);
    if (apiNotificationMessages[errorMessageId]) {
      useNotification().notify(
        errorMessageId,
        apiNotificationMessages[errorMessageId],
        null,
        new Date(),
        "CommunicationError" as NotificationTypeEnum
      );
    }
  };

  sendMessage = async (recipient: string, message: string): Promise<void> => {
    try {
      await axiosInstance.post(`${this.baseURL}/send-message`, { recipient, message });
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = 'Failed to send message';
      this.handleCommunicationApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'SEND_MESSAGE_ERROR'
      );
      throw error;
    }
  };

  // Additional methods for managing notifications, handling errors, etc. can be added here
}

// Example usage
const communicationAPI = new CommunicationAPI('https://api.communication.com');

// Send a message
communicationAPI.sendMessage('user@example.com', 'Hello!');
export default CommunicationAPI