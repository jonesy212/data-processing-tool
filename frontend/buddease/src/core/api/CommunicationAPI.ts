// CommunicationAPI.ts

import internalApiService from "@/core/api/ApiClient";
import { handleApiError } from '@/core/api/ApiLogs';
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useNotification } from '@/core/state/context/NotificationContext';
import { AxiosError } from 'axios';


// CommunicationNotificationMessage interface example
interface CommunicationNotificationMessage {
  // Messaging operations
  SEND_MESSAGE_SUCCESS: string;
  SEND_MESSAGE_ERROR: string;
  RECEIVE_MESSAGE_SUCCESS: string;
  RECEIVE_MESSAGE_ERROR: string;
  DELETE_MESSAGE_SUCCESS: string;
  DELETE_MESSAGE_ERROR: string;
  EDIT_MESSAGE_SUCCESS: string;
  EDIT_MESSAGE_ERROR: string;
  
  // Conversation operations
  CREATE_CONVERSATION_SUCCESS: string;
  CREATE_CONVERSATION_ERROR: string;
  JOIN_CONVERSATION_SUCCESS: string;
  JOIN_CONVERSATION_ERROR: string;
  LEAVE_CONVERSATION_SUCCESS: string;
  LEAVE_CONVERSATION_ERROR: string;
  ARCHIVE_CONVERSATION_SUCCESS: string;
  ARCHIVE_CONVERSATION_ERROR: string;
  
  // Channel operations
  CREATE_CHANNEL_SUCCESS: string;
  CREATE_CHANNEL_ERROR: string;
  SUBSCRIBE_CHANNEL_SUCCESS: string;
  SUBSCRIBE_CHANNEL_ERROR: string;
  UNSUBSCRIBE_CHANNEL_SUCCESS: string;
  UNSUBSCRIBE_CHANNEL_ERROR: string;
  
  // Notification operations
  SEND_NOTIFICATION_SUCCESS: string;
  SEND_NOTIFICATION_ERROR: string;
  MARK_NOTIFICATION_READ_SUCCESS: string;
  MARK_NOTIFICATION_READ_ERROR: string;
  CLEAR_NOTIFICATIONS_SUCCESS: string;
  CLEAR_NOTIFICATIONS_ERROR: string;
  
  // Presence/Status operations
  UPDATE_PRESENCE_SUCCESS: string;
  UPDATE_PRESENCE_ERROR: string;
  GET_PRESENCE_SUCCESS: string;
  GET_PRESENCE_ERROR: string;
}

const apiNotificationMessages: CommunicationNotificationMessage = {
  // Messaging operations
  SEND_MESSAGE_SUCCESS: "Message sent successfully",
  SEND_MESSAGE_ERROR: "Failed to send message",
  RECEIVE_MESSAGE_SUCCESS: "Messages received successfully",
  RECEIVE_MESSAGE_ERROR: "Failed to receive messages",
  DELETE_MESSAGE_SUCCESS: "Message deleted successfully",
  DELETE_MESSAGE_ERROR: "Failed to delete message",
  EDIT_MESSAGE_SUCCESS: "Message edited successfully",
  EDIT_MESSAGE_ERROR: "Failed to edit message",
  
  // Conversation operations
  CREATE_CONVERSATION_SUCCESS: "Conversation created successfully",
  CREATE_CONVERSATION_ERROR: "Failed to create conversation",
  JOIN_CONVERSATION_SUCCESS: "Joined conversation successfully",
  JOIN_CONVERSATION_ERROR: "Failed to join conversation",
  LEAVE_CONVERSATION_SUCCESS: "Left conversation successfully",
  LEAVE_CONVERSATION_ERROR: "Failed to leave conversation",
  ARCHIVE_CONVERSATION_SUCCESS: "Conversation archived successfully",
  ARCHIVE_CONVERSATION_ERROR: "Failed to archive conversation",
  
  // Channel operations
  CREATE_CHANNEL_SUCCESS: "Channel created successfully",
  CREATE_CHANNEL_ERROR: "Failed to create channel",
  SUBSCRIBE_CHANNEL_SUCCESS: "Subscribed to channel successfully",
  SUBSCRIBE_CHANNEL_ERROR: "Failed to subscribe to channel",
  UNSUBSCRIBE_CHANNEL_SUCCESS: "Unsubscribed from channel successfully",
  UNSUBSCRIBE_CHANNEL_ERROR: "Failed to unsubscribe from channel",
  
  // Notification operations
  SEND_NOTIFICATION_SUCCESS: "Notification sent successfully",
  SEND_NOTIFICATION_ERROR: "Failed to send notification",
  MARK_NOTIFICATION_READ_SUCCESS: "Notification marked as read",
  MARK_NOTIFICATION_READ_ERROR: "Failed to mark notification as read",
  CLEAR_NOTIFICATIONS_SUCCESS: "Notifications cleared successfully",
  CLEAR_NOTIFICATIONS_ERROR: "Failed to clear notifications",
  
  // Presence/Status operations
  UPDATE_PRESENCE_SUCCESS: "Presence updated successfully",
  UPDATE_PRESENCE_ERROR: "Failed to update presence",
  GET_PRESENCE_SUCCESS: "Presence fetched successfully",
  GET_PRESENCE_ERROR: "Failed to fetch presence",
};

  
class CommunicationAPI {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

private handleCommunicationApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: keyof CommunicationNotificationMessage,
  additionalData?: any
) => {
  const { notify } = useNotification();
  
  // Get the error message text from the notification messages
  const errorMessageText = apiNotificationMessages[errorMessageId] || errorMessage;
  
  // Create more detailed error message based on HTTP status and communication context
  let userFriendlyMessage = errorMessageText;
  const axiosError = error as AxiosError;
  
  if (axiosError.response) {
    const status = axiosError.response.status;
    
    // Communication-specific error messages
    switch (status) {
      case 400:
        userFriendlyMessage = "Invalid communication data";
        break;
      case 401:
        userFriendlyMessage = "Authentication required for communication";
        break;
      case 403:
        userFriendlyMessage = "Communication permission denied";
        break;
      case 404:
        userFriendlyMessage = "Communication resource not found";
        break;
      case 408:
        userFriendlyMessage = "Communication request timeout";
        break;
      case 409:
        userFriendlyMessage = "Communication conflict";
        break;
      case 422:
        userFriendlyMessage = "Communication validation failed";
        break;
      case 429:
        userFriendlyMessage = "Too many communication requests";
        break;
      case 500:
        userFriendlyMessage = "Communication server error";
        break;
      case 502:
        userFriendlyMessage = "Bad gateway - communication service unavailable";
        break;
      case 503:
        userFriendlyMessage = "Communication service unavailable";
        break;
      case 504:
        userFriendlyMessage = "Communication gateway timeout";
        break;
      default:
        if (status >= 500) {
          userFriendlyMessage = "Communication server error occurred";
        } else if (status >= 400) {
          userFriendlyMessage = "Communication request failed";
        }
    }
  } else if (axiosError.request) {
    userFriendlyMessage = "Network error: Unable to establish communication";
  } else {
    userFriendlyMessage = "Communication failed: " + (axiosError.message || errorMessage);
  }
  
  // Log the error for debugging
  console.error("Communication API Error:", {
    messageId: errorMessageId,
    message: userFriendlyMessage,
    originalError: axiosError.message,
    statusCode: axiosError.response?.status,
    url: axiosError.config?.url,
    method: axiosError.config?.method,
    additionalData,
    timestamp: new Date().toISOString()
  });
  
  // Show notification using consistent object format
  notify({
    id: `communication_error_${String(errorMessageId)}_${Date.now()}`,
    message: userFriendlyMessage,
    data: {
      entityType: 'communication',
      entityId: additionalData?.messageId || additionalData?.conversationId || additionalData?.channelId || 'unknown',
      action: additionalData?.action || errorMessageId.toString().toLowerCase().replace('_error', ''),
      statusCode: axiosError.response?.status,
      errorType: errorMessageId.toString(),
      originalError: axiosError.message,
      url: axiosError.config?.url,
      method: axiosError.config?.method,
      communicationContext: getCommunicationContext(additionalData),
      extra: additionalData || {},
      timestamp: new Date().toISOString()
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_ERROR,
    level: 'error' as const,
    metadata: {
      isCommunicationError: true,
      communicationType: additionalData?.communicationType || 'general',
      requiresRetry: shouldRetryCommunicationError(axiosError.response?.status)
    }
  });
  
  // Call the original error handler
  handleApiError(error, userFriendlyMessage);
  
  // Optional: Log to communication monitoring service
  logCommunicationError({
    errorMessageId,
    error: axiosError,
    userMessage: userFriendlyMessage,
    additionalData
  });
};


  sendMessage = async (recipient: string, message: string): Promise<void> => {
    try {
      await internalApiService.post(`${this.baseURL}/send-message`, { recipient, message });
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



// Helper functions for communication error handling
const getCommunicationContext = (additionalData: any): any => {
  return {
    messageType: additionalData?.messageType,
    recipientId: additionalData?.recipientId,
    senderId: additionalData?.senderId,
    conversationId: additionalData?.conversationId,
    channelId: additionalData?.channelId,
    channelType: additionalData?.channelType,
    isGroup: additionalData?.isGroup,
    isBroadcast: additionalData?.isBroadcast,
    priority: additionalData?.priority,
    ...additionalData?.communicationContext
  };
};

const shouldRetryCommunicationError = (statusCode?: number): boolean => {
  // Retry for network errors, timeouts, and server errors
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  return statusCode ? retryableStatuses.includes(statusCode) : true;
};

const logCommunicationError = (errorInfo: any): void => {
  // Could send to communication-specific monitoring service
  console.log('[Communication Error Logged]:', {
    ...errorInfo,
    loggedAt: new Date().toISOString()
  });
  
  // Example: Send to external monitoring
  // communicationMonitorService.trackError(errorInfo);
};


// Example usage
const communicationAPI = new CommunicationAPI('https://api.communication.com');

// Send a message
communicationAPI.sendMessage('user@example.com', 'Hello!');
export default CommunicationAPI