import { LanguageEnum } from "../components/communications/LanguageEnum";
import { NotificationPreferences } from "../components/communications/chat/ChatSettingsModal";
import { CryptoNotificationTypes } from "../components/settings/NotificationChannels";
import { PrivacySettings } from "../components/settings/PrivacySettings";

type NotificationTypeString = 'priceAlerts' | 'tradeConfirmation' | 'marketNews';


interface NotificationPreferences {
  mobile: NotificationPreferences;
  email: NotificationPreferences;
  push: NotificationPreferences;
  chat: NotificationPreferences;
  calendar: NotificationPreferences;
  audioCall: NotificationPreferences;
  videoCall: NotificationPreferences;
  screenShare: NotificationPreferences;
  mention: NotificationPreferences;
  reaction: NotificationPreferences;
  follow: NotificationPreferences;
  poke: NotificationPreferences;
  activity: NotificationPreferences;
  thread: NotificationPreferences;
  inviteAccepted: NotificationPreferences;
  task: NotificationPreferences;
  file: NotificationPreferences;
  meeting: NotificationPreferences;
  directMessage: NotificationPreferences;
  announcement: NotificationPreferences;
  reminder: NotificationPreferences;
  project: NotificationPreferences;
  inApp: NotificationPreferences;
  priceAlerts: NotificationPreferences;
  tradeConfirmation: NotificationPreferences;
  marketNews: NotificationPreferences;
}
interface CryptoPreferences {
  preferredCryptoAssets?: string[]; // List of preferred cryptocurrencies
  tradeNotifications?: {
    enabled: boolean; // Whether trade notifications are enabled
    notificationTypes?: NotificationTypeString; // Use NotificationTypeString here
  };
}


interface UserPreferences {
  // General Preferences
  theme?: 'light' | 'dark'; // Example of a theme preference
  language?: LanguageEnum; // Preferred language
  fontSize?: 'small' | 'medium' | 'large'; // Font size for accessibility
  colorScheme?: string; // Color scheme for UI
  fontStyles?: { fontFamily: string; fontSize: number }; // Font styles
  
  // Notifications Preferences
  notifications?: {
    email: boolean; // Email notifications enabled/disabled
    sms: boolean; // SMS notifications enabled/disabled
    pushNotifications: boolean; // Push notifications enabled/disabled
    desktopNotifications?: boolean; // Desktop notifications enabled/disabled
    emailFrequency?: 'immediate' | 'daily' | 'weekly'; // Frequency of email notifications
    smsFrequency?: 'immediate' | 'daily' | 'weekly'; // Frequency of SMS notifications
    customNotifications?: any; // Placeholder for custom notification preferences
  };
  notificationPreferences?: NotificationPreferences; // Detailed notification preferences
  
  // Crypto Preferences
  cryptoPreferences?: CryptoPreferences;

  // Privacy Preferences
  privacy?: {
    profileVisibility: 'public' | 'private' | 'friends'; // Profile visibility settings
    dataSharing: boolean; // Whether user agrees to data sharing
    twoFactorAuthentication: boolean; // Whether two-factor authentication is enabled
    sessionTimeout?: number; // Timeout duration for user sessions (in minutes)
    activityLogRetention?: '30days' | '60days' | '90days'; // Retention period for activity logs
  };
  privacySettings?: PrivacySettings; // Detailed privacy settings

  // Project Management Preferences
  projectManagement?: {
    defaultProjectView?: 'list' | 'board' | 'calendar'; // Default view for project management
    taskReminders?: {
      enabled: boolean; // Whether task reminders are enabled
      reminderTimes?: string[]; // Times for reminders (e.g., ['9:00 AM', '3:00 PM'])
    };
    phaseTracking?: boolean; // Whether to enable tracking of project phases
    ideationPhaseEnabled?: boolean; // Whether the ideation phase is enabled
    teamFormationPhaseEnabled?: boolean; // Whether the team formation phase is enabled
    brainstormingPhaseEnabled?: boolean; // Whether the brainstorming phase is enabled
    launchPhaseEnabled?: boolean; // Whether the launch phase is enabled
    dataAnalysisPhaseEnabled?: boolean; // Whether the data analysis phase is enabled
  };

  // Crypto Preferences
  cryptoPreferences?: {
    preferredCryptoAssets?: string[]; // List of preferred cryptocurrencies
    tradeNotifications?: {
      enabled: boolean; // Whether trade notifications are enabled
      notificationTypes?: CryptoNotificationTypes; // Types of trade notifications
    };
    portfolioView?: 'overview' | 'detailed'; // View mode for the crypto portfolio
    transactionHistoryRetention?: '30days' | '60days' | '90days'; // Retention period for transaction history
  };

  // Accessibility Preferences
  accessibility?: {
    highContrastMode?: boolean; // High contrast mode for better visibility
    fontSize?: string; // Font size for accessibility
  };

  // Integrations Preferences
  integrations?: {
    syncWithCalendar?: boolean; // Sync project tasks with calendar
    externalServices?: {
      googleDrive?: boolean; // Integration with Google Drive
      slack?: boolean; // Integration with Slack
      github?: boolean; // Integration with GitHub
    };
  };

  // Communication Preferences
  communications?: {
    chat?: {
      enabled: boolean; // Whether chat is enabled
      chatBubbleEnabled?: boolean; // Whether chat bubbles are enabled
      chatSoundEnabled: boolean; // Whether chat sounds are enabled
      chatVibrateEnabled: boolean; // Whether chat vibrations are enabled
      chatEmojiEnabled: boolean; // Whether chat emoji are enabled
      chatTimestampEnabled: boolean; // Whether chat timestamps are enabled
      chatFileAttachmentsEnabled: boolean; // Whether chat file attachments are enabled
      chatImage: boolean; // Whether chat images are enabled
      chatVideo: boolean; // Whether chat videos are enabled
      chatAudio: boolean; // Whether chat audio are enabled
      chatLocation: boolean; // Whether chat location is enabled
      chatShareLocation: boolean; // Whether chat share location is enabled
    }
    audioCommunicationEnabled: false,
    videoCommunicationEnabled: false,
    textCommunicationEnabled: false,
    realTimeCollaborationEnabled: false,
  }
  // Community and Monetization Preferences
  communityInvolvement?: {
    communityParticipationEnabled?: boolean; // Whether community participation is enabled
    unityPromotionEnabled?: boolean; // Whether unity promotion is enabled
    earningsReinvestmentEnabled?: boolean; // Whether earnings reinvestment is enabled
  };

  monetizationOpportunities?: {
    customAppDevelopmentEnabled?: boolean; // Whether custom app development opportunities are enabled
    teamIncentivesEnabled?: boolean; // Whether team incentives are enabled
    revenueContributionEnabled?: boolean; // Whether revenue contribution is enabled
  };

  // Other Preferences
  otherPreferences?: any; // Placeholder for any other preferences
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
// Function to simulate fetching user preferences from an asynchronous source (e.g., API call)
const getUserPreferences = async (): Promise<UserPreferences> => {
  // Simulate fetching user preferences asynchronously
  return new Promise<UserPreferences>((resolve, reject) => {
    setTimeout(() => {
      // Example user preferences
      const userPreferences: UserPreferences = {

        theme: 'light',
        language: LanguageEnum.English,
        fontSize: 'medium',
        colorScheme: '', // Define a default color scheme if needed
        fontStyles: {
          fontFamily: '', // Define a default font family if needed
          fontSize: 16 // Define a default font size if needed
        },
      
        // Notifications Preferences
        notifications: {
          email: false,
          sms: false,
          pushNotifications: false,
          desktopNotifications: false,
          emailFrequency: 'daily', // Set a default frequency if needed
          smsFrequency: 'weekly', // Set a default frequency if needed
        },

        notificationPreferences: {
          mobile: {
            email: false,
            sms: false,
            pushNotifications: false,
            desktopNotifications: false,
            emailFrequency: 'daily', // Set a default frequency if needed
            smsFrequency: 'weekly', // Set a default frequency if needed
          },
          desktop: {
            email: false,
            sms: false,
            pushNotifications: false,
            desktopNotifications: false,
            emailFrequency: 'daily', // Set a default frequency if needed
            smsFrequency: 'weekly', // Set a default frequency if needed
          },
          tablet: {
            email: false,
            sms: false,
            pushNotifications: false,
            desktopNotifications: false,
            emailFrequency: 'daily', // Set a default frequency if needed
            smsFrequency: 'weekly', // Set a default frequency if needed
          },
          emailNotifications: false,
          pushNotifications: false,
          smsNotifications: false,
          desktopNotifications: false,
          notificationSound: "",
          notificationVolume: 0,
          enableNotifications: false,
          notificationTypes: 'priceAlerts', // Or other types based on your use case
          customNotificationSettings: {}, // Define custom settings if needed
       
          // Crypto Preferences
          cryptoPreferences?: {};
        },

        
        
        // Privacy Preferences
        privacy: {
          profileVisibility: 'private',
          dataSharing: false,
          twoFactorAuthentication: false,
          sessionTimeout: 30, // Default session timeout in minutes
          activityLogRetention: '30days' // Default retention period for activity logs
        },
        privacySettings: {
          // Define detailed privacy settings if needed
          encryptData: true,
          accessControl: {
            roles: [],
            users: [],
            accessControlEnabled: false,
            accessControlType: 'whitelist',
            accessControlList: [] // Define a list of allowed users if needed
          } // Or other access control settings
        },
      
        // Project Management Preferences
        projectManagement: {
          defaultProjectView: 'list',
          taskReminders: {
            enabled: false,
            reminderTimes: [] // Define times for reminders if needed
          },
          phaseTracking: false,
          ideationPhaseEnabled: false,
          teamFormationPhaseEnabled: false,
          brainstormingPhaseEnabled: false,
          launchPhaseEnabled: false,
          dataAnalysisPhaseEnabled: false
        },

        // Crypto Preferences
        cryptoPreferences: {
          preferredCryptoAssets: [], // Define preferred cryptocurrencies if needed
          tradeNotifications: {
            enabled: false,
            notificationTypes: 'priceAlerts' // Or other types based on your use case
          },
          portfolioView: 'overview',
          transactionHistoryRetention: '30days' // Default retention period for transaction history
        },

        // Accessibility Preferences
        accessibility: {
          highContrastMode: false,
          fontSize: 'medium' // Adjust or add other properties if needed
        },

        // Integrations Preferences
        integrations: {
          syncWithCalendar: false,
          externalServices: {
            googleDrive: false,
            slack: false,
            github: false
          }
        },

        // Community and Monetization Preferences
        communityInvolvement: {
          communityParticipationEnabled: false,
          unityPromotionEnabled: false,
          earningsReinvestmentEnabled: false
        },
      
        monetizationOpportunities: {
          customAppDevelopmentEnabled: false,
          teamIncentivesEnabled: false,
          revenueContributionEnabled: false
        },

        // Communications Preferences
        communications: {
          chat: {
            enabled: true, // Chat is enabled
            chatBubbleEnabled: true, // Chat bubbles are enabled
            chatSoundEnabled: true, // Chat sounds are enabled
            chatVibrateEnabled: false, // Chat vibrations are disabled
            chatEmojiEnabled: true, // Chat emoji are enabled
            chatTimestampEnabled: false, // Chat timestamps are disabled
            chatFileAttachmentsEnabled: true, // Chat file attachments are enabled
            chatImage: true, // Chat images are enabled
            chatVideo: false, // Chat videos are disabled
            chatAudio: true, // Chat audio is enabled
            chatLocation: false, // Chat location is disabled
            chatShareLocation: true, // Chat share location is enabled
          },
          // Communication Preferences
          audioCommunicationEnabled: false,
          videoCommunicationEnabled: false,
          textCommunicationEnabled: false,
          realTimeCollaborationEnabled: false,
        },

        // Other Preferences
        otherPreferences: {},
        
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

