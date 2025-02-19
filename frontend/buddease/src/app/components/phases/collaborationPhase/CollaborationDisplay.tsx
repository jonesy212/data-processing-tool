// components/collaborations/CollaborationDisplay/CollaborationDisplay.tsx
import React, { useRef, useState } from 'react';
import { useDrag } from '../../../libraries/animations/DraggableAnimation/useDrag';
import { useCollaboration } from './CollaborationContext';

interface CollaborationDisplayProps {
  // Add any additional props as needed
}

const CollaborationDisplay: React.FC<CollaborationDisplayProps> = ({ /* Add props */ }) => {
  const { collaborationState } = useCollaboration();
  const displayRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [positions, setPositions] = useState([]); // State to store positions

  const handleZoom = (zoomFactor: number) => {
    // Implement zoom logic as needed
    setZoomLevel((prevZoom) => Math.max(0.1, prevZoom + zoomFactor));
  };

  const handlePan = (deltaX: number, deltaY: number) => {
    // Implement pan logic as needed
    setPanOffset((prevOffset) => ({
      x: prevOffset.x + deltaX,
      y: prevOffset.y + deltaY,
    }));
  };


  const handleDrag = useDrag();
  

  const calculateTransform = () => {
    // Calculate the transform property based on zoom and pan
    const scale = `scale(${zoomLevel})`;
    const translate = `translate(${panOffset.x}px, ${panOffset.y}px)`;
    return `${translate} ${scale}`;
  };

  return (
    <div
      ref={displayRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          transform: calculateTransform(),
          transformOrigin: 'top left',
        }}
          >
              {/* Render collaboration elements or tools within this div */}
        {positions.map((position: { x: number; y: number }, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${position.x}px`,
              top: `${position.y}px`,
              // Additional styles as needed
            }}
          >
            {/* Your collaboration element */}
          </div>
        ))}

        {/* Use collaborationState to determine what to render */}
      </div>
      {/* Zoom and Pan Controls */}
      <div>
        <button onClick={() => handleZoom(0.1)}>Zoom In</button>
        <button onClick={() => handleZoom(-0.1)}>Zoom Out</button>
        {/* Additional controls as needed */}
          </div>
          
    </div>
  );
};

export default CollaborationDisplay;
