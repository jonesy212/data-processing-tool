 import { SyntheticEvent, useEffect, useRef, useState } from "react";
import DynamicEventHandlerExample from "../documents/screenFunctionality/ShortcutKeys";
import SnapshotList from "../snapshots/SnapshotList";
import ReusableButton from "../libraries/ui/buttons/ReusableButton";
import { CustomMouseEvent } from "./EventService";





const createEventHandler = DynamicEventHandlerExample.createEventHandler;
  
const DynamicEventHandlerService = ({
  handleSorting,
}: {
    handleSorting: (
      snapshotList: SnapshotList,
      event: SyntheticEvent<Element, Event>) => void
}) => {
  // State and other logic...

  // State to track messages
  const [messages, setMessages] = useState<string[]>([]);
  const snapshhotListRef = useRef<SnapshotList>();
  const handleSortingEvent = createEventHandler(
    "handleSorting",
    (event) => handleSorting(snapshhotListRef.current!, event)
  );

  // Helper function to add messages
  const addMessage = (message: string) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };


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

      // // Helper function to add messages
      // const addMessage = (message: Message) => {
      //   setMessages((prevMessages: Message[]) => [...prevMessages, message as Message]);
      // };
    
  const handleKeyboardShortcuts = createEventHandler(
    "handleKeyboardShortcuts",
    (event) => {
      // Handle keyboard shortcut logic
      console.log("Handling keyboard shortcut:", event);

      return () => {};
    }
  );

  const handleMouseClick = createEventHandler(
    "handleMouseClick",
    (event) => {
      // Handle mouse click logic
      console.log("Handling mouse click:", event);

      return () => {};
    }
  );

  
  const handleButtonClick = createEventHandler(
    "handleButtonClick",
    (event) => {
      // Handle button click logic
      console.log("Handling button click:", event);

      return () => {};
    }
  );


  const handleDivMouseMove = createEventHandler(
    "handleDivMouseMove",
    (event) => {
      console.log("Handling div mouse move:", event);

      return () => {};
    }
  );
  

  const handleContextMenu = createEventHandler(
    "handleContextMenu",
    (event) => {
      console.log("Handling context menu:", event);

      return () => {};
    }
  );
  
  const handleDynamicEvent = (
    eventName: any,
    handler: any) => {
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
  }

  // Usage of event handler functions
  const handleKeyboardEvent = DynamicEventHandlerExample.handleKeyboardEvent;
  const handleMouseEvent = DynamicEventHandlerExample.handleMouseEvent;
  const handleScrolling = DynamicEventHandlerExample.handleScrolling;
  const handleZoom = DynamicEventHandlerExample.handleZoom;
  const handleHighlighting = DynamicEventHandlerExample.handleHighlighting;
  const handleAnnotations = DynamicEventHandlerExample.handleAnnotations;
  const handleCopyPaste = DynamicEventHandlerExample.handleCopyPaste;
  const handleUndoRedo = DynamicEventHandlerExample.handleUndoRedo;
  const handleContextMenus = DynamicEventHandlerExample.handleContextMenus;
  const handleFullscreenMode = DynamicEventHandlerExample.handleFullscreenMode;
  const handleSettingsPanel = DynamicEventHandlerExample.handleSettingsPanel;
  const handleHelpFAQ = DynamicEventHandlerExample.handleHelpFAQ;
  const handleSearchFunctionality =
    DynamicEventHandlerExample.handleSearchFunctionality;
  const handleProgressIndicators =
    DynamicEventHandlerExample.handleProgressIndicators;

  //todo ensure to integrate
  const handleDragStart = DynamicEventHandlerExample.handleDragStart;
  const handleDragEnd = DynamicEventHandlerExample.handleDragEnd;
  const handleDragEnter = DynamicEventHandlerExample.handleDragEnter;
  const handleDragOver = DynamicEventHandlerExample.handleDragOver;
  const handleDragLeave = DynamicEventHandlerExample.handleDragLeave;
  const handleDrop = DynamicEventHandlerExample.handleDrop;
  const handleFocus = DynamicEventHandlerExample.handleFocus;
  const handleBlur = DynamicEventHandlerExample.handleBlur;
  const handleFocusIn = DynamicEventHandlerExample.handleFocusIn;
  const handleFocusOut = DynamicEventHandlerExample.handleFocusOut;
  const handleResize = DynamicEventHandlerExample.handleResize;
  const handleSelect = DynamicEventHandlerExample.handleSelect;
  const handleUnload = DynamicEventHandlerExample.handleUnload;
  const handleBeforeUnload = DynamicEventHandlerExample.handleBeforeUnload;
  const handleTouchStart = DynamicEventHandlerExample.handleTouchStart;
  const handleTouchMove = DynamicEventHandlerExample.handleTouchMove;
  const handleTouchEnd = DynamicEventHandlerExample.handleTouchEnd;
  const handleTouchCancel = DynamicEventHandlerExample.handleTouchCancel;
  const handlePointerDown = DynamicEventHandlerExample.handlePointerDown;
  const handlePointerMove = DynamicEventHandlerExample.handlePointerMove;
  const handlePointerUp = DynamicEventHandlerExample.handlePointerUp;
  const handlePointerCancel = DynamicEventHandlerExample.handlePointerCancel;
  const handlePointerEnter = DynamicEventHandlerExample.handlePointerEnter;
  const handlePointerLeave = DynamicEventHandlerExample.handlePointerLeave;
  const handlePointerOver = DynamicEventHandlerExample.handlePointerOver;
  const handlePointerOut = DynamicEventHandlerExample.handlePointerOut;
  const handleAuxClick = DynamicEventHandlerExample.handleAuxClick;
  const handleGestureStart = DynamicEventHandlerExample.handleGestureStart;
  const handleGestureChange = DynamicEventHandlerExample.handleGestureChange;
  const handleGestureEnd = DynamicEventHandlerExample.handleGestureEnd;

  useEffect(() => {
    // Attach event listeners using the imported event handlers
    window.addEventListener(
      "keydown",
      window.addEventListener("keydown", (event: KeyboardEvent) =>
        handleKeyboardEvent(event)
      )
    );
    // window.addEventListener("click", (event: MouseEvent) => handleMouseEvent(event));
    // window.addEventListener("scroll", handleScrolling);
    // window.addEventListener("wheel", handleZoom);
    // window.addEventListener("mouseup", handleHighlighting);
    // window.addEventListener("mousedown", handleAnnotations);
    // window.addEventListener("copy", handleCopyPaste);
    // window.addEventListener("redo", handleUndoRedo);
    // window.addEventListener("contextmenu", handleContextMenus);
    // window.addEventListener("fullscreen", handleFullscreenMode);
    // window.addEventListener("settingsPanel", handleSettingsPanel);
    // window.addEventListener("helpFAQ", handleHelpFAQ);
    // window.addEventListener("searchFunctionality", handleSearchFunctionality);
    // window.addEventListener("progressIndicators", handleProgressIndicators);
  
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener("keydown", (event: React.KeyboardEvent<HTMLInputElement>) =>
        handleKeyboardEvent(event)
      );
      // window.removeEventListener("click", (event: MouseEvent) => handleMouseEvent(event as unknown as CustomMouseEvent<Element>));
      // window.removeEventListener("scroll", handleScrolling);
      // window.removeEventListener("wheel", handleZoom);
      // window.removeEventListener("mouseup", handleHighlighting);
      // window.removeEventListener("mousedown", handleAnnotations);
      // window.removeEventListener("copy", handleCopyPaste);
      // window.removeEventListener("redo", handleUndoRedo);
      // window.removeEventListener("contextmenu", handleContextMenus);
      // window.removeEventListener("fullscreen", handleFullscreenMode);
      // window.removeEventListener("settingsPanel", handleSettingsPanel);
      // window.removeEventListener("helpFAQ", handleHelpFAQ);
      // window.removeEventListener("searchFunctionality", handleSearchFunctionality);
      // window.removeEventListener("progressIndicators", handleProgressIndicators);
    };
  }, [handleKeyboardEvent, handleMouseEvent,

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
  )
  
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
        };
      }
    );

    const handleHighlighting = createEventHandler(
      "handleHighlighting",
      (event: React.SyntheticEvent) => {
        console.log("Handling text highlighting:", event);

        // Logic for handling text selection/highlighting
        const selection = window.getSelection();
        // Update UI to show highlighted text
        const highlightedTextElement = document.getElementById("highlightedText");
        if (highlightedTextElement && selection) {
          highlightedTextElement.innerHTML = selection.toString();
        }
        return () => {
          window.removeEventListener("selectionchange", handleHighlighting);
        };

        // For example, update UI to reflect highlighted text
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
  }, [handleSortingEvent, handleKeyboardShortcuts, handleMouseClick, handleHighlighting, handleContextMenu, handleDynamicEvent]);


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
        label ="" 
        onEvent= {handleButtonClick}
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
