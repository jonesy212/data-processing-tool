"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.frontendConfig = void 0;
// Example usage:
exports.frontendConfig = {
    appName: process.env.FRONTEND_APP_NAME || "YourFrontendAppName", // Use process.env or default value
    appVersion: process.env.FRONTEND_APP_VERSION || "1.0.0", // Use process.env or default value
    apiConfig: {
        baseURL: process.env.FRONTEND_API_BASE_URL || "https://api.example.com", // Use process.env or default value
        timeout: parseInt(process.env.FRONTEND_API_TIMEOUT || "10000"), // Use process.env or default value, convert to number
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer ".concat(process.env.FRONTEND_API_ACCESS_TOKEN || "your-access-token"), // Use process.env or default value
        },
        retry: {
            enabled: true,
            maxRetries: parseInt(process.env.FRONTEND_API_MAX_RETRIES || "3"), // Use process.env or default value, convert to number
            retryDelay: parseInt(process.env.FRONTEND_API_RETRY_DELAY || "1000"), // Use process.env or default value, convert to number
        },
        cache: {
            enabled: process.env.FRONTEND_API_CACHE_ENABLED === "true", // Use process.env
            maxAge: parseInt(process.env.FRONTEND_API_CACHE_MAX_AGE || "300000"), // Use process.env or default value, convert to number
            staleWhileRevalidate: parseInt(process.env.FRONTEND_API_CACHE_STALE_WHILE_REVALIDATE || "60000"), // Use process.env or default value, convert to number
            cacheKey: process.env.FRONTEND_API_CACHE_KEY || "frontend_api_cache_key", // Use process.env or default value
        },
        responseType: process.env.FRONTEND_API_RESPONSE_TYPE || "", // Use process.env or default value
        withCredentials: process.env.FRONTEND_API_WITH_CREDENTIALS === "true", // Use process.env
        onLoad: function (response) {
            throw new Error("Function not implemented.");
        },
        name: undefined,
    },
    retryConfig: {
        enabled: process.env.FRONTEND_RETRY_ENABLED === "true", // Use process.env
        maxRetries: parseInt(process.env.FRONTEND_RETRY_MAX_RETRIES || "3"), // Use process.env or default value, convert to number
        retryDelay: parseInt(process.env.FRONTEND_RETRY_DELAY || "1000"), // Use process.env or default value, convert to number
    },
    cacheConfig: {
        enabled: process.env.FRONTEND_CACHE_ENABLED === "true", // Use process.env
        maxAge: parseInt(process.env.FRONTEND_CACHE_MAX_AGE || "300000"), // Use process.env or default value, convert to number
        staleWhileRevalidate: parseInt(process.env.FRONTEND_CACHE_STALE_WHILE_REVALIDATE || "60000"), // Use process.env or default value, convert to number
        cacheKey: process.env.FRONTEND_CACHE_KEY || "frontend_cache_key", // Use process.env or default value
    },
    frontendSpecificProperty: process.env.FRONTEND_SPECIFIC_PROPERTY || "YourFrontendSpecificValue", // Use process.env or default value
};
