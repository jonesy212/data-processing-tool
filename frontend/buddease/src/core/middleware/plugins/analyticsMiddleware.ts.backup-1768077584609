// analyticsMiddleware.ts
import { MiddlewareFunction } from '@/core/middleware/core/types';

export interface AnalyticsConfig {
  enabled: boolean;
  trackPerformance?: boolean;
  trackErrors?: boolean;
  customEvents?: string[];
  analyticsService?: {
    track: (event: string, properties: Record<string, any>) => Promise<void>;
  };
}

export const createAnalyticsMiddleware = (config: AnalyticsConfig = {
  enabled: true,
  trackPerformance: true,
  trackErrors: true
}): MiddlewareFunction => {
  return async (context, next) => {
    const { operation, payload, timestamp, store } = context;
    
    if (!config.enabled) {
      return await next(context);
    }

    const analyticsStartTime = performance.now();
    const analyticsContext = {
      operation,
      storeId: store?.storeId,
      userId: context.userId,
      timestamp: timestamp.toISOString(),
      source: 'snapshotStore'
    };

    try {
      // Track operation start
      if (config.analyticsService) {
        await config.analyticsService.track('snapshot_operation_started', {
          ...analyticsContext,
          payloadType: typeof payload,
          hasPayload: !!payload
        });
      }

      console.log(`[Analytics Middleware] Tracking operation: ${operation}`, analyticsContext);

      const result = await next(context);
      const analyticsEndTime = performance.now();

      // Track operation completion
      if (config.analyticsService) {
        const analyticsProperties: Record<string, any> = {
          ...analyticsContext,
          success: true
        };

        // Add performance metrics if enabled
        if (config.trackPerformance) {
          analyticsProperties.duration = analyticsEndTime - analyticsStartTime;
          analyticsProperties.performance = {
            totalTime: `${(analyticsEndTime - analyticsStartTime).toFixed(2)}ms`,
            operationTime: analyticsEndTime - analyticsStartTime
          };
        }

        // Add result metadata
        if (result && typeof result === 'object') {
          analyticsProperties.resultType = result.constructor.name;
          analyticsProperties.hasResult = true;
          
          // Safe serialization for analytics
          try {
            analyticsProperties.resultSummary = JSON.stringify(result).length > 1000 
              ? { size: JSON.stringify(result).length, truncated: true }
              : result;
          } catch {
            analyticsProperties.resultSummary = { serializationError: true };
          }
        }

        await config.analyticsService.track('snapshot_operation_completed', analyticsProperties);
      }

      // Track custom events if defined
      if (config.customEvents?.includes(operation)) {
        await config.analyticsService?.track(`snapshot_${operation}`, {
          ...analyticsContext,
          result: result ? 'success' : 'no_result'
        });
      }

      return result;

    } catch (error) {
      const analyticsEndTime = performance.now();

      // Track operation failure
      if (config.analyticsService && config.trackErrors) {
        await config.analyticsService.track('snapshot_operation_failed', {
          ...analyticsContext,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          duration: analyticsEndTime - analyticsStartTime
        });
      }

      console.error(`[Analytics Middleware] Operation ${operation} failed:`, error);
      throw error;
    }
  };
};

// Default analytics middleware with console logging
export const analyticsMiddleware: MiddlewareFunction = createAnalyticsMiddleware({
  enabled: true,
  trackPerformance: true,
  trackErrors: true,
  analyticsService: {
    track: async (event: string, properties: Record<string, any>) => {
      // Default implementation - log to console
      console.log(`[Analytics Event] ${event}:`, properties);
      
      // In a real app, you would send to your analytics service:
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ event, properties })
      // });
    }
  }
});