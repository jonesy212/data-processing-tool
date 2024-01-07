// ProgressBar.tsx
import React from "react";

interface ProgressBarProps {
  progress: number; // Progress value between 0 and 100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => (
  <div>
 
    <div style={{ width: "100%", height: "20px", border: "1px solid #ccc" }}>
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          backgroundColor: "#4caf50",
        }}
      ></div>
    </div>
  </div>
);

export default ProgressBar;