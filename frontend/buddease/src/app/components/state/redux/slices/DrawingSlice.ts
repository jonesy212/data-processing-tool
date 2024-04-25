// DrawingSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./RootSlice";
import { RefObject, useEffect, useRef } from "react";
import { useMovementAnimations } from "@/app/components/libraries/animations/movementAnimations/MovementAnimationActions";
import { Tracker } from "@/app/components/models/tracker/Tracker";
import { useDispatch } from "react-redux";
import { saveDrawingToDatabase } from "@/app/api/ApiDrawing";
import { autosaveDrawing } from "@/app/components/documents/editing/autosaveDrawing";
import {
  createMilestone,
  resetMilestones,
  resetTrackers,
} from "./TrackerSlice";
import { WritableDraft } from "../ReducerGenerator";
import { DrawingActions } from "../../../actions/DrawingActions";
import FileApiService, { fileApiService } from "@/app/api/ApiFiles";
import { response } from "express";
// Define interface for drawing state
import { DragSourceHookSpec, DragSourceMonitor } from "react-dnd";
import {
  saveAppTreeToLocalStorage,
  saveToLocalStorage,
} from "@/app/components/hooks/useLocalStorage";
import { useDrag } from "@/app/libraries/animations/DraggableAnimation/useDrag";
import { saveAs } from "@/app/components/documents/editing/autosave";
import Milestone from "@/app/components/calendar/CalendarSlice";
import * as drawingApi from "@/app/api/ApiDrawing";
import useText from "@/app/libraries/animations/DraggableAnimation/useText";
import TextType from "@/app/components/documents/TextType";
// Define interface for drawing state
interface DrawingState {
  id: string;
  selectedDrawingId: number | null;
  isDrawing: boolean;
  beginDrag: {
    x: number;
    y: number;
  } | null;
  drawingContent: Tracker[];
  activeTool: string | null;
  beginText: {
    x: number;
    y: number;
  } | null;

  selectedTextId: string | null;
  dragEndPosition: {
    x: number;
    y: number;
  } | null;
  dragX: string;
  onDragEnd: (x: string, y: string) => void;
  initialDragXValue: number;
  initialDragYValue: number;
  isDragging: boolean;
  dragData: CustomDragObject | null;
  position: {
    x: number;
    y: number;
  };
  trackers: Tracker[];
  selectedTrackers: Tracker[];
  milestones: Milestone[];
  // Define drawing-related state properties here
}

// Define initial state
const initialState: DrawingState = {
  id: "",
  isDrawing: false,
  beginDrag: null,
  drawingContent: [],
  activeTool: null,
  beginText: null,
  onDragEnd: (x: string, y: string) => ({}),
  dragX: "",
  dragEndPosition: null,
  initialDragXValue: 0,
  initialDragYValue: 0,
  isDragging: false,
  dragData: null,
  position: {
    x: 0,
    y: 0,
  },
  selectedTextId: null,
  selectedDrawingId: null,
  trackers: [],
  selectedTrackers: [],
  milestones: []
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

export const exportDrawingAsFile = createAsyncThunk(
  "drawing/exportDrawingAsFile",
  async (drawingContent: any) => {
    // Perform file exporting logic here
    yourFile = new File([JSON.stringify(drawingContent)], "drawing.json", {
      type: "application/json",
    });
    if (yourFile) {
      return yourFile;
    } else {
      throw new Error("File creation failed");
    }
  }
);

let yourFile: File | null = null;

const updateUIAfterDrawingSessionEnd = async () => {
  dispatch(DrawingActions.resetDrawingState());
  dispatch(DrawingActions.resetMilestones());
  dispatch(DrawingActions.clearHistory());
  dispatch(DrawingActions.setCanvasBackground({ color: "white" }));
  dispatch(DrawingActions.activateTextTool({ id: "textToolId" }));
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
      status: 0,
      data: null,
    })
  );

  if (response && response.payload.status === 200 && response.payload.data) {
    // Extract file data from the response
    const fileData = response.payload.data;

    // Further processing of the file data as needed

    // For example, if you want to display the file data or save it locally:
    // Display the file data
    console.log("File data:", fileData);

    // Save the file data locally
    saveToLocalStorage("File data:", fileData);
    // Display a download prompt
    saveAs(fileData, "drawing.png");
  } else {
    // Handle the case when the response or file data is not available
    console.error("Error: Unable to retrieve file data from the response.");
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
          // Assuming you have a reference to the draggable element
          const draggableElement = document.getElementById(
            "yourDraggableElementId"
          );

          if (draggableElement) {
            // Calculate the new position based on the drag distance
            const newX = draggableElement.offsetLeft + dragX;
            const newY = draggableElement.offsetTop + dragY;

            // Update the position of the draggable element
            draggableElement.style.left = `${newX}px`;
            draggableElement.style.top = `${newY}px`;
          }
        };

        const onDragEnd = (finalX: number, finalY: number) => {
          const initialDragXValue = state.beginDrag?.x;
          const initialDragYValue = state.beginDrag?.y;

          // Ensure beginDrag is not undefined before proceeding
          if (state.beginDrag !== undefined) {
            // Reset beginDrag to null
            state.beginDrag = null;
          }
          if (
            initialDragXValue !== undefined &&
            initialDragYValue !== undefined
          ) {
            resetDragState(initialDragXValue, initialDragYValue);
            handleDragEndPosition(finalX, finalY);
            if (state.isDrawing) {
              state.dragEndPosition = {
                x: finalX,
                y: finalY,
              };

              resetDragState(initialDragXValue, initialDragYValue);
              handleDragEndPosition(finalX, finalY);
              dispatchDragEndEvent();
            } else {
              state.dragEndPosition = null;
            }
            dispatchDragEndEvent();
          }
        };

        // Example functions for cleanup, position handling, and event dispatching
        const resetDragState = (
          initialDragXValue: number,
          initialDragYValue: number
        ) => {
          // Reset any state variables related to dragging

          // Example: Resetting variables to their initial values
          setDragX(initialDragXValue);
          setDragY(initialDragYValue);
          setIsDragging(false);

          // Example: Clearing variables
          setDragData({});
        };

        const setDragX = (initialDragXValue: number) => {
          state.initialDragXValue = x;
        };

        const setDragY = (initialDragYValue: number) => {
          state.initialDragYValue = y;
        };

        const setIsDragging = (isDragging: boolean) => {
          state.isDragging = isDragging;
        };

        const setDragData = (data: object) => {
          state.dragData = data;
        };

        const updatePosition = (x: number, y: number) => {
          state.position = {
            x: x,
            y: y,
          };
        };

        const triggerActionBasedOnPosition = (
          finalX: number,
          finalY: number
        ) => {
          if (finalX > 100 && finalY > 100) {
            dispatch(
              DrawingActions.elementDroppedInSpecificArea({
                x: finalX,
                y: finalY,
                elementId: "",
                areaId: "",
              })
            );
          }
        };

        const handleDragEndPosition = (finalX: number, finalY: number) => {
          // Perform logic based on the final position of the dragged element
          console.log(
            "Final position of the dragged element - X:",
            finalX,
            "Y:",
            finalY
          );

          // Example: Check if the element is dropped in a specific area
          if (finalX > 100 && finalY > 100) {
            // Perform actions if dropped in a specific area
            console.log("Element dropped in a specific area.");
          } else {
            // Perform actions if dropped in other areas
            console.log("Element dropped in other areas.");
          }

          // Example: Update state or trigger further actions based on the final position
          updatePosition(finalX, finalY);
          triggerActionBasedOnPosition(finalX, finalY);
        };

        const dispatchDragEndEvent = () => {
          // Dispatch an event or notify other components about the drag end
          console.log("Dispatching drag end event or notifying components...");

          // Example: Dispatch a custom event
          const dragEndEvent = new CustomEvent("dragEnd", {
            detail: {
              message: "Drag operation has ended",
            },
          });
          window.dispatchEvent(dragEndEvent);

          // Example: Notify other components using a callback function
          // notifyComponentsAboutDragEnd();

          // Example: Use a state management library to notify components
          // dispatch({ type: 'DRAG_END', payload: { message: 'Drag operation has ended' } });
        };

        useEffect(() => {
          // Initialize useDrag hook
          const { beginDrag } = useDrag(
            id,
            "yourType", // Replace 'yourType' with the appropriate type
            onDragStart,
            onDragMove,
            onDragEnd,
            setDragX,
            setDragY
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

        // Dispatch autosaveDrawingAsync action without payload
        dispatch(DrawingActions.autosaveDrawingAsync());
      }
    },

    clearDrawing(state) {
      state.drawingContent = [];
      state.isDrawing = false;
      state.beginDrag = null;
    },

    resetDrawingState(state) {
      state.isDrawing = false;
      state.beginDrag = null;
      state.drawingContent = [];
    },

    // other reducers...
    initializeTextTool: (
      state: WritableDraft<DrawingState>,
      action: PayloadAction<DrawingState>
    ) => {
      state.activeTool = "text";
      state.selectedTextId = action.payload.id;
    },

    activateTextTool: (state, action: PayloadAction<DrawingState>) => {
      const { payload } = action;
      const { beginText } = payload;

      // Set active tool to "text"
      state.activeTool = "text";

      // Define onTextDragStart function
      const onTextDragStart = () => {
        state.beginText = {
          x: beginText?.x ?? 0,
          y: beginText?.y ?? 0,
        };
      };

      // Define onTextDragMove function
      const onTextDragMove = (
        drawingId: string,
        dragX: number,
        dragY: number
      ) => {
        const textElement = document.getElementById("textElement");

        if (textElement) {
          const { left, top } = textElement.getBoundingClientRect();
          const newLeft = left + dragX;
          const newTop = top + dragY;

          textElement.style.left = `${newLeft}px`;
          textElement.style.top = `${newTop}px`;
        } else {
          console.error("Text element not found.");
        }
      };

      const onTextDragEnd = async (dragX: number, dragY: number) => {
        // Update drawing state on drag end
        if (state.selectedTextId !== null) {
          dispatch(
            DrawingActions.updateTextPosition({
              id: state.selectedTextId,
              x: dragX,
              y: dragY,
            })
          );
        }

        // Dispatch an action if needed
        dispatch(DrawingActions.someOtherActionIfNeeded());
        const drawingId = state.selectedDrawingId
          ? await drawingApi.fetchDrawingById(state.selectedDrawingId)
          : null;
        // Initialize useText hook
        useEffect(() => {
          if (drawingId) {
            const { beginText } = useText({
              TextType,
              onTextDragStart,
              onTextDragMove,
              onTextDragEnd,
            });
            const handleMouseDown = (e: MouseEvent) =>
              beginText({ x: e.clientX, y: e.clientY });
            const handleTouchStart = (e: TouchEvent) =>
              beginText({ x: e.touches[0].clientX, y: e.touches[0].clientY });

            document.addEventListener("mousedown", handleMouseDown);
            document.addEventListener("touchstart", handleTouchStart);

            return () => {
              // Remove event listeners on component unmount
              document.removeEventListener("mousedown", handleMouseDown);
              document.removeEventListener("touchstart", handleTouchStart);
            };
          }
        }, [beginText, drawingId]);
      };
    },

    resetTrackers: (
      state,
      action: PayloadAction<{ trackers: Tracker[] }>) => {
      const { trackers } = action.payload;
      
      state.trackers = [];
      state.selectedTrackers = [];
    },

    resetMilestones() {
      return (dispatch: any, getState: () => RootState) => {
        const milestones = selectMilestones(getState());
        // Reset milestones or perform any other necessary actions
      };
    },

    createMilestoneForTrackers(trackers: Tracker[]) {
      return (dispatch: any) => {
        // Logic to create milestones based on trackers
        // For example:
        trackers.forEach((tracker) => {
          const milestone: Milestone = {
            id: "milestone-" + tracker.id,
            title: "Milestone for " + tracker.name,
            date: new Date(),
          };
          dispatch(createMilestone(milestone));
        });
      };
    },

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
  initializeTextTool,
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
