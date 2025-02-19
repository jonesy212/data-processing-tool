
interface ErrorInfo {
  componentStack?: string | null;
  // Add more properties as needed to provide context about the error
}

class ErrorHandler {
  static async logError(error: Error, errorInfo: ErrorInfo): Promise<void> {
    try {
      // Add code to send error details to an error reporting service
      // Example: await axios.post('/api/error-logs', { error, errorInfo });
      console.error('Error logged:', error, errorInfo);
    } catch (error) {
      console.error('Error reporting error:', error);
      // Handle the error reporting failure gracefully
    }
  }

  static async logErrorWithRetry(error: Error, errorInfo: ErrorInfo, retryCount: number = 3): Promise<void> {
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
      // Add code to send warning details to a logging service
      console.warn('Warning logged:', message, extraInfo);
    } catch (error) {
      console.error('Error reporting warning:', error);
      // Handle the warning reporting failure gracefully
    }
  }

  static async logInfo(message: string, extraInfo?: any): Promise<void> {
    try {
      // Add code to log informational messages
      console.log('Info logged:', message, extraInfo);
    } catch (error) {
      console.error('Error logging info:', error);
      // Handle the info logging failure gracefully
    }
  }
}

export default ErrorHandler;
