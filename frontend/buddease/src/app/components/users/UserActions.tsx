// user/UserActions.ts
import { Persona } from "@/app/pages/personas/Persona";
import { createAction } from "@reduxjs/toolkit";
import { Data } from "../models/data/Data";
import { UserProfile } from "../snapshots/userSnapshotData";
import { DataProcessingTask } from "../todos/tasks/DataProcessingTask";
import { User, UserData } from "./User";
import { UserRole } from "./UserRole";

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
  
  saveUserProfilesSuccess: createAction<{ profiles: UserProfile[] }>("saveUserProfiilesSuccess"),
  
  fetchUserSuccess: createAction<{ user: UserData }>("fetchUserSuccess"),
  fetchUserFailure: createAction<{ error: string }>("fetchUserFailure"),
  fetchUserRequest: createAction<{userId: User["id"]}>("fetchUserRequest"),
  fetchUserDataSuccess: createAction<{ users: User[], totalCount: number }>("fetchUserDataSuccess"),
  fetchUserDataFailure: createAction<{ error: string }>("fetchUserDataFailure"),
  
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
  
 
  fetchUserData: createAction<{
    userId: string;
    username: string;
    email: string;
    tier: string;
    token: string;
    uploadQuota: number;
    avatarUrl: string;
    createdAt: Date;
    updatedAt: Date;
    fullName: string;
    isVerified: boolean;
    isAdmin: boolean;
    isActive: boolean;
    bio: string;
    userType: string;
    hasQuota: boolean;
    profilePicture: string;
    processingTasks: DataProcessingTask[];
    role: UserRole;
    persona: Persona;
    data: Data;
  }>('fetchUserData'),
  
  // Batch
  bulkUpdateUserRolesFailure: createAction<{ error: string }>("bulkUpdateUserRolesFailure"),
};
