"use client";

import React from "react";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // You can wrap context providers here if needed
  // Example: ThemeConfig, Layout, DynamicComponents
  // This makes RootLayout cleaner

  return (
    <>
      {children}
    </>
  );
};
