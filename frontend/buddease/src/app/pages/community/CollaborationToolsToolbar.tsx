// CollaborationToolsToolbar.tsx
import ToolbarItem from "@/app/components/documents/ToolbarItem";
import React from "react";

interface CollaborationToolsToolbarProps {
  projectManagementOptions: string[];
  documentManagementOptions: string[];
  taskManagementOptions: string[];
  calendarOptions: string[];
  analyticsOptions: string[];
  securityOptions: string[];
  integrationOptions: string[];
  userManagementOptions: string[];
  mobileAppOptions: string[];
  accessibilityOptions: string[];
  supportOptions: string[];
  localizationOptions: string[];
  gamificationOptions: string[];
}

const CollaborationToolsToolbar: React.FC<CollaborationToolsToolbarProps> = ({
  projectManagementOptions,
  documentManagementOptions,
  taskManagementOptions,
  calendarOptions,
  analyticsOptions,
  securityOptions,
  integrationOptions,
  userManagementOptions,
  mobileAppOptions,
  accessibilityOptions,
  supportOptions,
  localizationOptions,
  gamificationOptions,
}) => {
  const toolbarOptions = {
    communication: ["Audio Calls", "Video Calls", "Text Messaging"],
    collaboration: [
      "File Sharing",
      "Screen Sharing",
      "Interactive Whiteboard",
      "Shared Document Editing",
      "Task Boards",
      "Shared Calendars",
      "Polls and Surveys",
    ],
    brainstorming: ["Brainstorming Sessions"],
    community: [
      "Discussion Forums",
      "Community Events Calendar",
      "User Profiles with Skills and Expertise",
      "Cryptocurrency Integration",
    ],
    projectManagement: projectManagementOptions,
    documentManagement: documentManagementOptions,
    taskManagement: taskManagementOptions,
    calendar: calendarOptions,
    analytics: analyticsOptions,
    security: securityOptions,
    integration: integrationOptions,
    userManagement: userManagementOptions,
    mobileApp: mobileAppOptions,
    accessibility: accessibilityOptions,
    support: supportOptions,
    localization: localizationOptions,
    gamification: gamificationOptions,
  };

  const handleOptionClick = (option: string) => {
    console.log(`Clicked ${option} in Collaboration Tools toolbar`);
    // Handle option click logic here
  };

  return (
    <div className="toolbar">
      <h2>Collaboration Tools Toolbar</h2>
      <ul>
        {Object.entries(toolbarOptions).map(([category, options]) => (
          <React.Fragment key={category}>
            <h3>{category}</h3>
            <ul>
              {options.map((option, index) => (
                <li key={index}>
                  <ToolbarItem
                    id={`collaboration-tools-toolbar-item-${category}-${index}`}
                    label={option}
                    onClick={() => handleOptionClick(option)}
                  />
                </li>
              ))}
            </ul>
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};

export default CollaborationToolsToolbar;
