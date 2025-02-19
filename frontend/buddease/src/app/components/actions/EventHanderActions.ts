// SelectActions

import { createAction } from "@reduxjs/toolkit";
import { MouseEvent } from "react";


export const EventHandlerActions = {
    handleKeyDown: createAction<KeyboardEvent>('handleKeyDown'),

  handleKeyUp: createAction<KeyboardEvent>('handleKeyUp'),

  handleClick: createAction<MouseEvent>('handleClick'),

    handleDoubleClick: createAction<MouseEvent>('handleDoubleClick'),
  
    handleKeyboardShortcuts: createAction<{event: KeyboardEvent, sanitizedInput: string}>('handleKeyboardShortcuts'),
}