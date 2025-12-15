// LogEntry.ts

type LogLevel = 'error' | 'warn' | 'info' | 'debug';
type LogCategory = string; // Or specific categories like 'api', 'auth', 'ui', etc.

interface LogEntry {
  id: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  timestamp: Date;
  data?: Record<string, unknown>; // Or `any`
  userId?: string;
  component?: string;
  // Additional metadata
  sessionId?: string;
  requestId?: string;
  environment?: string;
  appVersion?: string;
}


export type {LogLevel, LogCategory, LogEntry }