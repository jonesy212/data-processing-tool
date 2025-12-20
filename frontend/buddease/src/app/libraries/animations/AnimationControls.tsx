// AnimationControls.tsx
import React, { useRef } from 'react';
import {AnimatedComponent, AnimatedComponentRef} from '@/app/libraries/animations/AnimationComponent'; // Replace with your actual AnimatedComponent import

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
