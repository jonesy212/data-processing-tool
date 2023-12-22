// AnimatedComponent.tsx
import React, { useEffect, useImperativeHandle, useState } from 'react';

interface AnimatedComponentProps {
  // Add any other necessary props
}

export interface AnimatedComponentRef {
  toggleActivation: () => void;
  setAnimationTime: (time: number) => void;
  setOpacity: (opacity: number) => void;
}

const AnimatedComponent = React.forwardRef<AnimatedComponentRef, AnimatedComponentProps>((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationTime, setAnimationTime] = useState(1000); // Initial animation time in milliseconds
  const [opacity, setOpacity] = useState(1); // Initial opacity

  useImperativeHandle(ref, () => ({
    toggleActivation: () => {
      setIsVisible(!isVisible);
    },
    setAnimationTime: (time) => {
      setAnimationTime(time);
    },
    setOpacity: (opacity) => {
      setOpacity(opacity);
    },
  }), [isVisible]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsVisible(true);
    }, animationTime);

    return () => clearTimeout(timeoutId);
  }, [animationTime]); // Trigger effect when animationTime changes

  return (
    <div style={{ opacity: isVisible ? opacity : 0, transition: `opacity ${animationTime / 1000}s` }}>
      <h2>This is an Animated Component</h2>
    </div>
  );
});

export { AnimatedComponent };

