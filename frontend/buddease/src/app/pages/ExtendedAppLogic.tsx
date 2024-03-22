// ExtendedAppLogic.tsx
// ExtendedAppLogic.tsx
import React from "react";
import { Router, Routes } from "react-router-dom";
import { ThemeConfigProvider } from "../components/hooks/userInterface/ThemeConfigContext";
import { ThemeCustomization } from "../components/hooks/userInterface/ThemeCustomization";
import { DynamicPromptProvider } from "../components/prompts/DynamicPromptContext";
import { NotificationData } from "../components/support/NofiticationsSlice";
import { NotificationManager } from "../components/support/NotificationManager";
import { CollaborationDashboard } from "./dashboards/CollaborationDashboard";
import { SearchComponent } from "./searchs/SearchComponent";

interface ExtendedAppProps {
  notifications: NotificationData[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationData[]>>;
}

const ExtendedAppLogic: React.FC<ExtendedAppProps> = ({
  notifications,
  setNotifications,
}) => {
  return (
    <ThemeConfigProvider>
      <ThemeCustomization />
      <CollaborationDashboard />
      <NotificationManager
        notifications={notifications}
        setNotifications={setNotifications}
      />
      <DynamicPromptProvider>
        <Router>
          <Routes>
            <SearchComponent />
            {/* Add more routes as needed */}
          </Routes>
        </Router>
      </DynamicPromptProvider>
    </ThemeConfigProvider>
  );
};

export default ExtendedAppLogic;
