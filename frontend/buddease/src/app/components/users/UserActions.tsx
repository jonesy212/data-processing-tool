// user/UserActions.ts
import { createAction } from "@reduxjs/toolkit";
import { UserProfile } from "../snapshots/userSnapshotData";
import { User } from "./User";

export const UserActions = {
  
  // General User Actions
  updateUser: createAction<{ id: number, newData: any }>("updateUser"),
  deleteUser: createAction<number>("deleteUser"),
  createUserSuccess: createAction<{user: User}>("createUserSuccess"),
  createUserFailure: createAction<{ error: string }>("createUserFailure"),
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
  fetchUserRequest: createAction<{userId: User["id"]}>("fetchUserRequest"),
  
  
  fetchUserById: createAction<{ userId: User['id'] }>("fetchUserById"),
  fetchUserByIdSuccess: createAction<{ user: User }>("fetchUserByIdSuccess"),
  fetchUserByIdFailure: createAction<{ error: string }>("fetchUserByIdFailure"),
  

  fetchUserProfile: createAction<{ userProfile: UserProfile }>("fetchUserProfile"),
  fetchUserProfileSuccess: createAction<{ userProfile: UserProfile }>("fetchUserProfileSuccess"),
  fetchUserProfileFailure: createAction<{ error: string }>("fetchUserProfileFailure"),
  updateUserRequest: createAction<{ updatedUserData: any }>("updateUserRequest"),
  updateUserSuccess: createAction<{ user: User }>("updateUserSuccess"),
  updateUserFailure: createAction<{ error: string }>("updateUserFailure"),
  
  //Search Requests
  searchUsersSuccess: createAction<{ users: User[] }>("searchUsersSuccess"),
  searchUsersRequest: createAction<{ searchTerm: string }>("searchUsersRequest"),
  searchUsersFailure: createAction<{ error: string }>("searchUsersFailure"),
  
  // Bulk Requests
  
    batchCreate: createAction<any[]>("batchCreate"),
    batchDelete: createAction<number[]>("batchDelete"),
    batchDeleteSuccess: createAction<number[]>("batchDeleteSuccess"),
    batchDeleteFailure: createAction<{ error: string }>("batchDeleteFailure"),
  
  createUsers: createAction<User[]>("createUsers"),
  deleteUsers: createAction<number[]>("deleteUsers"),
  deleteUserSuccess: createAction<number>("deleteUserSuccess"),
  deleteUserFailure: createAction<{ error: string }>("deleteUserFailure"),
  deleteUsersSuccess: createAction<number[]>("deleteUsersSuccess"),
  deleteUsersFailure: createAction<{ error: string }>("deleteUsersFailure"),
  
  fetchUsersRequest: createAction("fetchUsersRequest"),
  fetchUsersSuccess: createAction<{ users: any[] }>("fetchUsersSuccess"),
  fetchUsersFailure: createAction<{ error: string }>("fetchUsersFailure"),
  
  updateUsers: createAction<{ ids: number[], newData: any[] }>("updateUsers"),
  updateUsersRequest: createAction<{ updatedUsersData: any }>("updateUserRequest"),
  updateUsersSuccess: createAction<{ users: User[] }>("updateUserSuccess"),
  updateUsersFailure: createAction<{ error: string }>("updateUsersFailure"),
  
  updateUserRoleSuccess: createAction<{ user: User }>("updateUserRoleSuccess"),
  updateUserRoleFailure: createAction<{ error: string }>("updateUserRoleFailure"),

  updateUserRoles: createAction<{ ids: number[], newRole: string }>("updateUserRoles"),
  



  // Batch
  bulkUpdateUserRolesFailure: createAction<{ error: string }>("bulkUpdateUserRolesFailure"),
};
