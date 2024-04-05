"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserConfigs = void 0;
var UserPreferences_1 = require("../configs/UserPreferences");
var UserSettings_1 = require("../configs/UserSettings");
// userConfigs.ts
exports.UserConfigs = {
    apiUrl: 'https://user.api.com',
    theme: 'light',
    notificationConfig: {
        enabled: true,
        frequency: 'daily',
    },
    // Add more configurations as needed
    userPreferences: UserPreferences_1.default, // Example addition for UserPreferences
    userSettings: UserSettings_1.default, // Example addition for UserSettings
};
