// libraries/animations/DraggableAnimation/useDrag.ts
import { useEffect, useRef } from 'react';
import { DragSourceHookSpec } from 'react-dnd';

interface DragEventHandlers {
  onDragStart: () => void;
  onDragMove: (dragX: number, dragY: number) => void;
  onDragEnd: () => void;
}

interface DragObject extends DragObjectWithType {
  // Define your drag object properties if needed
}

interface CollectedProps {
  isDragging: boolean;
}

const useDragImpl = (): DragSourceHookSpec<DragObject, any, CollectedProps> => {
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

  return { item: {}, type: 'yourDragType', isDragging: false, beginDrag: handleDragStart };
};

const useDrag = () => useDragImpl();

export { useDrag };
