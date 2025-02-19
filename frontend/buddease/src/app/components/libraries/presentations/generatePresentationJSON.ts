import { Presentation } from "../../documents/Presentation";

// Function to generate JSON from a Presentation object
function generatePresentationJSON(presentation: Presentation): string {
  try {
    // Convert the Presentation object to JSON string
    const presentationJSON = JSON.stringify(presentation, null, 2);
    return presentationJSON;
  } catch (error) {
    console.error("Error generating presentation JSON:", error);
    return ""; // Return empty string in case of error
  }
}

export { generatePresentationJSON };
