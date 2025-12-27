// app/utils/eventHandlers/SpecializedHandlers.ts
import { MouseEventListener, KeyboardEventListener } from "@/app/typings/eventHandlers/eventTypes";
import { 
  BaseEventListener,
  MouseEventListener,
  KeyboardEventListener,
  DragDropEventListener,
  FocusEventListener,
  TouchEventListener,
  UIComponentEventListener,
  AppEventListener,
  LifecycleEventListener,
  GestureEventListener,
  EventHandlerFactory,
  EventHandler,
  EventFilter,
  ReactiveEventHandler,
  EventHandlerConfig,
  CustomEventListener // Keep for backward compatibility if needed
} from "@/app/typings/eventHandlers/eventTypes";

import {
  GestureHandlerGestureEvent
} from "react-native-gesture-handler";

import React from "react";

// Type imports
import type { BaseSyntheticEvent } from "react";
import type { EventListenerOrEventListenerObject } from "@/app/typings/eventHandlers/eventTypes";
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