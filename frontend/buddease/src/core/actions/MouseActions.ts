// MouseActions.ts

import { createAction } from "@reduxjs/toolkit";

export const MouseActions = {
  mouseDown: createAction<MouseEvent>("mouseDown"),
  mouseUp: createAction<MouseEvent>("mouseUp"),
  mouseMove: createAction<MouseEvent>("mouseMove"),
    mouseEnter: createAction<MouseEvent>("mouseEnter"),
    mouseLeave: createAction<MouseEvent>("mouseLeave"),
    mouseOver: createAction<MouseEvent>("mouseOver"),
    mouseOut: createAction<MouseEvent>("mouseOut"),
  
}