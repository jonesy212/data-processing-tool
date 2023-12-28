// NotificationMessagesFactory.js

class NotificationMessagesFactory {
  static createWelcomeMessage(userName: string): string {
    return `Welcome, ${userName}!`;
  }

  static createErrorMessage(errorType: string): string {
    return `An ${errorType} occurred.`;
  }

  // Add more methods for other notification types

  static createCustomMessage(customText: string): string {
    return customText;
  }
}

export default NotificationMessagesFactory;
