import React from "react";

import userSettings from '@/app/configs/UserSettings';
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { UserData } from '../../users/User';
import { subscribeToRealtimeUpdates } from '../../web3/dAppAdapter/functionality/RealtimeUpdates';

// Define a type for chat settings
interface ChatSettings {
  realTimeChatEnabled: boolean;
  notificationEmailEnabled: boolean;
  enableEmojis: boolean;
  enableAudioChat: boolean;
  enableVideoChat: boolean;
  enableFileSharing: boolean;
  enableBlockchainCommunication: boolean;
  enableDecentralizedStorage: boolean;
  collaborationPreference1: string | undefined;
  collaborationPreference2: string | undefined;
  close?: () => void;
  // Add more settings as needed
}


const ChatSettingsPanel = () => {
  const { state: authState } = useAuth();


  const [chatSettings, setChatSettings] = useState<ChatSettings>({
    // Define chat-related settings here
    
    realTimeChatEnabled: userSettings.realTimeChatEnabled,
    notificationEmailEnabled: userSettings.notificationEmailEnabled,
    enableEmojis: userSettings.enableEmojis,
    enableAudioChat: userSettings.enableAudioChat,
    enableVideoChat: userSettings.enableVideoChat,
    enableFileSharing: userSettings.enableFileSharing,
    enableBlockchainCommunication: userSettings.enableBlockchainCommunication,
    enableDecentralizedStorage: userSettings.enableDecentralizedStorage,
    collaborationPreference1: userSettings.collaborationPreference1,
    collaborationPreference2: userSettings.collaborationPreference2,
    // Add more settings as needed
  } as {
    realTimeChatEnabled: boolean;
    notificationEmailEnabled: boolean;
    enableEmojis: boolean;
    enableAudioChat: boolean;
    enableVideoChat: boolean;
    enableFileSharing: boolean;
    enableBlockchainCommunication: boolean;
    enableDecentralizedStorage: boolean;
    collaborationPreference1: string | undefined;
    collaborationPreference2: string | undefined;
    });
  
  
useEffect(() => {
  // Save updated settings to backend on change
  if (authState.user) {
    // Only subscribe if we have a user
    const unsubscribe = subscribeToRealtimeUpdates(
      authState.user, 
      (newData: UserData) => {
        handleRealtimeUpdate({
          ...newData,
          realTimeChatEnabled: false,
          notificationEmailEnabled: false,
          enableEmojis: false,
          enableAudioChat: false,
          enableVideoChat: false,
          enableFileSharing: false,
          enableBlockchainCommunication: false,
          enableDecentralizedStorage: false,
          collaborationPreference1: undefined,
          collaborationPreference2: undefined,
        });
      }
    );

    // Cleanup: Unsubscribe when the component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe
      }
    };
  }
}, [authState.user]);



  const handleRealtimeUpdate = (newSettings: typeof chatSettings) => {
    // Update chat settings based on real-time updates
    setChatSettings(newSettings);
  };

  
  const handleSettingChange = (
    settingName: keyof typeof chatSettings,
    value: boolean | string
  ) => {
    // Add type checking for value
    if (typeof value === "boolean") {
      // Update chatSettings with boolean value
      setChatSettings((prevSettings) => ({
        ...prevSettings,
        [settingName]: value as boolean,
      }));
    } else if (typeof value === "string") {
      // Update chatSettings with string value
      setChatSettings((prevSettings) => ({
        ...prevSettings,
        [settingName]: value as string,
      }));
    }

    // Update userSettings
    if (settingName in userSettings) {
      (userSettings[settingName] as unknown) = value;
    }
  };



  return (
    <div>
      <h3>Communication Settings</h3>
      {/* Display and manage chat settings UI */}
      <label>
        Real-time Chat:
        <input
          type="checkbox"
          checked={chatSettings.realTimeChatEnabled}
          onChange={(e) =>
            handleSettingChange("realTimeChatEnabled", e.target.checked)
          }
        />
      </label>
      <label>
        Notification Email:
        <input
          type="checkbox"
          checked={chatSettings.notificationEmailEnabled}
          onChange={(e) =>
            handleSettingChange("notificationEmailEnabled", e.target.checked)
          }
        />
      </label>
      <label>
        Enable Emojis:
        <input
          type="checkbox"
          checked={chatSettings.enableEmojis}
          onChange={(e) =>
            handleSettingChange("enableEmojis", e.target.checked)
          }
        />
      </label>
      <label>
        Enable Audio Chat:
        <input
          type="checkbox"
          checked={chatSettings.enableAudioChat}
          onChange={(e) =>
            handleSettingChange("enableAudioChat", e.target.checked)
          }
        />
      </label>
      <label>
        Enable Video Chat:
        <input
          type="checkbox"
          checked={chatSettings.enableVideoChat}
          onChange={(e) =>
            handleSettingChange("enableVideoChat", e.target.checked)
          }
        />
      </label>
      <label>
        Enable File Sharing:
        <input
          type="checkbox"
          checked={chatSettings.enableFileSharing}
          onChange={(e) =>
            handleSettingChange("enableFileSharing", e.target.checked)
          }
        />
      </label>
      <label>
        Enable Blockchain Communication:
        <input
          type="checkbox"
          checked={chatSettings.enableBlockchainCommunication}
          onChange={(e) =>
            handleSettingChange("enableBlockchainCommunication", e.target.checked)
          }
        />
      </label>
      <label>
        Enable Decentralized Storage:
        <input
          type="checkbox"
          checked={chatSettings.enableDecentralizedStorage}
          onChange={(e) =>
            handleSettingChange("enableDecentralizedStorage", e.target.checked)
          }
        />
      </label>
      <label>
        Collaboration Preference 1:
        <input
          type="text"
          value={chatSettings.collaborationPreference1 || ''}
          onChange={(e) =>
            handleSettingChange("collaborationPreference1", e.target.value)
          }
        />
      </label>
      <label>
        Collaboration Preference 2:
        <input
          type="text"
          value={chatSettings.collaborationPreference2 || ''}
          onChange={(e) =>
            handleSettingChange("collaborationPreference2", e.target.value)
          }
        />
      </label>
      {/* Add more settings UI */}
    </div>
  );
};

export default ChatSettings;
export { ChatSettingsPanel };

