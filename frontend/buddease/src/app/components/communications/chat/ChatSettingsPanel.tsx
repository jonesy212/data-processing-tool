// ChatSettingsPanel.tsx
import React from "react";

import ChatSettings from '@/app/hooks/userInterface/ChatSettingsPanel';
import { useAuth } from '@/app/state/context/AuthContext';
import { UserData } from '@/app/users/User';
import { subscribeToRealtimeUpdates } from '@/utils/web3/dAppAdapter/functionality/RealtimeUpdates';
import { useEffect, useState } from 'react';
// Define the ChatSettingsPanel component
const ChatSettingsPanel: React.FC = () => {
  // State to track whether the panel is open or closed
  const [isOpen, setIsOpen] = useState(false);
  const { state: authState } = useAuth();

  // Get user settings from authState or use defaults
 // Default chat settings
  const defaultChatSettings: ChatSettings = {
    realTimeChatEnabled: false,
    notificationEmailEnabled: false,
    enableEmojis: true,
    enableAudioChat: false,
    enableVideoChat: false,
    enableFileSharing: true,
    enableBlockchainCommunication: false,
    enableDecentralizedStorage: false,
    collaborationPreference1: undefined,
    collaborationPreference2: undefined,
    platforms: [],
    messageFormat: 'markdown',
    mentionUsers: true
  };

  // Get user settings or use defaults
  const userSettings = authState.user?.settings;
  const initialChatSettings = userSettings?.chat || defaultChatSettings;

  const [chatSettings, setChatSettings] = useState<ChatSettings>(userSettings);

  // Function to toggle the panel open/close state
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    // Save updated settings to backend on change
    if (authState.user) {
      // Only subscribe if we have a user
      const unsubscribe = subscribeToRealtimeUpdates(
        authState.user, 
        (newData: UserData) => {
          handleRealtimeUpdate({
            realTimeChatEnabled: newData.realTimeChatEnabled ?? false,
            notificationEmailEnabled: newData.notificationEmailEnabled ?? false,
            enableEmojis: newData.enableEmojis ?? true,
            enableAudioChat: newData.enableAudioChat ?? false,
            enableVideoChat: newData.enableVideoChat ?? false,
            enableFileSharing: newData.enableFileSharing ?? true,
            enableBlockchainCommunication: newData.enableBlockchainCommunication ?? false,
            enableDecentralizedStorage: newData.enableDecentralizedStorage ?? false,
            collaborationPreference1: newData.collaborationPreference1,
            collaborationPreference2: newData.collaborationPreference2,
            platforms: newData.platforms,
            messageFormat: newData.messageFormat,
            mentionUsers: newData.mentionUsers
          });
        }
      );

      // Cleanup: Unsubscribe when the component unmounts
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [authState.user]);

  const handleRealtimeUpdate = (newSettings: ChatSettings) => {
    // Update chat settings based on real-time updates
    setChatSettings(newSettings);
  };

  const handleSettingChange = (
    settingName: keyof ChatSettings,
    value: boolean | string
  ) => {
    // Update chatSettings with proper type checking
    setChatSettings((prevSettings) => ({
      ...prevSettings,
      [settingName]: value,
    }));

    // Update userSettings in context/backend if needed
    // This would typically be an API call to update user settings
    if (authState.user && authState.user !== undefined) {
      // Here you would make an API call to update the user settings
      updateUserSettings(authState.user.id, { [settingName]: value });
    }
  };

  return (
    <div className={`chat-settings-panel ${isOpen ? 'open' : 'closed'}`}>
      <button onClick={togglePanel}>
        {isOpen ? 'Close Settings' : 'Open Settings'}
      </button>
      
      {isOpen && (
        <div className="settings-content">
          <h3>Chat Settings</h3>
          
          <div className="settings-group">
            <h4>Communication Settings</h4>
            
            <label className="setting-item">
              <span>Real-time Chat:</span>
              <input
                type="checkbox"
                checked={chatSettings.realTimeChatEnabled}
                onChange={(e) =>
                  handleSettingChange("realTimeChatEnabled", e.target.checked)
                }
              />
            </label>
            
            <label className="setting-item">
              <span>Notification Email:</span>
              <input
                type="checkbox"
                checked={chatSettings.notificationEmailEnabled}
                onChange={(e) =>
                  handleSettingChange("notificationEmailEnabled", e.target.checked)
                }
              />
            </label>
            
            <label className="setting-item">
              <span>Enable Emojis:</span>
              <input
                type="checkbox"
                checked={chatSettings.enableEmojis}
                onChange={(e) =>
                  handleSettingChange("enableEmojis", e.target.checked)
                }
              />
            </label>
            
            <label className="setting-item">
              <span>Enable Audio Chat:</span>
              <input
                type="checkbox"
                checked={chatSettings.enableAudioChat}
                onChange={(e) =>
                  handleSettingChange("enableAudioChat", e.target.checked)
                }
              />
            </label>
            
            <label className="setting-item">
              <span>Enable Video Chat:</span>
              <input
                type="checkbox"
                checked={chatSettings.enableVideoChat}
                onChange={(e) =>
                  handleSettingChange("enableVideoChat", e.target.checked)
                }
              />
            </label>
            
            <label className="setting-item">
              <span>Enable File Sharing:</span>
              <input
                type="checkbox"
                checked={chatSettings.enableFileSharing}
                onChange={(e) =>
                  handleSettingChange("enableFileSharing", e.target.checked)
                }
              />
            </label>
          </div>

          <div className="settings-group">
            <h4>Advanced Features</h4>
            
            <label className="setting-item">
              <span>Enable Blockchain Communication:</span>
              <input
                type="checkbox"
                checked={chatSettings.enableBlockchainCommunication}
                onChange={(e) =>
                  handleSettingChange("enableBlockchainCommunication", e.target.checked)
                }
              />
            </label>
            
            <label className="setting-item">
              <span>Enable Decentralized Storage:</span>
              <input
                type="checkbox"
                checked={chatSettings.enableDecentralizedStorage}
                onChange={(e) =>
                  handleSettingChange("enableDecentralizedStorage", e.target.checked)
                }
              />
            </label>
          </div>

          <div className="settings-group">
            <h4>Collaboration Preferences</h4>
            
            <label className="setting-item">
              <span>Collaboration Preference 1:</span>
              <input
                type="text"
                value={chatSettings.collaborationPreference1 || ''}
                onChange={(e) =>
                  handleSettingChange("collaborationPreference1", e.target.value)
                }
                placeholder="Enter preference 1"
              />
            </label>
            
            <label className="setting-item">
              <span>Collaboration Preference 2:</span>
              <input
                type="text"
                value={chatSettings.collaborationPreference2 || ''}
                onChange={(e) =>
                  handleSettingChange("collaborationPreference2", e.target.value)
                }
                placeholder="Enter preference 2"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to update user settings (you would implement this based on your API)
const updateUserSettings = async (userId: string, settings: Partial<ChatSettings>) => {
  // Make API call to update user settings
  try {
    // await api.updateUserSettings(userId, settings);
    console.log('Settings updated:', settings);
  } catch (error) {
    console.error('Failed to update settings:', error);
  }
};

export default ChatSettingsPanel;


