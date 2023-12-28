// RootLayout.tsx
import React from 'React';
import { AnimatedComponent, AnimatedComponentRef } from './components/animations/AnimationComponent';
import useLayoutGenerator from './components/hooks/GenerateUserLayout';

type RootLayoutProps = {
  children: React.ReactNode;
}
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
    //
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

  const animatedComponent = <AnimatedComponent ref={animatedComponentRef} />;

  return (
    <html lang="en">
      <body onClick={toggleActivation}>
        {animatedComponent}
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
