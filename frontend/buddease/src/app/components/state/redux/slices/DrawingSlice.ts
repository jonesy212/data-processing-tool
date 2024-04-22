// DrawingSlice.ts
import { useDrag } from "@/app/libraries/animations/DraggableAnimation/useDrag";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./RootSlice";
import { RefObject, useEffect, useRef } from "react";
import { useMovementAnimations } from "@/app/components/libraries/animations/movementAnimations/MovementAnimationActions";
import { Tracker } from "@/app/components/models/tracker/Tracker";
import { useDispatch } from "react-redux";
import { saveDrawingToDatabase } from "@/app/api/ApiDrawing";
import { autosaveDrawing } from "@/app/components/documents/editing/autosaveDrawing";
import { resetMilestones, resetTrackers } from "./TrackerSlice";
import { WritableDraft } from "../ReducerGenerator";
import { DrawingActions } from "../../../actions/DrawingActions";
import FileApiService, { fileApiService } from "@/app/api/ApiFiles";
import { response } from "express";
// Define interface for drawing state
interface DrawingState {
  isDrawing: boolean;
  beginDrag: {
    x: number;
    y: number;
  } | null;
  drawingContent: Tracker[];
  // Define drawing-related state properties here
}

// Define initial state
const initialState: DrawingState = {
  isDrawing: false,
  beginDrag: null,
  drawingContent: [],
};

export const setIsDrawing = (isDrawing: boolean) => ({
  type: "SET_IS_DRAWING",
  payload: isDrawing,
});

// Define an async thunk action to handle autosaving
export const autosaveDrawingAsync = createAsyncThunk(
  "drawing/autosaveDrawing",
  async (drawingContent: any) => {
    // Perform autosaving logic here, e.g., calling an API
    const autosaveSuccess = await autosaveDrawing(drawingContent);
    return autosaveSuccess;
  }
);


let yourFile: File | null = null;


const updateUIAfterDrawingSessionEnd = async () => {
  dispatch(DrawingActions.resetDrawingState());
  dispatch(DrawingActions.resetMilestones());
  dispatch(DrawingActions.clearHistory());
  dispatch(DrawingActions.setCanvasBackground({ color: "white" }));
  dispatch(DrawingActions.activateTextTool());
  dispatch(DrawingActions.addGuide({ axis: "horizontal", position: 0 }));
  dispatch(
    DrawingActions.addLayerEffect({
      layerId: "exampleLayerId",
      effect: "exampleEffect",
    })
  );
  dispatch(DrawingActions.adjustCanvasResolution({ width: 800, height: 600 }));
  dispatch(
    DrawingActions.adjustStroke({
      shapeId: "exampleShapeId",
      options: {
        /* provide options */
      },
    })
  );
  dispatch(
    DrawingActions.applyBlendMode({
      layerId: "exampleLayerId",
      mode: "exampleMode",
    })
  );
  dispatch(DrawingActions.applyBrushTexture({ texture: "exampleTexture" }));
  dispatch(
    DrawingActions.applyCollaborativeEdits({
      fileId: "exampleFileId",
      edits: [],
    })
  );
  dispatch(
    DrawingActions.applyDrawingTemplate({ templateId: "exampleTemplateId" })
  );
  dispatch(DrawingActions.changeGridSize({ size: 10 }));
  dispatch(DrawingActions.clearCanvas());
  dispatch(DrawingActions.copySelection());

  dispatch(DrawingActions.flipShapeX({ shapeId: "yourShapeId" }));
  dispatch(DrawingActions.flipShapeY({ shapeId: "yourShapeId" }));
  dispatch(DrawingActions.selectAllShapes());
  dispatch(DrawingActions.cutSelection());
  dispatch(DrawingActions.deleteSelection());
  dispatch(DrawingActions.resizeCanvas({ width: 100, height: 100 }));
  dispatch(DrawingActions.toggleGridVisibility({ visible: true }));
  dispatch(DrawingActions.toggleGuides({ visible: true }));
  dispatch(DrawingActions.enableSnapToObjects({ enabled: true }));
  dispatch(DrawingActions.flattenDrawing());
  dispatch(DrawingActions.mergeAllLayers());
  dispatch(DrawingActions.undoHistoryAction());
  dispatch(DrawingActions.redoHistoryAction());
  dispatch(DrawingActions.clearHistory());
  const response = await dispatch(
    DrawingActions.exportDrawingAsFile({
      fileName: "example",
      format: "png",
    })
  );

  // Check if the Axios response is successful and contains the file data
  if (response && response.status === 200 && response.data) {
    // Extract file data from the response
    const fileData = response.data.data;

    // Create a new File object with the required properties
    const yourFile = new File([fileData], "filename.ext", {
      type: "application/octet-stream",
    }); // Replace 'filename.ext' with the actual filename and extension

    // Dispatch the action with the correct file object
    dispatch(DrawingActions.importDrawingFromFile({ file: yourFile }));
  }
};

// Create drawing slice
const dispatch = useDispatch();
export const useDrawingManagerSlice = createSlice({
  name: "drawing",
  initialState,
  reducers: {
    // Define reducers for drawing actions here
    // For example:

    startDrawing(
      state,
      action: PayloadAction<{ id: string; x: number; y: number }>
    ) {
      const { id, x, y } = action.payload;
      // Check if drawing is already in progress
      if (!state.isDrawing) {
        // Set drawing state to true
        state.isDrawing = true;

        // Add any additional logic required to initialize drawing
        const onDragStart = () => {
          state.beginDrag = {
            x: x,
            y: y,
          };
        };

        const onDragMove = (dragX: number, dragY: number) => {
          // Handle drag movement if needed
        };

        const onDragEnd = () => {
          // Handle drag end if needed
        };

        useEffect(() => {
          // Initialize useDrag hook
          const { beginDrag } = useDrag(
            id,
            "yourType", // Replace 'yourType' with the appropriate type
            onDragStart,
            onDragMove,
            onDragEnd
          );

          // Add event listeners for mouse/touch input
          document.addEventListener("mousedown", beginDrag);
          document.addEventListener("touchstart", beginDrag);

          // Clean up event listeners on unmount or when drawing ends
          return () => {
            document.removeEventListener("mousedown", beginDrag);
            document.removeEventListener("touchstart", beginDrag);
          };
        }, [id, onDragStart, onDragMove, onDragEnd]);
      }
    },

    stopDrawing(state) {
      // Check if drawing is in progress
      if (state.isDrawing) {
        // Set drawing state to false
        state.isDrawing = false;

        // Utilize useMovementAnimations hook to handle hiding animation
        const { hide } = useMovementAnimations();

        // Hide the drawing element with animation
        const target = useRef<RefObject<HTMLElement>>(null!);
        hide(target.current);

        // Dispatch actions to reset drawing-related state properties
        state.drawingContent = [];
        state.beginDrag = null;

        // Perform autosaving of the drawing content
        dispatch(autosaveDrawingAsync());
      }
    },

    resetDrawingState(state) {
      state.isDrawing = false;
      state.beginDrag = null;
      state.drawingContent = [];
    },

    // resetTrackers () {
    //   return (dispatch: any, getState: () => RootState) => {
    //     const trackers = selectTrackers(getState());
    //     // Reset trackers or perform any other necessary actions
    //     // Example:
    //     dispatch(createMilestoneForTrackers(trackers)); // Example: Create milestones for trackers
    //   };
    // },

    // resetMilestones() {
    //   return (dispatch: any, getState: () => RootState) => {
    //     const milestones = selectMilestones(getState());
    //     // Reset milestones or perform any other necessary actions
    //   };
    // },

    // createMilestoneForTrackers(trackers: Tracker[]){
    //   return (dispatch: any) => {
    //     // Logic to create milestones based on trackers
    //     // For example:
    //     trackers.forEach((tracker) => {
    //       const milestone: Milestone = {
    //         // Construct milestone object based on tracker data
    //       };
    //       dispatch(createMilestone(milestone));
    //     });
    //   };
    // },

    // Add more reducers as needed
  },
  extraReducers: (builder) => {
    // Add extra reducers to handle the result of autosaveDrawingAsync
    builder.addCase(autosaveDrawingAsync.fulfilled, (state, action) => {
      // Handle the fulfilled action, which contains the autosave success result
      const autosaveSuccess = action.payload;

      // Perform any necessary actions based on the autosave result
      if (autosaveSuccess) {
        updateUIAfterDrawingSessionEnd();
      }
    });
  },
});

// Export actions and reducer
export const {
  startDrawing,
  stopDrawing,
  clearDrawing,
  resetDrawingState,
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

// Create and export selectors for accessing drawing-related state properties
export const selectIsDrawing = (state: RootState) =>
  state.drawingManager.isDrawing;
export const selectBeginDrag = (state: RootState) =>
  state.drawingManager.beginDrag;
export const selectDrawingContent = (state: RootState) =>
  state.drawingManager.drawingContent;
