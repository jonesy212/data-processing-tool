import { Notification } from "../components/support/NofiticationsSlice";
import { NotificationType } from "../components/support/NotificationContext";

// UniqueIDGenerator.ts
class UniqueIDGenerator {
  static generateID(folderName: string, fileName: string): string {
    // Implement your unique ID generation logic here
    return `${folderName}_${fileName}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
  
  static generateNotificationID(notification: Notification, date: Date, type: NotificationType): string { 
    return `${type}_${notification.message}_${date.getTime()}`; // Access message property of notification
  }

  static generateRoomId(): string {
    // Implement your room ID generation logic here
    // Example: Generate a random alphanumeric ID
    const roomIdLength = 8;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let roomId = '';
    for (let i = 0; i < roomIdLength; i++) {
      roomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return roomId;
  }


  generateTaskID(taskId: string, taskName: string): string { 
    return `${taskId}_${taskName}`;
  }
}

export default UniqueIDGenerator;
