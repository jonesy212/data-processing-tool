"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showModalOrNotification = exports.clearUserData = void 0;
// Import necessary modules
var ExtendedNotificationMessages_1 = require("../support/ExtendedNotificationMessages");
var idleTimeoutUtils_1 = require("./commHooks/idleTimeoutUtils");

// Define and export necessary functions
exports.showModalOrNotification = idleTimeoutUtils_1.showModalOrNotification;
exports.clearUserData = clearUserData; // Assuming you have a clearUserData function defined elsewhere

// Start the idle timeout
(0, idleTimeoutUtils_1.resetIdleTimeout)();

// Define the idleTimeoutCleanup function
var idleTimeoutCleanup = function () {
    clearTimeout(timeoutId);
    (0, idleTimeoutUtils_1.showModalOrNotification)(ExtendedNotificationMessages_1.default.IdleTimeout.TIMEOUT_CLEANUP);
};

// Set up a timeout
var timeoutId = setTimeout(function () { }, 0);

// Define idleTimeoutParams object
var idleTimeoutParams = {
    intervalId: undefined,
    isActive: false,
    condition: idleTimeoutConditionSync,
    asyncEffect: idleTimeoutEffect,
    cleanup: idleTimeoutCleanup,
    resetIdleTimeout: idleTimeoutUtils_1.resetIdleTimeout,
    idleTimeoutId: timeoutId.toString(), // Convert timeoutId to string before assigning
    startIdleTimeout: function () { },
    initialStartIdleTimeout: function () { },
};

// Define the useIdleTimeoutHook function
var useIdleTimeoutHook = createDynamicHook(idleTimeoutParams);

// Return necessary properties/methods from the dynamic hook
module.exports = {
    intervalId: undefined,
    isActive: useIdleTimeoutHook.isActive,
    animateIn: function () { },
    startAnimation: function () { },
    stopAnimation: function () { },
    resetIdleTimeout: useIdleTimeoutHook.resetIdleTimeout,
    idleTimeoutId: useIdleTimeoutHook.idleTimeoutId,
    startIdleTimeout: useIdleTimeoutHook.startIdleTimeout,
    toggleActivation: function () { return Promise.resolve(true); },
};
