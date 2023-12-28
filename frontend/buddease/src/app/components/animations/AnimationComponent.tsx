// AnimatedComponent.tsx
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import createDynamicHook, { DynamicHookResult } from '../hooks/dynamicHooks/dynamicHookGenerator';
import { AnimatedComponentProps } from '../styling/AnimationsAndTansitions';

import DraggableAnimation from './DraggableAnimation'; // Import DraggableAnimation

export interface AnimatedComponentRef extends DynamicHookResult {
  toggleActivation: () => void;
  setAnimationTime: (time: number) => void;
  setOpacity: (opacity: number) => void;
  startAnimation: () => void;
  stopAnimation: () => void; 
}

const AnimatedComponent = forwardRef<
  AnimatedComponentRef,
  AnimatedComponentProps
>((_props, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationTime, setAnimationTime] = useState(1000);
  const [opacity, setOpacity] = useState(1);

  const { toggleActivation, startAnimation, stopAnimation } = createDynamicHook(
    {
      condition: () => isVisible,
      asyncEffect: async () => {
        setIsVisible(true);
      },
    }
  )();

  useImperativeHandle(
    ref,
    () => ({
      toggleActivation,
      setAnimationTime: (time: number) => {
        setAnimationTime(time);
      },
      setOpacity: (opacity: number) => {
        setOpacity(opacity);
      },
      startAnimation,
      stopAnimation,
      isActive: isVisible,
    }),
    [toggleActivation, startAnimation, stopAnimation, isVisible]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      startAnimation();
    }, animationTime);

    return () => clearTimeout(timeoutId);
  }, [animationTime, startAnimation]);

  return (
    <DraggableAnimation
      onDragStart={startAnimation}
      onDragEnd={stopAnimation}
      draggableId="draggable-1"
      index={0}
    >
      <div
        style={{
          opacity: isVisible ? opacity : 0,
          transition: `opacity ${animationTime / 1000}s`,
        }}
      >
        <h2>This is an Animated Component</h2>
        <p>Active: {isVisible ? "Yes" : "No"}</p>
        <button onClick={() => toggleActivation()}>Toggle Activation</button>
        <button onClick={startAnimation}>Start Animation</button>
        <button onClick={stopAnimation}>Stop Animation</button>
      </div>
    </DraggableAnimation>
  );
});

export { AnimatedComponent };
