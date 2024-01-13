import { BrainstormingSettings } from "../BrainstormingSettings";
import { TeamBuildingSettings } from "./TeamBuildingSettings";

interface CollaborationPreferences {
    teamBuilding: TeamBuildingSettings;
    projectManagement: ProjectManagementSettings;
    meetings: MeetingsSettings;
    brainstorming: BrainstormingSettings;
    // Add other collaboration preferences as needed
  }
// Example usage
const collaborationPreferences: CollaborationPreferences = {
  teamBuilding: {
    enableTeamBuilding: true,
    teamBuildingMethod: "workshops",
    teamBuildingFrequency: "monthly",
    teamBuildingBudget: 5000,
    teamBuildingActivities: [],
    teamBuildingLocations: [],
    teamBuildingFacilitator: "",
    teamBuildingFeedbackEnabled: false,
    projectTimeline: "mediumTerm",
  },
  projectManagement: {
    enableProjectManagement: true,
    projectManagementTools: ["Jira", "Trello", "Asana", "ScrumBoard"],
    projectTimeline: "mediumTerm",
    taskPrioritySystem: "urgentImportantMatrix",
    projectManagementMethodology: "custom",
    taskPrioritizationStrategy: "custom",
    sprintDuration: 1000,
    projectDocumentationEnabled: false,
    projectNotifications: "email",
    // Add other specific settings for project management based on project needs
  },
  meetings: {
      meetingDuration: 60,
      meetingPlatform: "custom",
      enableMeetings: false,
      recurringMeetings: false,
      meetingReminders: "custom",
      agendaManagement: "custom",
      meetingNotesEnabled: false,
      recordingEnabled: false
  },
  brainstorming: {
    enableBrainstorming: true,
    brainstormingMethod: "mindMapping",
    brainstormingDuration: 30,
    ideaSorting: "voting",
    collaborationTools: "onlinePlatform",
    feedbackMechanism: "named",
    // Add other specific settings for brainstorming based on project needs
  },
  // Add other collaboration preferences as needed
};
