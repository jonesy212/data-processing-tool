// AnimatedComponent.tsx
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import createDynamicHook, { DynamicHookResult } from '../../hooks/dynamicHooks/dynamicHookGenerator';
import { AnimatedComponentProps } from '../../styling/AnimationsAndTansitions';
import React from "react";

import authService from '../../auth/AuthService';
import useIdleTimeout from '../../hooks/idleTimeoutHooks';
import DraggableAnimation from './DraggableAnimation'; // Import DraggableAnimation

export interface AnimatedComponentRef extends DynamicHookResult {
  toggleActivation: (accessToken?: string | null | undefined) => void; // Make accessToken optional and nullable
  setAnimationTime: (time: number) => void;
  setOpacity: (opacity: number) => void;
  startAnimation: () => void;
  stopAnimation: () => void; 
  animateIn: (selector: string) => void; 
}

const AnimatedComponent = forwardRef<
  AnimatedComponentRef,
  AnimatedComponentProps
>((_props, ref) => {
  const { animationType = "slideIn", duration = 1000 } = _props; // Destructure props with default values
  const [isVisible, setIsVisible] = useState(false);
  const [animationTime, setAnimationTime] = useState(1000);
  const [opacity, setOpacity] = useState(1);

  const accessToken = authService.getAccessToken() as string;

  // Destructure new props
  const { loopDuration = 0, loopLength = 1, repeat = false } = _props;

  // Destructure the required properties or methods from the result of createDynamicHook
  const { toggleActivation, startAnimation, stopAnimation, animateIn } =
    createDynamicHook({
      condition: async () => isVisible,
      asyncEffect: async () => {
        setIsVisible(true);
        return () => {}; // Return a cleanup function to satisfy the type requirement
      },
      resetIdleTimeout: async () => {
        // Reset idle timeout
      },
      isActive: false,
    });

  // Now you can use toggleActivation, startAnimation, stopAnimation, and animateIn directly

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
      animateIn: () => {
        startAnimation();
      },
      idleTimeoutId: useIdleTimeout({}).idleTimeoutId,
      startIdleTimeout: useIdleTimeout({}).startIdleTimeout,
      accessToken: accessToken,
      isActive: isVisible,
      loopDuration, // Pass loop duration to dynamic hook
      loopLength, // Pass loop length to dynamic hook
      repeat, // Pass repeat option to dynamic hook
    }),
    [toggleActivation, startAnimation, animateIn, stopAnimation, isVisible]
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
        {/* Pass accessToken when calling toggleActivation */}
        <button onClick={() => toggleActivation(accessToken)}>
          Toggle Activation
        </button>
        <button onClick={startAnimation}>Start Animation</button>
        <button onClick={stopAnimation}>Stop Animation</button>
        <button onClick={() => animateIn()}>Animate In</button>
      </div>
    </DraggableAnimation>
  );
});

export { AnimatedComponent };
