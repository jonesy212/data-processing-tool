export interface BrainstormingSettings {
    enableBrainstorming: boolean;
    brainstormingMethod: 'traditional' | 'mindMapping' | 'nominalGroup' | 'custom'; // Preferred brainstorming method
    customBrainstormingMethodDetails?: string; // Custom details for the brainstorming method if 'custom' is selected
    brainstormingDuration: number; // Default duration for a brainstorming session in minutes
    ideaSorting: 'voting' | 'ranking' | 'custom'; // Preferred method for sorting and selecting ideas
    customIdeaSortingDetails?: string; // Custom details for idea sorting if method is 'custom'
    collaborationTools: 'whiteboard' | 'onlinePlatform' | 'custom'; // Preferred collaboration tools
    customCollaborationToolsDetails?: string; // Custom details for collaboration tools if 'custom' is selected
    feedbackMechanism: 'anonymous' | 'named' | 'custom'; // Preferred feedback mechanism
    customFeedbackMechanismDetails?: string; // Custom details for feedback mechanism if 'custom' is selected
    // Add any other specific settings for brainstorming based on project needs
  }
  
  // Example usage
  const brainstormingSettings: BrainstormingSettings = {
    enableBrainstorming: true,
    brainstormingMethod: 'mindMapping',
    brainstormingDuration: 30,
    ideaSorting: 'voting',
    collaborationTools: 'onlinePlatform',
    feedbackMechanism: 'named',
    // Add other specific settings based on your project needs
  };
  

