// ThemeActions.ts
import { createAction } from "@reduxjs/toolkit";
import { Theme } from "../libraries/ui/theme/Theme";
import { ThemeConfig } from "../libraries/ui/theme/ThemeConfig";

export const ThemeActions = {
  // Theme Configuration
  updateTheme: createAction<Partial<Theme>>("updateTheme"),
  resetTheme: createAction("resetTheme"),
  toggleDarkMode: createAction("toggleDarkMode"),
  setPrimaryColor: createAction<string>("setPrimaryColor"),
  setSecondaryColor: createAction<string>("setSecondaryColor"),
  setFontSize: createAction<string>("setFontSize"),
  setFontFamily: createAction<string>("setFontFamily"),
  applyThemeConfig: createAction<ThemeConfig>("applyThemeConfig"),
  // Customization
  customizeThemeProperties: createAction<Partial<Theme>>("customizeThemeProperties"),
  // Theme Management
  switchTheme: createAction("switchTheme"),
  localizeThemeSettings: createAction("localizeThemeSettings"),
  handleThemeEvents: createAction("handleThemeEvents"),
  validateThemeSettings: createAction("validateThemeSettings"),
  documentThemeSettings: createAction("documentThemeSettings"),
  // Optimization and Performance
  optimizeThemePerformance: createAction("optimizeThemePerformance"),
  analyzeThemeUsage: createAction("analyzeThemeUsage"),
  visualizeThemeMetrics: createAction("visualizeThemeMetrics"),
  // Security and Governance
  secureThemeSettings: createAction("secureThemeSettings"),
  governThemeGovernance: createAction("governThemeGovernance"),
  auditThemeCompliance: createAction("auditThemeCompliance"),
  // Additional actions from ThemeCustomizationProps
  // Header, Footer, Body, Border
  setHeaderColor: createAction<string>("setHeaderColor"),
  setFooterColor: createAction<string>("setFooterColor"),
  setBodyColor: createAction<string>("setBodyColor"),
  setBorderColor: createAction<string>("setBorderColor"),
  // Border Width, Border Style
  setBorderWidth: createAction<string>("setBorderWidth"),
  setBorderStyle: createAction<string>("setBorderStyle"),
  // Padding, Margin
  setPadding: createAction<string>("setPadding"),
  setMargin: createAction<string>("setMargin"),
  // Brand Icon, Brand Name
  setBrandIcon: createAction<string>("setBrandIcon"),
  setBrandName: createAction<string>("setBrandName"),
};
