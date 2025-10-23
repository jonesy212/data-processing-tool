import { ContextMenuActions } from "@/app/actions/ContextMenuActions";
import { DragActions } from "@/app/actions/DragActions";
import { ListActions } from "@/app/actions/ListActions";
import { SearchActions } from "@/app/actions/SearchActions";
import { TooltipActions } from "@/app/actions/TooltipActions";
import { UIActions } from "@/app/actions/UIActions";
import * as ApiAnalysis from "@/app/api/service/ApiAnalysisService";
import { endpoints } from '@/app/api/endpointConfigurations';
import { EventDetails } from "@/app/calendar/CalendarEventViewingDetails";
import getSocketConnection from "@/app/communication/getSocketConnection";

import { SearchResultWithQuery } from "@/app/components/routing/SearchResult";
import { saveCryptoPortfolioData } from "@/app/documents/editing/autosave";
import updateUI, { updateUIWithCopiedText } from "@/app/documents/editing/updateUI";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { currentAppType } from "@/app/hooks/getCurrentAppType";
import useErrorHandling from "@/app/hooks/useErrorHandling";
import useWebSocket from "@/app/hooks/useWebSocket";
import { useDrag } from "@/app/libraries/animations/DraggableAnimation/useDrag";
import ReusableButton from "@/app/libraries/ui/buttons/ReusableButton";
import { BlogActions } from "@/app/models/blogs/BlogAction";
import { ProgressDataProps } from "@/app/components/models/data/ProgressData";
import { SortingType } from "@/app/models/data/StatusType";
import { K, T } from "@/app/models/data/dataStoreMethods";
import {
  initiateBitcoinPayment,
  initiateEthereumPayment,
} from "@/app/payment/initCryptoPayments";
import { PhaseActions } from "@/app/actions/phases/PhaseActions";
import { AnalysisTypeEnum } from "@/app/typings/AnalysisType";
import { DataAnalysisActions } from "@/app/actions/DataAnalysisActions";
import { brandingSettings } from "@/app/branding/BrandingSettings";
import { ContentActions } from "@/app/actions/ContentActions";
import { sanitizeData, sanitizeInput } from '@/app/models/cypto/SanitizationFunctions'
import { WritableDraft } from "@/app/state/redux/ReducerGenerator";
import { addMessage } from "@/app/state/redux/slices/ChatSlice";
import { DetailsItem } from "@/app/state/stores/DetailsListStore";
import { historyManagerStore } from "@/app/state/stores/HistoryStore";
import { Subscription } from "@/app/subscriptions/Subscription";
import { UIApi } from "@/app/users/APIUI";
import { snapshotId } from "@/app/utils/snapshotUtils";
import { RetryConfig } from "@/app/services/ConfigurationService";
import { AxiosResponse } from "axios";
import { callback } from 'chart.js/helpers';
import { Router, useRouter } from "next/router";
import React, {
  BaseSyntheticEvent,
  MouseEventHandler,
  SyntheticEvent,
  UIEvent,
  UIEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { GestureHandlerGestureEvent } from "react-native-gesture-handler";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as apiSnapshot from "@/app/api/SnapshotApi";
import { BaseCustomEvent } from "@/app/events/BaseCustomEvent";
import { CustomMouseEvent } from "@/app/services/EventService";
import { EventHandler, EventFilter } from '@/app/typings/eventHandlers/eventTypes'

// Define the type of the event parameter to match ReactiveEventHandler
type ReactiveClipboardEvent = React.ClipboardEvent<HTMLElement>;

type ReactiveBaseMouse = BaseSyntheticEvent & React.MouseEvent<HTMLElement, MouseEvent>

// Define the type of the event parameter to match ReactiveEventHandler
type ReactiveMouseEvent = React.MouseEvent<HTMLElement, MouseEvent> & {
  settings?: any;
  progress?: ProgressDataProps;
};

// React.MouseEvent<HTMLDivElement, MouseEvent>;
type CustomEvent = MouseEvent | ClipboardEvent | SettingsEvent;

// Define a type for DynamicEventType
type DynamicEventType<T> = T extends EventType<infer U> ? EventType<U> : never;

// Example usage
type OriginalEventType = EventType<{ id: number; name: string }>;
type DynamicType = DynamicEventType<OriginalEventType>;




type EventType<T> = {
  type: string;
  payload: T;
};


type ReactiveWheelEvent = WheelEvent & React.WheelEvent<Element>;
type ReactiveEventHandler = Event &
  KeyboardEvent &
  MouseEvent &
  React.SyntheticEvent &
  React.KeyboardEvent<HTMLInputElement> &
  React.WheelEvent<HTMLDivElement> &
  React.MouseEvent<HTMLButtonElement> &
  KeyboardEvent &
  CustomEventHandler &
  BaseCustomEvent &
  DetailsItem<EventDetails> &
  React.MouseEvent<HTMLElement, MouseEvent> &
  SearchResultWithQuery<Document> &
  React.MouseEvent<HTMLElement, MouseEvent>;



export type ReactiveEventListener = EventListenerOrEventListenerObject &
  ReactiveEventHandler;
export type ZoomWheelEventListener = ReactiveEventListener & ReactiveWheelEvent;




interface SettingsEvent extends Event {
  settings: any; // Define the type of the 'settings' property
}

interface CustomEventHandler {
  settings: CustomEventSettings;
  support: (event: ReactiveEventHandler) => {
    // handle event based on settings
  };
  // helpFAQ: CustomEventSettings
}

interface ExtendedMouseEvent<T = HTMLElement> extends React.MouseEvent<T> {
  stopImmediatePropagation?: () => void;
}

interface CustomEventSettings {
  element: HTMLElement;
  eventName: string;
  isOpen: boolean;
  helpFAQ: CustomEventSettings;
  // helpFAQ: string;
}



interface UnsubscribeDetails {
  userId: string;
  snapshotId: string;
  unsubscribeType: string;
  unsubscribeDate: Date;
  unsubscribeReason: string;
  unsubscribeData: any;
}


export interface EventListener<T = any> {
  id: string;
  handler: EventHandler<T>;
  filter?: EventFilter<T>;
  once?: boolean;
}

interface CustomEventListener extends EventListener {
  createEventHandler: (
    eventName: string,
    handler: (event: ReactiveEventHandler) => void
  ) => EventListenerOrEventListenerObject;

  handleMouseClick: (event: ReactiveEventHandler) => void;
  handleKeyboardEvent: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  handleSorting: (event: React.MouseEvent<HTMLElement>) => void;
  handleMouseEvent: (event: ReactiveEventHandler) => void;
  handleKeyboardShortcuts: (event: React.SyntheticEvent) => void;
  handleScrolling: (event: Event) => void;
  handleHighlighting: (
    event: React.MouseEvent<HTMLElement, MouseEvent>
      | MouseEvent | Event
  ) => void;
  handleAnnotations: (event: React.MouseEvent<HTMLElement>) => void;
  handleCopyPaste: (event: React.ClipboardEvent<HTMLDivElement>) => void;
  handleZoom: (
    event: React.WheelEvent<HTMLDivElement>
  ) => ReactiveEventListener;
  handleDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLElement>) => void;
  handleDragEnd: (event: React.DragEvent<HTMLElement>) => void;
  handleDragEnter: (event: React.DragEvent<HTMLElement>) => void;

  handleDragLeave: (event: React.DragEvent<HTMLElement>) => void;
  handleFocus: (event: React.FocusEvent<HTMLElement>) => void;
  handleBlur: (event: React.FocusEvent<HTMLElement>) => void;
  handleFocusIn: (event: React.FocusEvent<HTMLElement>) => void;
  handleFocusOut: (event: React.FocusEvent<HTMLElement>) => void;
  handleResize: (event: React.UIEvent<HTMLDivElement, UIEvent>) => void;
  handleSelect: (event: React.SyntheticEvent) => void;
  handleUnload: (event: BeforeUnloadEvent) => void;
  handleBeforeUnload: (event: BeforeUnloadEvent) => void;
  handleTouchStart: (event: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchMove: (event: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchEnd: (event: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchCancel: (event: React.TouchEvent<HTMLDivElement>) => void;
  handlePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerEnter: (event: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerLeave: (event: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerOver: (event: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerOut: (event: React.PointerEvent<HTMLDivElement>) => void;
  handleAuxClick: (event: React.MouseEvent<HTMLDivElement>) => void;

  handleUndoRedo: (event: React.SyntheticEvent) => void;
  handleContextMenus: (event: React.MouseEvent<HTMLElement>) => void;

  handleSettingsPanel: (event: React.MouseEvent<HTMLElement>) => void;
  handleFullscreenMode: (event: React.MouseEvent<HTMLElement>) => void;
  handleHelpFAQ: (event: React.MouseEvent<HTMLElement>) => void;
  handleSearchFunctionality: (event: React.MouseEvent<HTMLElement>) => void;
  handleProgressIndicators: (event: React.MouseEvent<HTMLElement>) => void;
  handleGestureStart: (event: GestureHandlerGestureEvent) => void;
  handleGestureChange: (event: GestureHandlerGestureEvent) => void;
  handleGestureEnd: (event: GestureHandlerGestureEvent) => void;
}


export type { 
    CustomEventListener, UnsubscribeDetails, 
    CustomEvent, ReactiveEventHandler, ReactiveClipboardEvent
    ReactiveBaseMouse, ReactiveMouseEvent, DynamicType,
    ExtendedMouseEvent 
};
