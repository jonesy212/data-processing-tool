// useLayoutState.ts
// app/layout/useLayoutState.ts
import { useState, useCallback } from "react";

export function useLayoutState() {
  const [isComponentLoaded, setComponentLoaded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleMinimizeToggle = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  const setFullscreenState = useCallback((state: boolean) => {
    setComponentLoaded(state);
  }, []);

  return {
    isComponentLoaded,
    isMinimized,
    handleMinimizeToggle,
    setFullscreenState
  };
}