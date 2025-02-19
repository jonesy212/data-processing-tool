// DrawingSlice.ts
import FolderData from '@/app/components/models/data/FolderData';
import TrackerClass from '@/app/components/models/tracker/Tracker';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { autosaveDrawing } from "@/app/components/documents/editing/autosaveDrawing";
import { useMovementAnimations } from "@/app/components/libraries/animations/movementAnimations/MovementAnimationActions";
import { TrackerProps } from "@/app/components/models/tracker/Tracker";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RefObject, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { DrawingActions } from "../../../actions/DrawingActions";
import { WritableDraft } from "../ReducerGenerator";
import { RootState } from "./RootSlice";
import {
    createMilestone
} from "./TrackerSlice";
// Define interface for drawing state
import * as drawingApi from "@/app/api/ApiDrawing";
import Milestone from "@/app/components/calendar/CalendarSlice";
import { saveAs } from "@/app/components/documents/editing/autosave";
import TextType from "@/app/components/documents/TextType";
import {
    saveToLocalStorage
} from "@/app/components/hooks/useLocalStorage";
import { Content } from "@/app/components/models/content/AddContent";
import FileData from "@/app/components/models/data/FileData";
import { useDrag } from "@/app/libraries/animations/DraggableAnimation/useDrag";
import useText from "@/app/libraries/animations/DraggableAnimation/useText";
import { ContentItem } from "../../stores/ContentStore";
import { BaseData, SharedBaseData } from '@/app/components/models/data/Data';
  
interface Guide {
  id: string;               // Unique identifier for the guide
  type: 'horizontal' | 'vertical'; // Type of the guide (horizontal or vertical)
  position: number;         // Position of the guide on the canvas (in pixels)
  color?: string;           // Optional color for the guide line
  x: number,
  y: number,
  label: string        // Array to store guides
}

interface Stroke {
  width: number;            // Width of the stroke in pixels
  color: string;            // Color of the stroke (e.g., hex, RGB)
  style?: 'solid' | 'dashed' | 'dotted'; // Optional stroke style
}

interface AppearanceUpdate {
  stroke?: Stroke; // Optional stroke update
  fillColor?: string; // Optional fill color update
  borderColor?: string; // Optional border color update
  textColor?: string; // Optional text color update
  highlightColor?: any; // Optional highlight color update
  backgroundColor?: string; // Optional background color update
  fontSize?: string; // Optional font size update
  fontFamily?: string; // Optional font family update
  width?: string,
  height?: string; // Optional width and height update
}

interface LayerEffectGuide extends Guide, SharedBaseData, AppearanceUpdate {}
interface LayerEffect extends LayerEffectGuide {
  effectType: string;        // Type of the effect (e.g., 'blur', 'shadow')
  options: object;           // Options specific to the effect (e.g., intensity, color)
}

interface Layer extends DrawingOptions {
  id: string;               // Unique identifier for the layer
  name: string;             // Name of the layer
  visible: boolean;         // Whether the layer is currently visible
  locked: boolean;          // Whether the layer is locked for editing
  groupId?: string; // Optional group identifier for layers
  content: any[];           // Content of the layer, such as drawings or text
  effects: LayerEffect[];   // List of effects applied to the layer
  blendMode: BlendMode // Blend mode
}

interface SharedDrawingProps extends SharedBaseData {}

interface Shape extends SharedDrawingProps {
  id: string;                      // Unique identifier for the shape
  x: number;                       // X position of the shape
  y: number;                       // Y position of the shape
  width: number;
  height: number;
  fillColor: string;
  isFlippedX?: boolean;
  isFlippedY?: boolean; // Define additional shape properties as needed
}


interface DrawingOptions {
  opacity: number;
  // Add any other shared properties here
}


interface BrushOptions extends DrawingOptions {
  size: number;           // Size of the brush in pixels       // Opacity of the brush (0 to 1)
  hardness: number;      // Hardness of the brush (0 to 1)
  texture: string;       // Path or identifier for the brush texture
  color: string;         // Color of the brush (e.g., hex color code)
  brushType: string;
}


interface Brush {
  id: string;            // Unique identifier for the brush
  name: string;          // Name of the brush
  options: BrushOptions; // Options for configuring the brush
  texture: string;       // Texture applied to the brush, e.g., 'grainy', 'smooth', or a file path
}

interface DrawingElement {
  type: string;       // Type of the drawing element (e.g., 'circle', 'line')
  coordinates: { x: number; y: number }; // Position on the canvas
  width: number,
  height: number
}


interface DrawingTemplate<
  T extends  BaseData<any>, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  id: string;               // Unique identifier for the template
  name: string;             // Name of the template
  description?: string;     // Optional description of the template
  imageUrl?: string;        // Optional URL to an image representing the template
  elements: DrawingElement[]; // List of drawing elements included in the template
  content: Content<T, K, Meta>
}
type TrackerDrawingElement = TrackerProps & DrawingElement;


// Define interface for drawing state
interface DrawingState<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  id: string;
  selectedDrawingId: number | null;
  isDrawing: boolean;
  beginDrag: {
    x: number;
    y: number;
  } | null;
  drawingContent: TrackerDrawingElement[];
  activeTool: string | null;
  beginText: {
    x: number;
    y: number;
  } | null;

  selectedTextId: string | null;
  selectedText: TextType | null;
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
  trackers: TrackerProps[];
  selectedTrackers: TrackerProps[];
  clipboard: any[];           // Array to store copied elements

  smoothingEnabled: boolean; // Boolean to track if brush smoothing is enabled
  snapToObjectsEnabled: boolean; // Boolean to track if snap to objects is enabled
  collaborativeDrawing: boolean; // Boolean to track if collaborative drawing is active
  collaborativeEdit: boolean;    // Boolean to track if collaborative editing is active
  canvasPosition: { x: number; y: number }; // Position of the canvas


  undoStack: any[];        // Stack to store undone actions
  redoStack: any[];        // Stack to store redone actions

  milestones: Milestone[];
  // New properties
  guides: Guide[];             // List of guides used for drawing alignment
  layers: Layer[];             // List of drawing layers
  canvasResolution: {
    width: number;
    height: number;
  };                           // Resolution of the canvas
  stroke: Stroke;              // Current stroke settings
  brushes: Brush[];            // List of available brushes
  templates: DrawingTemplate<T, K>[]; // List of drawing templates
  gridSize: number;
  canvasWidth: number;     // Canvas width
  canvasHeight: number;    // Canvas height


  selectedShapes: any[];   // Array to store currently selected shapes
  selectedColor: string;   // Currently selected color
  selectedLayerId: string | null; // ID of the selected layer
  selectedTool: string;    // Currently selected tool
  canvasBackground: string; // Background color or image of the canvas


  pressureSensitivity: boolean; // Whether pressure sensitivity is enabled
  shared: boolean;             // Whether the drawing is shared
  snappingToGrid: boolean;     // Whether snapping to the grid is enabled


  isCollaborativeDrawing: boolean; // Whether collaborative drawing is active
  isCollaborativeEditing: boolean; // Whether collaborative editing is active
  isGridViewEnabled: boolean;      // Whether the grid view is enabled


  isGridVisible: boolean;      // Whether the grid is visible
  areGuidesVisible: boolean;   // Whether guides are visible
  history: any[];              // History stack for undo operations
  currentState: any;
  zoomLevel: number;      // Current zoom level of the canvas

  // Define drawing-related state properties here
}



type BlendMode = "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten";
// Define initial state
const initialState: DrawingState<Shape, LayerEffect, DrawingTemplate<Shape, LayerEffect>> = {
  
  stroke: {
    width: 0,
    color: ''
  },
  brushes: [],
  templates: [],
  gridSize: 0,
 
  selectedShapes: [],
  selectedColor: "",
  selectedLayerId: "",
  selectedTool: "",
  canvasBackground: "",
 
  canvasPosition: { x: 0, y: 0 },
  undoStack: [],
  redoStack: [],
  canvasResolution: {
    width: 800,
    height: 600
  },

  
  // selectedDrawingId: null,
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
  clipboard: [],

  milestones: [],
  selectedText: null,

  layers: [],
  guides: [],
  canvasWidth: 800,     // Default canvas width
  canvasHeight: 600,    // Default canvas height
  smoothingEnabled: false,
  snapToObjectsEnabled: false,
  collaborativeDrawing: false,
  collaborativeEdit: false,

  pressureSensitivity: false,
  shared: false,
  snappingToGrid: false,

  isCollaborativeDrawing: false,
  isCollaborativeEditing: false,
  isGridViewEnabled: false,

  isGridVisible: false,
  areGuidesVisible: true,
  history: [],
  currentState: null,
  zoomLevel: 1, // Default zoom level

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



// Thunk to create milestones for trackers
export const createMilestoneForTrackers = (trackers: TrackerProps[]) => (dispatch: any) => {
  trackers.forEach((tracker) => {
    const milestone: Milestone = {
      id: "milestone-" + tracker.id,
      title: "Milestone for " + tracker.name,
      date: new Date(),
      dueDate: null,
      startDate: null,
    };
    dispatch(createMilestone(milestone));  // Assuming createMilestone is an action
  });
};





// Example transformation function from ContentItem to TrackerProps
const convertContentItemToTracker = (item: ContentItem): WritableDraft<TrackerDrawingElement> => {
  const tracker = new TrackerClass(
    item.id || '',
    item.type || 'Unnamed Tracker',
    [], // Initialize with empty or default phases
    item.data.stroke || 'black', // Default stroke color
    item.data.strokeWidth || 1, // Default stroke width
    item.data.fillColor || 'transparent', // Default fill color
    item.data.isFlippedX || false,
    item.data.isFlippedY || false,
    item.data.x || 0,
    item.data.y || 0
  );

  
  return {
    id: item.id,
    name: item.type, // Example: Using 'type' as 'name'
    phases: [], // Initialize with empty or default phases
    type: "",
    coordinates: "",
    width: "",
    height: "",
   
    // Function to track changes for files
    trackFileChanges: async (file: FileData) => {
      try {
        // Use the existing TrackerClass method to track file changes
        tracker.trackFileChanges(file);

        // Optionally update the UI or perform other side effects
        console.log(`Tracking file changes for file: ${file.title}`);
      } catch (error: any) {
        console.error(`Error tracking file changes: ${error.message}`);
      }
    },

    // Function to track changes for folders
    trackFolderChanges: async (folder: FolderData) => {
      try {
        // Use the existing TrackerClass method to track folder changes
        await tracker.trackFolderChanges(folder);

        // Optionally refresh folder contents or sync with server
        console.log(`Folder ${folder.name} has been updated.`);
        refreshFolderContents(folder.id);
        syncFolderWithServer(folder.id);
      } catch (error) {
        console.error(`Error tracking folder changes: ${error.message}`);
      }
    },

    stroke: item.data.stroke, // Assume 'data' contains stroke information
    strokeWidth: item.data.strokeWidth,
    fillColor: item.data.fillColor,
    isFlippedX: item.data.isFlippedX,
    isFlippedY: item.data.isFlippedY,
    x: item.data.x,
    y: item.data.y,

    // Other optional properties and methods can be included here
  };
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
      state: WritableDraft<DrawingState<Shape, LayerEffect, DrawingTemplate<Shape, LayerEffect>>>,
      action: PayloadAction<DrawingState<Shape, LayerEffect, DrawingTemplate<Shape, LayerEffect>>>
    ) => {
      state.activeTool = "text";
      state.selectedTextId = action.payload.id;
    },

    resetTrackers: (
      state,
      action: PayloadAction<{ trackers: TrackerProps[] }>) => {
      const { trackers } = action.payload;

      state.trackers = [];
      state.selectedTrackers = [];
    },

    resetMilestones(state) {
      state.milestones = [];
    },

    createMilestone(state, action: PayloadAction<Milestone>) {
      // Logic to add the milestone to the state
      // For example:
      state.milestones.push(action.payload); // Assuming state has a milestones array
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
        dispatch(
          DrawingActions.handleTextDragEnd({
            id: state.selectedTextId,
            text: state.selectedText || "",
            x: dragX,
            y: dragY,
          })
        );
        const drawingId = state.selectedDrawingId
          ? await drawingApi.fetchDrawingById(state.selectedDrawingId)
          : null;
        // Initialize useText hook
        useEffect(() => {
          if (drawingId) {
            const { beginText } = useText({
              TextType: "text",
              onTextDragStart,
              onTextDragMove,
              onTextDragEnd,
              onDragStart,
              onDragMove,
              onDragEnd,
              text: state.selectedText ? String(state.selectedText) : "", // Convert to string
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
        }, [beginText, drawingId, state.selectedText]);
      };

      const onDragStart = () => {
        // Set drawing state to true
        state.isDrawing = true;

      }

      const onDragMove = () => {
        // Keep dragging state as true during movement
        if (state.isDragging) {
          // You can add more logic here if needed
        }
      }

      const onDragEnd = () => {
        // Reset dragging state to false
        state.isDragging = false;
      }
    },



    addGuide: (
      state: WritableDraft<{ guides: Guide[] }>,
      action: PayloadAction<{
        id: string;
        x: number;
        y: number;
        label: string;
        type: 'horizontal' | 'vertical'; // Ensure the correct type is provided here
        position: number;                // Ensure the position is provided
      }>
    ) => {
      const { id, x, y, label, type, position } = action.payload;

      state.guides.push({
        id,
        x,
        y,
        label,
        type,
        position,
        color: undefined, // or any default value if needed
      });
    },

    addLayerEffect(state, action: PayloadAction<{ id: string; effectType: string; options: object }>) {
      const { id, effectType, options } = action.payload;
      const layer = state.layers.find(layer => layer.id === id);
      if (layer) {
        layer.effects.push({
          effectType,
          options,
        });
      }
    },

    adjustCanvasResolution(state, action: PayloadAction<{ width: number; height: number }>) {
      const { width, height } = action.payload;
      state.canvasResolution = { width, height };
    },

    adjustStroke(state, action: PayloadAction<{ id: string; width: number; color: string }>) {
      const { id, width, color } = action.payload;
      const drawingElement = state.drawingContent.find(element => element.id === id);
      if (drawingElement) {
        drawingElement.stroke = { width, color };
      }
    },

    applyBlendMode(state, action: PayloadAction<{ id: string; blendMode: BlendMode }>) {
      const { id, blendMode } = action.payload;
      const layer = state.layers.find(layer => layer.id === id);
      if (layer) {
        layer.blendMode = blendMode;
      }
    },


    applyBrushTexture(state, action: PayloadAction<{ id: string; texture: string }>) {
      const { id, texture } = action.payload;
      const brush = state.brushes.find(brush => brush.id === id);
      if (brush) {
        brush.texture = texture;
      }
    },


    applyCollaborativeEdits(state, action: PayloadAction<{ edits: any[] }>) {
      const { edits } = action.payload;
      // Apply the collaborative edits to the drawing state
      edits.forEach(edit => {
        // Assuming `edit` contains information on what to modify
        const element = state.drawingContent.find(element => element.id === edit.id);
        if (element) {
          Object.assign(element, edit.changes);
        }
      });
    },


    // Apply the transformation in your reducer
    applyDrawingTemplate(state, action: PayloadAction<{ templateId: string }>) {
      const { templateId } = action.payload;
      const template = state.templates.find(t => t.id === templateId);
      if (template) {
        // Transform ContentItem[] to Tracker[]
        state.drawingContent = template.content.items.map(convertContentItemToTracker);
      }
    },

    changeGridSize(state, action: PayloadAction<{ gridSize: number }>) {
      const { gridSize } = action.payload;
      state.gridSize = gridSize;
    },

    clearCanvas(state) {
      state.drawingContent = [];
      state.isDrawing = false;
      // Additional state resets if necessary
    },

    clearHistory(state) {
      state.history = []; // Clear undo/redo history
      state.redoStack = []; // Clear redo stack
    },

    // Copy Selection
    copySelection(state) {
      if (state.selectedTrackers.length > 0) {
        state.clipboard = state.selectedTrackers.map(tracker => ({ ...tracker }));
      }
    },

    // Create Layer
    createLayer(state, action: PayloadAction<{ name: string }>) {
      const { name } = action.payload;
      const newLayer: Layer = {
        id: `layer_${Date.now()}`, // Generate a unique ID
        name,
        visible: true,
        locked: false,
        content: [],
        effects: [],
        blendMode: 'normal', // Assuming 'normal' as default blend mode
        opacity: 80
      };
      state.layers.push(newLayer);
    },


    cutSelection: (state) => {
      // Logic to cut the selected drawing content
      // For example:
      state.drawingContent = [];
    },


    // Delete Selection
    deleteSelection(state) {
      if (state.selectedTrackers.length > 0) {
        state.drawingContent = state.drawingContent.filter(
          element => !state.selectedTrackers.includes(element)
        );
        state.selectedTrackers = []; // Clear the selection after deletion
      }
    },

    // Deselect All Shapes
    deselectAllShapes(state) {
      state.selectedTrackers = []; // Clear all selections
    },


    // Draw Shape
    drawShape(state, action: PayloadAction<{ shape: any; layerId: string }>) {
      const { shape, layerId } = action.payload;
      const layer = state.layers.find(layer => layer.id === layerId);
      if (layer) {
        layer.content.push(shape);
        state.drawingContent.push(shape);
      }
    },

    // Duplicate Layer
    duplicateLayer(state, action: PayloadAction<{ layerId: string }>) {
      const { layerId } = action.payload;
      const layer = state.layers.find(layer => layer.id === layerId);
      if (layer) {
        const newLayer = {
          ...layer,
          id: `layer_${Date.now()}`, // Generate a unique ID for the new layer
          name: `${layer.name}_copy`, // Append '_copy' to the layer's name
          content: [...layer.content], // Copy the content array
        };
        state.layers.push(newLayer);
      }
    },

    // Duplicate Shape
    duplicateShape(state, action: PayloadAction<{ shapeId: string }>) {
      const { shapeId } = action.payload;
      const shape = state.drawingContent.find(element => element.id === shapeId);
      if (shape) {
        const newShape = {
          ...shape,
          id: `shape_${Date.now()}`, // Generate a unique ID for the new shape
        };
        state.drawingContent.push(newShape);

        // Optionally, add to the relevant layer if shape tracking is needed
        const layer = state.layers.find(layer => layer.content.includes(shape));
        if (layer) {
          layer.content.push(newShape);
        }
      }
    },

    // Enable Brush Smoothing
    enableBrushSmoothing(state, action: PayloadAction<{ enabled: boolean }>) {
      state.smoothingEnabled = action.payload.enabled;
    },


    // Enable Snap to Objects
    enableSnapToObjects(state, action: PayloadAction<{ enabled: boolean }>) {
      state.snapToObjectsEnabled = action.payload.enabled;
    },

    // End Collaborative Drawing
    endCollaborativeDrawing(state) {
      state.collaborativeDrawing = false;
      // Additional logic to finalize or clean up collaborative drawing state
    },

    // End Collaborative Edit
    endCollaborativeEdit(state) {
      state.collaborativeEdit = false;
      // Additional logic to finalize or clean up collaborative edit state
    },

    // Erase Shape
    eraseShape(state, action: PayloadAction<{ shapeId: string }>) {
      const { shapeId } = action.payload;
      // Remove shape from drawingContent
      state.drawingContent = state.drawingContent.filter(shape => shape.id !== shapeId);

      // Also remove shape from relevant layers
      state.layers.forEach(layer => {
        layer.content = layer.content.filter(shape => shape.id !== shapeId);
      });

      // Optionally, remove shape from selectedTrackers if applicable
      state.selectedTrackers = state.selectedTrackers.filter(tracker => tracker.id !== shapeId);
    },




    // Export Drawing
    exportDrawing(state, action: PayloadAction<{ format: 'png' | 'jpg' | 'pdf' }>) {
      const { format } = action.payload;
      // Logic to export the drawing content to the specified format
      // For example, this could involve converting the canvas content to an image or PDF file
      console.log(`Exporting drawing as ${format}`);
      // Example logic might involve calling a function to convert the canvas content to the specified format
    },

    // Fill Shape
    fillShape(state, action: PayloadAction<{ shapeId: string; color: string }>) {
      const { shapeId, color } = action.payload;
      // Find the shape in drawingContent and update its fillColor
      const shape = state.drawingContent.find(shape => shape.id === shapeId);
      if (shape) {
        shape.fillColor = color;
      }
    },

    // Flatten Drawing
    flattenDrawing(state) {
      // Logic to flatten the drawing layers into a single layer or image
      // This might involve merging all layers into one and updating the state
      console.log('Flattening drawing');
      state.layers = [{
        id: 'flattened-layer',
        name: 'Flattened Layer',
        visible: true,
        locked: false,
        content: [...state.drawingContent],
        effects: [],
        blendMode: 'normal',
        opacity: 50
      }];
      state.drawingContent = [];
    },

    // Flip Shape X
    flipShapeX(state, action: PayloadAction<{ shapeId: string }>) {
      const { shapeId } = action.payload;
      // Find the shape in drawingContent and update its isFlippedX property
      const shape = state.drawingContent.find(shape => shape.id === shapeId);
      if (shape) {
        shape.isFlippedX = !shape.isFlippedX;
        // Apply transformation logic if needed
      }
    },

    // Flip Shape Y
    flipShapeY(state, action: PayloadAction<{ shapeId: string }>) {
      const { shapeId } = action.payload;
      // Find the shape in drawingContent and update its isFlippedY property
      const shape = state.drawingContent.find(shape => shape.id === shapeId);
      if (shape) {
        shape.isFlippedY = !shape.isFlippedY;
        // Apply transformation logic if needed
      }
    },


    // Group Layers
    groupLayers(state, action: PayloadAction<{ layerIds: string[]; groupName: string }>) {
      const { layerIds, groupName } = action.payload;
      // Find layers to group
      const layersToGroup = state.layers.filter(layer => layerIds.includes(layer.id));
      if (layersToGroup.length > 0) {
        // Create a new layer group
        const newGroup: Layer = {
          id: `group-${new Date().getTime()}`,
          name: groupName,
          visible: true,
          locked: false,
          content: layersToGroup.flatMap(layer => layer.content),
          effects: [], // Optionally merge or apply group-specific effects
          blendMode: 'normal', // Default blend mode for the group
          opacity: 50
        };
        // Remove the original layers and add the new group
        state.layers = state.layers.filter(layer => !layerIds.includes(layer.id));
        state.layers.push(newGroup);
      }
    },

    // Hide Layer
    hideLayer(state, action: PayloadAction<{ id: string }>) {
      const { id } = action.payload;
      const layer = state.layers.find(layer => layer.id === id);
      if (layer) {
        layer.visible = false;
      }
    },

    // Import Drawing
    importDrawing(state, action: PayloadAction<{ drawing: any[] }>) {
      const { drawing } = action.payload;
      // Logic to import a drawing into the current state
      // Example: Clear existing drawing content and add imported drawing
      state.drawingContent = [...drawing];
      // Optionally, merge imported layers into the existing layers
      // Example: Assume each item in `drawing` is a layer for simplicity
      // You might need more complex merging depending on your use case
      state.layers = state.layers.concat(drawing.map(d => ({
        id: `imported-${d.id}`,
        name: `Imported ${d.name || 'Layer'}`,
        visible: true,
        locked: false,
        content: d.content,
        effects: d.effects || [],
        blendMode: d.blendMode || 'normal',
        opacity: 75
      })));
    },


    // Import Drawing From File
    importDrawingFromFile(state, action: PayloadAction<{ file: File }>) {
      const { file } = action.payload;

      // Create a new FileReader to read the file content
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          try {
            // Parse the file content as JSON
            const importedData = JSON.parse(e.target.result as string);

            // Assuming the file contains drawing content and layers
            state.drawingContent = importedData.drawingContent || [];
            state.layers = importedData.layers || [];
          } catch (error) {
            console.error('Failed to parse imported drawing data:', error);
          }
        }
      };

      reader.readAsText(file);
    },

    // Invert Selection
    invertSelection(state) {
      // Logic to invert selection
      // Assuming selectedTrackers represent selected elements
      const allElements = state.drawingContent; // or any other collection of elements
      const selectedElementIds = new Set(state.selectedTrackers.map(tracker => tracker.id));

      state.selectedTrackers = allElements.filter(element => !selectedElementIds.has(element.id));
    },

    // Lock Layer
    lockLayer(state, action: PayloadAction<{ id: string }>) {
      const { id } = action.payload;
      const layer = state.layers.find(layer => layer.id === id);
      if (layer) {
        layer.locked = true;
      }
    },


    // Merge All Layers
    mergeAllLayers(state) {
      if (state.layers.length === 0) return;

      // Combine all layers into a single layer
      const mergedLayerContent = state.layers.reduce((acc, layer) => {
        if (!layer.locked) {
          acc.push(...layer.content);
        }
        return acc;
      }, [] as any[]);

      // Update drawingContent with merged content
      state.drawingContent = mergedLayerContent;

      // Clear layers
      state.layers = [{
        id: 'mergedLayer',
        name: 'Merged Layer',
        visible: true,
        locked: false,
        content: mergedLayerContent,
        effects: [],
        blendMode: 'normal',
        opacity: 100
      }];
    },

    // Merge Specific Layers
    mergeLayers(state, action: PayloadAction<{ layerIds: string[] }>) {
      const { layerIds } = action.payload;
      const layersToMerge = state.layers.filter(layer => layerIds.includes(layer.id));

      if (layersToMerge.length === 0) return;

      // Combine selected layers into a new layer
      const mergedLayerContent = layersToMerge.reduce((acc, layer) => {
        if (!layer.locked) {
          acc.push(...layer.content);
        }
        return acc;
      }, [] as any[]);

      // Remove merged layers and add new merged layer
      state.layers = state.layers.filter(layer => !layerIds.includes(layer.id));
      state.layers.push({
        id: 'mergedLayer',
        name: `Merged Layer (${layerIds.join(', ')})`,
        visible: true,
        locked: false,
        content: mergedLayerContent,
        effects: [],
        blendMode: 'normal',
        opacity: 100
      });
    },

    // Move Shape
    moveShape(state, action: PayloadAction<{ id: string; dx: number; dy: number }>) {
      const { id, dx, dy } = action.payload;
      const shape = state.drawingContent.find(shape => shape.id === id);

      if (shape) {
        shape.x += dx;
        shape.y += dy;
      }
    },

    // Pan Canvas
    panCanvas(state, action: PayloadAction<{ dx: number; dy: number }>) {
      const { dx, dy } = action.payload;
      state.canvasPosition.x += dx;
      state.canvasPosition.y += dy;
    },




    // Paste Selection
    pasteSelection(state) {
      const lastCopiedSelection = state.selectedTrackers;
      if (lastCopiedSelection.length > 0) {
        // Create a new array of copied elements to avoid reference issues
        const newElements = lastCopiedSelection.map(element => ({
          ...element,
          id: `new_${element.id}`, // Ensure new ID for pasted elements
          x: element.x + 10, // Offset position for visual distinction
          y: element.y + 10,
        }));

        state.drawingContent.push(...newElements);

        // Save the action to the undo stack
        state.undoStack.push({
          action: 'pasteSelection',
          elements: newElements,
        });

        // Clear the redo stack since a new action has been performed
        state.redoStack = [];
      }
    },

    // Redo Action
    redoAction(state) {
      if (state.redoStack.length === 0) return;

      const lastRedoAction = state.redoStack.pop();

      if (lastRedoAction) {
        switch (lastRedoAction.action) {
          case 'pasteSelection':
            state.drawingContent.push(...lastRedoAction.elements);
            state.undoStack.push(lastRedoAction);
            break;

          // Handle other actions if needed
        }
      }
    },

    // Redo History Action
    redoHistoryAction(state) {
      // Assuming redoHistoryAction redoes the last undone action
      if (state.undoStack.length === 0) return;

      const lastUndoAction = state.undoStack.pop();

      if (lastUndoAction) {
        switch (lastUndoAction.action) {
          case 'pasteSelection':
            state.drawingContent = state.drawingContent.filter(
              (element: TrackerDrawingElement) =>
                !lastUndoAction.elements.some((e: TrackerDrawingElement) => e.id === element.id)
            );
            state.redoStack.push(lastUndoAction);
            break;

          // Handle other actions if needed
        }
      }
    },

    // Remove Guide
    removeGuide(state, action: PayloadAction<{ id: string }>) {
      const { id } = action.payload;
      state.guides = state.guides.filter(guide => guide.id !== id);

      // Save the action to the undo stack
      state.undoStack.push({
        action: 'removeGuide',
        id,
      });

      // Clear the redo stack since a new action has been performed
      state.redoStack = [];
    },

    // Remove Layer
    removeLayer(state, action: PayloadAction<{ id: string }>) {
      const { id } = action.payload;
      const removedLayer = state.layers.find(layer => layer.id === id);
      if (removedLayer) {
        state.layers = state.layers.filter(layer => layer.id !== id);

        // Remove all content associated with the removed layer
        state.drawingContent = state.drawingContent.filter(
          element => !removedLayer.content.some(e => e.id === element.id)
        );

        // Save the action to the undo stack
        state.undoStack.push({
          action: 'removeLayer',
          layer: removedLayer,
        });

        // Clear the redo stack since a new action has been performed
        state.redoStack = [];
      }
    },

    // Reorder Layer
    reorderLayer(state, action: PayloadAction<{ id: string; newIndex: number }>) {
      const { id, newIndex } = action.payload;
      const currentIndex = state.layers.findIndex(layer => layer.id === id);

      if (currentIndex !== -1 && newIndex >= 0 && newIndex < state.layers.length) {
        const [layer] = state.layers.splice(currentIndex, 1);
        state.layers.splice(newIndex, 0, layer);

        // Save the action to the undo stack
        state.undoStack.push({
          action: 'reorderLayer',
          id,
          fromIndex: currentIndex,
          toIndex: newIndex,
        });

        // Clear the redo stack since a new action has been performed
        state.redoStack = [];
      }
    },




    // Resize Canvas
    resizeCanvas(state, action: PayloadAction<{ width: number; height: number }>) {
      const { width, height } = action.payload;
      state.canvasWidth = width;
      state.canvasHeight = height;

      // Save the action to the undo stack
      state.undoStack.push({
        action: 'resizeCanvas',
        previousSize: {
          width: state.canvasWidth,
          height: state.canvasHeight,
        },
        newSize: {
          width,
          height,
        },
      });

      // Clear the redo stack since a new action has been performed
      state.redoStack = [];
    },

    // Resize Shape
    resizeShape(state, action: PayloadAction<{ id: string; width: number; height: number }>) {
      const { id, width, height } = action.payload;
      const shape = state.drawingContent.find(shape => shape.id === id);
      if (shape) {
        shape.width = width;
        shape.height = height;

        // Save the action to the undo stack
        state.undoStack.push({
          action: 'resizeShape',
          id,
          previousDimensions: {
            width: shape.width,
            height: shape.height,
          },
          newDimensions: {
            width,
            height,
          },
        });

        // Clear the redo stack since a new action has been performed
        state.redoStack = [];
      }
    },

    // Rotate Shape
    rotateShape(state, action: PayloadAction<{ id: string; angle: number }>) {
      const { id, angle } = action.payload;
      const shape = state.drawingContent.find(shape => shape.id === id);
      if (shape) {
        shape.rotation = angle;

        // Save the action to the undo stack
        state.undoStack.push({
          action: 'rotateShape',
          id,
          previousRotation: shape.rotation,
          newRotation: angle,
        });

        // Clear the redo stack since a new action has been performed
        state.redoStack = [];
      }
    },

    // Save Drawing
    saveDrawing(state, action: PayloadAction<{ drawingData: any }>) {
      const { drawingData } = action.payload;

      // Save drawing data to local storage or any persistence mechanism
      localStorage.setItem('savedDrawing', JSON.stringify(drawingData));

      // Save the action to the undo stack
      state.undoStack.push({
        action: 'saveDrawing',
        drawingData,
      });

      // Clear the redo stack since a new action has been performed
      state.redoStack = [];
    },


    // Select All Shapes
    selectAllShapes(state) {
      state.selectedShapes = [...state.drawingContent];
    },

    // Select Color
    selectColor(state, action: PayloadAction<string>) {
      state.selectedColor = action.payload;
    },

    // Select Layer
    selectLayer(state, action: PayloadAction<string | null>) {
      state.selectedLayerId = action.payload;
    },

    // Select Tool
    selectTool(state, action: PayloadAction<string>) {
      state.selectedTool = action.payload;
    },

    // Set Canvas Background
    setCanvasBackground(state, action: PayloadAction<string>) {
      state.canvasBackground = action.payload;
    },


    // Set Layer Opacity
    setLayerOpacity(state, action: PayloadAction<{ layerId: string; opacity: number }>) {
      const { layerId, opacity } = action.payload;
      const layer = state.layers.find(layer => layer.id === layerId);
      if (layer) {
        layer.opacity = opacity;
      }
    },

    // Set Pressure Sensitivity
    setPressureSensitivity(state, action: PayloadAction<boolean>) {
      state.pressureSensitivity = action.payload;
    },

    // Share Drawing
    shareDrawing(state, action: PayloadAction<boolean>) {
      state.shared = action.payload;
    },

    // Show Layer
    showLayer(state, action: PayloadAction<string>) {
      const layer = state.layers.find(layer => layer.id === action.payload);
      if (layer) {
        layer.visible = true;
      }
    },

    // Snap to Grid
    snapToGrid(state, action: PayloadAction<boolean>) {
      state.snappingToGrid = action.payload;
    },

    // Start Collaborative Drawing
    startCollaborativeDrawing(state) {
      state.isCollaborativeDrawing = true;
    },

    // Start Collaborative Edit
    startCollaborativeEdit(state) {
      state.isCollaborativeEditing = true;
    },

    // Toggle Grid View
    toggleGridView(state) {
      state.isGridViewEnabled = !state.isGridViewEnabled;
    },

    // Toggle Grid Visibility
    toggleGridVisibility(state) {
      state.isGridVisible = !state.isGridVisible;
    },

    // Toggle Guides Visibility
    toggleGuides(state) {
      state.areGuidesVisible = !state.areGuidesVisible;
    },

    // Undo Action
    undoAction(state) {
      if (state.history.length > 0) {
        const previousState = state.history.pop();
        state.currentState = previousState;
      }
    },


    // Undo History Action
    undoHistoryAction(state) {
      if (state.history.length > 0) {
        const previousState = state.history.pop();
        state.currentState = previousState;
      }
    },

    // Ungroup Layers
    ungroupLayers(state, action: PayloadAction<{ groupId: string }>) {
      const { groupId } = action.payload;
      state.layers.forEach(layer => {
        if (layer.groupId === groupId) {
          layer.groupId = undefined; // Remove the group identifier from layers in the specified group
        }
      });
    },

    // Unlock Layer
    unlockLayer(state, action: PayloadAction<{ id: string }>) {
      const { id } = action.payload;
      const layer = state.layers.find(layer => layer.id === id);
      if (layer) {
        layer.locked = false; // Set the locked status of the specified layer to false
      }
    },

    // View Drawing History
    viewDrawingHistory(state, action: PayloadAction<{ index: number }>) {
      const { index } = action.payload;
      if (index >= 0 && index < state.history.length) {
        state.currentState = state.history[index];
      }
    },

    // Zoom In
    zoomIn(state, action: PayloadAction<{ increment: number }>) {
      const { increment } = action.payload;
      state.zoomLevel += increment;
      if (state.zoomLevel > 5) { // Assuming 5x is the maximum zoom level
        state.zoomLevel = 5;
      }
    },

    // Zoom Out
    zoomOut(state, action: PayloadAction<{ decrement: number }>) {
      const { decrement } = action.payload;
      state.zoomLevel -= decrement;
      if (state.zoomLevel < 0.1) { // Assuming 0.1x is the minimum zoom level
        state.zoomLevel = 0.1;
      }
    },

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
export type { DrawingState, Stroke, TrackerDrawingElement, AppearanceUpdate };

// Selectors
export const selectDrawing = (state: RootState) => state.drawingManager;

// Create and export selectors for accessing drawing-related state properties
export const selectIsDrawing = (state: RootState) =>
  state.drawingManager.isDrawing;
export const selectBeginDrag = (state: RootState) =>
  state.drawingManager.beginDrag;
export const selectDrawingContent = (state: RootState) =>
  state.drawingManager.drawingContent;
