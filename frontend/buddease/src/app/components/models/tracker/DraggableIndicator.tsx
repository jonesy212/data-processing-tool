// DraggableIndicator.tsx
import React from 'react';

interface DraggableIndicatorProps {
  dragging: boolean; // Show draggable indicator
}

const DraggableIndicator: React.FC<DraggableIndicatorProps> = ({ dragging }) => {
  return (
    <div style={{ display: dragging ? 'block' : 'none', textAlign: 'center', marginTop: '20px' }}>
      <div className="draggable-indicator">
        <span>Drag me</span>
      </div>
    </div>
  );
};

export default DraggableIndicator;
