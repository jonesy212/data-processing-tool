// activityLogger.ts
// In your activityLogger.ts, export the ProjectLogger:
export { ProjectLog, ProjectLogger } from '@/app/dataIntegration/projectIntegration/ProjectLogger';
export { AudioLogger, ConfigLogger, default as Logger } from '@/app/logging/Logger'; // Your existing base Logger
// ... other loggers