// validationRulesCode.ts

import { NotificationPreferences } from "../communications/chat/ChatSettingsModal";

export function generateValidationRulesCode(validationRules: string[]): string {
  // Generate validation rules code
  const validationRulesCode = validationRules
    .map((rule) => `    ${rule}: string;`)
    .join("\n");

  return validationRulesCode;
}



// Define a function to validate NotificationPreferences
export const isValidNotificationPreferences = (data: any): data is NotificationPreferences => {
  // Check if data has the required properties and their types
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.emailNotifications === 'boolean' &&
    typeof data.pushNotifications === 'boolean' &&
    typeof data.enableNotifications === 'boolean' &&
    typeof data.notificationSound === 'string'
    // Add additional checks if necessary
  );
};
