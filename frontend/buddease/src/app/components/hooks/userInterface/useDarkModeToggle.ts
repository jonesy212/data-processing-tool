import { useState } from 'react';

const useDarkModeToggle = () => {
  const [isDarkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
    // Your logic to toggle dark mode in the application
  };

  return {
    isDarkMode,
    toggleDarkMode,
  };
};


export default useDarkModeToggle;
