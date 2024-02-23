import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state for the toolbar
interface ToolbarState {
  isFeatureEnabled: boolean;
  isToolbarOpen: boolean;
  selectedTool: string | null;
  isDraggable: boolean;
  isFloating: boolean;
  order: number;
  fontSize: number;
  fontColor: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  leftToolbar: {
    isVisible: boolean;
    alignment: "left" | "center" | "right";
  };
  rightToolbar: {
    isVisible: boolean;
    alignment: "left" | "center" | "right";
  };
  videoRecordingEnabled: boolean;
  videoStreamingEnabled: boolean;
  qualitySettingsEnabled: boolean;
  screenSharingEnabled: boolean;
  participantManagementEnabled: boolean;
}

// Define an enum for alignment options
enum AlignmentOptions {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
}

const initialState: ToolbarState = {
  isFeatureEnabled: false,
  isToolbarOpen: false,
  selectedTool: null,
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
  },
  rightToolbar: {
    isVisible: true,
    alignment: AlignmentOptions.RIGHT,
  },
  videoRecordingEnabled: false,
  videoStreamingEnabled: false,
  qualitySettingsEnabled: false,
  screenSharingEnabled: false,
  participantManagementEnabled: false,
};

// Create the toolbar slice
export const useToolbarManagerSlice = createSlice({
  name: "toolbar",
  initialState,
  reducers: {
    closeToolbar(state) {
      state.isToolbarOpen = false;
    },
    decreaseFontSize(state) {
      if (state.fontSize > 1) {
        state.fontSize -= 1;
      }
    },
    changeFontColor(state, action: PayloadAction<string>) {
      state.fontColor = action.payload;
    },
    changeOrder(state, action: PayloadAction<number>) {
      state.order = action.payload;
    },
    deselectTool(state) {
      state.selectedTool = null;
    },
    increaseFontSize(state) {
      state.fontSize += 1;
    },
    openToolbar(state) {
      state.isToolbarOpen = true;
    },
    selectTool(state, action: PayloadAction<string>) {
      state.selectedTool = action.payload;
    },
    toggleBold(state) {
      state.isBold = !state.isBold;
    },
    toggleDraggable(state) {
      state.isDraggable = !state.isDraggable;
    },
    toggleFeature(state, action: PayloadAction<boolean>) {
      state.isFeatureEnabled = action.payload;
    },
    toggleFloating(state) {
      state.isFloating = !state.isFloating;
    },
    toggleItalic(state) {
      state.isItalic = !state.isItalic;
    },
    toggleUnderline(state) {
      state.isUnderline = !state.isUnderline;
    },
    setLeftToolbarAlignment(state, action: PayloadAction<AlignmentOptions>) {
      state.leftToolbar.alignment = action.payload;
    },
    setRightToolbarAlignment(state, action: PayloadAction<AlignmentOptions>) {
      state.rightToolbar.alignment = action.payload;
    },
    videoRecordingEnabled(state, action: PayloadAction<boolean>) {
      state.videoRecordingEnabled = action.payload;
    },
    qualitySettingsEnabled(state, action: PayloadAction<boolean>) {
      state.qualitySettingsEnabled = action.payload;
    },
    screenSharingEnabled(state, action: PayloadAction<boolean>) {
      state.screenSharingEnabled = action.payload;
    },
    participantManagementEnabled(state, action: PayloadAction<boolean>) {
      state.participantManagementEnabled = action.payload;
    },
  },
});

// Export actions and reducer from the slice
export const {
  closeToolbar,
  decreaseFontSize,
  changeFontColor,
  changeOrder,
  deselectTool,
  increaseFontSize,
  openToolbar,
  selectTool,
  toggleBold,
  toggleDraggable,
  toggleFeature,
  toggleFloating,
  toggleItalic,
  toggleUnderline,
  setLeftToolbarAlignment,
  setRightToolbarAlignment,
  videoRecordingEnabled,
  qualitySettingsEnabled,
  screenSharingEnabled,
  participantManagementEnabled,
} = useToolbarManagerSlice.actions;

export default useToolbarManagerSlice.reducer;
