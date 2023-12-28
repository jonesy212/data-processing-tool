import { useEffect, useState } from "react";

// Define the available animation libraries
type AnimationLibrary =
  | "gsap"
  | "anime"
  | "react-spring"
  | "react-dnd"
  | "react-dnd-html5-backend"
  | "custom";

interface AnimationOptions {
  library: AnimationLibrary;
  animationType: string;
}

export const useAnimationHook = (options: AnimationOptions): any => {
  const [animationState, setAnimationState] = useState<any>(null);

  useEffect(() => {
    // Load the selected animation library dynamically
    let animationLibrary: any;

    switch (options.library) {
      case "gsap":
        animationLibrary = require("gsap");
        break;
      case "anime":
        animationLibrary = require("animejs");
        break;
      case "react-spring":
        animationLibrary = require("react-spring");
        break;
      case "react-dnd":
        animationLibrary = require("react-dnd");
      case "react-dnd-html5-backend":
        animationLibrary = require("react-dnd-html5-backend");
      case "custom":
        // Add your custom animation library or implementation
        break;
      default:
        break;
    }

    // Initialize the animation state based on the selected library and animation type
    if (animationLibrary) {
      const { animationType } = options;
      const animation = animationLibrary[animationType];

      if (animation) {
        setAnimationState(animation);
      } else {
        console.error(
          `Animation type "${animationType}" not found in the selected library.`
        );
      }
    }
  }, [options.library, options.animationType]);

  return animationState;
};
