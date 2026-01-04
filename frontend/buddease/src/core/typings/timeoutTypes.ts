app/utils/types/timeoutTypes.ts
export type TimeoutHandle = ReturnType<typeof setTimeout>;
export type IntervalHandle = ReturnType<typeof setInterval>;

Platform-agnostic type that works in both Node.js and browser
export type PlatformTimeout = number | NodeJS.Timeout;

export function clearPlatformTimeout(timeoutId: PlatformTimeout | null | undefined): void {
  if (timeoutId) {
    clearTimeout(timeoutId as any);
  }
}

export function clearPlatformInterval(intervalId: PlatformTimeout | null | undefined): void {
  if (intervalId) {
    clearInterval(intervalId as any);
  }
}