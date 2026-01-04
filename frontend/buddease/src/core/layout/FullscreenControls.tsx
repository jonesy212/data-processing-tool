FullscreenControls.tsx
FullscreenControls.tsx
app/layout/FullscreenControls.tsx
import React from "react";

interface FullscreenControlsProps {
  isFullscreen: boolean;
  isComponentLoaded: boolean;
  onFullscreenToggle: (checked: boolean) => void;
  onExitFullscreen: () => void;
}

export const FullscreenControls: React.FC<FullscreenControlsProps> = ({
  isFullscreen,
  isComponentLoaded,
  onFullscreenToggle,
  onExitFullscreen
}) => (
  <div className="fullscreen-controls">
    <div className="control-group">
      <label className="toggle-label">
        <input 
          type="checkbox" 
          checked={isComponentLoaded}
          onChange={(e) => onFullscreenToggle(e.target.checked)}
          className="toggle-input"
        />
        <span className="toggle-slider"></span>
        Fullscreen Mode
      </label>
      
      {isFullscreen && (
        <button 
          onClick={onExitFullscreen}
          className="exit-fullscreen-btn"
        >
          Exit Fullscreen
        </button>
      )}
    </div>
  </div>
);