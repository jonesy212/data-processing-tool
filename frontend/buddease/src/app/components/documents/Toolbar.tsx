import { EditorState } from "draft-js";
import React, { useState } from "react";
import { Progress } from "../models/tracker/ProgressBar";
import ToolbarItem from "./ToolbarItem";

interface ToolbarProps {
  editorState: EditorState;
  activeDashboard: keyof typeof toolbarOptions;
  progress: Progress;
  onEditorStateChange: (state: EditorState) => void;

}

// Define toolbar options with the editor state change handler
const toolbarOptions = {
  communication: ["Chat", "Call", "Video"],
  documents: [
    "Documents", "Surveys",
    "Reports", "Presentations",
    "Templates", "Diagrams",
    "Charts", "Proposals",
    "Contracts", "Agreements",
    "Briefs", "Whitepapers",
    "Manuals", "Guides",
    "Policies", "Forms",
    "Cryptocurrencies", "NFTs",
    "CryptoMarketNews", "CryptoTradingSignals",
    
  ],
  tasks: ["Tasks", "Todos", "Reminders"],
  settings: ["Settings", "Preferences", "Account"],
  crypto: ["Portfolio", "Trade", "Market Analysis", "Community"],
  analytics: ["Data Analysis", "Insights", "Reports"],
  community: ["Forums", "Collaboration", "Events"],
  onEditorStateChange: (state: EditorState) => {
    // Call method to update editor state
    console.log("Editor state changed:", state);
    // You can add your logic here to handle the editor state change
  },
  editorState: {},
} as const;


const Toolbar: React.FC<ToolbarProps> = ({ activeDashboard, progress, editorState , onEditorStateChange}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionClick = (option: string) => {
    console.log(`Clicked ${option} in ${activeDashboard} dashboard`);
    setSelectedOption(option);
  };

  return (
    <div className="toolbar">
      <h2>Toolbar</h2>
      <ul>
        {(toolbarOptions[activeDashboard] as unknown as string[]).map(
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
