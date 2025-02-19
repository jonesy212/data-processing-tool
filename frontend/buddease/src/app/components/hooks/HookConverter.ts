// TypeScript hooks
const onCacheUpdateSuccess = (cacheName: string) => {
    console.log(`${cacheName} cache updated successfully.`);
};

const onCacheUpdateFailure = (cacheName: string, error: Error) => {
    console.error(`Failed to update ${cacheName} cache. Error: ${error.message}`);
};

// Example usage in TypeScript code
onCacheUpdateSuccess("default_cache");
onCacheUpdateFailure("custom_cache", new Error("Some error message"));
