import { EditorState } from "draft-js";
import { useState } from "react";
import { Progress } from "../models/tracker/ProgressBar";
import ToolbarItem from "./ToolbarItem";
import React from "react";

// Define a new type for the toolbar options
type ToolbarOptions = {
  [key in keyof typeof toolbarOptions]: string[];
} & { calendar: boolean | string[] };


interface ToolbarProps {
  editorState: EditorState;
  activeDashboard: keyof typeof toolbarOptions;
  progress: Progress;
  onEditorStateChange: (state: EditorState) => void;
  toolbarOptions: ToolbarOptions; 
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
  calendar: true, 
  contacts: ["Contacts"],
  notes: ["Notes"],
  reminders: ["Reminders"],
  search: ["Search"],
  help: ["Help"],

  content: [
    "Articles",
    "Blogs",
    "Videos",
    "Podcasts",
    "Infographics",
    "Webinars",
    "Ebooks",
    "Whitepapers",
    "Case Studies",
    "Interviews",
    "Tutorials",
    "FAQs",
    "News",
    "Press Releases",
    "Presentations",
    "Courses",
    "Research Papers",
    "User Guides",
    "Product Documentation",
    "Technical Documentation",
    "Product Catalogs",
    "Recipes",
    "DIY Guides",
    "Reviews",
    "Opinion Pieces",
    "Editorials",
    "Galleries",
    "Animations",
    "Interactive Content",
    // Add more options based on your specific content types
  ],
  userManagement: ["User Profiles", "Permissions", "Roles", "Activity Logs"],
  notifications: ["Email Alerts", "Push Notifications", "SMS Alerts", "System Messages"],
  integrations: ["API Management", "Webhooks", "Third-party Services", "Plugins"],
  mediaManagement: ["Image Gallery", "Video Library", "Audio Files", "Document Library"],
  projectManagement: ["Project Overview", "Milestones", "Resource Allocation", "Time Tracking"],
  ecommerce: ["Product Listings", "Orders", "Customers", "Discounts", "Shipping"],
  
  reporting: ["Sales Reports", "User Activity", "Engagement Metrics", "Conversion Rates"],
  contentCreation: ["Blogs", "News", "Tutorials", "FAQs"],
  customerSupport: ["Support Tickets", "Live Chat", "Knowledge Base", "Feedback"],
  marketing: ["Campaigns", "Email Marketing", "Social Media", "SEO Tools"],
  
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


export type { ToolbarOptions, ToolbarProps };
