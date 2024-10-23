// DrawingActions.ts
import { createAction } from "@reduxjs/toolkit";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import TextType from "../documents/TextType";
import Milestone from "../calendar/CalendarSlice";

export const DrawingActions = {

  handleTextDragEnd: createAction<{id: string | null, text: string | WritableDraft<TextType>, x: number, y: number}>("handleTextDragEnd"),
  performDrawingActions: createAction<string | null>(
    "drawing/performDrawingActions"
  ),
  // Drawing operations
  startDrawing: createAction<React.MouseEvent<HTMLCanvasElement, MouseEvent>>("startDrawing"),
  stopDrawing: createAction<void>("stopDrawing"),
  clearDrawing: createAction<void>("clearDrawing"),
  drawShape: createAction<{ shape: string; options: any }>("drawShape"),
  eraseShape: createAction<{ shape: string; options: any }>("eraseShape"),
  moveShape: createAction<{ shape: string; deltaX: number; deltaY: number }>(
    "moveShape"
  ),
  resizeShape: createAction<{ shape: string; scaleFactor: number }>(
    "resizeShape"
  ),
  rotateShape: createAction<{ shape: string; angle: number }>("rotateShape"),

  // Layer operations
  createLayer: createAction<{ name: string }>("createLayer"),
  removeLayer: createAction<{ layerId: string }>("removeLayer"),
  selectLayer: createAction<{ layerId: string }>("selectLayer"),
  reorderLayer: createAction<{ layerId: string; newIndex: number }>(
    "reorderLayer"
  ),
  mergeLayers: createAction<{ layerIds: string[] }>("mergeLayers"),
  duplicateLayer: createAction<{ layerId: string }>("duplicateLayer"),

  // Group operations
  groupLayers: createAction<{ layerIds: string[] }>("groupLayers"),
  ungroupLayers: createAction<{ groupId: string }>("ungroupLayers"),
  // Collaboration actions
  startCollaborativeEdit: createAction<{ fileId: string; userId: string }>(
    "startCollaborativeEdit"
  ),
  endCollaborativeEdit: createAction<{ fileId: string; userId: string }>(
    "endCollaborativeEdit"
  ),
  applyCollaborativeEdits: createAction<{ fileId: string; edits: any[] }>(
    "applyCollaborativeEdits"
  ),

  autosaveDrawingAsync: createAction("autosaveDrawingAsync"),
  resetDrawingState: createAction("drawing/resetDrawingState"),
  resetMilestones: createAction("milestones/resetMilestones"),
  // Additional drawing actions
  exportDrawing: createAction<{ format: string }>("exportDrawing"),
  importDrawing: createAction<{ source: string }>("importDrawing"),
  clearCanvas: createAction("clearCanvas"),
  undoAction: createAction("undoAction"),
  redoAction: createAction("redoAction"),
  zoomIn: createAction("zoomIn"),
  zoomOut: createAction("zoomOut"),
  panCanvas: createAction<{ deltaX: number; deltaY: number }>("panCanvas"),
  selectTool: createAction<{ tool: string }>("selectTool"),
  copySelection: createAction("copySelection"),
  pasteSelection: createAction("pasteSelection"),
  duplicateShape: createAction<{ shapeId: string }>("duplicateShape"),
  lockLayer: createAction<{ layerId: string }>("lockLayer"),
  unlockLayer: createAction<{ layerId: string }>("unlockLayer"),
  hideLayer: createAction<{ layerId: string }>("hideLayer"),
  showLayer: createAction<{ layerId: string }>("showLayer"),
  toggleGridView: createAction("toggleGridView"),
  snapToGrid: createAction<{ enabled: boolean }>("snapToGrid"),
  selectColor: createAction<{ color: string }>("selectColor"),
  fillShape: createAction<{ shapeId: string; color: string }>("fillShape"),
  adjustStroke: createAction<{ shapeId: string; options: any }>("adjustStroke"),
  activateTextTool: createAction<{ id: string }>("activateTextTool"),

  setLayerOpacity: createAction<{ layerId: string; opacity: number }>(
    "setLayerOpacity"
  ),
  applyBlendMode: createAction<{ layerId: string; mode: string }>(
    "applyBlendMode"
  ),
  addLayerEffect: createAction<{ layerId: string; effect: string }>(
    "addLayerEffect"
  ),
  saveDrawing: createAction<{ fileName: string }>("saveDrawing"),
  shareDrawing: createAction("shareDrawing"),
  startCollaborativeDrawing: createAction("startCollaborativeDrawing"),
  endCollaborativeDrawing: createAction("endCollaborativeDrawing"),
  viewDrawingHistory: createAction("viewDrawingHistory"),
  enableBrushSmoothing: createAction<{ enabled: boolean }>(
    "enableBrushSmoothing"
  ),
  setPressureSensitivity: createAction<{ sensitivity: number }>(
    "setPressureSensitivity"
  ),
  applyBrushTexture: createAction<{ texture: string }>("applyBrushTexture"),
  applyDrawingTemplate: createAction<{ templateId: string }>(
    "applyDrawingTemplate"
  ),
  updateTextPosition: createAction<{ id: string; x: number; y: number }>("updateTextPosition"),

  // Transformations
  flipShapeX: createAction<{ shapeId: string }>("flipShapeX"),
  flipShapeY: createAction<{ shapeId: string }>("flipShapeY"),

  // Selection Operations
  selectAllShapes: createAction("selectAllShapes"),
  deselectAllShapes: createAction("deselectAllShapes"),
  invertSelection: createAction("invertSelection"),

  // Clipboard Operations
  cutSelection: createAction("cutSelection"),
  deleteSelection: createAction("deleteSelection"),

  // Canvas Operations
  resizeCanvas: createAction<{ width: number; height: number }>("resizeCanvas"),
  setCanvasBackground: createAction<{ color: string }>("setCanvasBackground"),

  // Grid Operations
  toggleGridVisibility: createAction<{ visible: boolean }>(
    "toggleGridVisibility"
  ),
  changeGridSize: createAction<{ size: number }>("changeGridSize"),

  // History Operations
  undoHistoryAction: createAction("undoHistoryAction"),
  redoHistoryAction: createAction("redoHistoryAction"),
  clearHistory: createAction("clearHistory"),

  // Layer Operations
  mergeAllLayers: createAction("mergeAllLayers"),
  flattenDrawing: createAction("flattenDrawing"),

  // Export/Import Options
  exportDrawingAsFile: createAction<{
    
    format: string,
    fileName: string;
    status: number;
    data: string | null
}>(
    "exportDrawingAsFile"
  ),
  importDrawingFromFile: createAction<{ file: File }>("importDrawingFromFile"),

  // Guides and Rulers
  toggleGuides: createAction<{ visible: boolean }>("toggleGuides"),
  addGuide: createAction<{ axis: "horizontal" | "vertical"; position: number }>(
    "addGuide"
  ),
  removeGuide: createAction<{
    axis: "horizontal" | "vertical";
    position: number;
  }>("removeGuide"),

  // Miscellaneous
  enableSnapToObjects: createAction<{ enabled: boolean }>(
    "enableSnapToObjects"
  ),
  adjustCanvasResolution: createAction<{ width: number; height: number }>(
    "adjustCanvasResolution"
    ),
  
  
  elementDroppedInSpecificArea: createAction<{
    x: number; y: number; elementId: string; areaId: string
  }>(
    "elementDroppedInSpecificArea"
  ),

  selectMilestones: createAction<{milestones: Milestone[]}>("selectMilestones"),
};
