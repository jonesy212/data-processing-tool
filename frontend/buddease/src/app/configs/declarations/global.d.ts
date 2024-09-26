declare function require(path: string): any;
import { Presentation } from '../../components/documents/Presentation';

interface MyPropertiesOptions extends DocumentOptions {
  sections: any; // Add all required properties
  title?: string;
  // Add other properties as needed
}

declare global {
  interface Window {
    editor?: {
      createPresentation: (name: string, slides: Slide[]) => Presentation;
    };

    mixpanel?: {
      track: (eventName: string, eventData: Record<string, any>) => void;
    };

    updateWithSnapshot: (snapshotId: string, snapshot: Snapshot<any, any>) => void;
    
  }
}


declare module 'presentationsLibrary' {
  export interface PresentationFunctions {
    createPresentation(name: string, slides: Slide[]): Presentation;
  }
}
