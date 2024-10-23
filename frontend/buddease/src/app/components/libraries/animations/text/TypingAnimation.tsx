// TypingAnimation.tsx
import React, { useEffect, useState } from "react";
import { AnimatedComponentProps } from "../../../styling/AnimationsAndTansitions";

const AnimatedComponent: React.FC<AnimatedComponentProps> = ({ children }) => {
  return <div className="animated">{children}</div>;
};

const TypingAnimation: React.FC = () => {
  const [typedText, setTypedText] = useState("");
  const textToType = "This is a typing animation.";

  useEffect(() => {
    const typingInterval = 100; // Adjust this value for typing speed

    let index = 0;
    const typingTimer = setInterval(() => {
      setTypedText((prevText) => prevText + textToType[index]);
      index += 1;

      if (index === textToType.length) {
        clearInterval(typingTimer);
      }
    }, typingInterval);

    return () => {
      clearInterval(typingTimer);
    };
  }, []);

  return (
    <div>
      <h2>Typing Animation</h2>
      <AnimatedComponent
        animationClass={""}
      >
        <div>{typedText}</div>
      </AnimatedComponent>
    </div>
  );
};

export default TypingAnimation;
