// FullscreenButtonComponent.tsx
// platform/web/FullscreenButtonComponent.tsx
import React, { useState } from "react";
import { SharedButton } from '@/app/components/shared/Share'
frontend/buddease/platform/shared/SharedButton'
import ToggleSwitch from "@/app/libraries/menu/ToggleSwitch";

const FullscreenButtonComponent: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenMode = (checked: boolean): void => {
    try {
      if (checked) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(checked);
    } catch (error) {
      console.error("Error toggling fullscreen mode:", error);
    }
  };

  return (
    <div>
      <ToggleSwitch
        label="Fullscreen"
        checked={isFullscreen}
        onChange={handleFullscreenMode}
      />
      <SharedButton 
        label="Exit Fullscreen" 
        onClick={() => handleFullscreenMode(false)}
      />
    </div>
  );
};

export default FullscreenButtonComponent;