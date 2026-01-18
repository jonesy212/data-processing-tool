// GlobalSettingsComponent.tsx
// Example usage in a React component
import {
    initializeGlobalState,
    selectDarkMode,
    selectLanguage,
    selectTheme,
    setLanguage,
    setTheme,
    toggleDarkMode
} from '@/core/state/redux/slices/globalSlice';
import type { RootState } from '@/core/state/redux/slices/RootSlice';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const GlobalSettingsComponent: React.FC = () => {
  const dispatch = useDispatch();
  const language = useSelector(selectLanguage);
  const theme = useSelector(selectTheme);
  const darkMode = useSelector(selectDarkMode);
  const globalState = useSelector((state: RootState) => state.global);

  useEffect(() => {
    dispatch(initializeGlobalState());
  }, [dispatch]);

  const handleLanguageChange = (newLanguage: string) => {
    dispatch(setLanguage(newLanguage));
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    dispatch(setTheme(newTheme));
  };

  return (
    <div className="global-settings">
      <h2>Global Settings</h2>
      
      <div className="setting-group">
        <label>Language:</label>
        <select 
          value={language} 
          onChange={(e) => handleLanguageChange(e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>
      
      <div className="setting-group">
        <label>Theme:</label>
        <select 
          value={theme} 
          onChange={(e) => handleThemeChange(e.target.value as any)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>
      
      <div className="setting-group">
        <label>Dark Mode:</label>
        <input
          type="checkbox"
          checked={darkMode}
          onChange={() => dispatch(toggleDarkMode())}
        />
      </div>
      
      <div className="state-info">
        <p>Last Saved: {globalState.lastSaved?.toLocaleString() || 'Never'}</p>
        <p>Environment: {globalState.environment}</p>
        <p>Version: {globalState.version}</p>
      </div>
    </div>
  );
};

export default GlobalSettingsComponent;