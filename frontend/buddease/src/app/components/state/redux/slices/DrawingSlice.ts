// DrawingSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./RootSlice";
import { useDrag } from "@/app/libraries/animations/DraggableAnimation/useDrag";
import { id } from "ethers";

// Define interface for drawing state
interface DrawingState {
  isDrawing: boolean;
  beginDrag: {
    x: number, y: number
  } | null
  
  // Define drawing-related state properties here
}

// Define initial state
const initialState: DrawingState = {
  isDrawing: false,
  beginDrag: null,
  // Initialize drawing-related state properties here
};

export const setIsDrawing = (isDrawing: boolean) => ({
  type: 'SET_IS_DRAWING',
  payload: isDrawing,
});


// Create drawing slice
export const useDrawingManagerSlice = createSlice({
  name: "drawing",
  initialState,
  reducers: {
    // Define reducers for drawing actions here
    // For example:
    startDrawing(
      state,
      action: PayloadAction<{x: number, y: number}>
    ) {
      const { x, y } = action.payload;
      // Check if drawing is already in progress
      if (!state.isDrawing) {
        // Set drawing state to true
        state.isDrawing = true;
        // Add any additional logic required to initialize drawing
        const {  startDrawing } = useDrag(id, {
          onStart: (event) => {
            state.beginDrag = {
              x: event.clientX,
              y: event.clientY
            };
          }
        });
        document.addEventListener('mousedown', beginDrag);
        document.addEventListener('touchstart', beginDrag);
    
        // For example, you might want to set up event listeners for mouse/touch input
        // or initialize drawing canvas/context
      }
    },
    stopDrawing(state) {
      // Check if drawing is in progress
      if (state.isDrawing) {
        // Set drawing state to false
        state.isDrawing = false;
    
        // Remove event listeners to prevent memory leaks
        // For example, if you have registered event listeners for mouse/touch input,
        // remove them here to clean up resources
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('touchmove', this.handleTouchMove);
    
        // Clear/reset the drawing canvas to prepare for the next drawing session
        // This ensures that the canvas is clean and ready for new drawings
        const canvas = document.getElementById('drawing-canvas');
        const context = canvas?.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    
        // Perform any other necessary cleanup actions specific to your application
        // For example, you might want to save the current drawing to a database
        // or update the UI to reflect the end of the drawing session
      }
    },
    
    clearDrawing(state) {
      // Clear the drawing canvas to remove all drawn content
      const canvas = document.getElementById('drawing-canvas');
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    
      // Update any necessary state properties related to the drawing
      // For example, you might want to reset any variables tracking the drawing state
    
      // Perform any other necessary actions specific to your application
      // For instance, updating the UI to reflect the cleared canvas
    },
    
    // Add more reducers as needed
  },
});

// Export actions and reducer
export const { 

  startDrawing,
  stopDrawing,
  clearDrawing,
  activateTextTool,
  addGuide,
  addLayerEffect,
  adjustCanvasResolution,
  adjustStroke,
  applyBlendMode,
  applyBrushTexture,
  applyCollaborativeEdits,
  applyDrawingTemplate,
  changeGridSize,
  clearCanvas,
  clearHistory,
  copySelection,
  // Layer operations
  createLayer,
  // Clipboard Operations
  cutSelection,
  deleteSelection,
  deselectAllShapes,
  // Drawing operations
  drawShape,
  duplicateLayer,
  duplicateShape,
  enableBrushSmoothing,
  // Miscellaneous
  enableSnapToObjects,
  endCollaborativeDrawing,
  endCollaborativeEdit,
  eraseShape,
  // Additional drawing actions
  exportDrawing,
  // Export/Import Options
  exportDrawingAsFile,
  fillShape,
  flattenDrawing,
  // Transformations
  flipShapeX,
  flipShapeY,
  // Group operations
  groupLayers,
  hideLayer,
  importDrawing,
  importDrawingFromFile,
  invertSelection,
  lockLayer,
  // Layer Operations
  mergeAllLayers,
  mergeLayers,
  moveShape,
  panCanvas,
  pasteSelection,
  redoAction,
  redoHistoryAction,
  removeGuide,
  removeLayer,
  reorderLayer,
  // Canvas Operations
  resizeCanvas,
  resizeShape,
  rotateShape,
  saveDrawing,
  // Selection Operations
  selectAllShapes,
  selectColor,
  selectLayer,
  selectTool,
  setCanvasBackground,
  setLayerOpacity,
  setPressureSensitivity,
  shareDrawing,
  showLayer,
  snapToGrid,
  startCollaborativeDrawing,

  // Collaboration actions
  startCollaborativeEdit,
  toggleGridView,
  // Grid Operations
  toggleGridVisibility,
  // Guides and Rulers
  toggleGuides,
  undoAction,

  // History Operations
  undoHistoryAction,
  ungroupLayers,
  unlockLayer,
  viewDrawingHistory,
  zoomIn,
  zoomOut,
} = useDrawingManagerSlice.actions;


export default useDrawingManagerSlice.reducer;

// Selectors
export const selectDrawing = (state: RootState) => state.drawingManager;