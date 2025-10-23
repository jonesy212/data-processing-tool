declare function require(path: string): any;
import { Snapshot } from '@/app/snapshots/Snapshot';
import { Presentation } from '@/app/components/documents/Presentation';


declare module '*.css';

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
