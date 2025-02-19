import React from "react";
import { IconLoader } from "./IconLoader";
import { IconLibrary, loadIconLibrary } from "./iconLibraryLoader";

export const createDynamicIconLoader = (iconName: string, library: IconLibrary): IconLoader => {
  const iconPath = `path/to/icons/${iconName}.png`;
  const altText = `${iconName} Icon`;

  return async () => {
    const iconLibrary = await loadIconLibrary(library);
    const iconModule = await import(iconPath);

    // Assuming each library has a different way to load icons
    const icon = iconLibrary.loadIcon(iconModule.default);

    return Promise.resolve().then(() => {
      return <img src={icon} alt={altText} />;
    });
  };
};


// Example Usage
// For Web
export const loadWebIcon1: IconLoader = createDynamicIconLoader('web-icon1', 'font-awesome');

// // For Android
export const loadAndroidIcon1: IconLoader = createDynamicIconLoader('android-icon1', 'ionicons');

// For iOS
export const loadiOSIcon1: IconLoader = createDynamicIconLoader('ios-icon1', 'feather');