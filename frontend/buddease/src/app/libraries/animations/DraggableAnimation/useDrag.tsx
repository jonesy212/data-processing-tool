import { useEffect, useRef } from 'react';
import { DragSourceHookSpec, DragSourceMonitor } from 'react-dnd';

export interface DragEventHandlers extends DragSourceHookSpec<CustomDragObject, any, CollectedProps> {
  onDragStart: () => void;
  onDragMove: (dragX: number, dragY: number) => void;
  onDragEnd: () => void;
  beginDrag: (e: MouseEvent | TouchEvent) => void;
  startDrawing: (e: MouseEvent | TouchEvent) => void;
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
  onDragEnd: () => void
): DragEventHandlers => {
  const isDraggingRef = useRef(false);
  const startDragPositionRef = useRef({ x: 0, y: 0 });

  const handleDragStart = (e: MouseEvent | TouchEvent) => {
    isDraggingRef.current = true;
    const { clientX, clientY } = e instanceof MouseEvent ? e : e.touches[0];
    startDragPositionRef.current = { x: clientX, y: clientY };
    onDragStart(); // Call onDragStart
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (isDraggingRef.current) {
      const { clientX, clientY } = e instanceof MouseEvent ? e : e.touches[0];
      const dragX = clientX - startDragPositionRef.current.x;
      const dragY = clientY - startDragPositionRef.current.y;
      onDragMove(dragX, dragY); // Call onDragMove
    }
  };

  const handleDragEnd = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      onDragEnd(); // Call onDragEnd
    }
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

  return {
    item: {
      id: id,
      type: type,
    },
    type: "yourDragType",
    isDragging: (monitor: DragSourceMonitor<CustomDragObject, any>) =>
      isDraggingRef.current,
    beginDrag: startDrag,
    startDrawing: startDrag,
    onDragStart: () => {}, // Use this as needed
    onDragMove: () => {}, // Use this as needed
    onDragEnd: () => {}, // Use this as needed
  };
};

const useDrag = (
  id: string,
  type: string,
  onDragStart: () => void,
  onDragMove: (dragX: number, dragY: number) => void,
  onDragEnd: () => void
) => useDragImpl(id, type, onDragStart, onDragMove, onDragEnd);

export { useDrag };
