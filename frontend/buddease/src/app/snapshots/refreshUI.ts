// refreshUI.js
// Reusable refreshUI function
function refreshUI(updates: {
    stroke?: { width: number; color: string };
    strokeWidth?: number;
    fillColor?: string;
    isFlippedX?: boolean;
    isFlippedY?: boolean;
    x?: number;
    y?: number;
  }) {
    console.log("UI refreshed with the following properties:");
    
    if (updates.stroke) {
      console.log(`Stroke: width = ${updates.stroke.width}px, color = ${updates.stroke.color}`);
    }
    
    if (updates.strokeWidth !== undefined) {
      console.log(`Stroke width: ${updates.strokeWidth}px`);
    }
  
    if (updates.fillColor) {
      console.log(`Fill color: ${updates.fillColor}`);
    }
  
    if (updates.isFlippedX !== undefined) {
      console.log(`Flipped X: ${updates.isFlippedX}`);
    }
  
    if (updates.isFlippedY !== undefined) {
      console.log(`Flipped Y: ${updates.isFlippedY}`);
    }
  
    if (updates.x !== undefined && updates.y !== undefined) {
      console.log(`Position (X, Y): (${updates.x}, ${updates.y})`);
    }
  }
  
  // Object with the appearance update logic
  const appearanceManager = {
    stroke: { width: 1, color: "black" },
    strokeWidth: 1,
    fillColor: "white",
    isFlippedX: false,
    isFlippedY: false,
    x: 0,
    y: 0,
  
    updateAppearance: function (updates: {
      stroke?: { width: number; color: string };
      strokeWidth?: number;
      fillColor?: string;
      isFlippedX?: boolean;
      isFlippedY?: boolean;
      x?: number;
      y?: number;
    }) {
      // Apply updates to each property if provided
      if (updates.stroke) {
        this.stroke = updates.stroke;
      }
      if (updates.strokeWidth !== undefined) {
        this.strokeWidth = updates.strokeWidth;
      }
      if (updates.fillColor !== undefined) {
        this.fillColor = updates.fillColor;
      }
      if (updates.isFlippedX !== undefined) {
        this.isFlippedX = updates.isFlippedX;
      }
      if (updates.isFlippedY !== undefined) {
        this.isFlippedY = updates.isFlippedY;
      }
      if (updates.x !== undefined) {
        this.x = updates.x;
      }
      if (updates.y !== undefined) {
        this.y = updates.y;
      }
  
      // Reuse the refreshUI function
      refreshUI(updates);
    },
  };
  
// Function to refresh UI for a specific file
const refreshUIForFile = (fileId: number) => {
    // Step 1: Get the file element in the UI (assuming each file has an element with the file ID)
    const fileElement = document.getElementById(`file-${fileId}`);
  
    if (!fileElement) {
      console.log(`No UI element found for file with ID: ${fileId}`);
      return;
    }
  
    // Step 2: Retrieve the latest file data (you can customize this based on your data structure)
    const fileData = getFileDataById(fileId); // Assuming there's a function that gets file data by ID
  
    if (!fileData) {
      console.log(`No file data found for file with ID: ${fileId}`);
      return;
    }
  
    // Step 3: Update the file-related UI elements
    // For example, update the file name, last modified date, or any other file-specific details
    const fileNameElement = fileElement.querySelector('.file-name');
    const lastModifiedElement = fileElement.querySelector('.file-last-modified');
  
    if (fileNameElement) {
      fileNameElement.textContent = fileData.name;
    }
  
    if (lastModifiedElement) {
      lastModifiedElement.textContent = new Date(fileData.metadata.lastModified).toLocaleString();
    }
  
    // Step 4: Optionally, you can add some visual feedback for the update (e.g., a fade effect or animation)
    fileElement.classList.add('updated'); // Add a CSS class for visual feedback
    setTimeout(() => {
      fileElement.classList.remove('updated'); // Remove the class after some time
    }, 2000);
  
    console.log(`UI refreshed for file with ID: ${fileId}`);
  };
  
  // Example function to get file data by ID (this would depend on how you store your file data)
  const getFileDataById = (fileId: number) => {
    // This would typically retrieve the file data from your app's state, store, or API
    // For now, we'll just return a mock object for demonstration
    return {
      id: fileId,
      name: `File ${fileId}`,
      metadata: {
        lastModified: new Date(),
      },
    };
  };
  
  export { refreshUI, refreshUIForFile };
  
    
    
    
      
  // Example usage:
  appearanceManager.updateAppearance({
    stroke: { width: 2, color: "red" },
    strokeWidth: 2,
    fillColor: "blue",
    isFlippedX: true,
    x: 10,
    y: 20,
  });
