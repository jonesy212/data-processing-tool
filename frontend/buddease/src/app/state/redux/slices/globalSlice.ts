// store/slices/globalSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface GlobalConfig {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  darkMode: boolean;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  accessibility: {
    highContrast?: boolean;
    reducedMotion?: boolean;
    largeText?: boolean;
    screenReader?: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    sound: boolean;
  };
  performance: {
    cacheEnabled: boolean;
    lazyLoad: boolean;
    prefetch: boolean;
    optimizationLevel: 'low' | 'medium' | 'high';
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number; // minutes
    autoLogout: boolean;
  };
}

export interface UserPreferences {
  favoriteModules: string[];
  recentViews: string[];
  collapsedSidebar: boolean;
  density: 'compact' | 'comfortable' | 'spacious';
  layout: 'grid' | 'list' | 'detailed';
}

export interface SystemStatus {
  lastUpdate: Date;
  uptime: number; // seconds
  memoryUsage: number; // percentage
  cpuUsage: number; // percentage
  networkStatus: 'online' | 'offline' | 'slow';
}

export interface GlobalState {
  config: GlobalConfig;
  preferences: UserPreferences;
  status: SystemStatus;
  isLoading: boolean;
  error: string | null;
  lastSaved: Date | null;
  version: string;
  environment: 'development' | 'staging' | 'production';
  debugMode: boolean;
  featureFlags: Record<string, boolean>;
}

// Initial state
const getDefaultConfig = (): GlobalConfig => {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  return {
    language: 'en',
    theme: 'auto',
    darkMode: false,
    timezone: userTimezone,
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US',
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      screenReader: false
    },
    notifications: {
      email: true,
      push: true,
      inApp: true,
      sound: false
    },
    performance: {
      cacheEnabled: true,
      lazyLoad: true,
      prefetch: true,
      optimizationLevel: 'medium'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      autoLogout: true
    }
  };
};

const getDefaultPreferences = (): UserPreferences => ({
  favoriteModules: ['dashboard', 'analytics', 'users'],
  recentViews: [],
  collapsedSidebar: false,
  density: 'comfortable',
  layout: 'grid'
});

const getDefaultStatus = (): SystemStatus => ({
  lastUpdate: new Date(),
  uptime: 0,
  memoryUsage: 0,
  cpuUsage: 0,
  networkStatus: 'online'
});

const initialState: GlobalState = {
  config: getDefaultConfig(),
  preferences: getDefaultPreferences(),
  status: getDefaultStatus(),
  isLoading: false,
  error: null,
  lastSaved: null,
  version: '1.0.0',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  debugMode: process.env.NODE_ENV !== 'production',
  featureFlags: {
    experimentalUI: false,
    betaFeatures: false,
    darkModeV2: false,
    realtimeUpdates: true,
    offlineMode: true
  }
};

// Helper functions
const saveToLocalStorage = (state: GlobalState) => {
  if (typeof window !== 'undefined') {
    try {
      const serializedState = JSON.stringify({
        config: state.config,
        preferences: state.preferences,
        version: state.version
      });
      localStorage.setItem('globalState', serializedState);
    } catch (error) {
      console.warn('Failed to save global state to localStorage:', error);
    }
  }
};

const loadFromLocalStorage = (): Partial<GlobalState> => {
  if (typeof window !== 'undefined') {
    try {
      const serializedState = localStorage.getItem('globalState');
      if (serializedState) {
        const parsed = JSON.parse(serializedState);
        // Only load if version matches
        if (parsed.version === initialState.version) {
          return {
            config: { ...getDefaultConfig(), ...parsed.config },
            preferences: { ...getDefaultPreferences(), ...parsed.preferences }
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load global state from localStorage:', error);
    }
  }
  return {};
};

// Apply saved state
const savedState = loadFromLocalStorage();
initialState.config = { ...initialState.config, ...savedState.config };
initialState.preferences = { ...initialState.preferences, ...savedState.preferences };

// Create slice
const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    // Core configuration actions
    setLanguage: (state, action: PayloadAction<string>) => {
      state.config.language = action.payload;
      state.lastSaved = new Date();
    },
    
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.config.theme = action.payload;
      state.lastSaved = new Date();
    },
    
    toggleDarkMode: (state) => {
      state.config.darkMode = !state.config.darkMode;
      state.lastSaved = new Date();
    },
    
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.config.darkMode = action.payload;
      state.lastSaved = new Date();
    },
    
    setTimezone: (state, action: PayloadAction<string>) => {
      state.config.timezone = action.payload;
      state.lastSaved = new Date();
    },
    
    setDateFormat: (state, action: PayloadAction<string>) => {
      state.config.dateFormat = action.payload;
      state.lastSaved = new Date();
    },
    
    setNumberFormat: (state, action: PayloadAction<string>) => {
      state.config.numberFormat = action.payload;
      state.lastSaved = new Date();
    },
    
    // Accessibility actions
    toggleHighContrast: (state) => {
      state.config.accessibility.highContrast = !state.config.accessibility.highContrast;
      state.lastSaved = new Date();
    },
    
    toggleReducedMotion: (state) => {
      state.config.accessibility.reducedMotion = !state.config.accessibility.reducedMotion;
      state.lastSaved = new Date();
    },
    
    toggleLargeText: (state) => {
      state.config.accessibility.largeText = !state.config.accessibility.largeText;
      state.lastSaved = new Date();
    },
    
    updateAccessibility: (state, action: PayloadAction<Partial<GlobalConfig['accessibility']>>) => {
      state.config.accessibility = { ...state.config.accessibility, ...action.payload };
      state.lastSaved = new Date();
    },
    
    // Notification actions
    updateNotificationSettings: (state, action: PayloadAction<Partial<GlobalConfig['notifications']>>) => {
      state.config.notifications = { ...state.config.notifications, ...action.payload };
      state.lastSaved = new Date();
    },
    
    // Performance actions
    updatePerformanceSettings: (state, action: PayloadAction<Partial<GlobalConfig['performance']>>) => {
      state.config.performance = { ...state.config.performance, ...action.payload };
      state.lastSaved = new Date();
    },
    
    // Security actions
    updateSecuritySettings: (state, action: PayloadAction<Partial<GlobalConfig['security']>>) => {
      state.config.security = { ...state.config.security, ...action.payload };
      state.lastSaved = new Date();
    },
    
    // User preferences actions
    toggleFavoriteModule: (state, action: PayloadAction<string>) => {
      const module = action.payload;
      const index = state.preferences.favoriteModules.indexOf(module);
      
      if (index === -1) {
        state.preferences.favoriteModules.push(module);
      } else {
        state.preferences.favoriteModules.splice(index, 1);
      }
      state.lastSaved = new Date();
    },
    
    addRecentView: (state, action: PayloadAction<string>) => {
      const view = action.payload;
      const index = state.preferences.recentViews.indexOf(view);
      
      // Remove if already exists
      if (index !== -1) {
        state.preferences.recentViews.splice(index, 1);
      }
      
      // Add to beginning
      state.preferences.recentViews.unshift(view);
      
      // Keep only last 10
      if (state.preferences.recentViews.length > 10) {
        state.preferences.recentViews.pop();
      }
      
      state.lastSaved = new Date();
    },
    
    toggleSidebar: (state) => {
      state.preferences.collapsedSidebar = !state.preferences.collapsedSidebar;
      state.lastSaved = new Date();
    },
    
    setDensity: (state, action: PayloadAction<'compact' | 'comfortable' | 'spacious'>) => {
      state.preferences.density = action.payload;
      state.lastSaved = new Date();
    },
    
    setLayout: (state, action: PayloadAction<'grid' | 'list' | 'detailed'>) => {
      state.preferences.layout = action.payload;
      state.lastSaved = new Date();
    },
    
    // System status actions
    updateSystemStatus: (state, action: PayloadAction<Partial<SystemStatus>>) => {
      state.status = { ...state.status, ...action.payload };
    },
    
    setNetworkStatus: (state, action: PayloadAction<'online' | 'offline' | 'slow'>) => {
      state.status.networkStatus = action.payload;
    },
    
    // Global state management
    setGlobalConfig: (state, action: PayloadAction<Partial<GlobalConfig>>) => {
      state.config = { ...state.config, ...action.payload };
      state.lastSaved = new Date();
    },
    
    updateGlobalState: (state, action: PayloadAction<Partial<GlobalState>>) => {
      Object.assign(state, action.payload);
      state.lastSaved = new Date();
    },
    
    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Feature flags
    toggleFeatureFlag: (state, action: PayloadAction<string>) => {
      const flag = action.payload;
      if (state.featureFlags.hasOwnProperty(flag)) {
        state.featureFlags[flag] = !state.featureFlags[flag];
        state.lastSaved = new Date();
      }
    },
    
    setFeatureFlag: (state, action: PayloadAction<{ flag: string; value: boolean }>) => {
      const { flag, value } = action.payload;
      if (state.featureFlags.hasOwnProperty(flag)) {
        state.featureFlags[flag] = value;
        state.lastSaved = new Date();
      }
    },
    
    // Debug mode
    toggleDebugMode: (state) => {
      state.debugMode = !state.debugMode;
      state.lastSaved = new Date();
    },
    
    // Reset actions
    resetConfig: (state) => {
      state.config = getDefaultConfig();
      state.lastSaved = new Date();
    },
    
    resetPreferences: (state) => {
      state.preferences = getDefaultPreferences();
      state.lastSaved = new Date();
    },
    
    resetAll: (state) => {
      state.config = getDefaultConfig();
      state.preferences = getDefaultPreferences();
      state.status = getDefaultStatus();
      state.error = null;
      state.lastSaved = new Date();
    },
    
    // Save action
    saveState: (state) => {
      saveToLocalStorage(state);
      state.lastSaved = new Date();
    }
  },
  
  // Extra reducers for async actions or other slice interactions
  extraReducers: (builder) => {
    // Example: Handle actions from other slices
    builder
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state) => {
          state.isLoading = false;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action: any) => {
          state.isLoading = false;
          state.error = action.error?.message || 'An error occurred';
        }
      );
  }
});

// Thunks for async operations
export const initializeGlobalState = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    
    // Load from API if needed
    const response = await fetch('/api/global/config');
    const data = await response.json();
    
    if (data.success) {
      dispatch(setGlobalConfig(data.config));
    }
    
    // Update system status
    const statusResponse = await fetch('/api/system/status');
    const statusData = await statusResponse.json();
    
    dispatch(updateSystemStatus(statusData));
    
    dispatch(setLoading(false));
  } catch (error: any) {
    dispatch(setError(error.message));
    dispatch(setLoading(false));
  }
};

export const syncGlobalState = () => async (dispatch: any, getState: any) => {
  try {
    const state = getState().global;
    
    const response = await fetch('/api/global/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: state.config,
        preferences: state.preferences
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      dispatch(saveState());
      return data;
    } else {
      throw new Error(data.error || 'Sync failed');
    }
  } catch (error: any) {
    dispatch(setError(error.message));
    throw error;
  }
};

export const checkForUpdates = () => async (dispatch: any) => {
  try {
    const response = await fetch('/api/system/check-updates');
    const data = await response.json();
    
    if (data.updateAvailable) {
      // Handle update available
      console.log('Update available:', data);
    }
    
    return data;
  } catch (error) {
    console.error('Failed to check for updates:', error);
  }
};

// Selectors
export const selectGlobalConfig = (state: { global: GlobalState }) => state.global.config;
export const selectLanguage = (state: { global: GlobalState }) => state.global.config.language;
export const selectTheme = (state: { global: GlobalState }) => state.global.config.theme;
export const selectDarkMode = (state: { global: GlobalState }) => state.global.config.darkMode;
export const selectTimezone = (state: { global: GlobalState }) => state.global.config.timezone;
export const selectAccessibility = (state: { global: GlobalState }) => state.global.config.accessibility;
export const selectNotifications = (state: { global: GlobalState }) => state.global.config.notifications;
export const selectPerformance = (state: { global: GlobalState }) => state.global.config.performance;
export const selectSecurity = (state: { global: GlobalState }) => state.global.config.security;

export const selectUserPreferences = (state: { global: GlobalState }) => state.global.preferences;
export const selectFavoriteModules = (state: { global: GlobalState }) => state.global.preferences.favoriteModules;
export const selectRecentViews = (state: { global: GlobalState }) => state.global.preferences.recentViews;
export const selectSidebarCollapsed = (state: { global: GlobalState }) => state.global.preferences.collapsedSidebar;
export const selectDensity = (state: { global: GlobalState }) => state.global.preferences.density;
export const selectLayout = (state: { global: GlobalState }) => state.global.preferences.layout;

export const selectSystemStatus = (state: { global: GlobalState }) => state.global.status;
export const selectNetworkStatus = (state: { global: GlobalState }) => state.global.status.networkStatus;

export const selectIsLoading = (state: { global: GlobalState }) => state.global.isLoading;
export const selectError = (state: { global: GlobalState }) => state.global.error;
export const selectLastSaved = (state: { global: GlobalState }) => state.global.lastSaved;
export const selectVersion = (state: { global: GlobalState }) => state.global.version;
export const selectEnvironment = (state: { global: GlobalState }) => state.global.environment;
export const selectDebugMode = (state: { global: GlobalState }) => state.global.debugMode;
export const selectFeatureFlags = (state: { global: GlobalState }) => state.global.featureFlags;

// Export actions and reducer
export const {
  setLanguage,
  setTheme,
  toggleDarkMode,
  setDarkMode,
  setTimezone,
  setDateFormat,
  setNumberFormat,
  toggleHighContrast,
  toggleReducedMotion,
  toggleLargeText,
  updateAccessibility,
  updateNotificationSettings,
  updatePerformanceSettings,
  updateSecuritySettings,
  toggleFavoriteModule,
  addRecentView,
  toggleSidebar,
  setDensity,
  setLayout,
  updateSystemStatus,
  setNetworkStatus,
  setGlobalConfig,
  updateGlobalState,
  setLoading,
  setError,
  toggleFeatureFlag,
  setFeatureFlag,
  toggleDebugMode,
  resetConfig,
  resetPreferences,
  resetAll,
  saveState
} = globalSlice.actions;

export default globalSlice.reducer;