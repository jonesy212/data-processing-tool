import { ExtendedUser, User } from '@/app/components/users/User';
import { Message } from '@/app/generators/GenerateChatInterfaces';
import { ChatRoom } from '@/app/components/communications/chat/ChatRoomDashboard';
import { NotificationType } from '@/app/components/support/NotificationContext';
import UserRoles from './UserRoles';
import PersonaTypeEnum from '@/app/pages/personas/PersonaBuilder';
import userSettings from '@/app/configs/UserSettings';
import { DataSharingPreferences } from '../settings/PrivacySettings';
import { ActivityStatus } from '@/app/pages/profile/Profile';

// Function to transform friends into the required format
const transformFriends = (friends: User[]): User[] => {
  return friends.map(friend => ({
    id: friend.id ? friend.id.toString() : undefined,
    username: friend.username,
    firstName: friend.firstName,
    lastName: friend.lastName,
    email: friend.email,
    tier: friend.tier,
    token: friend.token,
    uploadQuota: friend.uploadQuota,
    avatarUrl: friend.avatarUrl,
    bannerUrl: friend.bannerUrl,
   
    createdAt: friend.createdAt,
    updatedAt: friend.updatedAt,
    fullName: friend.fullName,
    roles: friend.roles,
   
    bio: friend.bio,
    userType: friend.userType,
    hasQuota: friend.hasQuota,
    profilePicture: friend.profilePicture,
   
    processingTasks: friend.processingTasks,
    role: friend.role,
    persona: friend.persona,
    friends: friend.friends,
   
    blockedUsers: friend.blockedUsers,
    settings: friend.settings,
    interests: friend.interests,
    followers: friend.followers,
   
    privacySettings: friend.privacySettings,
    notifications: friend.notifications,
    activityLog: friend.activityLog,
    socialLinks: friend.socialLinks,
   
    relationshipStatus: friend.relationshipStatus,
    hobbies: friend.hobbies,
    skills: friend.skills,
    achievements: friend.achievements,
   
    profileVisibility: friend.profileVisibility,
    profileAccessControl: friend.profileAccessControl,
    activityStatus: friend.activityStatus,
    isAuthorized: friend.isAuthorized,
    
    preferences: friend.preferences,
    storeId: friend.storeId,
    childIds: friend.childIds,
    relatedData: friend.relatedData,
    // Add any other properties you might need for the User object
  }));
};



export const createSystemMessage = (
  type: NotificationType, // The type of notification
  content: string, // The main content of the message
  additionalData?: string, // Additional data, if any
  userId?: number, // User ID, optional
  sender?: User | ExtendedUser, // Sender information, optional
  channel?: ChatRoom | undefined, // Channel information, optional
): Message => {

  // If no sender is provided, use a default system user
  const defaultSender: ExtendedUser = {
    // Default user properties
    _id: "system",
    id: "system",
    username: "System",
    firstName: "System",
    lastName: "User",
    email: "system@example.com",
    tags: [],
    isUserMessage: false, // Default user message flag
    tier: "", // Default tier (if applicable)
    token: "", // Default token (if applicable)
    uploadQuota: 0, // Default upload quota
    avatarUrl: "", // Default avatar URL
    createdAt: new Date().toISOString(), // Set to current date/time
    updatedAt: new Date().toISOString(), // Set to current date/time
    fullName: "System User", // Full name (derived from first and last names)
    roles: [], // Default roles (empty array)
    bio: "", // Default bio (if applicable)
    userType: "system", // User type (e.g., system user)
    hasQuota: false, // Default quota status
    profilePicture: "", // Default profile picture URL
    processingTasks: [], // Default processing tasks (empty array)
    role: UserRoles.System, // Default role
    bannerUrl: null, // Default banner URL
    persona: {
      type: {} as PersonaTypeEnum,
      id: "",
      name: "",
      age: 0,
      gender: "",
     
    }, // Default persona (if applicable)
    friends: [], // Default friends list (empty array)
    settings: userSettings, // Default settings (empty object)
    interests: [], // Default interests (empty array)
    followers: [], // Default followers (empty array)
    blockedUsers: [], // Default blocked users (empty array)
    privacySettings: {
      isDataSharingEnabled: false,
      dataSharing: {} as DataSharingPreferences,
      thirdPartyTracking: false
    }, // Default privacy settings (empty object)
    activityLog: [], // Default activity log (empty array)
    socialLinks: {}, // Default social links (empty object)
    relationshipStatus: "", // Default relationship status (if applicable)
    hobbies: [], // Default hobbies (empty array)
    skills: [], // Default skills (empty array)
    achievements: [], // Default achievements (empty array)
    profileVisibility: "public", // Default profile visibility
    profileAccessControl: {
      friendsOnly: false, // Default to not limited to friends only
      allowTagging: false, // Default to not allowing tagging
      blockList: [], // Default block list (empty array)
      allowMessagesFromFriendContacts: false, // Default to not allowing messages from friend contacts
      allowMessagesFromNonContacts: false, // Default to not allowing messages from non-contacts
      shareProfileWithSearchEngines: false, // Default to not sharing with search engines
      isPrivate: false, // Default to not private
      isPrivateOnly: false, // Default to not private only
      isPrivateOnlyForContacts: false, // Default to not private only for contacts
      isPrivateOnlyForGroups: false, // Default to not private only for groups
      activityStatus: {} as ActivityStatus,
      isAuthorized: true,
    }, // Default profile access control (empty object)
    activityStatus: "active", // Default activity status
    isAuthorized: true, // Default authorization status
    preferences: {
      refreshUI: () => {}
    }, // Default preferences (empty object)
    storeId: 0, // Default store ID (if applicable)
    // todo
    // socialMedia, achievements, education, workExperience,
    notifications: {
      enabled: false,
      notificationType: "sms",
      channels: {
        email: false,
        push: false,
        sms: false,
        chat: false,
        calendar: false,
        audioCall: false,
        videoCall: false,
        screenShare: false,
      },
      types: {
        mention: false,
        reaction: false,
        follow: false,
        poke: false,
        activity: false,
        thread: false,
        inviteAccepted: false,
        task: false,
        file: false,
        meeting: false,
        directMessage: false,
        announcement: false,
        reminder: false,
        project: false,
        inApp: false,
        comment: false,
        like: false,
        dislike: false,
        bookmark: false,
      },
    },

    childIds: [], relatedData: [],
    workspaceUrl: "",
    workspaces: [],
    products: [],
    permissions: [],
    status: "",
    statusText: "",
    activeProduct: "",
    activeWorkspace: "",
    activeRole: "",
    activePermissions: [],
    activeWorkspacePermissions: [],
    activeProductPermissions: [],
    activeRolePermissions: [],
    activeWorkspaceRoles: [],
    activeProductRoles: [],
    activeWorkspaceProducts: [],
    activeProductWorkspaces: [],
    activeRoleWorkspaces: [],
    activeRoleProducts: [],
  };


const friendData: User[] = [
  {
    id: 1, username: "friend1",
    firstName: "",
    lastName: "",
    email: "",
    tier: "",
    token: null,
    uploadQuota: 0,
    avatarUrl: null,
    bannerUrl: null,
    createdAt: undefined,
    updatedAt: undefined,
    fullName: null,
    roles: [],
    bio: null,
    userType: "",
    hasQuota: false,
    profilePicture: null,
    processingTasks: [],
    role: undefined,
    persona: null,
    friends: [],
    blockedUsers: [],
    settings: null,
    interests: [],
    followers: [],
    privacySettings: undefined,
    notifications: undefined,
    activityLog: [],
    socialLinks: undefined,
    relationshipStatus: null,
    hobbies: [],
    skills: [],
    achievements: [],
    profileVisibility: "",
    profileAccessControl: undefined,
    activityStatus: "",
    isAuthorized: false,
    preferences: undefined,
    storeId: 0,
    childIds: [], relatedData: [],
  },
  {
    id: 2, username: "friend2",
    firstName: "",
    lastName: "",
    email: "",
    tier: "",
    token: null,
    uploadQuota: 0,
    avatarUrl: null,
    bannerUrl: null,
    createdAt: undefined,
    updatedAt: undefined,
    fullName: null,
    roles: [],
    bio: null,
    userType: "",
    hasQuota: false,
    profilePicture: null,
    processingTasks: [],
    role: undefined,
    persona: null,
    friends: [],
    blockedUsers: [],
    settings: null,
    interests: [],
    followers: [],
    privacySettings: undefined,
    notifications: undefined,
    activityLog: [],
    socialLinks: undefined,
    relationshipStatus: null,
    hobbies: [],
    skills: [],
    achievements: [],
    profileVisibility: "",
    profileAccessControl: undefined,
    activityStatus: "",
    isAuthorized: false,
    preferences: undefined,
    storeId: 0,
    childIds: [], relatedData: [],
  },
];

  const following = transformFriends(friendData.slice(0, 2)); // Transform the first two friends
  const followers = transformFriends(friendData.slice(2)); // Transform the last two friends

  return {
    // Unique Identifier and Type
    id: uuidv4(),
    type: type,
  
    // User Information
    fullName: "John Doe",
    roles: [UserRoles.Administrator, UserRoles.Editor],
    userType: "premium",
    hasQuota: true,
    profilePicture: "https://example.com/avatar.jpg",
    processingTasks: [
      {
        id: 1,
        name: "Data Cleaning",
        description: "Cleaning and preprocessing the input dataset",
        status: "in-progress",
        inputDatasetId: 1,
        outputDatasetId: 2,
        createdAt: new Date(),
        startTime: new Date(),
        completionTime: null,
        user: {
          id: 1,
          username: defaultSender.username,
          email: defaultSender.email,
          firstName: "",
          lastName: "",
          tier: "",
          token: null,
          uploadQuota: 0,
          avatarUrl: null,
          bannerUrl: null,
          createdAt: undefined,
          updatedAt: undefined,
          fullName: null,
          roles: [],
          bio: null,
          userType: "",
          hasQuota: false,
          profilePicture: null,
          processingTasks: [],
          role: undefined,
          persona: null,
          friends: [],
          blockedUsers: [],
          settings: null,
          interests: [],
          followers: [],
          privacySettings: undefined,
          notifications: undefined,
          activityLog: [],
          socialLinks: undefined,
          relationshipStatus: null,
          hobbies: [],
          skills: [],
          achievements: [],
          profileVisibility: "",
          profileAccessControl: undefined,
          activityStatus: "",
          isAuthorized: false,
          preferences: undefined,
          storeId: 0
        },
      },
      {
        id: 2,
        name: "Data Analysis",
        description: "Analyzing data trends and generating reports",
        status: "not-started",
        inputDatasetId: 2,
        outputDatasetId: null,
        createdAt: new Date(),
        startTime: null,
        completionTime: null,
        user: {
          id: 2,
          username: defaultSender.username,
          email: defaultSender.email,
          firstName: "",
          lastName: "",
          tier: "",
          token: null,
          uploadQuota: 0,
          avatarUrl: null,
          bannerUrl: null,
          createdAt: undefined,
          updatedAt: undefined,
          fullName: null,
          roles: [],
          bio: null,
          userType: "",
          hasQuota: false,
          profilePicture: null,
          processingTasks: [],
          role: undefined,
          persona: null,
          friends: [],
          blockedUsers: [],
          settings: null,
          interests: [],
          followers: [],
          privacySettings: undefined,
          notifications: undefined,
          activityLog: [],
          socialLinks: undefined,
          relationshipStatus: null,
          hobbies: [],
          skills: [],
          achievements: [],
          profileVisibility: "",
          profileAccessControl: undefined,
          activityStatus: "",
          isAuthorized: false,
          preferences: undefined,
          storeId: 0
        },
      },
    ],
    // Update the role property to match the UserRole interface
    role: {
      role: "editor",
      responsibilities: ["Edit content", "Manage submissions"],
      permissions: ["edit", "delete", "view"],
      positions: [
        { title: "Content Editor", level: 2 },
        { title: "Senior Editor", level: 3 },
      ],
      salary: 60000, // Optional salary
      includes: ["team lead", "project manager"], // Optional includes
    },
    persona: {
      type: PersonaTypeEnum.ProjectManager,
      id: "persona1",
      name: "The Strategist",
      age: 30,
      gender: "male",
    },
    friends: transformFriends(friendData),
    settings: userSettings,// Example settings can be structured as needed
    interests: ["coding", "gaming", "reading"],
    privacySettings: {
      isDataSharingEnabled: false,
      dataSharing: {
        sharingLevel: "",
        sharingScope: "",
        sharingFrequency: "",
        sharingDuration: "",
        sharingPermissions: [],
        sharingAccess: "",
        sharingLocation: "",
        allowSharing: false,
        allowSharingWith: [],
        allowSharingWithTeams: [],
        allowSharingWithGroups: [],
        allowSharingWithPublic: false,
        allowSharingWithTeamsAndGroups: false,
        isAllowingSharingWithPublic: [],
        isAllowingingSharingWithTeamsAndGroups: [],
        isAllowingSharingWithPublicAndTeamsAndGroups: [],
        isAllowingingSharingWithPublicAndTeams: [],
        isAllowingSharingWithPublicAndTeamsAndGroupsAndPublic: [],
        isAllowingSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups: [],
        isAllowingSharingWithTeamsAndGroups: [],
        isAllowingSharingingWithPublicAndTeamsAndGroups: [],
        isAllowingSharingWithPublicAndTeams: [],
        enableDatabaseEncryption: false,
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
          databaseVersion: "",
          appVersion: "",
          enableDatabaseEncryption: false
        },
        allowSharingWithPublicAndTeams: false,
        allowSharingWithPublicAndGroups: false,
        allowSharingWithPublicAndTeamsAndGroups: false,
        allowSharingWithPublicAndTeamsAndGroupsAndPublic: false,
        allowSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups: false
      }, // Example data sharing preferences
      thirdPartyTracking: true,
    },
    activityLog: [],
    socialLinks: {
      linkedin: "https://linkedin.com/in/johndoe",
      twitter: "https://twitter.com/johndoe",
    },
    relationshipStatus: "single",
    hobbies: ["photography", "hiking"],
    skills: ["JavaScript", "TypeScript", "React"],
    achievements: ["Completed JavaScript Course", "Won Hackathon 2023"],
    profileVisibility: "public",
    profileAccessControl: {
      friendsOnly: true,
      allowTagging: false,
      blockList: ["blockedUser1"],
      allowMessagesFromFriendContacts: true,
      allowMessagesFromNonContacts: false,
      shareProfileWithSearchEngines: true,
      isPrivate: false,
      isPrivateOnly: false,
      isPrivateOnlyForContacts: false,
      isPrivateOnlyForGroups: false,
      activityStatus: "active",
      isAuthorized: true,
    },
    activityStatus: "active",
    isAuthorized: true,
    preferences: {
      refreshUI: () => {}, // Function placeholder
    },
    storeId: 1, // Example store ID
  
    // Sender Information
    senderId: sender?.id !== undefined ? String(sender.id) : defaultSender._id,
    sender: sender || defaultSender,
  
    // Channel Information
    channel: channel || {
      id: "channel1",
      creatorId: "creator1",
      topics: ["topic1", "topic2"],
      messages: [],
      users: [
        { id: "user1", firstName: "John", lastName: "Doe" }, // Example User object
        { id: "user2", firstName: "Jane", lastName: "Smith" } // Example User object
      ] as User[],
    },
    channelId: channel?.id || "channel1",
  
    // Message Content
    content: content,
    additionalData: additionalData || undefined,
    tags: [],
    userId: userId,
    timestamp: new Date().toISOString(),
    text: content,
    isUserMessage: false,
    receiver: undefined,
    description: "System generated message",
  
    // Default User Information
    username: defaultSender.username,
    firstName: defaultSender.firstName,
    lastName: defaultSender.lastName,
    email: defaultSender.email,
    isOnline: false,
    lastSeen: new Date().toISOString(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    imageUrl: "https://example.com/image.jpg",
    bio: "Software Developer and Tech Enthusiast",
    website: "https://johndoe.com",
    location: "San Francisco, CA",
    coverImageUrl: "https://example.com/cover.jpg",
    following: following,
    followers: followers,
    notifications: defaultSender.notifications, // Use the notifications from the default sender
    chatRooms: [],
    blockedUsers: [],
    blockedBy: [],
    tier: "gold",
    token: "sampleToken123",
    uploadQuota: 1000, // Example upload quota
    avatarUrl: "https://example.com/avatar.jpg",
    bannerUrl: "https://example.com/banner.jpg",
  };
  
};


export { transformFriends };
