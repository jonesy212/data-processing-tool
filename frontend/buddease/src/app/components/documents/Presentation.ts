// Presentation.ts

// Define the Presentation interface representing the structure of a presentation
export interface Presentation {
    id: string;
    title: string;
    slides: Slide[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
  }
  
  // Define the Slide interface representing the structure of a slide within a presentation
  export interface Slide {
    id: string;
    title: string;
    content: string;
    slideNumber: number;
    media?: string[]; // Media items like images, videos, etc.
    notes?: string;
  }
  
