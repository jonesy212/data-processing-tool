// AnimationComponent.tsx
import { AnimatedComponentProps } from '@/core/components/styling/AnimationsAndTansitions';
import createDynamicHook, { DynamicHookResult } from '@/core/hooks/dynamicHooks/dynamicHookGenerator';
import useIdleTimeout from '@/core/hooks/idleTimeoutHooks';
import { useAuthToken } from '@/core/hooks/useAuthToken'; // Client-side hook
import DraggableAnimation from '@/core/libraries/animations/DraggableAnimation';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export interface AnimatedComponentRef extends DynamicHookResult {
  toggleActivation: (accessToken?: string | null) => void;
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
  const { animationType = "slideIn", duration = 1000 } = _props;
  const [isVisible, setIsVisible] = useState(false);
  const [animationTime, setAnimationTime] = useState(1000);
  const [opacity, setOpacity] = useState(1);

  const accessToken = useAuthToken(); // Client-side token hook

  const { loopDuration = 0, loopLength = 1, repeat = false } = _props;

  const { toggleActivation, startAnimation, stopAnimation, animateIn } =
    createDynamicHook({
      condition: async () => isVisible,
      asyncEffect: async () => {
        setIsVisible(true);
        return () => {};
      },
      resetIdleTimeout: async () => {},
      isActive: false,
    });

  const { idleTimeoutId, startIdleTimeout } = useIdleTimeout("animated-component", _props);

  useImperativeHandle(
    ref,
    () => ({
      toggleActivation,
      setAnimationTime,
      setOpacity,
      startAnimation,
      stopAnimation,
      animateIn: () => startAnimation(),
      idleTimeoutId,
      startIdleTimeout,
      accessToken,
      isActive: isVisible,
      loopDuration,
      loopLength,
      repeat,
    }),
    [toggleActivation, startAnimation, stopAnimation, isVisible, accessToken]
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
