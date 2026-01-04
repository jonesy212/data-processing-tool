useDebouncedCallback.ts
/app/hooks/useDebouncedCallback.ts
import { useRef, useCallback, useEffect } from 'react';
import debounce from 'lodash.debounce';

export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: DebounceOptions = {}
): T {
  const callbackRef = useRef<T>(callback);
  const debouncedRef = useRef<ReturnType<typeof debounce> | null>(null); // Initialize as null

  // Update callback reference
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Create debounced function
  useEffect(() => {
    const debouncedFn = debounce(
      (...args: Parameters<T>) => {
        callbackRef.current(...args);
      },
      delay,
      options
    );

    debouncedRef.current = debouncedFn;

    // Cleanup
    return () => {
      debouncedFn.cancel();
    };
  }, [delay, options]);

  return useCallback((...args: Parameters<T>) => {
    return debouncedRef.current?.(...args);
  }, []) as T;
}

Enhanced version with flush and cancel
export function useEnhancedDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: DebounceOptions = {}
) {
  const callbackRef = useRef<T>(callback);
  const debouncedRef = useRef<ReturnType<typeof debounce> | null>(null); 

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const debouncedFn = debounce(
      (...args: Parameters<T>) => {
        return callbackRef.current(...args);
      },
      delay,
      options
    );

    debouncedRef.current = debouncedFn;

    return () => {
      debouncedFn.cancel();
    };
  }, [delay, options]);

  const debounced = useCallback((...args: Parameters<T>) => {
    return debouncedRef.current?.(...args);
  }, []);

  const flush = useCallback(() => {
    return debouncedRef.current?.flush();
  }, []);

  const cancel = useCallback(() => {
    debouncedRef.current?.cancel();
  }, []);

  const pending = useCallback(() => {
    return debouncedRef.current ? !debouncedRef.current.flush() : false;
  }, []);

  return {
    debounced: debounced as T,
    flush,
    cancel,
    pending
  };
}

Alternative: Simpler version with immediate initialization
export function useDebouncedCallbackSimple<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: DebounceOptions = {}
): T {
  const callbackRef = useRef(callback);
  
  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Use useMemo to create debounced function once
  const debouncedFn = useRef(
    debounce(
      (...args: Parameters<T>) => callbackRef.current(...args),
      delay,
      options
    )
  ).current;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedFn.cancel();
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    return debouncedFn(...args);
  }, [debouncedFn]) as T;
}