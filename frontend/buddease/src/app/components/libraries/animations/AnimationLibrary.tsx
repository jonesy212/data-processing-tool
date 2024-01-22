import { useEffect, useState } from "react";

// Define the available animation libraries
type AnimationLibrary =
  | "gsap"
  | "animejs"
  | "react-spring"
  | "react-dnd"
  | "react-dnd-html5-backend"
  | "custom";

interface AnimationOptions {
  library: AnimationLibrary;
  animationType: string;
}

export const useAnimationHook = async (options: AnimationOptions): Promise<any> => {
  const [animationState, setAnimationState] = useState<any>(null);

  useEffect(() => {
    const loadAnimationLibrary = async () => {
      let animationLibrary: any;

      switch (options.library) {
        case "gsap":
          animationLibrary = await import("gsap");
          break;
        case "animejs":
          animationLibrary = await import("animejs");
          break;
        case "react-spring":
          animationLibrary = await import("react-spring");
          break;
        case "react-dnd":
          animationLibrary = await import("react-dnd");
          break;
        case "react-dnd-html5-backend":
          animationLibrary = await import("react-dnd-html5-backend");
          break;
        case "custom":
          // Add your custom animation library or implementation
          break;
        default:
          break;
      }

      if (animationLibrary) {
        const { animationType } = options;

        if (typeof animationLibrary === "function") {
          setAnimationState(animationLibrary);
        } else if (animationType in animationLibrary) {
          const animation = animationLibrary[animationType];

          if (typeof animation === "function") {
            setAnimationState(animation);
          } else {
            console.error(
              `Animation type "${animationType}" not found in the selected library.`
            );
          }
        }
      }
    };

    loadAnimationLibrary();
  }, [options.library, options.animationType]);

  return animationState;
};
