// components/AnimationsAndTransitions.tsx
import React, { ReactNode } from 'react';

export interface AnimatedComponentProps {
  animationClass: string;
  children?: ReactNode; 
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
