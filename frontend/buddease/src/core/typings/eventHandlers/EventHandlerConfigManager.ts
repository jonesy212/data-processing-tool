// EventHandlerConfigManager.ts
import { debounce } from "@/core/pages/searches/Debounce";

import type { EventHandlerConfig } from "@/core/typings/eventHandlers/eventTypes";
import { PlatformTimeout, clearPlatformTimeout } from '@/core/typings/timeoutTypes';



export class EventHandlerConfigManager {
  private config: EventHandlerConfig;
  private defaultConfig: EventHandlerConfig = {
    enabled: true,
    debounce: 0,
    throttle: 0,
    maxListeners: 10,
    enablePerformanceMonitoring: false,
    performanceThreshold: 100,
    enableErrorHandling: true,
    logErrors: true,
    requireAuthentication: false,
    allowedRoles: [],
    allowedEnvironments: ['development', 'production', 'test'],
    capturePhase: false,
    passive: true,
    once: false,
    timeout: 5000,
    retryAttempts: 0,
    retryDelay: 1000,
    autoCleanup: true,
    cleanupAfter: 300000, // 5 minutes
    maxEventHistory: 100,
    enableAnalytics: false,
    enableLogging: false,
    logLevel: 'info',
    sanitizeInput: true,
    preventDefault: false,
    stopPropagation: false,
    stopImmediatePropagation: false
  };

  constructor(config: Partial<EventHandlerConfig> = {}) {
    this.config = { ...this.defaultConfig, ...config };
  }
    
  // Validate the configuration
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate debounce and throttle can't both be set
    if (this.config.debounce && this.config.throttle) {
      errors.push('Cannot set both debounce and throttle - choose one');
    }

    // Validate performance threshold
    if (this.config.performanceThreshold && this.config.performanceThreshold < 0) {
      errors.push('performanceThreshold must be a positive number');
    }

    // Validate timeout
    if (this.config.timeout && this.config.timeout < 0) {
      errors.push('timeout must be a positive number');
    }

    // Validate retry configuration
    if (this.config.retryAttempts && this.config.retryAttempts < 0) {
      errors.push('retryAttempts must be a positive number');
    }
    if (this.config.retryDelay && this.config.retryDelay < 0) {
      errors.push('retryDelay must be a positive number');
    }

    // Validate cleanup
    if (this.config.cleanupAfter && this.config.cleanupAfter < 0) {
      errors.push('cleanupAfter must be a positive number');
    }

    // Validate maxEventHistory
    if (this.config.maxEventHistory && this.config.maxEventHistory < 0) {
      errors.push('maxEventHistory must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get the current configuration
  getConfig(): EventHandlerConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(updates: Partial<EventHandlerConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Reset to defaults
  reset(): void {
    this.config = { ...this.defaultConfig };
  }

  // Check if event is allowed based on environment
  isEnvironmentAllowed(): boolean {
    if (!this.config.allowedEnvironments || this.config.allowedEnvironments.length === 0) {
      return true;
    }

    const currentEnv = process.env.NODE_ENV || 'development';
    return this.config.allowedEnvironments.includes(currentEnv);
  }

  // Check if role is allowed
  isRoleAllowed(userRole: string): boolean {
    if (!this.config.allowedRoles || this.config.allowedRoles.length === 0) {
      return true;
    }

    return this.config.allowedRoles.includes(userRole);
  }

  // Check if authentication is required and user is authenticated
  isAuthenticationMet(isAuthenticated: boolean): boolean {
    if (!this.config.requireAuthentication) {
      return true;
    }

    return isAuthenticated;
  }

  // Apply event transformations
  async transformEvent(event: any): Promise<any> {
    if (this.config.transformEvent) {
      return await Promise.resolve(this.config.transformEvent(event));
    }
    return event;
  }

  // Normalize payload
  async normalizePayload(payload: any): Promise<any> {
    if (this.config.normalizePayload) {
      return await Promise.resolve(this.config.normalizePayload(payload));
    }
    return payload;
  }

  // Validate event
  async validateEvent(event: any): Promise<boolean> {
    if (this.config.validateEvent) {
      return await Promise.resolve(this.config.validateEvent(event));
    }
    return true;
  }

  // Validate payload
  async validatePayload(payload: any): Promise<boolean> {
    if (this.config.validatePayload) {
      return await Promise.resolve(this.config.validatePayload(payload));
    }
    return true;
  }

  // Execute before hook
  async executeBeforeHook(event: any): Promise<void> {
    if (this.config.beforeExecute) {
      await Promise.resolve(this.config.beforeExecute(event));
    }
  }

  // Execute after hook
  async executeAfterHook(event: any, result: any): Promise<void> {
    if (this.config.afterExecute) {
      await Promise.resolve(this.config.afterExecute(event, result));
    }
  }

  // Handle error
  async handleError(error: Error, event: any): Promise<void> {
    if (this.config.onError) {
      await Promise.resolve(this.config.onError(error, event));
    }

    if (this.config.logErrors) {
      console.error(`EventHandler error for event:`, event, error);
    }
  }

  // Get event listener options
  getEventListenerOptions(): AddEventListenerOptions | undefined {
    const options: AddEventListenerOptions = {};

    if (this.config.capturePhase !== undefined) {
      options.capture = this.config.capturePhase;
    }

    if (this.config.passive !== undefined) {
      options.passive = this.config.passive;
    }

    if (this.config.once !== undefined) {
      options.once = this.config.once;
    }

    return Object.keys(options).length > 0 ? options : undefined;
  }

  // Create a debounced function
  createDebouncedFunction(fn: Function): Function & { cancel?: () => void } {
    if (!this.config.debounce || this.config.debounce <= 0) {
      return fn;
    }

    // Cast to the expected type
    const typedFn = fn as (...args: any[]) => any;
    
    // Use your existing debounce function
    return debounce(
      typedFn,
      this.config.debounce,
      {
        leading: false,
        trailing: true
      }
    );
  }

  // Create a throttled function
  createThrottledFunction(fn: Function): Function {
    if (!this.config.throttle || this.config.throttle <= 0) {
      return fn;
    }

    let lastCallTime = 0;
    let timeoutId: PlatformTimeout | null = null;
    
    const throttledFn = (...args: any[]) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;
      
      if (timeSinceLastCall >= this.config.throttle!) {
        lastCallTime = now;
        return fn(...args);
      }
      
      // If called too soon, schedule for after the throttle period
      if (!timeoutId) {
        const timeRemaining = this.config.throttle! - timeSinceLastCall;
        timeoutId = setTimeout(() => {
          fn(...args);
          lastCallTime = Date.now();
          timeoutId = null;
        }, timeRemaining);
      }
    };
    
    // Add cancel method
    throttledFn.cancel = () => {
      if (timeoutId) {
        clearPlatformTimeout(timeoutId);
        timeoutId = null;
      }
    };
    
    return throttledFn;
  }

  // Create a timeout-wrapped function
  createTimeoutFunction(fn: Function): Function {
    if (!this.config.timeout || this.config.timeout <= 0) {
      return fn;
    }

    return async (...args: any[]): Promise<any> => {
      return new Promise((resolve, reject) => {
        const timeoutId: PlatformTimeout = setTimeout(() => {
          reject(new Error(`Function timed out after ${this.config.timeout}ms`));
        }, this.config.timeout!);

        Promise.resolve(fn(...args))
          .then((result) => {
            clearPlatformTimeout(timeoutId);
            resolve(result);
          })
          .catch((error) => {
            clearPlatformTimeout(timeoutId);
            reject(error);
          });
      });
    };
  }


  // Create a retry function
  createRetryFunction(fn: Function): Function {
    if (!this.config.retryAttempts || this.config.retryAttempts <= 0) {
      return fn;
    }

    return async (...args: any[]) => {
      let lastError: Error;
      
      for (let attempt = 0; attempt <= this.config.retryAttempts!; attempt++) {
        try {
          return await Promise.resolve(fn(...args));
        } catch (error) {
          lastError = error as Error;
          if (attempt < this.config.retryAttempts!) {
            if (this.config.retryDelay) {
              await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
            }
            continue;
          }
        }
      }
      
      throw lastError!;
    };
  }

  // Sanitize input data
  sanitizeInput(data: any): any {
    if (!this.config.sanitizeInput) {
      return data;
    }

    // Basic sanitization - extend this based on your needs
    if (typeof data === 'string') {
      return data
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .trim();
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeInput(item));
    }

    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeInput(data[key]);
        }
      }
      return sanitized;
    }

    return data;
  }

  // Apply event modifiers
  applyEventModifiers(event: Event): void {
    if (this.config.preventDefault && event.preventDefault) {
      event.preventDefault();
    }

    if (this.config.stopPropagation && event.stopPropagation) {
      event.stopPropagation();
    }

    if (this.config.stopImmediatePropagation && event.stopImmediatePropagation) {
      event.stopImmediatePropagation();
    }
  }
  
}