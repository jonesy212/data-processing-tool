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
var NotificationContext_1 = require("@/app/components/support/NotificationContext");
var systemConfigs_1 = require("../api/systemConfigs");
var userConfigs_1 = require("../api/userConfigs");
var Project_1 = require("../components/projects/Project");
var BackendConfig_1 = require("./BackendConfig");
var DataVersionsConfig_1 = require("./DataVersionsConfig");
var FrontendConfig_1 = require("./FrontendConfig");
var notify = NotificationContext_1.useNotification;
var ConfigurationService = /** @class */ (function () {
    function ConfigurationService() {
        this.cachedConfig = null;
        this.apiConfigSubscribers = [];
        // Initialize apiConfig with default values
        this.apiConfig = {
            name: "apiConfigName",
            baseURL: "",
            timeout: 0,
            headers: {},
            retry: {},
            cache: {},
            responseType: {
                contentType: "contentType", // New property for content type
                encoding: "encoding", // New property for encoding
                // Add more properties as needed
            },
            withCredentials: false,
            onLoad: function () { },
        };
    }
    // Update the getDefaultApiConfig method
    ConfigurationService.prototype.getDefaultApiConfig = function () {
        return {
            name: "defaultName",
            timeout: 5000,
            headers: {},
            retry: {},
            cache: {},
            responseType: {
                contentType: "application/json", // Default content type
                encoding: "utf-8", // Default encoding
            },
            withCredentials: false,
            baseURL: process.env.REACT_APP_API_BASE_URL || "",
            backendConfig: BackendConfig_1.backendConfig,
            frontendConfig: FrontendConfig_1.frontendConfig,
            onLoad: function (response) {
                // Check if the response status is within the success range (200-299)
                if (response.status >= 200 && response.status < 300) {
                    // Convert the response to JSON format
                    response.json().then(function (data) {
                        // Process the response data here
                        console.log("Response data:", data);
                    }).catch(function (error) {
                        console.error("Error parsing response:", error);
                    });
                }
                else {
                    // Handle non-successful response status
                    console.error("Request failed with status:", response.status);
                    // Use the notify function to display a notification message
                    var errorMessage = "Request failed with status: ".concat(response.status);
                    notify();
                }
            }
        };
    };
    // New public method to expose getDefaultApiConfig
    ConfigurationService.prototype.getPublicDefaultApiConfig = function () {
        return this.getDefaultApiConfig();
    };
    ConfigurationService.getInstance = function () {
        if (!ConfigurationService.instance) {
            ConfigurationService.instance = new ConfigurationService();
        }
        return ConfigurationService.instance;
    };
    ConfigurationService.prototype.getSnapshotConfig = function () {
        // Example: Default configuration
        var defaultConfig = {
            timeout: 5000, // 5 seconds timeout for script loading
            onLoad: function () { return console.log("Script loaded successfully"); },
            retryCount: 3, // Retry loading script up to 3 times
            retryDelay: 1000, // 1 second delay between retry attempts
            asyncLoad: true, // Asynchronously load scripts
            deferLoad: false, // Do not defer script execution
            onBeforeLoad: function () { return console.log("Loading script..."); },
            onScriptError: function (error) { return console.log("Error loading script", error); },
            onTimeout: function () { return console.log("Timeout loading script"); },
            onCachedLoad: function () { return console.log("Script loaded from cache"); },
            onCachedTimeout: function () { return console.log("Timeout loading script from cache"); },
            onCachedError: function (error) {
                return console.log("Error loading script from cache", error);
            },
            // Example: Add configuration options here
            systemConfigs: systemConfigs_1.SystemConfigs,
            userConfigs: userConfigs_1.UserConfigs,
            dataVersions: function () { return DataVersionsConfig_1.default; },
            frontend: FrontendConfig_1.frontendConfig,
            backend: BackendConfig_1.backendConfig,
            aquaConfig: {},
            storeConfig: {},
        };
        return defaultConfig;
    };
    ConfigurationService.prototype.setCachedConfig = function (config) {
        this.cachedConfig = config;
    };
    // Get the cached configuration
    ConfigurationService.prototype.getCachedConfig = function () {
        return this.cachedConfig;
    };
    ConfigurationService.prototype.getLazyLoadScriptConfig = function () {
        // Example: Default configuration
        var defaultConfig = {
            timeout: 5000, // 5 seconds timeout for script loading
            onLoad: function () { return console.log("Script loaded successfully"); },
            retryCount: 3, // Retry loading script up to 3 times
            retryDelay: 1000, // 1 second delay between retry attempts
            asyncLoad: true, // Asynchronously load scripts
            deferLoad: false, // Do not defer script execution
            onBeforeLoad: function () { return console.log("Loading script..."); },
            onScriptError: function (error) { return console.error("Script error:", error); },
            thirdPartyLibrary: "example-library",
            thirdPartyAPIKey: "your-api-key",
            nonce: "random-nonce-value",
        };
        var aquaConfig = {
            apiUrl: "https://example.com/aqua-api",
            maxConnections: 10,
            timeout: 0,
            secureConnection: false,
            reconnectAttempts: 0,
            autoReconnect: false,
            appId: "",
            appSecret: "",
            relayUrl: "",
            relayToken: "",
            chatToken: "",
            chatUrl: "",
            chatWebsocketUrl: "",
            chatImageUploadUrl: "",
            chatImageUploadHeaders: {},
            chatImageUploadParams: {},
            chatImageUploadUrlParams: {},
            chatImageDownloadUrl: "",
            chatImageDownloadHeaders: {},
            chatImageDownloadParams: {},
            chatImageDownloadUrlParams: {},
            chatImageCacheUrl: "",
            chatImageCacheHeaders: {},
            chatImageCacheParams: {}
        };
        // Additional edge cases and use cases
        // Case 1: Custom configuration based on a condition
        // Determine if custom configuration is needed based on AquaConfig
        var isCustomConfigNeeded = aquaConfig.maxConnections > 5;
        if (isCustomConfigNeeded) {
            var customApiConfig = {
                name: "customApiConfig",
                baseURL: "https://custom-api.com",
                timeout: 10000,
                headers: {
                    "Content-Type": "application/json",
                },
                retry: {
                    enabled: true,
                    maxRetries: 3,
                    retryDelay: 0,
                },
                cache: {},
                responseType: {
                    contentType: "application/json", // Default content type
                    encoding: "utf-8", // Default encoding
                },
                withCredentials: false,
                onLoad: function (response) {
                    throw new Error("Function not implemented.");
                },
            };
            return __assign(__assign({}, defaultConfig), { apiConfig: customApiConfig });
        }
        // Determine if a special scenario requires different configuration
        var specialScenario = (0, Project_1.isProjectInSpecialPhase)({});
        if (specialScenario) {
            var specialStoreConfig = {
                name: "Special Store",
                description: "Special store for special scenario",
                // Additional configuration options...
            };
            if (this.cachedConfig) {
                return this.cachedConfig;
            }
            else {
                return defaultConfig;
            }
        }
        // Added return statement with default config to resolve error
        return defaultConfig;
    };
    // Add more configuration methods as needed
    ConfigurationService.prototype.getSystemConfigs = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Simulate asynchronous fetching, replace with actual async logic
                return [2 /*return*/, new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(systemConfigs_1.SystemConfigs);
                        }, 500);
                    })];
            });
        });
    };
    ConfigurationService.prototype.getUserConfigs = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Simulate asynchronous fetching, replace with actual async logic
                return [2 /*return*/, new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(userConfigs_1.UserConfigs);
                        }, 500);
                    })];
            });
        });
    };
    ConfigurationService.prototype.getApiConfig = function () {
        // Example API configuration
        // You can modify this based on your application's needs
        return {
            name: "defaultApiConfig",
            baseURL: "https://api.example.com",
            timeout: 10000,
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer your-access-token",
            },
            retry: {
                enabled: true,
                maxRetries: 3,
                retryDelay: 1000,
            },
            cache: {
                enabled: true,
                maxAge: 300000,
                staleWhileRevalidate: 60000,
                cacheKey: "api_cache_key",
            },
            responseType: {
                contentType: "application/json",
                encoding: "utf-8",
            },
            withCredentials: true,
            onLoad: function (response) { return console.log("Script loaded successfully", response); },
        };
    };
    // Add a method to get the current API config
    ConfigurationService.prototype.getCurrentApiConfig = function () {
        return this.apiConfig;
    };
    ConfigurationService.prototype.getConfigurationOptions = function () {
        return {};
    };
    ConfigurationService.prototype.subscribeToApiConfigChanges = function (callback) {
        // Add the callback function to the subscribers array
        this.apiConfigSubscribers.push(callback);
    };
    ConfigurationService.prototype.unsubscribeFromApiConfigChanges = function (callback) {
        // Remove the callback function from the subscribers array
        this.apiConfigSubscribers = this.apiConfigSubscribers.filter(function (subscriber) { return subscriber !== callback; });
    };
    ConfigurationService.prototype.triggerApiConfigChange = function () {
        var currentConfig = this.getCurrentApiConfig();
        // Notify all subscribers with the current config
        this.apiConfigSubscribers.forEach(function (subscriber) {
            return subscriber(currentConfig);
        });
    };
    // Example method that updates the API config and triggers changes
    ConfigurationService.prototype.updateApiConfig = function (updatedConfig) {
        this.apiConfig = __assign(__assign({}, this.apiConfig), updatedConfig);
        // Trigger callbacks to notify subscribers about the change
        this.triggerApiConfigChange();
    };
    return ConfigurationService;
}());
// Create an instance of the configuration service
var configServiceInstance = ConfigurationService.getInstance();
exports.default = configServiceInstance;
