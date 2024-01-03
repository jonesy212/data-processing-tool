// RootLayout.tsx
import React from 'react';
import { useDynamicComponents } from './components/DynamicComponentsContext';
import { AnimatedComponent, AnimatedComponentRef } from './components/animations/AnimationComponent';
import useLayoutGenerator from './components/hooks/GenerateUserLayout';

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const condition = () => {
    // Your condition logic goes here
    return true;
  };

  const layoutEffect = (ref: React.RefObject<AnimatedComponentRef>) => {
    // Your layout effect logic goes here
    // For example, toggle the animated component
    if (ref.current) {
      ref.current.toggleActivation();
    }
    // ...
  };

  const cleanup = () => {
    // Your cleanup logic goes here
  };

  const animatedComponentRef = React.useRef<AnimatedComponentRef>(null);
  const { toggleActivation } = useLayoutGenerator({
    condition,
    cleanup,
    layoutEffect: () => {},
  });

  // Using the dynamic components context to determine which component to render
  const { dynamicConfig } = useDynamicComponents();
  const DynamicRootLayout = dynamicConfig.RootLayout || DefaultRootLayout;

  const animatedComponent = (
    <AnimatedComponent ref={animatedComponentRef} animationClass={''} children={undefined} />
  );

  return (
    <html lang="en">
      <body onClick={toggleActivation}>
        {animatedComponent}
        <DynamicRootLayout>{children}</DynamicRootLayout>
      </body>
    </html>
  );
};

// DefaultRootLayout.tsx
const DefaultRootLayout: React.FC = ({ children }: any) => {
  // Your default layout logic goes here
  return <div>{children}</div>;
};

export default RootLayout;
