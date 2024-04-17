import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import { User, UserData } from "./User";

export interface UserManagerState {
  users: User[];
  fullName: string;
  bio: string;
  profilePicture: string;
  notification: string;
  data: UserData;
  uploadQuota: number;
}

const initialState: UserManagerState = {
  users: [],
  fullName: "",
  bio: "",
  profilePicture: "",
  notification: "",
  data: {} as UserData,
  uploadQuota: 0,
};

export const userManagerSlice = createSlice({
  name: "userManager",
  initialState,
  reducers: {
    updateFullName: (state, action: PayloadAction<string>) => {
      state.fullName = action.payload;
    },

    updateBio: (state, action: PayloadAction<string>) => {
      state.bio = action.payload;
    },

    updateProfilePicture: (state, action: PayloadAction<string>) => {
      state.profilePicture = action.payload;
    },

    sendNotification: (state, action: PayloadAction<string>) => {
      state.notification = action.payload;
    },

    updateData: (state, action: PayloadAction<User>) => {
      state.data = action.payload as WritableDraft<User>;
    },

    updateQuota: (state, action: PayloadAction<number>) => {
      state.uploadQuota = action.payload;
    },

    fetchUsersSuccess: (state, action: PayloadAction<{ users: User[] }>) => {
      state.users = action.payload.users as WritableDraft<User[]>;
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
  },
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

  // addUserFriend,
  // removeUserFriend,
  // blockUser,
  // unblockUser,
  // updateUserSettings,
  // updateUserLocation,
  // updateUserInterests,
  // updateUserPrivacySettings,
  // updateUserNotifications,
  // updateUserActivityLog,



  // // Additional user-related actions for project management
  // assignUserToProject,
  // removeUserFromProject,
  // updateUserProjectRole,
  // updateUserProjectPermissions,
  // updateUserProjectTasks,
  // updateUserProjectProgress,
  // updateUserProjectCollaborators,
  // updateUserProjectDeadlines,
  // updateUserProjectResources,
  // updateUserProjectBudget,
  // updateUserProjectReports,
  // updateUserProjectNotifications,

  // // Additional user-related actions
  // updateUserPhoneNumber,
  // updateUserAddress,
  // updateUserDateOfBirth,
  // updateUserGender,
  // updateUserLanguage,
  // updateUserEducation,
  // updateUserEmployment,
  // updateUserSocialLinks,
  // updateUserRelationshipStatus,
  // updateUserHobbies,
  // updateUserSkills,
  // updateUserAchievements,
  // updateUserProfileVisibility,
  // updateUserProfileAccessControl,
  // updateUserActivityStatus,
  // updateUserSecuritySettings,
  // updateUserNotificationPreferences,
  // updateUserEmailVerificationStatus,
  // updateUserPhoneVerificationStatus,

  // // Additional user-related actions for web3 app
  // updateUserWalletAddress,
  // updateUserTransactionHistory,
  // updateUserTokenBalance,
  // updateUserSmartContractInteractions,
  // updateUserBlockchainPermissions,
  // updateUserBlockchainIdentity,
  // updateUserBlockchainAssets,
  // updateUserNFTCollection,
  // updateUserDAOMemberships,
  // updateUserDecentralizedStorageUsage,
  // updateUserDecentralizedIdentity,
  // updateUserDecentralizedMessagingKeys,
  // updateUserDecentralizedAuthentication,
} = userManagerSlice.actions;

export const selectUsers = (state: { userManager: UserManagerState }) =>
  state.userManager.users;

export default userManagerSlice.reducer;

