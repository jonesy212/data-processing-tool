// AnimationControls.tsx
import { AnimatedComponentRef } from '@/core/libraries/animations/AnimationComponent'; // Replace with your actual AnimatedComponent import
import React, { useRef } from 'react';

const AnimationControls: React.FC = () => {
  const animatedComponentRef = useRef<AnimatedComponentRef>(null);

  const handleButtonClick = () => {
    if (animatedComponentRef.current) {
      animatedComponentRef.current.toggleActivation();
    }
  };

  // Add more controls as needed

  return (
    <div>
      <button onClick={handleButtonClick}>Toggle Animation</button>
      {/* Add more controls here */}
    </div>
  );
};

export default AnimationControls;
