// ExtendedAppLogic.tsx
import { DynamicPromptProvider } from "@/app/components/prompts/DynamicPromptContext";
import NotificationManager from "@/app/features/support/NotificationManager";
import { ThemeConfigProvider } from "@/app/hooks/userInterface/ThemeConfigContext";
import ThemeCustomization from "@/app/hooks/userInterface/ThemeCustomization";
import { NotificationState, initialNotificationState } from "@/app/state/redux/slices/NotificationSlice";
import { ThemeState, initialThemeState } from "@/app/state/redux/slices/ThemeSlice";
import { NotificationData } from "@/app/support/NofiticationsSlice";
import { BytesLike } from "ethers";
import React, { useState } from "react";
import { Navigator, Router, Routes, useLocation } from "react-router-dom";
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
