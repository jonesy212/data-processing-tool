import { Message } from "@/app/generators/GenerateChatInterfaces";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { SyntheticEvent, UIEvent, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { DragActions } from "../actions/DragActions";
import { EventHandlerActions } from "../actions/EventHanderActions";
import { ZoomActions } from "../actions/ZoomActions";
import DynamicEventHandlerExample from "../documents/screenFunctionality/ShortcutKeys";
import ReusableButton from "../libraries/ui/buttons/ReusableButton";
import { sanitizeData, sanitizeInput } from "../security/SanitizationFunctions";
import SnapshotList from "../snapshots/SnapshotList";
import UserService from "../users/ApiUser";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import { MouseActions } from "../actions/MouseActions";
import { UIActions } from "../actions/UIActions";
import { BaseCustomEvent } from "./BaseCustomEvent";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { AxiosResponse } from "axios";
import * as ApiAnalysis from '../../api/ApiAnalysisService'
const dispatch = useDispatch();
type ReactiveWheelEvent = WheelEvent & React.WheelEvent<Element>;
export type ReactiveEventHandler = Event &
  KeyboardEvent &
  MouseEvent &
  React.SyntheticEvent &
  React.KeyboardEvent<HTMLInputElement> &
  React.WheelEvent<HTMLDivElement> & React.MouseEvent<HTMLButtonElement> &
  KeyboardEvent & BaseCustomEvent;


  export type ReactiveEventListener = EventListenerOrEventListenerObject & ReactiveEventHandler
export type ZoomWheeEventListener = ReactiveEventListener & ReactiveWheelEvent

const createEventHandler = DynamicEventHandlerExample.createEventHandler;

interface CustomEventListener extends EventListener {
  createEventHandler: (
    eventName: string,
    handler: (event: ReactiveEventHandler) => void
  ) => EventListenerOrEventListenerObject;

  handleMouseClick: (event: ReactiveEventHandler) => void;
  handleKeyboardEvent: (event: ReactiveEventHandler) => void;
  handleSorting: (event: React.MouseEvent<HTMLElement>) => void;
  handleMouseEvent: (event: React.MouseEvent<HTMLElement>) => void;
  handleKeyboardShortcuts: (event: React.SyntheticEvent) => void;
  handleScrolling: (event: Event) => void;
  handleHighlighting: (
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => void;
  handleAnnotations: (event: React.MouseEvent<HTMLElement>) => void;
  handleCopyPaste: (event: React.ClipboardEvent) => void;
  handleZoom: (event: React.WheelEvent<HTMLDivElement>) => ReactiveEventListener;
  handleDragStart: (event: React.DragEvent<HTMLElement>) => void;
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
  handlePointerDown: (event: React.PointerEvent) => void;
  handlePointerMove: (event: React.PointerEvent) => void;
  handlePointerUp: (event: React.PointerEvent) => void;
  handlePointerCancel: (event: React.PointerEvent) => void;
  handlePointerEnter: (event: React.PointerEvent) => void;
  handlePointerLeave: (event: React.PointerEvent) => void;
  handlePointerOver: (event: React.PointerEvent) => void;
  handlePointerOut: (event: React.PointerEvent) => void;
  handleAuxClick: (event: React.MouseEvent<HTMLElement>) => void;

  handleUndoRedo: (event: React.SyntheticEvent) => void;
  handleContextMenus: (event: React.MouseEvent<HTMLElement>) => void;

  handleSettingsPanel: (event: React.MouseEvent<HTMLElement>) => void;
  handleFullscreenMode: (event: React.MouseEvent<HTMLElement>) => void;
  handleHelpFAQ: (event: React.MouseEvent<HTMLElement>) => void;
  handleSearchFunctionality: (event: React.MouseEvent<HTMLElement>) => void;
  handleProgressIndicators: (event: React.MouseEvent<HTMLElement>) => void;
  // handleGestureStart: (event: React.GestureEvent<HTMLElement>) => void;
  // handleGestureChange: (event: React.GestureEvent<HTMLElement>) => void;
  // handleGestureEnd: (event: React.GestureEvent<HTMLElement>) => void;
}

const DynamicEventHandlerService = ({
  handleSorting,
}: {
  handleSorting: (
    snapshotList: SnapshotList,
    event: SyntheticEvent<Element, Event>
  ) => void;
}) => {
  // State and other logic...

  // State to track messages
  const [messages, setMessages] = useState<string[]>([]);
  const snapshhotListRef = useRef<SnapshotList>();
  const handleSortingWrapper = (snapshotList: SnapshotList) => {
    // Handle sorting logic
    // Assuming snapshotList is an array or object with sorting functionality
    snapshotList.sort();

    // Add message
    addMessage("Sorted snapshots");
    return (event: SyntheticEvent<Element, Event>) => {
      handleSorting(snapshotList, event);
    };
  };

  const handleSortingEvent = createEventHandler(
    "handleSorting",
    handleSortingWrapper(snapshhotListRef.current!)
  );

  // Helper function to add messages
  const addMessage = (message: string) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  // // Helper function to add messages
  // const addMessage = (message: Message) => {
  //   setMessages((prevMessages: Message[]) => [...prevMessages, message as Message]);
  // };

  const handleKeyboardShortcuts = createEventHandler(
    "handleKeyboardShortcuts",
    (event: ReactiveEventHandler) => {
      // Handle keyboard shortcuts logic
      console.log("Handling keyboard shortcuts:", event);
      // Prevent default browser behavior for some shortcuts
      event.preventDefault();
    }
  );

  const handleMouseClick = createEventHandler(
    "handleMouseClick",
    (event: ReactiveEventHandler) => {
      // Handle mouse click logic
      console.log("Handling mouse click:", event);

      return () => { };
    }
  );

  const handleButtonClick = createEventHandler(
    "handleButtonClick",
    (event: ReactiveEventHandler) => {
      // Handle button click logic
      console.log("Handling button click:", event);

      return () => { };
    }
  );

  const handleDivMouseMove = createEventHandler(
    "handleDivMouseMove",
    (event: ReactiveEventHandler) => {
      console.log("Handling div mouse move:", event);

      return () => { };
    }
  );

  const handleContextMenu = createEventHandler(
    "handleContextMenu",
    (event: React.SyntheticEvent) => {
      console.log("Handling context menu:", event);

      return () => { };
    }
  );

  const handleDynamicEvent = (eventName: any, handler: any) => {
    switch (eventName) {
      case "handleKeyboardShortcuts":
        return handleKeyboardShortcuts;

      case "handleMouseClick":
        return handleMouseClick;

      case "handleButtonClick":
        return handleButtonClick;
      case "handleDivMouseMove":
        return handleDivMouseMove;
      case "handleContextMenu":
        return handleContextMenu;
      case "handleDynamicEvent":
        return handleDynamicEvent;
      default:
        throw new Error(`No handler found for event: ${eventName}`);
    }
  };

  // Define the event listener function
  const scrollEventListener: EventListener = (event: Event) => {
    // Access scroll-related information
    const scrollEvent = event as ReactiveWheelEvent;
    const scrollTop = scrollEvent.currentTarget.scrollTop;
    const scrollLeft = scrollEvent.currentTarget.scrollLeft;

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
    DynamicEventHandlerExample.handleScrolling(scrollEvent);
  };
  const handleScrolling = createEventHandler(
    "handleScrolling",
    (event: Event) => {
      // Accessing scroll-related information
      const scrollTop = (event.currentTarget as Element).scrollTop;
      const scrollLeft = (event.currentTarget as Element).scrollLeft;

      // Your custom logic for handling scrolling
      console.log("Handling scrolling:");
      console.log("Scroll Top:", scrollTop);
      console.log("Scroll Left:", scrollLeft);

      // Additional logic based on scroll position or other scroll-related information
      if (scrollTop > 100) {
        // Perform an action when the scroll position is beyond a certain point
        console.log("You scrolled beyond 100 pixels from the top.");
      }

      // Call the original handler if needed
      DynamicEventHandlerExample.handleScrolling(event);

      // You may not need to return anything here
    }
  );

  const handleZoom = (event: ZoomWheeEventListener) => {
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
        highlightEvent: event, // or provide the appropriate mouse event
        clientX: event.clientX, // or provide the appropriate clientX value
        clientY: event.clientY, // or provide the appropriate clientY value
      })
    );
    DynamicEventHandlerExample.handleZoom(event);
    
  };


  
  
  const handleKeyboardEvent = (event: EventListenerOrEventListenerObject) => createEventHandler(
    "handleKeyboardEvent",
    (event: ReactiveEventHandler) => {
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

      DynamicEventHandlerExample.handleKeyboardEvent(event);
    }
  );


  const handleHighlighting = createEventHandler(
    "handleKeyboardEvent",
    (event: ReactiveEventHandler) => {
      // Access highlighting-related information
      const highlightEvent = event;

      // Accessing highlighting-related information
      const selectedText = window.getSelection()?.toString();

      // Your custom logic for handling highlighting
      console.log("Handling highlighting:");
      console.log("Selected Text:", selectedText);

      // Additional logic for highlighting...
      if (selectedText) {
        event.preventDefault();
        const messageId = UniqueIDGenerator.generateMessageID();
        const currentUser = UserService.getCurrentUserId(); // Call getCurrentUserId method

        // Call original handler
        DynamicEventHandlerExample.handleHighlighting(event);
        // Handle mouse events
        const x = event.clientX;
        const y = event.clientY;
        console.log("Mouse position:", x, y);
        // Additional mouse event handling logic
        if (event.type === "mousedown") {
          console.log("Mouse down detected");
          // Perform mouse down logic here
          if (event.type === "mousedown") {
            console.log("Performing mouse down logic");
            // Add mouse down logic here
            dispatch(MouseActions.mouseDown({
              clientX: event.clientX,
              clientY: event.clientY,
              altKey: false,
              button: 0,
              buttons: 0,
              ctrlKey: false,
              layerX: 0,
              layerY: 0,
              metaKey: false,
              movementX: 0,
              movementY: 0,
              offsetX: 0,
              offsetY: 0,
              pageX: 0,
              pageY: 0,
              relatedTarget: null,
              screenX: 0,
              screenY: 0,
              shiftKey: false,
              x: 0,
              y: 0,
              getModifierState: function (keyArg: string): boolean {
                // Return true if modifier key is pressed
                if (keyArg === 'Alt') {
                  return event.altKey;
                } else if (keyArg === 'Control') {
                  return event.ctrlKey;
                }
                else if (keyArg === 'Shift') {
                  return event.shiftKey;
                } else if (keyArg === 'Meta')
                  return event.metaKey;
                return false;
              },
              initMouseEvent: function (typeArg: string,
                canBubbleArg: boolean, cancelableArg: boolean,
                viewArg: Window, detailArg: number, screenXArg: number,
                screenYArg: number, clientXArg: number, clientYArg: number,
                ctrlKeyArg: boolean, altKeyArg: boolean, shiftKeyArg: boolean,
                metaKeyArg: boolean, buttonArg: number,
                relatedTargetArg: EventTarget | null
              ): void {

              },
              detail: 0,
              view: null,
              which: 0,
              initUIEvent: function (typeArg: string, bubblesArg?: boolean
                | undefined, cancelableArg?: boolean
                  | undefined, viewArg?: Window | null
                    | undefined, detailArg?: number
                      | undefined): void {
                const mouseEvent = new MouseEvent('mousedown', {
                  clientX: event.clientX,
                  clientY: event.clientY
                });
                MouseActions.mouseDown(mouseEvent);
              },
              bubbles: false,
              cancelBubble: false,
              cancelable: false,
              composed: false,
              currentTarget: null,
              defaultPrevented: false,
              eventPhase: 0,
              isTrusted: false,
              returnValue: false,
              srcElement: null,
              target: null,
              timeStamp: 0,
              type: "",
              composedPath: function (): EventTarget[] {
                // Return array containing target and ancestors
                return [event.currentTarget];
              },
              initEvent: function (
                type: string,
                bubbles?: boolean | undefined,
                cancelable?: boolean | undefined
              ): void {
                const event = new MouseEvent(type, {
                  bubbles: !!bubbles,
                  cancelable: !!cancelable,
                });
                Object.assign(this, event);
              },
              preventDefault: function (): void {
                event.preventDefault();
              },
              stopImmediatePropagation: function (): void {
                event.stopImmediatePropagation();
              },
              stopPropagation: function (): void {
                event.stopPropagation();
              },
              NONE: 0,
              CAPTURING_PHASE: 1,
              AT_TARGET: 2,
              BUBBLING_PHASE: 3
            }));

          }

        }
        if (event.type === "mouseup") {
          console.log("Mouse up detected");
        }
      }
      // Call original handler
      DynamicEventHandlerExample.handleAnnotations(event);
      // Handle mouse events
      const x = event.clientX;
      const y = event.clientY;
      console.log("Mouse position:", x, y);
      // Additional mouse event handling logic
      if (event.type === "mouseup") {
        console.log("Mouse up detected");
      }

    }
  )




  const handleAnnotations = createEventHandler(
    "handleAnnotations",
    (event: ReactiveEventHandler) => {
      // Access annotation-related information
      const selectedText = window.getSelection()?.toString();

      // Your custom logic for handling annotations
      const annotationDetails =
        event.currentTarget.getAttribute("data-annotation");

      // Your custom logic for handling annotations
      console.log("Handling annotations:");
      console.log("Annotation Details:", annotationDetails);

      //  update UI based on annotations or trigger further actions.
      const messageId = UniqueIDGenerator.generateMessageID();
      const message: Partial<Message> = {
        id: messageId,
        content: `You annotated: ${annotationDetails || ""}`,
      };
      addMessage(message.toString());
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

      // Add more specific logic based on your application's requirements
    }
  );


  const handleCopyPaste = createEventHandler(
    "handleCopyPaste",
    (event: ReactiveEventHandler) => {
      // Access clipboard data
      const clipboardData = event.clipboardData;
      // Handle paste event
      if (event.type === "paste") {
        console.log("Paste detected");
      }
      // Handle copy event
      if (event.type === "copy") {
        console.log("Copy detected");
      }
      // Prevent default behavior for copy/paste events
      if (event.type === "copy" || event.type === "paste") {
        event.preventDefault();
      }



      // Accessing copy/paste-related information
      const copiedText = event.clipboardData?.getData("text"); // Retrieve copied text

      // Your custom logic for handling copy/paste
      console.log("Handling copy/paste:");
      console.log("Copied Text:", copiedText);

      // Additional logic for copy/paste...
      if (copiedText) {
        // Perform action on paste like adding to clipboard history
        addToClipboardHistory(copiedText);
      }

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

      const processCopiedText = async (
        text: string,
        analysisType: AnalysisTypeEnum
      ): Promise<void> => {
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

        if (copiedText) {
          const analysisType = AnalysisTypeEnum.SENTIMENT;
          // Process the copied text, such as formatting or analyzing it
          const processedText = processCopiedText(copiedText, analysisType);
          console.log("Processed Copied Text:", processedText);

          // Update the UI based on the copied text, e.g., display a notification or apply styles
          updateUIWithCopiedText(processedText);

          updateUI;
          // Perform action on paste like adding to clipboard history
          addToClipboardHistory(copiedText);
        } else {
          console.log("No text copied.");
        }
    
        // Additional logic for copy/paste events can go here
        return clipboardData;
      }
    }
  );

  const handleUndoRedo = createEventHandler(
    "handleUndoRedo",
    (event: ReactiveEventHandler) => {

      // Access clipboard data
      const clipboardData = event.clipboardData

      // Handle paste event
      if (event.type === "undo") {
        console.log("Undo triggered");
      }

      // Handle redo event
      if (event.type === "redo") {
        console.log("Redo triggered");
      }
      // Additional logic for undo/redo events can go here
      return event;
    }
  )


  const handleContextMenus = createEventHandler(
    "handleContextMenus",
    (event: ReactiveEventHandler) => {
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
    },
    // Add UI update or other logic specific to context menus
  );
  

  const handleFullscreenMode = createEventHandler(
    "handleFullscreenMode",
    (event: ReactiveEventHandler) => {
      // Handle fullscreen requests
      if (event.type === "fullscreenchange") {
        console.log("Fullscreen mode changed");
      }
      // Check if entering fullscreen mode
      if (event.type === "fullscreenchange" && document.fullscreenElement) {
        console.log("Entering fullscreen mode");
      }
      // Check if exiting fullscreen mode
      else if (event.type === "fullscreenchange" && !document.fullscreenElement) {
        console.log("Exiting fullscreen mode");
      }
      // Reset fullscreen state on exit
      if (event.type === "fullscreenchange" && !document.fullscreenElement) {
        document.exitFullscreen();
      }
      // Additional logic for fullscreen mode changes
      return event;
    }
  )



  const handleMouseEvent = createEventHandler(
    "handleMouseEvent",
    (event: ReactiveEventHandler) => {
      // Access mouse-related information
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // Your custom logic for handling mouse events
      console.log("Handling mouse event:");
      console.log("Mouse X:", mouseX);
      console.log("Mouse Y:", mouseY);
      // Call original handler
      DynamicEventHandlerExample.handleMouseEvent(event);
      // Additional logic for mouse events can go here
      return event;
    })

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
    }

    const handleMouseEvent = (event: Event) => {
      const sanitizedData = event.currentTarget
        ? sanitizeData(event.currentTarget.toString())
        : null;
      console.log("Sanitized data:", sanitizedData);
      DynamicEventHandlerExample.handleMouseClick(event as ReactiveEventHandler);
      console.log("Handling mouse event:", event);
    };

    // Add event listener with the scrollEventListener function
    window.addEventListener("scroll", scrollEventListener);
    window.addEventListener("click", handleMouseEvent);
    window.addEventListener("wheel", handleZoom as EventListenerOrEventListenerObject & WheelEvent);
    window.addEventListener("mouseup", handleHighlighting);
    // window.addEventListener("mousemove", handleMouseMovement);
    window.addEventListener("mousedown", handleAnnotations);
    window.addEventListener("copy", handleCopyPaste);
    window.addEventListener("redo", handleUndoRedo);
    window.addEventListener("contextmenu", handleContextMenus);
    window.addEventListener("fullscreen", handleFullscreenMode);
    window.addEventListener("settingsPanel", handleSettingsPanel);
    window.addEventListener("helpFAQ", handleHelpFAQ);
    window.addEventListener("searchFunctionality", handleSearchFunctionality);
    window.addEventListener("progressIndicators", handleProgressIndicators);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyboardEvent);
      window.removeEventListener("click", handleMouseEvent);
      window.removeEventListener("scroll", handleScrolling);
      window.removeEventListener("wheel", handleZoom);
      window.removeEventListener("mouseup", handleHighlighting);
      window.removeEventListener("mousedown", handleAnnotations);
      window.removeEventListener("copy", handleCopyPaste);
      window.removeEventListener("redo", handleUndoRedo);
      window.removeEventListener("contextmenu", handleContextMenus);
      window.removeEventListener("fullscreen", handleFullscreenMode);
      window.removeEventListener("settingsPanel", handleSettingsPanel);
      window.removeEventListener("helpFAQ", handleHelpFAQ);
      window.removeEventListener(
        "searchFunctionality",
        handleSearchFunctionality
      );
      window.removeEventListener(
        "progressIndicators",
        handleProgressIndicators
      );
    };
  }, [
    handleKeyboardEvent,
    handleZoom,
    handleAnnotations,
    handleMouseEvent,
    scrollEventListener,
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
    handleBeforeUnload,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerOver,
    handlePointerOut,
    handleAuxClick,
    handleGestureStart,
    handleGestureChange,
    handleGestureEnd,
  ]);
  }, [
    handleKeyboardEvent,
    handleZoom,
    handleAnnotations,
    handleMouseEvent,
    scrollEventListener,
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
    handleBeforeUnload,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerOver,
    handlePointerOut,
    handleAuxClick,
    handleGestureStart,
    handleGestureChange,
    handleGestureEnd,
  ]);

  useEffect(() => {
    const createEventHandler = DynamicEventHandlerExample.createEventHandler;

    const keyboardEventHandler = createEventHandler(
      "handleKeyboardShortcuts",
      DynamicEventHandlerExample.handleKeyboardShortcuts
    );

    const handleSortingEvent = createEventHandler(
      "handleSorting",
      (event: React.SyntheticEvent) => {
        // Logic for handling sorting event
        console.log("Handling sorting event:", event);
        DynamicEventHandlerExample.handleSorting(event);
      }
    );

    const mouseClickEventHandler = createEventHandler(
      "handleMouseClick",
      DynamicEventHandlerExample.handleMouseClick
    );

    const handleDynamicEvent = createEventHandler(
      "handleDynamicEvent",
      (event: React.SyntheticEvent) => {
        console.log("Handling dynamic event:", event);
      }
    );

    const handleContextMenu = createEventHandler(
      "contextMenu",
      (event: React.SyntheticEvent) => {
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
    const handleClickOutside = createEventHandler(
      "handleClickOutside",
      (event: MouseEvent) => {
        // Logic for handling click outside of component
        console.log("Click outside handled");
      } 
    )

    const handleHighlighting = (event: EventListenerOrEventListenerObject) => createEventHandler(
      "handleHighlighting",
      (event: MouseEvent): EventListenerOrEventListenerObject => {
        console.log("Handling text highlighting:", event);

        // Logic for handling text selection/highlighting
        const selection = window.getSelection();
        // Update UI to show highlighted text
        const highlightedTextElement =
          document.getElementById("highlightedText");
        if (highlightedTextElement && selection) {
          highlightedTextElement.innerHTML = selection.toString();
        }
        return () => {
          // remve event listener on unmount
          document.removeEventListener("click", handleClickOutside);
        };

        // For example, update UI to reflect highlighted text
      }
    );

    const handleAnnotations = createEventHandler(
      "handleAnnotations",
      (event: React.SyntheticEvent) => {
        console.log("Handling annotations:", event);
        // Logic for handling annotations
        const annotationsElement = document.getElementById("annotations");
        if (annotationsElement) {
          annotationsElement.style.display = "block";
          // Update annotations UI
          annotationsElement.innerHTML = "<p>Sample annotation</p>";
          // Close annotations UI on click outside
          document.addEventListener("click", (e: MouseEvent) => {
            if (e.target && !annotationsElement.contains(e.target as Node)) {
              annotationsElement.style.display = "none";
            }
          });
        }
      }
    );

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("selectionchange", handleHighlighting);
    // Attach the event listeners
    window.addEventListener("keydown", keyboardEventHandler);
    window.addEventListener("click", mouseClickEventHandler);
    window.addEventListener("fullscreen", handleDynamicEvent);
    window.addEventListener("customEvent1", handleDynamicEvent);
    window.addEventListener("customEvent2", handleDynamicEvent);

    // Clean up the event listeners
    return () => {
      window.removeEventListener("keydown", keyboardEventHandler);
      window.removeEventListener("click", mouseClickEventHandler);
      window.removeEventListener("fullscreen", handleDynamicEvent);
      window.removeEventListener("customEvent1", handleDynamicEvent);
      window.removeEventListener("customEvent2", handleDynamicEvent);
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
export type { CustomEventListener };
