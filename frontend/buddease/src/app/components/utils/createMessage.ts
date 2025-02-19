// createMessage.ts
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { v4 as uuidv4 } from "uuid"; // Ensure you have 'uuid' installed or use another method for unique IDs
import { ExtendedUser, User } from "../users/User";
import { ChatRoom } from "../calendar/CalendarSlice";
import { NotificationType } from "../support/NotificationContext";
import UserRoles, { UserRoleEnum } from "../users/UserRoles";
import UserRole from "../users/UserRoles";
import { ActivityStatus } from '@/app/pages/profile/Profile'
import { DataSharingPreferences } from "../settings/PrivacySettings";
import { Sender } from "../communications/chat/Communication";
import { UserPreferences } from "@/app/configs/UserPreferences";
import userSettings from '@/app/configs/UserSettings';
import PersonaTypeEnum from '@/app/pages/personas/PersonaBuilder';

type MessageProps = {
  type: NotificationType; 
  content: string | Content<T, K> | undefined;  // Align content type
  additionalData?: CustomSnapshotData<T, K, Meta>,
  sender: Sender; 
  channel: string; 
}

// The corrected createMessage function
export const createMessage = (
  type: NotificationType, // The type of notification
  content: string, // The main content of the message
  additionalData?: string, // Additional data, if any
  userId?: number, // User ID, optional
  sender?: Sender, // Sender information, optional
  channel?: ChatRoom, // Channel information, optional
): Message => {
  // Default system sender
  const defaultSender: Sender = {
    _id: "system",
    id: "system",
    username: "System",
    firstName: "System",
    lastName: "User",
    email: "system@example.com",
    tags: [],
    isUserMessage: false,
    tier: "",
    token: "",
    uploadQuota: 0,
    avatarUrl: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fullName: "System User",
    roles: [], // Ensure role matches UserRoleEnum
    bio: "",
    userType: "system",
    hasQuota: false,
    profilePicture: "",
    processingTasks: [],
    role: {
      role: "",
      responsibilities: [],
      permissions: [],
      positions: [{ title: "", level: 0 }],
      includes: [],
    },
    bannerUrl: null,
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
    profileVisibility: '',
    profileAccessControl: undefined,
    activityStatus: '',
    isAuthorized: false,
    preferences: {} as UserPreferences,
    storeId: 0
  };

  // Construct the Message object
  const message: Message = {
    id: uuidv4(),
    sender: sender || defaultSender,
    senderId: sender?.id || defaultSender.id,
    channel: channel || {
      id: "",
      creatorId: "",
      topics: [],
      messages: [],
      users: [],
    },
    channelId: channel?.id || "",
    content: content,
    additionalData: additionalData,
    tags: [],
    userId: userId,
    timestamp: new Date().toISOString(),
    text: content,
    isUserMessage: false,
    receiver: undefined,
    description: "",
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
    chatRooms: [],
    blockedUsers: [],
    blockedBy: [],
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    tier: "",
    token: null,
    uploadQuota: 0,
    avatarUrl: null,
    bannerUrl: null,
    fullName: null,
    roles: [],
    userType: "",
    hasQuota: false,
    profilePicture: null,
    processingTasks: [],
    role: undefined,
    persona: null,
    friends: [],
    settings: null,
    interests: [],
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
    preferences: {} as UserPreferences,
    storeId: 0
  };

  return message;
};

  export type { MessageProps }