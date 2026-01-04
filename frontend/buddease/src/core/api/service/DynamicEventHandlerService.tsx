DynamicEventHandlerService.tsx

import { CalendarActions } from '@/core/actions/CalendarEventActions';
import { HighlightActions } from '@/core/highlighting/screenFunctionality/HighlightActions';
import { ExtendedRouter } from "@/core/pages/MyAppWrapper";
import { CustomMouseEvent } from '@/core/services/EventService';
import SnapshotList from "@/core/snapshots/SnapshotList";
import { ReactiveMouseEvent } from '@/core/typings/eventHandlers/eventTypes';
import { createEventHandler } from '@/core/typings/eventHandlers/factoryHandlers';
import { Router, useRouter } from "next/router";
import { SyntheticEvent } from 'react';

const DynamicEventHandlerService = ({
  handleSorting,
}: {
  handleSorting: (
    snapshotList: Promise<SnapshotList<T, K>>,
    event: SyntheticEvent<Element, Event> | MouseEvent
  ) => void;
}) => {
  // Define the subscription variable
  const router = useRouter(); // Get the router object using useRouter hook
  const subscription = null; // You need to define subscription before passing it to cleanupState
  const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });

  // State to track messages
  const [messages, setMessages] = useState<string[]>([]);
  const snapshhotListRef = useRef<Promise<SnapshotList<T, K>>>();
  let sentiment: AxiosResponse<any, any>;

  const handleSortingWrapper = (snapshotList: Promise<SnapshotList<T, K>>) => {
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
        const snapshotList: Promise<SnapshotList<T, K>> = apiSnapshot.getSortedList(targetConfig);
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
}

export default DynamicEventHandlerService;
