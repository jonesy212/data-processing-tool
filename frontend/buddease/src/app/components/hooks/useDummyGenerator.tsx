// useDummyGenerator.ts
import { useState } from 'react';
export interface DummyHookActions {
  toggleActivation: (options?: { accessToken?: string }) => void;
  startAnimation: () => void;
  stopAnimation: () => void;
  shake: () => void;
  fadeOut: () => void;
  fadeIn: () => void;
  startScalingAnimation: () => void;
  stopScalingAnimation: () => void;
}

export const generateAnimationDummyHook = (hookName: DummyHookActions | string) => {
  return {
    hook: () => {
      const [isActive, setIsActive] = useState(false);
      const [isAnimating, setIsAnimating] = useState(false);
      const [isScaling, setIsScaling] = useState(false); // New state for scaling animation
      const [isFadingOut, setIsFadingOut] = useState(false); // New state for fading

      const toggleActivation = ({ accessToken }: { accessToken?: string } = {}) => {
        setIsActive(!isActive);

        // Use accessToken as needed, for example, pass it to other functions or perform logic
        console.log('Received accessToken:', accessToken);
      };
      const startAnimation = () => setIsAnimating(true);
      const stopAnimation = () => setIsAnimating(false);

      const shake = () => {
        // Logic for shake animation
        setIsScaling(false);
        setIsFadingOut(false);
        // Additional logic as needed
      };

      const fadeOut = () => {
        // Logic for fade out animation
        setIsScaling(false);
        setIsFadingOut(true);
        // Additional logic as needed
      };

      const fadeIn = () => {
        // Logic for fade in animation
        setIsScaling(false);
        setIsFadingOut(false);
        // Additional logic as needed
      };

      const startScalingAnimation = () => setIsScaling(true);
      const stopScalingAnimation = () => setIsScaling(false);

      return {
        isActive,
        toggleActivation,
        startAnimation,
        stopAnimation,
        shake,
        fadeOut,
        fadeIn,
        startScalingAnimation,
        stopScalingAnimation,
      };
    },
  };
};
