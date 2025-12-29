// activityLogger.ts
// In your activityLogger.ts, export the ProjectLogger:
export { ProjectLog, ProjectLogger } from '@/core/dataIntegration/projectIntegration/ProjectLogger';
export { AudioLogger, ConfigLogger, default as Logger } from '@/core/logging/Logger'; // Your existing base Logger
// ... other loggers