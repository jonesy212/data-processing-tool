// LayoutControls.tsx
// LayoutControls.ts
// app/layout/LayoutControls.tsx
import React from "react";

interface LayoutControlsProps {
  isMinimized: boolean;
  onMinimizeToggle: () => void;
}

export const LayoutControls: React.FC<LayoutControlsProps> = ({
  isMinimized,
  onMinimizeToggle
}) => (
  <div className="layout-controls">
    <button 
      onClick={onMinimizeToggle}
      className={`minimize-toggle-btn ${isMinimized ? 'maximize' : 'minimize'}`}
    >
      {isMinimized ? "↗ Maximize" : "↘ Minimize"}
    </button>
  </div>
);