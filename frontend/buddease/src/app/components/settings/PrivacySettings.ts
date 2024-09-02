import { User } from "../users/User";
import { UserRole } from "../users/UserRole";

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
  hidePersonalInfo: true,
  enablePrivacyMode: false,
  enableTwoFactorAuth: false,
  restrictVisibilityToContacts: false,
  restrictFriendRequests: false,
  hideOnlineStatus: false,
  showLastSeenTimestamp: false,
  allowTaggingInPosts: false,
  enableLocationPrivacy: false,
  hideVisitedProfiles: false,
  restrictContentSharing: false,
  enableIncognitoMode: false,
  restrictContentSharingToContacts: false,
  restrictContentSharingToGroups: false,
};


export { selectedSettings };
