domEventHandlers.ts

import { DragActions } from "@/core/actions/DragActions";
import { SearchActions } from "@/core/actions/SearchActions";
import { TooltipActions } from "@/core/actions/TooltipActions";
import { UIActions } from "@/core/actions/UIActions";
import * as ApiAnalysis from "@/core/api/service/ApiAnalysisService";
import updateUI, { updateUIWithCopiedText } from "@/core/documents/editing/updateUI";
import { Message } from "@/core/generators/GenerateChatInterfaces";
import UniqueIDGenerator from "@/core/generators/GenerateUniqueIds";
import { useDrag } from "@/core/libraries/animations/DraggableAnimation/useDrag";
import {
    initiateBitcoinPayment,
    initiateEthereumPayment,
} from "@/core/payment/initCryptoPayments";
import { SettingsEvent } from '@/core/typings/eventHandlers/eventTypes';

import { ContentActions } from "@/core/actions/ContentActions";
import { CustomMouseEvent } from "@/core/services/EventService";
import { WritableDraft } from "@/core/state/redux/ReducerGenerator";
import { addMessage } from "@/core/state/redux/slices/ChatSlice";
import { historyManagerStore } from "@/core/state/stores/HistoryStore";
import { AnalysisTypeEnum } from "@/core/typings/AnalysisType";
import { AxiosResponse } from "axios";
import React from "react";
import { useDispatch } from "react-redux";

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

const handleMouseClick = (event: React.MouseEvent<HTMLDivElement>) => {
  // Logic for mouse click event
  console.log("Mouse clicked");

  // Additional logic for mouse click event
  // For example, you can change the background color of the clicked div
  const clickedDiv = event.currentTarget;
  clickedDiv.style.backgroundColor = "lightblue";
};

export const handleAuxClick = (event: React.MouseEvent<HTMLDivElement>) => {
  // Declare isAuxClicked variable or access it from the appropriate state management system
  const isAuxClicked = true; // Example: You can initialize it with a default value or access it from state

  // Logic for auxiliary click event
  console.log("Auxiliary click");

  // Example: Toggle some state
  UIActions.setIsAuxClicked(!isAuxClicked);
  // Prevent default behavior like text selection
  event.preventDefault();
};

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




const handleClickOutside: React.MouseEventHandler<HTMLElement> = (
  event: React.MouseEvent<HTMLElement, MouseEvent>
) => {
  // Logic for handling click outside of component
  console.log("Click outside handled");
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




export const handleDivMouseMove = (
  event: Event & React.MouseEvent<HTMLDivElement>,
  handler: (event: React.MouseEvent<HTMLDivElement>) => void
) => {
  handler(event);
};

export const handleAnnotations = (
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



export const handleSelect = (
  event: React.ChangeEvent<HTMLSelectElement>,
  handler: (event: React.ChangeEvent<HTMLSelectElement>) => void
) => {
  handler(event);
};




/**
 * Handle focus event - when an element gains focus
 */
const handleFocus = (event: React.FocusEvent<HTMLElement>) => {
  const dispatch = useDispatch();
  
  console.log("Element focused:", event.currentTarget);
  
  const focusedElement = event.currentTarget;
  const elementType = focusedElement.tagName.toLowerCase();
  const elementId = focusedElement.id;
  
  // Update UI state to track focused element
  dispatch(
    UIActions.setFocusedElement({
      elementId,
      elementType,
      hasFocus: true,
      timestamp: new Date().toISOString()
    })
  );
  
  // Add visual focus indicator
  focusedElement.classList.add('focused');
  
  // Show relevant tooltip based on element type
  switch (elementType) {
    case 'input':
    case 'textarea':
      TooltipActions.showTooltip("You can start typing here");
      break;
    case 'button':
      TooltipActions.showTooltip("Press Enter or Space to activate");
      break;
    case 'select':
      TooltipActions.showTooltip("Use arrow keys to navigate options");
      break;
    default:
      // No specific tooltip for other elements
      break;
  }
  
  // Special handling for search inputs
  if (elementId.includes('search') || focusedElement.getAttribute('type') === 'search') {
    SearchActions.setSearchFocused(true);
    
    // Show recent searches or suggestions
    dispatch(
      UIActions.showSuggestions({
        type: 'search',
        position: { x: event.clientX, y: event.clientY }
      })
    );
  }
  
  // Accessibility: Announce focus change for screen readers
  if (focusedElement.hasAttribute('aria-label')) {
    const ariaLabel = focusedElement.getAttribute('aria-label');
    UIActions.announceToScreenReader(`${ariaLabel} focused`);
  }
};

/**
 * Handle blur event - when an element loses focus
 */
const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
  const dispatch = useDispatch();
  
  console.log("Element blurred:", event.currentTarget);
  
  const blurredElement = event.currentTarget;
  const elementId = blurredElement.id;
  
  // Remove visual focus indicator
  blurredElement.classList.remove('focused');
  
  // Update UI state
  dispatch(
    UIActions.setFocusedElement({
      elementId,
      elementType: '',
      hasFocus: false,
      timestamp: new Date().toISOString()
    })
  );
  
  // Hide tooltips
  TooltipActions.hideTooltip();
  
  // Special handling for search inputs
  if (elementId.includes('search') || blurredElement.getAttribute('type') === 'search') {
    SearchActions.setSearchFocused(false);
    dispatch(UIActions.hideSuggestions());
  }
  
  // Validate input on blur (for forms)
  if (blurredElement.hasAttribute('data-validate')) {
    validateInput(blurredElement);
  }
  
  // Auto-save on blur for certain fields
  if (blurredElement.hasAttribute('data-autosave')) {
    handleAutoSave(blurredElement);
  }
};

/**
 * Handle focusin event - similar to focus but bubbles
 */
const handleFocusIn = (event: React.FocusEvent<HTMLElement>) => {
  console.log("Focus in event:", event.currentTarget);
  
  // Track focus within container for complex components
  const container = event.currentTarget;
  container.classList.add('has-focused-child');
  
  // Dispatch focus context for nested components
  dispatch(
    UIActions.setFocusContext({
      containerId: container.id,
      hasInnerFocus: true
    })
  );
};

/**
 * Handle focusout event - similar to blur but bubbles
 */
const handleFocusOut = (event: React.FocusEvent<HTMLElement>) => {
  console.log("Focus out event:", event.currentTarget);
  
  const container = event.currentTarget;
  
  // Check if focus moved outside the container
  setTimeout(() => {
    if (!container.contains(document.activeElement)) {
      container.classList.remove('has-focused-child');
      
      dispatch(
        UIActions.setFocusContext({
          containerId: container.id,
          hasInnerFocus: false
        })
      );
    }
  }, 0);
};

/**
 * Validate input field when it loses focus
 */
const validateInput = (element: HTMLElement) => {
  const value = (element as HTMLInputElement).value;
  const fieldName = element.getAttribute('name') || element.id;
  
  // Basic validation logic
  if (element.hasAttribute('required') && !value.trim()) {
    UIActions.setFieldError(fieldName, 'This field is required');
    element.classList.add('error');
    return false;
  }
  
  // Email validation
  if (element.getAttribute('type') === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      UIActions.setFieldError(fieldName, 'Please enter a valid email address');
      element.classList.add('error');
      return false;
    }
  }
  
  // Clear any previous errors
  UIActions.clearFieldError(fieldName);
  element.classList.remove('error');
  return true;
};

/**
 * Auto-save field value when it loses focus
 */
const handleAutoSave = (element: HTMLElement) => {
  const value = (element as HTMLInputElement).value;
  const fieldId = element.id;
  
  console.log(`Auto-saving field ${fieldId}:`, value);
  
  // Dispatch auto-save action
  dispatch(
    UIActions.autoSaveField({
      fieldId,
      value,
      timestamp: new Date().toISOString()
    })
  );
  
  // Show save confirmation
  UIActions.showNotification({
    message: 'Changes saved',
    type: 'success',
    duration: 2000
  });
};

/**
 * Composite focus handler for common focus-related operations
 */
export const createFocusHandler = (options: {
  onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  validate?: boolean;
  autoSave?: boolean;
}) => {
  return (event: React.FocusEvent<HTMLElement>) => {
    const { type } = event;
    
    if (type === 'focus') {
      handleFocus(event);
      options.onFocus?.(event);
    } else if (type === 'blur') {
      if (options.validate) {
        validateInput(event.currentTarget);
      }
      if (options.autoSave) {
        handleAutoSave(event.currentTarget);
      }
      handleBlur(event);
      options.onBlur?.(event);
    }
  };
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



Drag & Drop events

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

// Clipboard events
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


// UI events

const handleScrolling = (event: React.UIEvent<HTMLDivElement>) => {
  // Logic for handling scrolling
  const scrollTop = event.currentTarget.scrollTop;

  // Your custom logic for scrolling
  console.log("Scrolling event detected!");
  console.log("Scroll position:", scrollTop);

  // Update UI or state based on scroll position
  UIActions.updateScrollingState(scrollTop);
};

// Export individual handlers
export {
    handleBlur, handleCopyPaste, handleDragEnd,
    handleDragEnter,
    handleDragOver, handleDragStart, handleEvent, handleFocus, handleFocusIn, handleFocusOut, handleKeyboardShortcuts,
    handleScrolling, handleTouchCancel, handleTouchEnd, processCopiedText
};

