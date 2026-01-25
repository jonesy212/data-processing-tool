// ContentLoggerServer.ts
import { Logger } from '@/core/dataIntegration/projectIntegration/activityLogger';
import { saveToLocalStorage } from '@/core/hooks/useLocalStorage';


export class ContentLoggerServer extends Logger {
  static logContentCreated(title: string, contentId: string, userId: string) {
    super.logWithOptions("Content", `${title} created (Content ID: ${contentId}, User ID: ${userId})`, userId);
  }

  static logContentUpdate(title: string, contentId: string, userId: string, changes: string, upsert = false) {
    super.logWithOptions("Content", `${title} updated (Content ID: ${contentId}, User ID: ${userId}, Changes: ${changes})`, userId);
  }

  static logContentDeletion(title: string, contentId: string, userId: string) {
    super.logWithOptions("Content", `Content deleted (Content ID: ${contentId}, User ID: ${userId})`, userId);
  }

  static logContentCompletion(title: string, contentId: string, userId: string) {
    super.logWithOptions("Content", `${title} completed (Content ID: ${contentId}, User ID: ${userId})`, userId);
  }

  static logTaskCreation(taskId: string, title: string, contentId: string, userId: string) {
    super.logWithOptions("Content", `Task created (Task ID: ${taskId}, Title: ${title}, Content ID: ${contentId}, User ID: ${userId})`, userId);
  }

  static logTaskUpdate(taskId: string, title: string, contentId: string, userId: string, changes: string) {
    super.logWithOptions("Content", `Task updated (Task ID: ${taskId}, Title: ${title}, Content ID: ${contentId}, User ID: ${userId}, Changes: ${changes})`, userId);
  }

  static logTaskEditing(taskId: string, userId: string) {
    super.logWithOptions("Content", `Task updated (Task ID: ${taskId}, User ID: ${userId})`, userId);
  }

  static logTaskAssignment(taskId: string, userId: string) {
    super.logWithOptions("Content", `Task assigned (Task ID: ${taskId}, User ID: ${userId})`, userId);
  }

  static logTaskReassignment(taskId: string, oldUserId: string, newUserId: string) {
    super.logWithOptions("Content", `Task reassigned (Task ID: ${taskId}, Old User ID: ${oldUserId}, New User ID: ${newUserId})`, newUserId);
  }

  static logTaskDeletion(taskId: string, title: string, userId: string, contentId?: string) {
    super.logWithOptions("Content", `Task deleted (Task ID: ${taskId}, Title: ${title}, Content ID: ${contentId}, User ID: ${userId})`, userId);
  }

  static logTaskCompletion(taskId: string, userId: string) {
    super.logWithOptions("Content", `Task completed (Task ID: ${taskId}, User ID: ${userId})`, userId);
  }

    static logEventToFile(logType: string, message: string, fileName: string) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] [${logType}] ${message}`;
    
    // Always log to console
    console.log(`[${logType}]`, message);
    
    // In browser, store in buffer
    if (typeof window !== 'undefined') {
      this.logBuffer.push(entry);
      saveToLocalStorage(this.LOG_KEY, this.logBuffer);
    }
    
    // In server, write to file
    if (typeof window === 'undefined') {
      // This will only work if called from server-side code
      this.writeToServerFile(logType, message, fileName);
    }
    
    return entry;
  }
  
  private static writeToServerFile(logType: string, message: string, fileName: string) {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const timestamp = new Date().toISOString();
      const entry = `[${timestamp}] [${logType}] ${message}`;
      const logDir = path.join(process.cwd(), 'logs');
      
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logPath = path.join(logDir, fileName);
      fs.appendFileSync(logPath, entry + '\n');
    } catch (error) {
      console.error('Failed to write to server log file:', error);
    }
  }
}
