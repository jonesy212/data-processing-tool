import LazyLoadScriptConfigImpl from "@/app/configs/LazyLoadScriptConfig";

/**
 * Debounces a function to limit the rate at which it is called.
 * @param fn The function to debounce.
 * @param delay The delay in milliseconds before invoking the function.
 * @param options Additional options for debounce behavior.
 * @param scriptConfig Lazy load script configuration.
 * @returns A debounced version of the function with a cancel method.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options?: { immediate?: boolean; leading?: boolean; trailing?: boolean },
  scriptConfig?: LazyLoadScriptConfigImpl
): T & { cancel: () => void } & { timeout?: number } {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  const execute = (args: Parameters<T>) => {
    if (options && options.trailing === false && !options.immediate) return;
    fn(...args);
    lastArgs = null;
    timeoutId = null;
  };

  const debounced = function (...args: Parameters<T>) {
    lastArgs = args;
    if (!timeoutId && (options?.immediate || options?.leading !== false)) {
      execute(args);
    }
    clearTimeout(timeoutId!);
    timeoutId = setTimeout(() => execute(lastArgs!), delay);
  } as T & { cancel: () => void } & {
      timeout?: number,
      retryCount?: number,
      retryDelay?: number;
      asyncLoad?: boolean;
      deferLoad?: boolean;
      nonce?: string;
      onLoad?: () => void;
      onBeforeLoad?: () => void;
      onScriptError?: (error: ErrorEvent) => void;
      thirdPartyLibrary?: string;
      thirdPartyAPIKey?: string;
      apiConfig?: any; // Replace 'any' with the actual type of apiConfig if known
      namingConventions?: string[];
      
  };

  const cancel = () => {
    clearTimeout(timeoutId!);
    timeoutId = null;
    lastArgs = null;
  };

  debounced.cancel = cancel;


  // Apply script configurations if provided
  if (scriptConfig) {
    debounced.timeout = scriptConfig.timeout;
    debounced.retryCount = scriptConfig.retryCount;
    debounced.retryDelay = scriptConfig.retryDelay;
    debounced.asyncLoad = scriptConfig.asyncLoad;
    debounced.deferLoad = scriptConfig.deferLoad;
    debounced.nonce = scriptConfig.nonce;
    debounced.onLoad = scriptConfig.onLoad;
    debounced.onBeforeLoad = scriptConfig.onBeforeLoad;
    debounced.onScriptError = scriptConfig.onScriptError;
    debounced.thirdPartyLibrary = scriptConfig.thirdPartyLibrary;
    debounced.thirdPartyAPIKey = scriptConfig.thirdPartyAPIKey;
    debounced.apiConfig = scriptConfig.apiConfig;
    debounced.namingConventions = scriptConfig.namingConventions;
  }

  return debounced;
}
