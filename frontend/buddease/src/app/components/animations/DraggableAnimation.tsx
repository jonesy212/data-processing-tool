// DraggableAnimation.tsx
import React, { ReactNode, useEffect } from "react";
import { useDrag } from "react-dnd";
interface DraggableAnimationProps {
  onDragStart: () => void;
  onDragEnd: () => void;
  draggableId: string;
  index: number;
  children: ReactNode; // Include children prop
}

const DraggableAnimation: React.FC<DraggableAnimationProps> = ({
  onDragStart,
  onDragEnd,
  draggableId,
  index,
  children,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: "DRAG_ANIMATION",
    item: { id: draggableId, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    if (isDragging) {
      onDragStart();
    } else {
      onDragEnd();
    }
  }, [isDragging, onDragStart, onDragEnd]);

  return (
    <>
      <div
        ref={drag}
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: "grab",
          userSelect: "none",
        }}
      >
        {children}
      </div>
    </>
  );
};

export default DraggableAnimation;
