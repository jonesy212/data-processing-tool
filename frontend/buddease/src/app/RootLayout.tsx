// app/RootLayout.tsx
"use client";

import React from "react";
import { AppProviders } from "./components/Provider";
import { useFullscreen } from "@/app/hooks/useFullscreen";
import { useAppThemeInit } from "./layout/useAppThemeInit";
import { useAnimatedRoot } from "./layout/useAnimatedRoot";
import { useLayoutState } from "./layout/useLayoutState";
import RootLayoutContent from "./layout/RootLayoutContent";

type RootLayoutProps = { children: React.ReactNode };

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const {
    isComponentLoaded,
    isMinimized,
    handleMinimizeToggle,
    setFullscreenState
  } = useLayoutState();

  const { isFullscreen, enter, exit } = useFullscreen(); // Removed unused 'toggle'
  const { initializeTheme } = useAppThemeInit(); // Removed unused 'resetTheme'
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

  return (
    <AppProviders>
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