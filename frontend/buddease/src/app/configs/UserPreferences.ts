
interface UserPreferences {
  theme: string;
  ideationPhase: boolean;
  brainstormingPhase: boolean;
  launchPhase: boolean;
  dataAnalysisPhase: boolean;
  audioCommunicationEnabled: boolean;
  videoCommunicationEnabled: boolean;
  textCommunicationEnabled: boolean;
  realTimeCollaborationEnabled: boolean;
  language: string;
  notificationPreferences: any; // Define the structure for notification preferences as needed
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  desktopNotifications: boolean;
  customNotifications: any; // Define the structure for custom notifications as needed

  // Project Phases Preferences
  ideationPhaseEnabled: boolean;
  teamFormationPhaseEnabled: boolean;
  brainstormingPhaseEnabled: boolean;
  launchPhaseEnabled: boolean;
  dataAnalysisPhaseEnabled: boolean;

  // Community Involvement Preferences
  communityParticipationEnabled: boolean;
  unityPromotionEnabled: boolean;
  earningsReinvestmentEnabled: boolean;

  // Monetization Opportunities Preferences
  customAppDevelopmentEnabled: boolean;
  teamIncentivesEnabled: boolean;
  revenueContributionEnabled: boolean;
  fontSize: string; // Add fontSize property
  colorScheme: string; // Add colorScheme property
  fontStyles: { fontFamily: string; fontSize: number }; // Add fontStyles property

}
//todo update to modue names
export type ModuleType =
  "profileManagement"
  | "taskTracking"
  | "communication"
  | "inteigents"
  | "animations" 
  | "auth"
  | "calendar"
  | "cards"
  | "communications"
  | "admin"
  | "analytics"
  | "lazyLoadScriptConfig"
  | "tools"
  | "scheduler"
  | "containers"
  | "dashboards"
  | "documents"
  | "hooks"
  | "icons"
  | "interfaces"
  | "lists"
  | "models"
  | "navigation"
  | "onboarding"
  | "phases"
  | "projects"
  | "prompts"
  | "referrals"
  | "routing"
  | "shared"
  | "state"
  | "styling"
  | "subscriptions"
  | "support"
  | "tasks"
  | "teams"
  | "todos";
// userPreferences.ts
const userPreferences = {
  modules: "modules" as ModuleType,
  actions: [],
  reducers: [],
    // ... other userPreferences content
  };
  
  export default userPreferences;
  export type { UserPreferences };
