// IconLoader.ts
import Image from 'next/image';

export const loadDuckDuckGoIcon = async () => {
  const duckDuckGoIconModule = await import("path/to/duckduckgo-icon.png");
  return <Image src={duckDuckGoIconModule.default} alt="DuckDuckGo Icon" />;
};


export const loadLinkedInIcon = async () => {
  const LinkedInIconModule = await import('path/to/linkedin-icon.png'); // Adjust the path accordingly
  return <Image src={LinkedInIconModule.default} alt="LinkedIn Icon" />;
};

export const loadXIcon = async () => {
  const XIconModule = await import('path/to/x-icon.png'); // Adjust the path accordingly
  return <Image src={XIconModule.default} alt="X Icon" />;
};

export const loadYandexIcon = async () => {
  const YandexIconModule = await import('path/to/yandex-icon.png'); // Adjust the path accordingly
  return <Image src={YandexIconModule.default} alt="Yandex Icon" />;
};

// Add more functions to load other icons as needed
