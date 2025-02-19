// ActionManager.ts

import { Task } from "../../models/tasks/Task";
import { useNotification } from "../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";

class ActionManager {
    private notify: (message: string, type: string, timestamp: Date, context: string) => void; // Define the notify method

    constructor(notify: (message: string, type: string, timestamp: Date, context: string) => void) {
        this.notify = notify; // Assign the notify method from useNotification
    }

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
            this.notify('Error handling action', NOTIFICATION_MESSAGES.User.DEFAULT('user action'), new Date(), 'ActionManager');
        }
    }

    handleUserAction(task: Task): void {
        try {
            if (!task || !task.id) {
                throw new Error('Invalid user-generated task or missing ID');
            }

          // Logic for handling user-generated task
            const details = task.details;
            this.notify(`Success Generating: ${details} `, NOTIFICATION_MESSAGES.Info.GENERAATED_INFO_ITEMS_SUCCESS, new Date(), 'ActionManager');
        } catch (error: any) {
            this.notify('Error handling user-generated task', NOTIFICATION_MESSAGES.Error.DEFAULT('user action'), new Date(), 'ActionManager');
        }
    }

    private handleSystemAction(task: Task): void {
        try {
            if (!task || !task.id) {
                throw new Error('Invalid system-generated task or missing ID');
            }
            const details: string = task.details || '';
            // Logic for handling system-generated task
            this.notify('Handling system-generated task', NOTIFICATION_MESSAGES.Info.DEFAULT('user action', details), new Date(), 'ActionManager');
        } catch (error: any) {
            this.notify('Error handling system action', error.message, new Date(), 'ActionManager');
        }
    }

    handAction(task: Task): void {
        try {
            if (!task || !task.id) {
                throw new Error('Invalid task or missing ID');
            }

            if (task.source === 'user') {
                this.handleUserAction(task);
            } else if (task.source === 'system') {
                this.handleSystemAction(task);
            } else {
                throw new Error(`Unsupported source: ${task.source}`);
            }
        } catch (error) {
            this.notify('Error handling action', NOTIFICATION_MESSAGES.Error.DEFAULT('user action'), new Date(), 'ActionManager');
        }
    }
}

export const actionManager = new ActionManager(useNotification); // Inject useNotification method
