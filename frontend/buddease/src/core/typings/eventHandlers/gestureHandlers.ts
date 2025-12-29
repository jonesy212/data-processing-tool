// gestureHandlers.ts

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

const handleGestureStart = (event: React.TouchEvent<HTMLDivElement>) => {
  // Logic for gesture start event
  console.log("Gesture started");

  // Example: Update state to indicate gesture in progress
  UIActions.setIsGestureInProgress(true);
  // clear any previous gesture state
  UIActions.setGestureStartPosition({ x: 0, y: 0 });
};
