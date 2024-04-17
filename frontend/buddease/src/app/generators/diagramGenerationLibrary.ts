// diagramGenerationLibrary.ts

import { diagramGenerator } from "./diagramGenerator";

// Define the function to generate a diagram
function generateDiagram(rows: number = 3, cols: number = 3, content: string[] = ['A', 'B', 'C', 'D', 'E', 'F']): string {
    try {
        // Generate the diagram using the 'diagramGenerator' library or any other method
        const diagram = diagramGenerator(rows, cols, content);
    
        // Return the generated diagram
        return diagram;
    } catch (error) {
        // If there's an error during diagram generation, log the error and return an empty string
        console.error("Error generating diagram:", error);
        return ""; // or handle the error in an appropriate way
    }
}

export { generateDiagram };
