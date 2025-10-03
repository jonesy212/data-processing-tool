
// Usage writeUserCacheExample:
export const writeUserCache = async (
  req: Request,
  res: Response,
  userId?: string
) => {
  try {
    // Fetch user data
    const user = await userService.fetchUserData(req, res);

    // Get user ID if not provided
    const targetUserId = userId || await userService.fetchUserById(user);

    // Write cache with the user data
    await writeCache(targetUserId, Promise.resolve(user));
    
  } catch (error) {
    console.error("Error in writeUserCache:", error);
    throw error;
  }
};


// Basic usage
await writeCache('user123', fetchUserData());

// With custom options
await writeCache('user123', fetchUserData(), {
  filePath: 'cache/custom_path.json',
  delay: 500,
  notifyOnSuccess: false
});

// Using the helper function
await writeUserCache(req, res);
await writeUserCache(req, res, 'specific-user-id');




// Example usage
const exampleUsage = async (key: string) => {
  const cache = await readAndLogCache(key);

  if (cache) {
    const updatedUserPreferences = {
      ...(cache as any)[STORE_KEYS.USER_PREFERENCES],
      darkMode: true,
    };

    await writeAndUpdateCache(
      STORE_KEYS.USER_PREFERENCES,
      updatedUserPreferences
    );

    hydrateMobXStore(
      STORE_KEYS.USER_PREFERENCES,
      (cache as any)[STORE_KEYS.USER_PREFERENCES]
    );

    synchronizeCacheWithServer(
      STORE_KEYS.USER_PREFERENCES,
      updatedUserPreferences
    );
  }
  exampleUsage(key);
};