// components/AnimationsAndTransitions.tsx
import React, { ReactNode } from 'react';

export interface AnimatedComponentProps {
  animationClass: string;
  children: React.ReactNode;

}

interface StaticComponentProps {
  content: ReactNode;
}

interface AnimationsAndTransitionsProps {
  examples: ReactNode[];
  dynamicContent?: boolean; // Use this prop to determine dynamic or static rendering
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
          return (
            <DynamicComponent
              key={index}
              animationClass={example.props.animationClass} children={undefined}            />
          );
        }
      })}
    </div>
  );
};

const StaticComponent: React.FC<StaticComponentProps> = ({ content }) => {
  return <div>{content}</div>;
};

const DynamicComponent: React.FC<AnimatedComponentProps> = ({ animationClass }) => {
  return <div className={animationClass}>Animated Content</div>;
};


const AnimatedComponent: React.FC<AnimatedComponentProps> = ({ animationClass }) => {
  // You can use CSS classes or a library like react-spring for animations
  return <div className={animationClass}>Animated Content</div>;
};

export { AnimatedComponent, AnimationsAndTransitions };

