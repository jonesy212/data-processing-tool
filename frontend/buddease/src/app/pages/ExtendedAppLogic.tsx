// ExtendedAppLogic.tsx
import { BytesLike } from "ethers";
import React, { useState } from "react";
import { Navigator, Router, Routes, useLocation } from "react-router-dom";
import { ThemeConfigProvider } from "../components/hooks/userInterface/ThemeConfigContext";
import ThemeCustomization from "../components/hooks/userInterface/ThemeCustomization";
import { DynamicPromptProvider } from "../components/prompts/DynamicPromptContext";
import { NotificationData } from "../components/support/NofiticationsSlice";
import NotificationManager from "../components/support/NotificationManager";
import CollaborationDashboard from "./dashboards/CollaborationDashboard";
import SearchComponent from "./searchs/SearchComponent";
import { ThemeState, initialThemeState } from "../components/state/redux/slices/ThemeSlice";
import { NotificationState, initialNotificationState } from "../components/state/redux/slices/NotificationSlice";

interface ExtendedAppProps {
  notifications: NotificationData[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationData[]>>;
}

const ExtendedAppLogic: React.FC<ExtendedAppProps> = ({
  notifications,
  setNotifications,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [themeState, setThemeState] = useState<ThemeState>(initialThemeState);
  const [notificationState, setNotificationState] = useState<NotificationState[]>([initialNotificationState]);
  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <ThemeConfigProvider>
      <ThemeCustomization
        infoColor={themeState.infoColor}
        themeState={themeState}
        setThemeState={setThemeState}
        notificationState={setNotificationState} />
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
            <SearchComponent
              documentData={[]}
              componentSpecificData={[]}
              searchQuery={searchQuery}
            />

            {/* Add more routes as needed */}
          </Routes>
        </Router>
      </DynamicPromptProvider>
    </ThemeConfigProvider>
  );
};

export default ExtendedAppLogic;
