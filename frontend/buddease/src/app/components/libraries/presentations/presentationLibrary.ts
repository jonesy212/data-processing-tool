// presentationLibrary.ts
import { Data, DataDetails } from '@/app/components/models/data/Data';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { Presentation, Slide } from "../../documents/Presentation";
import { NotificationType, NotificationTypeEnum } from "../../support/NotificationContext";
import { generatePresentationJSON } from "./generatePresentationJSON";
import { BaseMetadata, UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';


enum PresentationType {
  BUSINESS = 'business',
  EDUCATIONAL = 'educational',
  MARKETING = 'marketing',
  PERSONAL = 'personal',
  TECHNICAL = 'technical',
  CREATIVE = 'creative'
}


// Extending BaseMeta for PresentationMetadata
interface PresentationMetadata extends BaseMetadata, UnifiedMetaDataOptions {
  duration?: number;
  author?: string;
  // Additional presentation-specific metadata can be added here
}


// Extending BaseData for PresentationData
interface PresentationData<T extends Data = Data> {
  metadata: PresentationMetadata;
  content: T;
  slideData?: Record<string, Slide>;
  associatedItems?: Record<string, any>;
  customAttributes?: Record<string, any>;
}

// Function to create a new presentation
function createPresentation(title: string, slides: Slide[]): Presentation {
  // Generate a unique ID for the presentation
  const presentationName = title;
  let id: string;

  // Create the presentation object
  const presentation: Presentation = {
    id: "",
    title,
    slides, // Use the provided slides parameter
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "admin",
    // Add other properties as needed
  };

  id = UniqueIDGenerator.generatePresentationID(
    // Prefix for presentation IDs
    "pres",
    presentationName,
    NotificationTypeEnum.PresentationID,
    "created Presentation",
    "Presentation ID generated for " + presentationName,
    "presentation" as NotificationType,
    {} as DataDetails<Data, PresentationMetadata, PresentationData>
  );

  presentation.id = id;

  // Generate JSON representation of the presentation
  const presentationJSON = generatePresentationJSON(presentation);
  console.log("Created presentation JSON:", presentationJSON);

  return presentation;
}  


  
// Function to add a new slide to a presentation
function addSlideToPresentation(
  presentation: Presentation,
  content: string,
  type: PresentationType // Use the enum here
): Presentation {
  // Generate a unique ID for the slide
  
  const presentationName = presentation.title;
  const id = UniqueIDGenerator.generatePresentationID(
    "slide",
    presentationName,
    NotificationTypeEnum.SlideID,
    "created Slide",
    "Slide ID generated for " + presentationName,
    "slide" as NotificationType,
    {} as DataDetails<Data, PresentationMetadata, PresentationData>
  );
  // Create the slide object
  const slide: Slide = {
    id,
    content,
    title: "", // Add a title property with an empty string
    slideNumber: 0,
    media: [], // Media items like images, videos, etc.
    notes: "",
    // Add other properties as needed
  };
  // Append the new slide to the slides array of the presentation
  presentation.slides.push(slide);
  return presentation;
}


// Function to remove a slide from a presentation
function removeSlideFromPresentation(
  presentation: Presentation,
  slideId: string
): Presentation {
  // Filter out the slide with the specified ID from the slides array
  presentation.slides = presentation.slides.filter(
    (slide) => slide.id !== slideId
  );
  return presentation;
}

// Export the presentation library functions and types
export {
  addSlideToPresentation, createPresentation, removeSlideFromPresentation
};

export type { PresentationMetadata, PresentationData }