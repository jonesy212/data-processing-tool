// FileCard.tsx
import DraggableAnimation from '@/core/libraries/animations/DraggableAnimation';
import { useMovementAnimations } from '@/core/libraries/animations/movementAnimations/MovementAnimationActions';
import React from 'react';

const FileCard: React.FC<{ fileName: string }> = ({ fileName }) => {
  const { show, hide, isDragging } = useMovementAnimations();

  const handleDragStart = () => {
    // Handle drag start, if needed
  };

  const handleDragEnd = () => {
    // Handle drag end, if needed
  };

  return (
    <DraggableAnimation
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      draggableId={fileName}
      index={0} // You may adjust the index as needed
    >
      <div
        onMouseEnter={() => show()}
        onMouseLeave={() => hide()}
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          margin: '10px',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {fileName}
      </div>
    </DraggableAnimation>
  );
};

export default FileCard;
