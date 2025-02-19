// ChatSettingsPanel.tsx
import React, { useState } from "react";

// Define the ChatSettingsPanel component
const ChatSettingsPanel: React.FC = () => {
  // State to track whether the panel is open or closed
  const [isOpen, setIsOpen] = useState(false);

  // Function to toggle the panel open/close state
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`chat-settings-panel ${isOpen ? 'open' : 'closed'}`}>
      <button onClick={togglePanel}>Toggle Settings Panel</button>
      <h3>Chat Settings</h3>
      {/* Add your settings components or content here */}
    </div>
  );
};

export default ChatSettingsPanel;
