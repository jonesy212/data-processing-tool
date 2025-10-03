// movementAnimations/useMovementAnimations.ts
import { RefObject, useState } from "react";

interface MovementAnimationActions {
  slide: (
    distance: number,
    direction: "left" | "right" | "up" | "down",
    target?: RefObject<HTMLElement>
  ) => void;
  drag: (target?: RefObject<HTMLElement>) => void;
  show: (
    target?: RefObject<HTMLElement>,
    alignment?: "left" | "center" | "right"
  ) => void;
  hide: (target?: RefObject<HTMLElement>) => void;
  isSliding: boolean;
  isDragging: boolean;
  // Add more movement animation methods as needed
}

export const useMovementAnimations = (): MovementAnimationActions => {
  const [isSliding, setIsSliding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const slide = (
    distance: number,
    direction: "left" | "right" | "up" | "down",
    target?: RefObject<HTMLElement>
  ) => {
    if (target && target.current) {
      // Stacking or Layering Check
      const existingElements = target.current.querySelectorAll(
        ".collaboration-element"
      );
      if (existingElements.length === 0) {
        setIsSliding(true);
        // Implement sliding animation logic based on distance and direction
        // Set isSliding to false during the animation and handle cleanup
        setTimeout(() => {
          setIsSliding(false);
        }, 1000); // Adjust the duration as needed
      } else {
        // Existing elements found, handle accordingly (e.g., prevent sliding)
        console.log("Existing elements found, consider preventing sliding.");
      }
    }
  };

  const drag = (target?: RefObject<HTMLElement>) => {
    setIsDragging(true);
  
    // Get the target element
    const element = target?.current;
  
    // Check if the target element exists
    if (element) {
      // Add event listeners for mouse events to track dragging
      const handleMouseDown = (event: MouseEvent) => {
        // Calculate the initial mouse position relative to the element
        const initialX = event.clientX - element.offsetLeft;
        const initialY = event.clientY - element.offsetTop;
  
        // Function to handle mouse move events during dragging
        const handleMouseMove = (event: MouseEvent) => {
          // Calculate the new element position based on mouse movement
          const newX = event.clientX - initialX;
          const newY = event.clientY - initialY;
  
          // Set the new element position
          element.style.left = `${newX}px`;
          element.style.top = `${newY}px`;
        };
  
        // Function to handle mouse up event to stop dragging
        const handleMouseUp = () => {
          // Remove event listeners for mouse move and mouse up
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
  
          // Set isDragging to false to indicate dragging has stopped
          setIsDragging(false);
        };
  
        // Add event listeners for mouse move and mouse up
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      };
  
      // Add event listener for mouse down on the element to start dragging
      element.addEventListener('mousedown', handleMouseDown);
    }
  }

  const show = (
    target?: RefObject<HTMLElement>,
    alignment?: 'left' | 'center' | 'right',
  ) => {
    if (target && target.current) {
      // Stacking or Layering Check
      const existingElements = target.current.querySelectorAll('.collaboration-element');
      if (existingElements.length === 0) {
        setIsSliding(true);
            // Implement show animation logic
      const element = target.current;
      element.style.display = 'block'; // Ensure the element is visible
      
      // Adjust the element's position based on alignment
      switch (alignment) {
        case 'left':
          element.style.left = '0';
          break;
        case 'center':
          element.style.left = '50%';
          element.style.transform = 'translateX(-50%)';
          break;
        case 'right':
          element.style.right = '0';
          break;
        default:
          break;
      }

        // Simulate animation completion
        setTimeout(() => {
          setIsSliding(false);
        }, 1000); // Adjust the duration as needed
      } else {
        // Existing elements found, handle accordingly (e.g., prevent showing)
        console.log('Existing elements found, consider preventing showing.');
      }
    }
  };
  
  const hide = (target?: RefObject<HTMLElement>) => {
    // Implement hide animation logic
    // Set the target element's position to hide it and handle cleanup
    if (target && target.current) {
      // Adjust element positioning to hide it
      const element = target.current;
      // Adjust element positioning to hide it
      element.style.opacity = '0'; // Example: Set opacity to 0 for hiding
      element.style.transition = 'opacity 1s ease'; // Example: Apply transition for smooth hiding
  
      // Simulate animation completion
      setTimeout(() => {
        // Handle cleanup or additional logic after animation
      }, 1000); // Adjust the duration as needed
    }
  };

  // Add more movement animation methods as needed

  return {
    slide,
    drag,
    show,
    hide,
    isSliding,
    isDragging,
    // Add more movement animation methods as needed
  };
};

export type { MovementAnimationActions}