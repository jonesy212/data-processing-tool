import { Settings } from "../../state/stores/SettingsStore";
import { BrainstormingSettings } from "./BrainstormingSettings";

interface TeamBuildingSettings extends Settings {
  enableTeamBuilding: boolean;
  teamBuildingMethod: "iceBreakers" | "workshops" | "teamRetreat" | "custom"; // Preferred team-building method
  projectTimeline: "mediumTerm";
  teamBuildingActivities: string[]; // List of available team-building activities
  teamBuildingBudget: number; // Budget allocated for team-building activities
  teamBuildingFrequency: "weekly" | "monthly" | "quarterly" | "custom"; // Frequency of team-building activities
  customTeamBuildingSchedule?: string; // Custom schedule for team-building if the frequency is 'custom'
  teamBuildingLocations: string[]; // List of preferred locations for team-building activities
  teamBuildingFacilitator: string; // Facilitator for team-building events
  teamBuildingFeedbackEnabled: boolean; // Allow team members to provide feedback on team-building activities
  // Add any other specific settings for team building based on project needs
}

// Example usage
const teamBuildingSettings: TeamBuildingSettings = {
  id: 'teamBuildingSettings',
  enableTeamBuilding: true,
  teamBuildingMethod: "iceBreakers", // Fixed type error
  projectTimeline: "mediumTerm",
  
  teamBuildingActivities: [
    "Ice Breaker Games",
    "Outdoor Adventure",
    "Virtual Team Games",
  ],
  teamBuildingBudget: 5000,
  teamBuildingFrequency: "monthly",
  teamBuildingLocations: ["Office", "Outdoor Spaces", "Event Venues"],
  teamBuildingFacilitator: "John Doe",
  teamBuildingFeedbackEnabled: true,
  filter: (activity: string) => activity !== 'Outdoor Adventure', // Filter activities
  // Add other specific settings based on your project needs
};

interface CollaborationPreferences {
  teamBuilding: TeamBuildingSettings;
  projectManagement: ProjectManagementSettings;
  meetings: MeetingsSettings;
  brainstorming: BrainstormingSettings;
}


export type { TeamBuildingSettings };
