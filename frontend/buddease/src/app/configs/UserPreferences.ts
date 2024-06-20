import { LanguageEnum } from "../components/communications/LanguageEnum";
import { NotificationPreferences } from "../components/communications/chat/ChatSettingsModal";

interface c {
  theme: string;
  language: LanguageEnum;
  ideationPhase: boolean;
  brainstormingPhase: boolean;
  launchPhase: boolean;
  dataAnalysisPhase: boolean;
  audioCommunicationEnabled: boolean;
  videoCommunicationEnabled: boolean;
  textCommunicationEnabled: boolean;
  realTimeCollaborationEnabled: boolean;
  notificationPreferences: NotificationPreferences; // Define the structure for notification preferences as needed
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
  



// Function to simulate fetching user preferences from an asynchronous source (e.g., API call)
const getUserPreferences = async (): Promise<UserPreferences> => {
  // Simulate fetching user preferences asynchronously
  return new Promise<UserPreferences>((resolve, reject) => {
    setTimeout(() => {
      // Example user preferences
      const userPreferences: UserPreferences = {
        notificationPreferences: {
          sms: false,
          mobile: false,
          desktop: false,
          notificationSound: "",
          notificationVolume: 0,
          emailNotifications: true,
          pushNotifications: false,
          enableNotifications: false,
        },
        theme: "",
        ideationPhase: false,
        brainstormingPhase: false,
        launchPhase: false,
        dataAnalysisPhase: false,
        audioCommunicationEnabled: false,
        videoCommunicationEnabled: false,
        textCommunicationEnabled: false,
        realTimeCollaborationEnabled: false,
        language: LanguageEnum.English,
        emailNotifications: false,
        pushNotifications: false,
        smsNotifications: false,
        desktopNotifications: false,
        customNotifications: undefined,
        ideationPhaseEnabled: false,
        teamFormationPhaseEnabled: false,
        brainstormingPhaseEnabled: false,
        launchPhaseEnabled: false,
        dataAnalysisPhaseEnabled: false,
        communityParticipationEnabled: false,
        unityPromotionEnabled: false,
        earningsReinvestmentEnabled: false,
        customAppDevelopmentEnabled: false,
        teamIncentivesEnabled: false,
        revenueContributionEnabled: false,
        fontSize: "",
        colorScheme: "",
        fontStyles: {
          fontFamily: "",
          fontSize: 0
        }
      };
      resolve(userPreferences);
    }, 1000); // Simulate 1 second delay
  });
};

// Example usage:
getUserPreferences()
  .then((userPreferences) => {
    console.log("User preferences:", userPreferences);
    // Do something with the user preferences
  })
  .catch((error) => {
    console.error("Error fetching user preferences:", error);
    // Handle errors
  });
  export default userPreferences;
export { getUserPreferences };
export type { UserPreferences };

