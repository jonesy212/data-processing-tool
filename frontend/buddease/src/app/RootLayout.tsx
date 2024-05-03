// @ts-nocheck
// @use-client
// RootLayout.tsx
import React, { useEffect, useState } from "react";
import { useDynamicComponents } from "./components/DynamicComponentsContext";
import useLayoutGenerator, {
  DocumentGenerationResult,
} from "./components/hooks/GenerateUserLayout";
import { useThemeConfig } from "./components/hooks/userInterface/ThemeConfigContext";
import {
  AnimatedComponent,
  AnimatedComponentRef,
} from "./components/libraries/animations/AnimationComponent";
import { Data } from "./components/models/data/Data";
import responsiveDesignStore from "./components/styling/ResponsiveDesign";
import { User } from "./components/users/User";
import { layoutConfig } from "./configs/LayoutConfig";
import { DocxGeneratorOptions } from "./generators/docxGenerator";
import DesignDashboard from "./pages/dashboards/DesignDashboard";
import { useLayout } from "./pages/layouts/LayoutContext";

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const [isComponentLoaded, setComponentLoaded] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false); // State to track if the layout control button is minimized

  const { setLayout } = useLayout();
  const {
    isDarkMode,
    setPrimaryColor,
    setSecondaryColor,
    setFontSize,
    setFontFamily,
  } = useThemeConfig();

  const handleMinimizeToggle = (): void => {
    setIsMinimized(!isMinimized); // Toggle the state to minimize or maximize the layout control button
  };

  const handleExitFullscreen = (): void => {
    document.exitFullscreen(); // Exit fullscreen mode
  };

  const condition = () => {
    // Your condition logic goes here
    // Check if the component is loaded or not
    if (isComponentLoaded && animatedComponentRef.current) {
      return true;
    } else {
      return false;
    }
  };
  // Change this line in RootLayout
  const layoutEffect = async () => {
    // Your layout effect logic goes here
    // For example, toggle the animated component

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
      const configResult = await layoutConfig();
      console.log(configResult);
      // You can use other theme properties here
      console.log("Is Dark Mode:", isDarkMode);
      console.log("Primary Color:", setPrimaryColor);
      console.log("Secondary Color:", setSecondaryColor);
      console.log("Font Size:", setFontSize);
      console.log("Font Family:", setFontFamily);
    }
  };

  const cleanup = () => {
    // Reset state properties
    setPrimaryColor(""); // Reset primary color
    setSecondaryColor(""); // Reset secondary color
    setFontSize(""); // Reset font size
    setFontFamily(""); // Reset font family
    setLayout({ backgroundColor: "" }); // Reset background color
    setComponentLoaded(false);

    // Clear resources or perform other cleanup actions if needed
    // For example:
    // - Clear timeouts or intervals
    // - Remove event listeners
    // - Dispose of subscriptions or resources
    // - Reset any other state properties or context values
  };

  const documentGenerator = {
    generateDocument: async (
      documentGeneratorOptions: DocxGeneratorOptions
    ) => {
      // Your document generation logic goes here
      const { templatePath, outputPath, data, user } = documentGeneratorOptions;
      // Generate document
      return {
        templatePath: templatePath,
        outputPath: outputPath,
        data: data,
        user: user,
      };
    },
  };

  const animatedComponentRef = React.useRef<AnimatedComponentRef>(null);
  const { toggleActivation } = useLayoutGenerator({
    condition: () => true,
    layoutEffect,
    documentGeneratorOptions: {
      templatePath: "",
      outputPath: "",
      data: {} as Data,
      user: {} as User,
    },
    generateDocument: async (): Promise<DocumentGenerationResult> => {
      try {
        await documentGenerator.generateDocument({} as DocxGeneratorOptions);
      } catch (error) {
        console.error("Error generating document:", error);
      }
      return {
        message: "Document generated successfully.",
        success: true,
      };
    },
    layoutConfigGetter: async () => {
      return {
        documentGeneration: "Document generated successfully.",
        designDashboard: (
          <DesignDashboard
            colors={responsiveDesignStore.colors}
            frontendStructure={responsiveDesignStore.frontendStructure}
            backendStructure={responsiveDesignStore.backendStructure}
            onColorChange={(newColors: string[]) => {}}
            onCloseFileUploadModal={async function () {}}
            onHandleFileUpload={async (file: FileList | null) => {
              if (file) {
                // Handle file upload logic here
                const fileReader = new FileReader();
                fileReader.onload = async () => {
                  // Pass file content to document generator
                  await documentGenerator.generateDocument({
                    templatePath: "",
                    outputPath: "",
                    data: {} as Data,
                    user: {} as User,
                  });
                };
                fileReader.readAsText(file[0]);
              }
            }}
          />
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
    if (isComponentLoaded) {
      if (condition()) {
        layoutEffect();
      }
    }
  }, [condition, isComponentLoaded, layoutEffect]);

  // Function to handle layout effect
  const handleLayoutEffect = async () => {
    if (animatedComponentRef.current) {
      animatedComponentRef.current.toggleActivation();

      // Set theme properties
      setPrimaryColor("#3498db");
      setSecondaryColor("#e74c3c");
      setFontSize("16px");
      setFontFamily("Arial, sans-serif");
      setLayout({ backgroundColor: isDarkMode ? "#1a1a1a" : "#fff" });

      // Call layoutConfig to update layout configuration
      const configResult = await layoutConfig();
      console.log(configResult);

      // Log theme properties
      console.log("Is Dark Mode:", isDarkMode);
      console.log("Primary Color:", setPrimaryColor);
      console.log("Secondary Color:", setSecondaryColor);
      console.log("Font Size:", setFontSize);
      console.log("Font Family:", setFontFamily);
    }
  };

  return (
    <div className="root-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Content */}
      <div>
        {!isMinimized && (
          <div>
            {/* Toggle switch for fullscreen mode */}
            <ToggleSwitch
              label="Fullscreen"
              checked={isComponentLoaded}
              onChange={(checked) => {
                if (checked) {
                  document.documentElement.requestFullscreen();
                } else {
                  document.exitFullscreen();
                }
                setComponentLoaded(checked);
              }}
            />
            {/* Button to exit fullscreen mode */}
            <button onClick={handleExitFullscreen}>Exit Fullscreen</button>
          </div>
        )}
        {/* Minimize button */}
        <button onClick={handleMinimizeToggle}>
          {isMinimized ? "Maximize" : "Minimize"}
        </button>

        {/* Existing content */}
        <html lang="en">
          <body onClick={toggleActivation}>
            {animatedComponent}
            <AnimatedComponent ref={animatedComponentRef} animationClass={""} />
            <DynamicRootLayout>{children}</DynamicRootLayout>
          </body>
        </html>
      </div>
    </div>
  );
};

// DefaultRootLayout.tsx
const DefaultRootLayout: React.FC<any> = ({ children }: any) => {
  // Your default layout logic goes here
  return <div>{children}</div>;
};

export default RootLayout;
