// UserRoleActions.ts
import { createAction } from "@reduxjs/toolkit";
import { User } from "./User";

export const UserRoleActions = {
  
  assignUserRole: createAction<{ userId: number, roleId: number }>("assignUserRole"),
  assignUserRoleSuccess: createAction<{ user: User }>("assignUserRoleSuccess"),
  assignUserRoleFailure: createAction<{ userId: number, role: number, error: string }>("assignUserRoleFailure"),
  
  fetchUserRolesRequest: createAction("fetchUserRolesRequest"),
  fetchUserRolesSuccess: createAction<{userRoles: any[]}>("fetchUserRolesSuccess"),
  fetchUserRolesFailure: createAction<{ error: string }>("fetchUserRolesFailure"),

  createUserRoleRequest: createAction<any>("createUserRoleRequest"),
  createUserRoleSuccess: createAction("createUserRoleSuccess"),
  createUserRoleFailure: createAction<{ error: string }>("createUserRoleFailure"),

  updateUserRole: createAction<{userId: number, role: string}>("updateUserRole"),
  updateUserRoleRequest: createAction<{ id: number, newRole: any }>("updateUserRoleRequest"),
  updateUserRoleSuccess: createAction<any>("updateUserRoleSuccess"),
  updateUserRoleFailure: createAction<{ error: string }>("updateUserRoleFailure"),
  
  removeUserRoleRequest: createAction<number>("removeUserRoleRequest"),
  removeUserRoleSuccess: createAction<number>("removeUserRoleSuccess"),
  removeUserRoleFailure: createAction<{ error: string }>("removeUserRoleFailure"),
  
  // New batch actions
  updateUserRoles: createAction<{userId: number, role: string}>("updateUserRole"),
  updateUserRolesSuccess: createAction<{ users: User[] }>("updateUserRolesSuccess"),
  updateUserRolesFailure: createAction<{ error: string }>("updateUserRoleFailure"),
  
  batchCreateUserRolesRequest: createAction<any[]>("batchCreateUserRolesRequest"),
  batchCreateUserRolesSuccess: createAction("batchCreateUserRolesSuccess"),
  batchCreateUserRolesFailure: createAction<{ error: string }>("batchCreateUserRolesFailure"),

  batchUpdateUserRolesRequest: createAction<{ ids: number[], newRoles: any[] }>("batchUpdateUserRolesRequest"),
  batchUpdateUserRolesSuccess: createAction<any[]>("batchUpdateUserRolesSuccess"),
  batchUpdateUserRolesFailure: createAction<{ error: string }>("batchUpdateUserRolesFailure"),

  batchRemoveUserRolesRequest: createAction<number[]>("batchRemoveUserRolesRequest"),
  batchRemoveUserRolesSuccess: createAction<number[]>("batchRemoveUserRolesSuccess"),
  batchRemoveUserRolesFailure: createAction<{ error: string }>("batchRemoveUserRolesFailure"),
};

export type UserRoleActionsType = typeof UserRoleActions;
