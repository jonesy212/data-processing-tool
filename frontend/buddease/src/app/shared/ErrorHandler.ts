// ErrorHandler.ts
// utils/ErrorHandler.ts
import { configNotificationMessages } from '@/app/api/ConfigManager'
import { cryptoNotificationMessages } from '@/app/api/ApiCrypto';
import { useNotification } from '@/app/state/context/NotificationContext';
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes';
export type ErrorDomain = 'config' | 'crypto' | 'auth' | 'database' | 'general';

export interface ErrorInfo {
  componentStack?: string | null;
  domain?: ErrorDomain;
  operation?: string;
  userId?: string;
  timestamp?: Date;
  // Add more properties as needed to provide context about the error
}

class ErrorHandler {
  private static getNotificationMessages(domain: ErrorDomain) {
    switch (domain) {
      case 'config':
        return configNotificationMessages;
      case 'crypto':
        return cryptoNotificationMessages;
      // Add more domains as needed
      default:
        return {} as any;
    }
  }

  static async logError(error: Error, errorInfo: ErrorInfo = {}): Promise<void> {
    try {
      const enhancedErrorInfo = {
        timestamp: new Date(),
        ...errorInfo
      };

      // Log to console and your error reporting service
      console.error('Error logged:', error, enhancedErrorInfo);
      
      // Add code to send error details to an error reporting service
      // Example: await axios.post('/api/error-logs', { error, enhancedErrorInfo });
      
    } catch (reportingError) {
      console.error('Error reporting error:', reportingError);
      // Handle the error reporting failure gracefully
    }
  }

  static async logErrorWithRetry(error: Error, errorInfo: ErrorInfo = {}, retryCount: number = 3): Promise<void> {
    let attempts = 0;
    while (attempts < retryCount) {
      try {
        await this.logError(error, errorInfo);
        break;
      } catch (error) {
        console.error(`Error reporting error (attempt ${attempts + 1}):`, error);
        attempts++;
      }
    }
  }

  static async logWarning(message: string, extraInfo?: any): Promise<void> {
    try {
      console.warn('Warning logged:', message, extraInfo);
      // Add code to send warning details to a logging service
    } catch (error) {
      console.error('Error reporting warning:', error);
    }
  }

  static async logInfo(message: string, extraInfo?: any): Promise<void> {
    try {
      console.log('Info logged:', message, extraInfo);
      // Add code to log informational messages
    } catch (error) {
      console.error('Error logging info:', error);
    }
  }

  // NEW: Domain-specific error handling with notifications
  static async handleDomainErrorAndNotify(
    error: Error,
    errorMessage: string,
    domain: ErrorDomain,
    errorMessageId: string,
    additionalInfo: Partial<ErrorInfo> = {}
  ): Promise<void> {
    const messages = this.getNotificationMessages(domain);
    const errorMessageText = (messages as any)[errorMessageId] || errorMessage;

    // Log the error with domain context
    await this.logError(error, {
      domain,
      operation: errorMessageId,
      ...additionalInfo
    });

    // Show user notification
    useNotification().notify({
      id: `${domain}-${errorMessageId}`,
      message: errorMessageText,
      data: { 
        originalError: errorMessage, 
        domain,
        ...additionalInfo 
      },
      timestamp: new Date(),
      type: "error" as NotificationType
    });
  }

  // NEW: Domain-specific success notifications
  static async notifySuccess(
    domain: ErrorDomain,
    messageId: string,
    additionalData: any = {}
  ): Promise<void> {
    const messages = this.getNotificationMessages(domain);
    const messageText = (messages as any)[messageId];

    if (messageText) {
      useNotification().notify({
        id: `${domain}-${messageId}`,
        message: messageText,
        data: additionalData,
        timestamp: new Date(),
        type: "success" as NotificationType
      });
    }
  }
}

export default ErrorHandler;