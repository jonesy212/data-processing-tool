// ActionManager.ts

import { Task } from "../../models/tasks/Task";



class ActionManager {
    handleAction(task: Task): void {
        try {
          if (!task || !task.source) {
            throw new Error('Invalid task or missing source');
          }
    
          if (task.source === 'user') {
            this.handleUserAction(task);
          } else if (task.source === 'system') {
            this.handleSystemAction(task);
          } else {
            throw new Error(`Unsupported source: ${task.source}`);
          }
        } catch (error) {
          console.error('Error handling action:', error.message);
          // Optionally, you can log or handle the error in a centralized logging service
        }
      }
    
     handleUserAction(task: Task): void {
        try {
          if (!task || !task.id) {
            throw new Error('Invalid user-generated task or missing ID');
          }
    
          // Logic for handling user-generated task
          console.log('Handling user-generated task:', task);
        } catch (error) {
          console.error('Error handling user action:', error.message);
          // Optionally, you can log or handle the error in a centralized logging service
        }
      }
    
      private handleSystemAction(task: Task): void {
        try {
          if (!task || !task.id) {
            throw new Error('Invalid system-generated task or missing ID');
          }
    
          // Logic for handling system-generated task
          console.log('Handling system-generated task:', task);
        } catch (error) {
          console.error('Error handling system action:', error.message);
          // Optionally, you can log or handle the error in a centralized logging service
        }
  }

}

export const actionManager = new ActionManager();
