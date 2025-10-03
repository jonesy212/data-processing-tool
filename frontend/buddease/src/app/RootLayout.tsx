//app/Rootayout

"use client";
// @ts-nocheck

import useLayoutGenerator, { DocumentGenerationResult } from "@/app/hooks/GenerateUserLayout";
import { useThemeConfig } from "@/app/hooks/userInterface/ThemeConfigContext";
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from "react";
import { AppProviders } from "./Provider";
import { useDynamicComponents } from "./components/DynamicComponentsContext";
import responsiveDesignStore from "./components/styling/ResponsiveDesign";
import { AnimatedComponent, AnimatedComponentRef } from "./libraries/animations/AnimationComponent";
import { useLayout } from "./pages/layouts/LayoutContext";

type RootLayoutProps = { children: React.ReactNode };
interface DynamicComponentConfig { RootLayout?: React.ComponentType<{ children: React.ReactNode }>; }




// Dynamically import DesignDashboard
const DesignDashboard = dynamic(
  () => import("./pages/dashboards/DesignDashboard"),
  { ssr: false, loading: () => <div>Loading dashboard...</div> }
);


const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const [isComponentLoaded, setComponentLoaded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const { setLayout } = useLayout();
  const { isDarkMode, setPrimaryColor, setSecondaryColor, setFontSize, setFontFamily } = useThemeConfig();
  const animatedComponentRef = React.useRef<AnimatedComponentRef>(null);

  const handleMinimizeToggle = () => setIsMinimized(!isMinimized);

  const handleExitFullscreen = () => {
    document.exitFullscreen().catch(err => console.error("Error exiting fullscreen:", err));
  };

  const layoutEffect = async () => {
    if (!animatedComponentRef.current) return;
    try {
      animatedComponentRef.current.toggleActivation();
      setPrimaryColor("#3498db");
      setSecondaryColor("#e74c3c");
      setFontSize("16px");
      setFontFamily("Arial, sans-serif");
      setLayout({ backgroundColor: isDarkMode ? "#1a1a1a" : "#fff" });

    } catch (error) {
      console.error("Error in layout effect:", error);
    }
  };

  const cleanup = () => {
    setPrimaryColor("");
    setSecondaryColor("");
    setFontSize("");
    setFontFamily("");
    setLayout({ backgroundColor: "" });
    setComponentLoaded(false);
  };

  const documentGenerator = {
    generateDocument: async (opts: DocxGeneratorOptions) => {
      try {
        const { templatePath, outputPath, data, user } = opts;
        return { templatePath: String(templatePath), outputPath: String(outputPath), data, user };
      } catch (error) {
        console.error("Error generating document:", error);
        throw error;
      }
    },
  };

  useLayoutGenerator({
    condition: () => true,
    layoutEffect,
    documentGeneratorOptions: { templatePath: "", outputPath: "", data: {} as any, user: {} as any },
    generateDocument: async (): Promise<DocumentGenerationResult> => {
      try {
        await documentGenerator.generateDocument({} as DocxGeneratorOptions);
        return { message: "Document generated successfully.", success: true };
      } catch (error) {
        console.error("Error generating document:", error);
        return { message: "Document generation failed", success: false };
      }
    },
    layoutConfigGetter: async () => {
      try {
        return {
          documentGeneration: "Document generated successfully.",
          designDashboard: (
            <DesignDashboard
              colors={responsiveDesignStore.colors.map(String)}
              frontendStructure={responsiveDesignStore.frontendStructure}
              backendStructure={responsiveDesignStore.backendStructure}
              onColorChange={() => {}}
              onCloseFileUploadModal={async () => {}}
              onHandleFileUpload={async (file) => {
                if (file) {
                  const reader = new FileReader();
                  reader.onload = async () => {
                    await documentGenerator.generateDocument({
                      templatePath: "",
                      outputPath: "",
                      data: {} as any,
                      user: {} as any,
                    });
                  };
                  reader.readAsText(file[0]);
                }
              }}
            />
          ),
          responsiveDesignStore,
        };
      } catch (error) {
        console.error("Error in layout config getter:", error);
        return {
          documentGeneration: "Error generating layout config",
          designDashboard: <div>Error loading dashboard</div>,
          responsiveDesignStore,
        };
      }
    },
  });

  const { dynamicConfig } = useDynamicComponents() as { dynamicConfig: DynamicComponentConfig };
  const LayoutComponent = typeof dynamicConfig?.RootLayout === "function" ? dynamicConfig.RootLayout : DefaultRootLayout;

  useEffect(() => {
    if (isComponentLoaded && animatedComponentRef.current) layoutEffect().catch(console.error);
    return cleanup;
  }, [isComponentLoaded]);

  return (
    <AppProviders>
      <div className="root-layout">
        <Sidebar />
        <div>
          {!isMinimized && (
            <div>
              <ToggleSwitch
                label="Fullscreen"
                checked={isComponentLoaded}
                onChange={(checked) => {
                  checked
                    ? document.documentElement.requestFullscreen().catch(console.error)
                    : handleExitFullscreen();
                  setComponentLoaded(checked);
                }}
              />
              <button onClick={handleExitFullscreen}>Exit Fullscreen</button>
            </div>
          )}
          <button onClick={handleMinimizeToggle}>
            {isMinimized ? "Maximize" : "Minimize"}
          </button>

          <AnimatedComponent ref={animatedComponentRef} animationClass="" />
          <LayoutComponent>{children}</LayoutComponent>
        </div>
      </div>
    </AppProviders>
  );
};

const DefaultRootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;

export default RootLayout;
