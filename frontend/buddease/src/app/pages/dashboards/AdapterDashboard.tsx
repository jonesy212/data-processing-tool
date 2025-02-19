// AdapterDashboard.tsx
import useLayoutGenerator, {
  DocumentGenerationResult,
} from "@/app/components/hooks/GenerateUserLayout";
import FallbackIcon from "@/app/components/icons/FallbackIcon";
import WebIcon from "@/app/components/icons/WebIcon";
import { loadFavoriteIcon, loadSettingsIcon, loadShareIcon } from "@/app/components/icons/androidIcons";
import { loadAppStoreIcon, loadApplePayIcon, loadAppleTouchIcon, loadAppleWatchIcon, loadNotificationIcon } from "@/app/components/icons/iOsIcons";
import {
  AnimatedComponent,
  AnimatedComponentRef,
} from "@/app/components/libraries/animations/AnimationComponent";
import { AnimatedComponentProps } from "@/app/components/styling/AnimationsAndTansitions";
import ColorPalette, {
  ColorSwatchProps,
} from "@/app/components/styling/ColorPalette";
import responsiveDesignStore from "@/app/components/styling/ResponsiveDesign";
import AdapterContent from "@/app/components/web3/dAppAdapter/AdapterContent";
import { DocxGeneratorOptions } from "@/app/generators/docxGenerator";
import DashboardLoader from "@/dashboards/DashboardLoader";
import Image from 'next/image';
import React, { ReactNode, useRef } from "react";
import AndroidIcon from "../../components/icons/AndroidIcon";
import CommonLayout from "../layouts/CommonLayout";
// Import specific icons for each platform

const AdapterDashboard: React.FC = () => {
  // Placeholder URLs for mobile phone images
  const androidImageUrl = "https://example.com/android-emulator.png";
  const iosImageUrl = "https://example.com/ios-emulator.png";
  const webImageUrl = "https://example.com/web-emulator.png";

  // Emulator selection state
  const [selectedEmulator, setSelectedEmulator] = React.useState("Android");

  const handleButtonClick = (platform: string) => {
    setSelectedEmulator(platform);
    // Additional logic if needed
  };

  // Define function implementations
  const handleAnimationSettingsChange = (
    settings: AnimatedComponentProps[]
  ): void => {
    // Add your implementation logic here
    // For example, you can update state or perform any other actions based on the new settings
    console.log("Animation settings changed:", settings);
    // Your implementation logic goes here
  };

  const handleBrandingSwatchesChange = (swatches: ColorSwatchProps[]): void => {
    // Add your implementation logic here
    // For example, you can update state or perform any other actions based on the new swatches
    console.log("Branding swatches changed:", swatches);
    // Your implementation logic goes here
  };

  const animatedComponentRef = useRef<AnimatedComponentRef>(null);

  const toggleAnimatedComponent = () =>
    animatedComponentRef.current?.toggleActivation();

  const { toggleActivation } = useLayoutGenerator({
    condition: () => true, // Adjust the condition as needed
    cleanup: () => {}, // Adjust the cleanup logic as needed
    layoutEffect: () => {}, // Adjust the layout effect logic as needed
    generateDocument: (
      options: DocxGeneratorOptions
    ): Promise<DocumentGenerationResult> => {
      return Promise.resolve({
        success: true,
        message: "Document generation successful",
        // Add other properties as needed to match DocumentGenerationResult type
      });
    },
    documentGeneratorOptions: {} as DocxGeneratorOptions,

    layoutConfigGetter: (): Promise<{
      documentGeneration: string;
      designDashboard: JSX.Element;
      responsiveDesignStore: typeof responsiveDesignStore;
    }> => {
      return Promise.resolve({
        documentGeneration: "",
        designDashboard: <div></div>, // Provide JSX element here
        responsiveDesignStore: responsiveDesignStore,
      });
    },
  });
// Dynamically select the appropriate icon based on the platform
const PlatformIcon = async ({ selectedEmulator }: { selectedEmulator: string }) => {
  try {
    switch (selectedEmulator) {
      case "Android":
        return <AndroidIcon src={androidImageUrl} alt="Android Icon" />;
      case "iOS":
        const iconUri = await loadAppStoreIcon();
        if (iconUri) {
          return (
            <>
              {/* Use Image component from React Native */}
              {iconUri && <Image src={String(iconUri)} alt="Icon" style={{ width: 50, height: 50 }} />}
              <Image src={String(loadAppStoreIcon())} alt="App Store Icon" style={{ width: 50, height: 50 }} />
              <Image src={String(loadAppleTouchIcon())} alt="Apple Touch Icon" style={{ width: 50, height: 50 }} />
              <Image src={String(loadApplePayIcon())} alt="Apple Pay Icon" style={{ width: 50, height: 50 }} />
              <Image src={String(loadAppleWatchIcon())} alt="Apple Watch Icon" style={{ width: 50, height: 50 }} />
              <Image src={String(loadNotificationIcon())} alt="Notification Icon" style={{ width: 50, height: 50 }} />
              <Image src={String(loadShareIcon())} alt="Share Icon" style={{ width: 50, height: 50 }} />
              <Image src={String(loadFavoriteIcon())} alt="Favorite Icon" style={{ width: 50, height: 50 }} />
              <Image src={String(loadSettingsIcon())} alt="Settings Icon" style={{ width: 50, height: 50 }} />
            </>
          );
        } else {
          throw new Error("Failed to load icon URI");
        }
      case "Web":
        return <WebIcon src={webImageUrl} alt="Web Icon" />;
      default:
        return null;
    }
  } catch (error) {
    console.error("Error loading platform icon:", error);
    // Handle the error gracefully, e.g., display a fallback icon or message
    return <FallbackIcon />;
  }
};

  return (
    <CommonLayout>
      <body onClick={toggleActivation}>
        <header>
          <h1>Your Application</h1>
        </header>

        {/* Page content */}
        <main>
          <h1>Responsive AdapterDashboard</h1>

          {/* Display the emulator icon for the selected platform */}
          {PlatformIcon({selectedEmulator})}
          <PlatformIcon selectedEmulator={selectedEmulator} />

          {/* Buttons for different platforms */}
          <button onClick={() => handleButtonClick("Android")}>Android</button>
          <button onClick={() => handleButtonClick("iOS")}>iOS</button>
          <button onClick={() => handleButtonClick("Web")}>Web</button>

          {/* Connect to AdapterContent for additional functionality */}
          <AdapterContent
            selectedDevice={""}
            animationSettings={[]}
            handleAnimationSettingsChange={handleAnimationSettingsChange}
            handleBrandingSwatchesChange={handleBrandingSwatchesChange}
            headerElements={[]}
            footerElements={[]}
            panelElements={[]}
            buttonElements={[]}
            layoutElements={[]}
            linkElements={[]}
            cardElements={[]}
          />

          {/* Color Palette for managing app branding */}
          <ColorPalette
            swatches={[
              {
                key: 0,
                color: "#ff5733",
                style: {
                  backgroundColor: "#ff5733",
                  width: "50px",
                  height: "50px",
                },
              },
              {
                key: 1,
                color: "#33ff57",
                style: {
                  backgroundColor: "#33ff57",
                  width: "50px",
                  height: "50px",
                },
              },
            ]}
            colorCodingEnabled={true}
            brandingSwatches={[
              {
                key: 2,
                color: "#3366ff",
                style: {
                  backgroundColor: "#3366ff",
                  width: "50px",
                  height: "50px",
                },
              },
              {
                key: 3,
                color: "#ff3366",
                style: {
                  backgroundColor: "#ff3366",
                  width: "50px",
                  height: "50px",
                },
              },
            ]}
          />

          {/* Animated Component */}
          <AnimatedComponent ref={animatedComponentRef} animationClass={""} />

          {/* Dashboard Loader */}
          <DashboardLoader
            dashboardConfig={{
              title: "Dashboard Title",
              content: {} as ReactNode,
            }}
          />
        </main>

        {/* Common footer */}
        <footer>Footer content</footer>
      </body>
    </CommonLayout>
  );
};

export default AdapterDashboard;
