// DragActions.ts

import { createAction } from "@reduxjs/toolkit";

export const DragActions = {
    // Drag start action
  dragStart: createAction<{
    highlightEvent: React.MouseEvent<HTMLDivElement, MouseEvent>;
    clientX: number; clientY: number
  }>("dragStart"),
    // Drag move action
    dragMove: createAction<{ dragX: number; dragY: number }>("dragMove"),
    // Drag end action
  dragEnd: createAction<{ finalX: number; finalY: number }>("dragEnd"),
    
  dragReset: createAction("dragReset")
};
  
