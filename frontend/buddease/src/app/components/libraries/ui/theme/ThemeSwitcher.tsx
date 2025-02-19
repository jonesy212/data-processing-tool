// ThemeSwitcher.tsx
import React from "react";
import { uiStore } from "@/app/components/state/stores/UIStore";

const ThemeSwitcher: React.FC = () => {
  // const uiStore = useUIStore();

  const toggleTheme = () => {
    // Toggle dark mode based on the current state
    uiStore.toggleDarkMode();
  };

  return (
    <div>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <p>Current Theme: {uiStore.darkModeEnabled ? 'Dark' : 'Light'}</p>
    </div>
  );
};

export default ThemeSwitcher;
