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
Object.defineProperty(exports, "__esModule", { value: true });
// ExtendedNotificationMessages.ts
var NotificationMessages_1 = require("./NotificationMessages");
var EXTENDED_NOTIFICATION_MESSAGES = __assign(__assign({}, NotificationMessages_1.default), { IdleTimeout: {
        SESSION_EXPIRING: 'Your session is about to expire. Click OK to continue.',
        LOGOUT_SUCCESS: 'User has been logged out successfully.',
        LOGOUT_ERROR: 'Error logging out. Please try again.',
        CLEAR_DATA: 'Clearing sensitive user data.',
        REDIRECT: 'Redirecting to the landing page.',
        RESET_TIMEOUT: 'Idle timeout reset.',
        TIMEOUT_CLEANUP: 'Idle timeout cleanup.',
    } });
exports.default = EXTENDED_NOTIFICATION_MESSAGES;
