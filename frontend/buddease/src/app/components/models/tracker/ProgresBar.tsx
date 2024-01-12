// ProgressBar.tsx
import React from "react";


interface Progress {
  value: number;
  label: string;
  // additional properties as needed
}

interface ProgressBarProps {
  progress: Progress | null; // Progress value between 0 and 100
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

export default ProgressBar
export type { Progress };
