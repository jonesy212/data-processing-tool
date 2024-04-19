import { useEffect, useRef } from 'react';
import { DragSourceHookSpec, DragSourceMonitor } from 'react-dnd';

export interface DragEventHandlers extends DragSourceHookSpec<CustomDragObject, any, CollectedProps> {
  onDragStart: () => void;
  onDragMove: (dragX: number, dragY: number) => void;
  onDragEnd: () => void;
  beginDrag: (e: MouseEvent | TouchEvent) => void; // Include beginDrag in the interface
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
  type: string
): DragEventHandlers => { // Change the return type to DragEventHandlers
  const isDraggingRef = useRef(false);
  const startDragPositionRef = useRef({ x: 0, y: 0 });

  const handleDragStart = (e: MouseEvent | TouchEvent) => {
    isDraggingRef.current = true;
    const { clientX, clientY } = e instanceof MouseEvent ? e : e.touches[0];
    startDragPositionRef.current = { x: clientX, y: clientY };
    // Call your custom onDragStart logic here
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (isDraggingRef.current) {
      const { clientX, clientY } = e instanceof MouseEvent ? e : e.touches[0];
      const dragX = clientX - startDragPositionRef.current.x;
      const dragY = clientY - startDragPositionRef.current.y;
      // Call your custom onDragMove logic here
    }
  };

  const handleDragEnd = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      // Call your custom onDragEnd logic here
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
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
    type: 'yourDragType',
    isDragging: (monitor: DragSourceMonitor<CustomDragObject, any>) => isDraggingRef.current,
    beginDrag: startDrag,
    onDragStart: () => {}, // Placeholder functions for the other event handlers
    onDragMove: () => {},
    onDragEnd: () => {},
  };
};

const useDrag = (id: string, type: string) => useDragImpl(id, type);

export { useDrag };
