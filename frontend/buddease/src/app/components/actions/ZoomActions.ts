// ZoomActions.ts

import { createAction } from "@reduxjs/toolkit";




export const ZoomActions = {
    zoomIn: createAction<number>("zoomIn"),

  zoomOut: createAction<number>("zoomOut"),

  resetZoom: createAction("resetZoom")


}