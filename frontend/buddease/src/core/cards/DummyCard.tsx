// DummyCard.tsx
import DraggableAnimation from "@/core/libraries/animations/DraggableAnimation";
import { useMovementAnimations } from "@/core/libraries/animations/movementAnimations/MovementAnimationActions";
import React, { useRef } from "react";

interface DummyCardProps {
  content: React.ReactNode;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const DummyCard: React.FC<DummyCardProps> = ({
  content,
  onDragStart,
  onDragEnd,
}) => {
  const { drag, isDragging } = useMovementAnimations();
  const fadeInRef = useRef<any>(null);
  const rotateRef = useRef<any>(null);

  const handleToggleFadeIn = () => {
    if (fadeInRef.current) {
      fadeInRef.current.toggleActivation();
    }
  };

  const handleToggleRotate = () => {
    if (rotateRef.current) {
      rotateRef.current.toggleActivation();
    }
  };

  return (
    <DraggableAnimation
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      draggableId="dummyCard"
      index={0}
    >
      {/* Wrap the content with the DraggableAnimation component */}
      <div
        onClick={() => console.log("Dummy Card Clicked")}
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {/* Example of using handleToggleFadeIn */}
        <button onClick={handleToggleFadeIn}>Toggle Fade In</button>

        {/* Example of using handleToggleRotate */}
        <button onClick={handleToggleRotate}>Toggle Rotate</button>

        {content}
        {isDragging && <div>Dragging...</div>}
      </div>
    </DraggableAnimation>
  );
};

export default DummyCard;
