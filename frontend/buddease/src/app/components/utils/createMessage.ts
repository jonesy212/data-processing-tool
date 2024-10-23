// createMessage.ts
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { v4 as uuidv4 } from "uuid"; // Ensure you have 'uuid' installed or use another method for unique IDs
import { User } from "../users/User";
import { ChatRoom } from "../calendar/CalendarSlice";
import { NotificationType } from "../support/NotificationContext";

export const createMessage = (
  type: NotificationType, // The type of notification
  content: string, // The main content of the message
  additionalData?: string, // Additional data, if any
  userId?: number, // User ID, optional
  sender?: User | undefined, // Sender information, optional
  channel?: ChatRoom | undefined, // Channel information, optional
): Message => {
  // If no sender is provided, use a default system user
  const defaultSender: User = {
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
    role: "system", // Default role
    persona: {
      type, id, name, age, gender,
    }, // Default persona (if applicable)
    friends: [], // Default friends list (empty array)
    settings: {
      userId, communicationMode,
      enableRealTimeUpdates, 
      defaultFileType,

      
    }, // Default settings (empty object)
    interests: [], // Default interests (empty array)
    followers: [], // Default followers (empty array)
    blockedUsers: [], // Default blocked users (empty array)
    privacySettings: {
      isDataSharingEnabled: "",
      dataSharing: "",
      thirdPartyTracking: "",
     
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
    }, // Default profile access control (empty object)
    activityStatus: "active", // Default activity status
    isAuthorized: true, // Default authorization status
    preferences: {
      refreshUI
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
      },
    },
  };

  return {
    id: uuidv4(),
    type: type,
    senderId: sender?.id !== undefined ? String(sender.id) : defaultSender._id,
    sender: sender || defaultSender,
    channel: channel || {
      id: "",
      creatorId: "",
      topics: [],
      messages: [],
      users: [],
    },
    channelId: channel?.id || "",
    content: content,
    additionalData: additionalData || undefined,
    tags: [],
    userId: userId,
    timestamp: new Date().toISOString(),
    text: content,
    isUserMessage: false,
    receiver: undefined,
    description: "",
    username: defaultSender.username,
    firstName: defaultSender.firstName,
    lastName: defaultSender.lastName,
    email: defaultSender.email,
    isOnline: false,
    lastSeen: new Date().toISOString(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    imageUrl: "",
    bio: "",
    website: "",
    location: "",
    coverImageUrl: "",
    following: [],
    followers: [],
    notifications: defaultSender.notifications, // Use the notifications from the default sender
    chatRooms: [],
    blockedUsers: [],
    blockedBy: [],
    tier: "",
    token: "",
    uploadQuota: 0,
    avatarUrl: "",
    bannerUrl: "",
    workspaceUrl: "",
    workspaces: [],
    products: [],
    roles: [],
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
};
