// MyAppWrapper.tsx
import { AppProps } from "next/app";
import { NextRouter, Router, useRouter } from "next/router";
import {
  PhaseHookConfig,
  createPhaseHook,
} from "../components/hooks/phaseHooks/PhaseHooks";
import { generateUtilityFunctions } from "../generators/GenerateUtilityFunctions";
import MyApp from "./_app";
import BrandingSettings from "../libraries/theme/BrandingService";



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
  };




  // Extend AppProps to include hooks

  type ExtendedAppProps = AppProps & {
    hooks: Record<string, any>;
    utilities: any;
  };

function MyAppWrapper({ Component, pageProps }: ExtendedAppProps) {
  // Extend AppProps to include hooks

  // Define a generic type for hooks
  type Hooks = Record<string, PhaseHookConfig>;

  const router = useRouter();

  // Generate utility functions
  const utilities = generateUtilityFunctions();

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
      // Add other branding settings as needed

  };

  // Generate hooks dynamically based on your phases
  const hooks: Record<string, any> = {
    components: createPhaseHook({
      name: "Components Phase",
      condition: () => true,
      asyncEffect: async () => {
        // updated return type to match PhaseHookConfig
        return () => {};
      },
    } as PhaseHookConfig),

    pageLoader: createPhaseHook({
      name: "Page Loader Phase",
      condition: () => true,
      asyncEffect: async () => {
        // trigger animation
        return () => {};
      },
    } as PhaseHookConfig),

    sdc: createPhaseHook({
      name: "SDC Phase",
      condition: () => true,
      asyncEffect: async () => {
        // trigger animation
        return () => {};
      },
    } as PhaseHookConfig),
    sbc: createPhaseHook({
      name: "SBC Phase",
      condition: () => true,
      asyncEffect: async () => {
        // trigger animation
        return () => {};
      },
    } as PhaseHookConfig),
    sub: createPhaseHook({
      name: "SUB Phase",
      condition: () => true,
      asyncEffect: async () => {
        // trigger animation
        return () => {};
      },
    } as PhaseHookConfig),
    clc: createPhaseHook({
      name: "CLC Phase",
      condition: () => true,
      asyncEffect: async () => {
        // trigger animation
        return () => {};
      },
    } as PhaseHookConfig),
  };

  return (
    <MyApp
      Component={Component}
      pageProps={pageProps}
      router={router as ExtendedRouter & Router}
      brandingSettings={brandingSettings} // Pass branding settings to MyApp
      utilities={utilities}
      hooks={hooks}
    />
  );
}

export default MyAppWrapper;
export type { ExtendedRouter };

