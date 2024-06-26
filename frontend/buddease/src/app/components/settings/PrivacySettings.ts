export interface PrivacySettings {
    hidePersonalInfo: boolean; // Whether to hide personal information in user profiles
    enablePrivacyMode: boolean; // Whether to enable privacy mode globally
    enableTwoFactorAuth: boolean; // Whether to enable two-factor authentication
    restrictVisibilityToContacts: boolean; // Whether to restrict content visibility to contacts only
    restrictFriendRequests: boolean; // Whether to restrict friend requests
    hideOnlineStatus: boolean; // Whether to hide online status
    showLastSeenTimestamp: boolean; // Whether to show last seen timestamp
    allowTaggingInPosts: boolean; // Whether to allow tagging in posts
    enableLocationPrivacy: boolean; // Whether to enable location privacy
    hideVisitedProfiles: boolean; // Whether to hide visited profiles from others
    restrictContentSharing: boolean; // Whether to restrict content sharing
  enableIncognitoMode: boolean; // Whether to enable incognito browsing mode
  restrictContentSharingToContacts: boolean,
  restrictContentSharingToGroups: boolean,
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
