// components/global/GlobalComponent.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/state/redux/slices/RootSlice';
import { 
  setGlobalConfig, 
  setLanguage, 
  setTheme, 
  toggleDarkMode,
  updateGlobalState 
} from '@/app/state/redux/slices/globalSlice';

interface GlobalComponentProps {
  onConfigChange?: (config: any) => void;
  onLanguageChange?: (language: string) => void;
  showAdvancedSettings?: boolean;
}

const GlobalComponent: React.FC<GlobalComponentProps> = ({
  onConfigChange,
  onLanguageChange,
  showAdvancedSettings = false
}) => {
  const dispatch = useDispatch();
  const globalState = useSelector((state: RootState) => state.global);
  const [localConfig, setLocalConfig] = useState({
    language: globalState.language,
    theme: globalState.theme,
    darkMode: globalState.darkMode,
    timezone: globalState.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: globalState.dateFormat || 'MM/DD/YYYY',
    numberFormat: globalState.numberFormat || 'en-US',
    accessibility: globalState.accessibility || {}
  });

  // Available languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' }
  ];

  // Available themes
  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto (System)' }
  ];

  // Date formats
  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
  ];

  // Number formats
  const numberFormats = [
    { value: 'en-US', label: '1,234.56' },
    { value: 'de-DE', label: '1.234,56' },
    { value: 'fr-FR', label: '1 234,56' }
  ];

  useEffect(() => {
    // Update local config when global state changes
    setLocalConfig({
      language: globalState.language,
      theme: globalState.theme,
      darkMode: globalState.darkMode,
      timezone: globalState.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: globalState.dateFormat || 'MM/DD/YYYY',
      numberFormat: globalState.numberFormat || 'en-US',
      accessibility: globalState.accessibility || {}
    });
  }, [globalState]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLocalConfig(prev => ({ ...prev, language: newLanguage }));
    dispatch(setLanguage(newLanguage));
    onLanguageChange?.(newLanguage);
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value as 'light' | 'dark' | 'auto';
    setLocalConfig(prev => ({ ...prev, theme: newTheme }));
    dispatch(setTheme(newTheme));
    
    // Apply theme immediately
    if (newTheme === 'dark' || (newTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleDarkModeToggle = () => {
    dispatch(toggleDarkMode());
    const newDarkMode = !localConfig.darkMode;
    setLocalConfig(prev => ({ ...prev, darkMode: newDarkMode }));
  };

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimezone = e.target.value;
    setLocalConfig(prev => ({ ...prev, timezone: newTimezone }));
    dispatch(updateGlobalState({ timezone: newTimezone }));
  };

  const handleDateFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value;
    setLocalConfig(prev => ({ ...prev, dateFormat: newFormat }));
    dispatch(updateGlobalState({ dateFormat: newFormat }));
  };

  const handleNumberFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value;
    setLocalConfig(prev => ({ ...prev, numberFormat: newFormat }));
    dispatch(updateGlobalState({ numberFormat: newFormat }));
  };

  const handleAccessibilityToggle = (setting: string) => {
    const newAccessibility = {
      ...localConfig.accessibility,
      [setting]: !localConfig.accessibility[setting]
    };
    setLocalConfig(prev => ({ ...prev, accessibility: newAccessibility }));
    dispatch(updateGlobalState({ accessibility: newAccessibility }));
  };

  const saveGlobalConfig = () => {
    dispatch(setGlobalConfig(localConfig));
    onConfigChange?.(localConfig);
    alert('Global settings saved successfully!');
  };

  const resetToDefaults = () => {
    const defaults = {
      language: 'en',
      theme: 'auto',
      darkMode: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'MM/DD/YYYY',
      numberFormat: 'en-US',
      accessibility: {}
    };
    dispatch(setGlobalConfig(defaults));
    setLocalConfig(defaults);
    alert('Settings reset to defaults!');
  };

  return (
    <div className="global-component">
      <div className="global-header">
        <h3>Global Settings</h3>
        <p className="description">
          Configure application-wide settings that affect all users
        </p>
      </div>

      <div className="global-settings">
        {/* Language Settings */}
        <div className="setting-group">
          <label htmlFor="language">Language</label>
          <select
            id="language"
            value={localConfig.language}
            onChange={handleLanguageChange}
            className="form-select"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Settings */}
        <div className="setting-group">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            value={localConfig.theme}
            onChange={handleThemeChange}
            className="form-select"
          >
            {themes.map(theme => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dark Mode Toggle */}
        <div className="setting-group">
          <div className="toggle-group">
            <label htmlFor="darkMode">Dark Mode</label>
            <div className="toggle-switch">
              <input
                type="checkbox"
                id="darkMode"
                checked={localConfig.darkMode}
                onChange={handleDarkModeToggle}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
            </div>
          </div>
        </div>

        {showAdvancedSettings && (
          <>
            {/* Timezone Settings */}
            <div className="setting-group">
              <label htmlFor="timezone">Timezone</label>
              <select
                id="timezone"
                value={localConfig.timezone}
                onChange={handleTimezoneChange}
                className="form-select"
              >
                {Intl.supportedValuesOf('timeZone').map(tz => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Format */}
            <div className="setting-group">
              <label htmlFor="dateFormat">Date Format</label>
              <select
                id="dateFormat"
                value={localConfig.dateFormat}
                onChange={handleDateFormatChange}
                className="form-select"
              >
                {dateFormats.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Number Format */}
            <div className="setting-group">
              <label htmlFor="numberFormat">Number Format</label>
              <select
                id="numberFormat"
                value={localConfig.numberFormat}
                onChange={handleNumberFormatChange}
                className="form-select"
              >
                {numberFormats.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Accessibility Settings */}
            <div className="setting-group">
              <h4>Accessibility</h4>
              <div className="accessibility-settings">
                <div className="accessibility-item">
                  <input
                    type="checkbox"
                    id="highContrast"
                    checked={localConfig.accessibility.highContrast || false}
                    onChange={() => handleAccessibilityToggle('highContrast')}
                  />
                  <label htmlFor="highContrast">High Contrast Mode</label>
                </div>
                <div className="accessibility-item">
                  <input
                    type="checkbox"
                    id="reducedMotion"
                    checked={localConfig.accessibility.reducedMotion || false}
                    onChange={() => handleAccessibilityToggle('reducedMotion')}
                  />
                  <label htmlFor="reducedMotion">Reduced Motion</label>
                </div>
                <div className="accessibility-item">
                  <input
                    type="checkbox"
                    id="largeText"
                    checked={localConfig.accessibility.largeText || false}
                    onChange={() => handleAccessibilityToggle('largeText')}
                  />
                  <label htmlFor="largeText">Large Text Size</label>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="setting-actions">
          <button 
            onClick={saveGlobalConfig}
            className="btn btn-primary"
          >
            Save Settings
          </button>
          <button 
            onClick={resetToDefaults}
            className="btn btn-secondary"
          >
            Reset to Defaults
          </button>
          {!showAdvancedSettings && (
            <button 
              onClick={() => window.location.href = '/settings/advanced'}
              className="btn btn-outline"
            >
              Advanced Settings
            </button>
          )}
        </div>
      </div>

      {/* Current Settings Display */}
      <div className="current-settings">
        <h4>Current Configuration</h4>
        <div className="settings-grid">
          <div className="setting-item">
            <span className="setting-label">Language:</span>
            <span className="setting-value">{localConfig.language}</span>
          </div>
          <div className="setting-item">
            <span className="setting-label">Theme:</span>
            <span className="setting-value">{localConfig.theme}</span>
          </div>
          <div className="setting-item">
            <span className="setting-label">Dark Mode:</span>
            <span className="setting-value">{localConfig.darkMode ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className="setting-item">
            <span className="setting-label">Timezone:</span>
            <span className="setting-value">{localConfig.timezone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalComponent;