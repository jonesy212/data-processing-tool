// global.d.ts
declare module 'app' {
  // Empty declaration to resolve the TypeScript error
  // This is typically needed when a dependency expects an 'app' module
}


declare function require(path: string): any;
import { Presentation } from '@/core/documents/editing/Presentation';
import type { Snapshot } from '@/core/snapshots/Snapshot';


// CSS Modules
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.module.css' {
  const content: { [className: string]: string };
  export default content;
}

// Support for your specific CSS file paths
declare module '@/core/css/*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.stylesheet.css' {
  const content: { [className: string]: string };
  export default content;
}


// Your specific CSS files
declare module '@/core/css/stylesheet.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '@/core/css/base-styles.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '@/core/css/desktop-styles.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '@/core/css/tablet-styles.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '@/core/css/tv-styles.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '@/core/css/chat.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '@/core/css/search.styles.css' {
  const content: { [className: string]: string };
  export default content;
}

// Component-specific CSS
declare module '*.FormBuilder.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.BackendConfigComponent.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.FormElementStyles' {
  const content: { [className: string]: string };
  export default content;
}

// SCSS/SASS (common in Next.js projects)
declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.sass' {
  const content: { [className: string]: string };
  export default content;
}

// Other asset types
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}

declare module '*.json' {
  const content: any;
  export default content;
}



interface MyPropertiesOptions extends DocumentOptions {
  sections: any; // Add all required properties
  title?: string;
  // Add other properties as needed
}

interface DOMRectList {
  readonly length: number;
  item(index: number): DOMRect | null;
  [index: number]: DOMRect;
}

declare global {
  interface Window {
    editor?: {
      createPresentation: (name: string, slides: Slide[]) => Presentation;
      updateWithSnapshot: (snapshot: Snapshot<any, any>) => void;
    };

    mixpanel?: {
      track: (eventName: string, eventData: Record<string, any>) => void;
    };

    updateWithSnapshot: (snapshotId: string, snapshot: Snapshot<any, any>) => void;
    
    searchResults?: SearchResultWithQuery<any>[]; // Add searchResults to the Window interface
  }
}



declare module '@/sharedErrorHandling' {
  export class NamingConventionsError extends Error {
    constructor(errorType: string, details: string);
  }

  // Type declaration for NamingConventionsError messages
  export const NamingConventionsErrorMessages: {
    DEFAULT: (errorType: any, details: any) => string;
    INVALID_NAME_FORMAT: string;
    DUPLICATE_NAME: string;
    // Add more messages for the NamingConventionsError type if needed
  };
}


declare module 'presentationsLibrary' {
  export interface PresentationFunctions {
    createPresentation(name: string, slides: Slide[]): Presentation;
  }
}


declare module '@/core/config/MetaDataOptions' {
  interface Taggable<T> {
    semantic?: TagSemantic;
  }
}
