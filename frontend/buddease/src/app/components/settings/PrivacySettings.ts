import { User } from "../users/User";
import { UserRole } from "../users/UserRole";



interface DataSharingPreferences {
  sharingLevel: string; // 'public', 'private', etc.
  sharingScope: string; // 'team', 'organization', etc.
  sharingOptions: any[]; // Define sharing options if needed
  allowSharing: boolean;
  allowSharingWith: string[]; // Define users or groups if needed
  allowSharingWithTeams: string[]; // Define teams if needed
  allowSharingWithGroups: string[]; // Define groups if needed
  allowSharingWithPublic: boolean; // Allows sharing with public
  allowSharingWithTeamsAndGroups: boolean; // Allows sharing with both
  allowSharingWithPublicAndTeams: boolean; // Allows sharing with public and teams
  allowSharingWithPublicAndGroups: boolean; // Allows sharing with public and groups
  allowSharingWithPublicAndTeamsAndGroups: boolean; // Allows sharing with public, teams, and groups
  allowSharingWithPublicAndTeamsAndGroupsAndPublic: boolean, // Or other sharing options if needed
  allowSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups: boolean, // Or other sharing options if needed
       
}



export interface PrivacySettings {
  /**
* Indicates whether the data should be encrypted.
*/
  encryptData?: boolean;


  /**
   * List of roles or users with access to the snapshot data.
   */
  accessControl?: {
    roles?: UserRole[];
    users?: User[];
    accessControlEnabled: boolean,
    accessControlType: string,
    accessControlList: string[] // Define a list of allowed users if needed
  };

  /**
   * Specifies if the data should be anonymized.
   */
  anonymizeData?: boolean;

  /**
   * Metadata related to privacy policies or compliance.
   */
  privacyPolicyMetadata?: {
    policyVersion?: string;
    complianceStandards?: string[];
  };

  isDataSharingEnabled: boolean; // Determines if data sharing is enabled
  dataSharing: DataSharingPreferences; // Contains additional properties
  thirdPartyTracking: boolean;

  // Additional privacy settings
  hidePersonalInfo?: boolean; // Whether to hide personal information in user profiles
  enablePrivacyMode?: boolean; // Whether to enable privacy mode globally
  enableTwoFactorAuth?: boolean; // Whether to enable two-factor authentication
  restrictVisibilityToContacts?: boolean; // Whether to restrict content visibility to contacts only
  restrictFriendRequests?: boolean; // Whether to restrict friend requests
  hideOnlineStatus?: boolean; // Whether to hide online status
  showLastSeenTimestamp?: boolean; // Whether to show last seen timestamp
  allowTaggingInPosts?: boolean; // Whether to allow tagging in posts
  enableLocationPrivacy?: boolean; // Whether to enable location privacy
  hideVisitedProfiles?: boolean; // Whether to hide visited profiles from others
  restrictContentSharing?: boolean; // Whether to restrict content sharing
  enableIncognitoMode?: boolean; // Whether to enable incognito browsing mode
  restrictContentSharingToContacts?: boolean; // Whether to restrict content sharing to contacts
  restrictContentSharingToGroups?: boolean; // Whether to restrict content sharing to groups
  // Add other privacy-related settings as needed
}



const selectedSettings: PrivacySettings = {
  encryptData: true, // Indicates whether the data should be encrypted.
  accessControl: {
    roles: [], // List of roles with access, e.g., ["admin", "editor"]
    users: [], // List of users with access, e.g., ["user1", "user2"]
    accessControlEnabled: true,
    accessControlType: "role-based", // Type of access control
    accessControlList: [] // List of allowed users
  },
  anonymizeData: true, // Specifies if the data should be anonymized.
  privacyPolicyMetadata: {
    policyVersion: "1.0", // Version of the privacy policy
    complianceStandards: ["GDPR", "CCPA"] // Compliance standards met
  },
  // Indicates if data sharing is enabled
  isDataSharingEnabled: false,
  dataSharing: {
    sharingLevel: "public", // Sharing level, e.g., "public", "private", etc.
    sharingScope: "team", // Sharing scope, e.g., "team", "organization", etc.
    sharingOptions: [], // Define sharing options if needed
    allowSharing: true,
    allowSharingWith: [], // Define users or groups if needed
    allowSharingWithTeams: [], // Define teams if needed
    allowSharingWithGroups: [], // Define groups if needed
    allowSharingWithPublic: false, // Allows sharing with public
    allowSharingWithTeamsAndGroups: false, // Allows sharing with both
    allowSharingWithPublicAndTeams: false, // Allows sharing with public and teams
    allowSharingWithPublicAndGroups: false, // Allows sharing with public and groups
    allowSharingWithPublicAndTeamsAndGroups: false, // Allows sharing with public, teams, and groups
    allowSharingWithPublicAndTeamsAndGroupsAndPublic: false, 
    allowSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups: false

  },
  thirdPartyTracking: false, // Indicates if third-party tracking is enabled
  hidePersonalInfo: true, // Whether to hide personal information
  enablePrivacyMode: false, // Whether to enable privacy mode globally
  enableTwoFactorAuth: true, // Whether to enable two-factor authentication
  restrictVisibilityToContacts: true, // Restrict visibility to contacts only
  restrictFriendRequests: true, // Restrict friend requests
  hideOnlineStatus: true, // Whether to hide online status
  showLastSeenTimestamp: false, // Whether to show last seen timestamp
  allowTaggingInPosts: false, // Whether to allow tagging in posts
  enableLocationPrivacy: true, // Whether to enable location privacy
  hideVisitedProfiles: true, // Whether to hide visited profiles
  restrictContentSharing: false, // Whether to restrict content sharing
  enableIncognitoMode: false, // Whether to enable incognito mode
  restrictContentSharingToContacts: true, // Restrict content sharing to contacts only
  restrictContentSharingToGroups: false // Restrict content sharing to groups
};


export { selectedSettings };
export type {DataSharingPreferences}