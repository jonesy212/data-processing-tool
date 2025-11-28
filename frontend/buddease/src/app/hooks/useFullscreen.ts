// useFullscreen.ts
// app/layout/useFullscreen.ts
import { useCallback, useState, useEffect } from "react";

type FullscreenElement = Element & {
  mozRequestFullScreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
};

type BrowserDocument = {
  exitFullscreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  fullscreenElement?: Element | null;
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
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
    const doc = document as BrowserDocument;
    
    try {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen();
      }
    } catch (error) {
      console.error("Error exiting fullscreen:", error);
      throw error;
    }
  }, []);

  const toggle = useCallback(async (element?: Element) => {
    if (isFullscreen) {
      await exit();
    } else {
      await enter(element);
    }
  }, [isFullscreen, enter, exit]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as BrowserDocument;
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