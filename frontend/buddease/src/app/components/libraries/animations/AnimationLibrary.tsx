import { useEffect, useState } from "react";


// Define an enum for AnimationType
enum AnimationTypeEnum {
  Notification = "notification",
  String = "string",
  DocumentType = "documentType",
  Fade = "fade",
  Slide = "slide",
  Zoom = "zoom", // Additional animation type
  Rotate = "rotate", // Additional animation type
  Bounce = "bounce", // Additional animation type
  Flip = "flip", // Additional animation type
  FadeScale = "fadeScale", // Additional animation type
  TwoD = "twoD", // Two-dimensional animation
  Scale = "scale", // Scale animation
  Spin = "spin", // Spin animation
  ColorChange = "colorChange", // Color change animation
  Shake = "shake", // Shake animation
  Path = "path", // Path animation
  Swing = "swing", // Swing animation
  Pulse = "pulse", // Pulse animation
  Typing = "typing", // Typing animation
  Glow = "glow", // Glow animation
  Wave = "wave", // Wave animation
}

// Define the AnimationType as a union type of string literals and the AnimationType enum

// Define the AnimationType as a union type of string literals and the AnimationType enum values
type AnimationType = "pulse" | "shake"| "notification" | "string" | "documentType" | "fade" | "slide" | "zoom" | "rotate" | "bounce" | "flip" | "fadeScale";

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
  animationType: AnimationType;
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

export default AnimationTypeEnum




// Example usage:
export const animationType: AnimationType = AnimationTypeEnum.Fade;
export type { AnimationLibrary, AnimationType };
