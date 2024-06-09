//iconloader.tsx
import Image from "next/image";
import React from "react";

export type IconLoader = () => Promise<React.ReactNode>;

export const createIconLoader = (iconPath: string, altText: string): IconLoader => {
  return async () => {
    const iconModule = await import(iconPath);

    // Create a promise that resolves with ReactNode
    return Promise.resolve().then(() => {
      return <Image src={iconModule.default} alt={altText} />;
    });
  };
};


export const loadDuckDuckGoIcon: IconLoader = createIconLoader(
  "path/to/duckduckgo-icon.png",
  "DuckDuckGo Icon"
);

export const loadLinkedInIcon: IconLoader = createIconLoader(
  "path/to/linkedin-icon.png",
  "LinkedIn Icon"
);

export const loadXIcon: IconLoader = createIconLoader(
  "path/to/x-icon.png",
  "X Icon"
);

export const loadYandexIcon: IconLoader = createIconLoader(
  "path/to/yandex-icon.png",
  "Yandex Icon"
);




// Add more functions to load other icons as needed
