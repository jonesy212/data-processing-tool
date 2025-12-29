// clearIntervalTimer.ts

/**
 * Clears the interval timer identified by the provided timerId.
 * @param timerId - The ID of the interval timer to clear.
 */
const clearIntervalTimer = (timerId: NodeJS.Timeout): void => {
    clearInterval(timerId);
    // Any additional cleanup logic can go here
};

export default clearIntervalTimer;
