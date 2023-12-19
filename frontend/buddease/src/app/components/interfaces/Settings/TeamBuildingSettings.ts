interface TeamBuildingSettings {
    enableTeamBuilding: boolean;
    teamBuildingActivities: string[]; // List of available team-building activities
    teamBuildingBudget: number; // Budget allocated for team-building activities
    teamBuildingFrequency: 'weekly' | 'monthly' | 'quarterly' | 'custom'; // Frequency of team-building activities
    customTeamBuildingSchedule?: string; // Custom schedule for team-building if frequency is 'custom'
    teamBuildingLocations: string[]; // List of preferred locations for team-building activities
    teamBuildingFacilitator: string; // Facilitator for team-building events
    teamBuildingFeedbackEnabled: boolean; // Allow team members to provide feedback on team-building activities
    // Add any other specific settings for team building based on project needs
  }
  
  // Example usage
  const teamBuildingSettings: TeamBuildingSettings = {
    enableTeamBuilding: true,
    teamBuildingActivities: ['Ice Breaker Games', 'Outdoor Adventure', 'Virtual Team Games'],
    teamBuildingBudget: 5000,
    teamBuildingFrequency: 'monthly',
    teamBuildingLocations: ['Office', 'Outdoor Spaces', 'Event Venues'],
    teamBuildingFacilitator: 'John Doe',
    teamBuildingFeedbackEnabled: true,
    // Add other specific settings based on your project needs
  };
  
 
  
  interface MeetingsSettings {
    enableMeetings: boolean;
    // Add specific settings for meetings
  }
  
  interface BrainstormingSettings {
    enableBrainstorming: boolean;
    // Add specific settings for brainstorming
  }
  
  interface CollaborationPreferences {
    teamBuilding: TeamBuildingSettings;
    projectManagement: ProjectManagementSettings;
    meetings: MeetingsSettings;
    brainstorming: BrainstormingSettings;
  }