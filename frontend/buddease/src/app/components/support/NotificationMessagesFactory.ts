// NotificationMessagesFactory.js

class NotificationMessagesFactory {
  static createWelcomeMessage(userName: string): string {
    return `Welcome, ${userName}!`;
  }

  static createErrorMessage(errorType: string): string {
    return `An ${errorType} occurred.`;
  }

  static createSuccessMessge(successType: string): string {
    return `${successType} was successful.`;
  }

  // Add more methods for other notification types

  static createCustomMessage(customText: string): string {
    if (!customText) { 
      throw new Error("Custom text is required");
    }
    return customText;
  }

  static createSuccessMessage(successType: string, customText?: string): string {
    if(customText) {
      return customText;
    } else {
      return `${successType} was successful.`;
    }
  }

  static createFailureMessage(failureType: string, customText?: string): string { 
    if(customText) {
      return customText;
    } else {
      return `${failureType} failed.`;
    }
  }



  static createTaskErrorMessage(taskType: string, customText?: string): string { 
    if(customText) {
      return customText;
    } else {
      return `${taskType} task failed.`;
    }
  }
  static createTodoErrorMessage(todoType: string, customText?: string): string { 
    if (customText) {
      return customText;
    } else {
      return `${todoType} todo failed.`;
    }
  }
  static createNamingConventionsErrorMessage(name: string, customText?: string): string { 
    if (customText) {
      return customText;
    } else {
      return `The name ${name} does not follow conventions.`;
    }
  }
}

export default NotificationMessagesFactory;
