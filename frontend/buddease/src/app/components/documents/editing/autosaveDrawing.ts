// autosaveDrawing.ts
// Import necessary dependencies
import { saveDrawingToDatabase } from '@/app/api/ApiDrawing';
import { Tracker } from '../../models/tracker/Tracker';
import { WritableDraft } from '../../state/redux/ReducerGenerator';

// Define the Draw type representing the structure of a drawing
type Draw = {
    id: number;
    content: string;
    // Add more properties as needed
};

// Function to perform autosave of the drawing
const autosaveDrawing = async (drawing: WritableDraft<Tracker>[]): Promise<boolean> => {
  try {
    // Check if drawing content is provided
    if (!drawing) {
      console.log("Drawing content is missing. Autosave skipped.");
      return false; // Autosave skipped, return false
    }

    // Log start of autosave process
    console.log("Autosaving drawing content...");

    // Save drawing content to database
    const autosaveResult = await saveDrawingToDatabase(drawing);

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
