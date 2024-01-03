// user/UserActions.ts
import { createAction } from "@reduxjs/toolkit";
import { User } from "./User";

export const UserActions = {
  // General User Actions
  updateUser: createAction<{ id: number, newData: any }>("updateUser"),
  deleteUser: createAction<number>("deleteUser"),
  // User Profile Actions
  updateProfile: createAction<{ id: number, newFullName: string, newBio: string, newProfilePicture: string }>("updateProfile"),
  // Notification Actions
  sendNotification: createAction<string>("sendNotification"),
  // Data Actions
  updateData: createAction<{ id: number, newData: any }>("updateUserData"),
  // Quota Actions
  updateQuota: createAction<{ id: number, newQuota: number }>("updateQuota"),
  // Pagination Actions
  fetchUserSuccess: createAction<{ user: User }>("fetchUserSuccess"),
  fetchUserFailure: createAction<{ error: string }>("fetchUserFailure"),
  fetchUserRequest: createAction("fetchUserRequest"),
  
  updateUserRequest: createAction<{ updatedUserData: any }>("updateUserRequest"),
  updateUserSuccess: createAction<{ user: User }>("updateUserSuccess"),
  updateUserFailure: createAction<{ error: string }>("updateUserFailure"),

  // Bulk Requests
  deleteUsers: createAction<number[]>("deleteUsers"),
  updateUsers: createAction<{ ids: number[], newData: any[] }>("updateUsers"),
  fetchUsersRequest: createAction("fetchUsersRequest"),
  fetchUsersSuccess: createAction<{ users: any[] }>("fetchUsersSuccess"),
  fetchUsersFailure: createAction<{ error: string }>("fetchUsersFailure"),
  updateUsersRequest: createAction<{ updatedUsersData: any }>("updateUserRequest"),
  updateUsersSuccess: createAction<{ users: User[] }>("updateUserSuccess"),
  updateUsersFailure: createAction<{ error: string }>("updateUsersFailure"),
  deleteUsersSuccess: createAction<number[]>("deleteUsersSuccess"),
  deleteUsersFailure: createAction<{ error: string }>("deleteUsersFailure"),
  
};
