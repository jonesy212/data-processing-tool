appEventHandlers.ts


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



// Example usage:
// Pass settings data when calling handleSettingsPanel
handleSettingsPanel(event, { isOpen: true });
