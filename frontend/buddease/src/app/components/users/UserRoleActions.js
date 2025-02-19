"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoleActions = void 0;
// UserRoleActions.ts
var toolkit_1 = require("@reduxjs/toolkit");
exports.UserRoleActions = {
    assignUserRole: (0, toolkit_1.createAction)("assignUserRole"),
    assignUserRoleSuccess: (0, toolkit_1.createAction)("assignUserRoleSuccess"),
    assignUserRoleFailure: (0, toolkit_1.createAction)("assignUserRoleFailure"),
    fetchUserRolesRequest: (0, toolkit_1.createAction)("fetchUserRolesRequest"),
    fetchUserRolesSuccess: (0, toolkit_1.createAction)("fetchUserRolesSuccess"),
    fetchUserRolesFailure: (0, toolkit_1.createAction)("fetchUserRolesFailure"),
    createUserRoleRequest: (0, toolkit_1.createAction)("createUserRoleRequest"),
    createUserRoleSuccess: (0, toolkit_1.createAction)("createUserRoleSuccess"),
    createUserRoleFailure: (0, toolkit_1.createAction)("createUserRoleFailure"),
    updateUserRole: (0, toolkit_1.createAction)("updateUserRole"),
    updateUserRoleRequest: (0, toolkit_1.createAction)("updateUserRoleRequest"),
    updateUserRoleSuccess: (0, toolkit_1.createAction)("updateUserRoleSuccess"),
    updateUserRoleFailure: (0, toolkit_1.createAction)("updateUserRoleFailure"),
    removeUserRoleRequest: (0, toolkit_1.createAction)("removeUserRoleRequest"),
    removeUserRoleSuccess: (0, toolkit_1.createAction)("removeUserRoleSuccess"),
    removeUserRoleFailure: (0, toolkit_1.createAction)("removeUserRoleFailure"),
    // New batch actions
    updateUserRoles: (0, toolkit_1.createAction)("updateUserRole"),
    updateUserRolesSuccess: (0, toolkit_1.createAction)("updateUserRolesSuccess"),
    updateUserRolesFailure: (0, toolkit_1.createAction)("updateUserRoleFailure"),
    batchCreateUserRolesRequest: (0, toolkit_1.createAction)("batchCreateUserRolesRequest"),
    batchCreateUserRolesSuccess: (0, toolkit_1.createAction)("batchCreateUserRolesSuccess"),
    batchCreateUserRolesFailure: (0, toolkit_1.createAction)("batchCreateUserRolesFailure"),
    batchUpdateUserRolesRequest: (0, toolkit_1.createAction)("batchUpdateUserRolesRequest"),
    batchUpdateUserRolesSuccess: (0, toolkit_1.createAction)("batchUpdateUserRolesSuccess"),
    batchUpdateUserRolesFailure: (0, toolkit_1.createAction)("batchUpdateUserRolesFailure"),
    batchRemoveUserRolesRequest: (0, toolkit_1.createAction)("batchRemoveUserRolesRequest"),
    batchRemoveUserRolesSuccess: (0, toolkit_1.createAction)("batchRemoveUserRolesSuccess"),
    batchRemoveUserRolesFailure: (0, toolkit_1.createAction)("batchRemoveUserRolesFailure"),
};
