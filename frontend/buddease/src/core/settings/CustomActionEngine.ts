// CustomActionEngine.ts
import { ReminderCondition } from '@/core/settings/ReminderCondition';
import ReminderConditionEngine from '@/core/settings/ReminderConditionEngine';

interface CustomAction {
    id: string;
    name: string;
    description?: string;

    // The type of action to perform
    actionType: 'api_call' | 'open_url' | 'run_script' | 'send_message' | 'update_status' | 'log_entry';

    // When this action should trigger
    triggerEvent: 'on_send' | 'on_dismiss' | 'on_complete' | 'on_expire' | 'manual';

    // Configuration for dynamic execution
    config?: {
        endpoint?: string; // For API calls
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
        headers?: Record<string, string>;
        body?: Record<string, any>;
        url?: string; // For open_url
        script?: string; // For custom script execution
        targetUserId?: string;
        messageTemplate?: string;
    };

    // Optional conditions for executing this action
    conditions?: ReminderCondition[];

    // Whether this action can be retried automatically if it fails
    retryPolicy?: {
        maxRetries: number;
        retryIntervalSeconds: number;
    };

    enabled: boolean;
}


class CustomActionEngine {
    private retryAttempts = new Map<string, number>();

    // Execute a custom action
    async executeAction(action: CustomAction, context: any): Promise<boolean> {
        if (!action.enabled) return false;

        // Check conditions if any
        if (action.conditions && action.conditions.length > 0) {
            const conditionEngine = new ReminderConditionEngine();
            const conditionsMet = conditionEngine.evaluateConditionGroup(action.conditions, context);
            if (!conditionsMet) return false;
        }

        try {
            switch (action.actionType) {
                case 'api_call':
                    return await this.executeApiCall(action, context);
                case 'open_url':
                    return await this.executeOpenUrl(action, context);
                case 'run_script':
                    return await this.executeScript(action, context);
                case 'send_message':
                    return await this.executeSendMessage(action, context);
                case 'update_status':
                    return await this.executeUpdateStatus(action, context);
                case 'log_entry':
                    return await this.executeLogEntry(action, context);
                default:
                    console.warn(`Unknown action type: ${action.actionType}`);
                    return false;
            }
        } catch (error) {
            console.error(`Action execution failed: ${error instanceof Error ? error.message : String(error)}`);

            // Handle retry logic
            if (action.retryPolicy) {
                return await this.retryAction(action, context);
            }

            return false;
        }
    }

    private async executeApiCall(action: CustomAction, context: any): Promise<boolean> {
        const { config } = action;
        if (!config?.endpoint) return false;

        const requestBody = this.interpolateTemplate(config.body, context);
        const requestHeaders = {
            'Content-Type': 'application/json',
            ...config.headers
        };

        const response = await fetch(config.endpoint, {
            method: config.method || 'POST',
            headers: requestHeaders,
            body: requestBody ? JSON.stringify(requestBody) : undefined
        });

        return response.ok;
    }

    private async executeOpenUrl(action: CustomAction, context: any): Promise<boolean> {
        const { config } = action;
        if (!config?.url) return false;

        const url = this.interpolateTemplate(config.url, context);

        // For browser environments
        if (typeof window !== 'undefined') {
            window.open(url, '_blank');
            return true;
        }

        // For server environments, log the URL
        console.log(`URL to open: ${url}`);
        return true;
    }

    private async executeScript(action: CustomAction, context: any): Promise<boolean> {
        const { config } = action;
        if (!config?.script) return false;

        try {
            // In production, use a proper sandboxed script execution environment
            const script = this.interpolateTemplate(config.script, context);

            // Simple function execution (be extremely careful with this in production!)
            const result = eval(script);
            return Boolean(result);
        } catch (error) {
            console.error('Script execution failed:', error);
            return false;
        }
    }

    private async executeSendMessage(action: CustomAction, context: any): Promise<boolean> {
        const { config } = action;

        let message = config?.messageTemplate || action.name;
        message = this.interpolateTemplate(message, context);

        // Determine target
        const targetUserId = config?.targetUserId || context.user?.id;

        if (!targetUserId) {
            console.error('No target user specified for message action');
            return false;
        }

        // Send message via your notification system
        try {
            await this.sendNotification(targetUserId, message, action.actionType);
            return true;
        } catch (error) {
            console.error('Message sending failed:', error);
            return false;
        }
    }

    private async executeUpdateStatus(action: CustomAction, context: any): Promise<boolean> {
        const { config } = action;

        // Update event or task status
        const eventId = context.event?.id;
        const newStatus = config?.body?.status;

        if (!eventId || !newStatus) {
            console.error('Missing event ID or status for update action');
            return false;
        }

        try {
            // Call your API to update the status
            await fetch(`/api/events/${eventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            return true;
        } catch (error) {
            console.error('Status update failed:', error);
            return false;
        }
    }

    private async executeLogEntry(action: CustomAction, context: any): Promise<boolean> {
        const { config } = action;

        let logMessage = config?.messageTemplate || action.name;
        logMessage = this.interpolateTemplate(logMessage, context);

        try {
            // Log to your preferred logging system
            console.log(`[CUSTOM_ACTION] ${logMessage}`, {
                actionId: action.id,
                context: this.sanitizeContext(context),
                timestamp: new Date().toISOString()
            });

            return true;
        } catch (error) {
            console.error('Log entry failed:', error);
            return false;
        }
    }

    private async retryAction(action: CustomAction, context: any): Promise<boolean> {
        const actionKey = `${action.id}-${JSON.stringify(context)}`;
        const currentAttempt = this.retryAttempts.get(actionKey) || 0;

        if (currentAttempt >= action.retryPolicy!.maxRetries) {
            this.retryAttempts.delete(actionKey);
            return false;
        }

        this.retryAttempts.set(actionKey, currentAttempt + 1);

        // Wait before retry
        await new Promise(resolve =>
            setTimeout(resolve, action.retryPolicy!.retryIntervalSeconds * 1000)
        );

        return await this.executeAction(action, context);
    }

    private interpolateTemplate(template: string | any, context: any): any {
        if (typeof template === 'string') {
            return template.replace(/\{([^}]+)\}/g, (match, key) => {
                const value = this.getNestedProperty(context, key.trim());
                return value !== undefined ? value : match;
            });
        } else if (typeof template === 'object' && template !== null) {
            // Recursively interpolate object properties
            const result: any = {};
            for (const [key, value] of Object.entries(template)) {
                result[key] = this.interpolateTemplate(value, context);
            }
            return result;
        }
        return template;
    }

    private getNestedProperty(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    private sanitizeContext(context: any): any {
        // Remove sensitive information from context before logging
        const { password, token, apiKey, ...sanitized } = context;
        return sanitized;
    }

    private async sendNotification(userId: string, message: string, type: string): Promise<void> {
        // Implement your notification delivery logic
        console.log(`Sending ${type} to user ${userId}: ${message}`);

        // Example implementation:
        // await fetch('/api/notifications', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ userId, message, type })
        // });
    }
}


export default CustomActionEngine