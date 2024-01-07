// RootLayout.tsx
import React, { useEffect } from "react";
import { useDynamicComponents } from "./components/DynamicComponentsContext";
import {
  AnimatedComponent,
  AnimatedComponentRef,
} from "./components/animations/AnimationComponent";
import useLayoutGenerator from "./components/hooks/GenerateUserLayout";
import { useThemeConfig } from "./components/hooks/userInterface/ThemeConfigContext";
import { useLayout } from "./pages/layouts/LayoutContext";

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const { setLayout } = useLayout();
  const {
    isDarkMode,
    setPrimaryColor,
    setSecondaryColor,
    setFontSize,
    setFontFamily,
  } = useThemeConfig();
  const condition = () => {
    // Your condition logic goes here
    return true;
  };

  const layoutEffect = (ref: React.RefObject<AnimatedComponentRef>) => {
    // Your layout effect logic goes here
    // For example, toggle the animated component
    const backgroundColor = isDarkMode ? '#1a1a1a' : '#fff';
    if (ref.current) {
      // Use the values in your logic or UI

      ref.current.toggleActivation();

      // Assume these functions update the state
      setPrimaryColor("#3498db");
      setSecondaryColor("#e74c3c");
      setFontSize("16px");
      setFontFamily("Arial, sans-serif");
      // Set background color through the context
      setLayout({ backgroundColor: isDarkMode ? "#1a1a1a" : "#fff" });

      // You can use other theme properties here
      console.log("Is Dark Mode:", isDarkMode);
      console.log("Primary Color:", setPrimaryColor);
      console.log("Secondary Color:", setSecondaryColor);
      console.log("Font Size:", setFontSize);
      console.log("Font Family:", setFontFamily);
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
    <AnimatedComponent ref={animatedComponentRef} animationClass={""} />
  );

  // Add useEffect to handle layout effect on component mount
  useEffect(() => {
    if (condition()) {
      layoutEffect(animatedComponentRef);
    }
  }, [condition, layoutEffect]);

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
