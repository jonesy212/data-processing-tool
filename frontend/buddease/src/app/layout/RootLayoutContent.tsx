// app/layout/RootLayoutContent.tsx
"use client";

import React, { RefObject } from "react";

// Define the props interface
export interface RootLayoutContentProps {
  children: React.ReactNode;
  isMinimized: boolean;
  isFullscreen: boolean;
  isComponentLoaded: boolean;
  animatedComponentRef: RefObject<any>;
  onMinimizeToggle: () => void;
  onFullscreenToggle: (checked: boolean) => Promise<void>;
  onExitFullscreen: () => Promise<void>;
  onLayoutEffect: () => Promise<void>;
}

const RootLayoutContent: React.FC<RootLayoutContentProps> = ({
  children,
  isMinimized,
  isFullscreen,
  isComponentLoaded,
  animatedComponentRef,
  onMinimizeToggle,
  onFullscreenToggle,
  onExitFullscreen,
  onLayoutEffect
}) => {
  // Your layout content implementation
  return (
    <div 
      ref={animatedComponentRef}
      className={`root-layout ${isMinimized ? 'minimized' : ''} ${isFullscreen ? 'fullscreen' : ''}`}
    >
      {isComponentLoaded && children}
    </div>
  );
};

export default RootLayoutContent;