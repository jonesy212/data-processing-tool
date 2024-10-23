import { action, makeAutoObservable } from 'mobx';

import { ParticipantData } from '@/app/pages/management/ParticipantManagementPage';
import { useDispatch } from 'react-redux';
import { ToolbarActions } from '../../actions/ToolbarActions';
import { Theme } from '../../libraries/ui/theme/Theme';
import { User } from '../../users/User';
import featureStore from '../featureStateManagement';
import { AlignmentOptions, ToolbarState } from '../redux/slices/toolbarSlice';
const dispatch = useDispatch();

export class ToolbarStore {
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
      // Add more actions here as needed
    });
  }

  // Methods to interact with toolbar state

  toggleFeature = (userId: User, feature: string, isEnabled: boolean) => {
    // Example logic to toggle a feature
    // Replace with your actual implementation
    if (isEnabled) {
      console.log(`Enabling feature ${feature} for user ${userId}`);
      // Dispatch action to update state if using Redux toolkit
      dispatch(ToolbarActions.enableFeature(feature));
      this.state.isFeatureEnabled = true; // Example update to state
    } else {
      console.log(`Disabling feature ${feature} for user ${userId}`);
      // Dispatch action to update state if using Redux toolkit
      // dispatch(ToolbarActions.disableFeature(feature));
      this.state.isFeatureEnabled = false; // Example update to state
    }
  };

  enableFeature = (feature: string) => {
    // Example logic to enable a feature
    // Replace with your actual implementation
    console.log(`Enabling feature: ${feature}`);
    // Dispatch action to update state if using Redux toolkit
    // dispatch(ToolbarActions.enableFeature(feature));
    this.state.isFeatureEnabled = true; // Example update to state
  };

  disableFeature = (feature: string) => {
    // Example logic to disable a feature
    // Replace with your actual implementation
    console.log(`Disabling feature: ${feature}`);
    // Dispatch action to update state if using Redux toolkit
    // dispatch(ToolbarActions.disableFeature(feature));
    this.state.isFeatureEnabled = false; // Example update to state
  };

  showToolbar = () => {
    // Example logic to show the toolbar
    // Replace with your actual implementation
    console.log('Showing toolbar');
    // Dispatch action to update state if using Redux toolkit
    // dispatch(ToolbarActions.showToolbar());
    this.state.isToolbarOpen = true; // Example update to state
  };

  hideToolbar = () => {
    // Example logic to hide the toolbar
    // Replace with your actual implementation
    console.log('Hiding toolbar');
    // Dispatch action to update state if using Redux toolkit
    // dispatch(ToolbarActions.hideToolbar());
    this.state.isToolbarOpen = false; // Example update to state
  };

  resetToolbarState = () => {
    // Example logic to reset toolbar state
    // Replace with your actual implementation
    console.log('Resetting toolbar state');
    // Dispatch action to update state if using Redux toolkit
    // dispatch(ToolbarActions.resetToolbarState());
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
    };
  };

  setToolbarSize = (size: number) => {
    // Example logic to set toolbar size
    // Replace with your actual implementation
    console.log(`Setting toolbar size to ${size}`);
    // Dispatch action to update state if using Redux toolkit
    dispatch(ToolbarActions.setToolbarSize(size));
    this.state.fontSize = size; // Example update to state
  };
    
    
  addFeature = (name: string, description: string) => {
    featureStore.addFeature(name, description);
  };

  // Example method to remove feature from FeatureStore
  removeFeature = (featureId: string) => {
    featureStore.removeFeature(featureId);
  };

  // Example method to set current feature in FeatureStore
  setCurrentFeature = (featureId: string) => {
    featureStore.setCurrentFeature(featureId);
  };


  setPosition = (x: number, y: number) => {
    // Example logic to set toolbar position
    // Replace with your actual implementation
    console.log(`Setting toolbar position to (${x}, ${y})`);
    // Dispatch action to update state if using Redux toolkit
    dispatch(ToolbarActions.setPosition({ x, y }));
    // Example update to state
      // Modify state or perform other actions as needed
      this.state.x = x;
      this.state.y = y;
      this.state.isDraggable = true;
      this.state.isFloating = true;
      
  };

  setTheme = (theme: Theme) => {
    // Example logic to set toolbar theme
    // Replace with your actual implementation
    console.log(`Setting toolbar theme: ${theme}`);
    // Dispatch action to update state if using Redux toolkit
    dispatch(ToolbarActions.setTheme({ theme }));
    // Example update to state
      // Modify state or perform other actions as needed
      this.state.theme = theme;
      
  };

  customizeToolbar = (backgroundColor: string, textColor: string) => {
    // Example logic to customize toolbar appearance
    // Replace with your actual implementation
    console.log(`Customizing toolbar: background=${backgroundColor}, text=${textColor}`);
    // Dispatch action to update state if using Redux toolkit
    // dispatch(ToolbarActions.customizeToolbar({ backgroundColor, textColor }));
    // Example update to state
    // Modify state or perform other actions as needed
  };

  setLanguage = (language: string) => {
    // Example logic to set toolbar language
    // Replace with your actual implementation
    console.log(`Setting toolbar language: ${language}`);
    // Dispatch action to update state if using Redux toolkit
    // dispatch(ToolbarActions.setLanguage(language));
    // Example update to state
    // Modify state or perform other actions as needed
  };

  setUserPreferences = (preferences: Record<string, any>) => {
    // Example logic to set user preferences
    // Replace with your actual implementation
    console.log(`Setting user preferences: ${JSON.stringify(preferences)}`);
    // Dispatch action to update state if using Redux toolkit
    // dispatch(ToolbarActions.setUserPreferences({ preferences }));
    // Example update to state
    // Modify state or perform other actions as needed
  };

  fetchParticipantData = (userId: User, participantData: ParticipantData[]) => {
    // Example logic to fetch participant data
    // Replace with your actual implementation
    console.log(`Fetching participant data for user ${userId}: ${JSON.stringify(participantData)}`);
    // Dispatch action to update state if using Redux toolkit
    // dispatch(ToolbarActions.fetchParticipantData({ userId, participantData }));
    // Example update to state
    // Modify state or perform other actions as needed
  };

  showParticipantManagementModal = (show: boolean) => {
    // Example logic to show/hide participant management modal
    // Replace with your actual implementation
    console.log(`Showing participant management modal: ${show}`);
    // Dispatch action to update state if using Redux toolkit
    // dispatch(ToolbarActions.showParticipantManagementModal(show));
    // Example update to state
    // Modify state or perform other actions as needed
  };

  addParticipant = (userId: User, participant: ParticipantData) => {
    // Example logic to add a participant
    // Replace with your actual implementation
    console.log(`Adding participant for user ${userId}: ${JSON.stringify(participant)}`);
    // Dispatch action to update state if using Redux toolkit
    // dispatch(ToolbarActions.addParticipant({ userId, participant }));
    // Example update to state
    // Modify state or perform other actions as needed
  };

  removeParticipant = (userId: User, participantId: string) => {
    // Example logic to remove a participant
    // Replace with your actual implementation
    console.log(`Removing participant ${participantId} for user ${userId}`);
    // Dispatch action to update state if using Redux toolkit
    dispatch(ToolbarActions.removeParticipant({ userId, participantId }));
    // Example update to state
    // Modify state or perform other actions as needed
  };
    
    

  changeToolbarBackgroundColor = (color: string) => {
    setToolbarBackgroundColor(color);
    // Additional logic specific to toolbar
  };

  changeToolbarFontColor = (color: string) => {
    setToolbarFontColor(color);
    // Additional logic specific to toolbar
  };

  // Additional methods can be added as per your application's requirements
}

export const useToolbarStore = () => new ToolbarStore();
export type { ToolbarState }; // Exporting ToolbarState if needed
