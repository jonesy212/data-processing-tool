"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectUsers = exports.updateUserEmail = exports.updateUserLastName = exports.updateUserFirstName = exports.fetchUsersSuccess = exports.updateQuota = exports.updateData = exports.sendNotification = exports.updateProfilePicture = exports.updateBio = exports.updateFullName = exports.userManagerSlice = void 0;
var toolkit_1 = require("@reduxjs/toolkit");
var initialState = {
    users: [],
    fullName: "",
    bio: "",
    profilePicture: "",
    notification: "",
    data: {},
    uploadQuota: 0,
};
exports.userManagerSlice = (0, toolkit_1.createSlice)({
    name: "userManager",
    initialState: initialState,
    reducers: {
        updateFullName: function (state, action) {
            state.fullName = action.payload;
        },
        updateBio: function (state, action) {
            state.bio = action.payload;
        },
        updateProfilePicture: function (state, action) {
            state.profilePicture = action.payload;
        },
        sendNotification: function (state, action) {
            state.notification = action.payload;
        },
        updateData: function (state, action) {
            state.data = action.payload;
        },
        updateQuota: function (state, action) {
            state.uploadQuota = action.payload;
        },
        fetchUsersSuccess: function (state, action) {
            state.users = action.payload.users;
        },
        updateUserFirstName: function (state, action) {
            var _a = action.payload, userId = _a.userId, firstName = _a.firstName;
            var userIndex = state.users.findIndex(function (user) { return user.id === userId; });
            if (userIndex !== -1) {
                state.users[userIndex].firstName = firstName;
            }
        },
        updateUserLastName: function (state, action) {
            var _a = action.payload, userId = _a.userId, lastName = _a.lastName;
            var userIndex = state.users.findIndex(function (user) { return user.id === userId; });
            if (userIndex !== -1) {
                state.users[userIndex].lastName = lastName;
            }
        },
        updateUserEmail: function (state, action) {
            var _a = action.payload, userId = _a.userId, email = _a.email;
            var userIndex = state.users.findIndex(function (user) { return user.id === userId; });
            if (userIndex !== -1) {
                state.users[userIndex].email = email;
            }
        },
    },
});
exports.updateFullName = (_a = exports.userManagerSlice.actions, _a.updateFullName), exports.updateBio = _a.updateBio, exports.updateProfilePicture = _a.updateProfilePicture, exports.sendNotification = _a.sendNotification, exports.updateData = _a.updateData, exports.updateQuota = _a.updateQuota, exports.fetchUsersSuccess = _a.fetchUsersSuccess, exports.updateUserFirstName = _a.updateUserFirstName, exports.updateUserLastName = _a.updateUserLastName, exports.updateUserEmail = _a.updateUserEmail;
var selectUsers = function (state) {
    return state.userManager.users;
};
exports.selectUsers = selectUsers;
exports.default = exports.userManagerSlice.reducer;
