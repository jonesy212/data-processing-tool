// useLogManagement.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import Logger, { 
  TradeLogger, 
  TeamLogger, 
  UILogger,
  AnimationLogger,
  DataLogger,
  SecurityLogger,
  ContentLogger,
  FileLogger,
  SearchLogger,
  ErrorLogger
} from '@/app/logging/Logger';
import { useNotification } from '@/app/state/context/NotificationContext';
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes'
import { getFromLocalStorage, saveToLocalStorage } from '@/app/hooks/useLocalStorage';
import { endpoints } from '@/app/api/endpointConfigurations';
import { TradeAction } from '@/app/components/crypto/CryptoPortfolio'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type LogCategory = 
  | 'trade' 
  | 'team' 
  | 'ui' 
  | 'animation' 
  | 'data' 
  | 'security' 
  | 'content' 
  | 'file' 
  | 'search' 
  | 'system' 
  | 'performance' 
  | 'api' 
  | 'user' 
  | 'error';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  userId?: string;
  data?: any;
  source?: string;
  sessionId?: string;
  component?: string;
}

export interface LogFilter {
  level?: LogLevel | LogLevel[];
  category?: LogCategory | LogCategory[];
  dateRange?: { start: Date; end: Date };
  userId?: string;
  searchTerm?: string;
  component?: string;
}

export interface LogStats {
  total: number;
  byLevel: Record<LogLevel, number>;
  byCategory: Record<LogCategory, number>;
  errorsToday: number;
  recentActivity: number;
  peakHour?: string;
}

export interface LogConfig {
  enabled: boolean;
  consoleLevel: LogLevel;
  remoteLevel: LogLevel;
  batchSize: number;
  flushInterval: number;
  maxLocalLogs: number;
  enablePerformanceLogging: boolean;
  enableUserTracking: boolean;
  sensitiveDataRedaction: boolean;
  categories: LogCategory[];
}

export interface LogBatch {
  entries: LogEntry[];
  timestamp: Date;
  sessionId: string;
}

const DEFAULT_CONFIG: LogConfig = {
  enabled: true,
  consoleLevel: 'info',
  remoteLevel: 'error',
  batchSize: 50,
  flushInterval: 30000, // 30 seconds
  maxLocalLogs: 1000,
  enablePerformanceLogging: true,
  enableUserTracking: false,
  sensitiveDataRedaction: true,
  categories: ['trade', 'error', 'system']
};

const LOCAL_STORAGE_KEYS = {
  LOGS: 'log_management_logs',
  CONFIG: 'log_management_config',
  STATS: 'log_management_stats'
};

type TimerHandle = ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | null;

export function useLogManagement() {
  const { notify } = useNotification();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [config, setConfig] = useState<LogConfig>(DEFAULT_CONFIG);
  const [isInitialized, setIsInitialized] = useState(false);
  const [stats, setStats] = useState<LogStats>({
    total: 0,
    byLevel: { info: 0, warn: 0, error: 0, debug: 0 },
    byCategory: {
      trade: 0, team: 0, ui: 0, animation: 0, data: 0,
      security: 0, content: 0, file: 0, search: 0,
      system: 0, performance: 0, api: 0, user: 0, error: 0
    },
    errorsToday: 0,
    recentActivity: 0
  });

  const batchRef = useRef<LogEntry[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionId = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Initialize from localStorage
  useEffect(() => {
    const loadConfig = getFromLocalStorage<LogConfig>(LOCAL_STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
    const savedLogs = getFromLocalStorage<LogEntry[]>(LOCAL_STORAGE_KEYS.LOGS, []);
    const savedStats = getFromLocalStorage<LogStats>(LOCAL_STORAGE_KEYS.STATS, stats);

    setConfig(loadConfig);
    setLogs(savedLogs.slice(-loadConfig.maxLocalLogs));
    setStats(savedStats);
    setIsInitialized(true);

    // Setup batch flushing
    if (loadConfig.enabled && loadConfig.remoteLevel !== 'debug') {
      setupBatchFlushing();
    }

    return () => {
      if (flushTimerRef.current) {
        clearInterval(flushTimerRef.current);
      }
    };
  }, []);

  // Save to localStorage when logs or config changes
  useEffect(() => {
    if (isInitialized) {
      saveToLocalStorage(LOCAL_STORAGE_KEYS.LOGS, logs);
      saveToLocalStorage(LOCAL_STORAGE_KEYS.STATS, stats);
    }
  }, [logs, stats, isInitialized]);

  useEffect(() => {
    saveToLocalStorage(LOCAL_STORAGE_KEYS.CONFIG, config);
    
    if (config.enabled) {
      setupBatchFlushing();
    } else {
      if (flushTimerRef.current) {
        clearInterval(flushTimerRef.current);
      }
    }
  }, [config]);

  const setupBatchFlushing = () => {
    if (flushTimerRef.current) {
      clearInterval(flushTimerRef.current);
    }

    flushTimerRef.current = setInterval(() => {
      if (batchRef.current.length > 0) {
        flushBatchToServer();
      }
    }, config.flushInterval);
  };

  const generateLogId = () => {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const shouldLogToConsole = (level: LogLevel): boolean => {
    const levelOrder: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
    return levelOrder[level] >= levelOrder[config.consoleLevel];
  };

  const shouldLogToRemote = (level: LogLevel): boolean => {
    const levelOrder: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
    return levelOrder[level] >= levelOrder[config.remoteLevel];
  };

  const redactSensitiveData = (data: any): any => {
    if (!config.sensitiveDataRedaction || !data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = [
      'password', 'token', 'apiKey', 'secret', 'privateKey', 'creditCard',
      'ssn', 'address', 'phone', 'email', 'authToken', 'refreshToken'
    ];

    const redacted = { ...data };
    sensitiveFields.forEach(field => {
      if (redacted[field]) {
        redacted[field] = '***REDACTED***';
      }
    });

    return redacted;
  };

  const createLogEntry = (
    level: LogLevel,
    category: LogCategory,
    message: string,
    data?: any,
    userId?: string,
    component?: string
  ): LogEntry => {
    return {
      id: generateLogId(),
      timestamp: new Date(),
      level,
      category,
      message,
      userId,
      data: redactSensitiveData(data),
      source: 'useLogManagement',
      sessionId: sessionId.current,
      component
    };
  };

  const updateStats = useCallback((entry: LogEntry) => {
    setStats(prev => {
      const newStats = { ...prev };
      newStats.total++;
      newStats.byLevel[entry.level] = (newStats.byLevel[entry.level] || 0) + 1;
      newStats.byCategory[entry.category] = (newStats.byCategory[entry.category] || 0) + 1;
      
      // Count errors today
      const today = new Date().toDateString();
      const entryDate = entry.timestamp.toDateString();
      if (entry.level === 'error' && today === entryDate) {
        newStats.errorsToday++;
      }

      // Calculate recent activity (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (entry.timestamp > fiveMinutesAgo) {
        newStats.recentActivity++;
      }

      return newStats;
    });
  }, []);

  const log = useCallback((
    level: LogLevel,
    category: LogCategory,
    message: string,
    data?: any,
    userId?: string,
    component?: string
  ) => {
    if (!config.enabled || !config.categories.includes(category)) {
      return;
    }

    const entry = createLogEntry(level, category, message, data, userId, component);

    // Add to local logs
    setLogs(prev => {
      const newLogs = [...prev, entry];
      // Keep only maxLocalLogs
      return newLogs.slice(-config.maxLocalLogs);
    });

    updateStats(entry);

    // Log to console if configured
    if (shouldLogToConsole(level)) {
      const logFn = level === 'error' ? console.error :
                   level === 'warn' ? console.warn :
                   level === 'info' ? console.info : console.debug;
      
      const logMessage = `[${category.toUpperCase()}] ${message}`;
      if (data) {
        logFn(logMessage, data);
      } else {
        logFn(logMessage);
      }
    }

    // Add to batch for remote logging
    if (shouldLogToRemote(level)) {
      batchRef.current.push(entry);
      
      // Auto-flush if batch size reached
      if (batchRef.current.length >= config.batchSize) {
        flushBatchToServer();
      }
    }

    // Send notification for high severity logs
    if (level === 'error') {
      notify({
        id: `log_error_${entry.id}`,
        message: `Log Error: ${message.substring(0, 100)}`,
        data: { 
          originalError: entry.data?.error || entry.message,
          entityId: entry.userId,
          entityType: 'LogEntry',
          action: 'log_error',
          timestamp: entry.timestamp.toISOString(),
          category: entry.category,
          extra: {  // Put the rest in extra
            component: entry.component,
            source: entry.source,
            sessionId: entry.sessionId,
            fullMessage: entry.message
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.ERROR,
        level: 'error'
      });
    }
  }, [config, notify, updateStats]);

  const flushBatchToServer = useCallback(async () => {
    if (batchRef.current.length === 0) return;

    const batchToSend = [...batchRef.current];
    batchRef.current = [];

    try {
      const logBatch: LogBatch = {
        entries: batchToSend,
        timestamp: new Date(),
        sessionId: sessionId.current
      };

      const response = await fetch(endpoints.logging, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logBatch)
      });

      if (!response.ok) {
        throw new Error(`Failed to send logs: ${response.status}`);
      }

      log('info', 'system', `Successfully sent ${batchToSend.length} logs to server`);
    } catch (error) {
      console.error('Failed to flush logs to server:', error);
      // Re-add failed logs to batch
      batchRef.current = [...batchRef.current, ...batchToSend];
    }
  }, [log]);

  // Specialized logging functions
  const logTrade = useCallback((
    trade: TradeAction,
    action: string,
    data?: any,
    level: LogLevel = 'info'
  ) => {
    log(level, 'trade', `${action}: ${trade.asset} ${trade.amount}`, {
      ...trade,
      ...data
    }, trade.userId, 'TradeLogger');
    
    // Also use TradeLogger for specialized trade logging
    if (level === 'error' && data?.error) {
      TradeLogger.logTradeError(trade, data.error, action);
    }
  }, [log]);

  const logTeam = useCallback((
    action: string,
    teamId: string,
    data?: any,
    userId?: string,
    level: LogLevel = 'info'
  ) => {
    log(level, 'team', `Team ${action}: ${teamId}`, data, userId, 'TeamLogger');
  }, [log]);

  const logUI = useCallback((
    action: string,
    component: string,
    data?: any,
    userId?: string,
    level: LogLevel = 'info'
  ) => {
    log(level, 'ui', `${component}: ${action}`, data, userId, 'UILogger');
  }, [log]);

  const logPerformance = useCallback((
    operation: string,
    duration: number,
    data?: any,
    component?: string
  ) => {
    if (!config.enablePerformanceLogging) return;

    const level = duration > 1000 ? 'warn' : 
                  duration > 500 ? 'info' : 'debug';
    
    log(level, 'performance', `${operation} took ${duration}ms`, {
      duration,
      ...data
    }, undefined, component);
  }, [log, config.enablePerformanceLogging]);

  const logUserActivity = useCallback((
    action: string,
    data?: any,
    userId?: string
  ) => {
    if (!config.enableUserTracking) return;
    log('info', 'user', `User activity: ${action}`, data, userId, 'UserActivity');
  }, [log, config.enableUserTracking]);

  const logError = useCallback((
    error: Error | string,
    context?: string,
    data?: any,
    userId?: string,
    component?: string
  ) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage;
    
    log('error', 'error', fullMessage, {
      error: typeof error === 'string' ? error : {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      ...data
    }, userId, component);
  }, [log]);

  const logApiCall = useCallback((
    endpoint: string,
    method: string,
    status: number,
    duration?: number,
    data?: any,
    userId?: string
  ) => {
    const level = status >= 400 ? 'error' :
                  status >= 300 ? 'warn' : 'info';
    
    log(level, 'api', `${method} ${endpoint} - ${status}`, {
      endpoint,
      method,
      status,
      duration,
      ...data
    }, userId, 'APILogger');

    if (duration !== undefined) {
      logPerformance(`API Call: ${endpoint}`, duration, { status }, 'APILogger');
    }
  }, [log, logPerformance]);

  // Filtering and querying
  const filterLogs = useCallback((filter: LogFilter): LogEntry[] => {
    return logs.filter(entry => {
      // Level filter
      if (filter.level) {
        const levels = Array.isArray(filter.level) ? filter.level : [filter.level];
        if (!levels.includes(entry.level)) return false;
      }

      // Category filter
      if (filter.category) {
        const categories = Array.isArray(filter.category) ? filter.category : [filter.category];
        if (!categories.includes(entry.category)) return false;
      }

      // Date range filter
      if (filter.dateRange) {
        if (entry.timestamp < filter.dateRange.start || entry.timestamp > filter.dateRange.end) {
          return false;
        }
      }

      // User ID filter
      if (filter.userId && entry.userId !== filter.userId) {
        return false;
      }

      // Component filter
      if (filter.component && entry.component !== filter.component) {
        return false;
      }

      // Search term filter
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        if (!entry.message.toLowerCase().includes(searchLower) &&
            !entry.component?.toLowerCase().includes(searchLower) &&
            !JSON.stringify(entry.data).toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [logs]);

  const clearLogs = useCallback((filter?: LogFilter) => {
    if (filter) {
      setLogs(prev => prev.filter(entry => {
        // Invert the filter logic - keep logs that DON'T match the filter
        if (filter.level) {
          const levels = Array.isArray(filter.level) ? filter.level : [filter.level];
          if (levels.includes(entry.level)) return false;
        }
        // Add other filter conditions as needed
        return true;
      }));
    } else {
      setLogs([]);
      batchRef.current = [];
    }
  }, []);

  const exportLogs = useCallback((filter?: LogFilter): string => {
    const logsToExport = filter ? filterLogs(filter) : logs;
    return JSON.stringify(logsToExport, null, 2);
  }, [logs, filterLogs]);

  const exportLogsAsCSV = useCallback((filter?: LogFilter): string => {
    const logsToExport = filter ? filterLogs(filter) : logs;
    
    const headers = ['Timestamp', 'Level', 'Category', 'Message', 'User ID', 'Component', 'Data'];
    const rows = logsToExport.map(log => [
      log.timestamp.toISOString(),
      log.level,
      log.category,
      `"${log.message.replace(/"/g, '""')}"`,
      log.userId || '',
      log.component || '',
      `"${JSON.stringify(log.data).replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }, [logs, filterLogs]);

  const getLogStats = useCallback((): LogStats => {
    return stats;
  }, [stats]);

  const updateConfig = useCallback((newConfig: Partial<LogConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  // Performance monitoring
  const startPerformanceTimer = useCallback((operation: string) => {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      logPerformance(operation, duration);
    };
  }, [logPerformance]);

  // Integration with existing Logger classes
  const initializeLoggerIntegration = useCallback(() => {
    // Override console methods if needed
    if (config.consoleLevel === 'debug') {
      const originalConsole = { ...console };
      
      console.log = (...args) => {
        originalConsole.log(...args);
        log('info', 'system', args.join(' '), { args });
      };
      
      console.warn = (...args) => {
        originalConsole.warn(...args);
        log('warn', 'system', args.join(' '), { args });
      };
      
      console.error = (...args) => {
        originalConsole.error(...args);
        log('error', 'system', args.join(' '), { args });
      };
    }
  }, [config.consoleLevel, log]);

  // Load more logs from server
  const loadMoreLogs = useCallback(async (fromDate?: Date) => {
    try {
      const params = new URLSearchParams();
      if (fromDate) {
        params.append('from', fromDate.toISOString());
      }
      params.append('limit', '100');
      params.append('sessionId', sessionId.current);

      const response = await fetch(`${endpoints.logging}?${params}`);
      if (response.ok) {
        const serverLogs: LogEntry[] = await response.json();
        setLogs(prev => [...prev, ...serverLogs].slice(-config.maxLocalLogs));
      }
    } catch (error) {
      logError(error as Error, 'Failed to load more logs from server');
    }
  }, [logError, config.maxLocalLogs]);

  return {
    // State
    logs,
    config,
    stats,
    isInitialized,

    // Core logging functions
    log,
    logTrade,
    logTeam,
    logUI,
    logPerformance,
    logUserActivity,
    logError,
    logApiCall,

    // Log management
    filterLogs,
    clearLogs,
    exportLogs,
    exportLogsAsCSV,
    getLogStats,
    flushBatchToServer,

    // Configuration
    updateConfig,
    resetConfig,

    // Performance monitoring
    startPerformanceTimer,

    // Advanced features
    initializeLoggerIntegration,
    loadMoreLogs,

    // Utilities
    sessionId: sessionId.current,
    redactSensitiveData
  };
}

export default useLogManagement;