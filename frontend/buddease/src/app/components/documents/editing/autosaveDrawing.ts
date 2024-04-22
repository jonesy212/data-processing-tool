// autosaveDrawing.ts
import { Tracker } from '../../models/tracker/Tracker';
import { WritableDraft } from '../../state/redux/ReducerGenerator';
import autosave from './autosave'; // Import the autosave function


// Define the Draw type representing the structure of a drawing
type Draw = {
    id: number;
    content: string;
    // Add more properties as needed
  };
  
// Function to perform autosave of the drawing
const autosaveDrawing = async (drawing: WritableDraft<Tracker>[]) => {
  try {
    // Check if drawing content is provided
    if (!drawing) {
      console.log("Drawing content is missing. Autosave skipped.");
      return false; // Autosave skipped, return false
    }

    // Simulate autosave process by passing drawing content to the autosave function
    // Here, we're logging the drawing content as if it's being saved to a database or cloud storage
    console.log("Autosaving drawing content...");
    console.log("Drawing content saved:", drawing);

    // Call the autosave function with the drawing content
    const autosaveResult = await autosave(drawing, true); // Assuming autosave is enabled

    // Check if the autosave was successful
    if (autosaveResult) {
      console.log("Drawing content saved successfully.");
      return true;
    } else {
      throw new Error("Failed to save drawing content.");
    }
  } catch (error: any) {
    // Handle any errors that occur during autosave
    console.error("Autosave failed:", error.message);
    // Return false to indicate autosave failure
    return false;
  }
};

// Export the function for external use
export { autosaveDrawing };
export type { Draw };

