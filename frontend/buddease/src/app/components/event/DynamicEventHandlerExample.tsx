import { useEffect, useState } from "react";
import SnapshotList from "../snapshots/SnapshotList";
import DynamicEventHandlerExample from "../documents/screenFunctionality/ShortcutKeys";

const DynamicEventHandlerService = ({
  handleSorting,
}: {
  handleSorting: (snapshotList: SnapshotList) => void;
}) => {
  // State and other logic...

      // State to track messages
      const [messages, setMessages] = useState<string[]>([]);

      // Helper function to add messages
      const addMessage = (message: string) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      };
    

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
    window.addEventListener("keydown", handleKeyboardEvent);
    window.addEventListener("click", handleMouseEvent);
    window.addEventListener("scroll", handleScrolling);
    window.addEventListener("wheel", handleZoom);
    window.addEventListener("mouseup", handleHighlighting);
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
      window.removeEventListener("searchFunctionality", handleSearchFunctionality);
      window.removeEventListener("progressIndicators", handleProgressIndicators);
    };
  }, [handleKeyboardEvent, handleMouseEvent, handleScrolling, handleZoom, handleHighlighting, handleAnnotations, handleCopyPaste, handleUndoRedo, handleContextMenus, handleFullscreenMode, handleSettingsPanel, handleHelpFAQ, handleSearchFunctionality, handleProgressIndicators]);
  
  useEffect(() => {
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
  
    // Example usage
    const createEventHandler = DynamicEventHandlerExample.createEventHandler;
    const keyboardEventHandler = createEventHandler(
      "handleKeyboardShortcuts",
      DynamicEventHandlerExample.handleKeyboardShortcuts
    );
  
    const mouseClickEventHandler = DynamicEventHandlerExample.createEventHandler(
      "handleMouseClick",
      DynamicEventHandlerExample.handleMouseClick
    );
  
    const handleContextMenu = DynamicEventHandlerExample.createEventHandler(
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
