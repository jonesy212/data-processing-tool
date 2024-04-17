import React from 'react';
import DraggableAnimation from '../components/libraries/animations/DraggableAnimation';

const PremiumFeatures: React.FC = () => {
  return (
    <div>
      <h2>Premium Features</h2>
      <p>Unlock exclusive features with our premium subscription!</p>

      <h3>Draggable Divs</h3>
      <p>Explore the power of draggable divs with these premium templates:</p>

      {/* Example of a draggable div using DraggableAnimation */}
      <DraggableAnimation
        draggableId="unique-id-1"
        index={0}
        onDragStart={() => console.log('Drag started')}
        onDragEnd={() => console.log('Drag ended')}
      >
        <div style={draggableDivStyle}>
          <h4>Drag me!</h4>
          <p>Move this div around the screen.</p>
        </div>
      </DraggableAnimation>

      {/* Example of another draggable div using DraggableAnimation */}
      <DraggableAnimation
        draggableId="unique-id-2"
        index={1}
        onDragStart={() => console.log('Drag started')}
        onDragEnd={() => console.log('Drag ended')}
      >
        <div style={draggableDivStyle}>
          <h4>Another draggable div</h4>
          <p>This div can also be freely moved.</p>
        </div>
      </DraggableAnimation>

      <h3>Additional Templates</h3>
      <p>Access premium templates for your designs:</p>
      <ul>
        <li>Professional presentation templates</li>
        <li>Stunning website layouts</li>
        <li>Customizable email newsletter designs</li>
      </ul>

      <h3>Design Elements</h3>
      <p>Enhance your designs with exclusive design elements:</p>
      <ul>
        <li>Unique icons and illustrations</li>
        <li>High-quality stock photos</li>
        <li>Customizable color palettes</li>
      </ul>

      <h3>Customization Options</h3>
      <p>Unlock advanced customization options:</p>
      <ul>
        <li>Control over typography and fonts</li>
        <li>Advanced animation effects</li>
        <li>Access to premium design assets</li>
      </ul>
    </div>
  );
};

// Style for draggable divs
const draggableDivStyle: React.CSSProperties = {
  border: '2px dashed #aaa',
  padding: '10px',
  width: '200px',
  cursor: 'move',
  backgroundColor: '#f9f9f9',
};

export default PremiumFeatures;
