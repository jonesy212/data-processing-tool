
// icons.ts
import { IconLoader } from "./IconLoader";
import { createDynamicIconLoader } from "./iconLoaderFactory";

// Use createDynamicIconLoader dynamically for each icon
export const loadDuckDuckGoIcon: IconLoader = createDynamicIconLoader('duckduckgo-icon');
export const loadLinkedInIcon: IconLoader = createDynamicIconLoader('linkedin-icon');
export const loadXIcon: IconLoader = createDynamicIconLoader('x-icon');
export const loadYandexIcon: IconLoader = createDynamicIconLoader('yandex-icon');

// #review
// he createDynamicIconLoader function is based on the file name. When you call createDynamicIconLoader('duckduckgo-icon'), 
// it dynamically generates the icon loader for the icon with the file name 'duckduckgo-icon.png'. 
// The function takes the icon name as an argument and constructs the iconPath by appending it to a base path.