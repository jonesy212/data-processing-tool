// UserRoleActions.ts
import { createAction } from "@reduxjs/toolkit";

export const UserRoleActions = {
  // Existing single actions
  fetchUserRolesRequest: createAction("fetchUserRolesRequest"),
  fetchUserRolesSuccess: createAction<{userRoles: any[]}>("fetchUserRolesSuccess"),
  fetchUserRolesFailure: createAction<{ error: string }>("fetchUserRolesFailure"),

  createUserRoleRequest: createAction<any>("createUserRoleRequest"),
  createUserRoleSuccess: createAction("createUserRoleSuccess"),
  createUserRoleFailure: createAction<{ error: string }>("createUserRoleFailure"),

  updateUserRoleRequest: createAction<{ id: number, newRole: any }>("updateUserRoleRequest"),
  updateUserRoleSuccess: createAction<any>("updateUserRoleSuccess"),
  updateUserRoleFailure: createAction<{ error: string }>("updateUserRoleFailure"),

  removeUserRoleRequest: createAction<number>("removeUserRoleRequest"),
  removeUserRoleSuccess: createAction<number>("removeUserRoleSuccess"),
  removeUserRoleFailure: createAction<{ error: string }>("removeUserRoleFailure"),

  // New batch actions
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
