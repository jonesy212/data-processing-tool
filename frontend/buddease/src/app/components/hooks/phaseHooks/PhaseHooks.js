"use strict";
// PhaseHooks.ts
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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAllPhases = exports.generalCommunicationFeaturesPhaseHook = exports.dataAnalysisPhaseHook = exports.productLaunchPhaseHook = exports.productBrainstormingPhaseHook = exports.teamCreationPhaseHook = exports.ideationPhaseHook = exports.decentralizedStoragePhaseHook = exports.web3CommunicationPhaseHook = exports.dataAnalysisToolsPhaseHook = exports.messagingSystemPhaseHook = exports.jobApplicationsPhaseHook = exports.recruiterDashboardPhaseHook = exports.jobSearchPhaseHook = exports.authenticationPhaseHook = exports.calendarPhaseHook = exports.createPhaseHook = void 0;
var UserSettings_1 = require("@/app/configs/UserSettings");
var configData_1 = require("@/app/configs/configData");
var react_1 = require("react");
var ipfsConfig_1 = require("../../../configs/ipfsConfig");
var AuthContext_1 = require("../../auth/AuthContext");
var IPFS_1 = require("../../web3/dAppAdapter/IPFS");
var dynamicHookGenerator_1 = require("../dynamicHooks/dynamicHookGenerator");
// Define additional methods for managing test phases
// Define additional methods for managing test phases
var useTestPhaseHooks = function () {
    // Implement methods for managing test phases
    var createTestPhaseHook = function (config) {
        // Implement logic to create test phase hooks based on the provided configuration
        // Example: Create custom phase hooks for the test environment
        var customHooks = {
            // Define custom phase hooks here
            onStart: function () {
                // Logic to execute when the test phase starts
                console.log("Test phase started");
            },
            onEnd: function () {
                // Logic to execute when the test phase ends
                console.log("Test phase ended");
            },
            canTransitionTo: function (nextPhase) {
                throw new Error("Function not implemented.");
            },
            handleTransitionTo: function (nextPhase) {
                throw new Error("Function not implemented.");
            },
            resetIdleTimeout: function () {
                throw new Error("Function not implemented.");
            },
            isActive: false,
        };
        // Return the custom phase hooks
        return customHooks;
    };
    return {
        createTestPhaseHook: function (config) {
            return createTestPhaseHook(config);
        },
    };
};
var resetAuthState = (0, AuthContext_1.useAuth)().resetAuthState;
var createPhaseHook = function (config) {
    return (0, dynamicHookGenerator_1.default)({
        condition: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, config.condition()];
            });
        }); },
        asyncEffect: function () { return __awaiter(void 0, void 0, void 0, function () {
            var cleanup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, config.asyncEffect()];
                    case 1:
                        cleanup = _a.sent();
                        if (typeof cleanup === "function") {
                            cleanup();
                        }
                        return [2 /*return*/, config.asyncEffect()];
                }
            });
        }); },
        idleTimeoutId: null, // Initialize with null or assign a valid value
        startIdleTimeout: function (timeoutDuration, onTimeout) {
            // Your implementation here
        },
        resetIdleTimeout: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                clearTimeout(UserSettings_1.default.idleTimeout);
                UserSettings_1.default.idleTimeout = setTimeout(function () {
                    // handle idle timeout
                }, UserSettings_1.default.idleTimeoutDuration);
                return [2 /*return*/];
            });
        }); },
        isActive: false,
        intervalId: 0, // Initialize with null or assign a valid value
        initialStartIdleTimeout: function (timeoutDuration, onTimeout) {
            // Your implementation here
            UserSettings_1.default.idleTimeout = setTimeout(function () { });
        },
    });
};
exports.createPhaseHook = createPhaseHook;
var usePhaseHooks = function (_a) {
    var condition = _a.condition, asyncEffect = _a.asyncEffect;
    (0, react_1.useEffect)(function () {
        if (condition()) {
            asyncEffect().then(function (cleanup) {
                if (typeof cleanup === "function") {
                    cleanup();
                }
            });
        }
    }, [condition, asyncEffect]);
};
var phaseNames = [
    "Calendar Phase",
    "Authentication Phase",
    "Job Search Phase",
    "Recruiter Dashboard Phase",
    "Job Applications Phase",
    "Messaging System Phase",
    "Data Analysis Tools Phase",
    "Web3 Communication Phase",
    "Decentralized Storage Phase",
    // Add more phase names as needed
];
var phaseHooks = {};
phaseNames.forEach(function (phaseName) {
    phaseHooks[phaseName.replace(/\s/g, "") + "PhaseHook"] = (0, exports.createPhaseHook)({
        name: phaseName,
        condition: function () { return true; },
        asyncEffect: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("Transitioning to ".concat(phaseName));
                // Add phase-specific logic here
                return [2 /*return*/, function () {
                        console.log("Cleanup for ".concat(phaseName));
                        // Perform any cleanup logic here, if needed
                        resetAuthState();
                    }];
            });
        }); },
        duration: 10000, // Assign a direct number value for duration
    });
});
// Define additional phases based on your project
var additionalPhaseNames = [
    "Ideation Phase",
    "Team Creation Phase",
    "Product Brainstorming Phase",
    "Product Launch Phase",
    "Data Analysis Phase",
    "General Communication Features",
    // Add your additional phase names here
    "Additional Phase 1",
    "Additional Phase 2",
];
var additionalPhaseHooks = {};
additionalPhaseNames.forEach(function (phaseName, duration) {
    additionalPhaseHooks[phaseName.replace(/\s/g, "") + "PhaseHook"] =
        (0, exports.createPhaseHook)({
            name: phaseName,
            duration: duration,
            condition: function () { return true; }, // Adjust the condition based on your requirements
            asyncEffect: function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    console.log("Transitioning to ".concat(phaseName));
                    // Add phase-specific logic here
                    return [2 /*return*/, function () {
                            console.log("Cleanup for ".concat(phaseName));
                            // Perform any cleanup logic here, if needed
                            resetAuthState();
                        }];
                });
            }); },
        });
});
var allPhaseHooks = __assign(__assign({}, phaseHooks), additionalPhaseHooks);
exports.calendarPhaseHook = phaseHooks.calendarPhaseHook, exports.authenticationPhaseHook = phaseHooks.authenticationPhaseHook, exports.jobSearchPhaseHook = phaseHooks.jobSearchPhaseHook, exports.recruiterDashboardPhaseHook = phaseHooks.recruiterDashboardPhaseHook, exports.jobApplicationsPhaseHook = phaseHooks.jobApplicationsPhaseHook, exports.messagingSystemPhaseHook = phaseHooks.messagingSystemPhaseHook, exports.dataAnalysisToolsPhaseHook = phaseHooks.dataAnalysisToolsPhaseHook, exports.web3CommunicationPhaseHook = phaseHooks.web3CommunicationPhaseHook, exports.decentralizedStoragePhaseHook = phaseHooks.decentralizedStoragePhaseHook, exports.ideationPhaseHook = phaseHooks.ideationPhaseHook, exports.teamCreationPhaseHook = phaseHooks.teamCreationPhaseHook, exports.productBrainstormingPhaseHook = phaseHooks.productBrainstormingPhaseHook, exports.productLaunchPhaseHook = phaseHooks.productLaunchPhaseHook, exports.dataAnalysisPhaseHook = phaseHooks.dataAnalysisPhaseHook, exports.generalCommunicationFeaturesPhaseHook = phaseHooks.generalCommunicationFeaturesPhaseHook;
// Additional utility functions for web3 and decentralized storage initialization
function initializeWeb3() {
    // Replace with your web3 initialization logic
    console.log("Web3 initialized");
    return {}; // Return your web3 instance
}
function subscribeToBlockchainEvents(web3Instance) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Replace with your blockchain event subscription logic
            console.log("Subscribed to blockchain events");
            return [2 /*return*/, function () {
                    // Unsubscribe logic
                    console.log("Unsubscribed from blockchain events");
                }];
        });
    });
}
function initializeDecentralizedStorage() {
    return __awaiter(this, void 0, void 0, function () {
        var baseConfig, extendedConfig, extendedDApp;
        return __generator(this, function (_a) {
            baseConfig = {
                appName: "Progections",
                descriptions: "Extended Project Management App",
                appVersion: configData_1.default.currentAppVersion,
                ethereumRpcUrl: "https://your-ethereum-rpc-url",
                dappProps: {},
            };
            extendedConfig = __assign(__assign({}, baseConfig), { 
                // Add any specific configuration for the ExtendedDAppAdapter
                // ...
                ipfsConfig: __assign({}, ipfsConfig_1.ipfsConfig) });
            extendedDApp = new IPFS_1.ExtendedDAppAdapter(extendedConfig);
            // Perform any additional setup or initialization if needed
            // ...
            // Return the dappAdapter for further use in the application
            return [2 /*return*/, { dappAdapter: extendedDApp }];
        });
    });
}
// Additional utility functions for collaboration preferences initialization
function initializeCollaborationPreferences() {
    return __awaiter(this, void 0, void 0, function () {
        function projectManagement() {
            return __awaiter(this, void 0, void 0, function () {
                var web3, preferences, unsubscribe, storageClient, brainstorming, teamBuilding, projectManagement, meetings, branding;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            web3 = initializeWeb3();
                            preferences = initializeCollaborationPreferences();
                            return [4 /*yield*/, subscribeToBlockchainEvents(web3)];
                        case 1:
                            unsubscribe = _a.sent();
                            storageClient = initializeDecentralizedStorage();
                            return [4 /*yield*/, initializeCollaborationPreferences()];
                        case 2:
                            brainstorming = _a.sent();
                            return [4 /*yield*/, initializeCollaborationPreferences()];
                        case 3:
                            teamBuilding = _a.sent();
                            return [4 /*yield*/, initializeCollaborationPreferences()];
                        case 4:
                            projectManagement = _a.sent();
                            return [4 /*yield*/, initializeCollaborationPreferences()];
                        case 5:
                            meetings = _a.sent();
                            return [4 /*yield*/, initializeCollaborationPreferences()];
                        case 6:
                            branding = _a.sent();
                            return [2 /*return*/, function () {
                                    unsubscribe();
                                    console.log("Cleaned up project management");
                                }];
                    }
                });
            });
        }
        function initializeBranding() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Replace with your branding preferences initialization logic
                    console.log("Initializing branding preferences");
                    // Example: Initialize branding preferences with default values
                    return [2 /*return*/, {
                            logoUrl: "https://example.com/logo.png",
                            primaryColor: "#3498db",
                            secondaryColor: "#2ecc71",
                            // Add more branding preferences as needed
                        }];
                });
            });
        }
        var branding;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Replace with your collaboration preferences initialization logic
                    console.log("Collaboration preferences initialized");
                    return [4 /*yield*/, initializeBranding()];
                case 1:
                    branding = _a.sent();
                    // Example: Initialize collaboration preferences with default values
                    return [2 /*return*/, {
                            enableRealTimeUpdates: true,
                            defaultFileType: "document",
                            enableGroupManagement: true,
                            enableTeamManagement: true,
                            enableAudioChat: true,
                            enableVideoChat: true,
                            enableFileSharing: true,
                            collaborationPreference1: "SomePreference",
                            collaborationPreference2: "AnotherPreference",
                            theme: "light",
                            language: "en",
                            fontSize: 14,
                            teamBuilding: {}, // Placeholder for teamBuilding
                            projectManagement: {}, // Placeholder for projectManagement
                            meetings: {}, // Placeholder for meetings
                            brainstorming: {}, // Placeholder for brainstorming
                            branding: {},
                        }];
            }
        });
    });
}
function applyCollaborationPreferences(preferences) {
    // Replace with your logic to apply collaboration preferences to the application
    console.log("Applying collaboration preferences to the application");
    // Example: Apply preferences to the UI or feature settings
    updateUIWithPreferences(preferences);
    enableFeaturesBasedOnPreferences(preferences);
    // Implement the logic to apply preferences, e.g., update UI, enable/disable features, etc.
}
// Example: Update UI elements with collaboration preferences
function updateUIWithPreferences(preferences) {
    console.log("Updating UI with collaboration preferences");
    // Implement logic to update UI elements based on preferences
    // For example, change theme, set language, adjust font size, etc.
}
// Example: Enable/disable features based on collaboration preferences
function enableFeaturesBasedOnPreferences(preferences) {
    console.log("Enabling/Disabling features based on collaboration preferences");
    // Implement logic to enable/disable features based on preferences
    // For example, enable/disable audio chat, video chat, file sharing, etc.
}
function teamBuilding(storageClient) {
    return __awaiter(this, void 0, void 0, function () {
        var teamMembers, teamProjects, teamChatHistory;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Replace with your logic to fetch team data from decentralized storage
                    console.log("Fetching team data from decentralized storage");
                    return [4 /*yield*/, fetchDataFromStorage(storageClient, ["members"])];
                case 1:
                    teamMembers = _a.sent();
                    return [4 /*yield*/, fetchDataFromStorage(storageClient, ["projects"])];
                case 2:
                    teamProjects = _a.sent();
                    return [4 /*yield*/, fetchDataFromStorage(storageClient, [
                            "chatHistory",
                        ])];
                case 3:
                    teamChatHistory = _a.sent();
                    return [2 /*return*/, {
                            teamMembers: teamMembers,
                            teamProjects: teamProjects,
                            teamChatHistory: teamChatHistory,
                        }];
            }
        });
    });
}
// Utility function to fetch data from storage
function fetchDataFromStorage(storageClient, keys) {
    return __awaiter(this, void 0, void 0, function () {
        var fetchDataPromises, fetchedData;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Fetching data from decentralized storage for keys: ".concat(keys.join(", ")));
                    fetchDataPromises = keys.map(function (key) { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        var _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _b = {};
                                    _a = key;
                                    return [4 /*yield*/, fetchDataFromStorage(storageClient, ["PhaseStorage"])];
                                case 1: return [2 /*return*/, (_b[_a] = _c.sent(),
                                        _b)];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(fetchDataPromises)];
                case 1:
                    fetchedData = _a.sent();
                    return [2 /*return*/, Object.assign.apply(Object, __spreadArray([{}], fetchedData, false))];
            }
        });
    });
}
// Generic function for phase data fetching
function fetchPhaseData(storageClient, keys) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, function () {
                    return __asyncGenerator(this, arguments, function () {
                        var data;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("Fetching data for phase from decentralized storage");
                                    return [4 /*yield*/, __await(fetchDataFromStorage(storageClient, keys))];
                                case 1:
                                    data = _a.sent();
                                    return [4 /*yield*/, __await(data)];
                                case 2: return [4 /*yield*/, _a.sent()];
                                case 3:
                                    _a.sent();
                                    return [4 /*yield*/, __await(function () {
                                            console.log("Cleaned up phase data for keys: ".concat(keys.join(", ")));
                                        })];
                                case 4: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }];
        });
    });
}
// Example: Initialize all phases in the app
function initializeAllPhases() {
    return __awaiter(this, void 0, void 0, function () {
        var allPhaseNames, collaborationPreferences, web3Instance, unsubscribeFromBlockchainEvents, storageClient, projectManagementKeys, projectManagement, meetingsKeys, meetings, brainstormingKeys, brainstorming;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Replace with your logic to initialize all phases
                    console.log("Initializing all phases");
                    allPhaseNames = Object.keys(allPhaseHooks);
                    return [4 /*yield*/, initializeCollaborationPreferences()];
                case 1:
                    collaborationPreferences = _a.sent();
                    applyCollaborationPreferences(collaborationPreferences);
                    web3Instance = initializeWeb3();
                    unsubscribeFromBlockchainEvents = subscribeToBlockchainEvents(web3Instance);
                    storageClient = initializeDecentralizedStorage();
                    // Fetch data from storage for each phase
                    allPhaseNames.forEach(function (phaseName) { return __awaiter(_this, void 0, void 0, function () {
                        var phaseHook, fetchDataResult, fetchDataCleanup;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    phaseHook = allPhaseHooks[phaseName.replace(/\s/g, "") + "PhaseHook"];
                                    if (!phaseHook) return [3 /*break*/, 2];
                                    return [4 /*yield*/, fetchDataFromStorage(storageClient, __spreadArray([], phaseHook.keys, true))];
                                case 1:
                                    fetchDataResult = _a.sent();
                                    fetchDataCleanup = fetchDataResult.cleanup;
                                    phaseHook.asyncEffect(); // Trigger the async effect for each phase
                                    fetchDataCleanup(); // Cleanup after fetching data
                                    _a.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    }); });
                    projectManagementKeys = [
                        "projectDetails",
                        "projectMembers",
                        "projectFiles",
                    ];
                    projectManagement = fetchPhaseData(storageClient, projectManagementKeys);
                    meetingsKeys = [
                        "upcomingMeetings",
                        "pastMeetingNotes",
                        "meetingAttendees",
                    ];
                    meetings = fetchPhaseData(storageClient, meetingsKeys);
                    brainstormingKeys = ["brainstormingIdeas", "brainstormingComments"];
                    brainstorming = fetchPhaseData(storageClient, brainstormingKeys);
                    return [2 /*return*/];
            }
        });
    });
}
exports.initializeAllPhases = initializeAllPhases;
exports.default = initializeDecentralizedStorage;
