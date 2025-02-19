// components/AnimationsAndTransitions.tsx
import React, { ReactNode } from 'react';

export interface AnimatedComponentProps {
  animationClass: string;
  children?: ReactNode; 
  loopDuration?: number; // Duration of each loop animation (in milliseconds)
  loopLength?: number; // Number of times the animation should loop
  repeat?: boolean; // Whether the animation should repeat indefinitely
  animationType?: string; // Animation type prop
  duration?: number; // Animation duration prop

}

interface StaticComponentProps {
  content: ReactNode;
}

interface AnimationsAndTransitionsProps {
  examples: ReactNode[];
  dynamicContent?: boolean;
}

const AnimationsAndTransitions: React.FC<AnimationsAndTransitionsProps> = ({ examples, dynamicContent }) => {
  return (
    <div>
      <h2>{dynamicContent ? 'Dynamic' : 'Static'} Animations and Transitions</h2>
      {dynamicContent ? renderDynamicContent(examples) : renderStaticContent(examples)}
    </div>
  );
};

const renderStaticContent = (examples: ReactNode[]) => {
  return (
    <div>
      {examples.map((example, index) => (
        <StaticComponent key={index} content={example} />
      ))}
    </div>
  );
};

const renderDynamicContent = (examples: ReactNode[]) => {
  return (
    <div>
      {examples.map((example, index) => {
        if (React.isValidElement(example)) {
          const animationClass = example.props.animationClass;
          return (
            <DynamicComponent
              key={index}
              animationClass={animationClass}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

const StaticComponent: React.FC<StaticComponentProps> = ({ content }) => {
  return <div>{content}</div>;
};

const DynamicComponent: React.FC<AnimatedComponentProps> = ({ animationClass }) => {
  return <AnimatedContent animationClass={animationClass} />;
};

const AnimatedContent: React.FC<AnimatedComponentProps> = ({ animationClass }) => {
  return <div className={animationClass}>Animated Content</div>;
};

export { AnimationsAndTransitions };
