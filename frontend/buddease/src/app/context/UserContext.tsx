//UserContext.tsx
import { ActivityStatus } from '@/app/pages/profile/Profile';
import { DataSharingPreferences } from '@/app/components/settings/PrivacySettings';
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "../components/users/User";
import UserRoles from "../components/users/UserRoles";
import useAuthentication from "../components/hooks/useAuthentication";
import useSocialAuthentication from "../components/hooks/commHooks/useSocialAuthentication";
import React from "react";
import ProfileAccessControl from "../pages/profile/Profile";
import { refreshUI } from '@/app/components/snapshots/refreshUI'

interface UserContextType {
  user: User | null;
  fetchUserData: () => void;
  isLoggedIn: boolean;
  login: (userData: any) => void;
  logout: () => void;
  fetchSocialAuthProviders: () => void;
  initiateSocialLogin: (provider: string) => void;
  children: React.ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<UserContextType> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { login, logout } = useAuthentication();
  const { socialAuthProviders, fetchSocialAuthProviders, initiateSocialLogin } =
    useSocialAuthentication();

  const fetchUserData = async () => {
    // Replace with actual data fetching logic
    const userData = await fetchUserDataFromApi();
    setUser(userData);
    setIsLoggedIn(true); // Assuming user data fetch implies user is logged in
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const value: UserContextType = {
    user,
    fetchUserData,
    isLoggedIn,
    login,
    logout,
    fetchSocialAuthProviders,
    initiateSocialLogin,
    children,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

const fetchUserDataFromApi = async (): Promise<User> => {
  // Mock API call
  return {
    bannerUrl: "", 
    roles: [],
     storeId: 0, 
     childIds: [],
     relatedData: [],

    interests: [],
    followers: [],
    preferences: {
      refreshUI: refreshUI
    },
    privacySettings: {
      hidePersonalInfo: true,
      enablePrivacyMode: true,
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
      isDataSharingEnabled: true, 
      dataSharing: {} as DataSharingPreferences,
      thirdPartyTracking: false,
    },
    notifications: {
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
        bookmark: false
      },
      enabled: true,
      notificationType: "all",
    },
    activityLog: [],
    socialLinks: {},
    relationshipStatus: "none",
    hobbies: [],
    skills: [],
    achievements: [],
    profileVisibility: "public",
    profileAccessControl: {
      friendsOnly: true,
      allowTagging: true,
      blockList: [],
      allowMessagesFromNonContacts: true,
      shareProfileWithSearchEngines: true,

      isPrivate: false,
      isPrivateOnly: false,
      isPrivateOnlyForContacts: false,
      isPrivateOnlyForGroups: false,

      allowMessagesFromFriendContacts: true, activityStatus: ActivityStatus, isAuthorized: false
    },
    activityStatus: "none",
    isAuthorized: true,

    _id: "id-123",
    username: "John Doe",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    tier: "free",
    token: "mock-token",
    uploadQuota: 1000,
    avatarUrl: "https://example.com/avatar.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
    fullName: "John Doe",
    bio: "",
    userType: "individual",
    hasQuota: true,
    profilePicture: "",
    processingTasks: [],
    role: UserRoles.Moderator,
    persona: null,
    friends: [],
    blockedUsers: [],
    settings: null,
    isVerified: false,
    isSubscribed: false,
    isOnline: false,
    isDeleted: false,
    isBlocked: false,
    isBanned: false,
    isSuspended: false,
    isAdmin: false,
    isModerator: true,
    isStaff: false,
    isOwner: false,
    isSuper: false,
  };
};
