"use strict";
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
var ApiUser_1 = require("../components/users/ApiUser");
// Function to construct the CacheData object
var constructCacheData = function (data) {
    return {
        lastUpdated: data.lastUpdated,
        userSettings: data.userSettings,
        dataVersions: data.dataVersions,
        frontendStructure: data.frontendStructure,
        backendStructure: data.backendStructure,
        frontendConfig: data.frontendConfig,
        backendConfig: data.backendConfig,
        realtimeData: data.realtimeData,
        notificationBarPhaseHook: {},
        darkModeTogglePhaseHook: {},
        authenticationPhaseHook: {},
        jobSearchPhaseHook: {},
        recruiterDashboardPhaseHook: {},
        teamBuildingPhaseHook: {},
        brainstormingPhaseHook: {},
        projectManagementPhaseHook: {},
        meetingsPhaseHook: {},
        ideationPhaseHook: {},
        teamCreationPhaseHook: {},
        productBrainstormingPhaseHook: {},
        productLaunchPhaseHook: {},
        dataAnalysisPhaseHook: {},
        generalCommunicationFeaturesPhaseHook: {},
        fileType: "",
        calendarEvent: {},
        _id: "",
        id: "",
        title: "",
        status: "pending",
        isActive: false,
        tags: [],
        phase: null,
        analysisResults: [],
        analysisType: {},
        videoData: {},
        // Construct other properties here
    };
};
// Function to read cache data
function readCache(userId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    try {
                        var cachedData = localStorage.getItem("cached" + userId);
                        if (cachedData) {
                            // If cached data exists, parse it and construct CacheData using constructCacheData
                            var data = JSON.parse(cachedData);
                            var constructedData = constructCacheData(data);
                            resolve(constructedData);
                        }
                        else {
                            // If no cached data found, resolve with null
                            resolve(null);
                        }
                    }
                    catch (err) {
                        // If an error occurs during data retrieval, reject the promise with the error
                        reject(err);
                    }
                })];
        });
    });
}
// Usage
// Usage with async/await
// Assuming userService.fetchUser and userService.fetchUserById return promises
var user = await ApiUser_1.default.fetchUser("");
var userId = await ApiUser_1.default.fetchUserById(user);
try {
    // Attempt to read cached data for the user
    var cachedData = await readCache(userId);
    if (cachedData) {
        // If cached data exists, log it
        console.log('Cached data:', cachedData);
    }
    else {
        // If no cached data found, log a message
        console.log('No cached data found.');
    }
}
catch (error) {
    // If an error occurs during cache reading, log the error
    console.error('Error reading cache:', error);
}
// Usage with .then()
// Assuming userService.fetchUser and userService.fetchUserById return promises
ApiUser_1.default.fetchUser("").then(function (user) {
    ApiUser_1.default.fetchUserById(user).then(function (userId) {
        // Read cached data for the user
        readCache(userId).then(function (cachedData) {
            if (cachedData) {
                // If cached data exists, log it
                console.log('Cached data:', cachedData);
            }
            else {
                // If no cached data found, log a message
                console.log('No cached data found.');
            }
        }).catch(function (error) {
            // If an error occurs during cache reading, log the error
            console.error('Error reading cache:', error);
        });
    });
});
