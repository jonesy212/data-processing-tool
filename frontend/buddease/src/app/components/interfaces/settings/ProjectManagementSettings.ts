interface ProjectManagementSettings {
  
    enableProjectManagement: boolean;
    projectManagementTools: ['Jira', 'Trello', 'Asana', "ScrumBoard"],
    projectTimeline: string,
    taskPrioritySystem: "urgentImportantMatrix",

    projectManagementMethodology: 'agile' | 'waterfall' | 'custom'; // Preferred project management methodology
    customProjectManagementProcess?: string; // Custom process details if methodology is 'custom'
    taskPrioritizationStrategy: 'urgentImportantMatrix' | 'MoSCoW' | 'custom'; // Task prioritization strategy
    customTaskPrioritizationRules?: string; // Custom rules for task prioritization if strategy is 'custom'
    sprintDuration: number; // Duration of sprints in weeks (if using Agile methodology)
    projectDocumentationEnabled: boolean; // Enable project documentation
    projectNotifications: 'email' | 'slack' | 'custom'; // Preferred method of project notifications
    customNotificationSettings?: string; // Custom notification settings if method is 'custom'
    // Add any other specific settings for project management based on project needs
  }
  
  // Example usage
  const projectManagementSettings: ProjectManagementSettings = {
    enableProjectManagement: true,
    projectManagementTools: ['Jira', 'Trello', 'Asana', "ScrumBoard"],
    projectTimeline: "mediumTerm",
    taskPrioritySystem: "urgentImportantMatrix",
    projectManagementMethodology: 'agile',
    taskPrioritizationStrategy: 'urgentImportantMatrix',
    sprintDuration: 2,
    projectDocumentationEnabled: true,
    projectNotifications: 'slack',
    // Add other specific settings based on your project needs
  };
  