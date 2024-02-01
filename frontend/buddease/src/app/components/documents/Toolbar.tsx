// Toolbar.tsx
import React, { useState } from "react";
import { Progress } from "../models/tracker/ProgresBar";
import ToolbarItem from "./ToolbarItem";

interface ToolbarProps {
  activeDashboard: keyof typeof toolbarOptions; 
  progress: Progress
}

const toolbarOptions = {
  communication: ["Chat", "Call", "Video"],
  // Add more dashboard options as needed
  documents: ["Documents", "Reports", "Presentations"],
  tasks: ["Tasks", "Todos", "Reminders"],
  settings: ["Settings", "Preferences", "Account"],
} as const; // Specify as const to infer the exact string literals

const Toolbar: React.FC<ToolbarProps> = ({ activeDashboard, progress }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionClick = (option: string) => {
    // Logic to handle option click based on the active dashboard
    console.log(`Clicked ${option} in ${activeDashboard} dashboard`);
    setSelectedOption(option);
  };

  return (
    <div className="toolbar">
      <h2>Toolbar</h2>
      <ul>
        {toolbarOptions[activeDashboard].map(
          (option: string, index: number) => (
            <li key={index}>
              <ToolbarItem
                id={`toolbar-item-${index}`}
                label={option}
                onClick={() => handleOptionClick(option)}
              />
            </li>
          )
        )}
      </ul>
      {selectedOption && <p>Selected option: {selectedOption}</p>}
    </div>
  );
};

export default Toolbar;
