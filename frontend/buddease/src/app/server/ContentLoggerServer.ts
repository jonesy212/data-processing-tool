// ContentLoggerServer.ts
import { Logger } from '@/BaseLogger'; // Assuming Logger is defined elsewhere
import fs from 'fs';

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
    fs.appendFileSync(fileName, JSON.stringify({
      event: logType,
      data: message,
      timestamp: new Date()
    }) + '\n');
  }
}
