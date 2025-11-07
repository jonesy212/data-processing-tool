<!-- RootLayout System Documentation -->

## Overview

*The RootLayout system provides a comprehensive layout management solution for the Buddease application, implementing the Single Responsibility Principle through modular hooks and components. This system handles fullscreen management, theme initialization, animation control, and layout state management in a maintainable, testable architecture.*

# System Architecture
text
src/app/
├── RootLayout.tsx                    # Main layout component
├── layout/                           # Layout concerns directory
│   ├── useFullscreen.ts              # Fullscreen management hook
│   ├── useAppThemeInit.ts            # Theme initialization hook
│   ├── useAnimatedRoot.ts            # Animation control hook
│   ├── useLayoutState.ts             # Layout state management
│   ├── RootLayoutContent.tsx         # Layout content component
│   ├── FullscreenControls.tsx        # Fullscreen UI controls
│   └── LayoutControls.tsx            # Layout toggle controls
├── components/
│   ├── Provider.tsx                  # App providers wrapper
│   └── DynamicComponentsContext.tsx  # Dynamic component loading
└── libraries/animations/
    └── AnimationComponent.tsx        # Animation component

# Core Concepts

**Single Responsibility Principle Implementation**

- Each hook and component has a single, focused responsibility:

useFullscreen: Manages fullscreen API interactions

useAppThemeInit: Handles theme configuration and initialization

useAnimatedRoot: Controls animation states and refs

useLayoutState: Manages layout visibility states

RootLayoutContent: Renders layout structure

Control Components: Handle specific UI interactions

**Component Documentation**

# RootLayout.tsx
The main layout component that orchestrates all layout concerns.

``` typescript
// app/RootLayout.tsx
"use client";

import React from "react";
import { AppProviders } from "./components/Provider";
import { useFullscreen } from "./layout/useFullscreen";
import { useAppThemeInit } from "./layout/useAppThemeInit";
import { useAnimatedRoot } from "./layout/useAnimatedRoot";
import { useLayoutState } from "./layout/useLayoutState";
import { RootLayoutContent } from "./layout/RootLayoutContent";

type RootLayoutProps = { children: React.ReactNode };

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  // State Management
  const {
    isComponentLoaded,
    isMinimized,
    handleMinimizeToggle,
    setFullscreenState
  } = useLayoutState();

  // Feature Hooks
  const { enter, exit } = useFullscreen();
  const { initializeTheme } = useAppThemeInit();
  const { animatedComponentRef, activateAnimation } = useAnimatedRoot();

  // Event Handlers
  const handleFullscreenToggle = async (checked: boolean) => {
    try {
      if (checked) await enter();
      else await exit();
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
```

# Hook Documentation

**useFullscreen.ts**
Comprehensive fullscreen API management with cross-browser support.

```typescript
// app/layout/useFullscreen.ts
import { useCallback, useState, useEffect } from "react";

type FullscreenElement = Element & {
  mozRequestFullScreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
};

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enter = useCallback(async (element?: Element) => {
    const targetElement = (element || document.documentElement) as FullscreenElement;
    
    try {
      if (targetElement.requestFullscreen) {
        await targetElement.requestFullscreen();
      } else if (targetElement.webkitRequestFullscreen) {
        await targetElement.webkitRequestFullscreen();
      } else if (targetElement.msRequestFullscreen) {
        await targetElement.msRequestFullscreen();
      } else if (targetElement.mozRequestFullScreen) {
        await targetElement.mozRequestFullScreen();
      }
    } catch (error) {
      console.error("Error entering fullscreen:", error);
      throw error;
    }
  }, []);

  const exit = useCallback(async () => {
    const doc = document as Document;
    
    try {
      if (doc.exitFullscreen) await doc.exitFullscreen();
      else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
      else if (doc.msExitFullscreen) await doc.msExitFullscreen();
      else if (doc.mozCancelFullScreen) await doc.mozCancelFullScreen();
    } catch (error) {
      console.error("Error exiting fullscreen:", error);
      throw error;
    }
  }, []);

  const toggle = useCallback(async (element?: Element) => {
    if (isFullscreen) await exit();
    else await enter(element);
  }, [isFullscreen, enter, exit]);

  // Fullscreen state tracking
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as Document;
      const fullscreenElement = 
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.msFullscreenElement ||
        doc.mozFullScreenElement;
      
      setIsFullscreen(!!fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return {
    isFullscreen,
    enter,
    exit,
    toggle,
    canUseFullscreen: !!(
      document.documentElement.requestFullscreen ||
      (document.documentElement as any).webkitRequestFullscreen ||
      (document.documentElement as any).msRequestFullscreen ||
      (document.documentElement as any).mozRequestFullScreen
    )
  };
}
```

# Features:

- Cross-browser fullscreen API support

- Real-time fullscreen state tracking

- Error handling for fullscreen operations

- Element-specific fullscreen targeting

**useAppThemeInit.ts**

Theme configuration and management hook.

```typescript
// app/layout/useAppThemeInit.ts
import { useThemeConfig } from "@/app/hooks/userInterface/ThemeConfigContext";
import { useLayout } from "../pages/layouts/LayoutContext";
import { useCallback } from "react";

interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  fontSize?: string;
  fontFamily?: string;
  backgroundColor?: string;
}

export function useAppThemeInit() {
  const { isDarkMode, setPrimaryColor, setSecondaryColor, setFontSize, setFontFamily } = useThemeConfig();
  const { setLayout } = useLayout();

  const initializeTheme = useCallback((config: ThemeConfig = {}) => {
    const {
      primaryColor = "#3498db",
      secondaryColor = "#e74c3c",
      fontSize = "16px",
      fontFamily = "Arial, sans-serif",
      backgroundColor = isDarkMode ? "#1a1a1a" : "#fff"
    } = config;

    setPrimaryColor(primaryColor);
    setSecondaryColor(secondaryColor);
    setFontSize(fontSize);
    setFontFamily(fontFamily);
    setLayout({ backgroundColor });
  }, [isDarkMode, setPrimaryColor, setSecondaryColor, setFontSize, setFontFamily, setLayout]);

  const resetTheme = useCallback(() => {
    setPrimaryColor("");
    setSecondaryColor("");
    setFontSize("");
    setFontFamily("");
    setLayout({ backgroundColor: "" });
  }, [setPrimaryColor, setSecondaryColor, setFontSize, setFontFamily, setLayout]);

  return {
    initializeTheme,
    resetTheme
  };
}
```

# Features:

**Default theme configuration**

- Dark mode awareness

- Theme reset capability

- Configurable theme properties

**useAnimatedRoot.ts**

# Animation control and reference management.

```typescript
// app/layout/useAnimatedRoot.ts
import { useRef, useCallback } from "react";
import { AnimatedComponentRef } from "../libraries/animations/AnimationComponent";

export function useAnimatedRoot() {
  const animatedComponentRef = useRef<AnimatedComponentRef>(null);

  const activateAnimation = useCallback(() => {
    if (animatedComponentRef.current) {
      animatedComponentRef.current.toggleActivation();
    }
  }, []);

  const deactivateAnimation = useCallback(() => {
    if (animatedComponentRef.current) {
      animatedComponentRef.current.toggleActivation();
    }
  }, []);

  return {
    animatedComponentRef,
    activateAnimation,
    deactivateAnimation
  };
}
```
# Features:

**Animation reference management**

## Activation/deactivation control

- Simple animation state toggling

**useLayoutState.ts**

## Layout visibility and state management.

```typescript
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
```
# Features:

- Minimized state tracking

- Fullscreen state synchronization

- Optimized callbacks with useCallback

