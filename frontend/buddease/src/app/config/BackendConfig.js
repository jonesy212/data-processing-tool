"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.backendConfig = void 0;
var defaultApiConfig = {
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
    responseType: { contentType: "json", encoding: "string", },
    withCredentials: true,
    onLoad: function (response) { return console.log("Script loaded successfully", response); },
    name: undefined
};
var backendConfig = {
    appName: process.env.BACKEND_APP_NAME || "YourBackendAppName", // Use process.env or default value
    appVersion: "1.0.0",
    apiConfig: defaultApiConfig,
    versionNumber: "1",
    retryConfig: {
        enabled: true,
        maxRetries: parseInt((_a = process.env.BACKEND_RETRY_MAX_RETRIES) !== null && _a !== void 0 ? _a : "3"), // Use process.env or default value, convert to number
        retryDelay: parseInt((_b = process.env.BACKEND_RETRY_DELAY) !== null && _b !== void 0 ? _b : "1000"), // Use process.env or default value, convert to number
    },
    cacheConfig: {
        enabled: true,
        maxAge: 300000,
        staleWhileRevalidate: parseInt((_c = process.env.BACKEND_CACHE_STALE_WHILE_REVALIDATE) !== null && _c !== void 0 ? _c : "60000"), // Use process.env or default value, convert to number
        cacheKey: "backend_api_cache_key",
    },
    backendSpecificProperty: "YourBackendSpecificValue",
};
exports.backendConfig = backendConfig;
