// RootLayout.tsx
app/RootLayout.tsx
"use client";

import { AppProviders } from '@/core/components/AppProviders';
import { useFullscreen } from "@/core/hooks/useFullscreen";
import { useLogManagement } from "@/core/hooks/useLogManagement";
import RootLayoutContent from "@/core/layout/RootLayoutContent";
import { useAnimatedRoot } from "@/core/layout/useAnimatedRoot";
import { useAppThemeInit } from "@/core/layout/useAppThemeInit";
import type { useLayoutState } from "@/core/layout/useLayoutState";
import { BackgroundService } from "@/core/services/BackgroundService";
import React, { useEffect } from "react";

type RootLayoutProps = { children: React.ReactNode };

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const {
    isComponentLoaded,
    isMinimized,
    handleMinimizeToggle,
    setFullscreenState
  } = useLayoutState();

  const { handleUserDeletion, runPerformanceTest } = useLogManagement();
  const { isFullscreen, enter, exit } = useFullscreen();
  const { initializeTheme } = useAppThemeInit();
  const { animatedComponentRef, activateAnimation } = useAnimatedRoot();

  const handleFullscreenToggle = async (checked: boolean) => {
    try {
      if (checked) {
        await enter();
      } else {
        await exit();
      }
      setFullscreenState(checked);
    } catch (error) {
      console.error("Fullscreen toggle error:", error);
    }
  };

  const handleLayoutEffect = async () => {
    try {
      activateAnimation();
      initializeTheme();
    } catch (error) {
      console.error("Error in layout effect:", error);
    }
  };

  useEffect(() => {
    // Start background services
    const backgroundService = new BackgroundService();
    backgroundService.startBackgroundJobs();

    // Run initial performance test
    runPerformanceTest();
  }, [runPerformanceTest]);

  return (
    <AppProviders onUserDeletion={handleUserDeletion}>
      <RootLayoutContent
        children={children}
        isMinimized={isMinimized}
        isFullscreen={isFullscreen}
        isComponentLoaded={isComponentLoaded}
        animatedComponentRef={animatedComponentRef}
        onMinimizeToggle={handleMinimizeToggle}
        onFullscreenToggle={handleFullscreenToggle}
        onExitFullscreen={exit}
        onLayoutEffect={handleLayoutEffect}
      />
    </AppProviders>
  );
};

export default RootLayout;