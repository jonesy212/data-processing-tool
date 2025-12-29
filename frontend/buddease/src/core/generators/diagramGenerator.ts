// diagramGenerator.ts

function diagramGenerator(rows: number, cols: number, content: string[]): string {
    try {
        // Validate input parameters
        if (rows <= 0 || cols <= 0 || !Array.isArray(content) || content.length !== rows * cols) {
            throw new Error("Invalid input parameters.");
        }

        // Generate the diagram logic based on the provided parameters
        let diagram = '';
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const index = i * cols + j;
                const cellContent = content[index];
                // Add cell content to the diagram
                diagram += `| ${cellContent} `;
            }
            diagram += '|\n';
            // Add horizontal separator between rows
            diagram += '+';
            for (let j = 0; j < cols; j++) {
                diagram += '---+';
            }
            diagram += '\n';
        }

        // Return the generated diagram
        return diagram;
    } catch (error) {
        // If there's an error during diagram generation, log the error and return an empty string
        console.error("Error generating diagram:", error);
        return ""; // or handle the error in an appropriate way
    }
}





// Define the generate function
export function generate(): void {
    try {
        // Example parameters for generating a diagram
        const rows = 3;
        const cols = 3;
        const content = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']; // Example content for the cells
        
        // Generate the diagram using the diagramGenerator function
        const diagram = diagramGenerator(rows, cols, content);

        // Log the generated diagram
        console.log("Generated Diagram:");
        console.log(diagram);
    } catch (error) {
        // If there's an error during generation, log the error
        console.error("Error generating diagram:", error);
    }
}

// Call the generate function to generate and display the diagram
generate();
// Export the diagramGenerator function for external use
export { diagramGenerator };

