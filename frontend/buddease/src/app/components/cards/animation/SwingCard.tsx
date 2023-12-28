// SwingCard.tsx
import React, { useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';

interface SwingCardProps {
  onDragStart: () => void;
  onDragEnd: () => void;
  draggableId: string;
  index: number;
  children: React.ReactNode;
}

const SwingCard: React.FC<SwingCardProps> = ({
  onDragStart,
  onDragEnd,
  draggableId,
  index,
  children,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'CARD', // Replace with your drag type
    item: { id: draggableId, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isDragging) {
      onDragStart();
      // Apply rotation effect during drag
      const rotationValue = 10; // Adjust the rotation value as needed
      setRotation(rotationValue);
    } else {
      onDragEnd();
      // Reset rotation after drag
      setRotation(0);
    }
  }, [isDragging, onDragStart, onDragEnd]);

  return (
    <div
      ref={drag}
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.2s ease-out', // Adjust the transition duration as needed
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      {children}
    </div>
  );
};

export default SwingCard;
