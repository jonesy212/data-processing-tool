import React, { ReactNode, useEffect, useRef, useState } from "react";
import useIdleTimeout from "../hooks/idleTimeoutHooks";
import { AnimatedComponentRef } from "../libraries/animations/AnimationComponent";
import { useUIElement } from "../libraries/ui/useUIElement";
import { Project } from "../projects/Project";
import { AnimationsAndTransitions } from "../styling/AnimationsAndTansitions";

const ProjectCard = ({ project }: { project: Project }) => {
  const animatedComponentRef = useRef<AnimatedComponentRef | null>({
    setOpacity: () => {},
    startAnimation: () => {},
    animateIn: () => {},
    toggleActivation: () => {},
    setAnimationTime: () => {},
    stopAnimation: () => {},
    isActive: false,
    idleTimeoutId: null,
    startIdleTimeout: () => {},
  } as AnimatedComponentRef | null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const initializeAnimatedComponent = async () => {
      // You can directly use AnimatedContent here
      animatedComponentRef.current = {
        setOpacity: () => {
          // Set opacity
        },
        startAnimation: () => {
          // Start animation logic
          if (animatedComponentRef.current) {
            animatedComponentRef.current.startAnimation();
          }
        },
        animateIn: () => {
          // Animation logic if needed
          console.log("Animate In");
        },
        toggleActivation,
        setAnimationTime: () => {},
        stopAnimation: () => {},
        isActive: false,
        idleTimeoutId: null,
        startIdleTimeout: () => {},
      };
      setIsActive(true); // Set isActive to true for example
    };

    initializeAnimatedComponent();
  }, []);

  const { toggleActivation, resetIdleTimeout } = useIdleTimeout({});

  // Use the useUIElement hook to get the button element
  const buttonElement: ReactNode = useUIElement({
    type: "button",
  }) as ReactNode;

  const handleAnimateIn = () => {
    if (animatedComponentRef.current) {
      animatedComponentRef.current?.animateIn("selector");
    }
  };

  return (
    <div>
      <h4>{project.name}</h4>
      <p>Phase: {project.phase?.name}</p>
      <p>Status: {project.status}</p>
      Render the button element
      {buttonElement}
      <button onClick={handleAnimateIn}>Animate In</button>
      {isActive && <p>Project is active!</p>}
      {/* Use AnimationsAndTransitions component */}
      <AnimationsAndTransitions
        examples={[<div key="example">Your Content Here</div>]}
        dynamicContent={true}
      />
    </div>
  );
};

export default ProjectCard;
