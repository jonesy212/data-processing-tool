"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.url = exports.fetchUserRequest = void 0;
// ApiUser.ts
var ApiClient_1 = require("@/app/api/ApiClient");
var ApiEndpoints_1 = require("@/app/api/ApiEndpoints");
var axiosInstance_1 = require("@/app/api/axiosInstance");
var Logger_1 = require("@/app/components/logging/Logger");
var dot_prop_1 = require("dot-prop");
var react_redux_1 = require("react-redux");
var react_router_dom_1 = require("react-router-dom");
var UserActions_1 = require("./UserActions");
var UserRoleActions_1 = require("./UserRoleActions");
var UserSlice_1 = require("./UserSlice");
// Other imports remain unchanged
var updateUI_1 = require("../documents/editing/updateUI");
var API_BASE_URL = dot_prop_1.default.getProperty(ApiEndpoints_1.endpoints, "users");
var fetchUserRequest = function (userId) { return ({
    type: "FETCH_USER_REQUEST",
    payload: userId,
}); };
exports.fetchUserRequest = fetchUserRequest;
var dispatch = (0, react_redux_1.useDispatch)();
// Dispatching the action
var userId = (0, react_router_dom_1.useParams)().userId; // Extract userId from URL params
// Convert userId to a number
var parsedUserId = Number(userId);
// Calling API_BASE_URL.single to get the URL string
exports.url = dot_prop_1.default.getProperty(API_BASE_URL, "single", [parsedUserId]);
// Dispatching the action with the correct userId
dispatch(UserActions_1.UserActions.fetchUserRequest({ userId: parsedUserId }));
var UserService = /** @class */ (function () {
    function UserService() {
        // Constructor remains unchanged
        var _this = this;
        this.createUser = function (newUser) { return __awaiter(_this, void 0, void 0, function () {
            var API_ADD_ENDPOINT, headers, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        API_ADD_ENDPOINT = dot_prop_1.default.getProperty(API_BASE_URL, "add");
                        if (!API_ADD_ENDPOINT) {
                            throw new Error("Add endpoint not found");
                        }
                        headers = (0, ApiClient_1.createHeaders)();
                        return [4 /*yield*/, axiosInstance_1.default.post(API_ADD_ENDPOINT, newUser, {
                                headers: headers, // Pass headers configuration in the request
                            })];
                    case 1:
                        response = _a.sent();
                        UserActions_1.UserActions.createUserSuccess({ user: response.data });
                        (0, UserSlice_1.sendNotification)("User ".concat(newUser.username, " created successfully"));
                        return [2 /*return*/, response.data];
                    case 2:
                        error_1 = _a.sent();
                        UserActions_1.UserActions.createUserFailure({ error: String(error_1) });
                        (0, UserSlice_1.sendNotification)("Error creating user: ".concat(error_1));
                        console.error("Error creating user:", error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.fetchUser = function (userId) { return __awaiter(_this, void 0, void 0, function () {
            var API_SINGLE_ENDPOINT, response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        API_SINGLE_ENDPOINT = dot_prop_1.default.getProperty(API_BASE_URL, "single", [
                            Number(userId),
                        ]);
                        if (!API_SINGLE_ENDPOINT) {
                            throw new Error("Single endpoint not found");
                        }
                        return [4 /*yield*/, axiosInstance_1.default.get(API_SINGLE_ENDPOINT)];
                    case 1:
                        response = _a.sent();
                        UserActions_1.UserActions.fetchUserSuccess({ user: response.data });
                        (0, UserSlice_1.sendNotification)("User with ID ".concat(userId, " fetched successfully"));
                        return [2 /*return*/, response.data];
                    case 2:
                        error_2 = _a.sent();
                        UserActions_1.UserActions.fetchUserFailure({ error: String(error_2) });
                        (0, UserSlice_1.sendNotification)("Error fetching user with ID ".concat(userId, ": ").concat(error_2));
                        console.error("Error fetching user:", error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.fetchUserProfile = function (userId) { return __awaiter(_this, void 0, void 0, function () {
            var user, userProfile, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.fetchUserById(userId)];
                    case 1:
                        user = _a.sent();
                        userProfile = __assign({ id: user.id, name: user.name, email: user.email }, user);
                        UserActions_1.UserActions.fetchUserProfileSuccess({ userProfile: userProfile });
                        (0, UserSlice_1.sendNotification)("User profile for user with ID ".concat(userId, " fetched successfully"));
                        return [2 /*return*/, userProfile];
                    case 2:
                        error_3 = _a.sent();
                        UserActions_1.UserActions.fetchUserProfileFailure({ error: String(error_3) });
                        (0, UserSlice_1.sendNotification)("Error fetching user profile for user with ID ".concat(userId, ": ").concat(error_3));
                        console.error("Error fetching user profile:", error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.fetchUserById = function (userId) { return __awaiter(_this, void 0, void 0, function () {
            var response, user, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axiosInstance_1.default.get("".concat(dot_prop_1.default.getProperty(API_BASE_URL, "single", [Number(userId)])))];
                    case 1:
                        response = _a.sent();
                        user = response.data;
                        // Dispatch the success action
                        UserActions_1.UserActions.fetchUserByIdSuccess({ user: user });
                        (0, UserSlice_1.sendNotification)("User with ID ".concat(userId, " fetched successfully"));
                        return [2 /*return*/, user];
                    case 2:
                        error_4 = _a.sent();
                        // Dispatch the failure action
                        UserActions_1.UserActions.fetchUserByIdFailure({ error: String(error_4) });
                        (0, UserSlice_1.sendNotification)("Error fetching user with ID ".concat(userId, ": ").concat(error_4));
                        console.error("Error fetching user:", error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.fetchUserByIdSuccess = function () { return __awaiter(_this, void 0, void 0, function () {
            var API_LIST_ENDPOINT, response, user, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        API_LIST_ENDPOINT = dot_prop_1.default.getProperty(API_BASE_URL, "list");
                        if (!API_LIST_ENDPOINT) {
                            throw new Error("List endpoint not found");
                        }
                        return [4 /*yield*/, axiosInstance_1.default.get(API_LIST_ENDPOINT)];
                    case 1:
                        response = _a.sent();
                        user = response.data;
                        // Dispatch the success action
                        UserActions_1.UserActions.fetchUserByIdSuccess({ user: user.id });
                        (0, UserSlice_1.sendNotification)("User with ID ".concat(user, " fetched successfully"));
                        return [2 /*return*/, user];
                    case 2:
                        error_5 = _a.sent();
                        // Dispatch the failure action
                        UserActions_1.UserActions.fetchUserByIdFailure({ error: String(error_5) });
                        (0, UserSlice_1.sendNotification)("Error fetching user with ID ".concat(userId, ": ").concat(error_5));
                        console.error("Error fetching user:", error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.updateUser = function (userId, updatedUserData) { return __awaiter(_this, void 0, void 0, function () {
            var response, updatedUser, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axiosInstance_1.default.put("".concat(dot_prop_1.default.getProperty(API_BASE_URL, "update", [userId])), updatedUserData)];
                    case 1:
                        response = _a.sent();
                        updatedUser = response.data;
                        UserActions_1.UserActions.updateUserSuccess({ user: updatedUser });
                        (0, UserSlice_1.sendNotification)("User with ID ".concat(userId, " updated successfully"));
                        return [2 /*return*/, updatedUser];
                    case 2:
                        error_6 = _a.sent();
                        UserActions_1.UserActions.updateUserFailure({ error: String(error_6) });
                        (0, UserSlice_1.sendNotification)("Error updating user with ID ".concat(userId, ": ").concat(error_6));
                        console.error("Error updating user:", error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.updateUserFailure = function () { return __awaiter(_this, void 0, void 0, function () {
            var API_LIST_ENDPOINT, response, user, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        API_LIST_ENDPOINT = dot_prop_1.default.getProperty(API_BASE_URL, "list");
                        if (!API_LIST_ENDPOINT) {
                            throw new Error("List endpoint not found");
                        }
                        return [4 /*yield*/, axiosInstance_1.default.get(API_LIST_ENDPOINT)];
                    case 1:
                        response = _a.sent();
                        user = response.data;
                        // Dispatch the failure action
                        UserActions_1.UserActions.updateUserFailure({ error: "Update user failed" });
                        (0, UserSlice_1.sendNotification)("Failed to update user");
                        return [2 /*return*/, user];
                    case 2:
                        error_7 = _a.sent();
                        UserActions_1.UserActions.fetchUsersFailure({ error: String(error_7) });
                        (0, UserSlice_1.sendNotification)("Error updating user: ".concat(error_7));
                        console.error("Error updating user:", error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // Bulk requests
        this.fetchUsers = function () { return __awaiter(_this, void 0, void 0, function () {
            var listEndpoint, response, users, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        listEndpoint = dot_prop_1.default.getProperty(API_BASE_URL, "list");
                        if (!listEndpoint) {
                            throw new Error("List endpoint not found");
                        }
                        return [4 /*yield*/, axiosInstance_1.default.get(listEndpoint)];
                    case 1:
                        response = _a.sent();
                        users = response.data;
                        // Dispatch the success action
                        UserActions_1.UserActions.fetchUsersSuccess({ users: users });
                        (0, UserSlice_1.sendNotification)("Users fetched successfully");
                        return [2 /*return*/, users];
                    case 2:
                        error_8 = _a.sent();
                        // Dispatch the failure action
                        UserActions_1.UserActions.fetchUsersFailure({ error: String(error_8) });
                        (0, UserSlice_1.sendNotification)("Error fetching users: ".concat(error_8));
                        console.error("Error fetching users:", error_8);
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.updateUsers = function (updatedUsersData) { return __awaiter(_this, void 0, void 0, function () {
            var updateListEndpoint, response, updatedUsers, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        updateListEndpoint = dot_prop_1.default.getProperty(API_BASE_URL, "updateList");
                        if (!updateListEndpoint) {
                            throw new Error("Update list endpoint not found");
                        }
                        return [4 /*yield*/, axiosInstance_1.default.put(updateListEndpoint, updatedUsersData)];
                    case 1:
                        response = _a.sent();
                        updatedUsers = response.data;
                        // Dispatch the success action
                        UserActions_1.UserActions.updateUsersSuccess({ users: updatedUsers });
                        (0, UserSlice_1.sendNotification)("Users updated successfully");
                        return [2 /*return*/, updatedUsers];
                    case 2:
                        error_9 = _a.sent();
                        // Dispatch the failure action
                        UserActions_1.UserActions.updateUsersFailure({ error: String(error_9) });
                        (0, UserSlice_1.sendNotification)("Error updating users: ".concat(error_9));
                        console.error("Error updating users:", error_9);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.deleteUser = function (user) { return __awaiter(_this, void 0, void 0, function () {
            var removeEndpoint, response, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        removeEndpoint = dot_prop_1.default.getProperty(API_BASE_URL, "remove", [
                            user.id,
                        ]);
                        if (!removeEndpoint) {
                            throw new Error("Remove endpoint not found");
                        }
                        return [4 /*yield*/, axiosInstance_1.default.delete(removeEndpoint)];
                    case 1:
                        response = _a.sent();
                        // Dispatch success action
                        UserActions_1.UserActions.deleteUserSuccess(user);
                        (0, UserSlice_1.sendNotification)("User deleted successfully");
                        return [2 /*return*/, response.data];
                    case 2:
                        error_10 = _a.sent();
                        // Dispatch failure action
                        UserActions_1.UserActions.deleteUserFailure({ error: String(error_10) });
                        (0, UserSlice_1.sendNotification)("Error deleting user: ".concat(error_10));
                        console.error("Error deleting user:", error_10);
                        throw error_10;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.deleteUsers = function (userIds) { return __awaiter(_this, void 0, void 0, function () {
            var listEndpoint, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        listEndpoint = dot_prop_1.default.getProperty(API_BASE_URL, "list");
                        if (!listEndpoint) {
                            throw new Error("List endpoint not found");
                        }
                        return [4 /*yield*/, axiosInstance_1.default.delete(listEndpoint, { data: { userIds: userIds } })];
                    case 1:
                        _a.sent();
                        // Dispatch the success action
                        UserActions_1.UserActions.deleteUsersSuccess(userIds);
                        (0, UserSlice_1.sendNotification)("Users deleted successfully");
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _a.sent();
                        // Dispatch the failure action
                        UserActions_1.UserActions.deleteUsersFailure({ error: String(error_11) });
                        (0, UserSlice_1.sendNotification)("Error deleting users: ".concat(error_11));
                        console.error("Error deleting users:", error_11);
                        throw error_11;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.searchUsers = function (searchQuery) { return __awaiter(_this, void 0, void 0, function () {
            var searchEndpoint, response, users, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        searchEndpoint = dot_prop_1.default.getProperty(API_BASE_URL, "search");
                        if (!searchEndpoint) {
                            throw new Error("Search endpoint not found");
                        }
                        return [4 /*yield*/, axiosInstance_1.default.get("".concat(searchEndpoint, "?query=").concat(searchQuery))];
                    case 1:
                        response = _a.sent();
                        users = response.data;
                        UserActions_1.UserActions.searchUsersSuccess({ users: users });
                        (0, UserSlice_1.sendNotification)("Users searched successfully");
                        return [2 /*return*/, users];
                    case 2:
                        error_12 = _a.sent();
                        UserActions_1.UserActions.searchUsersFailure({ error: String(error_12) });
                        (0, UserSlice_1.sendNotification)("Error searching users: ".concat(error_12));
                        console.error("Error searching users:", error_12);
                        throw error_12;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // Assign role to user
        this.assignUserRole = function (userId, role) { return __awaiter(_this, void 0, void 0, function () {
            var assignRoleEndpoint, response, assignedUser, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        assignRoleEndpoint = dot_prop_1.default.getProperty(API_BASE_URL, "assignRole", [userId]);
                        if (!assignRoleEndpoint) {
                            throw new Error("Assign role endpoint not found");
                        }
                        return [4 /*yield*/, axiosInstance_1.default.put(assignRoleEndpoint, { role: role })];
                    case 1:
                        response = _a.sent();
                        assignedUser = response.data;
                        UserRoleActions_1.UserRoleActions.assignUserRoleSuccess({
                            user: assignedUser,
                        });
                        (0, UserSlice_1.sendNotification)("Role assigned to user with ID ".concat(userId, " successfully"));
                        return [2 /*return*/, assignedUser];
                    case 2:
                        error_13 = _a.sent();
                        UserRoleActions_1.UserRoleActions.assignUserRoleFailure({
                            userId: userId, // Convert userId to number
                            role: role, // Convert role to number if necessary
                            error: String(error_13),
                        });
                        (0, UserSlice_1.sendNotification)("Error assigning role to user with ID ".concat(userId, ": ").concat(error_13));
                        console.error("Error assigning role to user:", error_13);
                        throw error_13;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // Update user roles in bulk
        this.updateUserRoles = function (users) { return __awaiter(_this, void 0, void 0, function () {
            var updatedUsers, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, userService.bulkUpdateUserRoles(users)];
                    case 1:
                        updatedUsers = _a.sent();
                        // Update UI to reflect the changes
                        (0, updateUI_1.default)(updatedUsers);
                        // Log the success of the bulk update using the Logger class
                        Logger_1.default.log('User roles updated successfully');
                        // Dispatch success action for bulk update
                        UserRoleActions_1.UserRoleActions.updateUserRolesSuccess({
                            users: updatedUsers // Assuming updatedUsers is returned from the bulk update service method
                        });
                        (0, UserSlice_1.sendNotification)('User roles updated successfully');
                        return [2 /*return*/, updatedUsers];
                    case 2:
                        error_14 = _a.sent();
                        // Dispatch failure action for bulk update
                        UserRoleActions_1.UserRoleActions.updateUserRolesFailure({ error: String(error_14) });
                        (0, UserSlice_1.sendNotification)("Error updating user roles: ".concat(error_14));
                        console.error('Error updating user roles:', error_14);
                        throw error_14;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // Assign project ownership to a user
        this.assignProjectOwner = function (userId, projectId) { return __awaiter(_this, void 0, void 0, function () {
            var assignProjectOwnerEndpoint, response, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        assignProjectOwnerEndpoint = dot_prop_1.default.getProperty(API_BASE_URL, "assignProjectOwner", [userId, projectId]);
                        if (!assignProjectOwnerEndpoint) {
                            throw new Error("Assign project ownership endpoint not found");
                        }
                        return [4 /*yield*/, axiosInstance_1.default.put(assignProjectOwnerEndpoint)];
                    case 1:
                        response = _a.sent();
                        // Optionally handle any additional logic based on the response from the backend
                        return [2 /*return*/, response.data]; // Return any relevant data from the backend response
                    case 2:
                        error_15 = _a.sent();
                        // Handle project ownership assignment failure
                        throw error_15;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // Remove project ownership from a user
        this.removeProjectOwner = function (userId, projectId) { return __awaiter(_this, void 0, void 0, function () {
            var removeProjectOwnerEndpoint, response, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        removeProjectOwnerEndpoint = dot_prop_1.default.getProperty(API_BASE_URL, "removeProjectOwner", [userId, projectId]);
                        if (!removeProjectOwnerEndpoint) {
                            throw new Error("Remove project ownership endpoint not found");
                        }
                        return [4 /*yield*/, axiosInstance_1.default.put(removeProjectOwnerEndpoint)];
                    case 1:
                        response = _a.sent();
                        // Optionally handle any additional logic based on the response from the backend
                        return [2 /*return*/, response.data]; // Return any relevant data from the backend response
                    case 2:
                        error_16 = _a.sent();
                        // Handle project ownership removal failure
                        throw error_16;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // Ensure NFT reflects user role accurately
        this.updateNFTUserRole = function (userId, role) { return __awaiter(_this, void 0, void 0, function () {
            var updateNFTUserRoleEndpoint, response, error_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        updateNFTUserRoleEndpoint = dot_prop_1.default.getProperty(API_BASE_URL, "updateNFTUserRole", [userId, role]);
                        if (!updateNFTUserRoleEndpoint) {
                            throw new Error("Update NFT user role endpoint not found");
                        }
                        return [4 /*yield*/, axiosInstance_1.default.put(updateNFTUserRoleEndpoint)];
                    case 1:
                        response = _a.sent();
                        // Optionally handle any additional logic based on the response from the backend
                        return [2 /*return*/, response.data]; // Return any relevant data from the backend response
                    case 2:
                        error_17 = _a.sent();
                        // Handle NFT update failure
                        throw error_17;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.updateUserRole = function (userId, role) { return __awaiter(_this, void 0, void 0, function () {
            var updateRoleEndpoint, response, updatedUser, error_18;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        updateRoleEndpoint = dot_prop_1.default.getProperty(API_BASE_URL, "updateRole", [userId]);
                        if (!updateRoleEndpoint) {
                            throw new Error("Update role endpoint not found");
                        }
                        return [4 /*yield*/, axiosInstance_1.default.put(updateRoleEndpoint, { role: role })];
                    case 1:
                        response = _a.sent();
                        updatedUser = response.data;
                        UserActions_1.UserActions.updateUserRoleSuccess({ user: updatedUser });
                        (0, UserSlice_1.sendNotification)("User with ID ".concat(userId, " updated successfully"));
                        return [2 /*return*/, updatedUser];
                    case 2:
                        error_18 = _a.sent();
                        UserActions_1.UserActions.updateUserRoleFailure({ error: String(error_18) });
                        (0, UserSlice_1.sendNotification)("Error updating user with ID ".concat(userId, ": ").concat(error_18));
                        console.error("Error updating user:", error_18);
                        throw error_18;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.bulkUpdateUserRoles = function (usersWithUpdatedRoles) { return __awaiter(_this, void 0, void 0, function () {
            var bulkUpdateRoleEndpoint, response, error_19;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        bulkUpdateRoleEndpoint = dot_prop_1.default.getProperty(API_BASE_URL, "bulkUpdateRoles");
                        if (!bulkUpdateRoleEndpoint) {
                            throw new Error("Bulk update roles endpoint not found");
                        }
                        return [4 /*yield*/, axiosInstance_1.default.put(bulkUpdateRoleEndpoint, {
                                users: usersWithUpdatedRoles,
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_19 = _a.sent();
                        UserActions_1.UserActions.bulkUpdateUserRolesFailure({ error: String(error_19) });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, []];
                }
            });
        }); };
    }
    return UserService;
}());
var userService = new UserService();
exports.default = userService;
