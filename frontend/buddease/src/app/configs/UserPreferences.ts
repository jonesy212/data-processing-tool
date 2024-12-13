// userPreferences.ts
import { apiService } from "../api/ApiDetails";
import { LanguageEnum } from "../components/communications/LanguageEnum";
import { NotificationPreferences } from "../components/communications/chat/ChatSettingsModal";
import FileData from "../components/models/data/FileData";
import FolderData from "../components/models/data/FolderData";
import { CommonTrackerProps } from "../components/models/tracker/Tracker";
import { PrivacySettings } from "../components/settings/PrivacySettings";
import { NotificationData } from "../components/support/NofiticationsSlice";
import { User } from "../components/users/User";

type NotificationTypeString = 'priceAlerts' | 'tradeConfirmation' | 'marketNews';

interface CryptoPreferences {
  preferredCryptoAssets?: string[]; // List of preferred cryptocurrencies
  tradeNotifications?: {
    enabled: boolean; // Whether trade notifications are enabled
    notificationTypes?: NotificationTypeString; // Use NotificationTypeString here
  };
  portfolioView?: 'overview' | 'detailed'; // View mode for the crypto portfolio
  transactionHistoryRetention?: '30days' | '60days' | '90days'; // Retention period for transaction history
}



interface UserPreferences extends Partial<CommonTrackerProps> {
  // General Preferences
  theme?: 'light' | 'dark'; // Example of a theme preference
  language?: LanguageEnum; // Preferred language
  fontSize?: 'small' | 'medium' | 'large'; // Font size for accessibility
  colorScheme?: string; // Color scheme for UI
  fontStyles?: { fontFamily: string; fontSize: number }; // Font styles
  trackerId?: string;
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
  refreshUI: (updates: {
    stroke?: { width: number; color: string };
    strokeWidth?: number;
    fillColor?: string;
    isFlippedX?: boolean;
    isFlippedY?: boolean;
    x?: number;
    y?: number;
  }) => void,
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

const userPreferences: UserPreferences = {
  modules: "modules" as ModuleType,
  actions: [],
  reducers: [],
  trackFileChanges: (file: FileData) => {
    // Log file changes
    console.log(`File changed: ${file.fileName}`);
    console.log(`File size: ${file.fileSize} bytes`);
    console.log(`Last modified: ${new Date(file.lastModified).toLocaleString()}`);
  
    // Perform additional logic like sending data to a server or updating the UI
    // e.g., send file change event to a backend
    apiService.sendFileChangeEvent(file);
  },
  updateAppearance: (
    updates: {
      stroke: {
        width: number;
        color: string;
      },
    },
    fillColor: string,
    newStroke: { width: number; color: string },
    newFillColor: string
  ) => {
    // Log the appearance updates
    console.log('Updating appearance:');
    console.log('Current Stroke:', updates.stroke);
    console.log('New Stroke:', newStroke);
    console.log('Current Fill Color:', fillColor);
    console.log('New Fill Color:', newFillColor);
  
    // Assume we are updating a canvas or DOM element with the new styles
    const element = document.getElementById('elementId'); // Replace with actual element logic
    
    if (element) {
      // Update stroke width and color
      element.style.borderWidth = `${newStroke.width}px`;
      element.style.borderColor = newStroke.color;
  
      // Update fill color
      element.style.backgroundColor = newFillColor;
    }
  
    // Additional logic can be added to handle the UI refresh or updating any state
  }  
  };



// Function to simulate fetching user preferences from an asynchronous source (e.g., API call)
const getUserPreferences = async (): Promise<UserPreferences> => {
  // Simulate fetching user preferences asynchronously
  return new Promise<UserPreferences>((resolve, reject) => {
    setTimeout(() => {
      // Example user preferences
      const userPreferences: UserPreferences = {
        id: "",
        name: "",
        theme: 'light',
        fontSize: 'medium',
        language: LanguageEnum.English,
        phases: [],
        colorScheme: '', // Define a default color scheme if needed
        fontStyles: {
          fontFamily: '', // Define a default font family if needed
          fontSize: 16 // Define a default font size if needed
        },

        // User preference methods
        trackFolderChanges: (folder: FolderData) => { },
        updateUserProfile: (userData: User) => { },
        sendNotification: (notification: NotificationData, userData: User) => { },
        refreshUI: () => {},
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
          notificationTypes: {
            mention: true,
            reaction: true,
            follow: false,
            poke: true,
            activity: true,
            thread: true,
            inviteAccepted: false,
            task: true,
            file: true,
            meeting: true,
            directMessage: true,
            audioCall: true,
            videoCall: true,
            screenShare: true,
            chat: true,
            calendar: true,
            announcement: true,
            reminder: true,
            project: true,
            inApp: true,
          }, // Or other types based on your use case
          customNotificationSettings: {}, // Define custom settings if needed
          // Crypto Preferences
          cryptoPreferences: {},
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
            accessControlList: [], // Define a list of allowed users if needed
          },// Or other access control settings
          isDataSharingEnabled: false,
          dataSharing: {
            sharingLevel: 'public', // Or other sharing levels if needed
            sharingScope: 'team', // Or other sharing scopes if needed
            sharingFrequency: 'daily', // Set default sharing frequency
            sharingDuration: '30 days', // Set default sharing duration
            sharingPermissions: ['read'], // Set default sharing permissions if needed
            sharingAccess: 'private', // Set default sharing access if needed
            sharingLocation: 'global', // Set default sharing location if needed
            sharingTags: [], // Optional tags
            sharingGroups: [], // Optional groups
            sharingUsers: [], // Optional users
            allowSharing: true,
            allowSharingWith: [], // Define users or groups if needed
            allowSharingWithTeams: [], // Define teams if needed
            allowSharingWithGroups: [], // Define groups if needed
            allowSharingWithPublic: false, // Or other sharing options if needed
            allowSharingWithTeamsAndGroups: false, // Or other sharing options if needed
            allowSharingWithPublicAndTeams: false, // Or other sharing options if needed
            allowSharingWithPublicAndGroups: false, // Or other sharing options if needed
            allowSharingWithPublicAndTeamsAndGroups: false, // Or other sharing options if needed
            allowSharingWithPublicAndTeamsAndGroupsAndPublic: false, // Or other sharing options if needed
            allowSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups: false, // Or other sharing options if needed

            isAllowingSharingWithPublic: [], // Initialize empty if needed
            isAllowingingSharingWithTeamsAndGroups: [], // Initialize empty if needed
            isAllowingSharingWithPublicAndTeamsAndGroups: [], // Initialize empty if needed
            isAllowingingSharingWithPublicAndTeams: [], // Initialize empty if needed
            isAllowingSharingWithPublicAndTeamsAndGroupsAndPublic: [], // Initialize empty if needed
            isAllowingSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups: [], // Initialize empty if needed
            isAllowingSharingWithTeamsAndGroups: [], // Initialize empty if needed
            isAllowingSharingingWithPublicAndTeamsAndGroups: [], // Initialize empty if needed
            isAllowingSharingWithPublicAndTeams: [], // Initialize empty if needed

            enableDatabaseEncryption: false, // Set default encryption preference
            sharingOptions: [], // Define additional sharing options if needed
            sharingPreferences: { 
              email: false,
              push: false,
              sms: false,
              chat: false,
              calendar: false,
              audioCall: false,
              videoCall: false,
              fileSharing: false,
              blockchainCommunication: false,
              decentralizedStorage: false,
              databaseEncryption: false,
              databaseVersion: '',
              appVersion: '',
              enableDatabaseEncryption: false
             }, // Populate SharingPreferences
          },
          thirdPartyTracking: false
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

        // Method to track file changes and return updated file data
        trackFileChanges: function (file: FileData): FileData {
          // Implement logic to track file changes here, for example:
          file.lastModified = new Date(); // Update the last modified time
          console.log(`File changes tracked for: ${file.name}`);
          return file; // Return updated file data
        },

        stroke: {
          width: 3,
          color: "#333333",

        },
        strokeWidth: 3,
        fillColor: "#FFFFFF",
        isFlippedX: false,
        isFlippedY: false,
        x: 0,
        y: 0,
        // Method to update appearance by modifying stroke width/color and fill color
        updateAppearance: function (updates, newStroke, newFillColor) {
          if (this.stroke!) {
            this.stroke.width = newStroke.width;
            this.stroke.color = newStroke.color;
            this.fillColor = newFillColor; // Assigning a string value
        
            console.log(`Appearance updated: stroke ${newStroke.width}px ${newStroke.color}, fill ${newFillColor}`);
          }
        },
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

export { getUserPreferences, userPreferences };
export type { CryptoPreferences, UserPreferences };





  
  
  
  
  
  
  
// #Review

// Sample usage
// Tracking file changes
const file: FileData = {
  name: "sample.txt",
  size: 1024,
  type: "text/plain",
  lastModified: new Date("2024-01-01"),
  fileSize: 0,
  fileType: "",
  filePath: "",
  uploader: undefined,
  fileName: "",
  uploadDate: undefined,
  id: "",
  title: "",
  description: "",
  scheduledDate: undefined,
  createdBy: ""
};


if (userPreferences.trackFileChanges) {
  userPreferences.trackFileChanges(file);
}

if (userPreferences.updateAppearance) {
  userPreferences.updateAppearance(
    { stroke: { width: 5, color: "#FF0000" } },
    "#00FF00",
    { width: 3, color: "#0000FF" },
    "#FFFF00"
  );
}