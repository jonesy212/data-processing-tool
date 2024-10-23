// MyAppWrapper.tsx
import { AppProps } from "next/app";
import { NextRouter, Router, useRouter } from "next/router";
import CaptionManagementPageComponent from "../components/CaptionManagementComponent";
import {
  PhaseHookConfig,
  createPhaseHook,
} from "../components/hooks/phaseHooks/PhaseHooks";
import { generateUtilityFunctions } from "../generators/GenerateUtilityFunctions";
import BrandingSettings from "../libraries/theme/BrandingService";
import MyApp from "./_app";
import CaptionManagementPage from "./content/CaptionManagementPage";
import contentManagementPage from "./content/contentManagementPage";
 import { AsyncHook } from "async_hooks";
import { brandingSettings } from '@/app/libraries/theme/BrandingService';
import { ContentItem } from "../components/cards/DummyCardLoader";
import useIdleTimeout from "../components/hooks/idleTimeoutHooks";
import { Phase } from "../components/phases/Phase";
import { useThemeCustomization } from "../components/hooks/useThemeCustomization";
import React from "react";

// Extend NextRouter with additional properties
type ExtendedRouter = NextRouter & {
  components: any;
  sdc: any;
  sbc: any;
  sub: any;
  clc: any;
  pageLoader: any;
  _bps: any;
  _wrapApp: any;
  hooks: AsyncHook[];
  utilities: ReturnType<typeof generateUtilityFunctions>;
  router: ExtendedRouter & Router;
  brandingSettings: BrandingSettings;
};

// Extend AppProps to include hooks

export const EnhancedCaptionManagementPage = contentManagementPage(
  CaptionManagementPage
);


type ExtendedAppProps = AppProps & {
  hooks: Record<string, any>;
  utilities: any;
  brandingSettings: BrandingSettings;
};


function MyAppWrapper({ Component, pageProps, router }: ExtendedAppProps) {
  const {infoColor, themeState, notificationState, setNotificationState, setThemeState} = useThemeCustomization();

  // Extend AppProps to include hooks


  // Define a generic type for hooks
  type Hooks = Record<string, PhaseHookConfig>;

  // const router = useRouter();

  // Generate utility functions
  const utilities = generateUtilityFunctions();

  // Generate hooks dynamically based on your phases
  // Define a function to create phase hooks dynamically
  const createPhaseHooks = (
    phaseNames: string[]
  ): Hooks & { useIdleTimeout: any; handleLogin: any } => {
    const hooks: Hooks & { useIdleTimeout: any; handleLogin: any } = {
      useIdleTimeout: {} as PhaseHookConfig,
      handleLogin: {} as PhaseHookConfig,
    };

    // Iterate over the phase names and create hooks for each phase
    phaseNames.forEach((phaseName, index) => {
      hooks[phaseName] = createPhaseHook(index, {
        name: phaseName,
        condition: async () => await true,
        duration: "1000",
        asyncEffect: async () => {
          // trigger animation
          return () => {};
        },
        isActive: false,
        initialStartIdleTimeout: () => {},
        resetIdleTimeout: async () => {},
        idleTimeoutId: null,
        startIdleTimeout: () => {},
        clearIdleTimeout: () => {},
        onPhaseStart: () => {},
        onPhaseEnd: () => {},
        cleanup: () => {},
        startAnimation: () => {},
        stopAnimation: () => {},
        animateIn: () => {},
        toggleActivation: () => { },
        phaseType: ""
      });
    });

    return hooks;
  };

  // const config = {
  //   // Pass phases, hooks, utilities
  //   phases: {},
  //   hooks: createPhaseHooks(phaseNames),
  //   utilities,
  // };

  // Generate hooks dynamically based on your phases
  const phaseNames = [
    "Components Phase",
    "Page Loader Phase",
    "SDC Phase",
    "SBC Phase",
    "SUB Phase",
    "CLC Phase",
  ];

  const hooks: Hooks & { useIdleTimeout: any; handleLogin: any } =
    createPhaseHooks(phaseNames);

  // Update BrandingSettings with actual values or retrieve them from a source
  const brandingSettings: BrandingSettings = {
    // Populate with actual branding settings values
    logoUrl: "https://example.com/logo.png",
    themeColor: "#3366cc",
    secondaryThemeColor: "#ff9900",

    // Accessing textColor through the colors object
    colors: {
      // General Colors
      primary: "#...",
      accent: "#...",
      success: "#28a745",
      error: "#dc3545",
      warning: "#ffc107",
      info: "#17a2b8",
      textColor: "#000000",
      linkColor: "#007bff",
      // Other color properties
    },
    textColor: "#000000",

    // Typography
    fontFamily: "Arial, sans-serif",
    headingFontFamily: "Helvetica, sans-serif",
    fontSize: "16px",
    headingFontSize: "24px",

    // Line height
    lineHeight: {
      normal: "1.5",
      medium: "1.7",
      large: "2",
    },

    // Border radius
    borderRadiusLarge: "10px", // Large border radius
    borderRadiusMedium: "5px", // Medium border radius
    borderRadiusSmall: "3px", // Small border radius

    // Box shadows
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Default box shadow
    boxShadowHover: "0 4px 8px rgba(0, 0, 0, 0.2)", // Box shadow on hover

    // Spacing
    spacingSmall: "8px", // Small spacing
    spacingMedium: "16px", // Medium spacing
    spacingLarge: "24px", // Large spacing

    // Breakpoints
    breakpoints: {
      mobile: "576px", // Mobile breakpoint
      tablet: "768px", // Tablet breakpoint
      laptop: "992px", // Laptop breakpoint
      desktop: "1200px", // Desktop breakpoint
    },
    accentColor: "",
    successColor: "",
    errorColor: "",
    warningColor: "",
    infoColor: "",
    darkModeBackground: "",
    darkModeText: "",
    fontPrimary: "",
    fontSecondary: "",
    fontHeading: "",
    fontSizeSmall: "",
    fontSizeMedium: "",
    fontSizeLarge: "",
    lineHeightNormal: "",
    lineHeightMedium: "",
    lineHeightLarge: "",
  };

  return (
    <>
      <MyApp
        Component={Component}
        pageProps={pageProps}
        router={router as ExtendedRouter & Router}
        brandingSettings={brandingSettings} // Pass branding settings to MyApp
        hooks={hooks}
        utilities={{ generateUtilityFunctions: () => {} }}
        phases={{} as Phase[]}
        contentItem={{} as ContentItem}
        setThemeState={setThemeState} // Pass setThemeState here
      />
      <EnhancedCaptionManagementPage />
      {/* Include the CaptionManagementPageComponent */}
      <CaptionManagementPageComponent />
    </>
  );
}

export default MyAppWrapper;
export type { ExtendedRouter };
