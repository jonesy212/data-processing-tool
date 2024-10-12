// generateDrawingJSON.ts
interface Drawing {
    id: string;
  name: string;
  artwork: 
    // Define other properties of the drawing
}

// Function to generate JSON from a drawing object
function generateDrawingJSON(drawing: Drawing): any {
  // Add logic to convert drawing object to JSON format
  const drawingJSON = {
    id: drawing.id,
    name: drawing.name,
    // Add other properties of the drawing to the JSON object
  };
  return drawingJSON;
}


export { generateDrawingJSON };
export type { Drawing };
