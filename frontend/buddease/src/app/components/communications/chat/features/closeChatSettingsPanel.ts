import { useRef } from "react";
import ChatSettings from "../ChatSettingsPanel";


const settingsPanel = useRef<ChatSettings | null>(null);
// Function to close the chat settings panel
export const closeChatSettingsPanel = () => {
  if (settingsPanel !== undefined && settingsPanel.current?.close) {
    settingsPanel.current.close();
  }
};
