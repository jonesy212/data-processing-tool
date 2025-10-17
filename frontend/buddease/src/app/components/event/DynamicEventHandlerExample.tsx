
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
import { BaseCustomEvent } from "./BaseCustomEvent";
import { CustomMouseEvent } from "@/app/services/EventService";

const dispatch = useDispatch();
// State and other logic...
const [state, setState] = useState("");
// Initialize the useErrorHandling hook
const useError = useErrorHandling();
// Define the subscription variable
const subscription = null; // You need to define subscription before passing it to cleanupState
const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });

// Define the type of the event parameter to match ReactiveEventHandler
type ReactiveClipboardEvent = React.ClipboardEvent<HTMLElement>;

type ReactiveBaseMouse = BaseSyntheticEvent & React.MouseEvent<HTMLElement, MouseEvent>
// Define the type of the event parameter to match ReactiveEventHandler
type ReactiveMouseEvent = React.MouseEvent<HTMLElement, MouseEvent> & {
  settings?: any;
  progress?: ProgressDataProps;
};

// | React.MouseEvent<HTMLDivElement, MouseEvent>;
type CustomEvent = MouseEvent | ClipboardEvent | SettingsEvent;

// Define a type for DynamicEventType
type DynamicEventType<T> = T extends EventType<infer U> ? EventType<U> : never;

// Example usage
type OriginalEventType = EventType<{ id: number; name: string }>;
type DynamicType = DynamicEventType<OriginalEventType>;

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

type EventType<T> = {
  type: string;
  payload: T;
};

// DynamicType will be equivalent to:
// {
//   type: string;
//   payload: { id: number; name: string };
// }

type ReactiveWheelEvent = WheelEvent & React.WheelEvent<Element>;
export type ReactiveEventHandler = Event &
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

const UI_API_URL = endpoints.uiSettings;

export type ReactiveEventListener = EventListenerOrEventListenerObject &
  ReactiveEventHandler;
export type ZoomWheelEventListener = ReactiveEventListener & ReactiveWheelEvent;



interface UnsubscribeDetails {
  userId: string;
  snapshotId: string;
  unsubscribeType: string;
  unsubscribeDate: Date;
  unsubscribeReason: string;
  unsubscribeData: any;
}

// const createEventHandler = createEventHandler;
const history = useNavigate();

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

const isReactiveEventHandler = (
  handler: ReactiveEventHandler | EventListenerOrEventListenerObject
): handler is ReactiveEventHandler => {
  return typeof (handler as any).preventDefault !== "undefined";
};

function handleEvent(e: CustomEvent) {
  if (e.type === "mouse") {
    const detail = (e as MouseEvent).detail;
    // Handle MouseEvent
  } else if (e.type === "clipboard") {
    const clipboardData = (e as ClipboardEvent).clipboardData;
    // Handle ClipboardEvent
  } else if (e.type === "settings") {
    const settings = (e as SettingsEvent).settings;
    // Handle SettingsEvent
  }
}

export const handleCryptoPaymentSelect = (cryptoOption: string) => {
  // Implement logic to handle the selected crypto payment option
  switch (cryptoOption) {
    case "Bitcoin":
      initiateBitcoinPayment();
      break;
    case "Ethereum":
      initiateEthereumPayment();
      break;
    // Add cases for other crypto payment options as needed
    default:
      console.error("Invalid crypto payment option");
  }
};

const handleKeyboardShortcuts = (
  event: React.KeyboardEvent<HTMLInputElement>
) => {
  switch (event.key) {
    case "Enter":
      console.log("Enter key pressed");
      break;
    case "Esc":
      console.log("Esc key pressed");
      break;
    default:
      console.log("Other key pressed");
    case "Shift":
      console.log("Shift key pressed");
  }
};

const resetStateVariables = () => {
  // reset state variables
  setState("");
};

const clearResources = (
  socket: WebSocket | null,
  subscription: Subscription<T, K> | null,
  unsubscribeDetails?: UnsubscribeDetails
) => {

  if (subscription && unsubscribeDetails) {
   
    cleanupSubscriptions(subscription, unsubscribeDetails);
    if (socket !== null) {
      cleanupSocketConnection(socket);
    }
  }
  resetStateVariables();
};

const cleanupState = (subscription: any) => {
  // Use the useWebSocket hook to manage WebSocket connection
  const { socket, sendMessage } = useWebSocket("ws://example.com");

  // Clean up any state variables or resources

  // For example, reset state variables to their initial values
  // or clear any resources that are no longer needed
  resetStateVariables();

  // Adjust the types of socket and subscription
  const adjustedSocket: WebSocket | null = socket as WebSocket | null;
  clearResources(adjustedSocket, subscription);
};

const cleanupSubscriptions = (
  subscription: Subscription<T, K> | null,
  unsubscribeDetails?: UnsubscribeDetails,
) => {

  // Clean up any subscriptions
  if (subscription && unsubscribeDetails) {
    subscription.unsubscribe(snapshotId, unsubscribeDetails, callback);
  }
};

const cleanupSocketConnection = (socket: WebSocket) => {
  if (socket) {
    socket.close();
  }
};

const closeConnections = (
  socket: WebSocket,
  subscription: Subscription<T, K>| null,
  unsubscribeDetails?: UnsubscribeDetails
) => {
  // Close any open connections

  if (socket) {
    socket.close();
  }

  if (subscription && unsubscribeDetails) {
    subscription.unsubscribe(unsubscribeDetails);
  }
};

// Then call cleanupState with the subscription argument
cleanupState(subscription);

const handleUnload = (
  event: Event,
  roomId: string,
  retryConfig: RetryConfig
) => {
  const socket = getSocketConnection(roomId, retryConfig);

  // Logic for unload event
  console.log("Page unloaded");

  // Clean up any state, subscriptions, or connections
  cleanupState(subscription);
  cleanupSubscriptions(subscription);

  if (socket) {
    closeConnections(socket, subscription);
    cleanupSocketConnection(socket);
    socket.close();
  }
};

const handleSelect = (
  event: React.ChangeEvent<HTMLSelectElement>,
  handler: (event: React.ChangeEvent<HTMLSelectElement>) => void
) => {
  handler(event);
};

const handleButtonClick = (
  event: React.MouseEvent<HTMLButtonElement>,
  handler: (event: React.MouseEvent<HTMLButtonElement>) => void
) => {
  handler(event);
};

const handleDivMouseMove = (
  event: Event & React.MouseEvent<HTMLDivElement>,
  handler: (event: React.MouseEvent<HTMLDivElement>) => void
) => {
  handler(event);
};

const handleScrolling = (event: React.UIEvent<HTMLDivElement>) => {
  // Logic for handling scrolling
  const scrollTop = event.currentTarget.scrollTop;

  // Your custom logic for scrolling
  console.log("Scrolling event detected!");
  console.log("Scroll position:", scrollTop);

  // Update UI or state based on scroll position
  UIActions.updateScrollingState(scrollTop);
};

const handleAnnotations = (
  event: React.SyntheticEvent<Element, Event> | CustomMouseEvent
) => {
  // Logic for handling annotations
  // Accessing annotation-related information
  const annotationDetails =
    event.currentTarget?.getAttribute("data-annotation");

  // Your custom logic for handling annotations
  console.log("Handling annotations:");
  console.log("Annotation Details:", annotationDetails);

  //  update UI based on annotations or trigger further actions.
  const messageId = UniqueIDGenerator.generateMessageID();
  const message: WritableDraft<Partial<Message>> = {
    id: messageId,
    content: `You annotated: ${annotationDetails || ""}`,
  };
  addMessage(message as WritableDraft<Message>);
  // Add UI update or other logic specific to annotations
  updateUI(annotationDetails || "");

  // Add UI update or other logic specific to annotations
  function updateUI(details: string) {
    const annotationDetailsElement =
      document.getElementById("annotationDetails");
    if (annotationDetailsElement) {
      annotationDetailsElement.innerText = details;
    }
  }
  // update annotation details element with empty string to clear it
  if (annotationDetails) {
    const annotationDetailsElement =
      document.getElementById("annotationDetails");
    if (annotationDetailsElement) {
      annotationDetailsElement.innerText = "";
    }
  }
};

const processCopiedText = async (
  text: string,
  analysisType: AnalysisTypeEnum,
  event?: React.ClipboardEvent<HTMLDivElement>
): Promise<void> => {
  try {
    let sentiment: AxiosResponse<any, any>;

    // Perform sentiment analysis based on the specified analysis type
    switch (analysisType) {
      case AnalysisTypeEnum.SENTIMENT:
        sentiment =
          await ApiAnalysis.apiAnalysisService.performSentimentAnalysis(text);
        break;
      case AnalysisTypeEnum.DESCRIPTIVE:
        sentiment =
          await ApiAnalysis.apiAnalysisService.performDescriptiveAnalysis(text);
        break;
      // Add cases for other analysis types as needed
      default:
        throw new Error("Invalid analysis type");
    }

    // Dispatch an action to handle the sentiment analysis result
    dispatch(ContentActions.handleSentimentAnalysis(sentiment.data));
  } catch (error) {
    // Handle any errors that occur during sentiment analysis
    console.error("Error during sentiment analysis:", error);
  }
  if (!event) {
    console.error("No clipboard event provided.");
    return;
  }

  const copiedText = event.clipboardData?.getData("text"); // Retrieve copied text

  if (!copiedText) {
    console.log("No text copied.");
    return;
  }

  if (copiedText) {
    const analysisType = AnalysisTypeEnum.SENTIMENT;
    // Process the copied text, such as formatting or analyzing it
    const processedText = processCopiedText(copiedText, analysisType);
    console.log("Processed Copied Text:", processedText);

    // Update the UI based on the copied text, e.g., display a notification or apply styles
    updateUIWithCopiedText(processedText);

    updateUI;
    // Perform action on paste like adding to clipboard history
    historyManagerStore().addToClipboardHistory(copiedText);
  } else {
    console.log("No text copied.");
  }
};

export const handleSorting = (
  event: React.MouseEvent<HTMLButtonElement>,
  sortingType: SortingType
) => {
  // Logic for handling sorting
  console.log("Sorting event detected!");
  console.log("Sorting type:", sortingType);

  // Update sorting state and re-render list
  dispatch(ListActions.updateSorting(sortingType));
};
const handleSettingsPanel: MouseEventHandler<HTMLButtonElement> = (
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>
): void => {
  const dispatch = useDispatch(); // Initialize useDispatch hook

  // Logic for handling settings panel
  console.log("Handling settings panel:", event);

  // Additional logic for settings panel...
  // For example, you can toggle the visibility of the settings panel or perform other actions based on the event

  // Example: Toggle visibility of settings panel
  const settingsPanel = document.getElementById("settings-panel");
  if (settingsPanel) {
    if (settingsPanel.style.display === "none") {
      // Show the settings panel
      settingsPanel.style.display = "block";
    } else {
      // Hide the settings panel
      settingsPanel.style.display = "none";
    }
  }

  // Dispatch action to update settings panel state
  dispatch(
    UIActions.updateSettingsPanelState({
      settings: {
        isOpen: !event.currentTarget.dataset.isOpen,
      },
    })
  );
};

// Function to check if the event is of type ReactiveMouseEvent
function isReactiveMouseEvent(event: any): event is ReactiveMouseEvent {
  return (event as ReactiveMouseEvent).settings !== undefined;
}

const handleHelpFAQ = (
  event: React.SyntheticEvent | Event
) => {
  // Common logic for handling help/FAQ
  console.log("Handling help/FAQ:", event);

  // Check if the event is a ReactiveMouseEvent and if the settings property exists
  if (isReactiveMouseEvent(event)) {
    // Toggle help/FAQ panel open/close
    UIActions.toggleHelpFAQPanel(!event.settings.helpFAQ.isOpen);

    // Dispatch action to update help/FAQ panel state
    dispatch(
      UIActions.updateHelpFAQPanelState({
        helpFAQ: {
          ...event.settings.helpFAQ,
          isOpen: !event.settings.helpFAQ.isOpen,
        },
      })
    );
  } else {
    // Example: Open a modal with help/FAQ content
    const helpFAQModal = document.getElementById("help-faq-modal");
    if (helpFAQModal) {
      // Open the modal
      helpFAQModal.classList.add("open");
    }
  }
};

const createEventHandler =
  (
    eventName: string,
    customLogic?: (event: React.MouseEvent<HTMLElement> | MouseEvent) => void
  ) =>
  (event: React.MouseEvent<HTMLElement> | MouseEvent) => {
    const message: Partial<Message> = {
      content: `Event '${eventName}' occurred. Details: ${JSON.stringify(
        event
      )}`,
    };
    if (customLogic) {
      customLogic(event); // Invoke custom logic if provided
    }
  };

const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
  const { clientX, clientY } = event;

  dispatch(
    DragActions.dragStart({
      clientX: clientX,
      clientY: clientY,
      highlightEvent: event,
    })
  );

  // Update UI to indicate dragging has started
  const draggedElement = event.currentTarget as HTMLDivElement;
  draggedElement.classList.add("dragging");

  // Set the drag data
  event.dataTransfer.setData("text", "Some drag data");

  // Prevent default drag behaviors like selecting text
  event.preventDefault();
  // Start dragging
  draggedElement.draggable = true;
  // Prevent default drag behaviors like selecting text
  event.preventDefault();

  // Use the useDrag hook to handle drag events
  const { beginDrag } = useDrag(
    "uniqueId", // Provide a unique ID for the drag item
    "yourDragType", // Specify the drag type
    () => {
      // Callback for drag start
      console.log("Drag started");
      // Additional logic for drag start...
      const draggedElement = document.getElementById("draggedElement");
      if (draggedElement) {
        draggedElement.classList.add("dragging");
      }
    },
    (dragX: number, dragY: number) => {
      // Callback for drag move
      console.log(`Drag moved to: (${dragX}, ${dragY})`);
      // Additional logic for drag move...
    },
    (finalX: number, finalY: number) => {
      // Callback for drag end
      console.log(`Drag ended at: (${finalX}, ${finalY})`);
      // Additional logic for drag end...
    },
    (x: number) => {
      // Callback for setting drag X coordinate
      console.log(`Setting drag X coordinate: ${x}`);
      // Additional logic for setting drag X coordinate...
    },
    (y: number) => {
      // Callback for setting drag Y coordinate
      console.log(`Setting drag Y coordinate: ${y}`);
      // Additional logic for setting drag Y coordinate...
    }
  );

  // Call the beginDrag function to start dragging
  beginDrag(event.nativeEvent);
};



const handleDragEnd = createEventHandler("dragend", (event) => {
  const draggedElement = document.getElementById("draggedElement");
  if (draggedElement) {
    draggedElement.classList.remove("dragging");
  }
})

const handleDragEnter = createEventHandler("dragenter", (event) => {
  const draggedElement = document.getElementById("draggedElement");
  if (draggedElement) {
    draggedElement.classList.add("dragging");
  }
  console.log("Drag enter handled");
});


const handleDragOver = createEventHandler("dragover", (event) => {
  event.preventDefault();
  console.log("Drag over handled");
});

const handleClickOutside: React.MouseEventHandler<HTMLElement> = (
  event: React.MouseEvent<HTMLElement, MouseEvent>
) => {
  // Logic for handling click outside of component
  console.log("Click outside handled");
};

// Define handleHighlighting as a function that accepts a MouseEvent parameter
const handleHighlighting = (
event: React.MouseEvent<HTMLElement, MouseEvent> | MouseEvent
) => {
  // Logic for handling text selection/highlighting
  console.log("Handling text highlighting:", event);

  const selection = window.getSelection();
  // Update UI to show highlighted text
  const highlightedTextElement = document.getElementById("highlightedText");
  if (highlightedTextElement && selection) {
    highlightedTextElement.innerHTML = selection.toString();
  }
};

const handleCopyPaste = (event: React.ClipboardEvent<HTMLDivElement> | ClipboardEvent) => { 
  // Logic for handling copy/paste events
  console.log("Text copied/pasted:", event);

  // Get current selection
  const selection = window.getSelection();

  // Update UI with copied/pasted text
  const copiedPastedTextElement = document.getElementById("copie-pasted-text");
  if (copiedPastedTextElement && selection) {
    copiedPastedTextElement.innerHTML = selection.toString();
  }

}

const handleMouseClick = (event: React.MouseEvent<HTMLDivElement>) => {
  // Logic for mouse click event
  console.log("Mouse clicked");

  // Additional logic for mouse click event
  // For example, you can change the background color of the clicked div
  const clickedDiv = event.currentTarget;
  clickedDiv.style.backgroundColor = "lightblue";
};

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  try {
    // Logic for beforeunload event
    console.log("Before page unload");

    // Save crypto portfolio data before the page unloads
    saveCryptoPortfolioData();

    // Prompt the user to confirm before leaving the page
    event.preventDefault();
    event.returnValue =
      "Are you sure you want to leave? Your crypto portfolio data may not be saved.";
  } catch (error) {
    // Handle errors gracefully
    console.error("Error handling beforeunload event:", error);
  }
};

const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
  // Logic for touch start event
  console.log("Touch started");

  // Additional logic for touch start event
  const touchedElement = event.currentTarget;
  if (touchedElement) {
    touchedElement.classList.add("touched");
    console.log("Element touched");
  }

  // Prevent default touch start behaviors
  event.preventDefault();
};

// Touch Move Event Handler
const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
  // Logic for touch move event
  console.log("Touch moved");

  // Additional logic for touch move event
  // Implement specific actions based on touch movement

  // Example: Calculate touch coordinates
  const touchX = event.touches[0].clientX;
  const touchY = event.touches[0].clientY;

  // Example: Update UI based on touch coordinates
  if (touchX > 500 && touchY < 200) {
    // If touch is in a specific area of the screen
    UIActions.setLoading(true); // Set loading state to true
  } else {
    UIActions.setLoading(false); // Set loading state to false
  }
};




// Touch End Event Handler
const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
  // Logic for touch end event
  console.log("Touch ended");

  // Additional logic for touch end event
  // Implement specific actions based on touch ending

  // Example: Set loading state to false as touch ended
  UIActions.setLoading(false); // Set loading state to false when touch ends
};

// Touch Cancel Event Handler
const handleTouchCancel = (event: React.TouchEvent<HTMLDivElement>) => {
  // Logic for touch cancel event
  console.log("Touch canceled");

  // Additional logic for touch cancel event
  // Implement specific actions based on touch canceling

  // Example: Reset any state or action related to touch operation
  UIActions.setLoading(false); // Set loading state to false in case of touch cancel
  UIActions.setError("Touch operation canceled"); // Set an error message indicating touch operation was canceled
};




const generateNextPhaseRoute = (condition: boolean, dynamicData: any): string => {
  // Logic to generate the next phase route based on condition and dynamic data
  if (condition) {
    // For example, if condition is true, append dynamic data to the route
    return `/next-phase/${dynamicData}`;
  } else {
    // Otherwise, return a default route
    return '/default-next-phase-route';
  }
};

const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
  // Logic for pointer down event
  console.log("Pointer down");

  // Example: Set isPointerDown state to true
  UIActions.setIsPointerDown(true);
  // Additional logic for pointer down event
  // Implement specific actions based on pointer down event

  // todo for usebe in the future in other parts of the app
  // Additional logic for pointer down event

  // Example 1: Change the background color of the div
  event.currentTarget.style.backgroundColor = "lightblue";

  // Declare pointerPosition before using it
  const pointerPosition: { x: number; y: number } = { x: 0, y: 0 };
  // Example 2: Fetch additional data or perform an API call
  UIApi.fetchUIData(`${UI_API_URL}`, {
    pointerPosition: pointerPosition,
  });

  // Example 3: Update the state to track the pointer position
  const updatedPointerPosition = { x: event.clientX, y: event.clientY };
  setPointerPosition(updatedPointerPosition);

  const condition: boolean = true; // or false, depending on your logic
  const dynamicData: any = "exampleDynamicData"; // Assign any appropriate value

  // Example 4: Trigger a navigation or route change
  const newRoute = generateNextPhaseRoute(condition, dynamicData);
  history(newRoute); // Navigate to the new route using history

  // Example 5: Dispatch a Redux action
  dispatch({ type: "POINTER_DOWN", payload: { event } });
};






// Define state using useState hook
const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
  // Logic for pointer move event
  console.log("Pointer moved");

  // Example: Track pointer position
  const newPointerPosition = {
    x: event.clientX,
    y: event.clientY,
  };

  // Example: Update pointer position state using action
  UIActions.setPointerPosition(newPointerPosition);

  // Example: Call UIActions to update pointer position
  UIActions.setPointerPosition(newPointerPosition);

  // Prevent default pointer behavior like text selection
  event.preventDefault();
  // Additional logic for pointer move event
};






const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
  // Logic for pointer up event
  console.log("Pointer up");

  // Example: Set isPointerDown state to false
  UIActions.setIsPointerDown(false);

  // Additional logic for pointer up event
  // Example: Reset any state changes made on pointer down
  UIActions.setIsPointerDown(false);

  // Example: Reset pointer position state
  UIActions.setPointerPosition({ x: 0, y: 0 });

  // Additional real-world logic: Hide a tooltip when pointer is canceled
  TooltipActions.hideTooltip();
};





const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
  // Logic for pointer cancel event
  console.log("Pointer canceled");

  // Example: Reset any state changes made on pointer down or move
  UIActions.setIsPointerDown(false);
  UIActions.setPointerPosition({ x: 0, y: 0 });

  // Additional real-world logic: Hide a tooltip when pointer is canceled
  TooltipActions.hideTooltip();
};





const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
  // Logic for pointer enter event
  console.log("Pointer entered");

  // Example: Update state to indicate pointer is within bounds
  UIActions.setIsPointerInside(true);

  // Additional real-world logic: Show a tooltip when pointer enters the element
  TooltipActions.showTooltip("Hover over me for more information");
};




const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
  // Logic for pointer leave event
  console.log("Pointer left");

  const newPointerPosition = {
    x: 0,
    y: 0,
  };

  newPointerPosition.x = 0;

  // Example: Update state to indicate pointer is no longer within bounds
  UIActions.setIsPointerInside(false);
};




const handlePointerOver = (event: React.PointerEvent<HTMLDivElement>) => {
  // Logic for pointer over event
  console.log("Pointer over");

  // Example: Update state to indicate pointer is hovering
  UIActions.setIsPointerHovering(true);

  // Prevent default pointer behavior like text selection
  event.preventDefault();

  // Additional logic for pointer over event
  // Set pointer position to current client coordinates
  UIActions.setPointerPosition({
    x: event.clientX,
    y: event.clientY,
  });
};




const handlePointerOut = (event: React.PointerEvent<HTMLDivElement>) => {
  // Logic for pointer out event
  console.log("Pointer out");

  // Example: Update state to indicate pointer is no longer hovering
  UIActions.setIsPointerHovering(false);

  // Additional logic for pointer out event
  // Reset pointer position
  UIActions.setPointerPosition({ x: 0, y: 0 });
};






const handleAuxClick = (event: React.MouseEvent<HTMLDivElement>) => {
  // Declare isAuxClicked variable or access it from the appropriate state management system
  const isAuxClicked = true; // Example: You can initialize it with a default value or access it from state

  // Logic for auxiliary click event
  console.log("Auxiliary click");

  // Example: Toggle some state
  UIActions.setIsAuxClicked(!isAuxClicked);
  // Prevent default behavior like text selection
  event.preventDefault();
};

const handleGestureStart = (event: React.TouchEvent<HTMLDivElement>) => {
  // Logic for gesture start event
  console.log("Gesture started");

  // Example: Update state to indicate gesture in progress
  UIActions.setIsGestureInProgress(true);
  // clear any previous gesture state
  UIActions.setGestureStartPosition({ x: 0, y: 0 });
};

const handleGestureChange = (event: React.TouchEvent<HTMLDivElement>) => {
  // Logic for gesture change event
  console.log("Gesture changed");

  // Track current gesture position
  const currentPosition = {
    x: event.touches[0].clientX,
    y: event.touches[0].clientY,
  };

  // Update gesture position state
  UIActions.setGestureCurrentPosition(currentPosition);
};

const handleGestureEnd = (event: React.TouchEvent<HTMLDivElement>) => {
  // Logic for gesture end event
  console.log("Gesture ended");
  // Example: Update state to indicate gesture is complete
  UIActions.setIsGestureInProgress(false);
  // Reset gesture state
  UIActions.setGestureCurrentPosition({ x: 0, y: 0 });
  UIActions.setGestureStartPosition({ x: 0, y: 0 });
  UIActions.setIsGestureInProgress(false);
};

const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
  // Logic for context menu event
  console.log("Context menu triggered");

  // Prevent default context menu from opening
  event.preventDefault();

  // Example: Dispatch action to show custom context menu
  ContextMenuActions.showContextMenu({
    event,
    items: [
      {
        label: "Copy",
        action: (selectedText: string) => {
          // Handle copy action
          ContextMenuActions.copyToClipboard({ text: selectedText });
        },
      },
      {
        label: "Share",
        action: (selectedText: string) => {
          // Handle share action
          ContextMenuActions.shareText({ text: selectedText });
        },
      },
      {
        label: "Close",
        action: () => {
          // Handle close action
          ContextMenuActions.hideContextMenu();
        },
      },
      {
        label: "Close Context Menu",
        action: () => {
          // Handle close context menu action
          ContextMenuActions.hideContextMenu();
        },
      },
    ],
  });
};

const handleDynamicEvent = (
  eventType: DynamicEventType<OriginalEventType>,
  event: React.PointerEvent<HTMLDivElement> & React.TouchEvent<HTMLDivElement>
) => {
  switch (eventType.type) {
    case "pointerenter":
      return handlePointerEnter(event);
    case "pointerleave":
      return handlePointerLeave(event);
    case "pointerover":
      return handlePointerOver(event);
    case "pointerout":
      return handlePointerOut(event);
    case "gesturestart":
      return handleGestureStart(event);
    case "gesturechange":
      return handleGestureChange(event);
    case "gestureend":
      return handleGestureEnd(event);
    case "contextmenu":
      return handleContextMenu(event);
    default:
      return;
  }
};

// Handle specific actions based on the type of app
const handleAppSpecificActions = (selectedText: string | null) => {
  if (selectedText) {
    switch (currentAppType) {
      case "Text Editing App":
        // Dispatch action to show formatting options or context menu
        UIActions.setShowModal(true);
        break;
      case "Search App":
        // Dispatch action to trigger a search based on the selected text
        UIActions.setNotification({
          message: "Initiating search...",
          type: "info",
        });
        SearchActions.initiateSearch(selectedText);
        break;
      case "Document Analysis App":
        // Dispatch action to analyze the selected text
        UIActions.setLoading(true);
        DataAnalysisActions.analyzeText(selectedText);
        break;
      default:
        console.log("No specific actions defined for the current app.");
    }
  } else {
    console.log("No text selected. No specific actions to perform.");
  }
};


export { generateNextPhaseRoute };
export type { CustomEventListener, UnsubscribeDetails, CustomEvent };

function stopImmediatePropagation(
  event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
): void {
  event.stopPropagation(); // Stop the propagation of the event
  event.nativeEvent.stopImmediatePropagation(); // Stop the immediate propagation of the event
}

// Example usage:
// Pass settings data when calling handleSettingsPanel
// handleSettingsPanel(event, { isOpen: true });
