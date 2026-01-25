// closeChatSettingsPanel.ts
import { ChatSettings } from "@/core/notifications/NotificationChannelManager";
import { useRef } from "react";

const settingsPanel = useRef<ChatSettings | null>(null);
// Function to close the chat settings panel
export const closeChatSettingsPanel = () => {
  if (settingsPanel !== undefined && settingsPanel.current?.close) {
    settingsPanel.current.close();
  }
};
