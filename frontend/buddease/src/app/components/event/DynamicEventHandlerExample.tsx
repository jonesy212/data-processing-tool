import { SyntheticEvent, useEffect, useState } from "react";
import SnapshotList from "../snapshots/SnapshotList";
import DynamicEventHandlerExample from "../documents/screenFunctionality/ShortcutKeys";
import { createEvent } from "@testing-library/react";
import { setMessages } from "../state/redux/slices/ChatSlice";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import useSorting from "../hooks/useSorting";





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


const handleSortingEvent = createEventHandler(
  "handleSorting",
  handleSorting
)
  // Helper function to add messages
  const addMessage = (message: string) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const sort = useSorting
    (messages,
    setMessages
  );
   handleSorting = (snapshotList: SnapshotList) => {
    // Handle sorting logic
    // Assuming snapshotList is an array or object with sorting functionality
    snapshotList.sort();

    // Add message
    addMessage("Sorted snapshots");
  };
};

      // Helper function to add messages
      const addMessage = (message: Message) => {
        setMessages((prevMessages: Message[]) => [...prevMessages, message as Message]);
      };
    
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
  //   window.addEventListener("keydown", handleKeyboardEvent);
  //   window.addEventListener("click", handleMouseEvent);
  //   window.addEventListener("scroll", handleScrolling);
  //   window.addEventListener("wheel", handleZoom);
  //   window.addEventListener("mouseup", handleHighlighting);
  //   window.addEventListener("mousedown", handleAnnotations);
  //   window.addEventListener("copy", handleCopyPaste);
  //   window.addEventListener("redo", handleUndoRedo);
  //   window.addEventListener("contextmenu", handleContextMenus);
  //   window.addEventListener("fullscreen", handleFullscreenMode);
  //   window.addEventListener("settingsPanel", handleSettingsPanel);
  //   window.addEventListener("helpFAQ", handleHelpFAQ);
  //   window.addEventListener("searchFunctionality", handleSearchFunctionality);
  //   window.addEventListener("progressIndicators", handleProgressIndicators);
  
  //   // Clean up event listeners on unmount
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyboardEvent);
  //     window.removeEventListener("click", handleMouseEvent);
  //     window.removeEventListener("scroll", handleScrolling);
  //     window.removeEventListener("wheel", handleZoom);
  //     window.removeEventListener("mouseup", handleHighlighting);
  //     window.removeEventListener("mousedown", handleAnnotations);
  //     window.removeEventListener("copy", handleCopyPaste);
  //     window.removeEventListener("redo", handleUndoRedo);
  //     window.removeEventListener("contextmenu", handleContextMenus);
  //     window.removeEventListener("fullscreen", handleFullscreenMode);
  //     window.removeEventListener("settingsPanel", handleSettingsPanel);
  //     window.removeEventListener("helpFAQ", handleHelpFAQ);
  //     window.removeEventListener("searchFunctionality", handleSearchFunctionality);
  //     window.removeEventListener("progressIndicators", handleProgressIndicators);
  //   };
  }, [handleKeyboardEvent, handleMouseEvent, handleScrolling, handleZoom, handleHighlighting, handleAnnotations, handleCopyPaste, handleUndoRedo, handleContextMenus, handleFullscreenMode, handleSettingsPanel, handleHelpFAQ, handleSearchFunctionality, handleProgressIndicators, handleDragStart, 
  //   handleDragEnd, 
  //   handleDragEnter, 
  //   handleDragOver, 
  //   handleDragLeave, 
  //   handleDrop, 
  //   handleFocus, 
  //   handleBlur, 
  //   handleFocusIn, 
  //   handleFocusOut, 
  //   handleResize, 
  //   handleSelect, 
  //   handleUnload, 
  //   handleBeforeUnload, 
  //   handleTouchStart, 
  //   handleTouchMove, 
  //   handleTouchEnd, 
  //   handleTouchCancel, 
  //   handlePointerDown, 
  //   handlePointerMove, 
  //   handlePointerUp, 
  //   handlePointerCancel, 
  //   handlePointerEnter, 
  //   handlePointerLeave, 
  //   handlePointerOver, 
  //   handlePointerOut, 
  //   handleAuxClick, 
  //   handleGestureStart, 
  //   handleGestureChange, 
  //   handleGestureEnd, 
    ]);
  
    const handleSortingEvent = createEventHandler(
      "handleSorting",
      (event: React.SyntheticEvent) => {
        // Logic for handling sorting
        console.log("Handling sorting:", event);
  
        // Additional logic for sorting...
        // For example, trigger a sorting algorithm or update UI based on sorting action.
        const sortableList = document.getElementById("sortableList");
  
        if (sortableList) {
          // Simulate sorting algorithm (e.g., sorting list items alphabetically)
          const listItems = Array.from(sortableList.children);
          const sortedItems = listItems.sort(
            (a, b) => a.textContent?.localeCompare(b.textContent || "") || 0
          );
  
          // Update UI with sorted items
          sortableList.innerHTML = "";
          sortedItems.forEach((item) => sortableList.appendChild(item));
        }
  
        // Remove event listener on unmount
        return () => {
          const sortingButton = document.getElementById("sortingButton");
          if (sortingButton) {
            sortingButton.removeEventListener("click", handleSortingEvent);
          }
        };
      }
    );


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
        onWheel={handleZoom}
        onMouseDown={handleAnnotations}
        onKeyDown={handleKeyboardEvent}
        onMouseUp={handleHighlighting}
        onCopy={handleCopyPaste}
        style={{ border: "1px solid black", padding: "20px" }}
      >
        Hover over me
      </div>
      <h2>Dynamic Event Handlers</h2>
      <button onClick={handleButtonClick}>Click Me</button>
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
