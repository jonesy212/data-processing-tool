import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import { User, UserData } from "./User";

interface UserManagerState {
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

    updateData: (state, action: PayloadAction<UserData>) => {
      state.data = action.payload as WritableDraft<UserData>;
    },

    updateQuota: (state, action: PayloadAction<number>) => {
      state.uploadQuota = action.payload;
    },

    fetchUsersSuccess: (state, action: PayloadAction<{ users: User[] }>) => {
      state.users = action.payload.users as WritableDraft<User[]>;
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
} = userManagerSlice.actions;

export const selectUsers = (state: { userManager: UserManagerState }) =>
  state.userManager.users;

export default userManagerSlice.reducer;
