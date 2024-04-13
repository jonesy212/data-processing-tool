// UserListActions.ts
import { createAction } from "@reduxjs/toolkit";
import { User } from "../components/users/User";

export const UserListActions = {
  // Actions for manipulating lists of users
  addUserToList: createAction<User>("addUserToList"),
  removeUserFromList: createAction<number>("removeUserFromList"),
  
  // Actions for updating multiple users in the list
  updateUsersInList: createAction<{ users: User[]; updatedUsers: Partial<User>[] }>("updateUsersInList"),
  updateUsersInListRequest: createAction<{ updatedUsers: Partial<User>[] }>("updateUsersInListRequest"),
  updateUsersInListSuccess: createAction<{ updatedUsers: User[] }>("updateUsersInListSuccess"),
  updateUsersInListFailure: createAction<{ error: string }>("updateUsersInListFailure"),

  // Actions for fetching users from the list
  fetchUserFromListRequest: createAction<{ id: number }>("fetchUserFromListRequest"),
  fetchUserFromListSuccess: createAction<{ user: User }>("fetchUserFromListSuccess"),
  fetchUserFromListFailure: createAction<{ error: string }>("fetchUserFromListFailure"),
  
  // Add more actions as needed
};
