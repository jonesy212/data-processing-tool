// DynamicContentGenerator.js

// Function to dynamically generate Markdown content with placeholders for app name and date
function generateDynamicContent(appName, currentDate) {
    const markdownContent = `
  # Welcome to ${appName}!
  
  This document was last updated on ${currentDate}.
  
  Here you can find information about the latest features and updates in ${appName}.
  `;
  
    return markdownContent;
  }
  
  export default generateDynamicContent;
  