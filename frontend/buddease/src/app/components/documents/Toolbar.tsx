import { EditorState } from "draft-js";
import { useState } from "react";
import { Progress } from "../models/tracker/ProgressBar";
import ToolbarItem from "./ToolbarItem";

// Define a new type for the toolbar options
type ToolbarOptions = {
  [key in keyof typeof toolbarOptions]: string[];
};

interface ToolbarProps {
  editorState: EditorState;
  activeDashboard: keyof typeof toolbarOptions;
  progress: Progress;
  onEditorStateChange: (state: EditorState) => void;
  toolbarOptions: ToolbarOptions; // Use the new type definition
}

const onEditorStateChangeHandler = (callback: (state: EditorState) => void) => {
  return (state: EditorState) => {
    // Log the change in editor state
    console.log("Editor state changed:", state);
    // Call the provided callback function to handle the editor state change
    callback(state);
  };
};

// Define toolbar options with the editor state change handler
export const toolbarOptions = {
  communication: ["Chat", "Call", "Video"],
  documents: [
    "Documents",
    "Surveys",
    "Reports",
    "Presentations",
    "Templates",
    "Diagrams",
    "Charts",
    "Proposals",
    "Contracts",
    "Agreements",
    "Briefs",
    "Whitepapers",
    "Manuals",
    "Guides",
    "Policies",
    "Forms",
    "Cryptocurrencies",
    "NFTs",
    "CryptoMarketNews",
    "CryptoTradingSignals",
  ],
  tasks: ["Tasks", "Todos", "Reminders"],
  settings: ["Settings", "Preferences", "Account"],
  crypto: ["Portfolio", "Trade", "Market Analysis", "Community"],
  analytics: ["Data Analysis", "Insights", "Reports"],
  community: ["Forums", "Collaboration", "Events"],
  ui: ["Colors", "Fonts", "Layouts", "Templates", "Themes", "Plugins", "Extensions"],

  onEditorStateChange: onEditorStateChangeHandler,
  editorState: {},
} as const;

const Toolbar: React.FC<ToolbarProps> = ({
  activeDashboard,
  progress,
  editorState,
  onEditorStateChange,
  toolbarOptions,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionClick = (option: string) => {
    console.log(`Clicked ${option} in ${activeDashboard} dashboard`);
    setSelectedOption(option);
  };

  const handleEditorStateChange = (newState: EditorState) => {
    onEditorStateChange(newState);
  };

  return (
    <div className="toolbar">
      <h2>Toolbar</h2>
      <ToolbarList
        activeDashboard={activeDashboard}
        progress={progress}
        editorState={editorState}
        onEditorStateChange={handleEditorStateChange}
        // Ensure toolbarOptions is of type ToolbarOptions
        toolbarOptions={toolbarOptions}
      />
      <ul>
        {toolbarOptions[activeDashboard].map((option: string, index: number) => (
          <li key={index}>
            <ToolbarItem
              id={`toolbar-item-${index}`}
              label={option}
              onClick={() => handleOptionClick(option)}
            />
          </li>
        ))}
      </ul>
      {selectedOption && <p>Selected option: {selectedOption}</p>}
    </div>
  );
};

export default Toolbar;

// Renamed the inner variable from Toolbar to ToolbarList
const ToolbarList: React.FC<ToolbarProps> = ({
  activeDashboard,
  progress,
  editorState,
  onEditorStateChange,
  toolbarOptions,
}) => {
  return null; // Placeholder
};
