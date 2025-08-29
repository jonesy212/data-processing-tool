declare function require(path: string): any;
import { Snapshot } from "@/app/components/snapshots";
import { Presentation } from '../../components/documents/Presentation';

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


declare module 'presentationsLibrary' {
  export interface PresentationFunctions {
    createPresentation(name: string, slides: Slide[]): Presentation;
  }
}
