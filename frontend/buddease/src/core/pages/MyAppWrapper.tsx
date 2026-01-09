MyAppWrapper.tsx
import { BrandingSettings } from "@/core/branding/BrandingSettings";
import CaptionManagementPageComponent from "@/core/features/videos/CaptionManagementComponent";
import { generateUtilityFunctions } from "@/core/generators/GenerateUtilityFunctions";
import {
    PhaseHookConfig,
    createPhaseHook,
} from "@/core/hooks/phaseHooks/PhaseHooks";
import { AsyncHook } from "@/core/hooks/useAsyncHookLinker";
import { useThemeCustomization } from "@/core/hooks/useThemeCustomization";
import { Theme } from "@/core/libraries/ui/theme/Theme";
import { useTheme } from "@/core/libraries/ui/useTheme";
import { EnhancedThemeProvider } from '@/core/platform/styles/EnhancedThemeContextType';
import { AppProps } from "next/app";
import { NextRouter, Router } from "next/router";
import React from "react";
import MyApp from "./_app";
import CaptionManagementPage from "./content/CaptionManagementPage";
import contentManagementPage from "./content/contentManagementPage";

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



// Create initial theme from branding settings
const createInitialTheme = (brandingSettings: BrandingSettings): Theme => ({
  // Map branding settings to theme properties
  primaryColor: brandingSettings.themeColor || '#3498db',
  secondaryColor: brandingSettings.secondaryThemeColor || '#2ecc71',
  fontSize: brandingSettings.fontSize || '1rem',
  fontFamily: brandingSettings.fontFamily || "'Inter', 'Arial', sans-serif",
  headerColor: brandingSettings.colors?.header || '#f0f0f0',
  footerColor: brandingSettings.colors?.footer || '#f0f0f0',
  bodyColor: brandingSettings.colors?.background || '#ffffff',
  borderColor: brandingSettings.colors?.border || '#ddd',
  borderStyle: 'solid',
  padding: brandingSettings.spacingMedium || '1rem',
  margin: brandingSettings.spacingMedium || '1rem',
  brandIcon: brandingSettings.logoUrl || '',
  brandName: 'Budde',
  borderWidth: '1px',
  borderRadius: { 
    small: brandingSettings.borderRadiusSmall || '0.25rem', 
    medium: brandingSettings.borderRadiusMedium || '0.5rem', 
    large: brandingSettings.borderRadiusLarge || '0.75rem' 
  },
  boxShadow: brandingSettings.boxShadow || '0 2px 8px rgba(0, 0, 0, 0.1)',
  
  // Spread all branding settings to maintain compatibility
  ...brandingSettings
});



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

  // Update BrandingSettings with actual values or retrieve them from a source
  const brandingSettings: BrandingSettings = {
    // Populate with actual branding settings values
    logoUrl: "https://example.com/logo.png",
    themeColor: "#3366cc",
    secondaryThemeColor: "#ff9900",

    // Accessing textColor through the colors object
    colors: {
      // General Colors
      primary: "#3366cc",
      accent: "#ff9900",
      success: "#28a745",
      error: "#dc3545",
      warning: "#ffc107",
      info: "#17a2b8",
      textColor: "#000000",
      linkColor: "#007bff",
      header: "#f0f0f0",
      footer: "#f0f0f0",
      background: "#ffffff",
      border: "#ddd",
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
    accentColor: "#ff9900",
    successColor: "#28a745",
    errorColor: "#dc3545",
    warningColor: "#ffc107",
    infoColor: "#17a2b8",
    darkModeBackground: "#1a1a1a",
    darkModeText: "#ffffff",
    fontPrimary: "Arial, sans-serif",
    fontSecondary: "Helvetica, sans-serif",
    fontHeading: "Helvetica, sans-serif",
    fontSizeSmall: "14px",
    fontSizeMedium: "16px",
    fontSizeLarge: "18px",
    lineHeightNormal: "1.5",
    lineHeightMedium: "1.7",
    lineHeightLarge: "2",
  };

    // Create initial theme from branding settings
  const initialTheme = createInitialTheme(brandingSettings);



// This component MUST be inside EnhancedThemeProvider to use useTheme()
const ThemeApplication = (props: any) => {
  const { theme, tokens, updateTheme, switchTheme } = useTheme();
  
  React.useEffect(() => {
    // Apply CSS variables to root
    const root = document.documentElement;
    Object.entries(tokens.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value as string);
    });
    // Apply other tokens as needed...
  }, [tokens]);

  return (
    <div style={{
      backgroundColor: tokens.colors.background,
      color: tokens.colors.text,
      fontFamily: tokens.typography.fontFamily,
      minHeight: '100vh',
      transition: 'all 0.3s ease'
    }}>
      <MyApp
        {...props}
        theme={theme}
        tokens={tokens}
        onThemeUpdate={updateTheme}
        onThemeSwitch={switchTheme}
      />
    </div>
  );
};

  return (
    <>
      <EnhancedThemeProvider 
        userRole="admin"
        initialTheme={initialTheme}
      >
        <ThemeApplication 
          Component={Component}
          pageProps={pageProps}
          router={router}
          brandingSettings={brandingSettings}
          hooks={hooks}
          utilities={utilities}
          setThemeState={setThemeState}
        />
        {/* These will NOT have theme styling applied */}
        <EnhancedCaptionManagementPage />
        <CaptionManagementPageComponent />
      </EnhancedThemeProvider>
    </>
  );
}


export default MyAppWrapper;
export type { ExtendedRouter };
