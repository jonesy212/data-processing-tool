// RootLayout.tsx
import React, { useEffect } from "react";
import { useDynamicComponents } from "./components/DynamicComponentsContext";
import {
  AnimatedComponent,
  AnimatedComponentRef,
} from "./components/animations/AnimationComponent";
import useLayoutGenerator, {
  DocumentGenerationResult,
} from "./components/hooks/GenerateUserLayout";
import { useThemeConfig } from "./components/hooks/userInterface/ThemeConfigContext";
import { Data } from "./components/models/data/Data";
import responsiveDesignStore from "./components/styling/ResponsiveDesign";
import { User } from "./components/users/User";
import DesignDashboard from "./pages/dashboards/DesignDashboard";
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

  // Change this line in RootLayout
const layoutEffect = () => {
  // Your layout effect logic goes here
  // For example, toggle the animated component
  const backgroundColor = isDarkMode ? "#1a1a1a" : "#fff";
  if (animatedComponentRef.current) {
    // Use the values in your logic or UI
    animatedComponentRef.current.toggleActivation();
  
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
}

  const cleanup = () => {
    // Your cleanup logic goes here
  };

  const documentGenerator = {
    generateDocument: async () => {
      // Your document generation logic goes here
      return "Generated document content";
    },
  };

  

  const animatedComponentRef = React.useRef<AnimatedComponentRef>(null);
  const { toggleActivation } = useLayoutGenerator({
    condition: () => true, // Provide your condition logic
    layoutEffect,
    documentGeneratorOptions: {
      templatePath: "", // Provide your templatePath
      outputPath: "", // Provide your outputPath
      data: {} as Data, // Adjust the type according to your Data type
      user: {} as User, // Adjust the type according to your User type
    },
    generateDocument: async (): Promise<DocumentGenerationResult> => {
      // Generate document logic
      try {
        // Assuming documentGenerator is a function, call it here
        await documentGenerator.generateDocument();
      } catch (error) {
        console.error("Error generating document:", error);
      }
      // If an error occurs, return a default result or handle it accordingly
      return {
        message: "Document generated successfully.",
        success: true
            };
    },
    layoutConfigGetter: async () => {
      // Your layout config logic
      return {
        documentGeneration: "Document generated successfully.",
        designDashboard: (
          <DesignDashboard colors={responsiveDesignStore.colors} />
        ),
        responsiveDesignStore: responsiveDesignStore,
      };
    },
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
      layoutEffect();
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
