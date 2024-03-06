// CardFrame.tsx
import React from "react";
import DummyCard from "./DummyCard";

interface CardFrameProps {
  borderColor: string;
  backgroundColor: string;
  borderRadius: string;
  content: React.ReactNode;
  onDragStart: () => void;
  onDragEnd: () => void;
  group: string; // Group identifier
  size: string; // Size of the card (e.g., small, medium, large)
  overflow: "hidden" | "ellipsis" | "modal"; // Overflow behavior
  // Add more properties as needed
 
}

const CardFrame: React.FC<CardFrameProps> = ({
    group,
    size,
    overflow,
    borderColor,
    backgroundColor,
    borderRadius,
    content,
    onDragStart,
    onDragEnd,
}) => {

    const cardStyle: React.CSSProperties = {
        border: `1px solid ${borderColor}`,
        backgroundColor: backgroundColor,
        borderRadius: borderRadius,
        padding: "10px",
        width: "200px", // Example: Set a fixed width for uniform size
        height: "150px", // Example: Set a fixed height for uniform size
        overflow: overflow === "hidden" ? "hidden" : "visible", // Example: Handle overflow based on prop value
        textOverflow: overflow === "ellipsis" ? "ellipsis" : "initial", // Example: Handle text overflow with ellipsis
        whiteSpace: overflow === "ellipsis" ? "nowrap" : "initial", // Example: Prevent text wrapping when using ellipsis
      };



  return (
      <DummyCard
      content={<div style={cardStyle}>{content}</div>}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  );
};

export default CardFrame;
