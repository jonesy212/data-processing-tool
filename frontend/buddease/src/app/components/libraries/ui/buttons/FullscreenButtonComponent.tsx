import React, { useState } from "react";
import ToggleSwitch from "../../menu/ToggleSwitch";

const FullscreenButtonComponent: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Function to handle toggling fullscreen mode
  const handleFullscreenMode = (checked: boolean): void => {
    try {
      if (checked) {
        // Enter fullscreen mode
        document.documentElement.requestFullscreen();
      } else {
        // Exit fullscreen mode
        document.exitFullscreen();
      }
      setIsFullscreen(checked);
    } catch (error) {
      console.error("Error toggling fullscreen mode:", error);
    }
  };

  // Function to handle toggling minimized state
  const handleMinimizeToggle = (): void => {
    setIsMinimized(!isMinimized);
  };

  // Function to handle exiting fullscreen mode
  const handleExitFullscreen = (): void => {
    try {
      // Exit fullscreen mode
      document.exitFullscreen();
      setIsFullscreen(false);
    } catch (error) {
      console.error("Error exiting fullscreen mode:", error);
    }
  };

  return (
    <div>
      {!isMinimized && (
        <div>
          {/* Toggle switch for fullscreen mode */}
          <ToggleSwitch
            label="Fullscreen"
            checked={isFullscreen}
            onChange={handleFullscreenMode}
            aria-label="Toggle fullscreen mode"
          />
          {/* Button to exit fullscreen mode */}
          <button onClick={handleExitFullscreen} aria-label="Exit fullscreen">
            Exit Fullscreen
          </button>
        </div>
      )}
      {/* Minimize button */}
      <button onClick={handleMinimizeToggle} aria-label="Toggle minimize">
        {isMinimized ? "Maximize" : "Minimize"}
      </button>
    </div>
  );
};

export default FullscreenButtonComponent;
