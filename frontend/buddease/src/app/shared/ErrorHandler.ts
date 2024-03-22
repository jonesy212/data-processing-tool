 // ErrorHandler.ts
 interface ErrorInfo {
    componentStack: string; // Example property, can include additional information
    // Add more properties as needed to provide context about the error
  }
  

class ErrorHandler {
    static logError(error: Error, errorInfo: ErrorInfo): void {
      // Add code to send error details to an error reporting service
      // Example: axiosInstance.post('/api/error-logs', { error, errorInfo });
      console.error('Error logged:', error, errorInfo);
    }
  }
  
  export default ErrorHandler;
  