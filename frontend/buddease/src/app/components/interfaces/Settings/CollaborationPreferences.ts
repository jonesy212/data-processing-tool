import BrandingSettings from "@/app/libraries/theme/BrandingService";
import { BrainstormingSettings } from "../BrainstormingSettings";
import { TeamBuildingSettings } from "./TeamBuildingSettings";

interface CollaborationPreferences {
    teamBuilding: TeamBuildingSettings;
    projectManagement: ProjectManagementSettings;
    meetings: MeetingsSettings;
    brainstorming: BrainstormingSettings;
    branding: BrandingSettings; // Add branding settings
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
  branding: {
    logoUrl: "https://example.com/logo.png",
    themeColor: "#3366cc",
    secondaryThemeColor: "",
    backgroundColor: "",
    textColor: "",
    colors: {
      linkColor: "",
      primary: "",
      accent: "",
      success: "",
      error: "",
      warning: "",
      info: "",
      // Button Colors
    button: {
      color: "",
      colorHover: "",
      colorActive: "",
      colorDisabled: "",
      colorFocus: "",
      textColor: "",
      textColorHover: "",
      textColorActive: "",
      // Border Colors
      borderColorHover: "",
      borderColorActive: "",
      borderColorDisabled: "",
      borderColorFocus: "",
      },
    
    

    
    },
    borderColor: "",
    shadowColor: "",
    hoverColor: "",
    accentColor: "",
    successColor: "",
    errorColor: "",
    warningColor: "",
    infoColor: "",
    darkModeBackground: "",
    darkModeText: "",
    fontPrimary: "",
    fontSecondary: "",
    fontHeading: "",
    fontSizeSmall: "",
    fontSizeMedium: "",
    fontSizeLarge: "",
    lineHeightNormal: "",
    lineHeightMedium: "",
    lineHeightLarge: "",
    borderRadiusSmall: "",
    borderRadiusMedium: "",
    borderRadiusLarge: "",
    spacingSmall: "",
    spacingMedium: "",
    spacingLarge: ""
  },
  // Add other collaboration preferences as needed
};


export type { CollaborationPreferences };
