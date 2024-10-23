// CollaborationSettings
// CollaborationSettings.tsx
import { LanguageEnum } from '@/app/components/communications/LanguageEnum';
import React, { useState } from 'react';

interface CollaborationSettingsProps {
  onSave: (settings: CollaborationSettingsState) => void;
}

interface CollaborationSettingsState {
  notificationsEnabled: boolean;
  theme: string;
  language: LanguageEnum;
  // Add more settings properties here
}

const CollaborationSettings: React.FC<CollaborationSettingsProps> = ({ onSave }) => {
  const [settings, setSettings] = useState<CollaborationSettingsState>({
    notificationsEnabled: true,
    theme: 'light',
    language: LanguageEnum.English,
    // Initialize other settings properties here
  });

  const handleSaveSettings = () => {
    onSave(settings);
  };

  const handleNotificationsToggle = () => {
    setSettings((prevState) => ({
      ...prevState,
      notificationsEnabled: !prevState.notificationsEnabled,
    }));
  };

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = event.target.value;
    setSettings((prevState) => ({
      ...prevState,
      theme: newTheme,
    }));
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value;
    setSettings((prevState) => ({
      ...prevState,
      language: newLanguage as LanguageEnum,
    }));
  };

  return (
    <div>
      <h2>Collaboration Settings</h2>
      <div>
        <label>
          Enable Notifications:
          <input type="checkbox" checked={settings.notificationsEnabled} onChange={handleNotificationsToggle} />
        </label>
      </div>
      <div>
        <label>
          Theme:
          <select value={settings.theme} onChange={handleThemeChange}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Language:
          <select value={settings.language} onChange={handleLanguageChange}>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            {/* Add more language options here */}
          </select>
        </label>
      </div>
      <button onClick={handleSaveSettings}>Save Settings</button>
    </div>
  );
};

export default CollaborationSettings;
export type {
  CollaborationSettingsProps,
  CollaborationSettingsState
};

