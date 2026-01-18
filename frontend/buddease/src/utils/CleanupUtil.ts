// CleanupUtil.ts
cleanupUtil.ts
export const createCleanupFunction = (cleanupLogic: () => void) => {
    return () => {
      cleanupLogic();
    };
  };
  