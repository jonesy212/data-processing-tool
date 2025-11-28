// ToolbarStore.ts
import { action, makeAutoObservable } from 'mobx';

import { ToolbarActions } from '@/app/actions/ToolbarActions';
import { Theme } from '@/app/libraries/ui/theme/Theme';
import { User } from '@/app/users/User';
import { ParticipantData } from '@/app/pages/management/ParticipantManagementPage';
import featureStore from '@/app/state/featureStateManagement';
import { AlignmentOptions, ToolbarState } from '@/app/state/redux/slices/toolbarSlice';

export class ToolbarStore {
  theme: Theme;
  state: ToolbarState = {
    isFeatureEnabled: false,
    isToolbarOpen: false,
    selectedTool: null,
    selectedToolBar: null,
    isDraggable: false,
    isFloating: false,
    order: 0,
    fontSize: 14,
    fontColor: "#000000",
    themeType: '',
    isBold: false,
    isItalic: false,
    isUnderline: false,
    // ADD THESE PROPERTIES:
    toolbarBackgroundColor: "#ffffff", // default toolbar background
    toolbarFontColor: "#000000", // default toolbar font color
    leftToolbar: {
      isVisible: true,
      alignment: AlignmentOptions.LEFT,
      selectedLeftToolbar: AlignmentOptions.NULL,
    },
    rightToolbar: {
      isVisible: true,
      alignment: AlignmentOptions.RIGHT,
      selectedRightToolbar: AlignmentOptions.NULL,
    },
    videoRecordingEnabled: false,
    videoStreamingEnabled: false,
    qualitySettingsEnabled: false,
    screenSharingEnabled: false,
    participantManagementEnabled: false,
    selectedToolbar: null,
    toolbars: [],
    x: 0,
    y: 0,
  };

  constructor() {
    makeAutoObservable(this, {
      // Define actions as observable actions
      toggleFeature: action,
      enableFeature: action,
      disableFeature: action,
      showToolbar: action,
      hideToolbar: action,
      resetToolbarState: action,
      setToolbarSize: action,
      addFeature: action,
      removeFeature: action,
      setPosition: action,
      setTheme: action,
      customizeToolbar: action,
      setLanguage: action,
      setUserPreferences: action,
      fetchParticipantData: action,
      showParticipantManagementModal: action,
      addParticipant: action,
      removeParticipant: action,
      // ADD THESE ACTIONS:
      setToolbarBackgroundColor: action,
      setToolbarFontColor: action,
      changeToolbarBackgroundColor: action,
      changeToolbarFontColor: action,
    });
  }

  // Methods to interact with toolbar state

  toggleFeature = (userId: User, feature: string, isEnabled: boolean) => {
    if (isEnabled) {
      console.log(`Enabling feature ${feature} for user ${userId}`);
      this.state.isFeatureEnabled = true;
    } else {
      console.log(`Disabling feature ${feature} for user ${userId}`);
      this.state.isFeatureEnabled = false;
    }
  };

  enableFeature = (feature: string) => {
    console.log(`Enabling feature: ${feature}`);
    this.state.isFeatureEnabled = true;
  };

  disableFeature = (feature: string) => {
    console.log(`Disabling feature: ${feature}`);
    this.state.isFeatureEnabled = false;
  };

  showToolbar = () => {
    console.log('Showing toolbar');
    this.state.isToolbarOpen = true;
  };

  hideToolbar = () => {
    console.log('Hiding toolbar');
    this.state.isToolbarOpen = false;
  };

  resetToolbarState = () => {
    console.log('Resetting toolbar state');
    this.state = {
      ...this.state,
      isFeatureEnabled: false,
      isToolbarOpen: false,
      selectedTool: null,
      selectedToolBar: null,
      isDraggable: false,
      isFloating: false,
      order: 0,
      fontSize: 14,
      fontColor: "#000000",
      toolbarBackgroundColor: "#ffffff",
      toolbarFontColor: "#000000",
      isBold: false,
      isItalic: false,
      isUnderline: false,
      leftToolbar: {
        isVisible: true,
        alignment: AlignmentOptions.LEFT,
        selectedLeftToolbar: AlignmentOptions.NULL,
      },
      rightToolbar: {
        isVisible: true,
        alignment: AlignmentOptions.RIGHT,
        selectedRightToolbar: AlignmentOptions.NULL,
      },
      videoRecordingEnabled: false,
      videoStreamingEnabled: false,
      qualitySettingsEnabled: false,
      screenSharingEnabled: false,
      participantManagementEnabled: false,
      selectedToolbar: null,
      toolbars: [],
      x: 0,
      y: 0,
    };
  };

  setToolbarSize = (size: number) => {
    console.log(`Setting toolbar size to ${size}`);
    this.state.fontSize = size;
  };
    
  addFeature = (name: string, description: string) => {
    featureStore.addFeature(name, description);
  };

  removeFeature = (featureId: string) => {
    featureStore.removeFeature(featureId);
  };

  setCurrentFeature = (featureId: string) => {
    featureStore.setCurrentFeature(featureId);
  };

  setPosition = (x: number, y: number) => {
    console.log(`Setting toolbar position to (${x}, ${y})`);
    this.state.x = x;
    this.state.y = y;
    this.state.isDraggable = true;
    this.state.isFloating = true;
  };

  setTheme = (theme: Theme) => {
    console.log(`Setting toolbar theme: ${theme}`);
    this.theme = theme;
  };

  customizeToolbar = (backgroundColor: string, textColor: string) => {
    console.log(`Customizing toolbar: background=${backgroundColor}, text=${textColor}`);
    this.state.toolbarBackgroundColor = backgroundColor;
    this.state.toolbarFontColor = textColor;
  };

  setLanguage = (language: string) => {
    console.log(`Setting toolbar language: ${language}`);
  };

  setUserPreferences = (preferences: Record<string, any>) => {
    console.log(`Setting user preferences: ${JSON.stringify(preferences)}`);
  };

  fetchParticipantData = (userId: User, participantData: ParticipantData[]) => {
    console.log(`Fetching participant data for user ${userId}: ${JSON.stringify(participantData)}`);
  };

  showParticipantManagementModal = (show: boolean) => {
    console.log(`Showing participant management modal: ${show}`);
  };

  addParticipant = (userId: User, participant: ParticipantData) => {
    console.log(`Adding participant for user ${userId}: ${JSON.stringify(participant)}`);
  };

  removeParticipant = (userId: User, participantId: string) => {
    console.log(`Removing participant ${participantId} for user ${userId}`);
  };

  // NEW METHODS FOR TOOLBAR COLORS:
  setToolbarBackgroundColor = (color: string) => {
    console.log(`Setting toolbar background color to: ${color}`);
    this.state.toolbarBackgroundColor = color;
  };

  setToolbarFontColor = (color: string) => {
    console.log(`Setting toolbar font color to: ${color}`);
    this.state.toolbarFontColor = color;
  };

  changeToolbarBackgroundColor = (color: string) => {
    console.log(`Changing toolbar background color to: ${color}`);
    this.state.toolbarBackgroundColor = color;
    
    // Additional logic specific to toolbar
    if (color === '#ffffff') {
      console.log("Toolbar background set to white");
    }
    
    // You can add validation, analytics, etc. here
  };

  changeToolbarFontColor = (color: string) => {
    console.log(`Changing toolbar font color to: ${color}`);
    this.state.toolbarFontColor = color;
    
    // Additional logic specific to toolbar
    const backgroundColor = this.state.toolbarBackgroundColor;
    console.log(`Current toolbar background: ${backgroundColor}`);
    
    // You can add contrast validation here
    if (!this.isAccessibleContrast(color, backgroundColor)) {
      console.warn("Low contrast between toolbar text and background");
    }
  };

  // Helper method for contrast checking
  private isAccessibleContrast = (textColor: string, backgroundColor: string): boolean => {
    // Simple contrast check - implement proper contrast ratio calculation
    return textColor !== backgroundColor;
  };

  // Getter methods to access state
  get toolbarBackgroundColor() {
    return this.state.toolbarBackgroundColor;
  }

  get toolbarFontColor() {
    return this.state.toolbarFontColor;
  }

  get currentToolbarState() {
    return this.state;
  }
}

// Create a singleton instance
export const toolbarStore = new ToolbarStore();

// Hook for React components
export const useToolbarStore = () => toolbarStore;

export type { ToolbarState };