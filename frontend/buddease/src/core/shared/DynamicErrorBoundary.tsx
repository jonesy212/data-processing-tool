// DynamicErrorBoundary.tsx
import { ErrorBoundaryContext } from '@/core/shared/ErrorBoundaryProvider';
import type { Component, ErrorInfo, ReactNode } from '@/core/shared/ErrorHandler';
import React from '@/core/shared/ErrorHandler';

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
