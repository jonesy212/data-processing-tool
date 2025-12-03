// DynamicEventHandlerExample.tsx
import { TooltipActions } from "@/app/actions/TooltipActions";
import { UIActions } from "@/app/actions/UIActions";
import { endpoints } from '@/app/api/endpointConfigurations';
import { useErrorHandling } from "@/app/hooks/useErrorHandling";
import { generateNextPhaseRoute } from '@/app/typings/eventHandlers/factoryHandlers';
import { UIApi } from "@/app/users/APIUI";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const dispatch = useDispatch();
// State and other logic...
const [state, setState] = useState("");
// Initialize the useErrorHandling hook
const useError = useErrorHandling();
// Define the subscription variable
const subscription = null; // You need to define subscription before passing it to cleanupState
const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });

const history = useNavigate();

const UI_API_URL = endpoints.uiSettings;

const handleButtonClick = (
  event: React.MouseEvent<HTMLButtonElement>,
  handler: (event: React.MouseEvent<HTMLButtonElement>) => void
) => {
  handler(event);
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
