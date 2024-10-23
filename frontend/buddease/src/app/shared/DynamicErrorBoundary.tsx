// DynamicErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorBoundaryContext } from './ErrorBoundaryProvider';

interface DynamicErrorBoundaryProps {
  children: ReactNode;
}

class DynamicErrorBoundary extends Component<DynamicErrorBoundaryProps> {
  static contextType = ErrorBoundaryContext;
  context!: React.ContextType<typeof ErrorBoundaryContext>;

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { ErrorHandler } = this.context;
    if (ErrorHandler) {
      ErrorHandler.logError(error, errorInfo);
    }
    console.error('DynamicErrorBoundary caught an error:', error, errorInfo);
  }

  render(): React.ReactNode {
    return this.props.children;
  }
}

export default DynamicErrorBoundary;
