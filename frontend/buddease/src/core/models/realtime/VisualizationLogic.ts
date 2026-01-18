// VisualizationLogic.ts

interface ProgressData {
    taskId: string;
    progress: number;
  }
  
  // Define a function to update the visualization based on progress data
  const updateVisualization = (progressData: ProgressData) => {
    // Get the DOM element representing the visualization
    const visualizationElement = document.getElementById('visualization');
  
    if (!visualizationElement) {
      console.error('Visualization element not found');
      return;
    }
  
    // Update the visualization based on progress data
    visualizationElement.style.width = `${progressData.progress}%`;
    visualizationElement.innerText = `Task ${progressData.taskId}: ${progressData.progress}%`;
  };
  
  export default updateVisualization;
  