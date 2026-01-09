// app/utils/eventHandlers/SpecializedHandlers.ts
import { KeyboardEventListener, MouseEventListener, ReactiveEventHandler } from '@/core/typings/eventHandlers/eventTypes';


import React from 'react';

// Type imports
// Only implement what you need
export class MouseOnlyHandler implements MouseEventListener {
  handleMouseClick = (event: ReactiveEventHandler) => {
    console.log("Mouse click handled");
  };
  
  handleMouseEvent = (event: ReactiveEventHandler) => {
    console.log("Mouse event handled");
  };
  
  handleSorting = (event: React.MouseEvent<HTMLElement>) => {
    console.log("Sorting handled");
  };
  
  handleContextMenus = (event: React.MouseEvent<HTMLElement>) => {
    console.log("Context menu handled");
  };
  
  handleAuxClick = (event: React.MouseEvent<HTMLDivElement>) => {
    console.log("Aux click handled");
  };
  
  // No need to implement keyboard, drag, etc. methods
}

export class KeyboardOnlyHandler implements KeyboardEventListener {
  handleKeyboardEvent = (event: React.KeyboardEvent<HTMLDivElement>) => {
    console.log("Keyboard event handled");
  };
  
  handleKeyboardShortcuts = (event: React.SyntheticEvent) => {
    console.log("Keyboard shortcuts handled");
  };
}