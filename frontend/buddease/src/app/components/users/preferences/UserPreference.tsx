// UpdatePreference.tsx
import React, { useState } from 'react';

const UpdatePreference: React.FC = () => {
  // State variables to manage user preferences
  const [theme, setTheme] = useState<string>('light');
  const [language, setLanguage] = useState<string>('en');
  const [notificationSettings, setNotificationSettings] = useState<{
    email: boolean;
    inApp: boolean;
    push: boolean;
  }>({
    email: true,
    inApp: true,
    push: false,
  });

  // Function to handle theme change
  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme);
    // Additional logic to update theme in the application
  };

  // Function to handle language change
  const handleLanguageChange = (selectedLanguage: string) => {
    setLanguage(selectedLanguage);
    // Additional logic to update language in the application
  };

  // Function to handle notification settings change
  const handleNotificationSettingsChange = (
    setting: keyof typeof notificationSettings
  ) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    });
    // Additional logic to update notification settings in the application
  };

  // Function to save preferences
  const savePreferences = () => {
    // Additional logic to save preferences, e.g., to local storage or server
    console.log('Preferences saved:', { theme, language, notificationSettings });
  };

  return (
    <div>
      <h2>Update Preferences</h2>
      {/* Theme selection */}
      <div>
        <label htmlFor="theme">Theme:</label>
        <select id="theme" value={theme} onChange={(e) => handleThemeChange(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      {/* Language selection */}
      <div>
        <label htmlFor="language">Language:</label>
        <select id="language" value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
          <option value="en">English</option>
          <option value="fr">French</option>
          {/* Add more language options as needed */}
        </select>
      </div>

      {/* Notification settings */}
      <div>
        <h3>Notification Settings:</h3>
        <label>
          <input
            type="checkbox"
            checked={notificationSettings.email}
            onChange={() => handleNotificationSettingsChange('email')}
          />
          Email
        </label>
        <label>
          <input
            type="checkbox"
            checked={notificationSettings.inApp}
            onChange={() => handleNotificationSettingsChange('inApp')}
          />
          In-App
        </label>
        <label>
          <input
            type="checkbox"
            checked={notificationSettings.push}
            onChange={() => handleNotificationSettingsChange('push')}
          />
          Push
        </label>
      </div>

      {/* Save button */}
      <button onClick={savePreferences}>Save Preferences</button>
    </div>
  );
};

export default UpdatePreference;
