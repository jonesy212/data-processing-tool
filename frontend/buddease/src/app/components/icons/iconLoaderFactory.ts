    // iconLoaderFactory.ts
import { IconLoader, createIconLoader } from "./IconLoader";

const iconPathBase = 'path/to/icons/';

export const createDynamicIconLoader = (iconName: string): IconLoader => {
  const iconPath = `${iconPathBase}${iconName}.png`;
  const altText = `${iconName} Icon`;

  return createIconLoader(iconPath, altText);
};


// Use createDynamicIconLoader dynamically for each web icon
export const loadWebIcon1: IconLoader = createDynamicIconLoader('web-icon1');
export const loadWebIcon2: IconLoader = createDynamicIconLoader('web-icon2');

// Use createDynamicIconLoader dynamically for each Android icon
export const loadAndroidIcon1: IconLoader = createDynamicIconLoader('android-icon1');
export const loadAndroidIcon2: IconLoader = createDynamicIconLoader('android-icon2');

// Example usage in an iOS component

// Use createDynamicIconLoader dynamically for each iOS icon
export const loadiOSIcon1: IconLoader = createDynamicIconLoader('ios-icon1');
export const loadiOSIcon2: IconLoader = createDynamicIconLoader('ios-icon2');
