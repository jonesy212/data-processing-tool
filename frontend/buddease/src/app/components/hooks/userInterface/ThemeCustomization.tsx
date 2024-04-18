// ThemeCustomization.tsx
import { ThemeConfig } from '@/app/components/libraries/ui/theme/ThemeConfig';
import React, { SetStateAction, useState } from "react";
import { NotificationManagerServiceProps } from '../../notifications/NotificationService';
import { useThemeConfig } from "./ThemeConfigContext";
 
interface ThemeCustomizationProps { 
  themeState: ThemeConfig;
  setThemeState: React.Dispatch<React.SetStateAction<ThemeConfig>>;
  notificationState: NotificationManagerServiceProps;
  setPrimaryColor: React.Dispatch<SetStateAction<ThemeConfig>>
  setSecondaryColor: React.Dispatch<SetStateAction<ThemeConfig>>
  setFontSize: React.Dispatch<React.SetStateAction<string>>;
}
const ThemeCustomization: React.FC<ThemeCustomizationProps> = ({
  themeState,
  setThemeState,
  notificationState
}) => {
  const {
    primaryColor,
    setPrimaryColor,
    secondaryColor,
    setSecondaryColor,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
  } = useThemeConfig();


  const [localThemeState, setLocalThemeState] = useState<ThemeConfig>({
    ...themeState,
  });




  const handleSecondaryColorChange = (color: string) => {
    setLocalThemeState((prevState) => ({
      ...prevState,
      secondaryColor: color,
    }));
  };

  const handleFontSizeChange = (size: string) => {
    setLocalThemeState((prevState) => ({
      ...prevState,
      fontSize: size,
    }));
  };

  const handleFontFamilyChange = (family: string) => {
    setLocalThemeState((prevState) => ({
      ...prevState,
      fontFamily: family,
    }));
  };

  const saveThemeSettings = () => {
    setThemeState(localThemeState);
    // Additional logic to save theme settings, e.g., to local storage or server
  };
  const handlePrimaryColorChange = (color: string) => {
    setPrimaryColor(color);
  };


  const handleNotificationSettingsChange = (setting: string) => {
    notificationState.setNotifications((prevState: any) => ({
      ...prevState,
      [setting]: !prevState[setting],
    }));
    // Additional logic to update notification settings in the application
  };


  return (
    <div>
      <h2>Theme Customization</h2>
      <label>
      Primary Color:
        <input
          type="color"
          value={localThemeState.primaryColor}
          onChange={(e) => handlePrimaryColorChange(e.target.value)}
        />
      </label>
      <label>
        Secondary Color:
        <input
          type="color"
          value={localThemeState.secondaryColor}
          onChange={(e) => handleSecondaryColorChange(e.target.value)}
        />
      </label>
      <label>
        Font Size:
        <input
          type="text"
          value={localThemeState.fontSize}
          onChange={(e) => handleFontSizeChange(e.target.value)}
        />
      </label>
      <label>
        Font Family:
        <input
          type="text"
          value={localThemeState.fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value)}
        />
      </label>
      <button onClick={saveThemeSettings}>Save Theme Settings</button>
      {/* Example of integrating notification settings */}
      <div>
        <h2>Notification Settings</h2>
        <label>
          <input
            type="checkbox"
            checked={!!(notificationState.notifications.length > 0 && notificationState.notifications[0].email)}
            onChange={() => handleNotificationSettingsChange("email")}
          />
          Email Notifications
        </label>
        <label>
          <input
            type="checkbox"
            checked={!!(notificationState.notifications.length > 0 && notificationState.notifications[0].inApp)}
            onChange={() => handleNotificationSettingsChange("inApp")}
          />
          In-App Notifications
        </label>
        <label>
          <input
            type="checkbox"
            checked={notificationState.notifications.length > 0}
            onChange={() => handleNotificationSettingsChange("push")}
          />
          Push Notifications
        </label>
      </div>
    </div>
  );
};

export default ThemeCustomization;
