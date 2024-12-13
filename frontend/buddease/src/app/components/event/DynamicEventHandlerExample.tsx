import { endpoints } from "@/app/api/ApiEndpoints";
import { searchAPI } from "@/app/api/ApiSearch";
import { constructTarget } from "@/app/api/EndpointConstructor";
import { SearchResultWithQuery } from "@/app/components/routing/SearchResult";
import { RetryConfig } from "@/app/configs/ConfigurationService";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { useDrag } from "@/app/libraries/animations/DraggableAnimation/useDrag";
import { ExtendedRouter } from "@/app/pages/MyAppWrapper";
import { DocumentActions } from "@/app/tokens/DocumentActions";
import { useAppSelector } from "@/app/utils/useAppSelector";
import { AxiosResponse } from "axios";
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
import * as ApiAnalysis from "../../api/ApiAnalysisService";
import { BookmarkActions } from "../actions/BookMarkActions";
import { CalendarActions } from "../actions/CalendarEventActions";
import { ContextMenuActions } from "../actions/ContextMenuActions";
import { DragActions } from "../actions/DragActions";
import { DrawingActions } from "../actions/DrawingActions";
import { EventHandlerActions } from "../actions/EventHanderActions";
import { ListActions } from "../actions/ListActions";
import { MeetingActions } from "../actions/MeetingActions";
import { ProjectActions } from "../actions/ProjectActions";
import { SearchActions } from "../actions/SearchActions";
import { SelectActions } from "../actions/SelectActions";
import { TooltipActions } from "../actions/TooltipActions";
import { FetchUserDataPayload, UIActions } from "../actions/UIActions";
import { ZoomActions } from "../actions/ZoomActions";
import { EventDetails } from "../calendar/CalendarEventViewingDetails";
import getSocketConnection from "../communications/getSocketConnection";
import { saveCryptoPortfolioData } from "../documents/editing/autosave";
import updateUI, {
    updateUIWithCopiedText,
    updateUIWithSearchResults
} from "../documents/editing/updateUI";
import { HighlightActions } from "../documents/screenFunctionality/HighlightActions";
import { currentAppType } from "../getCurrentAppType";
import useErrorHandling from "../hooks/useErrorHandling";
import useWebSocket from "../hooks/useWebSocket";
import ReusableButton from "../libraries/ui/buttons/ReusableButton";
import { BlogActions } from "../models/blogs/BlogAction";
import { ProgressDataProps } from "../models/data/ProgressData";
import { SortingType } from "../models/data/StatusType";
import {
    initiateBitcoinPayment,
    initiateEthereumPayment,
} from "../payment/initCryptoPayments";
import { PhaseActions } from "../phases/PhaseActions";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { DataAnalysisActions } from "../projects/DataAnalysisPhase/DataAnalysisActions";
import { brandingSettings } from "../projects/branding/BrandingSettings";
import { ContentActions } from "../security/ContentActions";
import { sanitizeData, sanitizeInput } from "../security/SanitizationFunctions";
import SnapshotList from "../snapshots/SnapshotList";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import { addMessage } from "../state/redux/slices/ChatSlice";
import { RootState } from "../state/redux/slices/RootSlice";
import { DetailsItem } from "../state/stores/DetailsListStore";
import { historyManagerStore } from "../state/stores/HistoryStore";
import { Subscription } from "../subscriptions/Subscription";
import { UIApi } from "../users/APIUI";
import * as apiSnapshot from "./../../api/SnapshotApi";
import { BaseCustomEvent } from "./BaseCustomEvent";
import { CustomMouseEvent } from "./EventService";
import { callback } from "node_modules/chart.js/dist/helpers/helpers.core";
import { T, K } from "../models/data/dataStoreMethods";
import { snapshotId } from "../utils/snapshotUtils";

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
  subscription: Subscription<T, K<T>> | null,
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
  subscription: Subscription<T, K<T>> | null,
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
  subscription: Subscription<T, K<T>>| null,
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

const DynamicEventHandlerService = ({
  handleSorting,
}: {
  handleSorting: (
    snapshotList: Promise<SnapshotList<T, K<T>>>,
    event: SyntheticEvent<Element, Event> | MouseEvent
  ) => void;
}) => {
  // Define the subscription variable
  const router = useRouter(); // Get the router object using useRouter hook
  const subscription = null; // You need to define subscription before passing it to cleanupState
  const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });

  // State to track messages
  const [messages, setMessages] = useState<string[]>([]);
  const snapshhotListRef = useRef<Promise<SnapshotList<T, K<T>>>>();
  let sentiment: AxiosResponse<any, any>;

  const handleSortingWrapper = (snapshotList: Promise<SnapshotList<T, K<T>>>) => {
    // Handle sorting logic
    // Assuming snapshotList is an array or object with sorting functionality
    (async () => {
      const sortedList = await snapshotList;
      sortedList.sort();

      // Add message
      addMessage("Sorted snapshots");
    })();

    return (event: SyntheticEvent<Element, Event> | MouseEvent) => {
      handleSorting(snapshotList, event);
    };
  };

  const handleSortingEvent = createEventHandler(
    "handleSorting",
    handleSortingWrapper(snapshhotListRef.current!)
  );

  // Helper function to add messages
  const addMessage = (message: string) => {
    setMessages((prevMessages: string[]) => [...prevMessages, message]);
  };


  const handleKeyboardShortcuts = createEventHandler(
    "handleKeyboardShortcuts",
    (event: React.MouseEvent<HTMLElement> | MouseEvent) => {
      // Handle keyboard shortcuts logic
      console.log("Handling keyboard shortcuts:", event);
      // Prevent default browser behavior for some shortcuts
      event.preventDefault();
    }
  );

  const handleHighlight = createEventHandler(
    "handleHighlight",
    createEventHandler(
      "handleTextHighlight",
      (event: React.MouseEvent<HTMLElement> | MouseEvent | CustomMouseEvent) => {
        // Handle text highlight logic
        console.log("Text highlighted");

        // Dispatch action to update highlighted text
        if (event.target instanceof HTMLElement) {
          const selectedText = {
            id: 1, // You can assign a unique ID here if needed
            text: event.target.innerText,
            startIndex: 0, // Adjust these values based on your logic
            endIndex: event.target.innerText.length,
          };
          HighlightActions.highlightText({ selectedText });
        }
      }
    )
  );

  const handleMouseClick = (event: React.MouseEvent<HTMLElement> | MouseEvent) => {
    // Handle mouse click logic
    console.log("Handling mouse click:", event);
  };


  const handleButtonClick: React.MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    // Handle button click logic
    console.log("Handling button click:", event);

    // Prevent default behavior (e.g., form submission)
    event.preventDefault();

    // You may not need to return anything here
  };

  const handleDivMouseMove = createEventHandler(
    "handleDivMouseMove",
    (event: React.MouseEvent<HTMLElement> | MouseEvent) => {
      console.log("Handling div mouse move:", event);

      return () => { };
    }
  );

  const handleContextMenu = createEventHandler(
    "handleContextMenu",
    (event: React.SyntheticEvent | MouseEvent) => {
      console.log("Handling context menu:", event);

      return () => { };
    }
  );

  const handleDynamicEvent = (eventName: any, handler: any) => {
    switch (eventName) {
      case "handleKeyboardShortcuts":
        return createEventHandler("handleKeyboardShortcuts", handler);

      case "handleMouseClick":
        return createEventHandler("handleMouseClick", handler);

      case "handleButtonClick":
        return createEventHandler("handleButtonClick", handler);

      case "handleDivMouseMove":
        return createEventHandler("handleDivMouseMove", handler);

      case "handleContextMenu":
        return handleContextMenu; // Already using createEventHandler

      case "handleDynamicEvent":
        return createEventHandler("handleDynamicEvent", handler);

      default:
        throw new Error(`No handler found for event: ${eventName}`);
    }
  };

  // Define the event listener function
  const handleScrolling: UIEventHandler<HTMLDivElement> &
    EventListenerOrEventListenerObject = (event: any) => {
      // Accessing scroll-related information
      const scrollTop = event.currentTarget?.scrollTop;
      const scrollLeft = event.currentTarget?.scrollLeft;

      // Your custom logic for handling scrolling
      console.log("Handling scrolling:");
      console.log("Scroll Top:", scrollTop);
      console.log("Scroll Left:", scrollLeft);

      // Additional logic based on scroll position or other scroll-related information
      if (scrollTop > 100) {
        // Perform an action when the scroll position is beyond a certain point
        console.log("You scrolled beyond 100 pixels from the top.");
      }

      // You may not need to call the original handler here
    };

  const scrollEventListener: UIEventHandler<HTMLDivElement> = (event) => {
    // Access scroll-related information
    const scrollTop = event.currentTarget.scrollTop;
    const scrollLeft = event.currentTarget.scrollLeft;

    // Your custom logic for handling scrolling
    console.log("Handling scrolling:");
    console.log("Scroll Top:", scrollTop);
    console.log("Scroll Left:", scrollLeft);

    // Additional logic based on scroll position or other scroll-related information
    if (scrollTop > 100) {
      // Perform an action when the scroll position is beyond a certain point
      console.log("You scrolled beyond 100 pixels from the top.");
    }

    // Call the handleScrolling function with the event object
    handleScrolling(event);
  };


  const handleZoom = React.useCallback(
    (event: React.WheelEvent<HTMLDivElement> | MouseEvent) => {
      // Handle zoom logic
      console.log("Handling zoom with wheel event:", event);

      // Prevent page zoom
      event.preventDefault();
    },
    []
  );

  const handleMouseMovement: React.MouseEventHandler<HTMLDivElement> | MouseEvent = (
    event) => {
    // Accessing mouse movement-related info
    const clientX = event.clientX;
    const clientY = event.clientY;
    // Handle mouse movement logic
    console.log("Handling mouse movement:", event);
  }

  const handleKeyboardEvent: React.KeyboardEventHandler<HTMLDivElement> = (
    event
  ) => {
    // Accessing keyboard-related information
    const key = event.key;

    // Your custom logic for handling keyboard events
    console.log("Handling keyboard event:");
    console.log("Key pressed:", key);
    // Additional logic based on key pressed
    if (key === "ArrowUp") {
      // Handle arrow up key press
      console.log("Arrow up key pressed");
    } else if (key === "ArrowDown") {
      // Handle arrow down key press
      console.log("Arrow down key pressed");
    }
    // Prevent default keyboard actions if needed
    event.preventDefault();
  };

  const handleDragMove = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const { clientX, clientY } = event;
    dispatch(DragActions.dragMove({ dragX: clientX, dragY: clientY }));
    // Additional logic for drag move...
    const draggedElement = event.currentTarget;
    draggedElement.style.left = `${clientX}px`;
    draggedElement.style.top = `${clientY}px`;
    // Prevent default drag behaviors like selecting text
    event.preventDefault();
    // Update UI to indicate dragging has started
    DragActions.dragMove({
      dragX: clientX,
      dragY: clientY,
    });
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    // if drag leave occurs on a valid drop zone
    // Logic for drag leave
    const dropZone = event.currentTarget;
    if (!dropZone.classList.contains("drop-active")) return;
    if (dropZone && dropZone.classList.contains("drop-active")) {
      dropZone.classList.remove("drop-active");
    }
    console.log("Drag leave occurrend");
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();

    try {
      // Retrieve dropped data
      const droppedData = event.dataTransfer?.getData("text/plain");

      // Perform action based on dropped data
      if (droppedData) {
        // Example: Display dropped text in console
        console.log("Dropped text:", droppedData);

        // Update UI with dropped text
        setState(droppedData);
      } else {
        console.log("No data dropped or unsupported data type.");
      }
    } catch (error) {
      console.error("Error handling drop event:", error);
      // Handle error gracefully
    } finally {
      // Clean up if needed
    }
  };

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    // Logic for focus event
    console.log("Element gained focus");

    // Additional logic for focus event
    const focusedElement = event.currentTarget;
    if (focusedElement) {
      focusedElement.classList.add("focused");
      console.log("Element gained focus");
    }

    // Prevent default focus behaviors
    event.preventDefault();
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    // Logic for blur event
    // Additional logic for blur event
    const blurredElement = event.currentTarget;
    blurredElement.classList.remove("focused");
    console.log("Element lost focus");
    event.preventDefault();
    // Remove focused class
    if (blurredElement) {
      blurredElement.classList.remove("focused");
    }
  };

  const handleFocusIn = (event: React.FocusEvent<HTMLDivElement>) => {
    // Logic for focus in event
    console.log("Element focused in");

    // Additional logic for focus in event
    const focusedElement = event.currentTarget;
    if (focusedElement) {
      focusedElement.classList.add("focused-in");
      console.log("Element focused in");
    }

    // Prevent default focus in behaviors
    event.preventDefault();
  };

  const handleFocusOut = (event: React.FocusEvent<HTMLDivElement>) => {
    // Logic for focus out event
    console.log("Element focused out");

    // Additional logic for focus out event
    const focusedElement = event.currentTarget;
    if (focusedElement) {
      focusedElement.classList.remove("focused-in");
      console.log("Element focused out");
    }

    // Prevent default focus out behaviors
    event.preventDefault();
  };

  const handleResize = (event: UIEvent) => {
    // Logic for resize event
    console.log("Window resized");

    // Additional logic for resize event
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    console.log("Window width:", windowWidth);
    console.log("Window height:", windowHeight);

    // Additional logic based on window size
    if (windowWidth < 768) {
      console.log("Small screen size detected");
    }
  };

  const handleSelect = (event: React.MouseEvent<HTMLDivElement>) => {
    // Logic for select event
    // Additional logic for select event
    const selectedText = window.getSelection()?.toString() || "";
    console.log("Selected text:", selectedText);

    // Check if text is being dragged to highlight
    const isDragging =
      event.nativeEvent instanceof MouseEvent && event.nativeEvent.which === 1;
    console.log("Text selected");
    if (isDragging) {
      console.log("Text is being dragged to highlight.");
      // Perform specific actions for highlighting, such as applying styles or triggering events
    } else {
      console.log("Text is being selected intentionally.");

      // Determine the type of app
      const isTextEditor = true; // Example: Text Editing App
      const isReadingApp = false;
      const isSearchApp = false;
      const isProjectManagementApp = false;
      const isCalendarApp = false;
      const isMeetingApp = false;
      const isPhaseManagerApp = false;
      const isDocumentManagerApp = true;
      const isBlogManagerApp = false;
      const isDrawingManagerApp = false;
      const isUIManagerApp = false;
      // Handle specific actions based on the type of app
      if (isTextEditor) {
        console.log("Text Editing App detected.");
        // Offer options for formatting, spellcheck, etc.
        console.log("Offering formatting and spellcheck options...");
        // Example: Update UI with word count
        updateUIWithCopiedText(selectedText, "editor");
      } else if (isReadingApp) {
        console.log("Reading App detected.");
        // Automatically bookmark or highlight selected text
        BookmarkActions.bookmarkText({
          selectedText: { id: 1, text: selectedText },
        });
        HighlightActions.highlightText({
          selectedText: {
            id: 1,
            text: selectedText,
            startIndex: 0,
            endIndex: selectedText.length,
          },
        });
        // Handle actions specific to Document Manager App
        console.log("Performing actions for Document Manager App...");
        DocumentActions.showOptionsForSelectedText({
          selectedText: {
            id: 0,
            text: "Hello World",
            startIndex: 0,
            endIndex: selectedText.length,
          },
        });

        // Offer options to bookmark, annotate selected text
        console.log(
          "Offering options to bookmark or annotate selected text..."
        );
        SelectActions.showOptionsForSelectedText(selectedText);
      } else if (isSearchApp) {
        console.log("Search App detected.");
        // Automatically initiate a search based on the selected text
        console.log("Initiating search based on selected text...");
        SearchActions.initiateSearch(selectedText);
      } else if (isProjectManagementApp) {
        console.log("Project Management App detected.");
        // Handle actions specific to Project Management App
        console.log("Performing actions for Project Management App...");
        ProjectActions.performProjectActions(selectedText);
      } else if (isCalendarApp) {
        console.log("Calendar App detected.");
        // Handle actions specific to Calendar App
        console.log("Performing actions for Calendar App...");
        CalendarActions.performCalendarActions(selectedText);
      } else if (isMeetingApp) {
        console.log("Meeting App detected.");
        // Handle actions specific to Meeting App
        console.log("Performing actions for Meeting App...");
        MeetingActions.performMeetingActions(selectedText);
      } else if (isDocumentManagerApp) {
        console.log("Document Manager App detected.");
        // Handle actions specific to Document Manager App
        console.log("Performing actions for Document Manager App...");
        // Handle specific actions based on the type of app
        console.log("Document Manager App detected.");
        // Handle actions specific to Document Manager App
        console.log("Performing actions for Document Manager App...");

        // Highlight the selected text using the highlightText action
        HighlightActions.highlightText({
          selectedText: {
            id: 1, // Unique ID for the selected text
            text: selectedText,
            startIndex: 0, // Example: Index where the selected text starts
            endIndex: selectedText.length, // Example: Index where the selected text ends
          },
        });

        // Additional actions related to Document Manager App...
        DocumentActions.showOptionsForSelectedText({
          selectedText: {
            id: 2, // Unique ID for the selected text
            text: selectedText,
            startIndex: 0,
            endIndex: selectedText.length,
          },
        });
        // Prevent default text selection behavior
        event.preventDefault();

        // Ensure accessibility by clearing any existing errors
        useErrorHandling().clearError();

        // Handle any unexpected errors
        try {
          // Perform additional logic here...
        } catch (error: any) {
          // Handle error gracefully using the useErrorHandling hook
          useErrorHandling().handleError("Error handling select event", {
            componentStack: error.stack,
          });
        }
        //rActions.performSettingsActions(selectedText);
      } else if (isBlogManagerApp) {
        console.log("Blog Manager App detected.");
        // Handle actions specific to Blog Manager App
        console.log("Performing actions for Blog Manager App...");
        BlogActions.performBlogActions(selectedText);
      } else if (isDrawingManagerApp) {
        console.log("Drawing Manager App detected.");
        // Handle actions specific to Drawing Manager App
        console.log("Performing actions for Drawing Manager App...");
        DrawingActions.performDrawingActions(selectedText);
      } else if (isUIManagerApp) {
        console.log("UI Manager App detected.");
        // Handle actions specific to UI Manager App
        console.log("Performing actions for UI Manager App...");
        const payload: FetchUserDataPayload | null = selectedText
          ? { message: selectedText }
          : null;
        UIActions.performUIActions(payload);
      } else if (isPhaseManagerApp) {
        console.log("Phase Manager App detected.");
        // Handle actions specific to Phase Manager App
        console.log("Performing actions for Phase Manager App...");
        PhaseActions.performPhaseActions(selectedText);
      }

      // Prevent default text selection behavior
      event.preventDefault();

      // Ensure accessibility by clearing any existing errors
      useErrorHandling().clearError();

      // Handle any unexpected errors
      try {
        // Perform additional logic here...
      } catch (error: any) {
        // Handle error gracefully using the useErrorHandling hook
        useErrorHandling().handleError("Error handling select event", {
          componentStack: error.stack,
        });
      }
    }

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
      const draggedElement = event.currentTarget;
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

    const handleDragEnd = (
      event: React.MouseEvent<HTMLElement, MouseEvent>
    ) => {
      const { clientX, clientY } = event;
      dispatch(DragActions.dragEnd({ finalX: clientX, finalY: clientY }));
      // Additional logic for drag end...
      const draggedElement = event.currentTarget;
      draggedElement.classList.remove("dragging");
      // Reset the drag state
      dispatch(DragActions.dragReset());
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
      // Handle drag enter logic
      console.log("Dragged element entered target");

      // add action to drag element on enter
      const draggedElement = event.currentTarget;
      draggedElement.draggable = true;
      draggedElement.classList.add("drag-over");
      // Additional logic to handle drag enter
      if (draggedElement.id === "dropTarget") {
        // Show drop zone
        draggedElement.style.border = "3px solid blue";
      }
      event.preventDefault();
      event.stopPropagation();
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      // Prevent default drag behaviors like selection
      event.preventDefault();

      // Additional logic to handle drag over
      if (event.currentTarget.id === "dropTarget") {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handleZoom = (event: React.WheelEvent<HTMLDivElement>) => {
      // Accessing zoom-related information
      const scale = event.deltaY;

      // Your custom logic for handling zoom
      console.log("Handling zoom:");
      console.log("Zoom Scale:", scale);

      // Additional logic for zooming...
      if (scale > 0) {
        // Perform an action when zoomed in
        console.log("You zoomed in.");
      } else if (scale < 0) {
        // Perform an action when zoomed out
        console.log("You zoomed out.");
      }

      dispatch(ZoomActions.zoomIn(scale));
      // Add more specific logic based on your application's requirements
      dispatch(
        DragActions.dragStart({
          highlightEvent: event,
          clientX: event.clientX,
          clientY: event.clientY,
        })
      );
    };

    const handleKeyboardEvent = (event: React.KeyboardEvent<HTMLElement>) => {
      // Handle keyboard event logic
      const key = event.key;
      console.log("Pressed key:", key);
      if (key === "ArrowUp") {
        // handle arrow up key press
      } else if (key === "ArrowDown") {
        // handle arrow down key press
      } else if (key === "Escape") {
        // handle escape key press
      } else if (key === "Enter") {
        // handle enter key press
        console.log("Enter key pressed");
      }

      console.log("Handling keyboard event:", event);

      // Return the event
      return event;
    };

      const handleMouseEvent = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const x = event.clientX;
        const y = event.clientY;

        console.log("Mouse moved to:", x, y);
        if (event.type === "mousemove") {
          console.log("Mouse moved");
        }
        dispatch(DragActions.highlight({ x, y }));
      }
  

    const handleMouseMovement = createEventHandler(
      "handleMouseMovement",
      (event: React.MouseEvent<HTMLElement, MouseEvent> | MouseEvent) => {
        // Access mouse event properties
        const x = event.clientX;
        const y = event.clientY;

        // Handle mouse movement
        console.log("Mouse moved to:", x, y);
        // Additional mouse movement handling logic
        if (event.type === "mousemove") {
          console.log("Mouse moved");
        }
      }
    );
    const handleAnnotations = createEventHandler(
      "handleAnnotations",
      (event: React.MouseEvent<HTMLElement, MouseEvent> | MouseEvent) => {
        // Access annotation-related information
        const selectedText = window.getSelection()?.toString();
    
        // Your custom logic for handling annotations
        let annotationDetails: string | null = null;
        if (event.currentTarget instanceof HTMLElement) {
          annotationDetails = event.currentTarget.getAttribute("data-annotation");
        }
    
        // Your custom logic for handling annotations
        console.log("Handling annotations:");
        console.log("Selected Text:", selectedText);
        console.log("Annotation Details:", annotationDetails);
    
        // Combine selected text and annotation details for the content
        let content = "You annotated: ";
        if (selectedText) {
          content += selectedText;
          if (annotationDetails) {
            content += ` (${annotationDetails})`;
          }
        } else if (annotationDetails) {
          content += annotationDetails;
        }
    
        //  update UI based on annotations or trigger further actions.
        const messageId = UniqueIDGenerator.generateMessageID();
        const message: Partial<Message> = {
          id: messageId,
          content: content,
        };
        addMessage(message.toString());
    
        // Add UI update or other logic specific to annotations
        updateUI(content);
    
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
    
        // Add more specific logic based on your application's requirements
      }
    );
    

    const handleCopyPaste = createEventHandler(
      "handleCopyPaste",
      (
        event:
          | React.MouseEvent<HTMLElement, MouseEvent>
          | React.ClipboardEvent<HTMLElement>
          | MouseEvent
      ) => {
        // Handle paste event
        if (event.type === "paste") {
          // Check if the event is a ClipboardEvent
          if (event instanceof ClipboardEvent) {
            // Access clipboard data
            const clipboardData = event.clipboardData;

            console.log("Paste detected");

            // Prevent default behavior for paste event
            event.preventDefault();

            // Accessing paste-related information
            const copiedText = clipboardData?.getData("text"); // Retrieve copied text

            // Your custom logic for handling paste
            console.log("Handling paste:");
            console.log("Copied Text:", copiedText);

            // Additional logic for paste...
            if (copiedText) {
              // Perform action on paste like adding to clipboard history
              addToClipboardHistory(copiedText);

              // Process the copied text, such as formatting or analyzing it
              const analysisType = AnalysisTypeEnum.SENTIMENT;
              processCopiedText(copiedText, analysisType);
            } else {
              console.log("No text copied.");
            }
          }
        }

        // Handle copy event
        if (event.type === "copy") {
          console.log("Copy detected");

          // Prevent default behavior for copy event
          event.preventDefault();

          // Your custom logic for handling copy
        }

        // Return the event
        return event;
      }
    );

    function getClipboardHistory(text: string) {
      // Return existing clipboard history array or empty array
      const clipboardHistory = JSON.parse(
        localStorage.getItem("clipboardHistory") || "[]"
      );
      return clipboardHistory;
    }

    function setClipboardHistory(history: string[]) {
      // Add logic to save clipboard history
      localStorage.setItem("clipboardHistory", JSON.stringify(history));
    }

    function addToClipboardHistory(text: string) {
      // Add logic to update clipboard history
      const clipboardHistory = getClipboardHistory(text);
      clipboardHistory.push(text);
      setClipboardHistory(clipboardHistory);
    }

    async function processCopiedText(
      text: string,
      analysisType: AnalysisTypeEnum
    ): Promise<void> {
      try {
        let sentiment: AxiosResponse<any, any>;

        // Perform sentiment analysis based on the specified analysis type
        switch (analysisType) {
          case AnalysisTypeEnum.SENTIMENT:
            sentiment =
              await ApiAnalysis.apiAnalysisService.performSentimentAnalysis(
                text
              );
            break;
          case AnalysisTypeEnum.DESCRIPTIVE:
            sentiment =
              await ApiAnalysis.apiAnalysisService.performDescriptiveAnalysis(
                text
              );
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
    }

    // Call function to update UI with results of analysis
    updateUIWithSearchResults(sentiment.data);
  };

  const handleUndoRedo = createEventHandler(
    "handleUndoRedo",
    (event: React.MouseEvent<HTMLElement, MouseEvent> | MouseEvent) => {
      // Logic for handling undo/redo
      console.log("Handling undo/redo:", event);

      // Determine the action to be performed (e.g., undo or redo)
      const actionType = event.type; // Assuming event.type indicates the action type (e.g., "undo" or "redo")

      // Implement the logic to undo or redo the action
      if (actionType === "undo") {
        // Undo the action
        console.log("Undoing the action...");
        // Perform the necessary operations to revert the action
      } else if (actionType === "redo") {
        // Redo the action
        console.log("Redoing the action...");
        // Perform the necessary operations to reapply the action
      }

      // Return the event
      return event;
    }
    
  );

  const handleContextMenus = createEventHandler(
    "handleContextMenus",
    (event: React.MouseEvent<HTMLElement, MouseEvent> | MouseEvent) => {
      // Access context menu trigger information
      const target = event.target;

      // Your custom logic for handling context menus
      console.log("Handling context menu:");
      console.log("Target:", target);

      // Dispatch updateContextMenuUI action with context menu position
      UIActions.updateContextMenuUI({
        isOpen: true, // Assuming the context menu is opened
        x: event.clientX, // X coordinate of the event
        y: event.clientY, // Y coordinate of the event
      });

      // Prevent default behavior for context menus
      event.preventDefault();
    }
    // Add UI update or other logic specific to context menus
  );

  const handleFullscreenMode = createEventHandler(
    "handleFullscreenMode",
    (event: React.MouseEvent<HTMLElement, MouseEvent> | MouseEvent) => {
      // Handle fullscreen requests
      if (event.type === "fullscreenchange") {
        console.log("Fullscreen mode changed");
      }
      // Check if entering fullscreen mode
      if (event.type === "fullscreenchange" && document.fullscreenElement) {
        console.log("Entering fullscreen mode");
      }
      // Check if exiting fullscreen mode
      else if (
        event.type === "fullscreenchange" &&
        !document.fullscreenElement
      ) {
        console.log("Exiting fullscreen mode");
      }
      // Reset fullscreen state on exit
      if (event.type === "fullscreenchange" && !document.fullscreenElement) {
        document.exitFullscreen();
      }
      // Additional logic for fullscreen mode changes
      return event;
    }
  );

  const handleSearchFunctionality = (
    event:
      | (EventListenerOrEventListenerObject &
          React.SyntheticEvent<Element, Event>)
      | ReactiveEventHandler
  ) => {
    // Logic for handling search functionality
    console.log("Handling search functionality:", event);

    // Check if the event is a ReactiveEventHandler
    if (isReactiveEventHandler(event)) {
      // Check if the event has a detail object with a 'query' property
      if (
        event.detail &&
        typeof event.detail === "object" &&
        "query" in event.detail
      ) {
        // Get search query from event
        const query = (event.detail as { query: string }).query;

        // Call search API with query
        searchAPI(query).then((results: SearchResultWithQuery<any>[]) => {
          // Dispatch action to update search results
          if (results.length > 0) {
            dispatch(UIActions.updateSearchResults(results));
          }
          // Additional logic for search functionality can go here
          updateUIWithSearchResults(results);
        });
      } else {
        console.log(
          "ReactiveEventHandler does not have a 'detail' object with a 'query' property."
        );
      }
    } else {
      // Handle SyntheticEvent as the original version
      const syntheticEvent = event as React.SyntheticEvent<Element, Event>;
      const searchInput = (syntheticEvent.target as HTMLInputElement).value;
      if (searchInput) {
        // Perform search based on the input value
        console.log("Performing search for:", searchInput);

        // Example: Call a search API endpoint with the search query
        // Replace `apiEndpoint` with your actual API endpoint
        fetch(`apiEndpoint?query=${searchInput}`)
          .then((response) => response.json())
          .then((data) => {
            // Process search results
            console.log("Search results:", data);
            // Update UI with search results
          })
          .catch((error) => {
            // Handle errors
            console.error("Error performing search:", error);
            // Display error message to the user
          });
      } else {
        // Handle case where search input is empty
        console.log("Search input is empty. Please enter a search query.");
        // Display message to the user indicating that search input is required
      }
    }
  };

  // Define the event handler function
  const handleProgressIndicators = createEventHandler(
    "handleProgressIndicators",
    (event: ReactiveMouseEvent | MouseEvent) => {
      // Access progress indicator data
      const progress = (event as ReactiveMouseEvent).progress;

      // Assuming you have some progress-related information in your application state
      const currentProgress = useAppSelector(
        (state: RootState) => state.phaseManager.progress.value
      );

      // Logic for handling progress indicators
      console.log("Handling progress indicators:", event);

      // Additional logic for progress indicators...
      // For example, update a progress bar or display a loading spinner.

      // Assuming you have a progress bar element in your UI
      const progressBar = document.getElementById("progressBar");

      if (progressBar) {
        // Update the progress bar based on the current progress
        progressBar.style.width = `${currentProgress}%`;

        // Display a loading spinner when progress is ongoing
        if (currentProgress < 100) {
          const loadingSpinner = document.getElementById("loadingSpinner");
          if (loadingSpinner) {
            loadingSpinner.style.display = "block";
          }
        } else {
          // Hide the loading spinner when progress is complete
          const loadingSpinner = document.getElementById("loadingSpinner");
          if (loadingSpinner) {
            loadingSpinner.style.display = "none";
          }
        }
      }
      // Dispatch action to update progress bar state
      dispatch(
        UIActions.updateUIProgressBar({
          value: typeof progress?.value === 'number' ? progress.value : 0,
          id: "",
          label: "",
          current: 0,
          min: 0, 
          max: 100,
          percentage: 0,
          name: "name", 
          color: "blue", 
          description: "ui progress bar update",
          done: false,
        })
      );

      // Return the event
      return event;
    }
  );

  const handleMouseEvent = createEventHandler(
    "handleMouseEvent",
    (event: ReactiveMouseEvent | MouseEvent) => {
      // Access mouse-related information
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // Your custom logic for handling mouse events
      console.log("Handling mouse event:");
      console.log("Mouse X:", mouseX);
      console.log("Mouse Y:", mouseY);

      // Additional logic for mouse events can go here

      // For React.MouseEvent<HTMLElement>, perform additional sanitization
      if (event instanceof MouseEvent) {
        const sanitizedData = event.currentTarget
          ? sanitizeData((event.currentTarget as HTMLDivElement).toString())
          : null;
        console.log("Sanitized data:", sanitizedData);
      }

      // Call handleMouseClick with the event
      handleMouseClick(event);

      // Ensure event is of type ReactiveMouseEvent before returning
      return event;
    }
  );

  useEffect(() => {
    const handleKeyboardEvent = (event: KeyboardEvent) => {
      // Sanitize input value before processing
      const sanitizedInput = sanitizeInput(
        (event.target as HTMLInputElement).value
      );
      console.log("Sanitized input:", sanitizedInput);
      EventHandlerActions.handleKeyboardShortcuts({
        event: event,
        sanitizedInput: sanitizedInput,
      });
    };

    window.addEventListener("keydown", handleKeyboardEvent);

    // Attach event listeners using the imported event handlers
    window.addEventListener("keydown", (event: KeyboardEvent) =>
      handleKeyboardEvent(event)
    );

    const scrollEventListener = (event: Event) => {
      // Access scroll-related information
      const scrollTop = (event.target as Element).scrollTop;
      // Your custom logic for handling scroll events
      console.log("Handling scroll event:");
      console.log("Scroll Top:", scrollTop);
      // Additional logic for scroll events can go here
      return event;
    };

    const handleMouseEvent = (event: MouseEvent) => {
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      console.log("Handling mouse event:");
      console.log("Mouse X:", mouseX);
      console.log("Mouse Y:", mouseY);

      if (event.currentTarget instanceof HTMLElement) {
        const sanitizedData = sanitizeData(event.currentTarget.toString());
        handleMouseClick(event);
        console.log("Handling mouse event:", event);
      }

      handleMouseEvent(event);
      return event;
    };

    // Add event listener with the scrollEventListener function
    window.addEventListener("scroll", scrollEventListener);
    window.addEventListener("click", handleMouseEvent);
    window.addEventListener("wheel", handleZoom as unknown as EventListener);
    window.addEventListener("mouseup", (event: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent) => {
      // Handle mouseup event logic here
      handleHighlighting(event as MouseEvent & React.MouseEvent<HTMLDivElement, MouseEvent>);
    });
    window.addEventListener("mousemove", (event: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent) => {
      // Handle mouseup event logic here
      handleMouseMovement(event as MouseEvent & React.MouseEvent<HTMLDivElement, MouseEvent>);
    });
    window.addEventListener("mousemove", (event: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent) => {
      // Handle mouseup event logic here
      handleAnnotations(event as MouseEvent & React.MouseEvent<HTMLDivElement, MouseEvent>);
    });
    window.addEventListener("copy", (event: ClipboardEvent) => {
      // Handle mouseup event logic here
      handleCopyPaste(event as ClipboardEvent & React.ClipboardEvent<HTMLDivElement>);
    });
    window.addEventListener("redo", (event: Event) => {
      // Handle mouseup event logic here
      handleUndoRedo(event as MouseEvent | React.MouseEvent<HTMLElement, MouseEvent>);
    });

    window.addEventListener("contextmenu", handleContextMenus);
    window.addEventListener("fullscreen", (event: Event) => {
      // Handle mouseup event logic here
      handleFullscreenMode(event as MouseEvent | React.MouseEvent<HTMLElement, MouseEvent>);
    });

    window.addEventListener("helpFAQ", (event: Event) => {
      handleHelpFAQ(event as Event & React.SyntheticEvent<Element, Event>);
    });

    window.addEventListener("searchFunctionality", (event: Event) => {
      handleSearchFunctionality(event as (EventListenerOrEventListenerObject & SyntheticEvent<Element, Event>) | ReactiveEventHandler);
    });
    window.addEventListener("progressIndicators", (event: Event) => {
      handleProgressIndicators(event as MouseEvent | React.MouseEvent<HTMLElement, MouseEvent>);
    });
    window.addEventListener("handleDragStart", (event: Event) => {
      handleDragStart(event as Event & React.DragEvent<HTMLDivElement>);
    });

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyboardEvent);
      window.removeEventListener("click", handleMouseEvent);
      window.removeEventListener("scroll", handleScrolling);
      window.removeEventListener("wheel", handleZoom);
      window.removeEventListener("mouseup", handleHighlighting);
      window.removeEventListener(
        "mousedown",
        handleAnnotations as EventListener
      );
      window.removeEventListener("copy", handleCopyPaste);
      window.removeEventListener("redo", handleUndoRedo as EventListener);
      window.removeEventListener("contextmenu", handleContextMenus);
      window.removeEventListener(
        "fullscreen",
        handleFullscreenMode as EventListener
      );
      window.removeEventListener("helpFAQ", handleHelpFAQ )
     
      window.removeEventListener("settingsPanel", handleSettingsPanel as EventListenerOrEventListenerObject & MouseEventHandler<HTMLButtonElement> )
      window.removeEventListener(
        "searchFunctionality",
        handleSearchFunctionality as EventListener 
      );
      window.removeEventListener(
        "progressIndicators",
        handleProgressIndicators as EventListener 
      );
    };
  }, [
    handleKeyboardEvent,
    handleZoom,
    handleAnnotations,
    handleMouseEvent,
    handleClickOutside,
    scrollEventListener,
    handleDragStart,
    handleSorting,
    handleDragEnd,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFocus,
    handleBlur,
    handleFocusIn,
    handleFocusOut,
    handleResize,
    handleSelect,
    handleUnload,
    handleButtonClick,
    handleBeforeUnload,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleZoom,
    handleCopyPaste,
    handleHighlighting,
    handleKeyboardEvent,
    handlePointerCancel,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerOver,
    handlePointerOut,
    handleAuxClick,
    handleMouseClick,
    handleGestureStart,
    handleGestureChange,
    handleGestureEnd,
    handleDragStart,
    handleKeyboardShortcuts,
    handleSelect,
    handleButtonClick,
    handleDivMouseMove
  ]);

  useEffect(() => {
    // const createEventHandler = createEventHandler;

    const keyboardEventHandler = createEventHandler(
      "handleKeyboardShortcuts",
      handleKeyboardShortcuts
    );

    
    const handleHighlighting = createEventHandler(
      "handleHighlighting",
      (event: MouseEvent | React.MouseEvent<HTMLElement, MouseEvent>) => {
        // Logic for handling highlighting event
        console.log("Handling highlighting event:", event);
    
        // Check if the event is a CustomMouseEvent
        if ('nativeEvent' in event) {
          handleHighlight(event.nativeEvent as MouseEvent & React.MouseEvent<HTMLDivElement, MouseEvent>);
        } else {
          // Additional logic for synthetic events can go here
        }
        // Additional logic for highlighting event can go here
        return event;
      }
    );
    

    const handleMouseClick = createEventHandler(
      "handleMouseClick",
      (event: React.MouseEvent<HTMLElement, MouseEvent> | MouseEvent) => {
        // Logic for handling mouse click event
        console.log("Handling mouse click event:", event);
        // Call function to handle click logic
        handleMouseClick(event);

        // Additional logic for mouse click event can go here
        return event;
      }
    );

    const handleSortingEvent = createEventHandler(
      "handleSorting",
      (event: React.SyntheticEvent | MouseEvent) => {
        // Logic for handling sorting event
        console.log("Handling sorting event:", event);
        const target = event.target as HTMLDivElement;
    
        // Construct the Target object
        const targetConfig = constructTarget("sorting", "sortEvents", {
          sortBy: target.innerText, // Assuming target.innerText is used for sorting criteria
          limit: 10, // Set a default limit or adjust as needed
        });
    
        // Fetch the sorted list using the constructed Target
        const snapshotList: Promise<SnapshotList<T, K<T>>> = apiSnapshot.getSortedList(targetConfig);
        handleSorting(snapshotList, event);
      }
    );
    

    const mouseClickEventHandler = createEventHandler(
      "handleMouseClick",
      handleMouseClick
    );

    const handleDynamicEvent = createEventHandler(
      "handleDynamicEvent",
      (event: React.SyntheticEvent | MouseEvent) => {
        console.log("Handling dynamic event:", event);
      }
    );

    const handleContextMenu = createEventHandler(
      "contextMenu",
      (event: React.SyntheticEvent | MouseEvent ) => {
        // Logic for handling context menu

        console.log("Handling context menu:", event);

        // Additional logic for context menu...

        const contextMenuElement = document.getElementById("contextMenu");
        if (contextMenuElement) {
          contextMenuElement.style.display = "block";
          // Simulate additional actions when the context menu is opened
          // For example, update the context menu content dynamically
          contextMenuElement.innerHTML = "<p>Custom Context Menu</p>";
        }

        return () => {
          event.preventDefault();

          console.log("Context menu closed");
          // Additional logic when context menu is closed
          const contextMenuElement = document.getElementById("contextMenu");
          if (contextMenuElement) {
            contextMenuElement.style.display = "none";
          }
        };
      }
    );

    // const handleAnnotations = createEventHandler(
    //   "handleAnnotations",
    //   (event: React.SyntheticEvent) => {
    //     console.log("Handling annotations:", event);
    //     // Logic for handling annotations
    //     const annotationsElement = document.getElementById("annotations");
    //     if (annotationsElement) {
    //       annotationsElement.style.display = "block";
    //       // Update annotations UI
    //       annotationsElement.innerHTML = "<p>Sample annotation</p>";
    //       // Close annotations UI on click outside
    //       document.addEventListener("click", (e: MouseEvent) => {
    //         if (e.target && !annotationsElement.contains(e.target as Node)) {
    //           annotationsElement.style.display = "none";
    //         }
    //       });
    //     }
    //   }
    // );

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("selectionchange", handleHighlighting as MouseEvent & EventListenerOrEventListenerObject);
    // Attach the event listeners
    window.addEventListener("keydown", keyboardEventHandler as EventListenerOrEventListenerObject);
    window.addEventListener("click", handleSortingEvent);
    window.addEventListener("click", mouseClickEventHandler);
    window.addEventListener("fullscreen",  handleDynamicEvent as EventListenerOrEventListenerObject)
    
    window.addEventListener("customEvent1", handleDynamicEvent as EventListenerOrEventListenerObject);
    window.addEventListener("customEvent2", handleDynamicEvent as EventListenerOrEventListenerObject);

    // Clean up the event listeners
    return () => {
      window.removeEventListener("keydown", keyboardEventHandler as EventListenerOrEventListenerObject);
      window.removeEventListener("click", mouseClickEventHandler);
      window.removeEventListener("fullscreen", handleDynamicEvent as EventListenerOrEventListenerObject);
      window.removeEventListener("customEvent1", handleDynamicEvent as EventListenerOrEventListenerObject);
      window.removeEventListener("customEvent2", handleDynamicEvent as EventListenerOrEventListenerObject);
    };
  }, [
    handleSortingEvent,
    handleKeyboardShortcuts,
    handleMouseClick,
    handleHighlighting,
    handleContextMenu,
    handleDynamicEvent,
  ]);

  return (
    <div>
      <div
        onScroll={handleScrolling}
        onMouseDown={handleAnnotations}
        onWheel={handleZoom}
        onKeyDown={handleKeyboardEvent}
        onMouseUp={handleHighlighting}
        onCopy={handleCopyPaste}
        style={{ border: "1px solid black", padding: "20px" }}
      >
        Hover over me
      </div>
      <h2>Dynamic Event Handlers</h2>
      <ReusableButton
        label=""
        onEvent={handleButtonClick}
        onClick={handleButtonClick}
        router={router as ExtendedRouter & Router}
        brandingSettings={brandingSettings}
      />
      <div
        onMouseDown={handleMouseEvent}
        onMouseMove={handleDivMouseMove}
        style={{ border: "1px solid black", padding: "20px" }}
      >
        Hover over me
      </div>
      <button onClick={handleSettingsPanel}>Open Settings Panel</button>
      <button onClick={handleHelpFAQ}>Help/FAQ</button>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
      <DynamicEventHandlerService handleSorting={handleSorting} />
    </div>
  );
};

export default DynamicEventHandlerService;
export { generateNextPhaseRoute };
export type { CustomEventListener, UnsubscribeDetails };

function stopImmediatePropagation(
  event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
): void {
  event.stopPropagation(); // Stop the propagation of the event
  event.nativeEvent.stopImmediatePropagation(); // Stop the immediate propagation of the event
}

// Example usage:
// Pass settings data when calling handleSettingsPanel
// handleSettingsPanel(event, { isOpen: true });
