declare function require(path: string): any;
import { Presentation } from '../../components/documents/Presentation';
import { Snapshot } from '../../components/snapshots/LocalStorageSnapshotStore';

interface MyPropertiesOptions extends DocumentOptions {
  sections: any; // Add all required properties
  title?: string;
  // Add other properties as needed
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
