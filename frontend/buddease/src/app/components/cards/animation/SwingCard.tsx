// SwingCard.tsx
import React, { useEffect, useState } from "react";
import { useDrag } from "react-dnd";

interface SwingCardProps {
  onDragStart: () => void;
  onDragEnd: () => void;
  draggableId: string;
  index: number;
  children: React.ReactNode;
  useDragPreview?: boolean;
}

const SwingCard: React.FC<SwingCardProps> = ({
  onDragStart,
  onDragEnd,
  draggableId,
  index,
  children,
  useDragPreview = true,
}) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: "CARD",
    item: { id: draggableId, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isDragging) {
      onDragStart();
      const rotationValue = 10;
      setRotation(rotationValue);
    } else {
      onDragEnd();
      setRotation(0);
    }
  }, [isDragging, onDragStart, onDragEnd]);

  useEffect(() => {
    if (!useDragPreview) {
      preview(null); // Disable the default drag preview
    }
  }, [useDragPreview, preview]);

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: "transform 0.2s ease-out",
        cursor: "grab",
        userSelect: "none",
      }}
    >
      {children}
    </div>
  );
};

export default SwingCard;
