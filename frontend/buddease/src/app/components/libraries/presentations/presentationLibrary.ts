// presentationLibrary.ts
import { DataDetails } from '@/app/components/models/data/Data';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { Presentation, Slide } from "../../documents/Presentation";
import { NotificationType, NotificationTypeEnum } from "../../support/NotificationContext";
import { generatePresentationJSON } from "./generatePresentationJSON";

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

  id = UniqueIDGenerator.generateID(
    // Prefix for presentation IDs
    "created Presentation",
    presentationName,
    NotificationTypeEnum.PresentationID,
    "Presentation ID generated for " + presentationName,
    "presentation" as NotificationType,
    {} as DataDetails
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
  content: string
): Presentation {
  // Generate a unique ID for the slide
  const presentationName = presentation.title;
  const id = UniqueIDGenerator.generatePresentationID(presentationName);
  // Create the slide object
  const slide: Slide = {
    id,
    content,
    title: "", // Add a title property with an empty string
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

