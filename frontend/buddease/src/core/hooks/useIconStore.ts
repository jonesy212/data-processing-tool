// useIconStore.ts
import { iconStore } from '@/core/state/stores/IconStore';
import { useCallback, useEffect, useRef, useState } from 'react';

// Optional: Add custom hook options
interface UseIconStoreOptions {
  autoLoad?: boolean;
  dependencies?: any[];
  onIconsLoaded?: (icons: string[]) => void;
  onError?: (error: Error) => void;
}

// Export the same interface from IconStore
export type { IconStore } from './IconStore';

export const useIconStore = (options: UseIconStoreOptions = {}) => {
  const {
    autoLoad = true,
    dependencies = [],
    onIconsLoaded,
    onError
  } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [icons, setIcons] = useState<string[]>([]);
  const hasLoadedRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Handler for icons loaded event
  const handleIconsLoaded = useCallback((payload: any) => {
    const iconList = Array.from(iconStore.icons.keys());
    setIcons(iconList);
    setIsLoading(false);
    setError(null);
    
    if (onIconsLoaded) {
      onIconsLoaded(iconList);
    }
  }, [onIconsLoaded]);

  // Handler for load error event
  const handleLoadError = useCallback((payload: any) => {
    const error = payload.error || new Error('Failed to load icons');
    setIsLoading(false);
    setError(error);
    
    if (onError) {
      onError(error);
    }
  }, [onError]);

  // Load icons manually
  const loadIcons = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await iconStore.loadIcons();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load icons');
      setError(error);
      setIsLoading(false);
      
      if (onError) {
        onError(error);
      }
    }
  }, [isLoading, onError]);

  // Clear icons
  const clearIcons = useCallback(() => {
    iconStore.clearIcons();
    setIcons([]);
  }, []);

  // Add icon
  const addIcon = useCallback((name: string, icon: string) => {
    iconStore.addIcon(name, icon);
    setIcons(prev => [...new Set([...prev, name])]);
  }, []);

  // Get icon
  const getIcon = useCallback((name: string): string | undefined => {
    return iconStore.getIcon(name);
  }, []);

  useEffect(() => {
    if (!autoLoad || hasLoadedRef.current) return;
    
    // Register event listeners
    const cleanup = () => {
      // Cleanup event listeners if needed
    };
    
    cleanupRef.current = cleanup;
    
    // Auto-load on mount if not already loaded
    if (iconStore.icons.size === 0 && !isLoading) {
      loadIcons();
    } else {
      // If icons are already loaded, update state
      const iconList = Array.from(iconStore.icons.keys());
      setIcons(iconList);
    }
    
    hasLoadedRef.current = true;
    
    return cleanup;
  }, [autoLoad, loadIcons, isLoading]);

  // Listen for store changes
  useEffect(() => {
    const unsubscribe = () => {
      // If iconStore is observable, you could subscribe to changes
      // For now, we'll update when icons change via callbacks
    };
    
    return unsubscribe;
  }, []);

  // Return the store and additional state
  return {
    // Store instance
    store: iconStore,
    
    // State
    isLoading,
    error,
    icons,
    
    // Actions
    loadIcons,
    clearIcons,
    addIcon,
    getIcon,
    
    // Convenience methods
    hasIcons: icons.length > 0,
    iconCount: icons.length,
    
    // Reset state
    reset: () => {
      clearIcons();
      setError(null);
      setIsLoading(false);
      hasLoadedRef.current = false;
    }
  };
};

// Create a simpler hook that just returns the store
export const useIconStoreSimple = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Auto-load icons on mount
    if (iconStore.icons.size === 0 && !iconStore.isLoading) {
      setIsLoading(true);
      iconStore.loadIcons()
        .finally(() => setIsLoading(false));
    }
  }, []);
  
  return {
    store: iconStore,
    isLoading
  };
};

// Export default (simple version)
export default useIconStore;

// Also export direct access
export { iconStore };
