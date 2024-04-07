declare function require(path: string): any;

interface MyPropertiesOptions extends DocumentOptions {
  sections: any; // Add all required properties
  title?: string;
  // Add other properties as needed
}

declare module "shared_error_handling" {
  export class NamingConventionsError extends Error {
    constructor(errorType: string, details: string);
  }
}

// excel4node.d.ts

declare module "excel4node" {
  export interface Workbook {
    // Define the properties and methods used in your code
    // Example:
    createSheet(name: string): Worksheet;
  }

  export interface Worksheet {
    // Define the properties and methods used in your code
    // Example:
    cell(row: number, col: number): Cell;
  }

  export interface Cell {
    // Define the properties and methods used in your code
    // Example:
    string(value: string): void;
    number(value: number): void;
  }

  // Add more interfaces as needed based on the functionality you use
}

declare module "react-speech-recognition" {
  export interface SpeechRecognition {
    startListening: () => void;
    stopListening: () => void;
    abortListening: () => void;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: () => boolean;
    interimTranscript: string;
    finalTranscript: string;
    listening: boolean;
    supported: boolean;
  }

  export function useSpeechRecognition(): SpeechRecognition;
}
