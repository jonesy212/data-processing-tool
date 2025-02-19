// ErrorBoundary.ts
import React, { Component, ErrorInfo, ReactNode } from 'react';
import axiosInstance from '../api/axiosInstance';



interface ErrorBoundaryProps {
  children: ReactNode; // Add children property to the props interface
}



interface ErrorBoundaryState {

  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      error: error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service (e.g., Sentry, Bugsnag)
    this.logErrorToService(error, errorInfo);
    // Optionally, you can also log the error to the console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }


  logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    // Add code to send error details to an error reporting service
    // For example, using an API call to send error data to a backend server
    // This could include the error message, stack trace, user info, etc.
    // Example API call:
    axiosInstance.post('/api/error-logs', { error, errorInfo })
      .then(response => {
        console.log('Error logged successfully:', response.data);
      })
      .catch(err => {
        console.error('Failed to log error:', err);
      });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Render a user-friendly error message
      return (
        <div>
          <h2>Something went wrong.</h2>
          <p>We're sorry, but an unexpected error occurred.</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
          {/* You can add more details or provide a link to contact support */}
        </div>
      );
    }

    return this.props.children; // Render children if there's no error
  }
}

export default ErrorBoundary;
