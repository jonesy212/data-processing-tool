// EventListenerComponent.tsx
import React, { useEffect } from 'react';
import { DocumentOptions } from '../../documents/DocumentOptions';

const EventListenerComponent: React.FC<{ documentOptions: DocumentOptions }> = ({ documentOptions }) => {
  useEffect(() => {
    // Handle click event
    const handleClick = () => {
      console.log("Click event handled");
    };

    // Handle keydown event
    const handleKeydown = (event: KeyboardEvent) => {
      console.log(`Keydown event handled: ${event.key}`);
    };

    // Handle mousemove event
    const handleMousemove = () => {
      console.log("Mousemove event handled");
    };

    // Collaboration events
    const handleCollaboration = () => {
      console.log("Collaboration event handled");
    };

    // Draggable elements events
    const handleDragStart = (event: DragEvent) => {
      console.log("Drag start event handled");
    };

    const handleDragEnd = (event: DragEvent) => {
      console.log("Drag end event handled");
    };

    // Add event listeners based on document options
    if (documentOptions.isDynamic) {
      window.addEventListener("click", handleClick);
      window.addEventListener("keydown", handleKeydown);
      window.addEventListener("mousemove", handleMousemove);

      // Collaboration events
      window.addEventListener("collaboration", handleCollaboration);

      // Draggable elements events
      window.addEventListener("dragstart", handleDragStart);
      window.addEventListener("dragend", handleDragEnd);

      // Add more event listeners as needed
    }

    return () => {
      // Cleanup: Remove the event listeners when the component unmounts
      if (documentOptions.isDynamic) {
        window.removeEventListener("click", handleClick);
        window.removeEventListener("keydown", handleKeydown);
        window.removeEventListener("mousemove", handleMousemove);

        // Collaboration events
        window.removeEventListener("collaboration", handleCollaboration);

        // Draggable elements events
        window.removeEventListener("dragstart", handleDragStart);
        window.removeEventListener("dragend", handleDragEnd);

        // Remove more event listeners as needed
      }
    };
  }, [documentOptions.isDynamic]); // Dependency array includes isDynamic to react to changes in document options

  // You can use <> and </> for fragments in JSX
  return <>Event Listener Component</>;
};

export default EventListenerComponent;
