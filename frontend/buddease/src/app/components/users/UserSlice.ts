import { UserSettings } from "@/app/configs/UserSettings";
import { ProfileAccessControl } from "@/app/pages/profile/Profile";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NotificationPreferences } from "../communications/chat/ChatSettingsModal";
import { CustomTransaction, SmartContractInteraction } from "../crypto/SmartContractInteraction";
import { BaseData, Data } from "../models/data/Data";
import { T } from "../models/data/dataStoreMethods";
import { Task, TaskData } from "../models/tasks/Task";
import { Member } from "../models/teams/TeamMembers";
import { NFT } from "../nft/NFT";
import { Phase } from "../phases/Phase";
import { InitializedState } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Project } from "../projects/Project";
import { PrivacySettings } from "../settings/PrivacySettings";
import { Snapshots, SnapshotStoreConfig, SnapshotWithCriteria, TagsRecord } from "../snapshots";
import SnapshotStore from "../snapshots/SnapshotStore";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import { CustomComment } from "../state/redux/slices/BlogSlice";
import { Resource } from "../state/redux/slices/CollaborationSlice";
import { Deadline } from "../state/redux/slices/ProjectSlice";
import { RootState } from "../state/redux/slices/RootSlice";
import { DetailsItem } from "../state/stores/DetailsListStore";
import { NotificationSettings } from "../support/NotificationSettings";
import { ProjectFeedback } from "../support/ProjectFeedback";
import TodoImpl, { Todo } from "../todos/Todo";
import { BaseResponseType } from "../typings/types";
import { VideoData } from "../video/Video";
import { BlockchainAsset } from "./BlockchainAsset";
import { BlockchainPermissions } from "./BlockchainPermissions";
import { Address, Education, Employment, SocialLinks, User } from "./User";



interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  activity: string;
  details?: string;
  action: string
}

export interface UserManagerState {
  users: User[];
  fullName: string | null;
  bio: string | null;
  profilePicture: string | null;
  notification: { message: string; recipient: string; snapshot: string; } | string;
  data: BaseResponseType;
  uploadQuota: number;
  nftCollection: NFT[];
  userSupportFeedbackPreferences: ProjectFeedback[];

}

const initialState: UserManagerState = {
  users: [],
  fullName: "",
  bio: "",
  profilePicture: "",
  notification: "",
  data: {
    storeId: 0,
    role: {
      role: '',
      responsibilities: [],
      permissions: [],
      positions: [],
      includes: [],
    },
    deletedAt: null,
    lastLogin: undefined,
    lastLogout: undefined,
    lastPasswordChange: undefined,
    lastEmailChange: undefined,
    lastNameChange: undefined,
    lastProfileChange: undefined,
    lastAvatarChange: undefined,
    lastBannerChange: undefined,
    lastStatusChange: undefined,
    lastRoleChange: undefined,
    lastTierChange: undefined,
    lastPaymentChange: undefined,
    lastSubscriptionChange: undefined,
    lastEmailVerification: undefined,
    lastPasswordReset: undefined,
    lastLoginAttempt: undefined,
    loginAttempts: 0,
    lockoutEnd: null,
    twoFactorEnabled: false,
    phoneNumberConfirmed: false,
    securityStamp: null,
    accessFailedCount: null
  },
  uploadQuota: 0,
  nftCollection: [],
  userSupportFeedbackPreferences: [],
};

export const userManagerSlice = createSlice({
  name: "userManager",
  initialState,
  reducers: {


    // Action to set the entire user state
    setUser: (state, action: PayloadAction<UserManagerState>) => {
      return { ...state, ...action.payload };
    },
    
    updateFullName: (state, action: PayloadAction<string | null>) => {
      state.fullName = action.payload;
      return state;
    },

    updateBio: (state, action: PayloadAction<string | null>) => {
      state.bio = action.payload;
      return state;
    },

    updateProfilePicture: (state, action: PayloadAction<string | null>) => {
      state.profilePicture = action.payload;
      return state;
    },


    // Update the sendNotification logic
    sendNotification: (
      state: WritableDraft<UserManagerState>,
      action: PayloadAction<
        | string
        | {
          message: string;
          recipient: string;
          snapshot: string;
        }
      >
    ) => {
      // Check if the notification property is already a string
      if (typeof state.notification === "string") {
        // If it's a string, create a new object with the notification details
        state.notification = {
          message:
            typeof action.payload === "string"
              ? action.payload
              : action.payload.message,
          recipient:
            typeof action.payload === "string" ? "" : action.payload.recipient,
          snapshot:
            typeof action.payload === "string" ? "" : action.payload.snapshot,
        };
      } else {
        // If it's already an object, update its properties
        state.notification.message =
          typeof action.payload === "string"
            ? action.payload
            : action.payload.message;
        state.notification.recipient =
          typeof action.payload === "string" ? "" : action.payload.recipient;
        state.notification.snapshot =
          typeof action.payload === "string" ? "" : action.payload.snapshot;
      }
    },

    updateData: (state, action: PayloadAction<WritableDraft<User>>) => {
      state.data = {
        ...state.data,
        ...action.payload,
        securityStamp: action.payload.securityStamp || null,
      }
    },
    updateQuota: (state: WritableDraft<UserManagerState>, action: PayloadAction<number>) => {
      state.uploadQuota = action.payload;
    },

    fetchUsersSuccess: (state: WritableDraft<UserManagerState>, action: PayloadAction<{ users: User[] }>) => {
      state.users = action.payload.users.map((user) => ({ ...user })) as WritableDraft<User[]>;
    },


    updateUserFirstName: (
      state,
      action: PayloadAction<{ userId: string; firstName: string }>
    ) => {
      const { userId, firstName } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].firstName = firstName;
      }
    },

    updateUserLastName: (
      state,
      action: PayloadAction<{ userId: string; lastName: string }>
    ) => {
      const { userId, lastName } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].lastName = lastName;
      }
    },

    updateUserEmail: (
      state,
      action: PayloadAction<{ userId: string; email: string }>
    ) => {
      const { userId, email } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].email = email;
      }
    },


    addUserFriend: (
      state,
      action: PayloadAction<{ userId: string; friendId: WritableDraft<User> }>
    ) => {
      const { userId, friendId } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].friends.push(friendId);
      }
    },

    removeUserFriend: (
      state,
      action: PayloadAction<{ userId: string; friendId: WritableDraft<User> }>
    ) => {
      const { userId, friendId } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].friends = state.users[userIndex].friends.filter(
          (friend) => friend !== friendId
        );
      }
    },

    blockUser: (
      state,
      action: PayloadAction<{ userId: string; blockedUserId: WritableDraft<User> }>
    ) => {
      const { userId, blockedUserId } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].blockedUsers.push(blockedUserId);
      }
    },

    unblockUser: (
      state,
      action: PayloadAction<{ userId: string; unblockedUserId: string }>
    ) => {
      const { userId, unblockedUserId } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].blockedUsers = state.users[
          userIndex
        ].blockedUsers.filter(
          (blockedUser: WritableDraft<User>) =>
            blockedUser.id !== unblockedUserId
        );
      }
    },

    updateUserSettings: (
      state,
      action: PayloadAction<{ userId: string; settings: WritableDraft<UserSettings> }>
    ) => {
      const { userId, settings } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex] = { ...state.users[userIndex], settings };
      }
    },

    updateUserLocation: (
      state,
      action: PayloadAction<{ userId: string; location: string }>
    ) => {
      const { userId, location } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].location = location;
      }
    },

    updateUserInterests: (
      state,
      action: PayloadAction<{ userId: string; interests: string[] }>
    ) => {
      const { userId, interests } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].interests = interests;
      }
    },

    updateUserPrivacySettings: (
      state,
      action: PayloadAction<{ userId: string; privacySettings: WritableDraft<PrivacySettings> }>
    ) => {
      const { userId, privacySettings } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].privacySettings = privacySettings;
      }
    },


    updateUserNotifications: (
      state,
      action: PayloadAction<{ userId: string; notifications: WritableDraft<NotificationSettings> }>
    ) => {
      const { userId, notifications } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].notifications = notifications;
      }
    },

    updateUserActivityLog: (
      state,
      action: PayloadAction<{ userId: string; activityLog: WritableDraft<ActivityLogEntry>[] }>
    ) => {
      const { userId, activityLog } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].activityLog = activityLog;
      }
    },

    assignUserToProject: (
      state,
      action: PayloadAction<{ userId: string; projectId: WritableDraft<Project> }>
    ) => {
      const { userId, projectId } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].projects?.push(projectId);
      }
    },

    removeUserFromProject: (
      state,
      action: PayloadAction<{ userId: string; projectId: string }>
    ) => {
      const { userId, projectId } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].projects = state.users[userIndex].projects?.filter(
          (projectId) => projectId !== projectId
        );
      }
    },

    updateUserProjectRole: (
      state,
      action: PayloadAction<{ userId: string; projectId: string; role: string }>
    ) => {
      const { userId, projectId, role } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        const user = state.users[userIndex];
        const projectIndex = user.projects?.findIndex(
          (project) => project.id === projectId
        );
        if (projectIndex !== -1) {
          user.projects![projectIndex!].role = role;
        }
      }
    },

    updateUserProjectPermissions: (
      state,
      action: PayloadAction<{
        userId: string;
        projectId: string;
        permissions: string[];
      }>
    ) => {
      const { userId, projectId, permissions } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        const user = state.users[userIndex];
        const projectIndex = user.projects?.findIndex(
          (project) => project.id === projectId
        );
        if (projectIndex !== -1 && user.projects) {
          user.projects[projectIndex!].permissions = permissions;
        }
      }
    },

    updateUserProjectTasks: (
      state,
      action: PayloadAction<{
        userId: string;
        projectId: string;
        tasks: Task[];
      }>
    ) => {
      const { userId, projectId, tasks } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        const user = state.users[userIndex];
        const projectIndex = user.projects
          ? user.projects.findIndex((project) => project.id === projectId)
          : -1;
        if (projectIndex !== -1 && user.projects) {
          // Update tasks immutably using Immer
          user.projects[projectIndex].tasks = tasks.map((task) => ({
            ...task,
            // Ensure each task property is compatible with WritableDraft<Task>
            assignedTo: task.assignedTo as WritableDraft<User> | WritableDraft<User>[] | null,
            dependencies: task.dependencies as WritableDraft<Task>[] | null | undefined,
            previouslyAssignedTo: task.previouslyAssignedTo as WritableDraft<User>[],
            data: task.data as WritableDraft<TaskData> | null,
            tags: task.tags as WritableDraft<TagsRecord> | undefined,
            subtasks: task.subtasks as WritableDraft<TodoImpl<Todo, any>>[] | undefined,
            actions: task.actions as WritableDraft<SnapshotStoreConfig<T, Data>[]> | undefined,
            snapshotWithCriteria: task.snapshotWithCriteria as WritableDraft<SnapshotWithCriteria<Data, any>> | undefined,
            phase: task.phase as WritableDraft<Phase> | null | undefined,
            initialState: task.initialState as WritableDraft<InitializedState<Data, BaseData>> | null | undefined,
            comments: task.comments as (WritableDraft<Comment> | WritableDraft<CustomComment>)[] | undefined,
            updatedDetails: task.updatedDetails as WritableDraft<DetailsItem<BaseData>> | undefined,
            videoData: task.videoData as WritableDraft<VideoData> | undefined,
            members: task.members as string[] | WritableDraft<Member>[] | number[] | undefined,
            leader: task.leader as WritableDraft<User> | null | undefined,
            followers: task.followers as WritableDraft<User>[] | undefined,
            snapshotStores: task.snapshotStores as WritableDraft<SnapshotStore<BaseData, BaseData>>[] | undefined,
            snapshots: task.snapshots as WritableDraft<Snapshots<BaseData> | undefined> | undefined,
            // Add other properties here
          }));
        }
      }
    },

    updateUserProjectProgress: (
      state,
      action: PayloadAction<{ userId: string; projectId: string; progress: number }>
    ) => {
      const { userId, projectId, progress } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        const user = state.users[userIndex];
        if (user && user.projects) {
          const projectIndex = user.projects.findIndex(
            (project) => project.id === projectId
          );
          if (projectIndex !== -1) {
            user.projects[projectIndex].progress = progress;
          }
        }
      }
    },

    updateUserProjectCollaborators: (
      state,
      action: PayloadAction<{
        userId: string;
        projectId: string;
        collaborators: Collaborator[];
      }>
    ) => {
      const { userId, projectId, collaborators } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        const user = state.users[userIndex];
        const projectIndex = user.projects?.findIndex(
          (project) => project?.id === projectId
        );
        if (projectIndex !== undefined && user.projects) {
          user.projects[projectIndex].collaborators = collaborators;
        }
      }
    },

    updateUserProjectDeadlines: (
      state,
      action: PayloadAction<{
        userId: string;
        projectId: string;
        deadlines: Deadline[];
      }>
    ) => {
      const { userId, projectId, deadlines } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        const user = state.users[userIndex];
        const projectIndex = user.projects
          ? user.projects.findIndex((project) => project.id === projectId)
          : -1;
        if (projectIndex !== -1 && user.projects) {
          user.projects[projectIndex].deadlines = deadlines;
        }
      }
    },


    updateUserProjectResources: (
      state: WritableDraft<UserManagerState>,
      action: PayloadAction<{ userId: string; projectId: string; resources: Resource[] }>
    ) => {
      const { userId, projectId, resources } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        const user = state.users[userIndex];
        if (user.projects) {
          const projectIndex = user.projects.findIndex((project) => project.id === projectId);
          if (projectIndex !== -1) {
            user.projects[projectIndex].resources = resources;
          }
        }
      }
    },




    updateUserProjectBudget: (
      state: WritableDraft<UserManagerState>,
      action: PayloadAction<{ userId: string; projectId: string; budget: number }>
    ) => {
      const { userId, projectId, budget } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        const user = state.users[userIndex];
        if (user.projects) {
          const projectIndex = user.projects.findIndex((project) => project.id === projectId);
          if (projectIndex !== -1) {
            user.projects[projectIndex].budget = budget;
          }
        }
      }
    },

    updateUserProjectReports: (
      state: WritableDraft<UserManagerState>,
      action: PayloadAction<{ userId: string; projectId: string; reports: Report[] }>
    ) => {
      const { userId, projectId, reports } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        const user = state.users[userIndex];
        if (user.projects) {
          const projectIndex = user.projects.findIndex((project) => project.id === projectId);
          if (projectIndex !== -1) {
            user.projects[projectIndex].reports = reports;
          }
        }
      }
    },

    updateUserProjectNotifications: (
      state: WritableDraft<UserManagerState>,
      action: PayloadAction<{ userId: string; projectId: string; notifications: Notification[] }>
    ) => {
      const { userId, projectId, notifications } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        const user = state.users[userIndex];
        if (user.projects) {
          const projectIndex = user.projects.findIndex((project) => project.id === projectId);
          if (projectIndex !== -1) {
            user.projects[projectIndex].notifications = notifications;
          }
        }
      }
    },



    // Action to update user's phone number
    updateUserPhoneNumber: (state, action: PayloadAction<{ userId: string; phoneNumber: string }>) => {
      const { userId, phoneNumber } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].phoneNumber = phoneNumber;
      }
    },

    // Action to update user's address
    updateUserAddress: (state, action: PayloadAction<{ userId: string; address: WritableDraft<Address> }>) => {
      const { userId, address } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].address = address;
      }
    },

    // Action to update user's date of birth
    updateUserDateOfBirth: (state, action: PayloadAction<{ userId: string; dateOfBirth: Date }>) => {
      const { userId, dateOfBirth } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].dateOfBirth = dateOfBirth;
      }
    },

    // Action to update user's gender
    updateUserGender: (state, action: PayloadAction<{ userId: string; gender: string }>) => {
      const { userId, gender } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].gender = gender;
      }
    },

    // Action to update user's language
    updateUserLanguage: (state, action: PayloadAction<{ userId: string; language: string }>) => {
      const { userId, language } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].language = language;
      }
    },

    // Action to update user's education
    updateUserEducation: (state, action: PayloadAction<{ userId: string; education: WritableDraft<Education>[] }>) => {
      const { userId, education } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].education = education;
      }
    },

    // Action to update user's employment
    updateUserEmployment: (state, action: PayloadAction<{ userId: string; employment: WritableDraft<Employment>[] }>) => {
      const { userId, employment } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].employment = employment;
      }
    },

    updateUserSocialLinks: (
      state,
      action: PayloadAction<{ userId: string; socialLinks: SocialLinks }>
    ) => {
      const { userId, socialLinks } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].socialLinks = socialLinks;
      }
    },

    // Action to update user's relationship status
    updateUserRelationshipStatus: (
      state,
      action: PayloadAction<{ userId: string; relationshipStatus: string }>
    ) => {
      const { userId, relationshipStatus } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].relationshipStatus = relationshipStatus;
      }
    },

    // Action to update user's hobbies
    updateUserHobbies: (state, action: PayloadAction<{ userId: string; hobbies: string[] }>) => {
      const { userId, hobbies } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].hobbies = hobbies;
      }
    },

    // Action to update user's skills
    updateUserSkills: (state, action: PayloadAction<{ userId: string; skills: string[] }>) => {
      const { userId, skills } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].skills = skills;
      }
    },

    // Action to update user's achievements
    updateUserAchievements: (
      state,
      action: PayloadAction<{ userId: string; achievements: string[] }>
    ) => {
      const { userId, achievements } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].achievements = achievements;
      }
    },

    // Action to update user's profile visibility
    updateUserProfileVisibility: (
      state,
      action: PayloadAction<{ userId: string; visibility: string }>
    ) => {
      const { userId, visibility } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].profileVisibility = visibility;
      }
    },

    // Action to update user's profile access control
    updateUserProfileAccessControl: (
      state,
      action: PayloadAction<{ userId: string; accessControl: WritableDraft<ProfileAccessControl> }>
    ) => {
      const { userId, accessControl } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].profileAccessControl = accessControl;
      }
    },

    // Action to update user's activity status
    updateUserActivityStatus: (
      state,
      action: PayloadAction<{ userId: string; activityStatus: string }>
    ) => {
      const { userId, activityStatus } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].activityStatus = activityStatus;
      }
    },

    // Action to update user's security settings
    updateUserSecuritySettings: (
      state,
      action: PayloadAction<{ userId: string; settings: SecuritySettings }>
    ) => {
      const { userId, settings } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].securitySettings = settings;
      }
    },


    // Action to update user's notification preferences
    updateUserNotificationPreferences: (
      state,
      action: PayloadAction<{
        userId: string;
        notificationPreferences: NotificationPreferences;
      }>
    ) => {
      const { userId, notificationPreferences } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].notificationPreferences = notificationPreferences;
      }
    },

    // Action to update user's email verification status
    updateUserEmailVerificationStatus: (
      state,
      action: PayloadAction<{ userId: string; status: boolean }>
    ) => {
      const { userId, status } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].emailVerificationStatus = status;
      }
    },

    // Action to update user's phone verification status
    updateUserPhoneVerificationStatus: (
      state,
      action: PayloadAction<{ userId: string; status: boolean }>
    ) => {
      const { userId, status } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].phoneVerificationStatus = status;
      }
    },




    // Action to update user's wallet address
    updateUserWalletAddress: (
      state,
      action: PayloadAction<{ userId: string; walletAddress: string }>
    ) => {
      const { userId, walletAddress } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].walletAddress = walletAddress;
      }
    },


    // Action to update user's transaction history
    updateUserTransactionHistory: (
      state,
      action: PayloadAction<{
        userId: string;
        transaction: WritableDraft<CustomTransaction>;
      }>
    ) => {
      const { userId, transaction } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        const user = state.users[userIndex];
        if (!user.transactionHistory) {
          user.transactionHistory = [];
        }
        user.transactionHistory.push(transaction);
      }
    },
    // Action to update user's token balance
    updateUserTokenBalance: (
      state,
      action: PayloadAction<{ userId: string; tokenBalance: number }>
    ) => {
      const { userId, tokenBalance } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].tokenBalance = tokenBalance;
      }
    },

    // Action to update user's smart contract interactions
    updateUserSmartContractInteractions: (
      state,
      action: PayloadAction<{ userId: string; interaction: WritableDraft<SmartContractInteraction> }>
    ) => {
      const { userId, interaction } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        const user = state.users[userIndex];
        if (user.smartContractInteractions) {
          user.smartContractInteractions.push(interaction);
        } else {
          user.smartContractInteractions = [interaction];
        }
      }
    },

    // Action to update user's blockchain permissions
    updateUserBlockchainPermissions: (
      state,
      action: PayloadAction<{ userId: string; permissions: BlockchainPermissions }>
    ) => {
      const { userId, permissions } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].blockchainPermissions = permissions;
      }
    },

    // Action to update user's blockchain identity
    updateUserBlockchainIdentity: (
      state,
      action: PayloadAction<{ userId: string; identity: string }>
    ) => {
      const { userId, identity } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].blockchainIdentity = identity;
      }
    },

    // Action to update user's blockchain assets
    updateUserBlockchainAssets: (
      state,
      action: PayloadAction<{ userId: string; assets: BlockchainAsset[] }>
    ) => {
      const { userId, assets } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].blockchainAssets = assets;
      }
    },
    // Action to update user's NFT collection
    updateUserNFTCollection: (
      state,
      action: PayloadAction<{ userId: string; nftCollection: NFT[] }>
    ) => {
      const { userId, nftCollection } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].nftCollection = nftCollection;
      }
    },

    // Action to update user's DAO memberships
    updateUserDAOMemberships: (
      state,
      action: PayloadAction<{ userId: string; daoMemberships: string[] }>
    ) => {
      const { userId, daoMemberships } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].daoMemberships = daoMemberships;
      }
    },

    // Action to update user's decentralized storage usage
    updateUserDecentralizedStorageUsage: (
      state,
      action: PayloadAction<{ userId: string; usage: number }>
    ) => {
      const { userId, usage } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].decentralizedStorageUsage = usage;
      }
    },

    // Action to update user's decentralized identity
    updateUserDecentralizedIdentity: (
      state,
      action: PayloadAction<{ userId: string; identity: string }>
    ) => {
      const { userId, identity } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].decentralizedIdentity = identity;
      }
    },

    // Action to update user's decentralized messaging keys
    updateUserDecentralizedMessagingKeys: (
      state,
      action: PayloadAction<{ userId: string; keys: string[] }>
    ) => {
      const { userId, keys } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].decentralizedMessagingKeys = keys;
      }
    },

    // Action to update user's decentralized authentication status
    updateUserDecentralizedAuthentication: (
      state,
      action: PayloadAction<{ userId: string; isAuthenticated: boolean }>
    ) => {
      const { userId, isAuthenticated } = action.payload;
      const userIndex = state.users.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].decentralizedAuthentication = isAuthenticated;
      }
    },



    // Action to add an NFT to the user's collection
    addNFT: (state, action: PayloadAction<NFT>) => {
      state.nftCollection.push(action.payload);
    },
    // Action to remove an NFT from the user's collection
    removeNFT: (state, action: PayloadAction<string>) => {
      state.nftCollection = state.nftCollection.filter(nft => nft.id !== action.payload);
    },

    // Action to transfer an NFT from one user to another
    transferNFT: (state, action: PayloadAction<{ fromUserId: string, toUserId: string, nftId: string }>) => {
      const { fromUserId, toUserId, nftId } = action.payload;
      const fromUser = state.users.find(user => user.id === fromUserId);
      const toUser = state.users.find(user => user.id === toUserId);

      if (fromUser && toUser) {
        const transferredNFT = fromUser.nftCollection?.find(nft => nft.id === nftId);
        if (transferredNFT) {
          // Remove the NFT from the sender's collection
          fromUser.nftCollection = fromUser.nftCollection?.filter(nft => nft.id !== nftId);
          // Add the NFT to the recipient's collection
          toUser.nftCollection?.push(transferredNFT);
        }
      }
    },
  }

});

export const {
  updateFullName,
  updateBio,
  updateProfilePicture,
  sendNotification,
  updateData,
  updateQuota,
  fetchUsersSuccess,
  updateUserFirstName,
  updateUserLastName,
  updateUserEmail,

  addUserFriend,
  removeUserFriend,
  blockUser,
  unblockUser,
  updateUserSettings,
  updateUserLocation,
  updateUserInterests,
  updateUserPrivacySettings,
  updateUserNotifications,
  updateUserActivityLog,



  // // Additional user-related actions for project management
  assignUserToProject,
  removeUserFromProject,
  updateUserProjectRole,
  updateUserProjectPermissions,
  updateUserProjectTasks,
  updateUserProjectProgress,
  updateUserProjectCollaborators,
  updateUserProjectDeadlines,
  updateUserProjectResources,
  updateUserProjectBudget,
  updateUserProjectReports,
  updateUserProjectNotifications,

  // // Additional user-related actions
  updateUserPhoneNumber,
  updateUserAddress,
  updateUserDateOfBirth,
  updateUserGender,
  updateUserLanguage,
  updateUserEducation,
  updateUserEmployment,
  updateUserSocialLinks,
  updateUserRelationshipStatus,
  updateUserHobbies,
  updateUserSkills,
  updateUserAchievements,
  updateUserProfileVisibility,
  updateUserProfileAccessControl,
  updateUserActivityStatus,
  updateUserSecuritySettings,
  updateUserNotificationPreferences,
  updateUserEmailVerificationStatus,
  updateUserPhoneVerificationStatus,

  // // Additional user-related actions for web3 app
  updateUserWalletAddress,
  updateUserTransactionHistory,
  updateUserTokenBalance,
  updateUserSmartContractInteractions,
  updateUserBlockchainPermissions,
  updateUserBlockchainIdentity,
  updateUserBlockchainAssets,
  updateUserNFTCollection,
  updateUserDAOMemberships,
  updateUserDecentralizedStorageUsage,
  updateUserDecentralizedIdentity,
  updateUserDecentralizedMessagingKeys,
  updateUserDecentralizedAuthentication,


  addNFT,
  removeNFT,
  transferNFT
} = userManagerSlice.actions;

export const selectUsers = (state: { userManager: UserManagerState }) =>
  state.userManager.users;

// Selectors to access user state
export const selectNFTCollection = (state: RootState) => state.userManager.nftCollection;

export default userManagerSlice.reducer;

export type { ActivityLogEntry };
