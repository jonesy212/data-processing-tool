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
    // Implement dragging animation logic
    // Set isDragging to false during the animation and handle cleanup
    setTimeout(() => {
      setIsDragging(false);
    }, 1000); // Adjust the duration as needed
  };

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
        // Set the target element's position based on alignment and handle cleanup
        // ...

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
      const element = target.current;
      // Adjust element positioning to hide it
      // ...

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
