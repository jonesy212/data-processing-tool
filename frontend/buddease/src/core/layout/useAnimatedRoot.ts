// useAnimatedRoot.ts
// app/layout/useAnimatedRoot.ts
import { AnimatedComponentRef } from "@/core/libraries/animations/AnimationComponent";
import { useCallback, useRef } from "react";

export function useAnimatedRoot() {
  const animatedComponentRef = useRef<AnimatedComponentRef>(null);

  const activateAnimation = useCallback(() => {
    if (animatedComponentRef.current) {
      animatedComponentRef.current.toggleActivation();
    }
  }, []);

  const deactivateAnimation = useCallback(() => {
    if (animatedComponentRef.current) {
      animatedComponentRef.current.toggleActivation();
    }
  }, []);

  return {
    animatedComponentRef,
    activateAnimation,
    deactivateAnimation
  };
}