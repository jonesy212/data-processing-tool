const initializeAppLayout = () => {
  // Get dimensions of window for responsive layout
  fetchUserAreaDimensions({
    listenForResize: true,
    onChange: ({ width }) => {
      if (width > 1200) {
        console.log('Switching to grid view for large screens');
      } else {
        console.log('Switching to list view for smaller screens');
      }
    }
  });

  // Get dimensions of the Kanban board
  const kanbanDimensions = fetchUserAreaDimensions({ elementId: 'kanban-container' });
  console.log(`Kanban container dimensions: ${kanbanDimensions.width}x${kanbanDimensions.height}`);

  // Recalculate dimensions for the task list on window resize
  fetchUserAreaDimensions({
    elementId: 'task-list',
    listenForResize: true,
    onChange: ({ width, height }) => {
      console.log(`Task list updated to ${width}x${height}`);
    }
  });

  // Wait for page to load completely before initializing final dimensions
  waitForLoad().then(({ width, height }) => {
    console.log(`Page fully loaded. Window dimensions: ${width}x${height}`);
  });
};

initializeAppLayout();