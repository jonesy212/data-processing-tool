import { MovementAnimationActions, useMovementAnimations } from "@/app/components/libraries/animations/movementAnimations/MovementAnimationActions";
import { useEffect, useRef } from "react";

interface DragEventHandlers extends MovementAnimationActions {
  onDragStart: () => void;
  onDragMove: (dragX: number, dragY: number) => void;
  onDragEnd: (finalX: number, finalY: number) => void;
  beginDrag: (e: MouseEvent | TouchEvent) => void;
  startDrawing: (e: MouseEvent | TouchEvent) => void;
  setDragX: (x: number) => void;
  setDragY: (y: number) => void;
  canDrop: () => boolean;
  isOver: boolean;
  isDragging: boolean; // Define isDragging here
  item: DragObjectWithType; // Define item as a property of type DragObjectWithType

}

export interface DragObjectWithType {
  id: string;
  type: string;
}

interface CollectedProps {
  isDragging: boolean;
}

interface CustomDragObject extends DragObjectWithType {
  id: string;
  type: string;
}

const useDragImpl = (
  id: string,
  type: string,
  onDragStart: () => void,
  onDragMove: (dragX: number, dragY: number) => void,
  onDragEnd: (finalX: number, finalY: number) => void,
  setDragX: (x: number) => void,
  setDragY: (y: number) => void,
): DragEventHandlers => {
  const isDraggingRef = useRef(false);
  const startDragPositionRef = useRef({ x: 0, y: 0 });

  // Integrate movement animation functionalities
  const movementAnimations = useMovementAnimations();

  const handleDragStart = (e: MouseEvent | TouchEvent) => {
    isDraggingRef.current = true;
    const { clientX, clientY } = e instanceof MouseEvent ? e : e.touches[0];
    startDragPositionRef.current = { x: clientX, y: clientY };
    onDragStart(); 
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (isDraggingRef.current) {
      const { clientX, clientY } = e instanceof MouseEvent ? e : e.touches[0];
      const dragX = clientX - startDragPositionRef.current.x;
      const dragY = clientY - startDragPositionRef.current.y;
      onDragMove(dragX, dragY);
    }
  };

  const handleDragEnd = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      // Calculate finalX and finalY based on the starting position
      const finalX = startDragPositionRef.current.x - startDragPositionRef.current.x;
      const finalY = startDragPositionRef.current.y - startDragPositionRef.current.y;
      onDragEnd(finalX, finalY);
    }
  };

  // Define handleDragX and handleDragY
  const handleDragX = (x: number) => {
    setDragX(x);
  };

  const handleDragY = (y: number) => {
    setDragY(y);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("touchmove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchend", handleDragEnd);

    return () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("touchmove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchend", handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  const startDrag = (e: MouseEvent | TouchEvent) => {
    handleDragStart(e);
  };

  // Merge movement animation actions with drag actions
  const mergedActions: DragEventHandlers = {
    ...movementAnimations,
    item: {
      id: id,
      type: type,
    },
    isDragging: true,
    beginDrag: startDrag,
    onDragStart: () => {}, // Example empty functions; adjust as needed
    onDragMove: () => {}, // Example empty functions; adjust as needed
    onDragEnd: handleDragEnd,
    setDragX: handleDragX,
    setDragY: handleDragY,
    canDrop: () => true,
    isOver: false,
    startDrawing: (e) => {
      // Implement startDrawing logic if needed
    },
  };

  return mergedActions;
};


const useDrag = (
  id: string,
  type: string,
  onDragStart: () => void,
  onDragMove: (dragX: number, dragY: number) => void,
  onDragEnd: (finalX: number, finalY: number) => void,
  setDragX: (x: number) => void,
  setDragY: (y: number) => void,
) => useDragImpl(id, type, onDragStart, onDragMove, onDragEnd, setDragX, setDragY);

export { useDrag };
export type { DragEventHandlers };

