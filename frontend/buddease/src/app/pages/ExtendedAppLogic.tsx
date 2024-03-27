// ExtendedAppLogic.tsx
import { BytesLike } from "ethers";
import React from "react";
import { Navigator, Router, Routes, useLocation } from "react-router-dom";
import { ThemeConfigProvider } from "../components/hooks/userInterface/ThemeConfigContext";
import ThemeCustomization from "../components/hooks/userInterface/ThemeCustomization";
import { DynamicPromptProvider } from "../components/prompts/DynamicPromptContext";
import { NotificationData } from "../components/support/NofiticationsSlice";
import NotificationManager from "../components/support/NotificationManager";
import CollaborationDashboard from "./dashboards/CollaborationDashboard";
import SearchComponent from "./searchs/SearchComponent";

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
        onConfirm={(message: string, randomBytes: any) => {}}
        onCancel={() => {}}
        notify={(message: string, randomBytes: BytesLike) => {}}
        notifications={notifications}
        setNotifications={setNotifications}
      />
      <DynamicPromptProvider>
        <Router location={useLocation()} navigator={{} as Navigator}>
          <Routes>
            <SearchComponent documentData={[]} componentSpecificData={[]} />
            {/* Add more routes as needed */}
          </Routes>
        </Router>
      </DynamicPromptProvider>
    </ThemeConfigProvider>
  );
};

export default ExtendedAppLogic;
